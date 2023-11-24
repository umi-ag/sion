module muzin::cert_issuer {
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::{String, utf8};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    use sion::membership::{Self, Membership};

    use muzin::consts;
    use muzin::driving_cert::{Self, DrivingCert};

    struct DrivingCertEvent has copy, drop {
        subject: address,
        color: String,
        updated_at: u64,
    }

    public fun issue_cert(
        name: String,
        description: String,
        img_url: String,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let subject = tx_context::sender(ctx);
        let color = utf8(b"white");
        let cert = driving_cert::new(
            name,
            description,
            img_url,
            color,
            subject,
            clock,
            ctx,
        );
        transfer::public_transfer(cert, subject);
    }

    public fun is_subject_match(
        cert: &DrivingCert,
        membership: &Membership,
    ): bool {
        driving_cert::subject(cert) == membership::subject(membership)
    }

    public fun update_cert_to_bronze(
        cert: &mut DrivingCert,
        membership: &Membership,
        proof: vector<u8>,
        vk: vector<u8>,
        clock: &Clock,
    ) {
        if (!isSubjectMatch(cert, membership)) {
            return
        };

        let subject = driving_cert::subject(cert);
        let is_qualified = is_qualified_for_bronze(membership, proof, vk);
        let color = if (is_qualified) { utf8(b"bronze") } else { driving_cert::color(cert) };

        driving_cert::update_color(cert, utf8(b"bronze"));
        event::emit(DrivingCertEvent {
            color,
            subject,
            updated_at: clock::timestamp_ms(clock),
        });
    }

    public fun is_qualified_for_bronze(
        membership: &Membership,
        proof: vector<u8>,
        vk: vector<u8>,
    ): bool {
        let is_verified_1 = membership::bound_check(
            membership,
            utf8(b"mileage"),
            100,
            consts::U64_MAX(),
            proof,
            vk,
        );

        let is_verified_2 = membership::bound_check(
            membership,
            utf8(b"hard_accelerations"),
            0,
            100,
            proof,
            vk,
        );

        is_verified_1 && is_verified_2
    }

}