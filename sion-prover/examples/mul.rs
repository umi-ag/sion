use ark_bn254::{Bn254 as Curve, Fr};
use ark_circuits::serde_utils::Groth16Verifier;
use ark_ff::{Field, PrimeField};
use ark_groth16::Groth16;
use ark_r1cs_std::eq::EqGadget;
use ark_r1cs_std::{
    fields::fp::FpVar,
    prelude::{AllocVar, AllocationMode},
};
use ark_relations::r1cs::{ConstraintSynthesizer, ConstraintSystemRef, SynthesisError};
use ark_snark::SNARK;
use ark_std::rand::thread_rng;
use ark_std::UniformRand;
use std::fs::File;
use std::io::Write;
use std::ops::Mul;
use std::path::Path;

// circuit: prover claims that she knows two factors a and b of some public value c
#[derive(Copy, Clone)]
struct MultiplyDemoCircuit<F: Field> {
    input_a: Option<F>,
    input_b: Option<F>,
    expected: Option<F>,
}

impl<ConstraintF: PrimeField> ConstraintSynthesizer<ConstraintF>
    for MultiplyDemoCircuit<ConstraintF>
{
    fn generate_constraints(
        self,
        cs: ConstraintSystemRef<ConstraintF>,
    ) -> Result<(), SynthesisError> {
        let a = FpVar::new_variable(
            cs.clone(),
            || self.input_a.ok_or(SynthesisError::AssignmentMissing),
            AllocationMode::Witness,
        )?;

        let b = FpVar::new_variable(
            cs.clone(),
            || self.input_b.ok_or(SynthesisError::AssignmentMissing),
            AllocationMode::Input,
        )?;

        let expected = FpVar::new_variable(
            cs,
            || self.expected.ok_or(SynthesisError::AssignmentMissing),
            AllocationMode::Input,
        )?;

        let actual = a.mul(b);
        expected.enforce_equal(&actual)?;

        Ok(())
    }
}

fn main() {
    let mut rng = thread_rng();
    let a = Fr::rand(&mut rng);
    let b = Fr::rand(&mut rng);
    let c = a.mul(b);

    // calculate the proof by passing witness variable value
    let circuit = MultiplyDemoCircuit::<Fr> {
        input_a: Some(a),
        input_b: Some(b),
        expected: Some(c),
    };

    let mut rng = thread_rng();
    // Groth16::<Curve>::generate_random_parameters_with_reduction(circuit, &mut rng).unwrap();
    let (pk, _vk) = Groth16::<Curve>::circuit_specific_setup(circuit.clone(), &mut rng).unwrap();
    let proof = Groth16::<Curve>::prove(&pk, circuit, &mut rng).unwrap();
    // let inputs = [3, 19, 57];

    let inputs = [a, b, c];

    {
        let pvk = Groth16::<Curve>::process_vk(&pk.vk).unwrap();
        let verified = Groth16::<Curve>::verify_proof(&pvk, &proof, &inputs).unwrap();
        dbg!("verified", &verified);
        assert!(verified);
    }

    let tuple = Groth16Verifier::new(
        &ark_circuits::serde_utils::to_bytes(&pk.vk),
        &ark_circuits::serde_utils::to_bytes(&inputs),
        &ark_circuits::serde_utils::to_bytes(&proof),
    );
    tuple.print_info();

    {
        let serialized_data = serde_json::to_string(&tuple).expect("");
        let path = Path::new("output.json");
        let mut file = File::create(&path).expect("");
        file.write_all(serialized_data.as_bytes()).expect("");
    }
}
