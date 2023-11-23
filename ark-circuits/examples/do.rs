// use ark_bls12_381::{Bls12_381 as Curve, Fr};
use ark_bn254::{Bn254 as Curve, Fr};
use ark_circuits::bound_check::BoundCheckCircuit;
use ark_circuits::serde_utils::Groth16VerifierTuple;
use ark_crypto_primitives::crh::sha256::constraints::{DigestVar, Sha256Gadget};
use ark_ff::ToConstraintField;
use ark_ff::{Field, PrimeField};
use ark_groth16::Groth16;
use ark_r1cs_std::eq::EqGadget;
use ark_r1cs_std::uint8::UInt8;
use ark_r1cs_std::ToBytesGadget;
use ark_r1cs_std::{
    fields::fp::FpVar,
    prelude::{AllocVar, AllocationMode},
};
use ark_relations::r1cs::{ConstraintSynthesizer, ConstraintSystemRef, SynthesisError};
use ark_serialize::CanonicalSerialize;
use ark_snark::SNARK;
use ark_std::cmp::Ordering;
use fastcrypto::hash::HashFunction;
use fastcrypto::hash::Sha256;
use rand::thread_rng;
use std::fs::File;
use std::io::Write;
use std::path::Path;

#[derive(Clone)]
pub struct MainCircuit {
    value: Vec<u8>,
    expected_digest: Vec<u8>,
}

impl MainCircuit {
    pub fn new(value: &[u8], expected_digest: &[u8]) -> Self {
        Self {
            value: value.to_vec(),
            expected_digest: expected_digest.to_vec(),
        }
    }
}

impl<ConstraintF: PrimeField> ConstraintSynthesizer<ConstraintF> for MainCircuit {
    fn generate_constraints(
        self,
        cs: ConstraintSystemRef<ConstraintF>,
    ) -> Result<(), SynthesisError> {
        let value = UInt8::new_witness_vec(cs.clone(), &self.value).unwrap();
        let expected_digest = UInt8::new_input_vec(cs.clone(), &self.expected_digest).unwrap();

        {
            let mut sha256_var = Sha256Gadget::default();
            sha256_var.update(&value).unwrap();

            sha256_var
                .finalize()?
                .enforce_equal(&DigestVar(expected_digest.clone()))?;
        }

        println!("num_constraints: {}", cs.num_constraints());

        Ok(())
    }
}

fn main() {
    let mut rng = thread_rng();
    let input_value = 121u64;
    // let input_min = 100u64;
    // let input_max = 200u64;

    let value = b"121";
    let expected_digest: Vec<u8> = Sha256::digest(value).to_vec();

    let circuit = MainCircuit::new(value, &expected_digest);

    let pk = {
        let start = ark_std::time::Instant::now();
        let pk =
            Groth16::<Curve>::generate_random_parameters_with_reduction(circuit.clone(), &mut rng)
                .unwrap();
        println!(
            "setup time: {} ms. pk size: {}",
            start.elapsed().as_millis(),
            pk.compressed_size(),
        );
        pk
    };

    let proof = {
        let start = ark_std::time::Instant::now();
        let proof = Groth16::<Curve>::prove(&pk, circuit.clone(), &mut rng).unwrap();
        println!(
            "proving time: {} ms. proof size: {}",
            start.elapsed().as_millis(),
            proof.serialized_size(ark_serialize::Compress::Yes),
        );
        proof
    };

    // let inputs = vec![input_min, input_max];
    let inputs = [expected_digest];
    // let inputs = [Fr::from(input_min), Fr::from(input_max)];
    {
        // let prepared_public_inputs_1 = inputs.to_field_elements().unwrap();
        // let prepared_public_inputs = [Fr::from(input_min), Fr::from(input_max)];
        let prepared_public_inputs = inputs
            .clone()
            .into_iter()
            .flatten()
            .collect::<Vec<_>>()
            .to_field_elements()
            .unwrap();
        let start = ark_std::time::Instant::now();
        let result = Groth16::<Curve>::verify(&pk.vk, &prepared_public_inputs, &proof).unwrap();
        assert!(result);
        println!("verifying time: {} ms", start.elapsed().as_millis());
    }

    let pvk = Groth16::<Curve>::process_vk(&pk.vk).unwrap();

    let tuple = Groth16VerifierTuple::new(
        &ark_circuits::serde_utils::to_bytes(&pk.vk),
        &ark_circuits::serde_utils::to_bytes(&inputs),
        &ark_circuits::serde_utils::to_bytes(&proof),
    );

    println!("pk size: {}", &pk.compressed_size());
    println!("vk size: {}", &pk.vk.compressed_size());
    println!("pkv size: {}", &pvk.compressed_size());
    println!("proof size: {}", &tuple.proof.len());

    {
        let serialized_data = serde_json::to_string(&tuple).expect("");
        let path = Path::new("output.json");
        let mut file = File::create(path).expect("");
        file.write_all(serialized_data.as_bytes()).expect("");
    }
}
