use anoncreds::data_types::cred_def::CredentialDefinitionId;
use anoncreds::data_types::rev_reg_def::RevocationRegistryDefinitionId;
use anoncreds::data_types::schema::SchemaId;
use anoncreds::issuer;
use anoncreds::prover;
use anoncreds::tails::TailsFileWriter;
use anoncreds::types::{CredentialRevocationConfig, PresentCredentials};
use anoncreds::verifier;
use serde_json::json;
use std::collections::{BTreeSet, HashMap};

use utils::*;
mod utils;

#[test]
fn anoncreds_demo_works_for_single_issuer_single_prover() {
    // Create Prover pseudo wallet and link secret
    let mut prover_wallet = ProverWallet::default();

    // Create schema
    let (gvt_schema, gvt_schema_id) = fixtures::create_schema("GVT");

    // Create credential definition
    let ((gvt_cred_def, gvt_cred_def_priv, gvt_cred_key_correctness_proof), gvt_cred_def_id) =
        fixtures::create_cred_def(&gvt_schema, false);

    // Issuer creates a Credential Offer
    let cred_offer = issuer::create_credential_offer(
        gvt_schema_id.try_into().unwrap(),
        gvt_cred_def_id.try_into().unwrap(),
        &gvt_cred_key_correctness_proof,
    )
    .expect("Error creating credential offer");

    // Prover creates a Credential Request
    let (cred_request, cred_request_metadata) = prover::create_credential_request(
        Some("entropy"),
        None,
        &gvt_cred_def,
        &prover_wallet.link_secret,
        "default",
        &cred_offer,
    )
    .expect("Error creating credential request");

    // Issuer creates a credential
    let cred_values = fixtures::credential_values("GVT");
    let issue_cred = issuer::create_credential(
        &gvt_cred_def,
        &gvt_cred_def_priv,
        &cred_offer,
        &cred_request,
        cred_values.into(),
        None,
    )
    .expect("Error creating credential");

    // Prover receives the credential and processes it
    let mut recv_cred = issue_cred;
    prover::process_credential(
        &mut recv_cred,
        &cred_request_metadata,
        &prover_wallet.link_secret,
        &gvt_cred_def,
        None,
    )
    .expect("Error processing credential");
    prover_wallet.credentials.push(recv_cred);

    // Verifier creates a presentation request
    let nonce = verifier::generate_nonce().expect("Error generating presentation request nonce");
    let pres_request = serde_json::from_value(json!({
        "nonce": nonce,
        "name":"pres_req_1",
        "version":"0.1",
        "requested_attributes":{
            "attr1_referent":{
                "name":"name"
            },
            "attr2_referent":{
                "name":"sex"
            },
            "attr3_referent":{"name":"phone"},
            "attr4_referent":{
                "names": ["name", "height"]
            }
        },
        "requested_predicates":{
            "predicate1_referent":{"name":"age","p_type":">=","p_value":18}
        }
    }))
    .expect("Error creating proof request");

    // TODO: show deriving the wallet query from the proof request (need to add helper)

    // Prover creates presentation
    let mut present = PresentCredentials::default();
    {
        let mut cred1 = present.add_credential(&prover_wallet.credentials[0], None, None);
        cred1.add_requested_attribute("attr1_referent", true);
        cred1.add_requested_attribute("attr2_referent", false);
        cred1.add_requested_attribute("attr4_referent", true);
        cred1.add_requested_predicate("predicate1_referent");
    }

    let mut self_attested = HashMap::new();
    let self_attested_phone = "8-800-300";
    self_attested.insert(
        "attr3_referent".to_string(),
        self_attested_phone.to_string(),
    );

    let mut schemas = HashMap::new();
    let gvt_schema_id = SchemaId::new_unchecked(gvt_schema_id);
    schemas.insert(gvt_schema_id, gvt_schema.clone());

    let mut cred_defs = HashMap::new();
    let gvt_cred_def_id = CredentialDefinitionId::new_unchecked(gvt_cred_def_id);
    cred_defs.insert(gvt_cred_def_id, gvt_cred_def.try_clone().unwrap());

    let presentation = prover::create_presentation(
        &pres_request,
        present,
        Some(self_attested),
        &prover_wallet.link_secret,
        &schemas,
        &cred_defs,
    )
    .expect("Error creating presentation");

    // Verifier verifies presentation
    assert_eq!(
        "Alex",
        presentation
            .requested_proof
            .revealed_attrs
            .get("attr1_referent")
            .unwrap()
            .raw
    );

    assert_eq!(
        0,
        presentation
            .requested_proof
            .unrevealed_attrs
            .get("attr2_referent")
            .unwrap()
            .sub_proof_index
    );

    assert_eq!(
        self_attested_phone,
        presentation
            .requested_proof
            .self_attested_attrs
            .get("attr3_referent")
            .unwrap()
    );

    let revealed_attr_groups = presentation
        .requested_proof
        .revealed_attr_groups
        .get("attr4_referent")
        .unwrap();

    assert_eq!("Alex", revealed_attr_groups.values.get("name").unwrap().raw);

    assert_eq!(
        "175",
        revealed_attr_groups.values.get("height").unwrap().raw
    );

    let valid = verifier::verify_presentation(
        &presentation,
        &pres_request,
        &schemas,
        &cred_defs,
        None,
        None,
        None,
    )
    .expect("Error verifying presentation");

    assert!(valid);
}
