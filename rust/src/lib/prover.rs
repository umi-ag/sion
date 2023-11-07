use bbs::prelude::Issuer;
use bbs::prelude::PublicKey;
use bbs::prelude::SecretKey;
use bbs::prover::Prover;
use bbs::signature::Signature;
use bbs::ProofChallenge;
use bbs::ProofNonce;
use bbs::ProofRequest;
use bbs::SignatureProof;

use bbs::prelude::HiddenMessage;
use bbs::prelude::ProofMessage;
use bbs::HashElem;
use bbs::SignatureMessage;
use bbs::{pm_hidden, pm_revealed};

pub fn generate_pok(
    signature: &Signature,
    proof_request: &ProofRequest,
    nonce: &ProofNonce,
    messages: &[&str],
    claims: &[&[u8]],
) -> (SignatureProof, ProofChallenge) {
    let proof_messages = messages
        .iter()
        .enumerate()
        .map(|(i, m)| {
            if proof_request.revealed_messages.contains(&i) {
                pm_revealed!(m)
            } else {
                pm_hidden!(m)
            }
        })
        .collect::<Vec<_>>();

    let pok = Prover::commit_signature_pok(&proof_request, &proof_messages, &signature).unwrap();
    let challenge = Prover::create_challenge_hash(&[pok.clone()], Some(&claims), nonce).unwrap();
    let proof = Prover::generate_signature_pok(pok, &challenge).unwrap();
    (proof, challenge)
}
