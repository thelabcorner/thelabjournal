import type { NavSection } from '../../../types/thesis'

/** Heading IDs for the active React research edition (v0.2), not archived v0.1 TeX. */
export const thcaLimoneneNav: NavSection[] = [
  {id:'title',label:'Title Page',level:'chapter'},
  {id:'abstract',label:'Abstract',level:'chapter'},
  {id:'introduction',label:'1. Introduction',level:'chapter'},
  {id:'framework',label:'2. Thermodynamic Framework',level:'chapter',children:[
    {id:'framework-sle',label:'2.1 Solid–Liquid Equilibrium',level:'section'},
    {id:'framework-lle',label:'2.2 Liquid Mixing Stability',level:'section'},
    {id:'framework-vle',label:'2.3 Hydrocarbon Phase State',level:'section'},
    {id:'framework-basis',label:'2.4 Concentration Bases',level:'section'},
  ]},
  {id:'methods',label:'3. Methods and Provenance',level:'chapter',children:[
    {id:'methods-descriptors',label:'3.1 Electronic-Structure Inputs',level:'section'},
    {id:'methods-grid',label:'3.2 Activity Grid and Solvers',level:'section'},
    {id:'methods-solid',label:'3.3 Solid-State Reference',level:'section'},
  ]},
  {id:'results',label:'4. Results',level:'chapter',children:[
    {id:'results-liquid',label:'4.1 Liquid Activity and Stability',level:'section'},
    {id:'results-sle',label:'4.2 Conditional Solid Saturation',level:'section'},
    {id:'results-sensitivity',label:'4.3 Model Sensitivity',level:'section'},
    {id:'results-identity',label:'4.4 Chemical and Phase Identity',level:'section'},
  ]},
  {id:'extension',label:'5. Solvent Research Program',level:'chapter',children:[
    {id:'extension-matrix',label:'5.1 112-Case Matrix',level:'section'},
    {id:'extension-benchmark',label:'5.2 External Experimental Benchmark',level:'section'},
    {id:'extension-hydrocarbon',label:'5.3 Liquefied Hydrocarbons',level:'section'},
  ]},
  {id:'discussion',label:'6. Discussion',level:'chapter'},
  {id:'experimental',label:'7. Experimental Discrimination',level:'chapter'},
  {id:'conclusion',label:'8. Conclusions',level:'chapter'},
  {id:'provenance',label:'Research Provenance',level:'chapter'},
  {id:'references',label:'References',level:'chapter'}
]
function flatten(items:NavSection[]):string[]{return items.flatMap(s=>[s.id,...flatten(s.children??[])])}
export const thcaLimoneneSectionIds = flatten(thcaLimoneneNav)