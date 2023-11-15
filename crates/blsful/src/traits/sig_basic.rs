use crate::impls::inner_types::*;
use crate::*;
use std::collections::HashMap;

/// BLS signature basic trait
pub trait BlsSignatureBasic: BlsSignatureCore + BlsMultiSignature + BlsMultiKey {
    /// The domain separation tag
    const DST: &'static [u8];

    /// Sign a message with a secret key share
    fn partial_sign<B: AsRef<[u8]>>(
        sks: &Self::SecretKeyShare,
        msg: B,
    ) -> BlsResult<Self::SignatureShare> {
        <Self as BlsSignatureCore>::core_partial_sign(sks, msg, Self::DST)
    }

    /// Verify a signed message by a secret key share
    fn partial_verify<B: AsRef<[u8]>>(
        pks: Self::PublicKeyShare,
        sig: Self::SignatureShare,
        msg: B,
    ) -> BlsResult<()> {
        <Self as BlsSignatureCore>::core_signature_share_verify(pks, sig, msg, Self::DST)
    }

    /// The signing algorithm
    fn sign<B: AsRef<[u8]>>(
        sk: &<Self::PublicKey as Group>::Scalar,
        msg: B,
    ) -> BlsResult<Self::Signature> {
        <Self as BlsSignatureCore>::core_sign(sk, msg, Self::DST)
    }

    /// The verification algorithm
    fn verify<B: AsRef<[u8]>>(pk: Self::PublicKey, sig: Self::Signature, msg: B) -> BlsResult<()> {
        <Self as BlsSignatureCore>::core_verify(pk, sig, msg, Self::DST)
    }

    /// The aggregate verification algorithm
    fn aggregate_verify<P, B>(pks: P, sig: Self::Signature) -> BlsResult<()>
    where
        P: Iterator<Item = (Self::PublicKey, B)>,
        B: AsRef<[u8]>,
    {
        // check uniqueness
        let mut set = HashMap::new();
        let mut inputs = Vec::new();
        for (i, (pk, m)) in pks.enumerate() {
            let item = m.as_ref().to_vec();
            if let Some(old) = set.insert(item.clone(), i) {
                return Err(BlsError::InvalidInputs(format!(
                    "duplicate messages detected at {} and {}",
                    old, i
                )));
            }
            inputs.push((pk, item));
        }
        <Self as BlsSignatureCore>::core_aggregate_verify(
            inputs.iter().map(|(pk, b)| (*pk, b.as_slice())),
            sig,
            Self::DST,
        )
    }
}
