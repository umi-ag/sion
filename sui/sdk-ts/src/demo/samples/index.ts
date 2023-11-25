export const sampleDrivingBehavior = {
  driving_distance: 1_234_456_123_456,
  rapid_acceleration_count: 2_000_000,
  rapid_deceleration_count: 3_000_000,
  sharp_steering_count: 5_000_000,
  // speeding_violation_count: 200000,
  // traffic_signal_violation_count: 100000,
  night_driving_distance_ratio: 354_321,
  highway_driving_distance_ratio: 768_901,
  over_idle_time: 2_345_543_210,
  overheat_count: 0,
  // maintenance_history: '20230301: オイル交換, 20221110: タイヤ交換',
} as const;

export const sampleTrafficViolation = {
  stop_sign_violations: 300000,
  red_light_violations: 200000,
  speeding_violations: 150000,
  parking_violations: 50000,
  license_violations: 10000,
  accident_counts: 250000,
  drunk_driving_counts: 5000,
  reckless_driving_counts: 40000,
  phone_use_violations: 80000,
  seatbelt_violations: 70000,
  vehicle_defects: 20000,
} as const;
