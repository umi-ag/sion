use bbs::prelude::HiddenMessage;
use bbs::prelude::ProofMessage;
use bbs::prover::Prover;
use bbs::HashElem;
use bbs::SignatureMessage;
use bbs::{pm_hidden, pm_revealed};

use crate::nonce::ProofNonce;
use crate::proof::SignatureProof;
use crate::proof_challenge::ProofChallenge;
use crate::proof_request::ProofRequest;
use crate::signature::Signature;

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
            if proof_request.inner().revealed_messages.contains(&i) {
                pm_revealed!(m)
            } else {
                pm_hidden!(m)
            }
        })
        .collect::<Vec<_>>();

    let pok =
        Prover::commit_signature_pok(&proof_request.inner(), &proof_messages, &signature.inner())
            .unwrap();
    let challenge =
        Prover::create_challenge_hash(&[pok.clone()], Some(&claims), nonce.inner()).unwrap();
    let proof = SignatureProof::new(pok, &challenge);
    (proof, ProofChallenge::from(challenge))
}
