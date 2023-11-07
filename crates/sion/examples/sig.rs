fn main() {
    let issuer = sion::issuer::IssuerModule::new(5);

    dbg!("pk_str", &issuer.pk_str());

    let messages = vec![
        "message 1",
        "message 2",
        "message 3",
        "message 4",
        "message 5",
    ];
    let signature = issuer.generate_signature(&messages);
    dbg!("signature", &signature);

    let valid = sion::verifier::verify_signature(&signature, issuer.pk(), &messages);
    println!("Signature is valid: {}", valid);
}
