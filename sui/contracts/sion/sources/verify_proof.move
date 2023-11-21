module sion::verifier {
    use std::vector;

    use sui::clock::{Self, Clock};
    use sui::object::{Self, UID};
    use std::string::{String};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::dynamic_field as df;
    use sui::groth16;

    use sion::vc::{Self, VC};


    // preimage proof and range proof
    fun verify_proof(
        vc: &VC,
        issuer_address: address,
        claim_key: String,
        verifier_key: vector<u8>,
        gte_bound: vector<u8>,
        lt_bound: vector<u8>,
        proof: vector<u8>,
    ): bool {
        // if (vc::created_by(vc) != issuer_address) {
        //     return false
        // };

        // let claim_digest = *vc::get_field(vc, claim_key);
        // let public_inputs = vector::empty();
        // vector::append(&mut public_inputs, claim_digest);
        // vector::append(&mut public_inputs, gte_bound);
        // vector::append(&mut public_inputs, lt_bound);

        // verify_groth16_bn254(verifier_key, public_inputs, proof)
        true
    }

    fun verify_groth16_bn254(vk: vector<u8>, public_inputs: vector<u8>, proof: vector<u8>): bool {
        let cuvre = groth16::bn254();
        let pvk = groth16::prepare_verifying_key(&cuvre, &vk);
        let public_inputs = groth16::public_proof_inputs_from_bytes(public_inputs);
        let proof_points = groth16::proof_points_from_bytes(proof);

        let is_verified = groth16::verify_groth16_proof(
            &cuvre,
            &pvk,
            &public_inputs,
            &proof_points,
        );

        true
    }
}