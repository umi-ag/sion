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
        authenticator: address, // issuer
        subject: address, // credential subject
        created_at: u64,
        claims_key_to_digest: Table<String, vector<u8>>,
        claims_digest_to_key: Table<vector<u8>, String>,
    }

    public fun authenticator(self: &VC): address {
        self.authenticator
    }

    public fun subject(self: &VC): address {
        self.subject
    }

    public(friend) fun new(
        authenticator: address,
        subject: address,
        clock: &Clock,
        ctx: &mut TxContext
    ): VC {
        VC {
            id: object::new(ctx),
            subject,
            authenticator,
            created_at: clock::timestamp_ms(clock),
            claims_key_to_digest: table::new(ctx),
            claims_digest_to_key: table::new(ctx),
        }
    }

    public fun inseart_claim(self: &mut VC, key: String, digest: vector<u8>) {
        inseart_claim_key_to_digest(self, key, digest);
        inseart_claim_digest_to_key(self, key, digest);
    }

    fun inseart_claim_key_to_digest(self: &mut VC, key: String, digest: vector<u8>) {
        if (contains_claim_key(self, key)) {
            *table::borrow_mut(&mut self.claims_key_to_digest, key) = digest;
        } else {
            table::add(&mut self.claims_key_to_digest, key, digest);
        }
    }

    fun inseart_claim_digest_to_key(self: &mut VC, key: String, digest: vector<u8>) {
        if (contains_claim_digest(self, digest)) {
            *table::borrow_mut(&mut self.claims_digest_to_key, digest) = key;
        } else {
            table::add(&mut self.claims_digest_to_key, digest, key);
        }
    }

    public fun remove_claim(self: &mut VC, key: String) {
        let digest = table::remove(&mut self.claims_key_to_digest, key);
        table::remove(&mut self.claims_digest_to_key, digest);
    }

    public fun contains_claim_key(self: &mut VC, key: String): bool {
        table::contains(&self.claims_key_to_digest, key)
    }

    public fun contains_claim_digest(self: &mut VC, digest: vector<u8>): bool {
        table::contains(&self.claims_digest_to_key, digest)
    }

    public fun length_claims(self: &VC): u64 {
        table::length(&self.claims_key_to_digest)
    }

    public fun is_empty_claims(self: &VC): bool {
        table::is_empty(&self.claims_key_to_digest) && table::is_empty(&self.claims_digest_to_key)
    }
}