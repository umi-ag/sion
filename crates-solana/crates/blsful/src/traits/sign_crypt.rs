use super::*;
use crate::helpers::*;
use crate::impls::inner_types::*;
use crate::{BlsError, BlsResult};
use rand::Rng;
use sha3::{
    digest::{ExtendableOutput, Update, XofReader},
    Shake128,
};
use subtle::{Choice, ConditionallySelectable, CtOption};
use vsss_rs::{combine_shares_group, Share};

/// The methods for implementing SignCryption
/// as described in
/// <https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.119.1717&rep=rep1&type=pdf>
pub trait BlsSignCrypt:
    Pairing
    + HashToPoint<Output = Self::Signature>
    + HashToScalar<Output = <Self::Signature as Group>::Scalar>
{
    /// Create a new ciphertext
    fn seal<B: AsRef<[u8]>>(
        pk: Self::PublicKey,
        message: B,
        dst: &[u8],
    ) -> (Self::PublicKey, Vec<u8>, Self::Signature) {
        const SALT: &[u8] = b"SIGNCRYPT_BLS12381_XOF:HKDF-SHA2-256_";
        let message = message.as_ref();

        // r ← Zq
        let r = Self::hash_to_scalar(get_crypto_rng().gen::<[u8; 32]>(), SALT);
        debug_assert_eq!(r.is_zero().unwrap_u8(), 0u8);
        // U = P^r
        let u = Self::PublicKey::generator() * r;
        debug_assert_eq!(u.is_identity().unwrap_u8(), 0u8);
        // V = HℓX(R) ⊕ M
        let overhead = uint_zigzag::Uint::from(message.len());
        let mut overhead_bytes = overhead.to_vec();
        overhead_bytes.extend_from_slice(message);
        // Always use at least 32 bytes
        while overhead_bytes.len() < 32 {
            overhead_bytes.push(0u8);
        }
        let v = Self::compute_v(pk * r, overhead_bytes.as_slice());
        // W = HG2(U′ || V)^r
        let w = Self::compute_w(u, v.as_slice(), dst) * r;
        debug_assert_eq!(w.is_identity().unwrap_u8(), 0u8);
        (u, v, w)
    }

    /// Check if the ciphertext is valid
    fn valid(u: Self::PublicKey, v: &[u8], w: Self::Signature, dst: &[u8]) -> Choice {
        let w_tick = Self::compute_w(u, v, dst);
        debug_assert_eq!(w_tick.is_identity().unwrap_u8(), 0u8);

        let g = -Self::PublicKey::generator();
        let pair_result = Self::pairing(&[(w, g), (w_tick, u)]);

        pair_result.is_identity() & !u.is_identity() & !w.is_identity()
    }

    /// Open a ciphertext if the secret can verify the signature
    fn unseal(
        u: Self::PublicKey,
        v: &[u8],
        w: Self::Signature,
        sk: &<Self::PublicKey as Group>::Scalar,
        dst: &[u8],
    ) -> CtOption<Vec<u8>> {
        let valid = Self::valid(u, v, w, dst);
        let ua = u * ConditionallySelectable::conditional_select(
            &<Self::PublicKey as Group>::Scalar::ZERO,
            sk,
            valid,
        );
        Self::decrypt(v, ua, valid)
    }

    /// Open the ciphertext given the decryption shares.
    fn unseal_with_shares(
        u: Self::PublicKey,
        v: &[u8],
        w: Self::Signature,
        shares: &[Self::PublicKeyShare],
        dst: &[u8],
    ) -> CtOption<Vec<u8>> {
        // Minimum number of shares is 2, otherwise why use threshold
        if shares.len() < 2 {
            return CtOption::new(vec![], 0u8.into());
        }
        let ua = combine_shares_group(shares).ok().unwrap_or_default();
        Self::decrypt(v, ua, Self::valid(u, v, w, dst))
    }

    /// Decrypt a ciphertext
    fn decrypt(v: &[u8], ua: Self::PublicKey, valid: Choice) -> CtOption<Vec<u8>> {
        let plaintext = Self::compute_v(ua, v);
        if let Some(overhead) = uint_zigzag::Uint::peek(plaintext.as_slice()) {
            // If peek succeeds then try_from will also, so unwrap is okay.
            // peek returns the amount actually used whereas try_from does not
            // thus both are used.
            let len = uint_zigzag::Uint::try_from(&plaintext[..overhead])
                .unwrap()
                .0 as usize;
            if len <= plaintext.len() - overhead {
                return CtOption::new(plaintext[overhead..overhead + len].to_vec(), valid);
            }
        }
        CtOption::new(v.to_vec(), 0u8.into())
    }

    /// Compute the `V` value
    fn compute_v(uar: Self::PublicKey, r: &[u8]) -> Vec<u8> {
        let mut hasher = Shake128::default();
        hasher.update(uar.to_bytes().as_ref());
        // HℓX(R)
        let mut reader = hasher.finalize_xof();

        let mut v = vec![0u8; r.len()];
        reader.read(&mut v);
        debug_assert!(!v.iter().all(|x| *x == 0));
        // V = HℓX(R) ⊕ M
        byte_xor(r, &v)
    }

    /// Compute the `W` value
    fn compute_w(u: Self::PublicKey, v: &[u8], dst: &[u8]) -> Self::Signature {
        // W = HG2(U′ || V)^r
        let u_bytes = u.to_bytes();
        let mut t = Vec::with_capacity(u_bytes.as_ref().len() + v.len());
        t.extend_from_slice(u_bytes.as_ref());
        t.extend_from_slice(v);
        Self::hash_to_point(t.as_slice(), dst)
    }

    /// Create a sign crypt decryption share
    fn create_decryption_share(
        share: &Self::SecretKeyShare,
        u: Self::PublicKey,
    ) -> BlsResult<Self::SignatureShare> {
        let sk = share.as_field_element::<<Self::PublicKey as Group>::Scalar>()?;
        if sk.is_zero().into() {
            return Err(BlsError::InvalidInputs("share is zero".to_string()));
        }
        if u.is_identity().into() {
            return Err(BlsError::InvalidInputs(
                "invalid ciphertext. Contains an identity point".to_string(),
            ));
        }
        let sig = u * sk;
        debug_assert_eq!(sig.is_identity().unwrap_u8(), 0u8);
        let sig_bytes = sig.to_bytes();
        let mut sig_share =
            <Self as Pairing>::SignatureShare::empty_share_with_capacity(sig_bytes.as_ref().len());
        *sig_share.identifier_mut() = share.identifier();
        sig_share.value_mut().copy_from_slice(sig_bytes.as_ref());
        Ok(sig_share)
    }

    /// Verify a decryption share using a public key share and ciphertext
    fn verify_share(
        share: Self::PublicKey,
        pk: Self::PublicKey,
        u: Self::PublicKey,
        v: &[u8],
        w: Self::Signature,
        dst: &[u8],
    ) -> Choice {
        let hash = -Self::compute_w(u, v, dst);
        debug_assert_eq!(hash.is_identity().unwrap_u8(), 0u8);

        !share.is_identity()
            & !pk.is_identity()
            & !w.is_identity()
            & Self::pairing(&[(hash, share), (w, pk)]).is_identity()
    }
}
