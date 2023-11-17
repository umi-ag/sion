use base64::Engine;
use blsful::inner_types::*;
use credx::blind::BlindCredentialRequest;
use credx::claim::{
    ClaimType, ClaimValidator, HashedClaim, NumberClaim, RevocationClaim, ScalarClaim,
};
use credx::credential::{ClaimSchema, CredentialSchema};
use credx::error::Error;
use credx::issuer::Issuer;
use credx::prelude::{
    MembershipClaim, MembershipCredential, MembershipRegistry, MembershipSigningKey,
    MembershipStatement, MembershipVerificationKey,
};
use credx::presentation::{Presentation, PresentationSchema};
use credx::statement::{
    CommitmentStatement, RangeStatement, RevocationStatement, SignatureStatement,
    VerifiableEncryptionStatement,
};
use credx::{random_string, CredxResult};
use indexmap::indexmap;
use maplit::{btreemap, btreeset};
use rand::thread_rng;
use rand_core::RngCore;
use regex::Regex;
use sha2;
use std::fs::File;
use std::io::Write;
use std::time::Instant;

fn main() {
    let res = test_presentation_1_credential_works();
    assert!(res.is_ok(), "{:?}", res);
}

fn test_presentation_1_credential_works() -> CredxResult<()> {
    const LABEL: &str = "Test Schema";
    const DESCRIPTION: &str = "This is a test presentation schema";
    const CRED_ID: &str = "91742856-6eda-45fb-a709-d22ebb5ec8a5";
    let schema_claims = [
        ClaimSchema {
            claim_type: ClaimType::Revocation,
            label: "identifier".to_string(),
            print_friendly: false,
            validators: vec![],
        },
        ClaimSchema {
            claim_type: ClaimType::Hashed,
            label: "name".to_string(),
            print_friendly: true,
            validators: vec![ClaimValidator::Length {
                min: Some(3),
                max: Some(u8::MAX as usize),
            }],
        },
        ClaimSchema {
            claim_type: ClaimType::Hashed,
            label: "address".to_string(),
            print_friendly: true,
            validators: vec![ClaimValidator::Length {
                min: None,
                max: Some(u8::MAX as usize),
            }],
        },
        ClaimSchema {
            claim_type: ClaimType::Number,
            label: "age".to_string(),
            print_friendly: true,
            validators: vec![ClaimValidator::Range {
                min: Some(0),
                max: Some(u16::MAX as isize),
            }],
        },
    ];
    let cred_schema = CredentialSchema::new(Some(LABEL), Some(DESCRIPTION), &[], &schema_claims)?;

    let before = Instant::now();
    let (issuer_public, mut issuer) = Issuer::new(&cred_schema);
    println!("key generation time = {:?}", before.elapsed());

    let before = std::time::Instant::now();
    let credential = issuer.sign_credential(&[
        RevocationClaim::from(CRED_ID).into(),
        HashedClaim::from("John Doe").into(),
        HashedClaim::from("P Sherman 42 Wallaby Way Sydney").into(),
        NumberClaim::from(30303).into(),
    ])?;
    println!("sign credential {:?}", before.elapsed());

    let dummy_sk = MembershipSigningKey::new(None);
    let dummy_vk = MembershipVerificationKey::from(&dummy_sk);
    let dummy_registry = MembershipRegistry::random(thread_rng());
    let dummy_membership_credential = MembershipCredential::new(
        MembershipClaim::from(&credential.credential.claims[2]).0,
        dummy_registry,
        &dummy_sk,
    );

    let sig_st = SignatureStatement {
        disclosed: btreeset! {"name".to_string()},
        id: random_string(16, rand::thread_rng()),
        issuer: issuer_public.clone(),
    };
    let acc_st = RevocationStatement {
        id: random_string(16, rand::thread_rng()),
        reference_id: sig_st.id.clone(),
        accumulator: issuer_public.revocation_registry,
        verification_key: issuer_public.revocation_verifying_key,
        claim: 0,
    };
    let comm_st = CommitmentStatement {
        id: random_string(16, rand::thread_rng()),
        reference_id: sig_st.id.clone(),
        message_generator: G1Projective::hash::<ExpandMsgXmd<sha2::Sha256>>(
            b"message generator",
            b"BLS12381G1_XMD:SHA-256_SSWU_RO_",
        ),
        blinder_generator: G1Projective::hash::<ExpandMsgXmd<sha2::Sha256>>(
            b"blinder generator",
            b"BLS12381G1_XMD:SHA-256_SSWU_RO_",
        ),
        claim: 3,
    };
    let verenc_st = VerifiableEncryptionStatement {
        message_generator: G1Projective::GENERATOR,
        encryption_key: issuer_public.verifiable_encryption_key,
        id: random_string(16, rand::thread_rng()),
        reference_id: sig_st.id.clone(),
        claim: 0,
    };
    let range_st = RangeStatement {
        id: random_string(16, thread_rng()),
        reference_id: comm_st.id.clone(),
        signature_id: sig_st.id.clone(),
        claim: 3,
        lower: Some(0),
        upper: Some(44829),
    };
    let mem_st = MembershipStatement {
        id: random_string(16, thread_rng()),
        reference_id: sig_st.id.clone(),
        accumulator: dummy_registry,
        verification_key: dummy_vk,
        claim: 2,
    };

    let mut nonce = [0u8; 16];
    thread_rng().fill_bytes(&mut nonce);

    let credentials = indexmap! { sig_st.id.clone() => credential.credential.into(), mem_st.id.clone() => dummy_membership_credential.into() };
    let presentation_schema = PresentationSchema::new(&[
        sig_st.into(),
        acc_st.into(),
        comm_st.into(),
        verenc_st.into(),
        range_st.into(),
        mem_st.into(),
    ]);
    // println!("{}", serde_json::to_string(&presentation_schema).unwrap());
    let before = Instant::now();
    let presentation = Presentation::create(&credentials, &presentation_schema, &nonce)?;
    println!("proof generation: {:?}", before.elapsed());
    presentation.verify(&presentation_schema, &nonce)?;
    let before = Instant::now();
    println!("proof verification: {:?}", before.elapsed());
    {
        let bytes = serde_bare::to_vec(&presentation).unwrap();
        let _: Presentation = serde_bare::from_slice(&bytes).unwrap();

        let mut file = File::create("dumps/bare.bin").expect("create file");
        file.write_all(&bytes).expect("write file");
        println!("[bare] proof size = {}", bytes.len());
    }
    {
        let bytes = bcs::to_bytes(&presentation).unwrap();
        let _: Presentation = bcs::from_bytes(&bytes).unwrap();

        let mut file = File::create("dumps/bcs.bin").expect("create file");
        file.write_all(&bytes).expect("write file");

        let mut file = File::create("dumps/bcs_hex.txt").expect("create file");
        file.write_all(hex::encode(&bytes).as_bytes())
            .expect("write file");

        let mut file = File::create("dumps/bcs_base58.txt").expect("create file");
        file.write_all(bs58::encode(&bytes).into_vec().as_slice())
            .expect("write file");

        let mut file = File::create("dumps/bcs_base64.txt").expect("create file");
        file.write_all(
            base64::engine::general_purpose::STANDARD_NO_PAD
                .encode(&bytes)
                .as_bytes(),
        )
        .expect("write file");

        println!("[bcs] proof size = {}", bytes.len());
    }
    #[cfg(feature = "bench")]
    {
        let bytes = bincode::serialize(&presentation).unwrap();
        let _: Presentation = bincode::deserialize(&bytes).unwrap();

        let mut file = File::create("dumps/bincode.bin").expect("create file");
        file.write_all(&bytes).expect("write file");
        println!("[bincode] proof size = {}", bytes.len());
    }
    #[cfg(feature = "bench")]
    {
        let bytes = serde_cbor::to_vec(&presentation).unwrap();
        let _: Presentation = serde_cbor::from_slice(&bytes).unwrap();

        let mut file = File::create("dumps/cbor.bin").expect("create file");
        file.write_all(&bytes).expect("write file");
        println!("[cbor] proof size = {}", bytes.len());
    }
    presentation.verify(&presentation_schema, &nonce)
}
