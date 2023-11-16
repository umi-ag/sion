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
use std::fs::File;
use std::io::Result;
use std::io::Write;

use serde::{Deserialize, Serialize};

use utils::*;
mod utils;

fn write_to_file(filename: &str, content: &str) -> Result<()> {
    let mut file = File::create(filename)?;
    file.write_all(content.as_bytes())?;
    Ok(())
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

fn gen_vp() -> String {
    dbg!("#l00");
    // Create Prover pseudo wallet and link secret
    let mut prover_wallet = ProverWallet::default();
    dbg!("#l01");

    // Create schema
    let (gvt_schema, gvt_schema_id) = fixtures::create_schema("GVT");
    dbg!("#l02");

    // Create credential definition
    let ((gvt_cred_def, gvt_cred_def_priv, gvt_cred_key_correctness_proof), gvt_cred_def_id) =
        fixtures::create_cred_def(&gvt_schema, false);
    dbg!("#l03");

    dbg!(
        &gvt_cred_def,
        &gvt_cred_def_priv,
        &gvt_cred_key_correctness_proof,
        &gvt_cred_def_id
    );

    // Issuer creates a Credential Offer
    let cred_offer = issuer::create_credential_offer(
        gvt_schema_id.try_into().unwrap(),
        gvt_cred_def_id.try_into().unwrap(),
        &gvt_cred_key_correctness_proof,
    )
    .expect("Error creating credential offer");
    dbg!("#l04");

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
    dbg!("#200");

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

    dbg!("#201");

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

    dbg!("#202");

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

    dbg!("#203");

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

    dbg!("#205");
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

    dbg!(&presentation);

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

    dbg!(&serde_json::to_string(&presentation));
    dbg!(&serde_json::to_string(&pres_request));
    dbg!(&serde_json::to_string(&schemas));
    dbg!(&serde_json::to_string(&cred_defs));

    let vp = VPTuble {
        presentation,
        pres_request,
        schemas,
        cred_defs,
    };

    serde_json::to_string(&vp).unwrap()
}

fn main() {
    let s = gen_vp();
    println!("{}", &s);
    write_to_file("output.json", &s).unwrap();
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
