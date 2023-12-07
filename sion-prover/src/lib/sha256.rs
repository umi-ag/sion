// https://github.com/celer-network/arkworks-sha256-bench/blob/master/benches/sha_bench.rs

use ark_crypto_primitives::crh::sha256::constraints::{DigestVar, Sha256Gadget};
use ark_ff::PrimeField;
use ark_r1cs_std::{prelude::EqGadget, uint8::UInt8};
use ark_relations::r1cs::{ConstraintSynthesizer, ConstraintSystemRef, SynthesisError};
use std::clone::Clone;

#[derive(Clone)]
pub struct Sha256Circuit {
    input: Vec<u8>,
    expected: Vec<u8>,
}

impl Sha256Circuit {
    pub fn new(input: &[u8], expcted: &[u8]) -> Self {
        Self {
            input: input.to_vec(),
            expected: expcted.to_vec(),
        }
    }
}

impl<F: PrimeField> ConstraintSynthesizer<F> for Sha256Circuit {
    fn generate_constraints(self, cs: ConstraintSystemRef<F>) -> Result<(), SynthesisError> {
        let input = UInt8::new_witness_vec(cs.clone(), &self.input).unwrap();
        let expected = UInt8::new_input_vec(cs.clone(), &self.expected).unwrap();

        let mut sha256_var = Sha256Gadget::default();
        sha256_var.update(&input).unwrap();

        sha256_var
            .finalize()?
            .enforce_equal(&DigestVar(expected.clone()))?;

        println!(
            "num_constraints of sha256 with input size {} bytes : {}",
            self.input.len(),
            cs.num_constraints()
        );

        Ok(())
    }
}

#[cfg(test)]
mod test_sha256 {
    use ark_bn254::{Bn254, Fr};
    use ark_crypto_primitives::snark::SNARK;
    use ark_ff::{PrimeField, ToConstraintField};
    use ark_groth16::Groth16;
    use ark_serialize::CanonicalSerialize;
    use ark_std::rand::{self, rngs::StdRng};
    use fastcrypto::hash::Sha256;
    use fastcrypto::hash::{Blake2b256, HashFunction};

    use crate::sha256::Sha256Circuit;

    #[test]
    fn test_sha256() {
        let input_str = b"Hello, world!";
        // let expected: Vec<u8> = Blake2b256::digest(input_str.as_slice()).to_vec();
        let expected: Vec<u8> = Sha256::digest(input_str.as_slice()).to_vec();
        let input_size = input_str.len();

        let circuit = Sha256Circuit::new(input_str, &expected);

        type GrothSetup = Groth16<Bn254>;
        let mut test_rng = test_rng();

        let start = ark_std::time::Instant::now();
        let (pk, vk) = GrothSetup::circuit_specific_setup(circuit.clone(), &mut test_rng).unwrap();
        println!(
            "setup time for sha256 with input size {} bytes: {} ms. pk size: {}",
            input_size,
            start.elapsed().as_millis(),
            pk.uncompressed_size(),
        );

        let start = ark_std::time::Instant::now();
        let proof = GrothSetup::prove(&pk, circuit, &mut test_rng).unwrap();
        println!(
            "proving time for sha256 with input size {} bytes: {} ms. proof size: {}",
            input_size,
            start.elapsed().as_millis(),
            proof.serialized_size(ark_serialize::Compress::Yes),
        );

        let start = ark_std::time::Instant::now();
        let res = GrothSetup::verify(&vk, &expected.to_field_elements().unwrap(), &proof).unwrap();
        println!(
            "verifying time for sha256 with input size {} bytes: {} ms",
            input_size,
            start.elapsed().as_millis()
        );
        assert!(res);
    }

    fn test_rng() -> StdRng {
        use rand::SeedableRng;
        // arbitrary seed
        let seed = [
            1, 0, 0, 0, 23, 0, 0, 0, 200, 1, 0, 0, 210, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
        ];
        rand::rngs::StdRng::from_seed(seed)
    }
}
