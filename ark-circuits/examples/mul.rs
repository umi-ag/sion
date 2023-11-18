use ark_bls12_381::{Bls12_381, Fr as BlsFr};
use ark_ec::hashing;
use ark_ff::Field;
use ark_ff::Fp;
use ark_ff::PrimeField;
use ark_groth16::Groth16;
use ark_r1cs_std::{
    prelude::{AllocVar, Boolean, EqGadget},
    uint8::UInt8,
};
use ark_relations::lc;
use ark_relations::r1cs::{
    ConstraintSynthesizer, ConstraintSystem, ConstraintSystemRef, SynthesisError,
};
use ark_serialize::{CanonicalDeserialize, CanonicalSerialize, Compress, Validate};
use ark_snark::{CircuitSpecificSetupSNARK, SNARK};
use ark_std::rand::{RngCore, SeedableRng};
use ark_std::{io::Cursor, ops::*, UniformRand};
use std::usize;

// circuit: prover claims that she knows two factors a and b of some public value c
#[derive(Copy, Clone)]
struct MultiplyDemoCircuit<F: Field> {
    a: Option<F>,
    b: Option<F>,
}

pub struct Puzzle<const N: usize, ConstraintF: PrimeField>([[UInt8<ConstraintF>; N]; N]);

impl<ConstraintF: Field> ConstraintSynthesizer<ConstraintF> for MultiplyDemoCircuit<ConstraintF> {
    fn generate_constraints(
        self,
        cs: ConstraintSystemRef<ConstraintF>,
    ) -> Result<(), SynthesisError> {
        let a = cs.new_witness_variable(|| self.a.ok_or(SynthesisError::AssignmentMissing))?;
        let b = cs.new_witness_variable(|| self.b.ok_or(SynthesisError::AssignmentMissing))?;
        let c = cs.new_input_variable(|| {
            let mut a = self.a.ok_or(SynthesisError::AssignmentMissing)?;
            let b = self.b.ok_or(SynthesisError::AssignmentMissing)?;

            a.mul_assign(&b);
            Ok(a)
        })?;

        cs.enforce_constraint(lc!() + a, lc!() + b, lc!() + c)?;

        Ok(())
    }
}

fn main() {
    let rng = &mut rand::thread_rng();

    // generate the setup parameters
    let (pk, vk) = Groth16::<Bls12_381>::circuit_specific_setup(
        MultiplyDemoCircuit::<BlsFr> { a: None, b: None },
        rng,
    )
    .unwrap();
    for _ in 0..5 {
        let a = BlsFr::rand(rng);
        let b = BlsFr::rand(rng);
        let mut c = a;
        c.mul_assign(&b);

        // calculate the proof by passing witness variable value
        let proof = Groth16::<Bls12_381>::prove(
            &pk,
            MultiplyDemoCircuit::<BlsFr> {
                a: Some(a),
                b: Some(b),
            },
            rng,
        )
        .unwrap();

        // validate the proof
        assert!(Groth16::<Bls12_381>::verify(&vk, &[c], &proof).unwrap());
        assert!(!Groth16::<Bls12_381>::verify(&vk, &[a], &proof).unwrap());
    }
}
