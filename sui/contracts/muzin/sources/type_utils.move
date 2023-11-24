// https://github.com/kunalabs-io/sui-smart-contracts/blob/0edf8b2422c40c350356e91671b0689511f9c798/amm/sources/pool.move#L108C1-L143C6

module muzin::type_utils {
    use std::vector;
    use std::type_name::{Self, TypeName};
    use sui::math;


    public fun eq_types<S, T>(): bool {
        let type_s = type_name::get<S>();
        let type_t = type_name::get<T>();
        cmp_type_names(&type_s, &type_t) == 1
    }

    // returns:
    //    0 if a < b,
    //    1 if a == b,
    //    2 if a > b
    public fun cmp_types<S, T>(): u8 {
        let type_s = type_name::get<S>();
        let type_t = type_name::get<T>();
        cmp_type_names(&type_s, &type_t)
    }

    // returns:
    //    0 if a < b,
    //    1 if a == b,
    //    2 if a > b
    public fun cmp_type_names(a: &TypeName, b: &TypeName): u8 {
        let bytes_a = std::ascii::as_bytes(type_name::borrow_string(a));
        let bytes_b = std::ascii::as_bytes(type_name::borrow_string(b));

        let len_a = vector::length(bytes_a);
        let len_b = vector::length(bytes_b);

        let i = 0;
        let n = math::min(len_a, len_b);
        while (i < n) {
            let a = *vector::borrow(bytes_a, i);
            let b = *vector::borrow(bytes_b, i);

            if (a < b) {
                return 0
            };
            if (a > b) {
                return 2
            };
            i = i + 1;
        };

        if (len_a == len_b) {
            return 1
        };

        return if (len_a < len_b) {
            0
        } else {
            2
        }
    }
}
