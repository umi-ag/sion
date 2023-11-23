module sion::membership_registry {
    use std::option::{Self, Option};

    use sui::clock::{Clock};
    use sui::event;
    use sui::object::{Self, ID, UID};
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    use sion::vc;

    #[test_only] use std::debug;


    struct MembershipRegistry has key, store{
        id: UID,
        authenticator: address,
        members: Table<address, ID>,
    }

    struct ContainsMemberEvent has copy, drop {
        authenticator: address,
        member: address,
        vc_id: Option<ID>,
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

    public fun get_vc_id(self: &MembershipRegistry, member: address): Option<ID> {
        let vc_id: Option<ID> = if (contains_member(self, member)) {
            let vc_id: ID = *table::borrow(&self.members, member);
            option::some(vc_id)
        } else {
            option::none()
        };

        event::emit(ContainsMemberEvent {
            authenticator: self.authenticator,
            member,
            vc_id,
        });
        vc_id
    }

    public fun insert_member(
        self: &mut MembershipRegistry,
        member: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let vc_id = get_vc_id(self, member);

        if (option::is_none(&vc_id)) {
            let id = insert_member_inner(self, member, clock, ctx);
            option::fill(&mut vc_id, id)
        };

        event::emit(ContainsMemberEvent {
            authenticator: self.authenticator,
            member,
            vc_id,
        });
    }

    fun insert_member_inner(
        self: &mut MembershipRegistry,
        member: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ): ID {
        let authenticator = tx_context::sender(ctx);
        let vc = vc::new(authenticator, member, clock, ctx);
        let vc_id = object::id(&vc);
        table::add(&mut self.members, member, vc_id);
        transfer::public_transfer(vc, authenticator);
        vc_id
    }

    public fun contains_member(self: &MembershipRegistry, member: address): bool {
        table::contains(&self.members, member)
    }
}