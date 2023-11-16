use crate::impls::inner_types::*;
use crate::*;

/// A Discrete Log Proof tied to a specific ElGamal ciphertext
#[derive(Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct ElGamalProof<C: BlsSignatureImpl> {
    /// The el-gamal ciphertext
    pub ciphertext: ElGamalCiphertext<C>,
    /// The proof of encrypted message
    #[serde(serialize_with = "traits::scalar::serialize::<C, _>")]
    #[serde(deserialize_with = "traits::scalar::deserialize::<C, _>")]
    pub message_proof: <<C as Pairing>::PublicKey as Group>::Scalar,
    /// The proof of the blinder
    #[serde(serialize_with = "traits::scalar::serialize::<C, _>")]
    #[serde(deserialize_with = "traits::scalar::deserialize::<C, _>")]
    pub blinder_proof: <<C as Pairing>::PublicKey as Group>::Scalar,
    /// The fiat-shamir heuristic challenge
    #[serde(serialize_with = "traits::scalar::serialize::<C, _>")]
    #[serde(deserialize_with = "traits::scalar::deserialize::<C, _>")]
    pub challenge: <<C as Pairing>::PublicKey as Group>::Scalar,
}

impl<C: BlsSignatureImpl> core::fmt::Display for ElGamalProof<C> {
    fn fmt(&self, f: &mut core::fmt::Formatter) -> core::fmt::Result {
        write!(
            f,
            "{{ciphertext: {}, message_proof: {:?}, blinder_proof: {:?}, challenge: {:?}}}",
            self.ciphertext, self.message_proof, self.blinder_proof, self.challenge
        )
    }
}

impl<C: BlsSignatureImpl> core::fmt::Debug for ElGamalProof<C> {
    fn fmt(&self, f: &mut core::fmt::Formatter) -> core::fmt::Result {
        write!(
            f,
            "{{ciphertext: {:?}, message_proof: {:?}, blinder_proof: {:?}, challenge: {:?}}}",
            self.ciphertext, self.message_proof, self.blinder_proof, self.challenge
        )
    }
}

impl<C: BlsSignatureImpl> Copy for ElGamalProof<C> {}

impl<C: BlsSignatureImpl> Clone for ElGamalProof<C> {
    fn clone(&self) -> Self {
        *self
    }
}

impl<C: BlsSignatureImpl> ElGamalProof<C> {
    /// Verify the proof and ciphertext are valid
    pub fn verify(&self, pk: PublicKey<C>) -> BlsResult<()> {
        <C as BlsElGamal>::verify_proof(
            pk.0,
            None,
            self.ciphertext.c1,
            self.ciphertext.c2,
            self.message_proof,
            self.blinder_proof,
            self.challenge,
        )
    }

    /// Verify the proof and ciphertext then decrypt
    pub fn verify_and_decrypt(&self, sk: &SecretKey<C>) -> BlsResult<<C as Pairing>::PublicKey> {
        <C as BlsElGamal>::verify_and_decrypt(
            sk.0,
            None,
            self.ciphertext.c1,
            self.ciphertext.c2,
            self.message_proof,
            self.blinder_proof,
            self.challenge,
        )
    }
}
