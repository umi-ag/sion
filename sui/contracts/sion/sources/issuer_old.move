module sion::issuer_old {
    use sui::clock::{Self, Clock};
    use sui::object::{Self, UID};
    use std::string::{String};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};


    struct Membership has key, store {
        id: UID,
        vin: String,
        odometer_reading: u64,
        fuel_usage: u64,
        created_at: u64,
        created_by: address,
    }

    fun new(vin: String, odometer_reading: u64, fuel_usage: u64, clock: &Clock, ctx: &mut TxContext): Membership {
        Membership {
            id: object::new(ctx),
            vin, odometer_reading, fuel_usage,
            created_by: tx_context::sender(ctx),
            created_at: clock::timestamp_ms(clock),
        }
    }

    public fun create(vin: String, odometer_reading: u64, fuel_usage: u64, clock: &Clock, ctx: &mut TxContext) {
        let vc = new(vin, odometer_reading, fuel_usage, clock, ctx);
        transfer::public_transfer(vc, tx_context::sender(ctx));
    }

    public fun update(self: &mut Membership, odometer_reading: u64, fuel_usage: u64) {
        self.odometer_reading = odometer_reading;
        self.fuel_usage = fuel_usage;
    }
}