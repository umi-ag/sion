module sion::bound_check {
    use std::string::{String};

    use sui::event;

    use sion::membership::{Self, Membership};


    struct ClaimBoundCheckRequest has copy, drop {
        authenticator: address,
        claim_key: String,
        lower_bound_gte: u64,
        upper_bound_lt: u64,
    }

    struct ClaimBoundCheckPresentation has copy, drop {
        authenticator: address,
        subject: address,
        request: ClaimBoundCheckRequest,
        proof: vector<u8>,
        vk: vector<u8>,
        is_verified: bool,
    }


    public fun new_request(
        authenticator: address,
        claim_key: String,
        lower_bound_gte: u64,
        upper_bound_lt: u64,
    ): ClaimBoundCheckRequest {
        ClaimBoundCheckRequest {
            authenticator,
            claim_key,
            lower_bound_gte,
            upper_bound_lt,
        }
    }

    public fun verify_proof(
        membership: &Membership,
        request: ClaimBoundCheckRequest,
        proof: vector<u8>,
        vk: vector<u8>,
    ): ClaimBoundCheckPresentation {
        let digest = *membership::borrow_claim_digest_by_key(membership, request.claim_key);
        let is_verified = verify_hash_preimage_and_range_proof(
            digest,
            request.lower_bound_gte,
            request.upper_bound_lt,
            proof,
            vk,
        );

        let presentation = ClaimBoundCheckPresentation {
            authenticator: membership::authenticator(membership),
            subject: membership::subject(membership),
            request,
            proof,
            vk,
            is_verified,
        };

        event::emit(presentation);

        presentation
    }

    public fun verify_hash_preimage_and_range_proof(
        expected_digest: vector<u8>,
        lower_bound_gte: u64,
        upper_bound_lt: u64,
        proof: vector<u8>,
        vk: vector<u8>,
    ): bool {
        let public_inputs = sion::public_inputs::build_public_inputs_bytes(expected_digest, lower_bound_gte, upper_bound_lt);
        sion::verifier::verify_groth16_bn254(vk, public_inputs, proof)
    }
}
