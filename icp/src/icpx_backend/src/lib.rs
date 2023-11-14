use candid::types::number::Nat;

use anoncreds::data_types::cred_def::CredentialDefinition;
use anoncreds::data_types::cred_def::CredentialDefinitionId;
use anoncreds::data_types::rev_reg_def::RevocationRegistryDefinitionId;
use anoncreds::data_types::schema::Schema;
use anoncreds::data_types::schema::SchemaId;
use anoncreds::issuer;
use anoncreds::prover;
use anoncreds::tails::TailsFileWriter;
use anoncreds::types::Presentation;
use anoncreds::types::PresentationRequest;
use anoncreds::types::{CredentialRevocationConfig, PresentCredentials};
use anoncreds::verifier;
use serde_json::json;

use std::collections::{BTreeSet, HashMap};

use serde::{Deserialize, Serialize};

// use bbs_plus::prelude::*;

use std::cell::RefCell;
// use std::collections::{BTreeSet, HashMap};

thread_local! {
    static COUNTER: RefCell<Nat> = RefCell::new(Nat::from(0));
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

///
// dbg!(&serde_json::to_string(&presentation));
// dbg!(&serde_json::to_string(&pres_request));
// dbg!(&serde_json::to_string(&schemas));
// dbg!(&serde_json::to_string(&cred_defs));
#[derive(Serialize, Deserialize, Debug)]
struct VPTuble {
    presentation: Presentation,
    pres_request: PresentationRequest,
    schemas: HashMap<SchemaId, Schema>,
    cred_defs: HashMap<CredentialDefinitionId, CredentialDefinition>,
}

#[ic_cdk_macros::query]
fn verify_vp(s: String) {
    let vp = serde_json::from_str::<VPTuble>(s.as_str()).unwrap();

    let valid = verifier::verify_presentation(
        &vp.presentation,
        &vp.pres_request,
        &vp.schemas,
        &vp.cred_defs,
        None,
        None,
        None,
    )
    .expect("Error verifying presentation");

    assert!(valid);
}
