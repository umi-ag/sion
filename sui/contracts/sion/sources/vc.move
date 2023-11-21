module sion::vc {
    use sui::clock::{Self, Clock};
    use sui::object::{Self, UID};
    use std::string::{String};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::dynamic_field as df;
    use sui::table::{Self, Table};

    friend sion::membership_registry;

    struct VC has key, store {
        id: UID,
        authenticator: address,
        authenticatee: address,
        created_at: u64,
        claims: Table<String, vector<u8>>,
    }

    public fun authenticator(self: &VC): address {
        self.authenticator
    }

    public fun authenticatee(self: &VC): address {
        self.authenticatee
    }

    public(friend) fun new(
        authenticator: address,
        authenticatee: address,
        clock: &Clock,
        ctx: &mut TxContext
    ): VC {
        VC {
            id: object::new(ctx),
            authenticatee,
            authenticator,
            created_at: clock::timestamp_ms(clock),
            claims: table::new(ctx),
        }
    }

    public fun add_claim(self: &mut VC, key: String, digest: vector<u8>) {
        table::add(&mut self.claims, key, digest);
    }

    public fun borrow_claim(self: &VC, key: String): &vector<u8> {
        table::borrow(&self.claims, key)
    }

    public fun borrow_mut_claim(self: &mut VC, key: String): &mut vector<u8> {
        table::borrow_mut(&mut self.claims, key)
    }

    public fun update_claim(self: &mut VC, key: String, digest: vector<u8>) {
        *borrow_mut_claim(self, key) = digest;
    }

    public fun remove_claim(self: &mut VC, key: String): vector<u8> {
        table::remove(&mut self.claims, key)
    }

    public fun contains_claim(self: &mut VC, key: String): bool {
        table::contains(&self.claims, key)
    }

    public fun length_claims(self: &VC): u64 {
        table::length(&self.claims)
    }

    public fun is_empty_claims(self: &VC): bool {
        table::is_empty(&self.claims)
    }
}