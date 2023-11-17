use rand_core::SeedableRng;

use rand_chacha::ChaChaRng;

use merlin::Transcript;

use bulletproofs::{inner_types::*, BulletproofGens, PedersenGens, RangeProof};

use hex;

// This function generates test vectors and dumps them to stdout.
// It can be run by uncommenting the #[test] annotation.
// We allow(dead_code) to ensure that it continues to compile.
//#[test]
#[allow(dead_code)]
fn generate_test_vectors() {
    let pc_gens = PedersenGens::default();
    let bp_gens = BulletproofGens::new(64, 8);

    // Use a deterministic RNG for proving, so the test vectors can be
    // generated reproducibly.
    let mut test_rng = ChaChaRng::from_seed([24u8; 32]);

    let values = vec![0u64, 1, 2, 3, 4, 5, 6, 7];
    let blindings = (0..8)
        .map(|_| Scalar::random(&mut test_rng))
        .collect::<Vec<_>>();

    for n in &[8, 16, 32, 64] {
        for m in &[1, 2, 4, 8] {
            let mut transcript = Transcript::new(b"Deserialize-And-Verify Test");
            let (proof, value_commitments) = RangeProof::prove_multiple(
                &bp_gens,
                &pc_gens,
                &mut transcript,
                &values[0..*m],
                &blindings[0..*m],
                *n,
            )
            .unwrap();

            println!("n,m = {}, {}", n, m);
            println!("proof = \"{}\"", hex::encode(proof.to_bytes()));
            println!("vc = [");
            for com in &value_commitments {
                println!("    \"{}\"", hex::encode(com.to_affine().to_compressed()));
            }
            println!("]\n");
        }
    }

    panic!();
}
