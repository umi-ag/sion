module sion::verifier {
    use std::vector;

    use sui::clock::{Self, Clock};
    use sui::object::{Self, UID};
    use std::string::{String};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::dynamic_field as df;
    use sui::groth16;
    #[test_only] use std::debug;

    use sion::vc::{Self, VC};



    // preimage proof and range proof
    fun verify_hash_preimage_and_range_proof(
        expected_digest: vector<u8>,
        gte_bound: u64,
        lt_bound: u64,
    ): bool {
        let public_inputs = sion::public_inputs::build_public_inputs_bytes(expected_digest, gte_bound, lt_bound);

        let expected = x"2b596e4b230759a22d18592d73c889dc1f67b0d3ebc082f2c0c32bb379782e00db000000000000000000000000000000000000000000000000000000000000003412000000000000000000000000000000000000000000000000000000000000efcdab0000000000000000000000000000000000000000000000000000000000";
        debug::print(&expected);
        debug::print(&public_inputs);
        assert!(expected == public_inputs, 0);

        let vk = x"055c76356aa202169e71014680b0bbda2022d805be1994044d37c671f6a051a287f36a62eacc6d52b9e9926dfb5594b126ee6882f4e34bb403f6529447d9402436ac1dd99d62dbbf1d639a022d20e8a340d051baa9d3ca1db50a4b02a98f0fb053c46d3d3eb5908acf95a1868fc8f967f91b619f9d0ffc02fca12778011ac90775d4ee666ac777e353d50b125cdfb911bbf710f4aac8a35d5574ed49846ac20dd89ae6b5a5ffc5602951d9bbaa5c8ab743f632fbdcffa416fe6c3a961ed22b12f89b28adeba03d38caccd0377377dd8bcaaf958653150a53838b14054f1138990500000000000000b3dc45ba6af812422b3166e71fe28e4599b7aeacde26000bc9da28a1abd9a515aa47d31653742b5d590aa4951a609e1349db392f2df9e20bec6507fda4c36a892f6c1c79926bc365e5daca025d684a88de41b57aef772ac2e400d7d792d59ea5d1149e82f6b695d20ada0b2185f7090373cfea9b8bf26668eec1bb320222e61d2a31dde9d47ad026496a807cbfa73352d61b3fd8e1c4532362542aa320312f89";
        let proof = x"901eae8b18622e236e5f3ab93820c0711e98864a5603e722d369457c4fd94997c90d0d39bd7c112fa7be5a10b04fd40f3088ed9ef986dd8536fb036aca21ac04ae561e17f385874a3f3525baf9f8540e2ec32bf5ca679906beeafa5d4db631030a8f5ffe925a56371ac326546cae4ed0b264dd2a77b8a0f1bc31aa5fb9b8e121";

        verify_groth16_bn254(vk, public_inputs, proof)
    }

    #[test]
    fun test_verify_groth16_3() {
        let digest = x"2b596e4b230759a22d18592d73c889dc1f67b0d3ebc082f2c0c32bb379782edb";
        let input_min: u64 = 0x1234;
        let input_max: u64 = 0xABCDEF;
        let is_varified = verify_hash_preimage_and_range_proof(
            digest,
            input_min,
            input_max,
        );

        debug::print(&is_varified);
        assert(is_varified, 0);
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
        let vk =  x"7f13eed31e254fafea5bb0580fba3c45faaf3599b761b84cca53a8b02a0b969c25c558cbc72174c979f6e27f322b447fd725e1a2f3410ab8ea2c3621189f2c2965460ed243a6ffd3f66ffd55f5e15d4508c2cc8dcd71b037869bb5e59e97c8940cc02d588ffbcdd60f2978909ec36d05e6e58704f784dcb3b84226030cd22130208fd4af26e8b216f2708fd5e1c3e018c881e02f5304eb6d8f35be28ea2862ab673e9c24785d00f2cb0230c5b2b54a4f7fa205fc7351037f8490d4da7b246d125ad1895aa96f58cef72499f9c214c1b1d5c57ea6f2c1ab8003d61cbc3483878105000000000000002f93ece505b3e33c4097d9eb909fc3a5e1de9985b0f7f2909b3e48583a711190c7e96691b502151890d34088af349136627209fdd9c03452f5fac140654af6011a39f3e345ed78e366d1358a9e959ab270de21202d6b882fed71370a30f7e8a6c7cd12655e6fcaa37ae806da99986624ef6d4b00ef7285170a87de9dcc16050793245d44d7f02d9aa697889066ee3051e4d28f3c4b2622e92727a224ba156181";
        let public_inputs = x"2b596e4b230759a22d18592d73c889dc1f67b0d3ebc082f2c0c32bb379782e00db000000000000000000000000000000000000000000000000000000000000003412000000000000000000000000000000000000000000000000000000000000efcdab0000000000000000000000000000000000000000000000000000000000";
        let proof = x"fbf494771ec217856d27b007e3c83e3559edfc80f607abe40fd4b293a5094996cbf1b373825f0789a07e857b27f2392b744123f144f0a9bf5c7faf632d6ec6025caff02ad444b6811f569257f56a46cf09b00c0a5dc788fcda922b0025cf351184ca392eb5a90ea466fbff8810efe7fe6a4cab9fd57935a242af29ade9e8ed20";

        let is_verified = verify_groth16_bn254(vk, public_inputs, proof);
        debug::print(&is_verified);
        assert(is_verified, 0);
    }
}