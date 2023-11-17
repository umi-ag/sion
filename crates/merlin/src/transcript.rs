// use rand_core;
use zeroize::Zeroize;

use crate::strobe::Strobe128;

fn encode_u64(x: u64) -> [u8; 8] {
    use byteorder::{ByteOrder, LittleEndian};

    let mut buf = [0; 8];
    LittleEndian::write_u64(&mut buf, x);
    buf
}

fn encode_usize_as_u32(x: usize) -> [u8; 4] {
    use byteorder::{ByteOrder, LittleEndian};

    assert!(x <= (u32::max_value() as usize));

    let mut buf = [0; 4];
    LittleEndian::write_u32(&mut buf, x as u32);
    buf
}

/// A transcript of a public-coin argument.
///
/// The prover's messages are added to the transcript using
/// [`append_message`](Transcript::append_message), and the verifier's
/// challenges can be computed using
/// [`challenge_bytes`](Transcript::challenge_bytes).
///
/// # Creating and using a Merlin transcript
///
/// To create a Merlin transcript, use [`Transcript::new()`].  This
/// function takes a domain separation label which should be unique to
/// the application.
///
/// To use the transcript with a Merlin-based proof implementation,
/// the prover's side creates a Merlin transcript with an
/// application-specific domain separation label, and passes a `&mut`
/// reference to the transcript to the proving function(s).
///
/// To verify the resulting proof, the verifier creates their own
/// Merlin transcript using the same domain separation label, then
/// passes a `&mut` reference to the verifier's transcript to the
/// verification function.
///
/// # Implementing proofs using Merlin
///
/// For information on the design of Merlin and how to use it to
/// implement a proof system, see the documentation at
/// [merlin.cool](https://merlin.cool), particularly the [Using
/// Merlin](https://merlin.cool/use/index.html) section.
#[derive(Clone, Zeroize)]
pub struct Transcript {
    strobe: Strobe128,
}

impl Transcript {
    /// Initialize a new transcript with the supplied `label`, which
    /// is used as a domain separator.
    ///
    /// # Note
    ///
    /// This function should be called by a proof library's API
    /// consumer (i.e., the application using the proof library), and
    /// **not by the proof implementation**.  See the [Passing
    /// Transcripts](https://merlin.cool/use/passing.html) section of
    /// the Merlin website for more details on why.
    pub fn new(label: &'static [u8]) -> Transcript {
        use crate::constants::MERLIN_PROTOCOL_LABEL;

        #[cfg(feature = "debug-transcript")]
        {
            use std::str::from_utf8;
            println!(
                "Initialize STROBE-128({})\t# b\"{}\"",
                hex::encode(MERLIN_PROTOCOL_LABEL),
                from_utf8(MERLIN_PROTOCOL_LABEL).unwrap(),
            );
        }

        let mut transcript = Transcript {
            strobe: Strobe128::new(MERLIN_PROTOCOL_LABEL),
        };
        transcript.append_message(b"dom-sep", label);

        transcript
    }

    /// Append a prover's `message` to the transcript.
    ///
    /// The `label` parameter is metadata about the message, and is
    /// also appended to the transcript.  See the [Transcript
    /// Protocols](https://merlin.cool/use/protocol.html) section of
    /// the Merlin website for details on labels.
    pub fn append_message(&mut self, label: &'static [u8], message: &[u8]) {
        let data_len = encode_usize_as_u32(message.len());
        self.strobe.meta_ad(label, false);
        self.strobe.meta_ad(&data_len, true);
        self.strobe.ad(message, false);

        #[cfg(feature = "debug-transcript")]
        {
            use std::str::from_utf8;

            match from_utf8(label) {
                Ok(label_str) => {
                    println!(
                        "meta-AD : {} || LE32({})\t# b\"{}\"",
                        hex::encode(label),
                        message.len(),
                        label_str
                    );
                }
                Err(_) => {
                    println!(
                        "meta-AD : {} || LE32({})",
                        hex::encode(label),
                        message.len()
                    );
                }
            }
            match from_utf8(message) {
                Ok(message_str) => {
                    println!("     AD : {}\t# b\"{}\"", hex::encode(message), message_str);
                }
                Err(_) => {
                    println!("     AD : {}", hex::encode(message));
                }
            }
        }
    }

    /// Deprecated.  This function was renamed to
    /// [`append_message`](Transcript::append_message).
    ///
    /// This is intended to avoid any possible confusion between the
    /// transcript-level messages and protocol-level commitments.
    #[deprecated(since = "1.1.0", note = "renamed to append_message for clarity.")]
    pub fn commit_bytes(&mut self, label: &'static [u8], message: &[u8]) {
        self.append_message(label, message);
    }

    /// Convenience method for appending a `u64` to the transcript.
    ///
    /// The `label` parameter is metadata about the message, and is
    /// also appended to the transcript.  See the [Transcript
    /// Protocols](https://merlin.cool/use/protocol.html) section of
    /// the Merlin website for details on labels.
    ///
    /// # Implementation
    ///
    /// Calls `append_message` with the 8-byte little-endian encoding
    /// of `x`.
    pub fn append_u64(&mut self, label: &'static [u8], x: u64) {
        self.append_message(label, &encode_u64(x));
    }

    /// Deprecated.  This function was renamed to
    /// [`append_u64`](Transcript::append_u64).
    ///
    /// This is intended to avoid any possible confusion between the
    /// transcript-level messages and protocol-level commitments.
    #[deprecated(since = "1.1.0", note = "renamed to append_u64 for clarity.")]
    pub fn commit_u64(&mut self, label: &'static [u8], x: u64) {
        self.append_u64(label, x);
    }

    /// Fill the supplied buffer with the verifier's challenge bytes.
    ///
    /// The `label` parameter is metadata about the challenge, and is
    /// also appended to the transcript.  See the [Transcript
    /// Protocols](https://merlin.cool/use/protocol.html) section of
    /// the Merlin website for details on labels.
    pub fn challenge_bytes(&mut self, label: &'static [u8], dest: &mut [u8]) {
        let data_len = encode_usize_as_u32(dest.len());
        self.strobe.meta_ad(label, false);
        self.strobe.meta_ad(&data_len, true);
        self.strobe.prf(dest, false);

        #[cfg(feature = "debug-transcript")]
        {
            use std::str::from_utf8;

            match from_utf8(label) {
                Ok(label_str) => {
                    println!(
                        "meta-AD : {} || LE32({})\t# b\"{}\"",
                        hex::encode(label),
                        dest.len(),
                        label_str
                    );
                }
                Err(_) => {
                    println!("meta-AD : {} || LE32({})", hex::encode(label), dest.len());
                }
            }
            println!("     PRF: {}", hex::encode(dest));
        }
    }
}
