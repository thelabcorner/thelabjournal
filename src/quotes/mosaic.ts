import type { Quote } from './data'

/**
 * Mosaic presentation order: respect archive-date groups while distributing
 * long passages rather than pairing multiple essay-length texts in a row.
 * This never changes stored text, attribution, explicit collection order,
 * source ordering by author, or the order used by full-text search.
 */
export const isLongPassage = (quote:Quote):boolean =>
  quote.text.length >= 215 || quote.text.trim().split(/\s+/).length >= 45

export function composeQuoteMosaic<T extends Quote>(sorted:readonly T[]):T[] {
  if(sorted.length <= 4) return [...sorted]
  const result:T[]=[]
  for(let start=0;start<sorted.length;){
    let end=start+1
    const date=sorted[start].addedAt
    while(end<sorted.length && sorted[end].addedAt===date) end++
    const slice=sorted.slice(start,end)
    const lengthy=slice.filter(isLongPassage)
    const regular=slice.filter(quote=>!isLongPassage(quote))
    if(!lengthy.length || !regular.length){
      result.push(...slice); start=end;continue
    }
    const placement=Array<T|null>(slice.length).fill(null)
    // Equal-rhythm target positions, balancing against immediate neighbors.
    for(let j=0;j<lengthy.length;j++){
      const target=Math.round((j+.7)*slice.length/(lengthy.length+1))
      let best=-1, score=Infinity
      for(let slot=0;slot<placement.length;slot++){
        if(placement[slot])continue
        const neighbor=(slot>0&&placement[slot-1]!==null?1:0)+(slot+1<placement.length&&placement[slot+1]!==null?1:0)
        // Keep essay-length snippets separated wherever enough shorter
        // excerpts exist; never force a chronological date boundary.
        const cost=Math.abs(slot-target)+neighbor*50
        if(cost<score){score=cost;best=slot}
      }
      placement[best]=lengthy[j]
    }
    let r=0
    for(let i=0;i<placement.length;i++)if(!placement[i])placement[i]=regular[r++]
    result.push(...placement as T[])
    start=end
  }
  return result
}
