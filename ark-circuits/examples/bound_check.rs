use ark_bn254::{Bn254 as Curve, Fr};
use ark_circuits::bound_check::{CircuitBoundCheck, ProofRequestBoundCheck};
use ark_circuits::serde_utils::{Groth16VerifierTuple, PublicInputs};
use ark_crypto_primitives::crh::sha256::constraints::{DigestVar, Sha256Gadget};
use ark_ff::ToConstraintField;
use ark_ff::{Field, PrimeField};
use ark_groth16::{Groth16, Proof};
use ark_r1cs_std::eq::EqGadget;
use ark_r1cs_std::ToBytesGadget;
use ark_r1cs_std::{
    fields::fp::FpVar,
    prelude::{AllocVar, AllocationMode},
};
use ark_relations::r1cs::{ConstraintSynthesizer, ConstraintSystemRef, SynthesisError};
use ark_serialize::CanonicalSerialize;
use ark_snark::SNARK;
use ark_std::cmp::Ordering;
use axum::http::request;
use fastcrypto::hash::HashFunction;
use fastcrypto::hash::Sha256;
use rand::thread_rng;
use serde_with::DeserializeFromStr;
use std::fs::File;
use std::io::Write;
use std::path::Path;

fn main() {
    let mut rng = thread_rng();
    let private_number: u64 = 0x123456;
    let input_lower_bound_gte: u64 = 0x1234;
    let input_upper_bound_lt: u64 = 0xABCDEF;

    let request =
        ProofRequestBoundCheck::new(private_number, input_lower_bound_gte, input_upper_bound_lt);
    let circuit = CircuitBoundCheck::<Fr>::from(request);

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

    let public_inputs = PublicInputs::new(circuit.get_public_inputs());

    {
        let start = ark_std::time::Instant::now();
        let vk = fastcrypto_zkp::bn254::VerifyingKey::from(pk.vk.clone());
        let pvk = fastcrypto_zkp::bn254::verifier::process_vk_special(&vk);
        let public_inputs_bytes = public_inputs.to_bytes();

        let result = fastcrypto_zkp::bn254::api::verify_groth16(
            &pvk,
            &public_inputs_bytes.clone(),
            &ark_circuits::serde_utils::to_bytes(&proof),
        )
        .expect("failed to verify");
        assert!(result);
        println!("verifying time: {} ms", start.elapsed().as_millis());
    }

    let tuple = Groth16VerifierTuple::new(
        &ark_circuits::serde_utils::to_bytes(&pk.vk),
        &ark_circuits::serde_utils::to_bytes(&circuit.get_public_inputs()),
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
