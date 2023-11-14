#![cfg_attr(not(feature = "std"), no_std, no_main)]

// https://github.com/paritytech/ink-examples/blob/cba01f7b80ed54b0c19fc977b1dcc81fe4a10737/basic_contract_caller/other_contract/lib.rs
// For cross contract calls
pub use self::counter::CounterRef;

#[ink::contract]
mod counter {
    #[ink(storage)]
    pub struct Counter {
        value: u32,
    }

    impl Counter {
        // #[ink(message)]
        // pub fn verify_signature(
        //     &self,
        //     signature_str: String,
        //     pk_str: String,
        //     messages: Vec<String>,
        // ) -> bool {
        //     let msgs: Vec<&str> = messages.iter().map(AsRef::as_ref).collect();
        //     let valid =
        //         sion::entry::verify_signature(signature_str.as_str(), pk_str.as_str(), &msgs);
        //     valid
        // }

        // #[ink(message)]
        // pub fn verify_proof(
        //     &self,
        //     proof_str: String,
        //     proof_request_str: String,
        //     nonce_str: String,
        //     challenge_hash: String,
        // ) -> bool {
        //     let valid = sion::entry::verify_proof(
        //         proof_str.as_str(),
        //         proof_request_str.as_str(),
        //         nonce_str.as_str(),
        //         challenge_hash.as_str(),
        //         &[],
        //     );
        //     valid
        // }

        #[ink(constructor)]
        pub fn new(init_value: u32) -> Self {
            Self { value: init_value }
        }

        #[ink(constructor)]
        pub fn new_default() -> Self {
            Self::new(Default::default())
        }

        #[ink(message)]
        pub fn increment(&mut self, by: u32) {
            self.value += by;
        }

        #[ink(message)]
        pub fn decrement(&mut self, by: u32) {
            if by >= self.value {
                self.value -= by;
            }
        }

        #[ink(message)]
        pub fn get(&self) -> u32 {
            self.value
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn default_works() {
            let contract = Counter::new_default();
            assert_eq!(contract.get(), 0);
        }

        #[ink::test]
        fn it_works() {
            let mut contract = Counter::new(42);
            assert_eq!(contract.get(), 42);
            contract.increment(5);
            assert_eq!(contract.get(), 47);
        }
    }
}
