use ark_crypto_primitives::crh::sha256::constraints::{DigestVar, Sha256Gadget};
use ark_ff::ToConstraintField;
use ark_ff::{Field, PrimeField};
use ark_r1cs_std::eq::EqGadget;
use ark_r1cs_std::uint8::UInt8;
use ark_r1cs_std::{
    fields::fp::FpVar,
    prelude::{AllocVar, AllocationMode},
};
use ark_relations::r1cs::{ConstraintSynthesizer, ConstraintSystemRef, SynthesisError};
use ark_std::cmp::Ordering;
use fastcrypto::hash::HashFunction;
use fastcrypto::hash::Sha256;

#[derive(Clone)]
pub struct ProofRequestBoundCheck {
    value: u64,
    lower_bound_gte: u64,
    upper_bound_lt: u64,
}

impl ProofRequestBoundCheck {
    pub fn new(value: u64, lower_bound_gte: u64, upper_bound_lt: u64) -> Self {
        Self {
            value,
            lower_bound_gte,
            upper_bound_lt,
        }
    }
}

#[derive(Clone)]
pub struct CircuitBoundCheck<F: Field> {
    value: Vec<u8>,
    expected_digest: Vec<u8>,
    lower_bound_gte: Option<F>,
    upper_bound_lt: Option<F>,
}

impl<F: Field> From<ProofRequestBoundCheck> for CircuitBoundCheck<F> {
    fn from(request: ProofRequestBoundCheck) -> Self {
        let private_value = request.value.to_be_bytes().to_vec();
        let expected_digest: Vec<u8> = Sha256::digest(&private_value).to_vec();

        Self {
            value: private_value,
            expected_digest,
            lower_bound_gte: Some(F::from(request.lower_bound_gte)),
            upper_bound_lt: Some(F::from(request.upper_bound_lt)),
        }
    }
}

impl<F: PrimeField> CircuitBoundCheck<F> {
    pub fn new(
        value: &[u8],
        expected_digest: &[u8],
        lower_bound_gte: u64,
        upper_bound_lt: u64,
    ) -> Self {
        Self {
            value: value.to_vec(),
            expected_digest: expected_digest.to_vec(),
            lower_bound_gte: Some(F::from(lower_bound_gte)),
            upper_bound_lt: Some(F::from(upper_bound_lt)),
        }
    }

    pub fn get_public_inputs(&self) -> Vec<F> {
        let mut prepared_public_inputs = Vec::<F>::new();
        let e = self.expected_digest.to_field_elements().unwrap();
        prepared_public_inputs.append(&mut e.clone());
        prepared_public_inputs.push(F::from(self.lower_bound_gte.unwrap()));
        prepared_public_inputs.push(F::from(self.upper_bound_lt.unwrap()));
        prepared_public_inputs
    }
}

impl<F: PrimeField> ConstraintSynthesizer<F> for CircuitBoundCheck<F> {
    fn generate_constraints(self, cs: ConstraintSystemRef<F>) -> Result<(), SynthesisError> {
        let value = UInt8::new_witness_vec(cs.clone(), &self.value).unwrap();
        let expected_digest = UInt8::new_input_vec(cs.clone(), &self.expected_digest).unwrap();
        let lower_bound_gte = FpVar::new_input(cs.clone(), || {
            self.lower_bound_gte
                .ok_or(SynthesisError::AssignmentMissing)
        })?;
        let upper_bound_lt = FpVar::new_input(cs.clone(), || {
            self.upper_bound_lt.ok_or(SynthesisError::AssignmentMissing)
        })?;
        let private_number = {
            let num = u64::from_le_bytes(self.value.try_into().unwrap());
            FpVar::new_constant(cs.clone(), F::from(num))?
        };

        // sha256 hash preimage proof
        {
            let mut sha256_var = Sha256Gadget::default();
            sha256_var.update(&value).unwrap();

            sha256_var
                .finalize()?
                .enforce_equal(&DigestVar(expected_digest.clone()))?;
        }

        // range proof
        {
            // val strictly greater than or equal to upper_bound_lt, i.e. val >= lower_bound_gte
            private_number.enforce_cmp(&lower_bound_gte, Ordering::Greater, true)?;

            // val strictly less than to upper_bound_lt, i.e. val < upper_bound_lt
            private_number.enforce_cmp(&upper_bound_lt, Ordering::Less, false)?;
        }

        println!("num_constraints: {}", cs.num_constraints());

        Ok(())
    }
}

#[cfg(test)]
mod test_bound_check {
    use ark_bn254::{Bn254 as Curve, Fr};
    use ark_ff::ToConstraintField;
    use ark_groth16::{Groth16, Proof};
    use ark_serialize::CanonicalSerialize;
    use ark_snark::SNARK;
    use fastcrypto::hash::HashFunction;
    use fastcrypto::hash::Sha256;
    use rand::thread_rng;

    use super::*;
    use crate::serde_utils::PublicInputs;

    #[test]
    fn test_bound_check() {
        let mut rng = thread_rng();
        let private_number: u64 = 0x123456;
        let input_lower_bound_gte: u64 = 0x1234;
        let input_upper_bound_lt: u64 = 0xABCDEF;

        // let private_value = private_number.to_be_bytes().to_vec();
        let private_value = private_number.to_le_bytes().to_vec();
        let expected_digest: Vec<u8> = Sha256::digest(&private_value).to_vec();

        let circuit = CircuitBoundCheck::<Fr>::new(
            &private_value,
            &expected_digest,
            input_lower_bound_gte,
            input_upper_bound_lt,
        );

        let pk = {
            let start = ark_std::time::Instant::now();
            let pk = Groth16::<Curve>::generate_random_parameters_with_reduction(
                circuit.clone(),
                &mut rng,
            )
            .unwrap();
            println!(
                "setup time: {} ms. pk size: {}",
                start.elapsed().as_millis(),
                pk.compressed_size(),
            );
            pk
        };

        let proof = {
            let start = ark_std::time::Instant::now();
            let proof = Groth16::<Curve>::prove(&pk, circuit.clone(), &mut rng).unwrap();
            println!(
                "proving time: {} ms. proof size: {}",
                start.elapsed().as_millis(),
                proof.serialized_size(ark_serialize::Compress::Yes),
            );
            proof
        };

        let public_inputs = {
            let mut inputs: Vec<Fr> = [
                // &circuit.blake2_seed[..], &circuit.expected_output[..]
                // circuit.lower_bound_gte,
                expected_digest,
                // vec![input_lower_bound_gte, input_upper_bound_lt], // Fr::from(circuit.lower_bound_gte.unwrap()),
                // Fr::from(circuit.upper_bound_lt.unwrap()),
            ]
            .iter()
            .flat_map::<Vec<Fr>, _>(|x| x.to_field_elements().unwrap())
            .map(Fr::from)
            .collect();

            inputs.push(Fr::from(input_lower_bound_gte));
            inputs.push(Fr::from(input_upper_bound_lt));

            PublicInputs::new(inputs)
        };

        {
            let start = ark_std::time::Instant::now();
            let vk = fastcrypto_zkp::bn254::VerifyingKey::from(pk.vk);
            let pvk = fastcrypto_zkp::bn254::verifier::process_vk_special(&vk);
            let public_inputs_bytes = public_inputs.to_bytes();

            let result = fastcrypto_zkp::bn254::api::verify_groth16(
                &pvk,
                &public_inputs_bytes.clone(),
                &crate::serde_utils::to_bytes(&proof),
            )
            .expect("failed to verify");
            assert!(result);
            println!("verifying time: {} ms", start.elapsed().as_millis());
        }
    }
}
