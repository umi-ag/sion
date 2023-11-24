module sion::verifier {
    use sui::event;
    use sui::groth16;

    #[test_only] use std::debug;


    struct Groth16VerificationEvent has copy, drop {
        vk: vector<u8>,
        public_inputs: vector<u8>,
        proof: vector<u8>,
        is_verified: bool,
    }

    // preimage proof and range proof
    public fun verify_hash_preimage_and_range_proof(
        expected_digest: vector<u8>,
        lower_bound_gte: u64,
        upper_bound_lt: u64,
        proof: vector<u8>,
        vk: vector<u8>,
    ): bool {
        let public_inputs = sion::public_inputs::build_public_inputs_bytes(expected_digest, lower_bound_gte, upper_bound_lt);
        verify_groth16_bn254(vk, public_inputs, proof)
    }

    fun verify_groth16_bn254(vk: vector<u8>, public_inputs: vector<u8>, proof: vector<u8>): bool {
        let cuvre = groth16::bn254();
        let pvk = groth16::prepare_verifying_key(&cuvre, &vk);

        let is_verified = groth16::verify_groth16_proof(
            &cuvre,
            &pvk,
            &groth16::public_proof_inputs_from_bytes(public_inputs),
            &groth16::proof_points_from_bytes(proof),
        );

        event::emit(Groth16VerificationEvent {
            vk,
            public_inputs,
            proof,
            is_verified,
        });


        is_verified
    }

    #[test]
    fun test_verify_groth16_3() {
        let vk =  x"7f13eed31e254fafea5bb0580fba3c45faaf3599b761b84cca53a8b02a0b969c25c558cbc72174c979f6e27f322b447fd725e1a2f3410ab8ea2c3621189f2c2965460ed243a6ffd3f66ffd55f5e15d4508c2cc8dcd71b037869bb5e59e97c8940cc02d588ffbcdd60f2978909ec36d05e6e58704f784dcb3b84226030cd22130208fd4af26e8b216f2708fd5e1c3e018c881e02f5304eb6d8f35be28ea2862ab673e9c24785d00f2cb0230c5b2b54a4f7fa205fc7351037f8490d4da7b246d125ad1895aa96f58cef72499f9c214c1b1d5c57ea6f2c1ab8003d61cbc3483878105000000000000002f93ece505b3e33c4097d9eb909fc3a5e1de9985b0f7f2909b3e48583a711190c7e96691b502151890d34088af349136627209fdd9c03452f5fac140654af6011a39f3e345ed78e366d1358a9e959ab270de21202d6b882fed71370a30f7e8a6c7cd12655e6fcaa37ae806da99986624ef6d4b00ef7285170a87de9dcc16050793245d44d7f02d9aa697889066ee3051e4d28f3c4b2622e92727a224ba156181";
        let proof = x"fbf494771ec217856d27b007e3c83e3559edfc80f607abe40fd4b293a5094996cbf1b373825f0789a07e857b27f2392b744123f144f0a9bf5c7faf632d6ec6025caff02ad444b6811f569257f56a46cf09b00c0a5dc788fcda922b0025cf351184ca392eb5a90ea466fbff8810efe7fe6a4cab9fd57935a242af29ade9e8ed20";

        let digest = x"2b596e4b230759a22d18592d73c889dc1f67b0d3ebc082f2c0c32bb379782edb";
        let input_min: u64 = 0x1234;
        let input_max: u64 = 0xABCDEF;
        let public_inputs = sion::public_inputs::build_public_inputs_bytes(digest, input_min, input_max);

        let expected = x"2b596e4b230759a22d18592d73c889dc1f67b0d3ebc082f2c0c32bb379782e00db000000000000000000000000000000000000000000000000000000000000003412000000000000000000000000000000000000000000000000000000000000efcdab0000000000000000000000000000000000000000000000000000000000";
        assert!(expected == public_inputs, 0);

        let is_verified = verify_hash_preimage_and_range_proof(
            digest,
            input_min,
            input_max,
            proof,
            vk,
        );

        debug::print(&is_verified);
        assert(is_verified, 0);
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