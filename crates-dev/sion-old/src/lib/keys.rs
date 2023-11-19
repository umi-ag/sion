use core::fmt;
use std::str::FromStr;

use bbs::prelude::Issuer;
use bbs::ToVariableLengthBytes;

#[derive(Debug)]
pub struct PublicKey(pub(crate) bbs::prelude::PublicKey);

impl fmt::Display for PublicKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let hex = hex::encode(self.0.to_bytes_compressed_form());
        write!(f, "{}", hex)
    }
}

impl FromStr for PublicKey {
    type Err = Box<dyn std::error::Error>;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let bytes = hex::decode(s).unwrap();
        let key = bbs::prelude::PublicKey::from_bytes_compressed_form(bytes).expect("pk");
        Ok(PublicKey(key))
    }
}

#[derive(Debug)]
pub struct SecretKey(pub(crate) bbs::prelude::SecretKey);

impl fmt::Display for SecretKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let hex = hex::encode(self.0.to_bytes_compressed_form());
        write!(f, "{}", hex)
    }
}

impl FromStr for SecretKey {
    type Err = Box<dyn std::error::Error>;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let bytes = hex::decode(s).unwrap();
        let fixed: [u8; 32] = bytes.try_into().expect("sk is 32 bytes");
        let key = bbs::prelude::SecretKey::from(&fixed);
        Ok(SecretKey(key))
    }
}

pub struct KeyPair {
    pk: PublicKey,
    sk: SecretKey,
}

impl KeyPair {
    pub fn new(message_count: usize) -> Self {
        let (pk, sk) = Issuer::new_keys(message_count).unwrap();
        KeyPair {
            pk: PublicKey(pk),
            sk: SecretKey(sk),
        }
    }

    pub fn pk(&self) -> &PublicKey {
        &self.pk
    }

    pub fn sk(&self) -> &SecretKey {
        &self.sk
    }
}

#[test]
pub fn test_pk() {
    let keypair = crate::keys::KeyPair::new(5);
    let expected = keypair.pk().to_string();
    let actual = crate::keys::PublicKey::from_str(&expected)
        .unwrap()
        .to_string();

    assert_eq!(expected, actual);
}

#[test]
pub fn test_sk() {
    let keypair = crate::keys::KeyPair::new(5);
    let expected = keypair.sk().to_string();
    let actual = crate::keys::SecretKey::from_str(&expected)
        .unwrap()
        .to_string();

    assert_eq!(expected, actual);
}
