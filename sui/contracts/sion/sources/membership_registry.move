module sion::membership_registry {
    use sui::clock::{Self, Clock};
    use sui::object::{Self, UID};
    use std::string::{String};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::dynamic_field as df;
    use sui::table::{Self, Table};

    use sion::vc::{Self, VC};

    struct MembershipRegistry has key, store{
        id: UID,
        authenticator: address,
        members: Table<address, VC>,
    }

    fun new(authenticator: address, ctx: &mut TxContext): MembershipRegistry {
        MembershipRegistry {
            id: object::new(ctx),
            authenticator,
            members: table::new(ctx),
        }
    }

    public fun create(ctx: &mut TxContext) {
        let authenticator = tx_context::sender(ctx);
        let registry = new(authenticator, ctx);
        transfer::public_transfer(registry, authenticator);
    }

    public fun register_member(
        self: &mut MembershipRegistry,
        member: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let authenticator = tx_context::sender(ctx);
        let vc = vc::new(authenticator, member, clock, ctx);
        table::add(&mut self.members, member, vc);
    }
}