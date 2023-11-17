use crate::{statement::Statement, utils::*};
use indexmap::IndexMap;
use merlin::Transcript;
use serde::{Deserialize, Serialize};
use uint_zigzag::Uint;

/// An equality statement
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct EqualityStatement {
    /// The statement id
    pub id: String,
    /// The reference statement id to claim index
    #[serde(
        serialize_with = "serialize_indexmap",
        deserialize_with = "deserialize_indexmap"
    )]
    pub ref_id_claim_index: IndexMap<String, usize>,
}

impl Statement for EqualityStatement {
    fn id(&self) -> String {
        self.id.clone()
    }

    fn reference_ids(&self) -> Vec<String> {
        self.ref_id_claim_index.keys().cloned().collect()
    }

    fn add_challenge_contribution(&self, transcript: &mut Transcript) {
        transcript.append_message(b"statement type", b"equality");
        transcript.append_message(b"statement id", self.id.as_bytes());
        transcript.append_message(
            b"reference statement ids to claim index length",
            &Uint::from(self.ref_id_claim_index.len()).to_vec(),
        );
        for (id, idx) in &self.ref_id_claim_index {
            transcript.append_message(b"reference statement id", id.as_bytes());
            transcript.append_message(
                b"reference statement claim index",
                &Uint::from(*idx).to_vec(),
            );
        }
    }

    fn get_claim_index(&self, reference_id: &str) -> usize {
        self.ref_id_claim_index[reference_id]
    }
}
