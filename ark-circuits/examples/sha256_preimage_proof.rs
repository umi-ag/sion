// use ark_bls12_381::{Bls12_381 as Curve, Fr};
use ark_bn254::{Bn254 as Curve, Fr};
use ark_circuits::serde_utils::Groth16Verifier;
use ark_circuits::sha256::Sha256Circuit;
use ark_ff::ToConstraintField;
use ark_groth16::Groth16;
use ark_serialize::CanonicalSerialize;
use ark_snark::SNARK;
use ark_std::rand::thread_rng;
use fastcrypto::hash::HashFunction;
use fastcrypto::hash::Sha256;
use std::fs::File;
use std::io::Write;
use std::path::Path;

fn main() {
    let mut rng = thread_rng();
    let input_str = b"Hello, world!";
    let expected: Vec<u8> = Sha256::digest(input_str.as_slice()).to_vec();

    let circuit = Sha256Circuit::new(input_str, &expected);

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

    let inputs = vec![expected];
    {
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

    let tuple = Groth16Verifier::new(
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
