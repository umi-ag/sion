use std::fs::File;
use std::io::Write;

use bulletproofs::r1cs::gadgets::bound_check::{prove_bounded_num, verify_bounded_num};
use bulletproofs::r1cs::{Prover, R1CSProof, Verifier};
use bulletproofs_amcl as bulletproofs;

use amcl_wrapper::field_elem::FieldElement;
use amcl_wrapper::group_elem::GroupElement;
use amcl_wrapper::group_elem_g1::{G1Vector, G1};
use bulletproofs::utils::get_generators;
use bulletproofs_amcl::r1cs::gadgets::set_membership::{
    prove_set_membership, verify_set_membership,
};
use bulletproofs_amcl::r1cs::gadgets::set_non_membership::{
    prove_set_non_membership, verify_set_non_membership,
};
use merlin::Transcript;
use rand::Rng;

fn main() {
    // Do a bound check, 1 set membership and 1 set non-membership in one proof
    let mut rng = rand::thread_rng();

    let max_bits_in_val = 32;

    let min = 39;
    let max = 545;
    let v = rng.gen_range(min, max);

    let set = vec![
        FieldElement::from(2),
        FieldElement::from(97),
        FieldElement::from(125),
        FieldElement::from(307),
        FieldElement::from(500),
        FieldElement::from(950),
        FieldElement::from(2099),
    ];

    let present_value = FieldElement::from(125);
    let absent_value = FieldElement::from(10);

    let big_g: G1Vector = get_generators("G", 256).into();
    let big_h: G1Vector = get_generators("H", 256).into();
    let g = G1::from_msg_hash("g".as_bytes());
    let h = G1::from_msg_hash("h".as_bytes());

    let transcript_label = b"Combination";

    let mut prover_transcript = Transcript::new(transcript_label);
    let mut prover = Prover::new(&g, &h, &mut prover_transcript);

    let comms_1 = prove_bounded_num(
        v,
        None,
        min,
        max,
        max_bits_in_val,
        Some(&mut rng),
        &mut prover,
    )
    .unwrap();

    let comms_2 = prove_set_membership(
        present_value,
        None,
        set.as_slice(),
        Some(&mut rng),
        &mut prover,
    )
    .unwrap();

    let comms_3 = prove_set_non_membership(
        absent_value,
        None,
        set.as_slice(),
        Some(&mut rng),
        &mut prover,
    )
    .unwrap();

    let proof = prover.prove(&big_g, &big_h).unwrap();

    #[cfg(feature = "serdes")]
    {
        let bytes = serde_bare::to_vec(&proof).unwrap();
        let _: R1CSProof = serde_bare::from_slice(&bytes).unwrap();
        println!("[bare] proof size = {}", bytes.len());
    }
    #[cfg(feature = "serdes")]
    {
        let bytes = bcs::to_bytes(&proof).unwrap();
        let _: R1CSProof = bcs::from_bytes(&bytes).unwrap();
        println!("[bcs] proof size = {}", bytes.len());

        let base58 = bs58::encode(bytes).into_vec();
        let mut file = File::create("dumps/bcs_base58.txt").expect("create file");
        file.write_all(&base58).expect("write file");
    }

    let mut verifier_transcript = Transcript::new(transcript_label);
    let mut verifier = Verifier::new(&mut verifier_transcript);

    verify_bounded_num(min, max, max_bits_in_val, comms_1, &mut verifier).unwrap();

    verify_set_membership(set.as_slice(), comms_2, &mut verifier).unwrap();

    verify_set_non_membership(set.as_slice(), comms_3, &mut verifier).unwrap();

    assert!(verifier.verify(&proof, &g, &h, &big_g, &big_h).is_ok())
}
