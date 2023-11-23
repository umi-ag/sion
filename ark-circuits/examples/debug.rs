// use ark_bls12_381::{Bls12_381 as Curve, Fr};
use ark_bn254::{Bn254 as Curve, Fr};
use ark_circuits::bound_check::BoundCheckCircuit;
use ark_circuits::serde_utils::{self, Groth16VerifierTuple};
use ark_crypto_primitives::crh::sha256::constraints::{DigestVar, Sha256Gadget};
use ark_ff::ToConstraintField;
use ark_ff::{Field, PrimeField};
use ark_groth16::Groth16;
use ark_r1cs_std::eq::EqGadget;
use ark_r1cs_std::uint64::UInt64;
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
use fastcrypto::encoding::Base58;
use fastcrypto::hash::HashFunction;
use fastcrypto::hash::Sha256;
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

fn main() {
    let mut rng = thread_rng();
    let private_number: u64 = 0x123456;
    let input_min = 0x1234;
    let input_max = 0xABCDEF;

    // let private_value = private_number.to_be_bytes().to_vec();
    let private_value = private_number.to_le_bytes().to_vec();
    let expected_digest: Vec<u8> = Sha256::digest(&private_value).to_vec();

    let circuit = MainCircuit::new(&private_value, &expected_digest, input_min, input_max);

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

    println!("digest: {:?}", hex::encode(&expected_digest));
    {
        let input: u64 = 0x123456;
        println!("S #1: {:?}", hex::encode(&input.to_string()));
        println!("le #1: {:?}", hex::encode(&input.to_le_bytes()));
        println!("be #1: {:?}", hex::encode(&input.to_be_bytes()));
        println!(
            "Fr #1: {:?}",
            hex::encode(&serde_utils::to_bytes(&Fr::from(input)))
        );
    }

    let public_inputs = {
        let public_inputs = {
            let mut prepared_public_inputs = Vec::<Fr>::new();
            let okamru = expected_digest.to_field_elements().unwrap();
            prepared_public_inputs.append(&mut okamru.clone());
            prepared_public_inputs.push(Fr::from(input_min));
            prepared_public_inputs.push(Fr::from(input_max));
            prepared_public_inputs
        };

        let bytes = ark_circuits::serde_utils::to_bytes(&public_inputs);
        println!("public_inputs #1: {:?}", hex::encode(&bytes));
        public_inputs
    };

    {
        let start = ark_std::time::Instant::now();
        let result = Groth16::<Curve>::verify(&pk.vk, &public_inputs, &proof).unwrap();
        assert!(result);
        println!("verifying time: {} ms", start.elapsed().as_millis());
    }
    {
        println!("TEST digest");
        println!("digest $1: {:?}", &expected_digest);
        println!("digest $2: {:?}", hex::encode(&expected_digest));
        let okamru: Vec<Fr> = expected_digest.to_field_elements().unwrap();
        let expected = ark_circuits::serde_utils::to_bytes(&okamru);

        let actual = {
            let mut buffer = Vec::<u8>::new();
            let mut buffer_1 = Vec::<u8>::new();
            let mut buffer_2 = Vec::<u8>::new();
            let mut digest = expected_digest.clone();
            let last = digest.pop().unwrap();
            let length: u64 = 2;

            {
                buffer.append(&mut length.to_le_bytes().to_vec());
            }
            dbg!(hex::encode(&digest));

            {
                buffer_1.append(&mut digest);
                buffer_1.push(0);
            }
            dbg!(hex::encode(&digest));
            {
                buffer_2.push(last);
                buffer_2.append(&mut vec![0; 31]);
            }
            dbg!(hex::encode(&digest));
            {
                buffer.append(&mut buffer_1);
                buffer.append(&mut buffer_2);
            }

            buffer
        };
        println!("expected: {:?}", hex::encode(&expected));
        println!("actual: {:?}", hex::encode(&actual));

        assert_eq!(expected, actual);
    }
    {
        println!("TEST u64");
        println!("input_min $2: {:?}", hex::encode(&input_min.to_le_bytes()));
        let expected = ark_circuits::serde_utils::to_bytes(&Fr::from(input_min));

        let actual = {
            let mut buffer = Vec::<u8>::new();
            buffer.append(&mut input_min.clone().to_le_bytes().to_vec());
            buffer.append(&mut vec![0; 24]);
            // buffer.append(&mut vec![
            //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            // ]);

            buffer
        };
        println!("expected: {:?}", hex::encode(&expected));
        println!("actual: {:?}", hex::encode(&actual));

        assert_eq!(expected, actual);
    }

    let tuple = Groth16VerifierTuple::new(
        &ark_circuits::serde_utils::to_bytes(&pk.vk),
        &ark_circuits::serde_utils::to_bytes(&public_inputs),
        &ark_circuits::serde_utils::to_bytes(&proof),
    );

    println!("pk size: {}", &pk.compressed_size());
    println!("vk size: {}", &pk.vk.compressed_size());
    println!("proof size: {}", &tuple.proof.len());

    {
        let serialized_data = serde_json::to_string(&tuple).expect("");
        let path = Path::new("output.json");
        let mut file = File::create(path).expect("");
        file.write_all(serialized_data.as_bytes()).expect("");
    }
}

// 0400000000000000 (u8)
// 2b596e4b230759a22d18592d73c889dc1f67b0d3ebc082f2c0c32bb379782e00
// db00000000000000000000000000000000000000000000000000000000000000
// 3412000000000000000000000000000000000000000000000000000000000000
// efcdab0000000000000000000000000000000000000000000000000000000000
