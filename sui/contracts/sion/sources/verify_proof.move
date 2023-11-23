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

        is_verified
    }

    #[test]
    fun test_verify_groth16() {
        let vk = x"b7d0c4333e5e579aadf11100863ef6b957691a42d0b3611c87eb07cef19068084e02d6341fe7cbc99664063e0ab2fa93f3e4505863e4034bdedfa35fdf473e2c92c876e6d7735a8bd2762b8431dbd49cbb66ee9b414437c2f9315ba0f1c7412415136827f37c57136b09b87f942f5d82478f1662818c43b1e3bdd4ac8f57260108bc0a58ff690ec41d48872654535791f61759944890946a1492ffed25fbca28e4b528d5c8907ac8eb0bc01830b09962655e580f2d5cc9f74ce69b8ba70e462339db909ebd6164f0ed1af158dc93956df5925671cfe727be8ab73d3699b404260300000000000000abf57a20ce15b3d8e6e8cd868ffae75b23428af5f24ca255451bfcce035bd11a46039de5cbc79f69b7e5e507f8a8a6e5c0920b09b0f08b3a87d20bf0433fb7a48e58770c99835836f2892f83156b4d88d6c4a66a1589ac0ac501d1c0e60eb205";
        let public_inputs = x"2000000000000000315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3";
        let proof = x"e597857632fb6a5f5fd43a0999357b731bab5030ea5f18ab81d8f694f4bbc788352e6e94a6a6dfe8edd4bcd65123eb962fb769aa406be3bba656be3d3c81581b0083789bf894a1a9e8b5b992159631812123e3c4ee1c69143b9e6ca88b56082f3522c163de9e632618341ae8cc6aa25c5c7680b70f72eb49e28fc6000b57c31e";

        verify_groth16_bn254(vk, public_inputs, proof);
    }

    #[test]
    fun test_verify_groth16_2() {
        let vk = x"a58d2e0fc2e2513be5f5ee6715020cc46536d70fcd18b57730bed8fce34c191a778a8c4d3b72319ef898c55dd78191ae69a43b3299a7f96245d72876b516422751d0c9b92c9d7d9f3c05e0b946ccb43a2654c7c0dbebb9e4cfb0c1b3f49325145bc81e7af2aa83cef86b7da6402b4456885306797d3c03d70ee6ca3384bf0d13d3113e023f2f288408f8f1e5d3392268a6ff9e1fe3e69abd85a9e1c9b9e6f183c87e521f8412d7f88e57bea40d4aa0c9ea67fa4ef3f6d9c86fb30c1312591e12997e854be285d19b7317528010e9b521fd3a5a7fc306e3c2e34475ef28f61f9105000000000000009c7598f620bb15f0ff6d3990786dab27bfab4ea59447ae731bc20bd1e3656691d0282b3a2b18eb0a4be64e0bfe425884a3bcf0066835ed9923dc722e05c90a9a331e8af35f09df7aa140176697c627e6d594c94b9ed14234e3aed18fb70f131adb13094dcf9d1a964512e19a1b4affb6d60f4e1524eabda357df1d036023530c9341d099cef13e13899e6dca82609d74ff15900f92c53115b73372035a00e8a8";
        let public_inputs = x"0400000000000000d01fce9bd75663df87618276254c9d7f44cd0dab9db99288caaa0fa5c6443100c3000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c800000000000000000000000000000000000000000000000000000000000000";
        let proof = x"e24296b47db116de05ccea6ec66d46bfd6ba15d4d34b9b592251d94940df42120a9a3c54858cae007614b2c8dda1ae48d9d22fe726f83f57d95c2bb10ff1171959cc42aedcffd1901875579a034fa76534227abedab536ab0ffe75d18f52ce1d448a5dfe84e0f0eba64996acd6825af78c5fae821875882c28d2b70ca96e85a4";

        verify_groth16_bn254(vk, public_inputs, proof);
    }
}