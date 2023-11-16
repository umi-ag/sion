// Requires the caller to manually implement `Add<&rhs, Output = output> for &lhs` and
// `Sub<&rhs, Output = output> for &lhs`.
macro_rules! impl_add_sub {
    ($t:ident) => {
        impl_add_sub!($t, $t, $t);
    };
    ($lhs:ident, $rhs:ident) => {
        impl_add_sub!($lhs, $rhs, $lhs);
    };
    ($lhs:ident, $rhs:ident, $output:ident) => {
        impl Add<&$rhs> for $lhs {
            type Output = $output;

            #[inline]
            fn add(self, rhs: &$rhs) -> $output {
                &self + rhs
            }
        }

        impl Add<$rhs> for &$lhs {
            type Output = $output;

            #[inline]
            fn add(self, rhs: $rhs) -> $output {
                self + &rhs
            }
        }

        impl Add<$rhs> for $lhs {
            type Output = $output;

            #[inline]
            fn add(self, rhs: $rhs) -> $output {
                &self + &rhs
            }
        }

        impl Sub<&$rhs> for $lhs {
            type Output = $output;

            #[inline]
            fn sub(self, rhs: &$rhs) -> $output {
                &self - rhs
            }
        }

        impl Sub<$rhs> for &$lhs {
            type Output = $output;

            #[inline]
            fn sub(self, rhs: $rhs) -> $output {
                self - &rhs
            }
        }

        impl Sub<$rhs> for $lhs {
            type Output = $output;

            #[inline]
            fn sub(self, rhs: $rhs) -> $output {
                &self - &rhs
            }
        }
    };
}

// Requires the caller to manually implement `AddAssign<&rhs> for lhs` and
// `SubAssign<&rhs> for lhs`.
macro_rules! impl_add_sub_assign {
    ($t:ident) => {
        impl_add_sub_assign!($t, $t);
    };
    ($lhs:ident, $rhs:ident) => {
        impl AddAssign<$rhs> for $lhs {
            #[inline]
            fn add_assign(&mut self, rhs: $rhs) {
                self.add_assign(&rhs);
            }
        }

        impl SubAssign<$rhs> for $lhs {
            #[inline]
            fn sub_assign(&mut self, rhs: $rhs) {
                self.sub_assign(&rhs);
            }
        }
    };
}

// Requires the caller to manually implement `Mul<&rhs, Output = output> for &lhs`.
macro_rules! impl_mul {
    ($t:ident) => {
        impl_mul!($t, $t, $t);
    };
    ($lhs:ident, $rhs:ident) => {
        impl_mul!($lhs, $rhs, $lhs);
    };
    ($lhs:ident, $rhs:ident, $output:ident) => {
        impl Mul<&$rhs> for $lhs {
            type Output = $output;

            #[inline]
            fn mul(self, rhs: &$rhs) -> $output {
                &self * rhs
            }
        }

        impl Mul<$rhs> for &$lhs {
            type Output = $output;

            #[inline]
            fn mul(self, rhs: $rhs) -> $output {
                self * &rhs
            }
        }

        impl Mul<$rhs> for $lhs {
            type Output = $output;

            #[inline]
            fn mul(self, rhs: $rhs) -> $output {
                &self * &rhs
            }
        }
    };
}

// Requires the caller to manually implement `MulAssign<&rhs> for lhs`.
macro_rules! impl_mul_assign {
    ($t:ident) => {
        impl_mul_assign!($t, $t);
    };
    ($lhs:ident, $rhs:ident) => {
        impl MulAssign<$rhs> for $lhs {
            #[inline]
            fn mul_assign(&mut self, rhs: $rhs) {
                self.mul_assign(&rhs);
            }
        }
    };
}

macro_rules! encoded_point_delegations {
    ($t:ident) => {
        impl AsRef<[u8]> for $t {
            fn as_ref(&self) -> &[u8] {
                &self.0
            }
        }
        impl AsMut<[u8]> for $t {
            fn as_mut(&mut self) -> &mut [u8] {
                &mut self.0
            }
        }

        impl PartialEq for $t {
            fn eq(&self, other: &$t) -> bool {
                PartialEq::eq(&self.0[..], &other.0[..])
            }
        }
        impl Eq for $t {}
        impl PartialOrd for $t {
            fn partial_cmp(&self, other: &$t) -> Option<::core::cmp::Ordering> {
                PartialOrd::partial_cmp(&self.0[..], &other.0[..])
            }
        }
        impl Ord for $t {
            fn cmp(&self, other: &Self) -> ::core::cmp::Ordering {
                Ord::cmp(&self.0[..], &other.0[..])
            }
        }

        impl ::core::hash::Hash for $t {
            fn hash<H: ::core::hash::Hasher>(&self, state: &mut H) {
                self.0[..].hash(state);
            }
        }
    };
} // encoded_point_delegations

macro_rules! impl_add {
    ($t:ident) => {
        impl_add!($t, $t, $t);
    };
    ($lhs:ident, $rhs:ident) => {
        impl_add!($lhs, $rhs, $lhs);
    };
    ($lhs:ident, $rhs:ident, $output:ident) => {
        impl Add<&$rhs> for $lhs {
            type Output = $output;

            #[inline]
            fn add(self, rhs: &$rhs) -> $output {
                &self + rhs
            }
        }

        impl Add<$rhs> for &$lhs {
            type Output = $output;

            #[inline]
            fn add(self, rhs: $rhs) -> $output {
                self + &rhs
            }
        }

        impl Add<$rhs> for $lhs {
            type Output = $output;

            #[inline]
            fn add(self, rhs: $rhs) -> $output {
                &self + &rhs
            }
        }
    };
}

// Requires the caller to manually implement `AddAssign<rhs> for lhs`, same for reference-based.
macro_rules! impl_sum {
    ($t:ident) => {
        impl_sum!($t, $t);
    };
    ($lhs:ident, $rhs:ident) => {
        impl std::iter::Sum<$rhs> for $lhs {
            fn sum<I: Iterator<Item = $rhs>>(iter: I) -> $rhs {
                let mut res = $rhs::ZERO;
                for item in iter {
                    res += item;
                }
                res
            }
        }

        impl<'a> std::iter::Sum<&'a $rhs> for $lhs {
            fn sum<I: Iterator<Item = &'a $rhs>>(iter: I) -> $rhs {
                iter.sum()
            }
        }
    };
}

// Requires the caller to manually implement `MulAssign<rhs> for lhs`, same for reference-based.
macro_rules! impl_product {
    ($t:ident) => {
        impl_product!($t, $t);
    };
    ($lhs:ident, $rhs:ident) => {
        impl std::iter::Product<$rhs> for $lhs {
            fn product<I: Iterator<Item = $rhs>>(iter: I) -> $rhs {
                let mut res = $rhs::ONE;
                for item in iter {
                    res *= item;
                }
                res
            }
        }

        impl<'a> std::iter::Product<&'a $rhs> for $lhs {
            fn product<I: Iterator<Item = &'a $rhs>>(iter: I) -> $rhs {
                iter.product()
            }
        }
    };
}

macro_rules! impl_pippenger_sum_of_products {
    () => {
        /// Use pippenger multi-exponentiation method to compute
        /// the sum of multiple points raise to scalars.
        /// This uses a fixed window of 4 to be constant time
        pub fn sum_of_products(points: &[Self], scalars: &[Scalar]) -> Self {
            let ss: Vec<_> = scalars.iter().map(|s| s.to_raw()).collect();
            Self::sum_of_products_pippenger(points, ss.as_slice())
        }

        /// Compute pippenger multi-exponentiation.
        /// Pippenger relies on scalars in canonical form
        /// This uses a fixed window of 4 to be constant time
        fn sum_of_products_pippenger(points: &[Self], scalars: &[[u64; 4]]) -> Self {
            const WINDOW: usize = 4;
            const NUM_BUCKETS: usize = 1 << WINDOW;
            const EDGE: usize = WINDOW - 1;
            const MASK: u64 = (NUM_BUCKETS - 1) as u64;

            let num_components = core::cmp::min(points.len(), scalars.len());
            let mut buckets = [Self::IDENTITY; NUM_BUCKETS];
            let mut res = Self::IDENTITY;
            let mut num_doubles = 0;
            let mut bit_sequence_index = 255usize; // point to top bit we need to process

            loop {
                for _ in 0..num_doubles {
                    res = res.double();
                }

                let mut max_bucket = 0;
                let word_index = bit_sequence_index >> 6; // divide by 64 to find word_index
                let bit_index = bit_sequence_index & 63; // mod by 64 to find bit_index

                if bit_index < EDGE {
                    // we are on the edge of a word; have to look at the previous word, if it exists
                    if word_index == 0 {
                        // there is no word before
                        let smaller_mask = ((1 << (bit_index + 1)) - 1) as u64;
                        for i in 0..num_components {
                            let bucket_index: usize =
                                (scalars[i][word_index] & smaller_mask) as usize;
                            if bucket_index > 0 {
                                buckets[bucket_index] += points[i];
                                if bucket_index > max_bucket {
                                    max_bucket = bucket_index;
                                }
                            }
                        }
                    } else {
                        // there is a word before
                        let high_order_mask = ((1 << (bit_index + 1)) - 1) as u64;
                        let high_order_shift = EDGE - bit_index;
                        let low_order_mask = ((1 << high_order_shift) - 1) as u64;
                        let low_order_shift = 64 - high_order_shift;
                        let prev_word_index = word_index - 1;
                        for i in 0..num_components {
                            let mut bucket_index = ((scalars[i][word_index] & high_order_mask)
                                << high_order_shift)
                                as usize;
                            bucket_index |= ((scalars[i][prev_word_index] >> low_order_shift)
                                & low_order_mask) as usize;
                            if bucket_index > 0 {
                                buckets[bucket_index] += points[i];
                                if bucket_index > max_bucket {
                                    max_bucket = bucket_index;
                                }
                            }
                        }
                    }
                } else {
                    let shift = bit_index - EDGE;
                    for i in 0..num_components {
                        let bucket_index: usize =
                            ((scalars[i][word_index] >> shift) & MASK) as usize;
                        assert!(bit_sequence_index != 255 || scalars[i][3] >> 63 == 0);
                        if bucket_index > 0 {
                            buckets[bucket_index] += points[i];
                            if bucket_index > max_bucket {
                                max_bucket = bucket_index;
                            }
                        }
                    }
                }
                res += &buckets[max_bucket];
                for i in (1..max_bucket).rev() {
                    buckets[i] += buckets[i + 1];
                    res += buckets[i];
                    buckets[i + 1] = Self::IDENTITY;
                }
                buckets[1] = Self::IDENTITY;
                if bit_sequence_index < WINDOW {
                    break;
                }
                bit_sequence_index -= WINDOW;
                num_doubles = {
                    if bit_sequence_index < EDGE {
                        bit_sequence_index + 1
                    } else {
                        WINDOW
                    }
                };
            }
            res
        }
    };
}
