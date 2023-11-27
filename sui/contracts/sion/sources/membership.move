module sion::membership {
    use std::string::{String};

    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::object::{Self, UID};
    use sui::table::{Self, Table};
    use sui::tx_context::{TxContext};

    friend sion::membership_registry;

    struct Membership has key, store {
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
        lower_bound_gte: u64,
        upper_bound_lt: u64,
        is_verified: bool,
    }

    public fun authenticator(self: &Membership): address {
        self.authenticator
    }

    public fun subject(self: &Membership): address {
        self.subject
    }

    public(friend) fun new(
        authenticator: address,
        subject: address,
        clock: &Clock,
        ctx: &mut TxContext
    ): Membership {
        Membership {
            id: object::new(ctx),
            subject,
            authenticator,
            created_at: clock::timestamp_ms(clock),
            claims_key_to_digest: table::new(ctx),
            claims_digest_to_key: table::new(ctx),
        }
    }

    public fun insert_claim(self: &mut Membership, key: String, digest: vector<u8>) {
        insert_claim_key_to_digest(self, key, digest);
        insert_claim_digest_to_key(self, key, digest);
    }

    fun insert_claim_key_to_digest(self: &mut Membership, key: String, digest: vector<u8>) {
        let exists = table::contains(&self.claims_key_to_digest, key);
        if (exists) {
            *table::borrow_mut(&mut self.claims_key_to_digest, key) = digest;
        } else {
            table::add(&mut self.claims_key_to_digest, key, digest);
        }
    }

    fun insert_claim_digest_to_key(self: &mut Membership, key: String, digest: vector<u8>) {
        let exists = table::contains(&self.claims_digest_to_key, digest);
        if (exists) {
            *table::borrow_mut(&mut self.claims_digest_to_key, digest) = key;
        } else {
            table::add(&mut self.claims_digest_to_key, digest, key);
        }
    }

    public fun remove_claim(self: &mut Membership, key: String) {
        let digest = table::remove(&mut self.claims_key_to_digest, key);
        table::remove(&mut self.claims_digest_to_key, digest);
    }

    public fun borrow_claim_digest_by_key(self: &Membership, key: String): &vector<u8> {
        table::borrow(&self.claims_key_to_digest, key)
    }

    public fun borrow_claim_key_by_digest(self: &Membership, digest: vector<u8>): &String {
        table::borrow(&self.claims_digest_to_key, digest)
    }

    public fun contains_claim_key(self: &Membership, key: String): bool {
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

    public fun contains_claim_digest(self: &Membership, digest: vector<u8>): bool {
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

    public fun length_claims(self: &Membership): u64 {
        table::length(&self.claims_key_to_digest)
    }

    public fun is_empty_claims(self: &Membership): bool {
        table::is_empty(&self.claims_key_to_digest) && table::is_empty(&self.claims_digest_to_key)
    }

    public fun bound_check(
        self: &Membership,
        key: String,
        lower_bound_gte: u64,
        upper_bound_lt: u64,
        proof: vector<u8>,
        vk: vector<u8>,
    ): bool {
        let digest = *borrow_claim_digest_by_key(self, key);
        let is_verified = sion::verifier::verify_hash_preimage_and_range_proof(
            digest,
            lower_bound_gte,
            upper_bound_lt,
            proof,
            vk,
        );
        event::emit(BoundCheckEvent {
            authenticator: self.authenticator,
            subject: self.subject,
            claim_key: key,
            claim_digest: digest,
            lower_bound_gte,
            upper_bound_lt,
            is_verified,
        });

        is_verified
    }
}