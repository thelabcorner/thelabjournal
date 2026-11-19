/* Publication dither adapted verbatim in mathematical structure from thelabjournal™
   scripts/pdf-publication-layout.mjs; this is original WebSeal-compatible Bayer field. */
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync } from 'node:fs'
const bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5]
const clamp=v=>Math.max(0,Math.min(1,v))
function cellNoise(x,y){let v=Math.imul(x+1,374761393)^Math.imul(y+1,668265263);v=Math.imul(v^(v>>>13),1274126177);return ((v^(v>>>16))>>>0)/4294967296}
function navDither(w=1600,h=95,pitch=5) {
 let rects=[]
 const cols=Math.ceil(w/pitch), rows=Math.ceil(h/pitch)
 for(let ry=0;ry<rows;ry++)for(let cx=0;cx<cols;cx++){
  const u=(cx+.5)/cols,v=(ry+.5)/rows
  const lane=Math.floor(ry/4),section=(Math.floor(cx/18)+lane*3)%4
  const local=cx%18,noise=cellNoise(cx,ry)
  let occupancy
  if(section===0)occupancy=(local<3||local>15)?.17:.58+noise*.24
  else if(section===1)occupancy=(ry%5===0||local>12)?.15:.36+noise*.30
  else if(section===2)occupancy=(ry%7<3)?.48+noise*.26:.12
  else occupancy=noise>.48?.61:.15
  const gap=ry%9===0?.28:1
  const edge=clamp(u/.065)*clamp((1-u)/.065)
  const drift=(Math.sin(u*18+v*3)+1)*.09
  const coverage=clamp((occupancy*gap+drift)*edge*.95)
  const ordered=(bayer[((ry&3)<<2)|(cx&3)]+.5)/16
  if(coverage<=ordered)continue
  const alpha=(.24+coverage*.64)*.78
  rects.push(`<rect x="${cx*pitch}" y="${ry*pitch}" width="${(pitch*.42).toFixed(2)}" height="${(pitch*.42).toFixed(2)}" fill="#71717a" opacity="${alpha.toFixed(3)}"/>`)
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#ffffff"/>${rects.join('')}</svg>`
}
const svg=navDither()
writeFileSync(new URL('./dither.svg',import.meta.url),svg)
const png=new Resvg(svg,{fitTo:{mode:'width',value:2400}}).render().asPng()
writeFileSync(new URL('./dither.png',import.meta.url),png)
console.log('thelabjournal™ native Bayer dither: svg',svg.length,'png',png.length)
