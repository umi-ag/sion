module sion::bound_check {
    use std::string::{Self, String, utf8};
    use std::bcs;

    use sui::event;

    use sion::membership::{Self, Membership};


    struct ClaimReqirementBoundCheck has store, copy, drop {
        authenticator: address,
        claim_key: String,
        lower_bound_gte: u64,
        upper_bound_lt: u64,
    }

    struct ClaimPresentationBoundCheck has copy, drop {
        authenticator: address,
        subject: address,
        request: ClaimReqirementBoundCheck,
        proof: vector<u8>,
        vk: vector<u8>,
        is_verified: bool,
    }


    public fun key(req: &ClaimReqirementBoundCheck): String {
        let s = utf8(bcs::to_bytes(&req.authenticator));
        string::append(&mut s, req.claim_key);
        s
    }

    public fun subject(presentation: &ClaimPresentationBoundCheck): address {
        presentation.subject
    }

    public fun request(presentation: &ClaimPresentationBoundCheck): ClaimReqirementBoundCheck {
        presentation.request
    }


    public fun new_requirement(
        authenticator: address,
        claim_key: String,
        lower_bound_gte: u64,
        upper_bound_lt: u64,
    ): ClaimReqirementBoundCheck {
        ClaimReqirementBoundCheck {
            authenticator,
            claim_key,
            lower_bound_gte,
            upper_bound_lt,
        }
    }

    public fun new_presentation(
        membership: &Membership,
        req: ClaimReqirementBoundCheck,
        proof: vector<u8>,
        vk: vector<u8>,
    ): ClaimPresentationBoundCheck {
        let digest = *membership::borrow_claim_digest_by_key(membership, req.claim_key);
        let is_verified = verify_hash_preimage_and_range_proof(
            digest,
            req.lower_bound_gte,
            req.upper_bound_lt,
            proof,
            vk,
        );

        let presentation = ClaimPresentationBoundCheck {
            authenticator: membership::authenticator(membership),
            subject: membership::subject(membership),
            request: req,
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
