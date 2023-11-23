module sion::vc {
    use sui::clock::{Self, Clock};
    use sui::object::{Self, UID};
    use std::string::{String};
    use sui::tx_context::{TxContext};
    use sui::table::{Self, Table};
    use sui::event;

    friend sion::membership_registry;

    struct VC has key, store {
        id: UID,
        authenticator: address, // issuer
        subject: address, // credential subject
        created_at: u64,
        claims_key_to_digest: Table<String, vector<u8>>,
        claims_digest_to_key: Table<vector<u8>, String>,
    }

    struct ContainsClaimEvent has copy, drop {
        authenticator: address,
        subject: address,
        claim_key: String,
        claim_digest:  vector<u8>,
        is_verified: bool,
    }

    struct BoundCheckEvent has copy, drop {
        authenticator: address,
        subject: address,
        claim_key: String,
        claim_digest:  vector<u8>,
        gte_bound: u64,
        lt_bound: u64,
        is_verified: bool,
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
        let exists = table::contains(&self.claims_key_to_digest, key);
        if (exists) {
            *table::borrow_mut(&mut self.claims_key_to_digest, key) = digest;
        } else {
            table::add(&mut self.claims_key_to_digest, key, digest);
        }
    }

    fun inseart_claim_digest_to_key(self: &mut VC, key: String, digest: vector<u8>) {
        let exists = table::contains(&self.claims_digest_to_key, digest);
        if (exists) {
            *table::borrow_mut(&mut self.claims_digest_to_key, digest) = key;
        } else {
            table::add(&mut self.claims_digest_to_key, digest, key);
        }
    }

    public fun remove_claim(self: &mut VC, key: String) {
        let digest = table::remove(&mut self.claims_key_to_digest, key);
        table::remove(&mut self.claims_digest_to_key, digest);
    }

    public fun borrow_claim_digest_by_key(self: &VC, key: String): &vector<u8> {
        table::borrow(&self.claims_key_to_digest, key)
    }

    public fun borrow_claim_key_by_digest(self: &VC, digest: vector<u8>): &String {
        table::borrow(&self.claims_digest_to_key, digest)
    }

    public fun contains_claim_key(self: &VC, key: String): bool {
        let exists = table::contains(&self.claims_key_to_digest, key);
        let digest = *borrow_claim_digest_by_key(self, key);

        event::emit(ContainsClaimEvent {
            authenticator: self.authenticator,
            subject: self.subject,
            claim_key: key,
            claim_digest: digest,
            is_verified: exists
        });
        exists
    }

    public fun contains_claim_digest(self: &VC, digest: vector<u8>): bool {
        let exists = table::contains(&self.claims_digest_to_key, digest);
        let key = *borrow_claim_key_by_digest(self, digest);

        event::emit(ContainsClaimEvent {
            authenticator: self.authenticator,
            subject: self.subject,
            claim_key: key,
            claim_digest: digest,
            is_verified: exists
        });
        exists
    }

    public fun length_claims(self: &VC): u64 {
        table::length(&self.claims_key_to_digest)
    }

    public fun is_empty_claims(self: &VC): bool {
        table::is_empty(&self.claims_key_to_digest) && table::is_empty(&self.claims_digest_to_key)
    }

    public fun bound_check(
        self: &VC,
        key: String,
        gte_bound: u64,
        lt_bound: u64,
        proof: vector<u8>,
        vk: vector<u8>,
    ): bool {
        let digest = *borrow_claim_digest_by_key(self, key);
        let is_verified = sion::verifier::verify_hash_preimage_and_range_proof(
            digest,
            gte_bound,
            lt_bound,
            proof,
            vk,
        );
        event::emit(BoundCheckEvent {
            authenticator: self.authenticator,
            subject: self.subject,
            claim_key: key,
            claim_digest: digest,
            gte_bound,
            lt_bound,
            is_verified,
        });

        is_verified
    }
}