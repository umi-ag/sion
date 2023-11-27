module sion::cert_requirement {
    use std::string::{String};
    use std::vector::{Self};

    use sui::table::{Self, Table};
    use sui::tx_context::{Self, TxContext};

    use sion::bound_check::{Self, ClaimReqirementBoundCheck, ClaimPresentationBoundCheck};


    struct CertRequirement<phantom Cert: key + store> has store {
        claim_requirements: Table<String, ClaimReqirementBoundCheck>,
    }

    struct CertPresentation<phantom Cert: key + store> has store {
        subject: address,
        is_verified: bool,
    }

    public fun length<Cert: key + store>(
        req: &CertRequirement<Cert>,
    ): u64 {
        table::length(&req.claim_requirements)
    }

    fun insert_claim_requirement<Cert: key + store>(
        req: &mut CertRequirement<Cert>,
        claim_req: ClaimReqirementBoundCheck,
    ) {
        table::add(
            &mut req.claim_requirements,
            bound_check::key(&claim_req),
            claim_req
        );
    }

    fun remove_claim_requirement<Cert: key + store>(
        req: &mut CertRequirement<Cert>,
        claim_req: ClaimReqirementBoundCheck,
    ) {
        table::remove(
            &mut req.claim_requirements,
            bound_check::key(&claim_req),
        );
    }

    fun destroy_claim_requirement<Cert: key + store>(
        req: CertRequirement<Cert>,
    ) {
        let CertRequirement { claim_requirements } = req;
        table::destroy_empty(claim_requirements);
    }

    public fun default_requirement<Cert: key + store>(ctx: &mut TxContext): CertRequirement<Cert> {
        CertRequirement<Cert> {
            claim_requirements: table::new(ctx),
        }
    }

    public fun new_requirement<Cert: key + store>(
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

    public fun new_presentation<Cert: key + store>(
        cert_requirement: CertRequirement<Cert>,
        claim_presentations: vector<ClaimPresentationBoundCheck>,
        ctx: &TxContext,
    ): CertPresentation<Cert> {
        let subject = tx_context::sender(ctx);

        let (i, len) = (0, length(&cert_requirement));

        while (i < len) {
            let claim_presentation = vector::pop_back(&mut claim_presentations);
            assert!(
                bound_check::subject(&claim_presentation) == subject,
                0
            );

            let claim_req = bound_check::request(&claim_presentation);
            remove_claim_requirement(&mut cert_requirement, claim_req);

            i = i + 1
        };

        assert!(length(&cert_requirement) == 0, 1);

        destroy_claim_requirement(cert_requirement);

        let cert_presentation = CertPresentation<Cert> {
            subject,
            is_verified: true,
        };

        cert_presentation
    }
}