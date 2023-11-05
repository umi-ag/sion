use bbs::{HashElem, SignatureMessage};
use candid::types::number::Nat;
use std::cell::RefCell;

mod bbs_utils;

thread_local! {
    static COUNTER: RefCell<Nat> = RefCell::new(Nat::from(0));
}

#[ic_cdk_macros::query]
fn verify_signature(signature_str: String, pk_str: String, messages: Vec<String>) -> bool {
    let pk = bbs_utils::pk_from_str(pk_str.to_string());
    let messages = messages
        .iter()
        .map(|m| SignatureMessage::hash(m.as_bytes()))
        .collect();

    let valid = bbs_utils::verify_signature(signature_str.to_string(), &pk, &messages);

    valid
}

/// Get the value of the counter.
#[ic_cdk_macros::query]
fn get() -> Nat {
    COUNTER.with(|counter| (*counter.borrow()).clone())
}

/// Set the value of the counter.
#[ic_cdk_macros::update]
fn set(n: Nat) {
    // COUNTER.replace(n);  // requires #![feature(local_key_cell_methods)]
    COUNTER.with(|count| *count.borrow_mut() = n);
}

/// Increment the value of the counter.
#[ic_cdk_macros::update]
fn increment() {
    COUNTER.with(|counter| *counter.borrow_mut() += 1);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_set() {
        let expected = Nat::from(42);
        set(expected.clone());
        assert_eq!(get(), expected);
    }

    #[test]
    fn test_init() {
        assert_eq!(get(), Nat::from(0));
    }

    #[test]
    fn test_inc() {
        for i in 1..10 {
            increment();
            assert_eq!(get(), Nat::from(i));
        }
    }
}
