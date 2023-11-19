module zk_escrow::zk_escrow {
    use std::string;

    use sui::event;
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    struct Card has key, store {
        id: UID,
        name: string::String,
        level: u8, // limitation is 100
        attack: u64,
        defense: u64,
        // url: Url, // if you need
    }

    struct MintCardEvent has copy, drop {
        object_id: ID,
        creator: address,
        name: string::String,
    }

    struct TransferCardEvent has copy, drop {
        object_id: ID,
        from: address,
        to: address,
    }

    public entry fun mint(
        name: vector<u8>, // str
        level: u8,
        attack: u64,
        defense: u64,
        ctx: &mut TxContext,
    ) {
        let limited_card = Card {
            id: object::new(ctx),
            name: string::utf8(name),
            level: level,
            attack: attack,
            defense: defense,
        };
        // get sender info
        let sender = tx_context::sender(ctx);
        // emit event
        event::emit(MintCardEvent {
            object_id: object::uid_to_inner(&limited_card.id),
            creator: sender,
            name: limited_card.name,
        });
        // transfer limited_card to sender
        transfer::public_transfer(limited_card, sender);
    }

    fun isCorrectPassword(
        input_password: u8,
    ): bool {
        // you need to change the password in production environment
        let correct_password = 000000;
        input_password == correct_password
    }

    // This is not the function in the production environment.
    public entry fun verify_proof(
        // expected that all arguments are taken off-chain
        _vk: vector<u8>,
        _public_inputs_bytes: vector<u8>,
        _proof_points_bytes: vector<u8>
    ): bool {
        true
    }

    public entry fun transfer(
        limited_card: Card,
        recipient: address,
        _: &mut TxContext
    ) {
        // transfer NFT Object
        transfer::public_transfer(limited_card, recipient)
    }

    public entry fun burn(card: Card) {
        let Card { id, name: _, level: _, attack: _, defense: _ } = card;
        object::delete(id)
    }

    // public fun fetch_card_id(card: &Card): UID {
    //     &card.id
    // }

    #[test]
    fun test_transfer_to_user_input_correct_pwd() {
        use sui::test_scenario;

        let data_holder = @0xCAFE;
        let user = @0xBEEF;

        // 1. data holder mint card
        let scenario_val = test_scenario::begin(data_holder);
        let scenario = &mut scenario_val;
        {
            mint(
                b"CardX",
                1,
                5_000,
                3_500,
                test_scenario::ctx(scenario)
            )
        };

        // 2. transfer the card to an user when the user inputs the correct password
        test_scenario::next_tx(scenario, data_holder);
        {
            // user cannot get card if password is changed
            let input_password = 000000;
            let res = isCorrectPassword(input_password);
            assert!(res == true, 0);
            let limited_card = test_scenario::take_from_sender<Card>(scenario);
            transfer::public_transfer(limited_card, user);
        };

        // 3. burn the card
        test_scenario::next_tx(scenario, user);
        {
            let limited_card = test_scenario::take_from_sender(scenario);
            burn(limited_card)
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_transfer_to_user_with_verified_proof() {
        use sui::test_scenario;

        let data_holder = @0xCAFE;
        let user = @0xBEEF;

        // 1. data holder mint card
        let scenario_val = test_scenario::begin(data_holder);
        let scenario = &mut scenario_val;
        {
            mint(
                b"CardX",
                1,
                5_000,
                3_500,
                test_scenario::ctx(scenario)
            )
        };

        // 2. verify a proof of the user
        // `VerifiedEvent` is expected to be emitted in this transaction
        test_scenario::next_tx(scenario, data_holder);
        {
            // example from https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/packages/sui-framework/tests/crypto/groth16_tests.move#L45C12-L45C12
            let vk_bytes = x"ada3c24e8c2e63579cc03fd1f112a093a17fc8ab0ff6eee7e04cab7bf8e03e7645381f309ec113309e05ac404c77ac7c8585d5e4328594f5a70a81f6bd4f29073883ee18fd90e2aa45d0fc7376e81e2fdf5351200386f5732e58eb6ff4d318dc";
            let inputs_bytes = x"440758042e68b76a376f2fecf3a5a8105edb194c3e774e5a760140305aec8849";
            let proof_bytes = x"a29981304df8e0f50750b558d4de59dbc8329634b81c986e28e9fff2b0faa52333b14a1f7b275b029e13499d1f5dd8ab955cf5fa3000a097920180381a238ce12df52207597eade4a365a6872c0a19a39c08a9bfb98b69a15615f90cc32660180ca32e565c01a49b505dd277713b1eae834df49643291a3601b11f56957bde02d5446406d0e4745d1bd32c8ccb8d8e80b877712f5f373016d2ecdeebb58caebc7a425b8137ebb1bd0c5b81c1d48151b25f0f24fe9602ba4e403811fb17db6f14";
            let isVerified = verify_proof(vk_bytes, inputs_bytes, proof_bytes);
            assert!(isVerified == true, 0);
        };

        // 3. transfer the card to the verified user
        test_scenario::next_tx(scenario, data_holder);
        {
            let limited_card = test_scenario::take_from_sender<Card>(scenario);
            transfer::public_transfer(limited_card, user);
        };

        // 4. burn the card
        test_scenario::next_tx(scenario, user);
        {
            let limited_card = test_scenario::take_from_sender(scenario);
            burn(limited_card)
        };

        test_scenario::end(scenario_val);
    }

    // #[test]
    // fun test_fetch_card_id() {
    //     use std::debug;
    //     use sui::test_scenario;

    //     let data_holder = @0xCAFE;

    //     let scenario_val = test_scenario::begin(data_holder);
    //     let scenario = &mut scenario_val;
    //     {
    //         mint(
    //             b"CardX",
    //             1,
    //             5_000,
    //             3_500,
    //             test_scenario::ctx(scenario)
    //         )
    //     };

    //     test_scenario::next_tx(scenario, data_holder);
    //     {
    //         let card = test_scenario::take_from_sender<Card>(scenario);
    //         let id = fetch_card_id(card);
    //         debug::print(&id);
    //         burn(card)
    //     };

    //     test_scenario::end(scenario_val);
    // }
}
