import fs from 'node:fs'
import {chromium} from 'playwright-core'
const files=fs.readdirSync('dist/assets').filter(f=>/^Windowed(Archive|Pane)-.+\.js$/.test(f))
if(files.length!==2)throw Error('Expected two on-demand virtual chunks, got '+JSON.stringify(files))
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']})
const context=await browser.newContext()
const page=await context.newPage()
try{
 await page.goto('http://127.0.0.1:11265/',{waitUntil:'networkidle'})
 await page.evaluate(async()=>navigator.serviceWorker.ready)
 await page.reload({waitUntil:'networkidle'})
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller)
 await page.waitForFunction(async()=>{
  const keys=await caches.keys()
  return keys.some(x=>x.includes('precache'))
 })
 const cache=await page.evaluate(async(files)=>{
  const result=[]
  for(const file of files){
   const url=new URL('/assets/'+file,location.origin).href
   const response=await caches.match(url)
   result.push({file,cached:!!response,status:response?.status})
  }
  return result
 },files)
 if(cache.some(e=>!e.cached||e.status!==200))throw Error('Virtual modules not precached '+JSON.stringify(cache))
 await context.setOffline(true)
 const offline=await page.evaluate(async(files)=>{
  const result=[]
  for(const file of files){
   try{const response=await fetch('/assets/'+file);result.push({file,status:response.status,bytes:(await response.arrayBuffer()).byteLength})}
   catch(e){result.push({file,error:String(e)})}
  }
  return result
 },files)
 if(offline.some(e=>e.status!==200))throw Error('Offline dynamic chunk fetch failed '+JSON.stringify(offline))
 console.log(JSON.stringify({pass:true,cached:cache,offline}))
}catch(e){console.log(JSON.stringify({pass:false,error:String(e)}));process.exitCode=1}
await context.close()
await browser.close()
