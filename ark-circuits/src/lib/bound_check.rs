use ark_ff::{Field, PrimeField};
use ark_r1cs_std::{
    fields::fp::FpVar,
    prelude::{AllocVar, AllocationMode},
};
use ark_relations::r1cs::{ConstraintSynthesizer, ConstraintSystemRef, SynthesisError};
use ark_std::cmp::Ordering;

/// Enforce min <= value < max
#[derive(Clone)]
pub struct BoundCheckCircuit<F: Field> {
    value: Option<F>,
    min: Option<F>,
    max: Option<F>,
}

impl<F: Field> BoundCheckCircuit<F> {
    pub fn new(value: Option<F>, min: Option<F>, max: Option<F>) -> Self {
        Self { value, min, max }
    }
}

impl<ConstraintF: PrimeField> ConstraintSynthesizer<ConstraintF>
    for BoundCheckCircuit<ConstraintF>
{
    fn generate_constraints(
        self,
        cs: ConstraintSystemRef<ConstraintF>,
    ) -> Result<(), SynthesisError> {
        let val = FpVar::new_variable(
            cs.clone(),
            || self.value.ok_or(SynthesisError::AssignmentMissing),
            AllocationMode::Witness,
        )?;

        let min = FpVar::new_variable(
            cs.clone(),
            || self.min.ok_or(SynthesisError::AssignmentMissing),
            AllocationMode::Input,
        )?;

        let max = FpVar::new_variable(
            cs,
            || self.max.ok_or(SynthesisError::AssignmentMissing),
            AllocationMode::Input,
        )?;

        // val strictly less than to max, i.e. val < max
        val.enforce_cmp(&max, Ordering::Less, false)?;
        // val strictly greater than or equal to max, i.e. val >= min
        val.enforce_cmp(&min, Ordering::Greater, true)?;
        Ok(())
    }
}

#[cfg(test)]
mod test_bound {
    use ark_bn254::{Bn254, Fr};
    use ark_crypto_primitives::snark::SNARK;
    use ark_groth16::Groth16;
    use ark_serialize::CanonicalSerialize;
    use ark_std::rand::{self, rngs::StdRng};

    use crate::bound_check::BoundCheckCircuit;

    #[test]
    fn test_bound() {
        let input_value = 121;
        let input_min = 100;
        let input_max = 200;

        let circuit = BoundCheckCircuit::new(
            Some(Fr::from(input_value)),
            Some(Fr::from(input_min)),
            Some(Fr::from(input_max)),
        );

        type GrothSetup = Groth16<Bn254>;
        let mut test_rng = test_rng();

        let start = ark_std::time::Instant::now();
        let (pk, vk) = GrothSetup::circuit_specific_setup(circuit.clone(), &mut test_rng).unwrap();
        println!(
            "setup time for bound_chack with bytes: {} ms. pk size: {}",
            start.elapsed().as_millis(),
            pk.uncompressed_size(),
        );

        let start = ark_std::time::Instant::now();
        let proof = GrothSetup::prove(&pk, circuit, &mut test_rng).unwrap();
        println!(
            "proving time for bound_check with bytes: {} ms. proof size: {}",
            start.elapsed().as_millis(),
            proof.serialized_size(ark_serialize::Compress::Yes),
        );

        let start = ark_std::time::Instant::now();
        let res =
            GrothSetup::verify(&vk, &[Fr::from(input_min), Fr::from(input_max)], &proof).unwrap();
        println!(
            "verifying time for bound_check with bytes: {} ms",
            start.elapsed().as_millis()
        );
        assert!(res);
    }

    fn test_rng() -> StdRng {
        use rand::SeedableRng;
        // arbitrary seed
        let seed = [
            1, 0, 0, 0, 23, 0, 0, 0, 200, 1, 0, 0, 210, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
        ];
        rand::rngs::StdRng::from_seed(seed)
    }
}
