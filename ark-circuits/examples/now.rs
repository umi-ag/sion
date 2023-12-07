// use ark_bls12_381::{Bls12_381 as Curve, Fr};
use ark_bn254::{Bn254 as Curve, Fr};
use ark_circuits::pure_bound_check::BoundCheckCircuit;
use ark_circuits::serde_utils::{self, Groth16VerifierTuple, PublicInputs};
use ark_crypto_primitives::crh::sha256::constraints::{DigestVar, Sha256Gadget};
use ark_ff::ToConstraintField;
use ark_ff::{Field, PrimeField};
use ark_groth16::{Groth16, Proof};
use ark_r1cs_std::eq::EqGadget;
use ark_r1cs_std::uint64::UInt64;
use ark_r1cs_std::uint8::UInt8;
use ark_r1cs_std::ToBytesGadget;
use ark_r1cs_std::{
    fields::fp::FpVar,
    prelude::{AllocVar, AllocationMode},
};
use ark_relations::r1cs::{ConstraintSynthesizer, ConstraintSystemRef, SynthesisError};
use ark_serialize::CanonicalDeserialize;
use ark_serialize::CanonicalSerialize;
use ark_snark::SNARK;
use ark_std::cmp::Ordering;
use fastcrypto::encoding::Base58;
use fastcrypto::error::FastCryptoError;
use fastcrypto::hash::HashFunction;
use fastcrypto::hash::Sha256;
use fastcrypto_zkp::bn254::api::verify_groth16_in_bytes;
use fastcrypto_zkp::bn254::FieldElement;
use rand::thread_rng;
use std::fs::File;
use std::io::Write;
use std::path::Path;

#[derive(Clone)]
pub struct MainCircuit<F: Field> {
    value: Vec<u8>,
    expected_digest: Vec<u8>,
    min: Option<F>,
    max: Option<F>,
}

impl<F: Field> MainCircuit<F> {
    pub fn new(value: &[u8], expected_digest: &[u8], min: u64, max: u64) -> Self {
        Self {
            value: value.to_vec(),
            expected_digest: expected_digest.to_vec(),
            min: Some(F::from(min)),
            max: Some(F::from(max)),
        }
    }
}

impl<ConstraintF: PrimeField> ConstraintSynthesizer<ConstraintF> for MainCircuit<ConstraintF> {
    fn generate_constraints(
        self,
        cs: ConstraintSystemRef<ConstraintF>,
    ) -> Result<(), SynthesisError> {
        let value = UInt8::new_witness_vec(cs.clone(), &self.value).unwrap();
        let expected_digest = UInt8::new_input_vec(cs.clone(), &self.expected_digest).unwrap();
        let min = FpVar::new_input(cs.clone(), || {
            self.min.ok_or(SynthesisError::AssignmentMissing)
        })?;
        let max = FpVar::new_input(cs.clone(), || {
            self.max.ok_or(SynthesisError::AssignmentMissing)
        })?;
        let private_number = {
            let num = u64::from_le_bytes(self.value.try_into().unwrap());
            FpVar::new_constant(cs.clone(), ConstraintF::from(num))?
        };

        // sha256 hash preimage proof
        {
            let mut sha256_var = Sha256Gadget::default();
            sha256_var.update(&value).unwrap();

            sha256_var
                .finalize()?
                .enforce_equal(&DigestVar(expected_digest.clone()))?;
        }

        // range proof
        {
            // val strictly greater than or equal to max, i.e. val >= min
            private_number.enforce_cmp(&min, Ordering::Greater, true)?;

            // val strictly less than to max, i.e. val < max
            private_number.enforce_cmp(&max, Ordering::Less, false)?;
        }

        println!("num_constraints: {}", cs.num_constraints());

        Ok(())
    }
}

fn main() -> anyhow::Result<()> {
    let mut rng = thread_rng();
    let private_number: u64 = 0x123456;
    let input_min: u64 = 0x1234;
    let input_max: u64 = 0xABCDEF;

    // let private_value = private_number.to_be_bytes().to_vec();
    let private_value = private_number.to_le_bytes().to_vec();
    let expected_digest: Vec<u8> = Sha256::digest(&private_value).to_vec();

    let circuit = MainCircuit::<Fr>::new(&private_value, &expected_digest, input_min, input_max);

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

    let public_inputs = {
        let mut inputs: Vec<Fr> = [
            // &circuit.blake2_seed[..], &circuit.expected_output[..]
            // circuit.min,
            expected_digest,
            // vec![input_min, input_max], // Fr::from(circuit.min.unwrap()),
            // Fr::from(circuit.max.unwrap()),
        ]
        .iter()
        .flat_map::<Vec<Fr>, _>(|x| x.to_field_elements().unwrap())
        .map(Fr::from)
        .collect();

        inputs.push(Fr::from(input_min));
        inputs.push(Fr::from(input_max));

        PublicInputs::new(inputs)
    };

    let tuple = {
        let public_inputs_bytes = public_inputs.to_bytes();
        dbg!(&hex::encode(&public_inputs_bytes));
        Groth16VerifierTuple::new(
            &ark_circuits::serde_utils::to_bytes(&pk.vk),
            &public_inputs_bytes.clone(),
            &ark_circuits::serde_utils::to_bytes(&proof),
        )
    };

    {
        let start = ark_std::time::Instant::now();
        let vk = fastcrypto_zkp::bn254::VerifyingKey::from(pk.vk);
        let pvk = fastcrypto_zkp::bn254::verifier::process_vk_special(&vk);
        let result =
            fastcrypto_zkp::bn254::api::verify_groth16(&pvk, &tuple.public_inputs, &tuple.proof)?;
        assert!(result);
        println!("verifying time: {} ms", start.elapsed().as_millis());
    }

    {
        let serialized_data = serde_json::to_string(&tuple).expect("");
        let path = Path::new("output.json");
        let mut file = File::create(path).expect("");
        file.write_all(serialized_data.as_bytes()).expect("");
    }

    Ok(())
}
