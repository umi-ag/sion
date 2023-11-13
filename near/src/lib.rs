// Find all our documentation at https://docs.near.org
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::env::log_str;
use near_sdk::near_bindgen;

// Define the contract structure
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    count: u64,
}

// Define the default, which automatically initializes the contract
impl Default for Contract {
    fn default() -> Self {
        Self { count: 0 }
    }
}

// Implement the contract structure
#[near_bindgen]
impl Contract {
    // Public method - returns the greeting saved, defaulting to DEFAULT_GREETING
    pub fn get_count(&self) -> u64 {
        return self.count;
    }

    pub fn increment(&mut self, x: u64) {
        self.count += x;
    }

    pub fn decrement(&mut self) {
        if self.count > 0 {
            self.count -= 1;
        }
    }
}
