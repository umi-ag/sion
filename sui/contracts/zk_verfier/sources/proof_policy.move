module zk_escrow::proof_policy {
    use sui::transfer_policy::{
        Self as policy,
        TransferPolicy,
        TransferPolicyCap,
        TransferRequest
    };

    use zk_escrow::verifier;

    const ERuleNotFound: u64 = 0;
    const EIsNotVerified: u64 = 1;

    struct Rule has drop {}

    public fun add<T>(
        policy: &mut TransferPolicy<T>,
        cap: &TransferPolicyCap<T>
    ) {
        policy::add_rule(Rule {}, policy, cap, true);
    }

    public fun prove<T>(
        policy: &TransferPolicy<T>,
        request: &mut TransferRequest<T>,
        vk_bytes: vector<u8>,
        public_inputs_bytes: vector<u8>,
        proof_points_bytes: vector<u8>,

    ) {
        assert!(policy::has_rule<T, Rule>(policy), ERuleNotFound);
        let isVerified = verifier::verify_proof(vk_bytes, public_inputs_bytes, proof_points_bytes);
        assert!(isVerified == true, EIsNotVerified);
        policy::add_receipt(Rule {}, request)
    }
}

#[test_only]
module zk_escrow::proof_policy_test {
    // use std::debug;
    use sui::transfer_policy::{
        Self as policy,
        TransferPolicy,
        TransferPolicyCap,
        TransferRequest
    };
    use sui::transfer_policy_tests::{
        Self as policy_test,
        Asset
    };
    use sui::tx_context::{Self, TxContext};

    use zk_escrow::proof_policy;

    struct Proof has drop {}

    // If an user has `Proof`, the user can receive the receipt.
    #[test]
    fun test_proof() {
        let ctx = &mut tx_context::dummy();
        let (policy, cap) = policy_test::prepare(ctx);
        proof_policy::add<Asset, Proof>(&mut policy, &cap);

        // `Asset` -> `Card` in production environment
        let request = policy::new_request<Asset>(
            policy_test::fresh_id(ctx),
            0,
            policy_test::fresh_id(ctx),
        );

        // after getting key pair
        // example from https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/packages/sui-framework/tests/crypto/groth16_tests.move#L45C12-L45C12
        let vk_bytes = x"ada3c24e8c2e63579cc03fd1f112a093a17fc8ab0ff6eee7e04cab7bf8e03e7645381f309ec113309e05ac404c77ac7c8585d5e4328594f5a70a81f6bd4f29073883ee18fd90e2aa45d0fc7376e81e2fdf5351200386f5732e58eb6ff4d318dc";
        let inputs_bytes = x"440758042e68b76a376f2fecf3a5a8105edb194c3e774e5a760140305aec8849";
        let proof_bytes = x"a29981304df8e0f50750b558d4de59dbc8329634b81c986e28e9fff2b0faa52333b14a1f7b275b029e13499d1f5dd8ab955cf5fa3000a097920180381a238ce12df52207597eade4a365a6872c0a19a39c08a9bfb98b69a15615f90cc32660180ca32e565c01a49b505dd277713b1eae834df49643291a3601b11f56957bde02d5446406d0e4745d1bd32c8ccb8d8e80b877712f5f373016d2ecdeebb58caebc7a425b8137ebb1bd0c5b81c1d48151b25f0f24fe9602ba4e403811fb17db6f14";
        proof_policy::prove(
            &policy,
            &mut request,
            vk_bytes,
            inputs_bytes,
            proof_bytes,
        );
        let (item, paid, from) = policy::confirm_request(&policy, request);
        // debug::print(&item);
        // debug::print(&paid);
        // debug::print(&from);
        policy_test::wrapup(policy, cap, ctx);
    }
    // TODO: test_no_proof()
}
