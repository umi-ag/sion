module sion::vc {
    use sui::clock::{Self, Clock};
    use sui::object::{Self, UID};
    use std::string::{String};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::dynamic_field as df;


    struct VC has key, store {
        id: UID,
        created_at: u64,
        created_by: address,
    }

    public fun created_by(self: &VC): address {
        self.created_by
    }

    fun new(clock: &Clock, ctx: &mut TxContext): VC {
        VC {
            id: object::new(ctx),
            created_by: tx_context::sender(ctx),
            created_at: clock::timestamp_ms(clock),
        }
    }

    public fun create(clock: &Clock, ctx: &mut TxContext) {
        let vc = new(clock, ctx);
        transfer::public_transfer(vc, tx_context::sender(ctx));
    }

    public fun add_field(self: &mut VC, key: String, value: vector<u8>) {
        df::add(&mut self.id, key, value);
    }

    public fun get_field(self: &VC, key: String): &vector<u8> {
        df::borrow(&self.id, key)
    }

    public fun update_field(self: &mut VC, key: String, value: vector<u8>) {
        *df::borrow_mut(&mut self.id, key) = value;
    }
}