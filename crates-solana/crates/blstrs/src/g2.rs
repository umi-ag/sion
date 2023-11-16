//! An implementation of the $\mathbb{G}_2$ group of BLS12-381.

use core::{
    borrow::Borrow,
    fmt,
    iter::Sum,
    ops::{Add, AddAssign, Mul, MulAssign, Neg, Sub, SubAssign},
};

use blst::*;
use elliptic_curve::consts::U96;
use elliptic_curve::generic_array::GenericArray;
#[cfg(feature = "hashing")]
use elliptic_curve::hash2curve::ExpandMsg;
use elliptic_curve::ops::{LinearCombination, MulByGenerator};
use elliptic_curve::point::AffineCoordinates;
use ff::Field;
use group::{
    prime::{PrimeCurve, PrimeCurveAffine, PrimeGroup},
    Curve, Group, GroupEncoding, UncompressedEncoding, WnafGroup,
};
use rand_core::RngCore;
use subtle::{Choice, ConditionallySelectable, ConstantTimeEq, CtOption};

use crate::{fp2::Fp2, util, Bls12, Engine, G1Affine, Gt, PairingCurveAffine, Scalar};

/// This is an element of $\mathbb{G}_2$ represented in the affine coordinate space.
/// It is ideal to keep elements in this representation to reduce memory usage and
/// improve performance through the use of mixed curve model arithmetic.
#[derive(Copy, Clone)]
#[repr(transparent)]
pub struct G2Affine(pub(crate) blst_p2_affine);

const COMPRESSED_SIZE: usize = 96;
const UNCOMPRESSED_SIZE: usize = 192;

impl fmt::Debug for G2Affine {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let is_ident: bool = self.is_identity().into();
        f.debug_struct("G2Affine")
            .field("x", &self.x())
            .field("y", &self.y())
            .field("infinity", &is_ident)
            .finish()
    }
}

impl fmt::Display for G2Affine {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.is_identity().into() {
            write!(f, "G2Affine(Infinity)")
        } else {
            write!(f, "G2Affine(x={}, y={})", self.x(), self.y())
        }
    }
}

impl fmt::LowerHex for G2Affine {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let bytes = self.to_compressed();
        for &b in bytes.iter() {
            write!(f, "{:02x}", b)?;
        }
        Ok(())
    }
}

impl fmt::UpperHex for G2Affine {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let bytes = self.to_compressed();
        for &b in bytes.iter() {
            write!(f, "{:02X}", b)?;
        }
        Ok(())
    }
}

impl AsRef<blst_p2_affine> for G2Affine {
    fn as_ref(&self) -> &blst_p2_affine {
        &self.0
    }
}

impl AsMut<blst_p2_affine> for G2Affine {
    fn as_mut(&mut self) -> &mut blst_p2_affine {
        &mut self.0
    }
}

impl Default for G2Affine {
    fn default() -> G2Affine {
        G2Affine::identity()
    }
}

impl From<&G2Projective> for G2Affine {
    fn from(p: &G2Projective) -> G2Affine {
        let mut out = blst_p2_affine::default();

        unsafe { blst_p2_to_affine(&mut out, &p.0) };

        G2Affine(out)
    }
}

impl From<G2Projective> for G2Affine {
    fn from(p: G2Projective) -> G2Affine {
        G2Affine::from(&p)
    }
}

impl ConstantTimeEq for G2Affine {
    fn ct_eq(&self, other: &Self) -> Choice {
        u8::from(unsafe { blst_p2_affine_is_equal(&self.0, &other.0) }).into()
    }
}

impl Eq for G2Affine {}
impl PartialEq for G2Affine {
    #[inline]
    fn eq(&self, other: &Self) -> bool {
        unsafe { blst_p2_affine_is_equal(&self.0, &other.0) }
    }
}

impl Neg for &G2Projective {
    type Output = G2Projective;

    #[inline]
    fn neg(self) -> G2Projective {
        -*self
    }
}

impl Neg for G2Projective {
    type Output = G2Projective;

    #[inline]
    fn neg(mut self) -> G2Projective {
        unsafe { blst_p2_cneg(&mut self.0, true) }
        self
    }
}

impl Neg for &G2Affine {
    type Output = G2Affine;

    #[inline]
    fn neg(self) -> G2Affine {
        -*self
    }
}

impl Neg for G2Affine {
    type Output = G2Affine;

    #[inline]
    fn neg(mut self) -> G2Affine {
        // Missing for affine in blst
        if (!self.is_identity()).into() {
            unsafe {
                blst_fp2_cneg(&mut self.0.y, &self.0.y, true);
            }
        }
        self
    }
}

impl Add<&G2Projective> for &G2Projective {
    type Output = G2Projective;

    #[inline]
    fn add(self, rhs: &G2Projective) -> G2Projective {
        let mut out = blst_p2::default();
        unsafe { blst_p2_add_or_double(&mut out, &self.0, &rhs.0) };
        G2Projective(out)
    }
}

impl Add<&G2Affine> for &G2Projective {
    type Output = G2Projective;

    #[inline]
    fn add(self, rhs: &G2Affine) -> G2Projective {
        self.add_mixed(rhs)
    }
}

impl Add<&G2Projective> for &G2Affine {
    type Output = G2Projective;

    #[inline]
    fn add(self, rhs: &G2Projective) -> G2Projective {
        rhs.add_mixed(self)
    }
}

impl Sub<&G2Projective> for &G2Projective {
    type Output = G2Projective;

    #[inline]
    fn sub(self, rhs: &G2Projective) -> G2Projective {
        self + -rhs
    }
}

impl Sub<&G2Projective> for &G2Affine {
    type Output = G2Projective;

    #[inline]
    fn sub(self, rhs: &G2Projective) -> G2Projective {
        self + -rhs
    }
}

impl Sub<&G2Affine> for &G2Projective {
    type Output = G2Projective;

    #[inline]
    fn sub(self, rhs: &G2Affine) -> G2Projective {
        self + -rhs
    }
}

impl AddAssign<&G2Projective> for G2Projective {
    #[inline]
    fn add_assign(&mut self, rhs: &G2Projective) {
        unsafe { blst_p2_add_or_double(&mut self.0, &self.0, &rhs.0) };
    }
}

impl SubAssign<&G2Projective> for G2Projective {
    #[inline]
    fn sub_assign(&mut self, rhs: &G2Projective) {
        *self += &-rhs
    }
}

impl AddAssign<&G2Affine> for G2Projective {
    #[inline]
    fn add_assign(&mut self, rhs: &G2Affine) {
        unsafe { blst_p2_add_or_double_affine(&mut self.0, &self.0, &rhs.0) };
    }
}

impl SubAssign<&G2Affine> for G2Projective {
    #[inline]
    fn sub_assign(&mut self, rhs: &G2Affine) {
        *self += &-rhs;
    }
}

impl Mul<&Scalar> for &G2Projective {
    type Output = G2Projective;

    fn mul(self, scalar: &Scalar) -> Self::Output {
        self.multiply(scalar)
    }
}

impl Mul<&Scalar> for &G2Affine {
    type Output = G2Projective;

    fn mul(self, scalar: &Scalar) -> Self::Output {
        G2Projective::from(self).multiply(scalar)
    }
}

impl MulAssign<&Scalar> for G2Projective {
    #[inline]
    fn mul_assign(&mut self, rhs: &Scalar) {
        *self = *self * rhs;
    }
}

impl MulAssign<&Scalar> for G2Affine {
    #[inline]
    fn mul_assign(&mut self, rhs: &Scalar) {
        *self = (*self * rhs).into();
    }
}

impl_add_sub!(G2Projective);
impl_add_sub!(G2Projective, G2Affine);
impl_add_sub!(G2Affine, G2Projective, G2Projective);

impl_add_sub_assign!(G2Projective);
impl_add_sub_assign!(G2Projective, G2Affine);

impl_mul!(G2Projective, Scalar);
impl_mul!(G2Affine, Scalar, G2Projective);

impl_mul_assign!(G2Projective, Scalar);
impl_mul_assign!(G2Affine, Scalar);

impl<T> Sum<T> for G2Projective
where
    T: Borrow<G2Projective>,
{
    fn sum<I>(iter: I) -> Self
    where
        I: Iterator<Item = T>,
    {
        iter.fold(Self::identity(), |acc, item| acc + item.borrow())
    }
}

impl PrimeCurveAffine for G2Affine {
    type Scalar = Scalar;
    type Curve = G2Projective;

    fn identity() -> Self {
        G2Affine(blst_p2_affine::default())
    }

    fn generator() -> Self {
        G2Affine(unsafe { *blst_p2_affine_generator() })
    }

    fn is_identity(&self) -> Choice {
        unsafe { Choice::from(blst_p2_affine_is_inf(&self.0) as u8) }
    }

    fn to_curve(&self) -> Self::Curve {
        self.into()
    }
}

impl ConditionallySelectable for G2Affine {
    fn conditional_select(a: &Self, b: &Self, choice: Choice) -> Self {
        G2Affine(blst_p2_affine {
            x: Fp2::conditional_select(&a.x(), &b.x(), choice).0,
            y: Fp2::conditional_select(&a.y(), &b.y(), choice).0,
        })
    }
}

impl ConditionallySelectable for G2Projective {
    fn conditional_select(a: &Self, b: &Self, choice: Choice) -> Self {
        G2Projective(blst_p2 {
            x: Fp2::conditional_select(&a.x(), &b.x(), choice).0,
            y: Fp2::conditional_select(&a.y(), &b.y(), choice).0,
            z: Fp2::conditional_select(&a.z(), &b.z(), choice).0,
        })
    }
}

impl AffineCoordinates for G2Affine {
    type FieldRepr = GenericArray<u8, U96>;

    fn x(&self) -> Self::FieldRepr {
        let x = self.x();
        let mut res = GenericArray::<u8, U96>::default();
        res[0..48].copy_from_slice(&x.c1().to_bytes_be()[..]);
        res[48..96].copy_from_slice(&x.c0().to_bytes_be()[..]);
        res
    }

    fn y_is_odd(&self) -> Choice {
        let y = self.y();
        if y.c0().is_zero().into() {
            (y.c1().to_bytes_be()[47] & 1).into()
        } else {
            (y.c0().to_bytes_be()[47] & 1).into()
        }
    }
}

impl G2Affine {
    /// Bytes to represent this point compressed
    pub const COMPRESSED_BYTES: usize = COMPRESSED_SIZE;
    /// Bytes to represent this point uncompressed
    pub const UNCOMPRESSED_BYTES: usize = UNCOMPRESSED_SIZE;

    /// Serializes this element into compressed form.
    pub fn to_compressed(&self) -> [u8; COMPRESSED_SIZE] {
        let mut out = [0u8; COMPRESSED_SIZE];

        unsafe {
            blst_p2_affine_compress(out.as_mut_ptr(), &self.0);
        }

        out
    }

    /// Serializes this element into uncompressed form.
    pub fn to_uncompressed(&self) -> [u8; UNCOMPRESSED_SIZE] {
        let mut out = [0u8; UNCOMPRESSED_SIZE];

        unsafe {
            blst_p2_affine_serialize(out.as_mut_ptr(), &self.0);
        }

        out
    }

    /// Attempts to deserialize an uncompressed element.
    pub fn from_uncompressed(bytes: &[u8; UNCOMPRESSED_SIZE]) -> CtOption<Self> {
        G2Affine::from_uncompressed_unchecked(bytes)
            .and_then(|p| CtOption::new(p, p.is_on_curve() & p.is_torsion_free()))
    }

    /// Attempts to deserialize a uncompressed element hex string. See [`notes::serialization`](crate::notes::serialization)
    /// for details about how group elements are serialized.
    pub fn from_uncompressed_hex(hex: &str) -> CtOption<Self> {
        let mut bytes = [0u8; UNCOMPRESSED_SIZE];
        util::decode_hex_into_slice(&mut bytes, hex.as_bytes());
        G2Affine::from_uncompressed(&bytes)
    }

    /// Attempts to deserialize an uncompressed element, not checking if the
    /// element is on the curve and not checking if it is in the correct subgroup.
    ///
    /// **This is dangerous to call unless you trust the bytes you are reading; otherwise,
    /// API invariants may be broken.** Please consider using `from_uncompressed()` instead.
    pub fn from_uncompressed_unchecked(bytes: &[u8; UNCOMPRESSED_SIZE]) -> CtOption<Self> {
        let mut raw = blst_p2_affine::default();
        let success =
            unsafe { blst_p2_deserialize(&mut raw, bytes.as_ptr()) == BLST_ERROR::BLST_SUCCESS };
        CtOption::new(G2Affine(raw), Choice::from(success as u8))
    }

    /// Attempts to deserialize a compressed element.
    pub fn from_compressed(bytes: &[u8; COMPRESSED_SIZE]) -> CtOption<Self> {
        G2Affine::from_compressed_unchecked(bytes)
            .and_then(|p| CtOption::new(p, p.is_on_curve() & p.is_torsion_free()))
    }

    /// Attempts to deserialize a compressed element hex string. See [`notes::serialization`](crate::notes::serialization)
    /// for details about how group elements are serialized.
    pub fn from_compressed_hex(hex: &str) -> CtOption<Self> {
        let mut bytes = [0u8; COMPRESSED_SIZE];
        util::decode_hex_into_slice(&mut bytes, hex.as_bytes());
        G2Affine::from_compressed(&bytes)
    }

    /// Attempts to deserialize an uncompressed element, not checking if the
    /// element is in the correct subgroup.
    ///
    /// **This is dangerous to call unless you trust the bytes you are reading; otherwise,
    /// API invariants may be broken.** Please consider using `from_compressed()` instead.
    pub fn from_compressed_unchecked(bytes: &[u8; COMPRESSED_SIZE]) -> CtOption<Self> {
        let mut raw = blst_p2_affine::default();
        let success =
            unsafe { blst_p2_uncompress(&mut raw, bytes.as_ptr()) == BLST_ERROR::BLST_SUCCESS };
        CtOption::new(G2Affine(raw), Choice::from(success as u8))
    }

    /// Returns true if this point is free of an $h$-torsion component, and so it
    /// exists within the $q$-order subgroup $\mathbb{G}_2$. This should always return true
    /// unless an "unchecked" API was used.
    pub fn is_torsion_free(&self) -> Choice {
        unsafe { Choice::from(blst_p2_affine_in_g2(&self.0) as u8) }
    }

    /// Returns true if this point is on the curve. This should always return
    /// true unless an "unchecked" API was used.
    pub fn is_on_curve(&self) -> Choice {
        // FIXME: is_identity check should happen in blst
        unsafe { Choice::from(blst_p2_affine_on_curve(&self.0) as u8) }
    }

    pub fn from_raw_unchecked(x: Fp2, y: Fp2, _infinity: bool) -> Self {
        // FIXME: what about infinity?
        let raw = blst_p2_affine { x: x.0, y: y.0 };

        G2Affine(raw)
    }

    /// Returns the x coordinate.
    pub fn x(&self) -> Fp2 {
        Fp2(self.0.x)
    }

    /// Returns the y coordinate.
    pub fn y(&self) -> Fp2 {
        Fp2(self.0.y)
    }

    #[deprecated(since = "0.7.0", note = "Use UNCOMPRESSED_BYTES instead")]
    pub const fn uncompressed_size() -> usize {
        UNCOMPRESSED_SIZE
    }

    #[deprecated(since = "0.7.0", note = "Use COMPRESSED_BYTES instead")]
    pub const fn compressed_size() -> usize {
        COMPRESSED_SIZE
    }
}

/// This is an element of $\mathbb{G}_2$ represented in the projective coordinate space.
#[derive(Copy, Clone)]
#[repr(transparent)]
pub struct G2Projective(pub(crate) blst_p2);

impl fmt::Debug for G2Projective {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.debug_struct("G2Projective")
            .field("x", &self.x())
            .field("y", &self.y())
            .field("z", &self.z())
            .finish()
    }
}

impl fmt::Display for G2Projective {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", G2Affine::from(self))
    }
}

impl Default for G2Projective {
    fn default() -> Self {
        G2Projective::identity()
    }
}

impl AsRef<blst_p2> for G2Projective {
    fn as_ref(&self) -> &blst_p2 {
        &self.0
    }
}

impl AsMut<blst_p2> for G2Projective {
    fn as_mut(&mut self) -> &mut blst_p2 {
        &mut self.0
    }
}

impl From<&G2Affine> for G2Projective {
    fn from(p: &G2Affine) -> G2Projective {
        let mut out = blst_p2::default();

        unsafe { blst_p2_from_affine(&mut out, &p.0) };

        G2Projective(out)
    }
}

impl From<G2Affine> for G2Projective {
    fn from(p: G2Affine) -> G2Projective {
        G2Projective::from(&p)
    }
}

impl ConstantTimeEq for G2Projective {
    fn ct_eq(&self, other: &Self) -> Choice {
        let self_is_zero: bool = self.is_identity().into();
        let other_is_zero: bool = other.is_identity().into();
        let b = (self_is_zero && other_is_zero)
            || (!self_is_zero && !other_is_zero && unsafe { blst_p2_is_equal(&self.0, &other.0) });
        u8::from(b).into()
    }
}

impl Eq for G2Projective {}
impl PartialEq for G2Projective {
    #[inline]
    fn eq(&self, other: &Self) -> bool {
        self.ct_eq(other).into()
    }
}

impl G2Projective {
    /// Bytes to represent this point compressed
    pub const COMPRESSED_BYTES: usize = COMPRESSED_SIZE;
    /// Bytes to represent this point uncompressed
    pub const UNCOMPRESSED_BYTES: usize = UNCOMPRESSED_SIZE;

    /// The identity of the group: the point at infinity.
    pub const IDENTITY: Self = Self(blst_p2 {
        x: blst_fp2 {
            fp: [blst_fp { l: [0u64; 6] }, blst_fp { l: [0u64; 6] }],
        },
        y: blst_fp2 {
            fp: [blst_fp { l: [0u64; 6] }, blst_fp { l: [0u64; 6] }],
        },
        z: blst_fp2 {
            fp: [blst_fp { l: [0u64; 6] }, blst_fp { l: [0u64; 6] }],
        },
    });
    /// The fixed generator of the group. See [`notes::design`](notes/design/index.html#fixed-generators)
    /// for how this generator is chosen.
    pub const GENERATOR: Self = Self(blst_p2 {
        x: blst_fp2 {
            fp: [
                blst_fp {
                    l: [
                        0xf5f2_8fa2_0294_0a10,
                        0xb3f5_fb26_87b4_961a,
                        0xa1a8_93b5_3e2a_e580,
                        0x9894_999d_1a3c_aee9,
                        0x6f67_b763_1863_366b,
                        0x0581_9192_4350_bcd7,
                    ],
                },
                blst_fp {
                    l: [
                        0xa5a9_c075_9e23_f606,
                        0xaaa0_c59d_bccd_60c3,
                        0x3bb1_7e18_e286_7806,
                        0x1b1a_b6cc_8541_b367,
                        0xc2b6_ed0e_f215_8547,
                        0x1192_2a09_7360_edf3,
                    ],
                },
            ],
        },
        y: blst_fp2 {
            fp: [
                blst_fp {
                    l: [
                        0x4c73_0af8_6049_4c4a,
                        0x597c_fa1f_5e36_9c5a,
                        0xe7e6_856c_aa0a_635a,
                        0xbbef_b5e9_6e0d_495f,
                        0x07d3_a975_f0ef_25a2,
                        0x0083_fd8e_7e80_dae5,
                    ],
                },
                blst_fp {
                    l: [
                        0xadc0_fc92_df64_b05d,
                        0x18aa_270a_2b14_61dc,
                        0x86ad_ac6a_3be4_eba0,
                        0x7949_5c4e_c93d_a33a,
                        0xe717_5850_a43c_caed,
                        0x0b2b_c2a1_63de_1bf2,
                    ],
                },
            ],
        },
        z: Fp2::ONE.0,
    });

    /// Serializes this element into compressed form.
    pub fn to_compressed(&self) -> [u8; COMPRESSED_SIZE] {
        let mut out = [0u8; COMPRESSED_SIZE];

        unsafe {
            blst_p2_compress(out.as_mut_ptr(), &self.0);
        }

        out
    }

    /// Serializes this element into uncompressed form.
    pub fn to_uncompressed(&self) -> [u8; UNCOMPRESSED_SIZE] {
        let mut out = [0u8; UNCOMPRESSED_SIZE];

        unsafe {
            blst_p2_serialize(out.as_mut_ptr(), &self.0);
        }

        out
    }

    /// Attempts to deserialize an uncompressed element.
    pub fn from_uncompressed(bytes: &[u8; UNCOMPRESSED_SIZE]) -> CtOption<Self> {
        G2Affine::from_uncompressed(bytes).map(Into::into)
    }

    /// Attempts to deserialize an uncompressed element, not checking if the
    /// element is on the curve and not checking if it is in the correct subgroup.
    ///
    /// **This is dangerous to call unless you trust the bytes you are reading; otherwise,
    /// API invariants may be broken.** Please consider using `from_uncompressed()` instead.
    pub fn from_uncompressed_unchecked(bytes: &[u8; UNCOMPRESSED_SIZE]) -> CtOption<Self> {
        G2Affine::from_uncompressed_unchecked(bytes).map(Into::into)
    }

    /// Attempts to deserialize a compressed element.
    pub fn from_compressed(bytes: &[u8; COMPRESSED_SIZE]) -> CtOption<Self> {
        G2Affine::from_compressed(bytes).map(Into::into)
    }

    /// Attempts to deserialize an uncompressed element, not checking if the
    /// element is in the correct subgroup.
    ///
    /// **This is dangerous to call unless you trust the bytes you are reading; otherwise,
    /// API invariants may be broken.** Please consider using `from_compressed()` instead.
    pub fn from_compressed_unchecked(bytes: &[u8; COMPRESSED_SIZE]) -> CtOption<Self> {
        G2Affine::from_compressed_unchecked(bytes).map(Into::into)
    }

    /// Adds this point to another point in the affine model.
    pub fn add_mixed(&self, rhs: &G2Affine) -> G2Projective {
        let mut out = blst_p2::default();

        unsafe { blst_p2_add_or_double_affine(&mut out, &self.0, &rhs.0) };

        G2Projective(out)
    }

    /// Returns true if this point is on the curve. This should always return
    /// true unless an "unchecked" API was used.
    pub fn is_on_curve(&self) -> Choice {
        let is_on_curve = unsafe { Choice::from(blst_p2_on_curve(&self.0) as u8) };
        is_on_curve | self.is_identity()
    }

    fn multiply(&self, scalar: &Scalar) -> G2Projective {
        let mut out = blst_p2::default();

        // Sclar is 255 bits wide.
        const NBITS: usize = 255;

        unsafe { blst_p2_mult(&mut out, &self.0, scalar.to_le_bytes().as_ptr(), NBITS) };

        G2Projective(out)
    }

    pub fn from_raw_unchecked(x: Fp2, y: Fp2, z: Fp2) -> Self {
        let raw = blst_p2 {
            x: x.0,
            y: y.0,
            z: z.0,
        };

        G2Projective(raw)
    }

    /// Returns the x coordinate.
    pub fn x(&self) -> Fp2 {
        Fp2(self.0.x)
    }

    /// Returns the y coordinate.
    pub fn y(&self) -> Fp2 {
        Fp2(self.0.y)
    }

    /// Returns the z coordinate.
    pub fn z(&self) -> Fp2 {
        Fp2(self.0.z)
    }

    impl_pippenger_sum_of_products!();

    #[cfg(feature = "hashing")]
    /// Use a random oracle to map a value to a curve point
    pub fn hash<X>(msg: &[u8], dst: &[u8]) -> Self
    where
        X: for<'a> ExpandMsg<'a>,
    {
        let mut out = blst_p2::default();
        let u = Fp2::hash::<X>(msg, dst);
        unsafe { blst_map_to_g2(&mut out, &u[0].0, &u[1].0) };
        G2Projective(out)
    }

    #[cfg(feature = "hashing")]
    /// Use injective encoding to map a value to a curve point
    pub fn encode<X>(msg: &[u8], dst: &[u8]) -> Self
    where
        X: for<'a> ExpandMsg<'a>,
    {
        let u = Fp2::encode::<X>(msg, dst);
        let mut out = blst_p2::default();
        unsafe { blst_map_to_g2(&mut out, &u.0, std::ptr::null()) };
        G2Projective(out)
    }
}

impl fmt::LowerHex for G2Projective {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:x}", self.to_affine())
    }
}

impl fmt::UpperHex for G2Projective {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:X}", self.to_affine())
    }
}

impl Group for G2Projective {
    type Scalar = Scalar;

    fn random(mut rng: impl RngCore) -> Self {
        let mut out = blst_p2::default();
        let mut msg = [0u8; 64];
        rng.fill_bytes(&mut msg);
        const DST: [u8; 16] = [0; 16];
        const AUG: [u8; 16] = [0; 16];

        unsafe {
            blst_encode_to_g2(
                &mut out,
                msg.as_ptr(),
                msg.len(),
                DST.as_ptr(),
                DST.len(),
                AUG.as_ptr(),
                AUG.len(),
            )
        };

        G2Projective(out)
    }

    fn identity() -> Self {
        G2Projective(blst_p2::default())
    }

    fn generator() -> Self {
        G2Projective(unsafe { *blst_p2_generator() })
    }

    fn is_identity(&self) -> Choice {
        unsafe { Choice::from(blst_p2_is_inf(&self.0) as u8) }
    }

    fn double(&self) -> Self {
        let mut double = blst_p2::default();
        unsafe { blst_p2_double(&mut double, &self.0) };
        G2Projective(double)
    }
}

impl WnafGroup for G2Projective {
    fn recommended_wnaf_for_num_scalars(num_scalars: usize) -> usize {
        const RECOMMENDATIONS: [usize; 11] = [1, 3, 8, 20, 47, 126, 260, 826, 1501, 4555, 84071];

        let mut ret = 4;
        for r in &RECOMMENDATIONS {
            if num_scalars > *r {
                ret += 1;
            } else {
                break;
            }
        }

        ret
    }
}

impl PrimeGroup for G2Projective {}

impl Curve for G2Projective {
    type AffineRepr = G2Affine;

    fn to_affine(&self) -> Self::AffineRepr {
        self.into()
    }
}

impl PrimeCurve for G2Projective {
    type Affine = G2Affine;
}

impl GroupEncoding for G2Projective {
    type Repr = G2Compressed;

    fn from_bytes(bytes: &Self::Repr) -> CtOption<Self> {
        Self::from_compressed(&bytes.0)
    }

    fn from_bytes_unchecked(bytes: &Self::Repr) -> CtOption<Self> {
        Self::from_compressed_unchecked(&bytes.0)
    }

    fn to_bytes(&self) -> Self::Repr {
        G2Compressed(self.to_compressed())
    }
}

impl MulByGenerator for G2Projective {}

impl LinearCombination for G2Projective {}

impl GroupEncoding for G2Affine {
    type Repr = G2Compressed;

    fn from_bytes(bytes: &Self::Repr) -> CtOption<Self> {
        Self::from_compressed(&bytes.0)
    }

    fn from_bytes_unchecked(bytes: &Self::Repr) -> CtOption<Self> {
        Self::from_compressed_unchecked(&bytes.0)
    }

    fn to_bytes(&self) -> Self::Repr {
        G2Compressed(self.to_compressed())
    }
}

impl UncompressedEncoding for G2Affine {
    type Uncompressed = G2Uncompressed;

    fn from_uncompressed(bytes: &Self::Uncompressed) -> CtOption<Self> {
        Self::from_uncompressed(&bytes.0)
    }

    fn from_uncompressed_unchecked(bytes: &Self::Uncompressed) -> CtOption<Self> {
        Self::from_uncompressed_unchecked(&bytes.0)
    }

    fn to_uncompressed(&self) -> Self::Uncompressed {
        G2Uncompressed(self.to_uncompressed())
    }
}

#[derive(Clone, Debug)]
pub struct G2Prepared {
    pub(crate) lines: Vec<blst_fp6>,
    infinity: bool,
}

impl From<G2Affine> for G2Prepared {
    fn from(affine: G2Affine) -> Self {
        if affine.is_identity().into() {
            G2Prepared {
                lines: Vec::new(),
                infinity: true,
            }
        } else {
            let mut lines = vec![blst_fp6::default(); 68];
            unsafe { blst_precompute_lines(lines.as_mut_ptr(), &affine.0) }
            G2Prepared {
                lines,
                infinity: false,
            }
        }
    }
}

impl G2Prepared {
    pub fn is_identity(&self) -> Choice {
        Choice::from(self.infinity as u8)
    }
}

impl PairingCurveAffine for G2Affine {
    type Pair = G1Affine;
    type PairingResult = Gt;

    fn pairing_with(&self, other: &Self::Pair) -> Self::PairingResult {
        <Bls12 as Engine>::pairing(other, self)
    }
}

#[derive(Copy, Clone)]
#[repr(transparent)]
pub struct G2Uncompressed([u8; UNCOMPRESSED_SIZE]);

encoded_point_delegations!(G2Uncompressed);

impl Default for G2Uncompressed {
    fn default() -> Self {
        G2Uncompressed([0u8; UNCOMPRESSED_SIZE])
    }
}

impl fmt::Debug for G2Uncompressed {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> Result<(), fmt::Error> {
        self.0[..].fmt(formatter)
    }
}

#[derive(Copy, Clone)]
#[repr(transparent)]
pub struct G2Compressed([u8; COMPRESSED_SIZE]);

encoded_point_delegations!(G2Compressed);

impl Default for G2Compressed {
    fn default() -> Self {
        G2Compressed([0u8; COMPRESSED_SIZE])
    }
}

impl fmt::Debug for G2Compressed {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> Result<(), fmt::Error> {
        self.0[..].fmt(formatter)
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::eq_op)]

    use super::*;

    use crate::fp::Fp;
    use ff::Field;
    use rand_core::SeedableRng;
    use rand_xorshift::XorShiftRng;

    #[test]
    fn curve_tests() {
        let mut rng = XorShiftRng::from_seed([
            0x59, 0x62, 0xbe, 0x5d, 0x76, 0x3d, 0x31, 0x8d, 0x17, 0xdb, 0x37, 0x32, 0x54, 0x06,
            0xbc, 0xe5,
        ]);

        // Negation edge case with zero.
        {
            let mut z = G2Projective::IDENTITY;
            z = z.neg();
            assert_eq!(z.is_identity().unwrap_u8(), 1);
        }

        // Doubling edge case with zero.
        {
            let mut z = G2Projective::IDENTITY;
            z = z.double();
            assert_eq!(z.is_identity().unwrap_u8(), 1);
        }

        // Addition edge cases with zero
        {
            let mut r = G2Projective::random(&mut rng);
            let rcopy = r;
            r += &G2Projective::IDENTITY;
            assert_eq!(r, rcopy);
            r += &G2Affine::identity();
            assert_eq!(r, rcopy);

            let mut z = G2Projective::IDENTITY;
            z += &G2Projective::IDENTITY;
            assert_eq!(z.is_identity().unwrap_u8(), 1);
            z += &G2Affine::identity();
            assert_eq!(z.is_identity().unwrap_u8(), 1);

            let mut z2 = z;
            z2 += &r;

            z += &G2Affine::from(r);

            assert_eq!(z, z2);
            assert_eq!(z, r);
        }

        // Transformations
        {
            let a = G2Projective::random(&mut rng);
            let b: G2Projective = G2Affine::from(a).into();
            let c = G2Projective::from(G2Affine::from(G2Projective::from(G2Affine::from(a))));

            assert_eq!(a, b);
            assert_eq!(b, c);
        }
    }

    #[test]
    fn g2_test_is_valid() {
        // Reject point on isomorphic twist (b = 3 * (u + 1))
        {
            let p = G2Affine::from_raw_unchecked(
                Fp2::new(
                    Fp::from_raw(&[
                        0xa757072d9fa35ba9,
                        0xae3fb2fb418f6e8a,
                        0xc1598ec46faa0c7c,
                        0x7a17a004747e3dbe,
                        0xcc65406a7c2e5a73,
                        0x10b8c03d64db4d0c,
                    ])
                    .unwrap(),
                    Fp::from_raw(&[
                        0xd30e70fe2f029778,
                        0xda30772df0f5212e,
                        0x5b47a9ff9a233a50,
                        0xfb777e5b9b568608,
                        0x789bac1fec71a2b9,
                        0x1342f02e2da54405,
                    ])
                    .unwrap(),
                ),
                Fp2::new(
                    Fp::from_raw(&[
                        0xfe0812043de54dca,
                        0xe455171a3d47a646,
                        0xa493f36bc20be98a,
                        0x663015d9410eb608,
                        0x78e82a79d829a544,
                        0x40a00545bb3c1e,
                    ])
                    .unwrap(),
                    Fp::from_raw(&[
                        0x4709802348e79377,
                        0xb5ac4dc9204bcfbd,
                        0xda361c97d02f42b2,
                        0x15008b1dc399e8df,
                        0x68128fd0548a3829,
                        0x16a613db5c873aaa,
                    ])
                    .unwrap(),
                ),
                false,
            );
            assert_eq!(p.is_on_curve().unwrap_u8(), 0);
        }

        // Reject point on a twist (b = 2 * (u + 1))
        {
            let p = G2Affine::from_raw_unchecked(
                Fp2::new(
                    Fp::from_raw(&[
                        0xf4fdfe95a705f917,
                        0xc2914df688233238,
                        0x37c6b12cca35a34b,
                        0x41abba710d6c692c,
                        0xffcc4b2b62ce8484,
                        0x6993ec01b8934ed,
                    ])
                    .unwrap(),
                    Fp::from_raw(&[
                        0xb94e92d5f874e26,
                        0x44516408bc115d95,
                        0xe93946b290caa591,
                        0xa5a0c2b7131f3555,
                        0x83800965822367e7,
                        0x10cf1d3ad8d90bfa,
                    ])
                    .unwrap(),
                ),
                Fp2::new(
                    Fp::from_raw(&[
                        0xbf00334c79701d97,
                        0x4fe714f9ff204f9a,
                        0xab70b28002f3d825,
                        0x5a9171720e73eb51,
                        0x38eb4fd8d658adb7,
                        0xb649051bbc1164d,
                    ])
                    .unwrap(),
                    Fp::from_raw(&[
                        0x9225814253d7df75,
                        0xc196c2513477f887,
                        0xe05e2fbd15a804e0,
                        0x55f2b8efad953e04,
                        0x7379345eda55265e,
                        0x377f2e6208fd4cb,
                    ])
                    .unwrap(),
                ),
                false,
            );
            assert_eq!(p.is_on_curve().unwrap_u8(), 0);
            assert_eq!(p.is_torsion_free().unwrap_u8(), 0);
        }

        // Reject point in an invalid subgroup
        // There is only one r-order subgroup, as r does not divide the cofactor.
        {
            let p = G2Affine::from_raw_unchecked(
                Fp2::new(
                    Fp::from_raw(&[
                        0x262cea73ea1906c,
                        0x2f08540770fabd6,
                        0x4ceb92d0a76057be,
                        0x2199bc19c48c393d,
                        0x4a151b732a6075bf,
                        0x17762a3b9108c4a7,
                    ])
                    .unwrap(),
                    Fp::from_raw(&[
                        0x26f461e944bbd3d1,
                        0x298f3189a9cf6ed6,
                        0x74328ad8bc2aa150,
                        0x7e147f3f9e6e241,
                        0x72a9b63583963fff,
                        0x158b0083c000462,
                    ])
                    .unwrap(),
                ),
                Fp2::new(
                    Fp::from_raw(&[
                        0x91fb0b225ecf103b,
                        0x55d42edc1dc46ba0,
                        0x43939b11997b1943,
                        0x68cad19430706b4d,
                        0x3ccfb97b924dcea8,
                        0x1660f93434588f8d,
                    ])
                    .unwrap(),
                    Fp::from_raw(&[
                        0xaaed3985b6dcb9c7,
                        0xc1e985d6d898d9f4,
                        0x618bd2ac3271ac42,
                        0x3940a2dbb914b529,
                        0xbeb88137cf34f3e7,
                        0x1699ee577c61b694,
                    ])
                    .unwrap(),
                ),
                false,
            );
            assert_eq!(p.is_on_curve().unwrap_u8(), 1);
            assert_eq!(p.is_torsion_free().unwrap_u8(), 0);
        }
    }

    #[test]
    fn test_g2_addition_correctness() {
        let mut p = G2Projective::from_raw_unchecked(
            Fp2::new(
                Fp::from_raw(&[
                    0x6c994cc1e303094e,
                    0xf034642d2c9e85bd,
                    0x275094f1352123a9,
                    0x72556c999f3707ac,
                    0x4617f2e6774e9711,
                    0x100b2fe5bffe030b,
                ])
                .unwrap(),
                Fp::from_raw(&[
                    0x7a33555977ec608,
                    0xe23039d1fe9c0881,
                    0x19ce4678aed4fcb5,
                    0x4637c4f417667e2e,
                    0x93ebe7c3e41f6acc,
                    0xde884f89a9a371b,
                ])
                .unwrap(),
            ),
            Fp2::new(
                Fp::from_raw(&[
                    0xe073119472e1eb62,
                    0x44fb3391fe3c9c30,
                    0xaa9b066d74694006,
                    0x25fd427b4122f231,
                    0xd83112aace35cae,
                    0x191b2432407cbb7f,
                ])
                .unwrap(),
                Fp::from_raw(&[
                    0xf68ae82fe97662f5,
                    0xe986057068b50b7d,
                    0x96c30f0411590b48,
                    0x9eaa6d19de569196,
                    0xf6a03d31e2ec2183,
                    0x3bdafaf7ca9b39b,
                ])
                .unwrap(),
            ),
            Fp2::ONE,
        );

        p.add_assign(&G2Projective::from_raw_unchecked(
            Fp2::new(
                Fp::from_raw(&[
                    0xa8c763d25910bdd3,
                    0x408777b30ca3add4,
                    0x6115fcc12e2769e,
                    0x8e73a96b329ad190,
                    0x27c546f75ee1f3ab,
                    0xa33d27add5e7e82,
                ])
                .unwrap(),
                Fp::from_raw(&[
                    0x93b1ebcd54870dfe,
                    0xf1578300e1342e11,
                    0x8270dca3a912407b,
                    0x2089faf462438296,
                    0x828e5848cd48ea66,
                    0x141ecbac1deb038b,
                ])
                .unwrap(),
            ),
            Fp2::new(
                Fp::from_raw(&[
                    0xf5d2c28857229c3f,
                    0x8c1574228757ca23,
                    0xe8d8102175f5dc19,
                    0x2767032fc37cc31d,
                    0xd5ee2aba84fd10fe,
                    0x16576ccd3dd0a4e8,
                ])
                .unwrap(),
                Fp::from_raw(&[
                    0x4da9b6f6a96d1dd2,
                    0x9657f7da77f1650e,
                    0xbc150712f9ffe6da,
                    0x31898db63f87363a,
                    0xabab040ddbd097cc,
                    0x11ad236b9ba02990,
                ])
                .unwrap(),
            ),
            Fp2::ONE,
        ));

        let p = G2Affine::from(p);

        assert_eq!(
            p,
            G2Affine::from_raw_unchecked(
                Fp2::new(
                    Fp::from_raw(&[
                        0xcde7ee8a3f2ac8af,
                        0xfc642eb35975b069,
                        0xa7de72b7dd0e64b7,
                        0xf1273e6406eef9cc,
                        0xababd760ff05cb92,
                        0xd7c20456617e89
                    ])
                    .unwrap(),
                    Fp::from_raw(&[
                        0xd1a50b8572cbd2b8,
                        0x238f0ac6119d07df,
                        0x4dbe924fe5fd6ac2,
                        0x8b203284c51edf6b,
                        0xc8a0b730bbb21f5e,
                        0x1a3b59d29a31274
                    ])
                    .unwrap(),
                ),
                Fp2::new(
                    Fp::from_raw(&[
                        0x9e709e78a8eaa4c9,
                        0xd30921c93ec342f4,
                        0x6d1ef332486f5e34,
                        0x64528ab3863633dc,
                        0x159384333d7cba97,
                        0x4cb84741f3cafe8
                    ])
                    .unwrap(),
                    Fp::from_raw(&[
                        0x242af0dc3640e1a4,
                        0xe90a73ad65c66919,
                        0x2bd7ca7f4346f9ec,
                        0x38528f92b689644d,
                        0xb6884deec59fb21f,
                        0x3c075d3ec52ba90
                    ])
                    .unwrap(),
                ),
                false,
            )
        );
    }

    #[test]
    fn test_g2_doubling_correctness() {
        let mut p = G2Projective::from_raw_unchecked(
            Fp2::new(
                Fp::from_raw(&[
                    0x6c994cc1e303094e,
                    0xf034642d2c9e85bd,
                    0x275094f1352123a9,
                    0x72556c999f3707ac,
                    0x4617f2e6774e9711,
                    0x100b2fe5bffe030b,
                ])
                .unwrap(),
                Fp::from_raw(&[
                    0x7a33555977ec608,
                    0xe23039d1fe9c0881,
                    0x19ce4678aed4fcb5,
                    0x4637c4f417667e2e,
                    0x93ebe7c3e41f6acc,
                    0xde884f89a9a371b,
                ])
                .unwrap(),
            ),
            Fp2::new(
                Fp::from_raw(&[
                    0xe073119472e1eb62,
                    0x44fb3391fe3c9c30,
                    0xaa9b066d74694006,
                    0x25fd427b4122f231,
                    0xd83112aace35cae,
                    0x191b2432407cbb7f,
                ])
                .unwrap(),
                Fp::from_raw(&[
                    0xf68ae82fe97662f5,
                    0xe986057068b50b7d,
                    0x96c30f0411590b48,
                    0x9eaa6d19de569196,
                    0xf6a03d31e2ec2183,
                    0x3bdafaf7ca9b39b,
                ])
                .unwrap(),
            ),
            Fp2::ONE,
        );

        p = p.double();

        let p = G2Affine::from(p);

        assert_eq!(
            p,
            G2Affine::from_raw_unchecked(
                Fp2::new(
                    Fp::from_raw(&[
                        0x91ccb1292727c404,
                        0x91a6cb182438fad7,
                        0x116aee59434de902,
                        0xbcedcfce1e52d986,
                        0x9755d4a3926e9862,
                        0x18bab73760fd8024
                    ])
                    .unwrap(),
                    Fp::from_raw(&[
                        0x4e7c5e0a2ae5b99e,
                        0x96e582a27f028961,
                        0xc74d1cf4ef2d5926,
                        0xeb0cf5e610ef4fe7,
                        0x7b4c2bae8db6e70b,
                        0xf136e43909fca0
                    ])
                    .unwrap(),
                ),
                Fp2::new(
                    Fp::from_raw(&[
                        0x954d4466ab13e58,
                        0x3ee42eec614cf890,
                        0x853bb1d28877577e,
                        0xa5a2a51f7fde787b,
                        0x8b92866bc6384188,
                        0x81a53fe531d64ef
                    ])
                    .unwrap(),
                    Fp::from_raw(&[
                        0x4c5d607666239b34,
                        0xeddb5f48304d14b3,
                        0x337167ee6e8e3cb6,
                        0xb271f52f12ead742,
                        0x244e6c2015c83348,
                        0x19e2deae6eb9b441
                    ])
                    .unwrap(),
                ),
                false,
            )
        );
    }

    #[test]
    fn test_affine_point_equality() {
        let a = G2Affine::generator();
        let b = G2Affine::identity();

        assert_eq!(a, a);
        assert_eq!(b, b);
        assert_ne!(a, b);
        assert_ne!(b, a);
    }

    #[test]
    fn test_projective_point_equality() {
        let a = G2Projective::GENERATOR;
        let b = G2Projective::IDENTITY;

        assert_eq!(a, a);
        assert_eq!(b, b);
        assert_ne!(a, b);
        assert_ne!(b, a);
    }

    #[test]
    fn g2_curve_tests() {
        use group::tests::curve_tests;
        curve_tests::<G2Projective>();
    }

    #[test]
    fn test_g2_is_identity() {
        assert_eq!(G2Projective::IDENTITY.is_identity().unwrap_u8(), 1);
        assert_eq!(G2Projective::GENERATOR.is_identity().unwrap_u8(), 0);
        assert_eq!(G2Affine::identity().is_identity().unwrap_u8(), 1);
        assert_eq!(G2Affine::generator().is_identity().unwrap_u8(), 0);
    }

    #[test]
    fn test_g2_serialization_roundtrip() {
        let mut rng = XorShiftRng::from_seed([
            0x59, 0x62, 0xbe, 0x5d, 0x76, 0x3d, 0x31, 0x8d, 0x17, 0xdb, 0x37, 0x32, 0x54, 0x06,
            0xbc, 0xe5,
        ]);

        for _ in 0..100 {
            let el: G2Affine = G2Projective::random(&mut rng).into();
            let c = el.to_compressed();
            assert_eq!(G2Affine::from_compressed(&c).unwrap(), el);
            assert_eq!(G2Affine::from_compressed_unchecked(&c).unwrap(), el);

            let u = el.to_uncompressed();
            assert_eq!(G2Affine::from_uncompressed(&u).unwrap(), el);
            assert_eq!(G2Affine::from_uncompressed_unchecked(&u).unwrap(), el);

            let c = el.to_bytes();
            assert_eq!(G2Affine::from_bytes(&c).unwrap(), el);
            assert_eq!(G2Affine::from_bytes_unchecked(&c).unwrap(), el);

            let el = G2Projective::random(&mut rng);
            let c = el.to_compressed();
            assert_eq!(G2Projective::from_compressed(&c).unwrap(), el);
            assert_eq!(G2Projective::from_compressed_unchecked(&c).unwrap(), el);

            let u = el.to_uncompressed();
            assert_eq!(G2Projective::from_uncompressed(&u).unwrap(), el);
            assert_eq!(G2Projective::from_uncompressed_unchecked(&u).unwrap(), el);

            let c = el.to_bytes();
            assert_eq!(G2Projective::from_bytes(&c).unwrap(), el);
            assert_eq!(G2Projective::from_bytes_unchecked(&c).unwrap(), el);
        }
    }

    #[test]
    fn test_multi_exp() {
        const SIZE: usize = 128;
        let mut rng = XorShiftRng::from_seed([
            0x59, 0x62, 0xbe, 0x5d, 0x76, 0x3d, 0x31, 0x8d, 0x17, 0xdb, 0x37, 0x32, 0x54, 0x06,
            0xbc, 0xe5,
        ]);

        let points: Vec<G2Projective> = (0..SIZE).map(|_| G2Projective::random(&mut rng)).collect();
        let scalars: Vec<Scalar> = (0..SIZE).map(|_| Scalar::random(&mut rng)).collect();

        let mut naive = points[0] * scalars[0];
        for i in 1..SIZE {
            naive += points[i] * scalars[i];
        }

        let pippenger = G2Projective::sum_of_products(points.as_slice(), scalars.as_slice());

        assert_eq!(naive, pippenger);
    }

    #[test]
    fn test_hex() {
        let g1 = G2Projective::GENERATOR;
        let hex = format!("{:x}", g1);
        let g2 = G2Affine::from_compressed_hex(&hex).map(G2Projective::from);
        assert_eq!(g2.is_some().unwrap_u8(), 1u8);
        assert_eq!(g1, g2.unwrap());
        let hex = hex::encode(g1.to_affine().to_uncompressed().as_ref());
        let g2 = G2Affine::from_uncompressed_hex(&hex).map(G2Projective::from);
        assert_eq!(g2.is_some().unwrap_u8(), 1u8);
        assert_eq!(g1, g2.unwrap());
    }

    #[test]
    fn test_identity() {
        let id = G2Projective::IDENTITY;
        let id2 = G2Projective::identity();
        assert_eq!(id, id2);
    }

    #[test]
    fn test_generator() {
        let gen1 = G2Projective::GENERATOR;
        let gen2 = G2Projective::generator();
        assert_eq!(gen1, gen2);
    }

    #[cfg(feature = "hashing")]
    #[test]
    fn test_hash() {
        use elliptic_curve::hash2curve::ExpandMsgXmd;
        use std::convert::TryFrom;
        const DST: &'static [u8] = b"QUUX-V01-CS02-with-BLS12381G2_XMD:SHA-256_SSWU_RO_";

        let tests: [(&[u8], &str); 5] = [
            (b"", "05cb8437535e20ecffaef7752baddf98034139c38452458baeefab379ba13dff5bf5dd71b72418717047f5b0f37da03d0141ebfbdca40eb85b87142e130ab689c673cf60f1a3e98d69335266f30d9b8d4ac44c1038e9dcdd5393faf5c41fb78a12424ac32561493f3fe3c260708a12b7c620e7be00099a974e259ddc7d1f6395c3c811cdd19f1e8dbf3e9ecfdcbab8d60503921d7f6a12805e72940b963c0cf3471c7b2a524950ca195d11062ee75ec076daf2d4bc358c4b190c0c98064fdd92"),
            (b"abc", "139cddbccdc5e91b9623efd38c49f81a6f83f175e80b06fc374de9eb4b41dfe4ca3a230ed250fbe3a2acf73a41177fd802c2d18e033b960562aae3cab37a27ce00d80ccd5ba4b7fe0e7a210245129dbec7780ccc7954725f4168aff2787776e600aa65dae3c8d732d10ecd2c50f8a1baf3001578f71c694e03866e9f3d49ac1e1ce70dd94a733534f106d4cec0eddd161787327b68159716a37440985269cf584bcb1e621d3a7202be6ea05c4cfe244aeb197642555a0645fb87bf7466b2ba48"),
            (b"abcdef0123456789", "190d119345b94fbd15497bcba94ecf7db2cbfd1e1fe7da034d26cbba169fb3968288b3fafb265f9ebd380512a71c3f2c121982811d2491fde9ba7ed31ef9ca474f0e1501297f68c298e9f4c0028add35aea8bb83d53c08cfc007c1e005723cd00bb5e7572275c567462d91807de765611490205a941a5a6af3b1691bfe596c31225d3aabdf15faff860cb4ef17c7c3be05571a0f8d3c08d094576981f4a3b8eda0a8e771fcdcc8ecceaf1356a6acf17574518acb506e435b639353c2e14827c8"),
            (b"q128_qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq", "0934aba516a52d8ae479939a91998299c76d39cc0c035cd18813bec433f587e2d7a4fef038260eef0cef4d02aae3eb9119a84dd7248a1066f737cc34502ee5555bd3c19f2ecdb3c7d9e24dc65d4e25e50d83f0f77105e955d78f4762d33c17da09bcccfa036b4847c9950780733633f13619994394c23ff0b32fa6b795844f4a0673e20282d07bc69641cee04f5e566214f81cd421617428bc3b9fe25afbb751d934a00493524bc4e065635b0555084dd54679df1536101b2c979c0152d09192"),
            (b"a512_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "11fca2ff525572795a801eed17eb12785887c7b63fb77a42be46ce4a34131d71f7a73e95fee3f812aea3de78b4d0156901a6ba2f9a11fa5598b2d8ace0fbe0a0eacb65deceb476fbbcb64fd24557c2f4b18ecfc5663e54ae16a84f5ab7f6253403a47f8e6d1763ba0cad63d6114c0accbef65707825a511b251a660a9b3994249ae4e63fac38b23da0c398689ee2ab520b6798718c8aed24bc19cb27f866f1c9effcdbf92397ad6448b5c9db90d2b9da6cbabf48adc1adf59a1a28344e79d57e")
        ];

        for (msg, exp) in &tests {
            let a = G2Projective::hash::<ExpandMsgXmd<sha2::Sha256>>(msg, DST);
            let d = <[u8; 192]>::try_from(hex::decode(exp).unwrap().as_slice()).unwrap();
            let e = G2Affine::from_uncompressed(&d).unwrap();
            assert_eq!(a.to_affine(), e);
        }
    }

    #[cfg(feature = "hashing")]
    #[test]
    fn encode_to_curve_g2() {
        use elliptic_curve::hash2curve::ExpandMsgXmd;
        //suite   = BLS12381G2_XMD:SHA-256_SSWU_NU_
        const DST: &'static [u8] = b"QUUX-V01-CS02-with-BLS12381G2_XMD:SHA-256_SSWU_NU_";
        let tests: [(&[u8], &str); 5] = [
            (b"", "126b855e9e69b1f691f816e48ac6977664d24d99f8724868a184186469ddfd4617367e94527d4b74fc86413483afb35b00e7f4568a82b4b7dc1f14c6aaa055edf51502319c723c4dc2688c7fe5944c213f510328082396515734b6612c4e7bb71498aadcf7ae2b345243e281ae076df6de84455d766ab6fcdaad71fab60abb2e8b980a440043cd305db09d283c895e3d0caead0fd7b6176c01436833c79d305c78be307da5f6af6c133c47311def6ff1e0babf57a0fb5539fce7ee12407b0a42"),
            (b"abc", "0296238ea82c6d4adb3c838ee3cb2346049c90b96d602d7bb1b469b905c9228be25c627bffee872def773d5b2a2eb57d108ed59fd9fae381abfd1d6bce2fd2fa220990f0f837fa30e0f27914ed6e1454db0d1ee957b219f61da6ff8be0d6441f153606c417e59fb331b7ae6bce4fbf7c5190c33ce9402b5ebe2b70e44fca614f3f1382a3625ed5493843d0b0a652fc3f033f90f6057aadacae7963b0a0b379dd46750c1c94a6357c99b65f63b79e321ff50fe3053330911c56b6ceea08fee656"),
            (b"abcdef0123456789", "0da75be60fb6aa0e9e3143e40c42796edf15685cafe0279afd2a67c3dff1c82341f17effd402e4f1af240ea90f4b659b038af300ef34c7759a6caaa4e69363cafeed218a1f207e93b2c70d91a1263d375d6730bd6b6509dcac3ba5b567e85bf30492f4fed741b073e5a82580f7c663f9b79e036b70ab3e51162359cec4e77c78086fe879b65ca7a47d34374c8315ac5e19b148cbdf163cf0894f29660d2e7bfb2b68e37d54cc83fd4e6e62c020eaa48709302ef8e746736c0e19342cc1ce3df4"),
            (b"q128_qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq", "12c8c05c1d5fc7bfa847f4d7d81e294e66b9a78bc9953990c358945e1f042eedafce608b67fdd3ab0cb2e6e263b9b1ad0c5ae723be00e6c3f0efe184fdc0702b64588fe77dda152ab13099a3bacd3876767fa7bbad6d6fd90b3642e902b208f911c624c56dbe154d759d021eec60fab3d8b852395a89de497e48504366feedd4662d023af447d66926a28076813dd64604e77ddb3ede41b5ec4396b7421dd916efc68a358a0d7425bddd253547f2fb4830522358491827265dfc5bcc1928a569"),
            (b"a512_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "1565c2f625032d232f13121d3cfb476f45275c303a037faa255f9da62000c2c864ea881e2bcddd111edc4a3c0da3e88d0ea4e7c33d43e17cc516a72f76437c4bf81d8f4eac69ac355d3bf9b71b8138d55dc10fd458be115afa798b55dac34be10f8991d2a1ad662e7b6f58ab787947f1fa607fce12dde171bc17903b012091b657e15333e11701edcf5b63ba2a561247043b6f5fe4e52c839148dc66f2b3751e69a0f6ebb3d056d6465d50d4108543ecd956e10fa1640dfd9bc0030cc2558d28")
        ];

        for (msg, p) in &tests {
            let p_bytes = hex::decode(p).unwrap();
            let e = G2Projective::from(
                G2Affine::from_uncompressed(&<[u8; 192]>::try_from(p_bytes.as_slice()).unwrap())
                    .unwrap(),
            );
            let a = G2Projective::encode::<ExpandMsgXmd<sha2::Sha256>>(msg, DST);
            assert_eq!(a, e);
        }
    }
}
