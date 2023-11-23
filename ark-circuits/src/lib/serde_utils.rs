pub use ark_bn254::{Bn254 as Curve, Fr};
use ark_groth16::Groth16;
use ark_serialize::{CanonicalSerialize, Write};
use num_bigint::BigInt;
use num_traits::Num;
use rand::thread_rng;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use serde_with::{hex::Hex, serde_as};
use std::collections::HashMap;
use std::fs::{self, File};
use std::path::Path;

pub fn load_public_inputs_from_file(file_path: &str) -> HashMap<String, Vec<BigInt>> {
    let data = fs::read_to_string(file_path).expect("Unable to read file");
    let inputs: Value = serde_json::from_str(&data).expect("JSON was not well-formatted");
    let mut map = HashMap::new();

    if let Value::Object(entries) = inputs {
        for (key, value) in entries {
            if let Value::String(s) = value {
                map.insert(
                    key,
                    vec![BigInt::from_str_radix(&s, 10).expect("Failed to parse BigInt")],
                );
            }
        }
    }

    map
}

pub fn to_bytes<T: CanonicalSerialize>(data: &T) -> Vec<u8> {
    let mut bytes = vec![];
    data.serialize_compressed(&mut bytes).unwrap();
    bytes
}

#[serde_as]
#[derive(Serialize, Deserialize)]
pub struct Groth16VerifierTuple {
    #[serde_as(as = "Hex")]
    pub vk: Vec<u8>,
    #[serde_as(as = "Hex")]
    pub public_inputs: Vec<u8>,
    #[serde_as(as = "Hex")]
    pub proof: Vec<u8>,
}

impl Groth16VerifierTuple {
    pub fn new(vk: &[u8], public_inputs: &[u8], proof: &[u8]) -> Self {
        Self {
            vk: vk.to_vec(),
            public_inputs: public_inputs.to_vec(),
            proof: proof.to_vec(),
        }
    }

    pub fn print_info(&self) {
        println!("vk size: {}", self.vk.len());
        println!("proof size: {}", self.proof.len());
    }

    pub fn dump_json(&self, file_path: &str) {
        let serialized_data = serde_json::to_string(&self).expect("");
        let path = Path::new(file_path);
        let mut file = File::create(path).expect("");
        file.write_all(serialized_data.as_bytes()).expect("");
    }
}
