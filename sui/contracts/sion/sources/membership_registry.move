module sion::membership_registry {
    use std::option::{Self, Option};

    use sui::clock::{Clock};
    use sui::event;
    use sui::object::{Self, ID, UID};
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    use sion::membership;
    use sion::membership_pointer;

    #[test_only] use std::debug;


    struct MembershipRegistry has key, store{
        id: UID,
        authenticator: address,
        members: Table<address, ID>,
    }

    struct ContainsMemberEvent has copy, drop {
        authenticator: address,
        member: address,
        membership_id: Option<ID>,
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

    public fun get_membership_id(self: &MembershipRegistry, member: address): Option<ID> {
        let membership_id: Option<ID> = if (contains_member(self, member)) {
            let membership_id: ID = *table::borrow(&self.members, member);
            option::some(membership_id)
        } else {
            option::none()
        };

        event::emit(ContainsMemberEvent {
            authenticator: self.authenticator,
            member,
            membership_id,
        });
        membership_id
    }

    public fun insert_member(
        self: &mut MembershipRegistry,
        member: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let membership_id = get_membership_id(self, member);

        if (option::is_none(&membership_id)) {
            let id = insert_member_inner(self, member, clock, ctx);
            option::fill(&mut membership_id, id)
        };

        event::emit(ContainsMemberEvent {
            authenticator: self.authenticator,
            member,
            membership_id,
        });
    }

    fun insert_member_inner(
        self: &mut MembershipRegistry,
        member: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ): ID {
        let authenticator = tx_context::sender(ctx);

        let membership = membership::new(authenticator, member, clock, ctx);
        let membership_id = object::id(&membership);
        let membership_pointer = membership_pointer::new(membership_id, authenticator, member, ctx);

        table::add(&mut self.members, member, membership_id);
        transfer::public_transfer(membership, authenticator);
        transfer::public_transfer(membership_pointer, member);
        membership_id
    }

    public fun contains_member(self: &MembershipRegistry, member: address): bool {
        table::contains(&self.members, member)
    }
}