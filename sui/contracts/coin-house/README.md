


- add_liquidity: SY + FY -> VY

- remove_liquidity: VY -> SY + FY

- swap_x_to_y: SY -> FY

- swap_y_to_x: FY -> SY


1) swap_sy_to_fy
  - swap_x_to_y

2) swap_fy_to_sy
  - swap_y_to_x

3) swap_sy_to_vy
  - swap_x_to_y
  - add_liquidity

4) swap_vy_to_sy
  - remove_liquidity
  - swap_y_to_x

5) swap_fy_to_vy
  - swap_y_to_x
  - swap_x_to_y
  - add_liquidity

6) swap_fy_to_vy
  - remove_liquidity
  - swap_x_to_y
  - swap_y_to_x
