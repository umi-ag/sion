// use ark_bls12_381::{Bls12_381 as Curve, Fr};
use ark_bn254::{Bn254 as Curve, Fr};
use ark_circuits::serde_utils::Groth16VerifierTuple;
use ark_circuits::sha256::Sha256Circuit;
use ark_ff::Field;
use ark_groth16::Groth16;
use ark_r1cs_std::fields::nonnative::params::OptimizationType;
use ark_relations::lc;
use ark_relations::r1cs::{
    ConstraintSynthesizer, ConstraintSystem, ConstraintSystemRef, OptimizationGoal, SynthesisError,
};
use ark_serialize::CanonicalSerialize;
use ark_snark::SNARK;
use ark_std::rand::thread_rng;
use ark_std::UniformRand;
use fastcrypto::hash::HashFunction;
use fastcrypto::hash::Sha256;
use serde_json;
use std::fs::File;
use std::io::Write;
use std::ops::MulAssign;
use std::path::Path;

fn main() {
    let mut rng = thread_rng();
    let input_str = b"Hello, world!";
    let expected: Vec<u8> = Sha256::digest(input_str.as_slice()).to_vec();

    let circuit = Sha256Circuit::new(input_str, &expected);

    let pk = Groth16::<Curve>::generate_random_parameters_with_reduction(circuit.clone(), &mut rng)
        .unwrap();
    let proof = Groth16::<Curve>::prove(&pk, circuit, &mut rng).unwrap();

    let pvk = Groth16::<Curve>::process_vk(&pk.vk).unwrap();
    let inputs = [expected];

    let tuple = Groth16VerifierTuple::new(
        &ark_circuits::serde_utils::to_bytes(&pvk),
        &ark_circuits::serde_utils::to_bytes(&inputs),
        &ark_circuits::serde_utils::to_bytes(&proof),
    );

    println!("pk size: {}", pk.uncompressed_size());
    println!("proof size: {}", tuple.proof.len());
    println!("pkv size: {}", tuple.pkv.len());

    {
        let serialized_data = serde_json::to_string(&tuple).expect("");
        let path = Path::new("output.json");
        let mut file = File::create(&path).expect("");
        file.write_all(serialized_data.as_bytes()).expect("");
    }
}
