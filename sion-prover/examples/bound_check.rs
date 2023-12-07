use ark_bn254::{Bn254 as Curve, Fr};
use ark_circuits::bound_check::{CircuitBoundCheck, ProofRequestBoundCheck};
use ark_circuits::serde_utils::{Groth16Verifier, PublicInputs};
use ark_groth16::Groth16;
use ark_serialize::CanonicalSerialize;
use ark_snark::SNARK;
use rand::thread_rng;
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

    let verifier = Groth16Verifier::new(
        &ark_circuits::serde_utils::to_bytes(&pk.vk),
        &PublicInputs::new(circuit.get_public_inputs()).to_bytes(),
        &ark_circuits::serde_utils::to_bytes(&proof),
    );

    {
        let start = ark_std::time::Instant::now();
        let vk = fastcrypto_zkp::bn254::VerifyingKey::from(pk.vk.clone());
        let pvk = fastcrypto_zkp::bn254::verifier::process_vk_special(&vk);
        let proof = &verifier.proof;
        let public_inputs_bytes = &verifier.public_inputs;

        let result = fastcrypto_zkp::bn254::api::verify_groth16(&pvk, public_inputs_bytes, proof)
            .expect("failed to verify");
        assert!(result);
        println!("verifying time: {} ms", start.elapsed().as_millis());
    }

    assert!(verifier.verify());

    println!("pk size: {}", &pk.compressed_size());
    println!("vk size: {}", &pk.vk.compressed_size());
    println!("proof size: {}", &verifier.proof.len());

    verifier.dump_json(Path::new("output.json"));
}
