const cities={
 laayoune:[27.1536,-13.2033], guelmim:[28.987,-10.0574], dakhla:[23.6848,-15.957], oujda:[34.6814,-1.9086], "beni-mellal":[32.3373,-6.3498]
};
const ENDPOINTS=["https://overpass.kumi.systems/api/interpreter","https://overpass-api.de/api/interpreter"];
async function q(query){let last;for(const e of ENDPOINTS){try{const c=new AbortController();const t=setTimeout(()=>c.abort(),45000);const r=await fetch(e,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Accept:"application/json","User-Agent":"BLADNA/1.0 verification"},body:"data="+encodeURIComponent(query),signal:c.signal});clearTimeout(t);if(!r.ok){last=new Error("HTTP "+r.status);continue;}return await r.json();}catch(err){last=err;}}throw last;}
function hotels([lat,lon]){return `[out:json][timeout:60];(nwr["tourism"~"^(hotel|motel|hostel|guest_house|apartment)$"](around:9000,${lat},${lon}););out center;`;}
function places([lat,lon],kind){const around=kind==="restaurant"?12000:18000;const body=kind==="restaurant"?`nwr["amenity"="restaurant"]["name"](around:${around},${lat},${lon});`:[`nwr["tourism"~"^(attraction|museum|gallery|viewpoint|zoo|theme_park)$"]["name"](around:${around},${lat},${lon});`,`nwr["historic"]["name"](around:${around},${lat},${lon});`,`nwr["leisure"~"^(park|garden|nature_reserve)$"]["name"](around:${around},${lat},${lon});`,`nwr["natural"~"^(beach|spring|cape|peak)$"]["name"](around:${around},${lat},${lon});`,`nwr["amenity"~"^(theatre|arts_centre|place_of_worship)$"]["name"](around:${around},${lat},${lon});`].join("\n  ");return `[out:json][timeout:20];\n(\n  ${body}\n);\nout center 90;`;}
for(const [slug,coords] of Object.entries(cities)){
  for(const kind of ["hotel","restaurant","activity"]){
    try{const json=await q(kind==="hotel"?hotels(coords):places(coords,kind));console.log(slug+" "+kind+": "+(json.elements?json.elements.length:0));}
    catch(e){console.log(slug+" "+kind+": ERROR "+e.message);}
  }
}
