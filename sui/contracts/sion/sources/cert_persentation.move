module sion::cert_presentation {
    use std::vector::{Self};

    use sui::tx_context::{Self, TxContext};

    use sion::bound_check::{Self, ClaimPresentationBoundCheck};
    use sion::cert_requirement::{Self, CertRequirement};


    struct CertPresentation<phantom Cert: key + store> has store {
        subject: address,
        is_verified: bool,
    }

    public fun new<Cert: key + store>(
        cert_requirement: CertRequirement<Cert>,
        claim_presentations: vector<ClaimPresentationBoundCheck>,
        ctx: &TxContext,
    ): CertPresentation<Cert> {
        let subject = tx_context::sender(ctx);

        let (i, len) = (0, cert_requirement::length(&cert_requirement));

        while (i < len) {
            let claim_presentation = vector::pop_back(&mut claim_presentations);
            assert!(
                bound_check::subject(&claim_presentation) == subject,
                0
            );

            let claim_req = bound_check::request(&claim_presentation);
            cert_requirement::remove_claim_requirement(&mut cert_requirement, claim_req);

            i = i + 1
        };

        assert!(cert_requirement::length(&cert_requirement) == 0, 1);

        cert_requirement::destroy_empty(cert_requirement);

        let cert_presentation = CertPresentation<Cert> {
            subject,
            is_verified: true,
        };

        cert_presentation
    }
}