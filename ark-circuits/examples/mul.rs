// use ark_bls12_381::{Bls12_381 as Curve, Fr};
use ark_bn254::{Bn254 as Curve, Fr};
use ark_circuits::serde_utils::Groth16VerifierTuple;
use ark_ff::Field;
use ark_groth16::Groth16;
use ark_relations::lc;
use ark_relations::r1cs::{
    ConstraintSynthesizer, ConstraintSystem, ConstraintSystemRef, SynthesisError,
};
use ark_serialize::CanonicalSerialize;
use ark_snark::SNARK;
use ark_std::rand::thread_rng;
use ark_std::UniformRand;
use serde_json;
use std::fs::File;
use std::io::Write;
use std::ops::MulAssign;
use std::path::Path;

// circuit: prover claims that she knows two factors a and b of some public value c
#[derive(Copy, Clone)]
struct MultiplyDemoCircuit<F: Field> {
    a: Option<F>,
    b: Option<F>,
}

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
    let mut rng = thread_rng();
    let a = Fr::rand(&mut rng);
    let b = Fr::rand(&mut rng);
    let mut c = a;
    c.mul_assign(&b);

    // calculate the proof by passing witness variable value
    let circuit = MultiplyDemoCircuit::<Fr> {
        a: Some(a),
        b: Some(b),
    };

    let pk =
        Groth16::<Curve>::generate_random_parameters_with_reduction(circuit, &mut rng).unwrap();
    let proof = Groth16::<Curve>::prove(&pk, circuit, &mut rng).unwrap();

    let pvk = Groth16::<Curve>::process_vk(&pk.vk).unwrap();
    let inputs = [a, b];

    let tuple = Groth16VerifierTuple::new(
        &ark_circuits::serde_utils::to_bytes(&pvk),
        &ark_circuits::serde_utils::to_bytes(&inputs),
        &ark_circuits::serde_utils::to_bytes(&proof),
    );

    println!("pk size: {}", pk.uncompressed_size());

    {
        let serialized_data = serde_json::to_string(&tuple).expect("");
        let path = Path::new("output.json");
        let mut file = File::create(&path).expect("");
        file.write_all(serialized_data.as_bytes()).expect("");
    }
}
