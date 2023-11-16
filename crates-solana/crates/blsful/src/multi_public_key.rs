use crate::*;

/// An accumulated public key
#[derive(Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct MultiPublicKey<C: BlsSignatureImpl>(
    /// The inner raw value
    #[serde(serialize_with = "traits::public_key::serialize::<C, _>")]
    #[serde(deserialize_with = "traits::public_key::deserialize::<C, _>")]
    pub <C as Pairing>::PublicKey,
);

impl<C: BlsSignatureImpl> core::fmt::Display for MultiPublicKey<C> {
    fn fmt(&self, f: &mut core::fmt::Formatter) -> core::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl<C: BlsSignatureImpl> core::fmt::Debug for MultiPublicKey<C> {
    fn fmt(&self, f: &mut core::fmt::Formatter) -> core::fmt::Result {
        write!(f, "{:?}", self.0)
    }
}

impl<C: BlsSignatureImpl> Copy for MultiPublicKey<C> {}

impl<C: BlsSignatureImpl> Clone for MultiPublicKey<C> {
    fn clone(&self) -> Self {
        *self
    }
}

impl<C: BlsSignatureImpl> subtle::ConditionallySelectable for MultiPublicKey<C> {
    fn conditional_select(a: &Self, b: &Self, choice: Choice) -> Self {
        Self(<C as Pairing>::PublicKey::conditional_select(
            &a.0, &b.0, choice,
        ))
    }
}

impl<C: BlsSignatureImpl> From<&[PublicKey<C>]> for MultiPublicKey<C> {
    fn from(keys: &[PublicKey<C>]) -> Self {
        Self::from_public_keys(keys)
    }
}

impl<C: BlsSignatureImpl> MultiPublicKey<C> {
    /// Accumulate multiple public keys into a single public key
    pub fn from_public_keys<B: AsRef<[PublicKey<C>]>>(keys: B) -> Self {
        Self(<C as BlsMultiKey>::from_public_keys(
            keys.as_ref().iter().map(|k| k.0),
        ))
    }
}
