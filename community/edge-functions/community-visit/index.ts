// Supabase Edge Function: community-visit
// Deploy after creating Supabase project and setting VISITOR_HASH_SECRET.
// Secure aggregation: HMAC(IP + UA + UTC day), no raw IP stored. Country
// geo-lookup is optional; enable only after disclosing it in the privacy notice.
import { createClient } from "npm:@supabase/supabase-js@2";
const ALLOWED = new Set([
  "https://digitaleye2k-lang.github.io",
  "https://retroworld.eu.cc",
  "https://www.retroworld.eu.cc",
]);
const URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SALT = Deno.env.get("VISITOR_HASH_SECRET") || "";
const GEO_ENABLED = Deno.env.get("VISITOR_GEO_LOOKUP") === "true";
const encoder = new TextEncoder();
const client = createClient(URL, SERVICE_KEY, {auth:{autoRefreshToken:false,persistSession:false}});
function cors(origin: string | null) {
  const allowed = origin && ALLOWED.has(origin) ? origin : "https://digitaleye2k-lang.github.io";
  return {"Access-Control-Allow-Origin":allowed, "Vary":"Origin",
    "Access-Control-Allow-Methods":"POST, OPTIONS",
    "Access-Control-Allow-Headers":"content-type,authorization,apikey,x-client-info",
    "Cache-Control":"no-store"};
}
function json(value: unknown, status:number, origin:string|null) {
  return new Response(JSON.stringify(value),{status,headers:{"Content-Type":"application/json",...cors(origin)}});
}
function countryValue(v:string|null) {
  const x=(v||"").toUpperCase(); return /^[A-Z]{2}$/.test(x)&&x!=="XX" ? x : "ZZ";
}
Deno.serve(async request => {
  const origin=request.headers.get("origin");
  if(request.method==="OPTIONS") return new Response(null,{status:204,headers:cors(origin)});
  if(request.method!=="POST"||!origin||!ALLOWED.has(origin)) return json({error:"Origin not allowed"},403,origin);
  if(!SALT||SALT.length<32||!SERVICE_KEY||!URL) return json({error:"Analytics not configured"},503,origin);
  // An IP is processed temporarily and is never written into database rows.
  const ip=(request.headers.get("x-forwarded-for")||"").split(",")[0].trim() ||
     request.headers.get("x-real-ip")||"";
  const ua=(request.headers.get("user-agent")||"").slice(0,180);
  if(!ip) return json({error:"Visitor identifier unavailable"},503,origin);
  let country=countryValue(request.headers.get("cf-ipcountry")||request.headers.get("x-sb-geo-country"));
  // Optional server-to-server GeoIP lookup: shares the request IP with ipwho.is,
  // not with other website visitors. Disable by omitting VISITOR_GEO_LOOKUP=true.
  if(country==="ZZ" && GEO_ENABLED){
    try{
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),2100);
      try{
        const res=await fetch("https://ipwho.is/"+encodeURIComponent(ip)+"?fields=success,country_code",{signal:controller.signal});
        if(res.ok){const d=await res.json();if(d?.success===true)country=countryValue(d.country_code);}
      }finally{clearTimeout(timeout);}
    }catch{/* unknown country, not a failed counter */}
  }
  const today=new Date().toISOString().slice(0,10);
  const secretKey=await crypto.subtle.importKey("raw",encoder.encode(SALT),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const bytes=new Uint8Array(await crypto.subtle.sign("HMAC",secretKey,encoder.encode(today+"|"+ip+"|"+ua)));
  const digest=Array.from(bytes).map(b=>b.toString(16).padStart(2,"0")).join("");
  const {error}=await client.rpc("pgh_record_visit",{p_digest:digest,p_country:country});
  if(error) return json({error:"Could not record visit"},503,origin);
  return json({ok:true},200,origin);
});
