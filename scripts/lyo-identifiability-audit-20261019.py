"""Identifiability check for the single-wet-zone chamber-removal closure.

Steady net mass flux alone cannot distinguish product resistance from
condenser/path resistance. A second, independently measured water-vapor
partial-pressure difference removes the *local* algebraic ambiguity, provided
the reference-side vapor pressure and thermal resistance are identified.
This is mathematical observability, not hardware sensor validation.
"""
from sympy import symbols, Matrix, simplify, diff, factor

Rp, Rc, Rh, D = symbols("Rp Rc Rh D", positive=True)
denom = Rp + Rc + Rh
j = D / denom
pw_excess = Rc * j

J_flux = Matrix([[diff(j, Rp), diff(j, Rc)]])
assert J_flux.rank() == 1
assert simplify(J_flux[0, 0] - J_flux[0, 1]) == 0

J_joint = Matrix([
    [diff(j, Rp), diff(j, Rc)],
    [diff(pw_excess, Rp), diff(pw_excess, Rc)]
])
assert simplify(J_joint.det() + D**2 / denom**3) == 0
assert J_joint.rank() == 2
print("Flux-only Jacobian rank:", J_flux.rank())
print("Flux plus water-pressure Jacobian rank:", J_joint.rank())
print("Joint sensitivity determinant:", factor(J_joint.det()))

# Finite-resistance tradeoff: same flux at a fixed operating point.
base = {Rp: 1_000_000, Rc: 555_555, Rh: 400_000, D: 170}
shifted = {Rp: 1_250_000, Rc: 305_555, Rh: 400_000, D: 170}
assert j.subs(base) == j.subs(shifted)
assert pw_excess.subs(base) != pw_excess.subs(shifted)
print("An alternate resistance split reproduces mass flux but changes p_w.")
print("Mathematical identifiability regression: PASS")
