import { useState, useEffect, useRef, useMemo, useCallback } from "react";


// ── SUPABASE CONFIG (shared pin storage) ───────────────────────────
const SUPABASE_URL = "https://sdeydcbsrzodokdloobn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZXlkY2JzcnpvZG9rZGxvb2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4OTc0NjIsImV4cCI6MjEwMDQ3MzQ2Mn0.jG-3YNMoBVHhgDLWYj3X3quyb_Iho87I8ByH2KCcP_s";
const supaFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": options.method === "POST" ? "return=representation" : undefined,
      ...options.headers,
    },
  });
  return res.json();
};

// ── PRE-SEEDED DIASPORA DATA (historically documented) ─────────────
const SEED_DATA = [
  {id:"s1",name:"Giuseppe",surname:"Altavilla",city:"Wilkes-Barre",country:"USA",lat:41.246,lng:-75.881,generation:"1st",frazione:"Serra di Pratola",story:"Worked for D&H Railroad, lived at 11 Solomon Street. His family's journey through Ellis Island in the early 1900s connected Pratola Serra to Pennsylvania forever."},
  {id:"s2",name:"Antonio",surname:"Altavilla",city:"Orange",country:"USA",lat:40.770,lng:-74.233,generation:"1st",frazione:"Serra di Pratola",story:"Opened a barber shop in Orange, New Jersey — one of the first Pratolani businesses in America."},
  {id:"s3",name:"Antonio",surname:"Pisano",city:"Wilkes-Barre",country:"USA",lat:41.249,lng:-75.878,generation:"1st",frazione:"Pratola Centro",story:"Emigrated in 1898, returned to marry Giovanna DeFalco, then brought his family to Pennsylvania."},
  {id:"s4",name:"Vincenzo",surname:"Massari",city:"Scranton",country:"USA",lat:41.409,lng:-75.662,generation:"1st",frazione:"Pratola Centro"},
  {id:"s5",name:"",surname:"Petruzziello",city:"New York",country:"USA",lat:40.713,lng:-74.006,generation:"1st",frazione:"Pratola Centro"},
  {id:"s6",name:"",surname:"Capone",city:"Philadelphia",country:"USA",lat:39.952,lng:-75.164,generation:"1st",frazione:"Nocione"},
  {id:"s7",name:"",surname:"Fabrizio",city:"Boston",country:"USA",lat:42.360,lng:-71.059,generation:"2nd",frazione:"San Michele di Pratola"},
  {id:"s8",name:"",surname:"De Palma",city:"Chicago",country:"USA",lat:41.878,lng:-87.630,generation:"2nd",frazione:"Pratola Centro"},
  {id:"s9",name:"",surname:"Galdo",city:"Pittsburgh",country:"USA",lat:40.441,lng:-79.990,generation:"1st",frazione:"Serra di Pratola"},
  {id:"s10",name:"",surname:"Musto",city:"Hartford",country:"USA",lat:41.764,lng:-72.685,generation:"2nd",frazione:"Acquaviva"},
  // Bedford brickworkers
  {id:"s11",name:"",surname:"Bavaro",city:"Bedford",country:"England",lat:52.136,lng:-0.468,generation:"1st",frazione:"Pratola Centro",story:"Part of the wave of Southern Italians recruited by London Brick Company in the 1950s. Bedford became home to England's largest Italian community outside London."},
  {id:"s12",name:"",surname:"Marano",city:"Bedford",country:"England",lat:52.138,lng:-0.470,generation:"1st",frazione:"San Michele di Pratola"},
  {id:"s13",name:"",surname:"Sellitto",city:"Stewartby",country:"England",lat:52.082,lng:-0.507,generation:"1st",frazione:"Saudelle",story:"Worked at Stewartby Brickworks — at its peak, the world's largest brickworks, producing 500 million bricks per year."},
  {id:"s14",name:"",surname:"Acone",city:"London",country:"England",lat:51.507,lng:-0.128,generation:"2nd",frazione:"Nocione"},
  // South America
  {id:"s15",name:"",surname:"Capozzi",city:"Buenos Aires",country:"Argentina",lat:-34.604,lng:-58.382,generation:"1st",frazione:"Pratola Centro"},
  {id:"s16",name:"",surname:"Mercadante",city:"São Paulo",country:"Brazil",lat:-23.551,lng:-46.634,generation:"1st",frazione:"Cocciacavallo"},
  {id:"s17",name:"",surname:"Di Palma",city:"Rosario",country:"Argentina",lat:-32.947,lng:-60.639,generation:"2nd",frazione:"Serra di Pratola"},
  {id:"s18",name:"",surname:"Mazza",city:"Montevideo",country:"Uruguay",lat:-34.901,lng:-56.164,generation:"1st",frazione:"Pratola Centro"},
  // Europe
  {id:"s19",name:"",surname:"Damiano",city:"Zürich",country:"Switzerland",lat:47.377,lng:8.542,generation:"2nd",frazione:"Serra di Pratola"},
  {id:"s20",name:"",surname:"Alfieri",city:"Paris",country:"France",lat:48.857,lng:2.352,generation:"2nd",frazione:"Acquaviva"},
  {id:"s21",name:"",surname:"Bergamino",city:"Brussels",country:"Belgium",lat:50.850,lng:4.352,generation:"2nd",frazione:"Nocione"},
  {id:"s22",name:"",surname:"Tocco",city:"Frankfurt",country:"Germany",lat:50.110,lng:8.682,generation:"2nd",frazione:"Pratola Centro"},
  // Oceania
  {id:"s23",name:"",surname:"Addonizio",city:"Melbourne",country:"Australia",lat:-37.814,lng:144.963,generation:"1st",frazione:"San Michele di Pratola"},
  {id:"s24",name:"",surname:"Angelillo",city:"Sydney",country:"Australia",lat:-33.868,lng:151.209,generation:"2nd",frazione:"Pratola Centro"},
  // Canada
  {id:"s25",name:"",surname:"De Cicco",city:"Toronto",country:"Canada",lat:43.653,lng:-79.383,generation:"1st",frazione:"Saudelle"},
  {id:"s26",name:"",surname:"Magliaro",city:"Montreal",country:"Canada",lat:45.501,lng:-73.567,generation:"2nd",frazione:"Nocione"},
  // Italian cities (internal migration)
  {id:"s27",name:"",surname:"Argenio",city:"Milano",country:"Italia",lat:45.464,lng:9.190,generation:"1st",frazione:"Serra di Pratola"},
  {id:"s28",name:"",surname:"Alfano",city:"Roma",country:"Italia",lat:41.902,lng:12.496,generation:"1st",frazione:"Pratola Centro"},
  {id:"s29",name:"",surname:"Piscopo",city:"Torino",country:"Italia",lat:45.070,lng:7.687,generation:"1st",frazione:"Acquaviva"},
  {id:"s30",name:"",surname:"Petruzziello",city:"Napoli",country:"Italia",lat:40.851,lng:14.268,generation:"2nd",frazione:"Pratola Centro"},
];

const CITY_COORDS = {
  "Pratola Serra":{lat:40.983,lng:14.850},"Serra di Pratola":{lat:40.986,lng:14.845},
  "San Michele di Pratola":{lat:40.980,lng:14.855},"Avellino":{lat:40.914,lng:14.795},
  "Napoli":{lat:40.851,lng:14.268},"Naples":{lat:40.851,lng:14.268},
  "Roma":{lat:41.902,lng:12.496},"Rome":{lat:41.902,lng:12.496},
  "Milano":{lat:45.464,lng:9.190},"Milan":{lat:45.464,lng:9.190},
  "Torino":{lat:45.070,lng:7.687},"Salerno":{lat:40.682,lng:14.768},
  "Benevento":{lat:41.130,lng:14.782},"Caserta":{lat:41.072,lng:14.337},
  "Bari":{lat:41.126,lng:16.862},"Firenze":{lat:43.770,lng:11.249},
  "Palermo":{lat:38.116,lng:13.361},"Bologna":{lat:44.494,lng:11.343},
  "New York":{lat:40.713,lng:-74.006},"Wilkes-Barre":{lat:41.246,lng:-75.881},
  "Philadelphia":{lat:39.952,lng:-75.164},"Boston":{lat:42.360,lng:-71.059},
  "Chicago":{lat:41.878,lng:-87.630},"Newark":{lat:40.735,lng:-74.172},
  "San Francisco":{lat:37.775,lng:-122.419},"Los Angeles":{lat:34.052,lng:-118.244},
  "Miami":{lat:25.762,lng:-80.192},"Pittsburgh":{lat:40.441,lng:-79.990},
  "Hartford":{lat:41.764,lng:-72.685},"Scranton":{lat:41.409,lng:-75.662},
  "Orange":{lat:40.770,lng:-74.233},"Baltimore":{lat:39.290,lng:-76.612},
  "Washington DC":{lat:38.907,lng:-77.037},"Rochester":{lat:43.157,lng:-77.615},
  "Toronto":{lat:43.653,lng:-79.383},"Montreal":{lat:45.501,lng:-73.567},
  "Vancouver":{lat:49.283,lng:-123.121},
  "Buenos Aires":{lat:-34.604,lng:-58.382},"São Paulo":{lat:-23.551,lng:-46.634},
  "Sao Paulo":{lat:-23.551,lng:-46.634},"Rosario":{lat:-32.947,lng:-60.639},
  "Montevideo":{lat:-34.901,lng:-56.164},"Rio de Janeiro":{lat:-22.907,lng:-43.173},
  "London":{lat:51.507,lng:-0.128},"Bedford":{lat:52.136,lng:-0.468},
  "Stewartby":{lat:52.082,lng:-0.507},"Manchester":{lat:53.483,lng:-2.244},
  "Zürich":{lat:47.377,lng:8.542},"Zurich":{lat:47.377,lng:8.542},
  "Paris":{lat:48.857,lng:2.352},"Berlin":{lat:52.520,lng:13.405},
  "Brussels":{lat:50.850,lng:4.352},"Frankfurt":{lat:50.110,lng:8.682},
  "Melbourne":{lat:-37.814,lng:144.963},"Sydney":{lat:-33.868,lng:151.209},
};

const KNOWN_SURNAMES = [
  "Petruzziello","Capone","Fabrizio","De Palma","Galdo","Musto","Bavaro",
  "Marano","De Cicco","Sellitto","Acone","Magliaro","Piscopo","Capozzi",
  "Di Palma","Mercadante","Mazza","Altavilla","D'Aloia","Bergamino",
  "Alfieri","Damiano","Tocco","Addonizio","Alfano","Angelillo","Argenio"
];

const FRAZIONI = ["Serra di Pratola","San Michele di Pratola","Nocione","Acquaviva","Saudelle","Cocciacavallo","Pratola Centro"];

const GEN_COLORS = {"1st":"#D4A853","2nd":"#2E5E3F","3rd":"#5B7DB1","4th":"#9B6B9E","resident":"#C25B3A"};


function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function lookupCity(city,country){
  const keys=[`${city}, ${country}`,city];
  for(const k of keys) if(CITY_COORDS[k]) return CITY_COORDS[k];
  const l=city.toLowerCase();
  for(const[k,v]of Object.entries(CITY_COORDS)) if(k.toLowerCase()===l) return v;
  return null;
}

// ── ANIMATED COUNTER ───────────────────────────────────────────────
function AnimCount({target,duration=1500}){
  const[val,setVal]=useState(0);
  const ref=useRef(null);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){
        const start=Date.now();
        const tick=()=>{const p=Math.min((Date.now()-start)/duration,1);setVal(Math.floor(p*target));if(p<1)requestAnimationFrame(tick);};
        tick();obs.disconnect();
      }
    },{threshold:0.3});
    if(ref.current)obs.observe(ref.current);
    return()=>obs.disconnect();
  },[target,duration]);
  return <span ref={ref}>{val}</span>;
}


// ── PHOTO GALLERY DATA ─────────────────────────────────────────────
const PHOTOS = [
  {id:0, src:"https://upload.wikimedia.org/wikipedia/commons/2/2d/Serra_di_Pratola.JPG", alt:"Serra di Pratola", captionIt:"Serra di Pratola", captionEn:"Serra di Pratola", descIt:"Il borgo antico arroccato sulla collina, cuore storico del comune.", descEn:"The ancient village perched on the hill, the historic heart of the comune."},
  {id:1, src:"https://upload.wikimedia.org/wikipedia/commons/b/b2/Panorama_Pratola.jpg", alt:"Panorama Pratola Serra", captionIt:"Panorama di Pratola Serra", captionEn:"Panorama of Pratola Serra", descIt:"Vista panoramica dalla collina sulla Valle del Sabato, 280m s.l.m.", descEn:"Panoramic view from the hill over the Sabato Valley, 280m above sea level."},
  {id:2, src:"https://upload.wikimedia.org/wikipedia/commons/1/1e/Ellis_Island_arrivals.jpg", alt:"Ellis Island", captionIt:"Arrivi a Ellis Island", captionEn:"Ellis Island Arrivals", descIt:"Emigranti in arrivo a Ellis Island. Le famiglie Altavilla e Pisano di Pratola Serra passarono da qui.", descEn:"Immigrants arriving at Ellis Island. The Altavilla and Pisano families of Pratola Serra passed through here."},
  {id:3, src:"https://upload.wikimedia.org/wikipedia/commons/d/dc/Stewartby_brickworks_chimneys_-_geograph.org.uk_-_481075.jpg", alt:"Stewartby Brickworks", captionIt:"Stewartby Brickworks, Bedford", captionEn:"Stewartby Brickworks, Bedford", descIt:"La fabbrica di mattoni dove lavorarono centinaia di Pratolani negli anni '50.", descEn:"The brickworks where hundreds of Pratolani worked in the 1950s."},
  {id:4, src:"https://upload.wikimedia.org/wikipedia/commons/4/41/Vigneti_a_Taurasi.jpg", alt:"Vigneti di Taurasi", captionIt:"I Vigneti del Taurasi DOCG", captionEn:"Taurasi DOCG Vineyards", descIt:"Le colline irpine che producono il Taurasi, il 'Barolo del Sud'.", descEn:"The Irpinian hills that produce Taurasi, the 'Barolo of the South'."},
  {id:5, src:"https://upload.wikimedia.org/wikipedia/commons/6/6e/1997_Fiat_Coupe_20VT_%284545381753%29.jpg", alt:"Fiat Coupé 20V Turbo", captionIt:"Fiat Coupé 20V Turbo — Motore Pratola Serra", captionEn:"Fiat Coupé 20V Turbo — Pratola Serra Engine", descIt:"Il motore 'Pratola Serra' 2.0 Turbo 20V (217 CV) portava il nome del paese nel mondo.", descEn:"The 'Pratola Serra' 2.0 Turbo 20V (217hp) engine bore the town's name worldwide."},
];

// ── MAIN APP ───────────────────────────────────────────────────────
export default function PratolaniNelMondo(){
  const[pins,setPins]=useState(SEED_DATA);
  const[showForm,setShowForm]=useState(false);
  const[selectedPin,setSelectedPin]=useState(null);
  const[leafletReady,setLeafletReady]=useState(false);
  const[loaded,setLoaded]=useState(false);
  const[lang,setLang]=useState("it");
  const[lightbox,setLightbox]=useState(null);
  const mapRef=useRef(null);
  const mapInstance=useRef(null);
  const markersRef=useRef([]);
  const linesRef=useRef([]);
  const formRef=useRef(null);

  const[form,setForm]=useState({name:"",surname:"",city:"",country:"",frazione:"",generation:"2nd",manualLat:"",manualLng:""});
  const[needsCoords,setNeedsCoords]=useState(false);
  const[sugg,setSugg]=useState([]);

  // Load saved pins
  useEffect(()=>{
    (async()=>{
      try{
        // Load shared pins from Supabase
        const dbPins=await supaFetch("pins?order=created_at.asc&limit=500");
        if(Array.isArray(dbPins)&&dbPins.length>0){
          const mapped=dbPins.map(p=>({id:p.id,name:p.name||"",surname:p.surname,city:p.city,country:p.country||"",lat:p.lat,lng:p.lng,generation:p.generation||"2nd",frazione:p.frazione||"",story:p.story||""}));
          setPins([...SEED_DATA,...mapped]);
        }
      }catch(e){
        console.warn("Supabase load failed",e);
      }
      setLoaded(true);
    })();
  },[]);



  // Load Leaflet
  useEffect(()=>{
    if(window.L){setLeafletReady(true);return;}
    const link=document.createElement("link");link.rel="stylesheet";
    link.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(link);
    const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    s.onload=()=>setLeafletReady(true);document.head.appendChild(s);
  },[]);

  // Init map
  useEffect(()=>{
    if(!leafletReady||!mapRef.current||mapInstance.current)return;
    const L=window.L;
    const map=L.map(mapRef.current,{center:[35,10],zoom:3,minZoom:2,maxZoom:14,zoomControl:true,scrollWheelZoom:true});
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{
      attribution:'&copy; <a href="https://osm.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',subdomains:"abcd",maxZoom:19
    }).addTo(map);
    mapInstance.current=map;
    setTimeout(()=>map.invalidateSize(),300);
    return()=>{map.remove();mapInstance.current=null;};
  },[leafletReady]);

  // Update markers
  useEffect(()=>{
    if(!leafletReady||!mapInstance.current)return;
    const L=window.L;const map=mapInstance.current;
    markersRef.current.forEach(m=>map.removeLayer(m));markersRef.current=[];
    linesRef.current.forEach(l=>map.removeLayer(l));linesRef.current=[];
    const PS=[40.983,14.850];

    // Cluster
    const clusters=[];const used=new Set();
    pins.forEach((pin,i)=>{
      if(used.has(i))return;
      const cl={pins:[pin],lat:pin.lat,lng:pin.lng};
      pins.forEach((o,j)=>{if(i===j||used.has(j))return;if(Math.abs(pin.lat-o.lat)<1.8&&Math.abs(pin.lng-o.lng)<2.5){cl.pins.push(o);used.add(j);}});
      cl.lat=cl.pins.reduce((s,p)=>s+p.lat,0)/cl.pins.length;
      cl.lng=cl.pins.reduce((s,p)=>s+p.lng,0)/cl.pins.length;
      used.add(i);clusters.push(cl);
    });

    // Home
    const hi=L.divIcon({className:"",html:`<div style="width:18px;height:18px;border-radius:50%;background:#D4A853;border:3px solid #fff;box-shadow:0 0 20px rgba(212,168,83,0.7),0 0 40px rgba(212,168,83,0.3);animation:ph 2s ease-in-out infinite"></div><style>@keyframes ph{0%,100%{transform:scale(1);box-shadow:0 0 20px rgba(212,168,83,0.7)}50%{transform:scale(1.4);box-shadow:0 0 30px rgba(212,168,83,0.9)}}</style>`,iconSize:[18,18],iconAnchor:[9,9]});
    const hm=L.marker(PS,{icon:hi}).bindPopup(`<div style="font-family:'Source Sans 3',sans-serif;text-align:center;padding:6px"><div style="font-size:15px;font-weight:800;color:#D4A853">PRATOLA SERRA</div><div style="font-size:11px;color:#888;margin-top:2px">Provincia di Avellino · Campania</div><div style="font-size:10px;color:#666;margin-top:6px">40°59'N 14°51'E · 280m · Pop. 3,700</div></div>`).addTo(map);
    markersRef.current.push(hm);

    clusters.forEach((cl,ci)=>{
      const c=cl.pins.length;const gen=cl.pins[0]?.generation||"2nd";const color=GEN_COLORS[gen]||"#2E5E3F";
      const r=Math.min(8+Math.sqrt(c)*5,28);
      const surnames=[...new Set(cl.pins.map(p=>p.surname))];
      const names=cl.pins.slice(0,6).map(p=>`${p.name||""} <strong>${p.surname}</strong>`.trim());
      const stories=cl.pins.filter(p=>p.story).map(p=>p.story);

      const icon=L.divIcon({className:"",html:`<div style="width:${r}px;height:${r}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 12px ${color}88;display:flex;align-items:center;justify-content:center;color:#fff;font-size:${Math.min(r*.5,12)}px;font-weight:700;font-family:'JetBrains Mono',monospace;cursor:pointer">${c>1?c:""}</div>`,iconSize:[r,r],iconAnchor:[r/2,r/2]});

      const popup=`<div style="font-family:'Source Sans 3',sans-serif;min-width:180px;max-width:280px;padding:4px">
        <div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:2px">${cl.pins[0].city}</div>
        <div style="font-size:11px;color:#D4A853;font-weight:600;margin-bottom:8px">${c} Pratolani · ${cl.pins[0].country}</div>
        <div style="font-size:11px;color:#ccc;line-height:1.7">${names.join("<br>")}</div>
        ${c>6?`<div style="font-size:10px;color:#888;margin-top:4px;font-style:italic">...and ${c-6} more</div>`:""}
        ${stories.length>0?`<div style="font-size:10px;color:#999;margin-top:8px;padding-top:8px;border-top:1px solid #333;line-height:1.5;font-style:italic">"${stories[0].slice(0,150)}${stories[0].length>150?"...":""}"</div>`:""}
        <div style="font-size:9px;color:#666;margin-top:6px">Surnames: ${surnames.slice(0,4).join(", ")}</div>
      </div>`;

      const marker=L.marker([cl.lat,cl.lng],{icon}).bindPopup(popup,{className:"dark-popup",maxWidth:300}).addTo(map);
      markersRef.current.push(marker);

      const line=L.polyline([PS,[cl.lat,cl.lng]],{color:"#D4A85340",weight:1,dashArray:"4,6"}).addTo(map);
      linesRef.current.push(line);
    });
  },[pins,leafletReady]);

  // Stats
  const stats=useMemo(()=>{
    const cc={},ci={},su={},ge={},fr={};
    pins.forEach(p=>{
      if(p.country)cc[p.country]=(cc[p.country]||0)+1;
      if(p.city)ci[p.city]=(ci[p.city]||0)+1;
      if(p.surname)su[p.surname]=(su[p.surname]||0)+1;
      if(p.generation)ge[p.generation]=(ge[p.generation]||0)+1;
      if(p.frazione)fr[p.frazione]=(fr[p.frazione]||0)+1;
    });
    return{
      total:pins.length,
      countries:Object.keys(cc).length,
      cities:Object.keys(ci).length,
      topCountries:Object.entries(cc).sort((a,b)=>b[1]-a[1]).slice(0,6),
      topCities:Object.entries(ci).sort((a,b)=>b[1]-a[1]).slice(0,8),
      topSurnames:Object.entries(su).sort((a,b)=>b[1]-a[1]).slice(0,8),
      generations:Object.entries(ge),
      frazioni:Object.entries(fr).sort((a,b)=>b[1]-a[1]),
    };
  },[pins]);

  const handleChange=(f,v)=>{setForm(p=>({...p,[f]:v}));if(f==="surname"&&v.length>=2)setSugg(KNOWN_SURNAMES.filter(s=>s.toLowerCase().startsWith(v.toLowerCase())).slice(0,5));else if(f==="surname")setSugg([]);if(f==="city"||f==="country")setNeedsCoords(false);};

  const addPin=async()=>{
    if(!form.surname||!form.city)return;
    let c=lookupCity(form.city,form.country);
    if(!c&&needsCoords&&form.manualLat&&form.manualLng)c={lat:parseFloat(form.manualLat),lng:parseFloat(form.manualLng)};
    if(!c){setNeedsCoords(true);return;}
    const newPin={id:uid(),name:form.name,surname:form.surname,city:form.city,country:form.country,lat:c.lat,lng:c.lng,generation:form.generation,frazione:form.frazione};
    setPins(prev=>[...prev,newPin]);
    // Save to Supabase for shared visibility
    try{await supaFetch("pins",{method:"POST",body:JSON.stringify({name:form.name,surname:form.surname,city:form.city,country:form.country,lat:c.lat,lng:c.lng,generation:form.generation,frazione:form.frazione})});}catch(e){console.warn("Supabase save failed, pin saved locally",e);}
    setForm({name:"",surname:"",city:"",country:"",frazione:"",generation:"2nd",manualLat:"",manualLng:""});
    setShowForm(false);setNeedsCoords(false);
  };

  const importCsv=()=>{
    const input=document.createElement("input");input.type="file";input.accept=".csv,.txt";
    input.onchange=async(e)=>{const f=e.target.files[0];if(!f)return;const t=await f.text();const lines=t.split("\n").map(l=>l.trim()).filter(Boolean);const np=[];
      lines.forEach(line=>{const p=line.split(",").map(s=>s.trim().replace(/^"|"$/g,""));if(p.length<3)return;const[name,surname,city,country=""]=p;if(!surname||!city||surname.toLowerCase()==="surname")return;const c=lookupCity(city,country);if(c)np.push({id:uid(),name,surname,city,country,lat:c.lat,lng:c.lng,generation:"2nd",frazione:""});});
      if(np.length>0)setPins(prev=>[...prev,...np]);alert(`Added ${np.length} pins!`);};
    input.click();
  };

  const T=(it,en)=>lang==="it"?it:en;
  const IS={width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #333",fontSize:14,fontFamily:"'Source Sans 3',sans-serif",color:"#F6F1E7",background:"#1a1a2e",outline:"none",boxSizing:"border-box"};

  return(
    <div style={{background:"#0B1320",color:"#F6F1E7",fontFamily:"'Source Sans 3','Inter',system-ui,sans-serif",minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Source+Sans+3:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      {/* ═══ LIGHTBOX ═══ */}
      {lightbox!==null&&<div onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out",padding:16}}>
        <button onClick={()=>setLightbox(null)} style={{position:"absolute",top:16,right:20,background:"none",border:"none",color:"#D4A853",fontSize:32,cursor:"pointer",zIndex:10000}}>✕</button>
        <div style={{maxWidth:900,width:"100%",animation:"fadeUp 0.3s ease"}}>
          <img src={PHOTOS[lightbox]?.src} alt={PHOTOS[lightbox]?.alt} style={{width:"100%",borderRadius:12,boxShadow:"0 20px 60px rgba(0,0,0,0.8)"}} onError={e=>{e.target.style.display="none";}}/>
          <div style={{textAlign:"center",marginTop:16}}>
            <div style={{fontSize:18,fontWeight:700,color:"#F6F1E7",fontFamily:"'Playfair Display',serif"}}>{T(PHOTOS[lightbox]?.captionIt,PHOTOS[lightbox]?.captionEn)}</div>
            <div style={{fontSize:12,color:"#888",marginTop:6}}>{T(PHOTOS[lightbox]?.descIt,PHOTOS[lightbox]?.descEn)}</div>
          </div>
        </div>
      </div>}

      <style>{`
        .dark-popup .leaflet-popup-content-wrapper{background:#1a1a2e!important;border:1px solid #333!important;border-radius:12px!important;color:#F6F1E7!important;box-shadow:0 8px 32px rgba(0,0,0,.5)!important}
        .dark-popup .leaflet-popup-tip{background:#1a1a2e!important;border:1px solid #333!important}
        .leaflet-popup-close-button{color:#666!important}
        ::selection{background:#D4A85366}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{text-shadow:0 0 20px rgba(212,168,83,.3)}50%{text-shadow:0 0 40px rgba(212,168,83,.6)}}
        .stat-bar{transition:width 1.5s cubic-bezier(.4,0,.2,1)}
      `}</style>

      {/* ═══ HERO ═══ */}
      <header style={{position:"relative",textAlign:"center",padding:"48px 20px 24px",background:"linear-gradient(180deg,#0B1320 0%,#0B132000 100%)"}}>
        <div style={{fontSize:10,letterSpacing:4,textTransform:"uppercase",color:"#D4A853",marginBottom:12,fontWeight:600}}>{lang==="it"?"Pratolani nel Mondo · Est. 1812 · Comunità dal 2014":"Pratolani nel Mondo · Est. 1812 · Community Since 2014"}</div>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:8}}>{["it","en"].map(l=><button key={l} onClick={()=>setLang(l)} style={{padding:"3px 10px",borderRadius:12,fontSize:10,fontWeight:600,cursor:"pointer",border:lang===l?"1px solid #D4A853":"1px solid #333",background:lang===l?"#D4A85322":"transparent",color:lang===l?"#D4A853":"#666",letterSpacing:1}}>{l.toUpperCase()}</button>)}</div>
        <h1 style={{fontSize:"clamp(28px, 5vw, 48px)",fontWeight:800,margin:0,fontFamily:"'Playfair Display',serif",lineHeight:1.1,animation:"glow 4s ease-in-out infinite"}}>
          Dove Siamo<br/>Nel Mondo?
        </h1>
        <p style={{fontSize:14,color:"#999",margin:"12px auto 0",maxWidth:460,lineHeight:1.6}}>
          {lang==="it"?"Da un borgo collinare sul fiume Sabato ad ogni continente della terra — la storia di Pratola Serra vive nelle persone che ne portano il nome.":"From a hilltop town on the Sabato River to every continent on earth — the story of Pratola Serra lives in the people who carry its name forward."}
        </p>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:20,flexWrap:"wrap"}}>
          <button onClick={()=>{setShowForm(true);setTimeout(()=>formRef.current?.scrollIntoView({behavior:"smooth"}),100);}}
            style={{padding:"12px 24px",borderRadius:24,border:"none",background:"#D4A853",color:"#0B1320",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>
            {lang==="it"?"📍 Aggiungi il Tuo Pin":"📍 Add Your Pin"}
          </button>
          {/* CSV Import hidden — uncomment to restore
          <button onClick={importCsv}
            style={{padding:"12px 20px",borderRadius:24,border:"1px solid #333",background:"transparent",color:"#999",fontSize:13,cursor:"pointer"}}>
            📥 Import CSV
          </button>
          */}
        </div>
      </header>

      {/* ═══ LIVE STATS STRIP ═══ */}
      <div style={{display:"flex",justifyContent:"center",gap:"clamp(12px, 3vw, 32px)",padding:"16px 20px 24px",flexWrap:"wrap"}}>
        {[
          {v:stats.total,l:"Pratolani",icon:"👤"},
          {v:stats.countries,l:"Countries",icon:"🌍"},
          {v:stats.cities,l:"Cities",icon:"🏙️"},
          {v:KNOWN_SURNAMES.length,l:"Historic Surnames",icon:"📜"},
        ].map(s=>(
          <div key={s.l} style={{textAlign:"center",minWidth:70}}>
            <div style={{fontSize:"clamp(24px, 4vw, 36px)",fontWeight:800,color:"#D4A853",fontFamily:"'Playfair Display',serif"}}><AnimCount target={s.v}/></div>
            <div style={{fontSize:10,color:"#666",letterSpacing:1,textTransform:"uppercase",marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ═══ THE MAP ═══ */}
      <div style={{position:"relative",margin:"0 12px",borderRadius:16,overflow:"hidden",border:"1px solid #1a2b45"}}>
        <div ref={mapRef} style={{width:"100%",height:"clamp(350px, 50vh, 520px)"}}/>
        {!leafletReady&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#0B1320",color:"#666"}}>Loading map...</div>}
        {/* Legend */}
        <div style={{position:"absolute",bottom:10,left:10,background:"#0B1320dd",borderRadius:10,padding:"8px 12px",fontSize:9,zIndex:1000,border:"1px solid #222"}}>
          {Object.entries(GEN_COLORS).map(([g,c])=>(
            <div key={g} style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:c}}/>
              <span style={{color:"#888"}}>{g==="1st"?"1ª Gen":g==="2nd"?"2ª Gen":g==="3rd"?"3ª Gen":g==="4th"?"4ª+":"Resident"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ ADD PIN FORM (inline) ═══ */}
      <div ref={formRef} style={{margin:"24px 12px",transition:"all 0.4s"}}>
        {showForm ? (
          <div style={{background:"#111827",borderRadius:16,padding:24,border:"1px solid #1a2b45",maxWidth:520,margin:"0 auto",animation:"fadeUp 0.4s ease"}}>
            <div style={{fontSize:18,fontWeight:700,color:"#D4A853",marginBottom:16,fontFamily:"'Playfair Display',serif"}}>{lang==="it"?"📍 Dove sei nel mondo?":"📍 Where in the world are you?"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><div style={{fontSize:11,color:"#666",marginBottom:4}}>Name</div><input style={IS} value={form.name} onChange={e=>handleChange("name",e.target.value)} placeholder="Mario"/></div>
              <div style={{position:"relative"}}><div style={{fontSize:11,color:"#666",marginBottom:4}}>Surname *</div><input style={IS} value={form.surname} onChange={e=>handleChange("surname",e.target.value)} placeholder="Altavilla"/>
                {sugg.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#1a1a2e",border:"1px solid #333",borderRadius:8,zIndex:10}}>
                  {sugg.map(s=><div key={s} onClick={()=>{handleChange("surname",s);setSugg([]);}} style={{padding:"8px 12px",fontSize:13,cursor:"pointer",color:"#D4A853"}} onMouseEnter={e=>e.target.style.background="#222"} onMouseLeave={e=>e.target.style.background="transparent"}>{s}</div>)}
                </div>}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
              <div><div style={{fontSize:11,color:"#666",marginBottom:4}}>City *</div><input style={IS} value={form.city} onChange={e=>handleChange("city",e.target.value)} list="cl2" placeholder="e.g. Toronto"/><datalist id="cl2">{Object.keys(CITY_COORDS).map(c=><option key={c} value={c}/>)}</datalist></div>
              <div><div style={{fontSize:11,color:"#666",marginBottom:4}}>Country</div><input style={IS} value={form.country} onChange={e=>handleChange("country",e.target.value)} placeholder="e.g. Canada"/></div>
            </div>
            {needsCoords&&<div style={{marginTop:10,padding:10,background:"#D4A85315",borderRadius:8,border:"1px solid #D4A85333"}}>
              <div style={{fontSize:11,color:"#D4A853",marginBottom:6}}>City not in database — enter coordinates (find on Google Maps)</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <input style={IS} placeholder="Latitude" value={form.manualLat} onChange={e=>setForm(f=>({...f,manualLat:e.target.value}))} type="number" step="0.01"/>
                <input style={IS} placeholder="Longitude" value={form.manualLng} onChange={e=>setForm(f=>({...f,manualLng:e.target.value}))} type="number" step="0.01"/>
              </div>
            </div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
              <div><div style={{fontSize:11,color:"#666",marginBottom:4}}>Frazione of Origin</div><select style={IS} value={form.frazione} onChange={e=>handleChange("frazione",e.target.value)}><option value="">—</option>{FRAZIONI.map(f=><option key={f} value={f}>{f}</option>)}</select></div>
              <div><div style={{fontSize:11,color:"#666",marginBottom:4}}>Generation</div><select style={IS} value={form.generation} onChange={e=>handleChange("generation",e.target.value)}><option value="1st">1ª Gen (born in PS)</option><option value="2nd">2ª Gen</option><option value="3rd">3ª Gen</option><option value="4th">4ª Gen+</option><option value="resident">Current Resident</option></select></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={addPin} style={{flex:1,padding:"12px",borderRadius:10,border:"none",background:"#D4A853",color:"#0B1320",fontSize:14,fontWeight:700,cursor:"pointer"}}>📍 Drop My Pin</button>
              <button onClick={()=>setShowForm(false)} style={{padding:"12px 16px",borderRadius:10,border:"1px solid #333",background:"transparent",color:"#666",fontSize:14,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        ) : (
          <div onClick={()=>setShowForm(true)} style={{background:"linear-gradient(135deg,#111827,#1a2b45)",borderRadius:16,padding:"24px 20px",textAlign:"center",cursor:"pointer",border:"1px solid #1a2b45",maxWidth:520,margin:"0 auto",transition:"all 0.3s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#D4A853"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#1a2b45"}>
            <div style={{fontSize:20,marginBottom:8}}>📍</div>
            <div style={{fontSize:16,fontWeight:700,color:"#D4A853",fontFamily:"'Playfair Display',serif"}}>{lang==="it"?"Dove sei nel mondo?":"Where are you in the world?"}</div>
            <div style={{fontSize:12,color:"#666",marginTop:4}}>{lang==="it"?"Tocca per aggiungerti alla mappa · Importa CSV disponibile":"Tap to add yourself to the map · CSV import available for group data"}</div>
          </div>
        )}
      </div>

      {/* ═══ INSIGHTS DASHBOARD ═══ */}
      <section style={{padding:"32px 16px",maxWidth:700,margin:"0 auto"}}>
        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#D4A853",marginBottom:6}}>{lang==="it"?"Dati in Tempo Reale":"Live Insights"}</div>
        <h2 style={{fontSize:22,fontWeight:800,fontFamily:"'Playfair Display',serif",margin:"0 0 20px",color:"#F6F1E7"}}>{lang==="it"?"La Diaspora in Numeri":"The Diaspora in Numbers"}</h2>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {/* Top Countries */}
          <div style={{background:"#111827",borderRadius:14,padding:16,border:"1px solid #1a2b45"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#D4A853",marginBottom:10,letterSpacing:1}}>TOP COUNTRIES</div>
            {stats.topCountries.map(([n,c])=>(
              <div key={n} style={{marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#ccc",marginBottom:3}}>
                  <span>{n}</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:"#D4A853"}}>{c}</span>
                </div>
                <div style={{height:4,borderRadius:2,background:"#1a2b45",overflow:"hidden"}}>
                  <div className="stat-bar" style={{height:"100%",borderRadius:2,background:"linear-gradient(90deg,#D4A853,#C25B3A)",width:`${(c/stats.total)*100}%`}}/>
                </div>
              </div>
            ))}
          </div>
          {/* Top Cities */}
          <div style={{background:"#111827",borderRadius:14,padding:16,border:"1px solid #1a2b45"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#2E5E3F",marginBottom:10,letterSpacing:1}}>TOP CITIES</div>
            {stats.topCities.map(([n,c])=>(
              <div key={n} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1a2b4533",fontSize:12}}>
                <span style={{color:"#ccc"}}>{n}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#2E5E3F",fontWeight:600}}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Surnames + Frazioni + Generations row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div style={{background:"#111827",borderRadius:14,padding:16,border:"1px solid #1a2b45"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#C25B3A",marginBottom:8,letterSpacing:1}}>SURNAMES</div>
            {stats.topSurnames.map(([n,c])=>(
              <div key={n} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:11,color:"#aaa"}}>
                <span>{n}</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:"#C25B3A"}}>{c}</span>
              </div>
            ))}
          </div>
          <div style={{background:"#111827",borderRadius:14,padding:16,border:"1px solid #1a2b45"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#5B7DB1",marginBottom:8,letterSpacing:1}}>FRAZIONI</div>
            {stats.frazioni.map(([n,c])=>(
              <div key={n} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:11,color:"#aaa"}}>
                <span>{n}</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:"#5B7DB1"}}>{c}</span>
              </div>
            ))}
          </div>
          <div style={{background:"#111827",borderRadius:14,padding:16,border:"1px solid #1a2b45"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#9B6B9E",marginBottom:8,letterSpacing:1}}>GENERATIONS</div>
            {stats.generations.map(([g,c])=>(
              <div key={g} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",fontSize:11,color:"#aaa"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:GEN_COLORS[g]||"#666"}}/>
                  <span>{g}</span>
                </div>
                <span style={{fontFamily:"'JetBrains Mono',monospace",color:GEN_COLORS[g]||"#666"}}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HISTORICAL NARRATIVE ═══ */}
      <section style={{padding:"40px 16px 20px",maxWidth:680,margin:"0 auto"}}>
        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#D4A853",marginBottom:6}}>{lang==="it"?"La Nostra Storia":"Our Story"}</div>
        <h2 style={{fontSize:22,fontWeight:800,fontFamily:"'Playfair Display',serif",margin:"0 0 24px"}}>{lang==="it"?"5.000 Anni di Pratola Serra":"5,000 Years of Pratola Serra"}</h2>

        {[
          {era:"3000 BC",title:T("I Primi Abitanti","The First Inhabitants"),text:T("Strumenti litici, lame e punte di freccia nel terreno — cinque strati storici sotto il paese, dalla Preistoria al Medioevo.","Stone tools, blades, and arrowheads in the soil — five historical layers beneath the town, from Prehistory to Medieval."),color:"#666",icon:"🪨"},
          {era:T("V–VII Sec.","5th–7th C."),title:T("La Chiesa Longobarda","The Longobard Church"),text:T("Nel 1981 emersero le mura di una chiesa longobarda e i resti di una villa romana con terme. Pratola Serra è ora nell'itinerario 'Longobard Ways Across Europe'.","In 1981 workers unearthed a Longobard-era church and a Roman villa with thermal baths. Pratola Serra is now on the 'Longobard Ways Across Europe' itinerary."),color:"#9B6B9E",icon:"⛪"},
          {era:"1500–1806",title:T("I Tocco e il Carcere","The Tocco Era & Prison"),text:T("Il detto 'Puozzi passà p'a Pratola' era una maledizione: la strada per il carcere borbonico di Montefusco passava per il corso principale.","The saying 'Puozzi passà p'a Pratola' was a curse: the road to the Bourbon Prison of Montefusco ran through Pratola's main street."),color:"#C25B3A",icon:"⚔️"},
          {era:"1812",title:T("Nascita del Comune","Birth of a Comune"),text:T("Pratola e Serra si unirono per decreto napoleonico. Serra di Pratola, arroccato attorno al castello medievale sulla Valle del Sabato.","Pratola and Serra merged by Napoleonic decree. Serra di Pratola perched around its medieval castle above the Sabato Valley."),color:"#D4A853",icon:"🏛️"},
          {era:"1880–1920",title:T("La Grande Emigrazione","The Great Emigration"),text:T("I Pratolani partirono per l'America via Ellis Island. Gli Altavilla a Wilkes-Barre, i Pisano nel 1898. Entro il 1920, comunità in Pennsylvania, New York e New England.","Pratolani journeyed to America via Ellis Island. The Altavilla family to Wilkes-Barre, the Pisano family in 1898. By 1920, communities across PA, NY, and New England."),color:"#D4A853",icon:"🚢"},
          {era:T("Anni '50","1950s"),title:T("I Mattonai di Bedford","The Bedford Brickworkers"),text:T("La London Brick Company reclutò lavoratori campani per la Stewartby Brickworks — la più grande del mondo. Bedford divenne una delle più grandi comunità italiane d'Inghilterra.","The London Brick Co. recruited Campanian workers for Stewartby Brickworks — then the world's largest. Bedford became one of England's largest Italian communities."),color:"#C25B3A",icon:"🧱"},
          {era:T("Anni '80","1980s"),title:T("Alfa Romeo e FIAT","Alfa Romeo & FIAT"),text:T("La FIAT creò la FMA, producendo 600.000 motori all'anno. Il motore 'Pratola Serra' 2.0 Turbo 20V (217 CV) portava il nome del paese nel mondo.","FIAT created the FMA, producing 600,000 engines/year. The 'Pratola Serra' 2.0 Turbo 20V (217hp) bore the town's name worldwide."),color:"#2E5E3F",icon:"🏎️"},
          {era:T("Oggi","Today"),title:T("3.700 a Casa, 2.000+ nel Mondo","3,700 at Home, 2,000+ Worldwide"),text:T("Pratola Serra a 280m s.l.m. La Festa della Madonna Addolorata riempie le strade ogni settembre. Il gruppo Facebook collega oltre 2.000 membri dal 2014.","Pratola Serra at 280m. The Festa della Madonna Addolorata fills the streets every September. The Facebook group has connected 2,000+ members since 2014."),color:"#D4A853",icon:"🌍"},
        ]].map((item,i)=>(
          <div key={i} style={{display:"flex",gap:16,marginBottom:28,position:"relative"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0,width:32}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`${item.color}22`,border:`2px solid ${item.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{item.icon}</div>
              <div style={{flex:1,width:2,background:`linear-gradient(${item.color}66, ${item.color}11)`,borderRadius:1}}/>
            </div>
            <div style={{flex:1,paddingBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:item.color,letterSpacing:2,textTransform:"uppercase",marginBottom:4,fontFamily:"'JetBrains Mono',monospace"}}>{item.era}</div>
              <div style={{fontSize:17,fontWeight:700,color:"#F6F1E7",marginBottom:8,fontFamily:"'Playfair Display',serif",lineHeight:1.3}}>{item.title}</div>
              <div style={{fontSize:13,color:"#999",lineHeight:1.8}}>{item.text}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ═══ PHOTO GALLERY ═══ */}
      <section style={{padding:"32px 16px 40px",maxWidth:780,margin:"0 auto"}}>
        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#D4A853",marginBottom:6}}>{T("Immagini del Nostro Paese","Images of Our Town")}</div>
        <h2 style={{fontSize:22,fontWeight:800,fontFamily:"'Playfair Display',serif",margin:"0 0 8px"}}>{T("Pratola Serra in Immagini","Pratola Serra in Pictures")}</h2>
        <p style={{fontSize:13,color:"#777",marginBottom:20,lineHeight:1.6}}>{T("Tocca una foto per ingrandirla.","Tap a photo to enlarge.")}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:10}}>
          {PHOTOS.map((ph,i)=>(
            <div key={i} onClick={()=>setLightbox(i)} style={{aspectRatio:"4/3",borderRadius:12,overflow:"hidden",cursor:"zoom-in",position:"relative",border:"1px solid #1a2b45",transition:"transform 0.3s, box-shadow 0.3s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.boxShadow="0 8px 30px rgba(212,168,83,0.2)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none";}}>
              <img src={ph.src} alt={ph.alt} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{e.target.style.display="none";e.target.parentElement.style.background="linear-gradient(135deg,#1a2b4566,#111827)";}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.85))",padding:"20px 10px 8px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#F6F1E7"}}>{T(ph.captionIt,ph.captionEn)}</div>
              </div>
              <div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.5)",borderRadius:20,padding:"2px 8px",fontSize:9,color:"#D4A853"}}>🔍</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ WINES & FOOD ═══ */}
      <section style={{padding:"20px 16px",maxWidth:680,margin:"0 auto"}}>
        <div style={{background:"linear-gradient(135deg,#1a0f05,#2a1a0a)",borderRadius:16,padding:24,border:"1px solid #3a2515"}}>
          <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#D4A853",marginBottom:8}}>{lang==="it"?"Sapori di Casa":"Tastes of Home"}</div>
          <h3 style={{fontSize:18,fontWeight:700,fontFamily:"'Playfair Display',serif",margin:"0 0 12px",color:"#F6F1E7"}}>{lang==="it"?"I Sapori di Pratola Serra":"The Tastes of Pratola Serra"}</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,fontSize:12,color:"#bba080",lineHeight:1.7}}>
            <div>
              <div style={{fontWeight:700,color:"#D4A853",marginBottom:4}}>🍷 {T("Tre Vini DOCG","Three DOCG Wines")}</div>
              <div>{T("Taurasi, Greco di Tufo e Fiano di Avellino — tre dei migliori vini della Campania, prodotti nelle colline attorno a Pratola Serra.","Taurasi, Greco di Tufo, and Fiano di Avellino — three of the finest wines Campania has to offer, produced in the hills surrounding Pratola Serra.")}</div>
            </div>
            <div>
              <div style={{fontWeight:700,color:"#D4A853",marginBottom:4}}>🧀 {T("Specialità Locali","Local Specialties")}</div>
              <div>{T("Caciocavallo, scamorza, soppressata. Pasta fatta in casa: cavatielli, lagane, maccaronara. E il pregiato tartufo di Bagnoli Irpino.","Caciocavallo, scamorza, soppressata. Handmade pasta: cavatielli, lagane, maccaronara. And the prized truffle of nearby Bagnoli Irpino.")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{padding:"40px 16px 24px",textAlign:"center",maxWidth:500,margin:"0 auto"}}>
        <div style={{fontSize:28,fontWeight:800,fontFamily:"'Playfair Display',serif",lineHeight:1.2,marginBottom:12}}>
          {T("Il Tuo Nome.","Your Name.")}<br/>{T("La Tua Città.","Your City.")}<br/><span style={{color:"#D4A853"}}>{T("Il Tuo Pin.","Your Pin.")}</span>
        </div>
        <p style={{fontSize:13,color:"#666",marginBottom:20}}>
          {lang==="it"?"Ogni pin su questa mappa è un ramo dello stesso albero. Aggiungi il tuo e aiutaci a raccontare dove vivono oggi i Pratolani.":"Every pin on this map is a branch of the same tree. Add yours and help us tell the full story of where Pratolani live today."}
        </p>
        <button onClick={()=>{setShowForm(true);setTimeout(()=>formRef.current?.scrollIntoView({behavior:"smooth"}),100);}}
          style={{padding:"14px 32px",borderRadius:24,border:"none",background:"#D4A853",color:"#0B1320",fontSize:15,fontWeight:700,cursor:"pointer"}}>
          {lang==="it"?"📍 Aggiungi il Tuo Pin":"📍 Add Your Pin"}
        </button>
      </section>

      {/* ═══ FOOTER ═══ */}
      {/* ═══ COLOPHON ═══ */}
      <section style={{padding:"24px 16px",maxWidth:680,margin:"0 auto"}}>
        <div style={{background:"linear-gradient(135deg,#111827,#1a2b45)",borderRadius:16,padding:24,border:"1px solid #1a2b45",textAlign:"center"}}>
          <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#D4A853",marginBottom:8}}>{lang==="it"?"Creato da":"Created by"}</div>
          <div style={{fontSize:20,fontWeight:700,fontFamily:"'Playfair Display',serif",color:"#F6F1E7",marginBottom:4}}>Tony De Palma</div>
          <div style={{fontSize:13,color:"#D4A853",fontStyle:"italic",marginBottom:12}}></div>
          <div style={{fontSize:12,color:"#888",lineHeight:1.7,maxWidth:420,margin:"0 auto"}}>
            {lang==="it"
              ?"Fondatore e amministratore del gruppo Facebook 'Pratolani nel Mondo' dal 2014. Questo progetto nasce dall'amore per Pratola Serra e dal desiderio di connettere tutti i Pratolani sparsi nel mondo con le proprie radici e la propria storia."
              :"Founder and administrator of the 'Pratolani nel Mondo' Facebook group since 2014. This project was born from a love for Pratola Serra and the desire to connect all Pratolani around the world with their roots and their shared history."}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:16,fontSize:11,color:"#666"}}>
            <span>🏠 Pratola Serra</span>
            <span>👥 2,000+ {lang==="it"?"membri":"members"}</span>
            <span>🌍 {lang==="it"?"Dal":"Since"} 2014</span>
          </div>
        </div>
      </section>

      <footer style={{textAlign:"center",padding:"32px 16px 20px",borderTop:"1px solid #1a2b45",fontSize:10,color:"#444"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#D4A853",marginBottom:8}}>L'Albero dei Pratolani</div>
        <div>Pratola Serra & Pratolani nel Mondo · Provincia di Avellino, Campania, Italia</div>
        <div style={{marginTop:4}}>Comune fondato 1812 · Gruppo Facebook dal 2014 · 40°59'N 14°51'E · 280m s.l.m.</div>
        <div style={{marginTop:6,color:"#555"}}>{lang==="it"?"Un progetto di":"A project by"} Antonio Michael De Palma</div>
        <div style={{marginTop:8,color:"#333"}}>{lang==="it"?"I dati includono modelli diasporici documentati storicamente. Aggiungi il tuo pin per renderlo reale.":"Data includes historically documented diaspora patterns. Add your own pin to make it real."}</div>
      </footer>
    </div>
  );
}
