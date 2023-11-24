module coinhouse::susdc {
    use std::option;

    use sui::coin::{Self, Coin, TreasuryCap, CoinMetadata};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};

    struct SUSDC has drop {}

    struct EventMint has copy, drop {
        amount: u64,
        user: address
    }

    struct EventBurn has copy, drop {
        amount: u64,
        user: address
    }

    fun init(witness: SUSDC, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = new(witness, ctx);
        transfer::public_freeze_object(metadata);
        transfer::public_share_object(treasury_cap);
    }

    fun new<X: drop>(witness: X, ctx: &mut TxContext)
    : (TreasuryCap<X>, CoinMetadata<X>) {
        let icon_url = b"https://app.scallop.io/assets/sUSDC-8cd2f058.png";
        let (treasury_cap, metadata) = coin::create_currency(
            witness, 8,
            b"sUSDC",
            b"sUSDC",
            b"USDC staked in Scallop",
            option::some<Url>(url::new_unsafe_from_bytes(icon_url)),
            ctx,
        );

        (treasury_cap, metadata)
    }

    public fun total_supply(treasury_cap: &TreasuryCap<SUSDC>): u64 {
        coin::total_supply(treasury_cap)
    }

    public fun mint(
        treasury_cap: &mut TreasuryCap<SUSDC>,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<SUSDC> {
        event::emit(EventMint { amount: amount, user: tx_context::sender(ctx) });
        coin::mint(treasury_cap, amount, ctx)
    }

    public fun burn(
        treasury_cap: &mut TreasuryCap<SUSDC>,
        coin: Coin<SUSDC>,
        ctx: &mut TxContext
    ) {
        event::emit(EventBurn { amount: coin::value(&coin), user: tx_context::sender(ctx) });
        coin::burn(treasury_cap, coin);
    }

    public fun transfer(treasury_cap: TreasuryCap<SUSDC>, recipient: address) {
        transfer::public_transfer(treasury_cap, recipient);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(SUSDC {}, ctx);
    }
}
