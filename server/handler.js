import { makeDemoTrip, normalizeInput } from './trip.js';

const allowedOrigins = (process.env.ALLOWED_ORIGIN || '').split(',').map(x=>x.trim()).filter(Boolean);
const json = (res,status,data) => res.status(status).json(data);
export async function handleApi(req,res){
  res.setHeader('Cache-Control','no-store');
  if (allowedOrigins.length && req.headers.origin && allowedOrigins.includes(req.headers.origin)) res.setHeader('Access-Control-Allow-Origin',req.headers.origin);
  if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');return res.status(204).end();}
  const path=(req.url||'').split('?')[0];
  if(path.endsWith('/health') && req.method==='GET') return json(res,200,{ok:true,aiConfigured:Boolean(process.env.OPENAI_API_KEY)});
  if(!path.endsWith('/generate')) return json(res,404,{error:'API route not found'});
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  try{
    const input=normalizeInput(req.body);
    if(!process.env.OPENAI_API_KEY) return json(res,200,{trip:makeDemoTrip(input),mode:'demo'});
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),22000);
    let response;
    try{response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4o-mini',response_format:{type:'json_object'},messages:[{role:'system',content:'Create a safe, realistic personalized travel itinerary. Output only a JSON object: title string, summary string, estimatedBudget number INR, budgetBreakdown object {stay,food,transport,activities} numeric INR, tips array of three short strings, days array with exactly requested number of entries {day integer,title string,activities array of exactly three {time string,title string,description string,cost number INR,category string}}. Avoid claiming live opening hours, reservations or prices. Include destination-specific suggestions where confident; otherwise generic descriptions. No markdown.'},{role:'user',content:JSON.stringify(input)}]})});}finally{clearTimeout(timeout)}
    if(!response.ok){return json(res,502,{error:'AI service unavailable. Try again or use demo mode by leaving the API key unset.'});}
    const payload=await response.json();const trip=JSON.parse(payload.choices?.[0]?.message?.content||'{}');
    if(!Array.isArray(trip.days)||trip.days.length!==input.days||!trip.days.every(d=>Array.isArray(d.activities))||!trip.budgetBreakdown) throw new Error('Invalid AI response');
    return json(res,200,{trip:{...trip,destination:input.destination,startDate:input.startDate,endDate:input.endDate,travelers:input.travelers,interests:input.interests},mode:'ai'});
  }catch(error){return json(res,400,{error:error.name==='AbortError'?'AI request timed out':error.message||'Unable to generate itinerary'});}
}
