module sion::cert_requirement {
    use std::string::{String};
    use std::vector::{Self};

    use sui::table::{Self, Table};
    use sui::tx_context::{TxContext};

    use sion::bound_check::{Self, ClaimReqirementBoundCheck};

    friend sion::cert_presentation;


    struct CertRequirement<phantom Cert: key + store> has store {
        claim_requirements: Table<String, ClaimReqirementBoundCheck>,
    }

    public fun length<Cert: key + store>(
        req: &CertRequirement<Cert>,
    ): u64 {
        table::length(&req.claim_requirements)
    }

    public fun new<Cert: key + store>(
        claim_requirements: vector<ClaimReqirementBoundCheck>,
        ctx: &mut TxContext,
    ): CertRequirement<Cert> {
        let cert_req = default_requirement(ctx);

        let (i, len) = (0, vector::length(&claim_requirements));
        while (i < len) {
            let claim_req = vector::pop_back(&mut claim_requirements);
            insert_claim_requirement(&mut cert_req, claim_req);

            i = i + 1
        };

        cert_req
    }

    public fun default_requirement<Cert: key + store>(ctx: &mut TxContext): CertRequirement<Cert> {
        CertRequirement<Cert> {
            claim_requirements: table::new(ctx),
        }
    }

    public(friend) fun insert_claim_requirement<Cert: key + store>(
        req: &mut CertRequirement<Cert>,
        claim_req: ClaimReqirementBoundCheck,
    ) {
        table::add(
            &mut req.claim_requirements,
            bound_check::key(&claim_req),
            claim_req
        );
    }

    public(friend) fun remove_claim_requirement<Cert: key + store>(
        req: &mut CertRequirement<Cert>,
        claim_req: ClaimReqirementBoundCheck,
    ) {
        table::remove(
            &mut req.claim_requirements,
            bound_check::key(&claim_req),
        );
    }

    public(friend) fun destroy_empty<Cert: key + store>(
        req: CertRequirement<Cert>,
    ) {
        let CertRequirement { claim_requirements } = req;
        table::destroy_empty(claim_requirements);
    }
}