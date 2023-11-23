module sion::membership_pointer {
    use sui::clock::{Self, Clock};
    use sui::object::{Self, ID, UID};
    use std::string::{String};
    use sui::tx_context::{TxContext};
    use sui::table::{Self, Table};
    use sui::event;

    friend sion::membership_registry;

    struct MembershipPointer has key, store {
        id: UID,
        membership_id: ID,
        authenticator: address, // issuer
        subject: address, // credential subject
    }

    public fun membership_id(self: &MembershipPointer): ID {
        self.membership_id
    }

    public fun authenticator(self: &MembershipPointer): address {
        self.authenticator
    }

    public fun subject(self: &MembershipPointer): address {
        self.subject
    }

    public(friend) fun new(
        membership_id: ID,
        authenticator: address,
        subject: address,
        ctx: &mut TxContext
    ): MembershipPointer {
        MembershipPointer {
            id: object::new(ctx),
            membership_id,
            authenticator,
            subject,
        }
    }
}