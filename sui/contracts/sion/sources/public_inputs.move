module sion::public_inputs {
    use std::vector;

    use sui::bcs;

    #[test_only] use std::debug;

    struct PublicInputsArgs has copy, drop {
        expected_digest: vector<u8>,
        min: u64,
        max: u64,
    }

    public fun build_public_inputs_bytes(expected_digest: vector<u8>, min: u64, max: u64): vector<u8> {
        let args = new(expected_digest, min, max);
        to_bytes(&args)
    }

    public fun new(expected_digest: vector<u8>, min: u64, max: u64): PublicInputsArgs {
        PublicInputsArgs {
            expected_digest,
            min,
            max,
        }
    }

    public fun to_bytes(self: &PublicInputsArgs): vector<u8> {
        let digest = self.expected_digest;
        let last = vector::pop_back(&mut digest);
        let input_min = self.min;
        let input_max = self.max;

        let buffer = vector::empty<u8>();
        {
            let buf = vector::empty<u8>();
            vector::append(&mut buf, digest);
            vector::push_back(&mut buf, 0);

            vector::append(&mut buffer, buf);
        };
        {
            let buf = vector::empty<u8>();
            // For padding
            let bytes = to_le_bytes(&(last as u256));
            vector::append(&mut buf, bytes);

            vector::append(&mut buffer, buf);
        };
        {
            let buf = vector::empty<u8>();
            vector::append(&mut buf, to_le_bytes(&(input_min as u256)));

            vector::append(&mut buffer, buf);
        };
        {
            let buf = vector::empty<u8>();
            vector::append(&mut buf, to_le_bytes(&(input_max as u256)));

            vector::append(&mut buffer, buf);
        };

        buffer
    }


    fun to_le_bytes<T>(x: &T): vector<u8> {
        bcs::to_bytes<T>(x)
    }

    #[test]
    fun test_to_le_bytes() {
        let length: u64 = 4;

        // let go = bcs::to_bytes(&length);
        let go = to_le_bytes(&length);

        debug::print(&go);
    }

    #[test]
    fun test_ser() {
        let length: u64 = 4;
        let digest = x"f8fb6631bd135320c2e72f8769993271168050e4bbfc328d89a7b4743ea7abbf";

        let input_min: u64 = 0x1234;
        let input_max: u64 = 0xABCDEF;

        let min_bytes = to_le_bytes(&(input_min as u256));
        let max_bytes = to_le_bytes(&(input_max as u256));
        debug::print(&min_bytes);
        debug::print(&max_bytes);

        debug::print(&digest);
    }

    #[test]
    fun test_build() {
        let section_length: u8 = 4;
        let digest = x"2b596e4b230759a22d18592d73c889dc1f67b0d3ebc082f2c0c32bb379782edb";

        let last = vector::pop_back(&mut digest);
        let input_min: u64 = 0x1234;
        let input_max: u64 = 0xABCDEF;

        let buffer = vector::empty<u8>();
        {
            let bytes = to_le_bytes(&(section_length as u64));
            vector::append(&mut buffer, bytes);
        };
        {
            let buf = vector::empty<u8>();
            vector::append(&mut buf, digest);
            vector::push_back(&mut buf, 0);

            vector::append(&mut buffer, buf);
        };
        {
            let buf = vector::empty<u8>();
            // For padding
            let bytes = to_le_bytes(&(last as u256));
            vector::append(&mut buf, bytes);

            vector::append(&mut buffer, buf);
        };
        {
            let buf = vector::empty<u8>();
            vector::append(&mut buf, to_le_bytes(&(input_min as u256)));

            vector::append(&mut buffer, buf);
        };
        {
            let buf = vector::empty<u8>();
            vector::append(&mut buf, to_le_bytes(&(input_max as u256)));

            vector::append(&mut buffer, buf);
        };

        let expected = x"04000000000000002b596e4b230759a22d18592d73c889dc1f67b0d3ebc082f2c0c32bb379782e00db000000000000000000000000000000000000000000000000000000000000003412000000000000000000000000000000000000000000000000000000000000efcdab0000000000000000000000000000000000000000000000000000000000";
        let actual = buffer;
        assert!(expected == actual, 0);
    }
}