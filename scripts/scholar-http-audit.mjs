/**
 * End-to-end HTTP checks against the actual built Scholar publication pages.
 * Uses ordinary crawlers (no browser JS), including a Scholar crawler UA.
 * Journal posts remain general web pages rather than scholarly records.
 */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { PAPER_DEFINITIONS } from '../src/manuscript-runtime/data/papers/index.ts'
import { entries } from '../src/data.ts'

const port=13994
const appBase=process.env.GITHUB_PAGES === 'true' ? '/thelabjournal/' : '/'
const base='http://127.0.0.1:'+port+appBase
const origin='https://journal.thedabcorner.site/'
const server=spawn(process.execPath,[
  'node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port',String(port),'--strictPort'
],{cwd:new URL('..',import.meta.url),stdio:['ignore','pipe','pipe']})
let logs=''
server.stderr.on('data',d=>logs+=d.toString())
server.stdout.on('data',d=>logs+=d.toString())
const request=(path,agent='Googlebot/2.1 (+http://www.google.com/bot.html)') =>
  fetch(base+path,{headers:{'User-Agent':agent},signal:AbortSignal.timeout(12000)})
try {
  let ready=false
  for(let attempt=0;attempt<45;attempt++){
    if(server.exitCode!==null)throw Error('Preview terminated: '+logs)
    try {if((await request('research/')).ok){ready=true;break}}catch{}
    await delay(220)
  }
  assert.ok(ready,'Preview unavailable: '+logs)
  const home=await (await request('')).text()
  const research=await (await request('research/')).text()
  const robots=await (await request('robots.txt')).text()
  const sitemap=await (await request('sitemap.xml')).text()
  assert.ok(home.includes('href="'+appBase+'research/"'),'Homepage must link to the formal manuscript index via plain HTML')
  assert.ok(!home.includes('name="citation_title"'),'Homepage is not a paper')
  assert.ok(!research.includes('name="citation_title"'),'Index cannot masquerade as individual paper')
  assert.ok(robots.includes('Allow: /')&&robots.includes('Sitemap: '+origin+'sitemap.xml'))
  assert.ok(sitemap.includes('<loc>'+origin+'research/</loc>'))
  for(const {entry:paper} of PAPER_DEFINITIONS.filter(({entry})=>entry.available)){
    const slug='research/'+paper.id+'/'
    const html=await (await request(slug,'Googlebot-Scholar/1.0')).text()
    assert.ok(html.includes('name="citation_title" content='),'Scholar cannot see manuscript title: '+slug)
    assert.ok(html.includes('name="citation_author" content='),'Scholar cannot see authors: '+slug)
    assert.ok(html.includes('name="citation_publication_date" content='),'Scholar cannot see publication year: '+slug)
    assert.ok(html.includes('<h2>Abstract</h2>'),'Scholar cannot see abstract: '+slug)
    const snapshot=JSON.parse(await readFile(
      new URL('../public/research/'+paper.id+'/abstract.json',import.meta.url),'utf8'))
    assert.ok(snapshot.paragraphs.length>=2,'Expected complete multi-paragraph author abstract')
    for (const paragraph of snapshot.paragraphs) {
      const escaped=paragraph.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
      assert.ok(html.includes(escaped),'Full manuscript abstract paragraph missing from response: '+slug)
    }
    assert.ok(html.includes('href="'+appBase+'research/'+paper.id+'/manuscript.pdf"'),'PDF not linked from abstract HTML')
    assert.ok(html.includes('name="citation_pdf_url" content="'+origin+slug+'manuscript.pdf"'),'Missing same-subdirectory PDF metadata')
    assert.ok(sitemap.includes('<loc>'+origin+slug+'</loc>'))
    const pdf=await request(slug+'manuscript.pdf','Googlebot-Scholar/1.0')
    assert.equal(pdf.status,200,'PDF unreachable: '+slug)
    assert.match(pdf.headers.get('content-type')||'',/application\/pdf/,'PDF wrong MIME: '+slug)
    const bytes=Buffer.from(await pdf.arrayBuffer())
    assert.ok(bytes.subarray(0,5).equals(Buffer.from('%PDF-')),'PDF response is SPA HTML: '+slug)
    assert.ok(bytes.length<5_000_000,'PDF exceeds Scholar 5 MB: '+slug)
    console.log('Scholar crawler: '+paper.id+', PDF '+bytes.length+' bytes, HTML citation and abstract present')
  }
  for(const entry of entries){
    const response=await request('posts/'+entry.slug+'/','Googlebot-Scholar/1.0')
    assert.equal(response.status,200,'Journal post unavailable: '+entry.slug)
    const html=await response.text()
    assert.ok(!html.includes('name="citation_title"'),'Journal post falsely labeled scholarly: '+entry.slug)
    assert.ok(!html.includes('name="citation_pdf_url"'),'Journal post falsely linked a scholarly PDF: '+entry.slug)
  }
  console.log('Scholar HTTP audit PASSED: '+PAPER_DEFINITIONS.length+' manuscripts; '+entries.length+' nonscholarly journal posts.')
} finally { server.kill('SIGTERM') }
