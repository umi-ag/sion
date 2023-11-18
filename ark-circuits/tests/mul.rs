use ark_ff::Field;
use ark_relations::{
    lc,
    r1cs::{ConstraintSynthesizer, ConstraintSystemRef, SynthesisError},
};

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

#[cfg(test)]
mod tests {
    use super::*;
    use ark_bls12_381::{Bls12_381, Fr as BlsFr};
    use ark_ff::Fp;
    use ark_groth16::Groth16;
    use ark_serialize::{CanonicalDeserialize, CanonicalSerialize, Compress, Validate};
    use ark_snark::SNARK;
    use ark_std::{io::Cursor, ops::*, UniformRand};

    #[test]
    fn test_groth16_circuit_multiply() {
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

    #[test]
    fn test_serde_groth16() {
        let rng = &mut rand::thread_rng();
        // ark_std::rand::rngs::mock::StepRng::new(3, 7);

        //  generate the setup parameters
        let (pk, vk) = Groth16::<Bls12_381>::circuit_specific_setup(
            MultiplyDemoCircuit::<BlsFr> { a: None, b: None },
            rng,
        )
        .unwrap();

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

        let mut serialized = vec![0; proof.serialized_size(Compress::Yes)];
        let mut cursor = Cursor::new(&mut serialized[..]);
        proof
            .serialize_with_mode(&mut cursor, Compress::Yes)
            .unwrap();

        println!("proof: {:?}", serialized);

        let pr = <Groth16<Bls12_381> as SNARK<BlsFr>>::Proof::deserialize_with_mode(
            &serialized[..],
            Compress::Yes,
            Validate::No,
        )
        .unwrap();
        assert_eq!(proof, pr);

        let mut serialized = vec![0; pk.serialized_size(Compress::Yes)];
        pk.serialize_with_mode(&mut serialized[..], Compress::Yes)
            .unwrap();

        let mut serialized = vec![0; c.serialized_size(Compress::Yes)];
        let mut cursor = Cursor::new(&mut serialized[..]);
        c.serialize_with_mode(&mut cursor, Compress::Yes).unwrap();

        println!("c: {:?}", serialized);

        let cs = Fp::deserialize_with_mode(&serialized[..], Compress::Yes, Validate::No).unwrap();

        assert_eq!(c, cs);

        let mut serialized = vec![0; vk.serialized_size(Compress::Yes)];
        let mut cursor = Cursor::new(&mut serialized[..]);
        vk.serialize_with_mode(&mut cursor, Compress::Yes).unwrap();

        println!("vk: {:?}", serialized);

        let v = <Groth16<Bls12_381> as SNARK<BlsFr>>::VerifyingKey::deserialize_with_mode(
            &serialized[..],
            Compress::Yes,
            Validate::No,
        )
        .unwrap();
        assert_eq!(vk, v);

        println!("c.0: {:?}", c.0);

        println!("c.1: {:?}", c.1);

        println!(
            "result: {:#?}",
            Groth16::<Bls12_381>::verify(&vk, &[c], &proof)
        );

        assert!(Groth16::<Bls12_381>::verify(&vk, &[c], &proof).unwrap());
        assert!(Groth16::<Bls12_381>::verify(&v, &[cs], &pr).unwrap());
    }

    #[test]
    fn test_deserialize_verification() {
        let vk_serialized: Vec<u8> = vec![
            183, 29, 177, 250, 95, 65, 54, 46, 147, 2, 91, 53, 86, 215, 110, 173, 18, 37, 207, 89,
            13, 28, 219, 158, 56, 42, 31, 235, 183, 150, 61, 205, 36, 165, 30, 24, 223, 4, 171, 34,
            27, 236, 175, 41, 22, 159, 175, 37, 179, 162, 107, 11, 71, 18, 231, 141, 93, 113, 120,
            109, 150, 19, 42, 124, 88, 80, 35, 163, 102, 50, 202, 218, 68, 23, 26, 195, 244, 93,
            181, 36, 195, 246, 87, 12, 138, 63, 125, 236, 53, 174, 26, 195, 48, 155, 5, 221, 11,
            48, 109, 180, 247, 79, 217, 236, 66, 28, 167, 12, 84, 66, 93, 146, 46, 172, 76, 64, 59,
            0, 219, 145, 111, 222, 223, 6, 91, 220, 224, 14, 206, 23, 185, 122, 78, 151, 23, 62,
            77, 89, 137, 129, 142, 223, 170, 76, 181, 172, 184, 0, 205, 73, 237, 140, 189, 219,
            244, 145, 161, 252, 248, 171, 252, 147, 240, 157, 56, 187, 178, 236, 182, 176, 142, 35,
            164, 100, 44, 229, 156, 155, 3, 134, 83, 154, 195, 206, 205, 251, 102, 169, 240, 39,
            252, 33, 15, 37, 149, 16, 117, 100, 68, 188, 94, 239, 101, 79, 77, 6, 18, 181, 214, 55,
            95, 149, 38, 177, 185, 102, 206, 83, 184, 241, 37, 148, 225, 179, 153, 208, 130, 49,
            207, 230, 194, 105, 164, 74, 168, 213, 135, 242, 54, 157, 179, 170, 121, 123, 175, 163,
            154, 72, 246, 248, 124, 36, 131, 200, 148, 194, 129, 200, 7, 130, 28, 71, 48, 31, 251,
            117, 90, 207, 207, 210, 44, 35, 35, 206, 223, 99, 73, 199, 254, 221, 50, 0, 164, 174,
            85, 134, 49, 229, 1, 210, 153, 235, 147, 19, 92, 7, 207, 105, 76, 161, 24, 209, 179,
            134, 73, 5, 41, 198, 15, 87, 147, 92, 239, 168, 159, 202, 250, 19, 168, 63, 132, 32,
            123, 118, 254, 7, 141, 200, 89, 212, 2, 116, 61, 70, 140, 21, 2, 0, 0, 0, 0, 0, 0, 0,
            183, 246, 208, 109, 211, 229, 36, 110, 246, 181, 27, 7, 92, 48, 182, 143, 212, 144,
            251, 248, 94, 2, 5, 247, 159, 160, 77, 129, 19, 49, 146, 19, 148, 99, 181, 232, 239,
            178, 44, 57, 239, 61, 209, 197, 9, 32, 21, 184, 162, 230, 55, 219, 255, 82, 161, 228,
            168, 197, 217, 133, 179, 65, 31, 197, 253, 68, 175, 96, 126, 66, 146, 62, 171, 180,
            122, 216, 118, 225, 240, 43, 91, 224, 52, 173, 175, 115, 149, 42, 232, 175, 254, 229,
            245, 24, 65, 222,
        ];
        let c_serialized: Vec<u8> = vec![
            24, 246, 200, 56, 227, 0, 59, 95, 49, 157, 206, 57, 13, 141, 238, 168, 24, 78, 144, 62,
            155, 209, 70, 78, 67, 71, 89, 204, 203, 208, 132, 24,
        ];
        let proof_serialized: Vec<u8> = vec![
            160, 91, 229, 15, 171, 87, 149, 187, 135, 132, 57, 58, 80, 69, 249, 135, 71, 23, 58,
            210, 135, 245, 94, 33, 52, 113, 189, 85, 151, 69, 85, 20, 82, 69, 60, 76, 58, 57, 231,
            200, 131, 16, 132, 159, 60, 122, 31, 195, 173, 99, 72, 182, 183, 179, 76, 134, 191, 55,
            167, 72, 205, 45, 130, 162, 80, 223, 198, 72, 70, 117, 102, 136, 37, 161, 111, 125,
            166, 160, 77, 52, 36, 17, 62, 50, 92, 231, 52, 236, 68, 149, 96, 130, 192, 160, 110,
            95, 24, 104, 225, 241, 166, 229, 89, 185, 254, 129, 241, 169, 1, 248, 166, 52, 27, 48,
            28, 69, 178, 93, 48, 128, 251, 197, 3, 147, 83, 216, 247, 27, 85, 11, 39, 78, 196, 192,
            124, 112, 205, 17, 83, 86, 44, 49, 76, 151, 181, 105, 204, 73, 27, 77, 240, 53, 203,
            244, 158, 149, 31, 212, 254, 48, 170, 130, 54, 176, 226, 175, 104, 244, 193, 89, 44,
            212, 13, 235, 235, 113, 138, 243, 54, 57, 219, 107, 193, 226, 218, 157, 152, 229, 83,
            229, 234, 237,
        ];

        let vk = <Groth16<Bls12_381> as SNARK<BlsFr>>::VerifyingKey::deserialize_with_mode(
            &vk_serialized[..],
            Compress::Yes,
            Validate::No,
        )
        .unwrap();

        let c = Fp::deserialize_with_mode(&c_serialized[..], Compress::Yes, Validate::No).unwrap();

        let proof = <Groth16<Bls12_381> as SNARK<BlsFr>>::Proof::deserialize_with_mode(
            &proof_serialized[..],
            Compress::Yes,
            Validate::No,
        )
        .unwrap();

        assert!(Groth16::<Bls12_381>::verify(&vk, &[c], &proof).unwrap());
    }
}
