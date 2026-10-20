from pathlib import Path
import json, re
p=Path("src/manuscript-runtime/data/papers/sublimation/equationPython.ts")
s=p.read_text(encoding="utf-8")
examples={
"1.1":("Chemical potential at the ice-vapor interface",'''from sympy import symbols, log, exp, Eq, solve, pprint
R,T,p_w,p_sat,v_ice,P_total=symbols(
    "R T p_w p_sat v_ice P_total", positive=True)
delta_mu = R*T*log(p_w/p_sat)-v_ice*(P_total-p_sat)
pprint(solve(Eq(delta_mu, 0), p_w)[0])
# Small correction to equilibrium vapor pressure under total pressure.
'''),
"3.2":("Water-vapor chamber inventory",'''from sympy import symbols, Function, Eq, diff, pprint
t,R,V_g,M_w,A_p=symbols("t R V_g M_w A_p", positive=True)
p_w,T_g,j,n_cond,n_pump=(Function(n)(t) for n in
    ("p_w","T_g","j","n_cond","n_pump"))
n_g=p_w*V_g/(R*T_g)
vapor_balance=Eq(diff(n_g,t), A_p*j/M_w-n_cond-n_pump)
pprint(vapor_balance)  # n_cond, n_pump are molar rates
'''),
"3.4":("Coupled energy and mass flux",'''from sympy import symbols, Function, Eq, pprint
K, Ts, Ti, H, Gamma, j, p_w, Rp = symbols(
    "K Ts Ti H Gamma j p_w Rp", positive=True)
P_sat=Function("P_sat")
pprint(Eq(K*(Ts-Ti), H*Gamma*j))
pprint(Eq(j,(P_sat(Ti)-p_w)/Rp))
# Gamma = sublimating area / heat transfer area
'''),
"4.3":("Free-molecular heat-transfer coefficient",'''from sympy import symbols, sqrt, pi, simplify, pprint
alpha,gamma,R,M,Tg=symbols("alpha gamma R M Tg", positive=True)
beta=alpha*(gamma+1)/(gamma-1)*sqrt(R/(8*pi*M*Tg))
pprint(beta)  # W / (m² K Pa) for compatible SI inputs
# Ratio comparisons require assumed gas-surface accommodation.
'''),
"4.4":("Four-path energy and vapor balances",'''from sympy import symbols, Function, Eq, pprint
Kc,Kr,Kg,Kf,Ts,Ti,H,Gamma,j,p_w,Rp=symbols(
    "Kc Kr Kg Kf Ts Ti H Gamma j p_w Rp", positive=True)
Psat=Function("Psat")
Keff=Kc+Kr+Kg+Kf
pprint(Eq(Keff*(Ts-Ti),H*Gamma*j))
pprint(Eq(j,(Psat(Ti)-p_w)/Rp))
''')
}
for key,(title,code) in examples.items():
 line='  '+json.dumps(key)+': { title: '+json.dumps(title)+', code: '+json.dumps(code,ensure_ascii=False)+' },'
 pat=r'^  "'+re.escape(key)+r'": \{ title: .* \},$'
 s,n=re.subn(pat,lambda match:line,s,flags=re.MULTILINE)
 assert n==1,(key,n)
p.write_text(s,encoding="utf-8")
print("Updated",len(examples),"executable equation examples")
