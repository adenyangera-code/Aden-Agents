import { useState, useRef, useEffect } from "react";

// ── CONNECTORS ────────────────────────────────────────────
const CONNECTORS = {
  hubspot:  { name:"HubSpot",       color:"#f97316" },
  calendar: { name:"Google Cal",    color:"#4285f4" },
  meta:     { name:"Meta Ads",      color:"#1877f2" },
  canva:    { name:"Canva",         color:"#00c4cc" },
  heygen:   { name:"HeyGen",        color:"#a855f7" },
  shopify:  { name:"Shopify",       color:"#96bf48" },
  drive:    { name:"Drive",         color:"#fbbc04" },
  gmail:    { name:"Gmail",         color:"#ea4335" },
  whatsapp: { name:"WhatsApp",      color:"#25d366" },
};

// ── PROJECT LINKS ─────────────────────────────────────────
const CLAUDE_LINKS = {
  leads:      "https://claude.ai/project/019d72d2-6d3e-744c-98be-690add758d1c",
  listings:   "https://claude.ai/project/019d72d2-6d3e-744c-98be-690add758d1c",
  closer:     "https://claude.ai/project/019d72d2-6d3e-744c-98be-690add758d1c",
  content:    "https://claude.ai/project/019d725c-8cee-76c0-8c6d-0411961cf920",
  marketing:  "https://claude.ai/project/019d725c-8cee-76c0-8c6d-0411961cf920",
  spacesaver: "https://claude.ai/project/019df13b-739c-726a-978b-0a78ddf644b5",
  spy:        "https://claude.ai/project/019ec0e1-b17a-74f1-a478-9338d0136ad6",
  analytics:  "https://claude.ai/project/019ec0e2-04ce-74a4-a3da-d1dd7b4ba889",
};

// ── DEFAULT AGENTS ────────────────────────────────────────
const DEFAULT_AGENTS = [
  { id:"leads", name:"Lead Hunter", emoji:"🎯", color:"#ef4444", role:"Leads · CRM · Follow-up", connectors:["hubspot","calendar"], badge:"2 HOT", isDefault:true,
    systemPrompt:`You are Lead Hunter for Aden Yang, ERA Realty Singapore (CEA R063636G, +65 9646 8228). Help qualify leads, write WhatsApp/call scripts, track pipeline. Current HubSpot leads: Indra Gunawan (new, 11 Jun), Easin AraFat (follow-up needed, 10 Jun). Listings: Lentor Gardens D26 ~$2150psf, Thomson Reserve D20 ~$2380psf, Hudson Place D5 ~$2620psf, 117 Macpherson Rd $4.5M D13. SG context: HDB upgraders, EC ≤$16k, ABSD, CPF, OTP. Be concise, give bullet-point scripts.` },
  { id:"content", name:"Content Studio", emoji:"🎬", color:"#a855f7", role:"Scripts · Captions · Pillars", connectors:["canva","heygen","drive"], badge:"3 PILLARS", isDefault:true,
    systemPrompt:`You are Content Studio for Aden Yang, ERA Realty Singapore. Brand: "friendly neighbourhood real estate agent" — kopitiam-talk, Mandarin+Singlish. 3 Pillars: 1) 带你不踩坑 45-60s regret hook 2) 带你去看房 60-90s tour+PSF 3) 带你算一算 60-75s numbers. Outro: "Aden Yang, ERA. CEA R063636G." Output: key beats ONLY in point form — no full sentences.` },
  { id:"marketing", name:"Ad Manager", emoji:"📣", color:"#3b82f6", role:"Meta Ads · Spend · Strategy", connectors:["meta","canva","hubspot"], badge:"1 BLOCKED", isDefault:true,
    systemPrompt:`You are Ad Manager for Aden Yang, ERA Realty Singapore. Campaigns: Grand Dunman (Meta $300/mo ACTIVE), Lentor Gardens (Meta $500/mo BLOCKED — needs facebook.com/legal/leadgen/tos), Potong Pasir HDB (Carousell organic 7 leads), EC Myths (TikTok/IG in production). Target: SG buyers 25-40, HDB upgraders, EC families. CEA: no fabricated visuals. Give specific copy with numbers.` },
  { id:"listings", name:"Listing Manager", emoji:"🏠", color:"#10b981", role:"Inventory · Fact Sheets · Matching", connectors:["hubspot","canva","drive"], badge:"4 ACTIVE", isDefault:true,
    systemPrompt:`You are Listing Manager for Aden Yang, ERA Realty (CEA R063636G). Listings: 1) Lentor Gardens D26 ~$2150psf 530u near Lentor MRT 2) Thomson Reserve D20 ~$2380psf 478u 3) Hudson Place D5 One-North ~$2620psf 240u (Media Circle Alpha Dev: Qingjian/Forsea/CYZ/Jianan) 4) 117 Macpherson Rd D13 $4.5M freehold landed. Help with fact sheets, buyer profiles, brochure copy.` },
  { id:"closer", name:"Deal Closer", emoji:"🤝", color:"#f59e0b", role:"OTP · Negotiation · Objections", connectors:["hubspot","calendar"], badge:"0 OTPs", isDefault:true,
    systemPrompt:`You are Deal Closer for Aden Yang, ERA Realty (CEA R063636G). SG property: OTP=1% booking, exercise 2-3wks, 4% balance. ABSD 2023: SC 0/17/25%, SPR 5/25%, Foreigner 60%. CPF for down payment. SSD=3yr. Give word-for-word scripts. Practical. Confident coach tone.` },
  { id:"analytics", name:"Business Intel", emoji:"📊", color:"#6366f1", role:"Market Data · URA · Income", connectors:["hubspot","drive"], badge:"LIVE", isDefault:true,
    systemPrompt:`You are Business Intel for Aden Yang, ERA Realty Singapore. Cover: SG property market, URA transactions, PSF trends, rental yields, ROI, commission forecasting. Also: Gold XAUUSD, Japanese equities, Aden Gold bot v4.2 (fixed SGT heartbeat). Districts: D5,D13,D20,D26. EC post-May 2025 (MOP 10yr, DPS removed). Data-driven. Flag estimates.` },
  { id:"spacesaver", name:"SpaceSaver AI", emoji:"📦", color:"#06b6d4", role:"Shopify · Dropship · Products", connectors:["shopify","canva","meta"], badge:"DROPSHIP", isDefault:true,
    systemPrompt:`You are SpaceSaver AI for Aden Yang's Shopify dropshipping store "SpaceSaver" — space-saving home products for Singapore HDB/condo market. Target: SG homeowners, HDB upgraders, young couples. Synergy: Aden's property leads = ideal SpaceSaver customers! Help with product research, pricing, ad copy, order management, cross-selling.` },
  { id:"spy", name:"Competitor Spy", emoji:"🕵️", color:"#f43f5e", role:"Spy · Analyse · Counter-strategy", connectors:["drive"], badge:"INTEL", isDefault:true,
    systemPrompt:`You are Competitor Spy for Aden Yang, ERA Realty Singapore (CEA R063636G). Help analyse competitor property agents' online content, ads, listings and strategies on TikTok, Instagram, PropertyGuru, 99.co and Meta Ad Library. When Aden pastes content, ads or listings — break down what they're doing well, what gaps they have, and exactly how Aden should counter or do better. Aden's edge: Mandarin+Singlish content, analytical PSF breakdowns, honest on-camera style.` },
];

const QUICK = {
  leads:      ["WhatsApp script for Indra Gunawan","How to qualify an EC buyer?","Re-engage Easin AraFat"],
  content:    ["EC Myths 带你不踩坑 script","Lentor Gardens home tour beats","Instagram caption for Lentor Gardens"],
  marketing:  ["Fix blocked Lentor Gardens ad","Best Meta targeting for HDB upgraders","Review Grand Dunman campaign"],
  listings:   ["Compare Lentor Gardens vs Thomson Reserve","Ideal buyer for Hudson Place?","Fact sheet for 117 Macpherson Road"],
  closer:     ["Buyer says price too high — script","Handle ABSD objection","OTP signing checklist"],
  analytics:  ["North SG new launch outlook 2026","Lentor Gardens PSF vs nearby","Commission forecast this quarter"],
  spacesaver: ["Best products to add to SpaceSaver","Product description for storage rack","SpaceSaver Meta ad copy"],
  spy:        ["Analyse this competitor post [paste it]","What ads are competitors running on Meta?","Compare my PropertyGuru listing vs competitors"],
};

const BUILDER_SYSTEM = `You are an AI Agent Builder. When the user describes a new agent they want, respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:
{"name":"Agent Name","emoji":"single emoji","color":"#hexcolor","role":"short role under 40 chars","badge":"badge under 10 chars","connectors":["connector_ids"],"systemPrompt":"detailed system prompt"}
Available connector IDs: hubspot, calendar, meta, canva, heygen, shopify, drive, gmail, whatsapp
Context: User is Aden Yang, Singapore property agent at ERA Realty (CEA R063636G). Also runs SpaceSaver dropshipping. Speaks English, Mandarin, Singlish.
Make the systemPrompt detailed and specific. Pick a relevant emoji and distinct hex color.`;

const EMOJI_OPTIONS = ["🤖","💼","📱","🌐","✍️","🔍","💰","📧","🗓️","🎯","📸","🧮","🏆","⚡","🔔","📝","🛒","💡","🌏","🤑","📲","🧠","🎪","🔧"];
const COLOR_OPTIONS = ["#ef4444","#f97316","#f59e0b","#22c55e","#10b981","#06b6d4","#3b82f6","#6366f1","#a855f7","#ec4899","#14b8a6","#84cc16"];

// ── STORAGE ───────────────────────────────────────────────
const sto = {
  load: k => { try { const r=localStorage.getItem(k); return r?JSON.parse(r):null; } catch { return null; } },
  save: (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} },
  del:  k => { try { localStorage.removeItem(k); } catch {} },
};

// ── API — calls our proxy server, no CORS issues ──────────
const API_URL = "/api/claude";

async function callProxy(body) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e?.error?.message||`HTTP ${res.status}`); }
  return res.json();
}

async function askClaude(systemPrompt, messages) {
  const d = await callProxy({ model:"claude-sonnet-4-6", max_tokens:1200, system:systemPrompt, messages:messages.map(m=>({role:m.role,content:m.content})) });
  return d.content?.[0]?.text || "No response.";
}

async function buildAgent(desc) {
  const d = await callProxy({ model:"claude-sonnet-4-6", max_tokens:1000, system:BUILDER_SYSTEM, messages:[{role:"user",content:desc}] });
  const text = d.content?.[0]?.text||"";
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

// ── COMPONENTS ────────────────────────────────────────────
function Bubble({ msg, agent, isBuilder }) {
  const isUser = msg.role==="user";
  return (
    <div style={{ display:"flex", justifyContent:isUser?"flex-end":"flex-start", marginBottom:14, gap:8, alignItems:"flex-end" }}>
      {!isUser && <div style={{ width:32,height:32,borderRadius:"50%",background:isBuilder?"linear-gradient(135deg,#f59e0b,#ef4444)":agent.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{isBuilder?"⚡":agent.emoji}</div>}
      <div style={{ maxWidth:"78%",padding:"11px 15px",fontSize:14,lineHeight:1.65,whiteSpace:"pre-wrap",
        background:isUser?"#1e40af":"#1e293b", color:"#f1f5f9",
        borderRadius:isUser?"18px 4px 18px 18px":"4px 18px 18px 18px",
        border:isUser?"1px solid #3b82f6":`1px solid ${isBuilder?"#f59e0b50":agent.color+"50"}`,
      }}>
        {msg.content}
        <div style={{ fontSize:11,color:"#64748b",marginTop:5,textAlign:isUser?"right":"left" }}>{msg.time}</div>
      </div>
      {isUser && <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#fff",flexShrink:0 }}>AY</div>}
    </div>
  );
}

function Typing({ color }) {
  const [d,setD] = useState(0);
  useEffect(()=>{ const t=setInterval(()=>setD(x=>(x+1)%3),400); return()=>clearInterval(t); },[]);
  return (
    <div style={{ display:"flex",alignItems:"flex-end",gap:8,marginBottom:12 }}>
      <div style={{ width:32,height:32,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>⏳</div>
      <div style={{ background:"#1e293b",border:`1px solid ${color}50`,borderRadius:"4px 18px 18px 18px",padding:"12px 18px" }}>
        <div style={{ display:"flex",gap:5 }}>
          {[0,1,2].map(i=><div key={i} style={{ width:7,height:7,borderRadius:"50%",background:color,opacity:i===d?1:0.2,transition:"opacity 0.2s" }} />)}
        </div>
      </div>
    </div>
  );
}

function AgentPreview({ agent, onConfirm, onEdit, onDiscard }) {
  return (
    <div style={{ background:"#161b22",border:`2px solid ${agent.color}`,borderRadius:14,padding:18,margin:"10px 0" }}>
      <div style={{ color:"#8b949e",fontSize:11,fontWeight:700,marginBottom:10 }}>✨ PREVIEW — Does this look right?</div>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
        <div style={{ width:52,height:52,borderRadius:"50%",background:agent.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0 }}>{agent.emoji}</div>
        <div>
          <div style={{ color:"#e6edf3",fontWeight:800,fontSize:16 }}>{agent.name}</div>
          <div style={{ color:"#8b949e",fontSize:12,marginTop:2 }}>{agent.role}</div>
          <div style={{ display:"flex",gap:5,marginTop:6,flexWrap:"wrap" }}>
            {(agent.connectors||[]).map(cid=>{ const c=CONNECTORS[cid]; if(!c) return null; return <span key={cid} style={{ background:`${c.color}18`,color:c.color,border:`1px solid ${c.color}40`,borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:700 }}>● {c.name}</span>; })}
          </div>
        </div>
      </div>
      <div style={{ background:"#0d1117",borderRadius:8,padding:10,marginBottom:12,maxHeight:80,overflowY:"auto" }}>
        <div style={{ color:"#484f58",fontSize:10,fontWeight:700,marginBottom:4 }}>SYSTEM PROMPT PREVIEW</div>
        <div style={{ color:"#8b949e",fontSize:11,lineHeight:1.5 }}>{agent.systemPrompt?.slice(0,200)}...</div>
      </div>
      <div style={{ display:"flex",gap:8 }}>
        <button onClick={onConfirm} style={{ flex:1,background:agent.color,color:"#fff",border:"none",borderRadius:9,padding:"10px",fontSize:13,fontWeight:800,cursor:"pointer" }}>✓ Add Agent</button>
        <button onClick={onEdit} style={{ background:"#21262d",color:"#e6edf3",border:"1px solid #30363d",borderRadius:9,padding:"10px 14px",fontSize:13,fontWeight:700,cursor:"pointer" }}>✏️ Edit</button>
        <button onClick={onDiscard} style={{ background:"#2d1515",color:"#f87171",border:"1px solid #f8717140",borderRadius:9,padding:"10px 14px",fontSize:13,fontWeight:700,cursor:"pointer" }}>✕</button>
      </div>
    </div>
  );
}

function EditModal({ agent, onSave, onClose }) {
  const [name,setName]=useState(agent.name), [emoji,setEmoji]=useState(agent.emoji), [color,setColor]=useState(agent.color);
  const [role,setRole]=useState(agent.role), [prompt,setPrompt]=useState(agent.systemPrompt), [conns,setConns]=useState(agent.connectors||[]);
  const toggle = c => setConns(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]);
  return (
    <div style={{ position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ background:"#161b22",border:"1px solid #30363d",borderRadius:14,padding:20,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto" }}>
        <div style={{ color:"#e6edf3",fontWeight:800,fontSize:16,marginBottom:14 }}>✏️ Edit Agent</div>
        {[["NAME",name,setName],["ROLE",role,setRole]].map(([l,v,s])=>(
          <div key={l} style={{ marginBottom:12 }}>
            <label style={{ color:"#8b949e",fontSize:11,fontWeight:700,display:"block",marginBottom:4 }}>{l}</label>
            <input value={v} onChange={e=>s(e.target.value)} style={{ width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #30363d",background:"#0d1117",color:"#e6edf3",fontSize:13,outline:"none" }} />
          </div>
        ))}
        <label style={{ color:"#8b949e",fontSize:11,fontWeight:700,display:"block",marginBottom:6 }}>EMOJI</label>
        <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:12 }}>
          {EMOJI_OPTIONS.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{ width:36,height:36,borderRadius:8,border:`2px solid ${emoji===e?"#58a6ff":"#30363d"}`,background:emoji===e?"#1f3a5f":"#0d1117",fontSize:18,cursor:"pointer" }}>{e}</button>)}
        </div>
        <label style={{ color:"#8b949e",fontSize:11,fontWeight:700,display:"block",marginBottom:6 }}>COLOUR</label>
        <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:12 }}>
          {COLOR_OPTIONS.map(c=><button key={c} onClick={()=>setColor(c)} style={{ width:28,height:28,borderRadius:"50%",background:c,border:`3px solid ${color===c?"#fff":"transparent"}`,cursor:"pointer" }} />)}
        </div>
        <label style={{ color:"#8b949e",fontSize:11,fontWeight:700,display:"block",marginBottom:6 }}>CONNECTORS</label>
        <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:12 }}>
          {Object.entries(CONNECTORS).map(([cid,c])=>(
            <button key={cid} onClick={()=>toggle(cid)} style={{ background:conns.includes(cid)?`${c.color}25`:"#0d1117",color:conns.includes(cid)?c.color:"#484f58",border:`1px solid ${conns.includes(cid)?c.color+"60":"#30363d"}`,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer" }}>
              {conns.includes(cid)?"✓ ":""}{c.name}
            </button>
          ))}
        </div>
        <label style={{ color:"#8b949e",fontSize:11,fontWeight:700,display:"block",marginBottom:4 }}>SYSTEM PROMPT</label>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={6} style={{ width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #30363d",background:"#0d1117",color:"#e6edf3",fontSize:12,outline:"none",resize:"vertical",fontFamily:"inherit",lineHeight:1.5,marginBottom:16 }} />
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={()=>onSave({...agent,name,emoji,color,role,systemPrompt:prompt,connectors:conns})} style={{ flex:1,background:color,color:"#fff",border:"none",borderRadius:9,padding:"10px",fontSize:13,fontWeight:800,cursor:"pointer" }}>Save</button>
          <button onClick={onClose} style={{ background:"#21262d",color:"#e6edf3",border:"1px solid #30363d",borderRadius:9,padding:"10px 16px",fontSize:13,cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR AGENT BUTTON ──────────────────────────────────
function AgentBtn({ a, active, onClick, onEdit, onDelete }) {
  return (
    <div style={{ position:"relative",marginBottom:4 }}>
      <button onClick={onClick} style={{ width:"100%",textAlign:"left",background:active?`${a.color}18`:"transparent",border:`1px solid ${active?a.color+"60":"#30363d"}`,borderRadius:8,padding:"10px 12px",cursor:"pointer",boxShadow:active?`0 0 12px ${a.color}25`:"none",transition:"all 0.15s" }}>
        <div style={{ display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ width:34,height:34,borderRadius:"50%",background:active?a.color:`${a.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>{a.emoji}</div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontWeight:700,fontSize:13,color:"#e6edf3" }}>{a.name}</span>
              <span style={{ fontSize:9,fontWeight:800,color:a.color,background:`${a.color}20`,border:`1px solid ${a.color}40`,borderRadius:4,padding:"1px 6px" }}>{a.badge}</span>
            </div>
            <div style={{ fontSize:11,color:"#8b949e",marginTop:1 }}>{a.role}</div>
            <div style={{ display:"flex",gap:3,marginTop:4 }}>
              {(a.connectors||[]).map(cid=>{ const c=CONNECTORS[cid]; return c?<div key={cid} title={c.name} style={{ width:6,height:6,borderRadius:"50%",background:c.color }} />:null; })}
            </div>
          </div>
        </div>
      </button>
      {a.id.startsWith("custom_") && (
        <div style={{ position:"absolute",top:6,right:6,display:"flex",gap:3 }}>
          <button onClick={e=>{e.stopPropagation();onEdit(a);}} style={{ width:22,height:22,borderRadius:5,background:"#21262d",border:"1px solid #30363d",color:"#8b949e",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>✏️</button>
          <button onClick={e=>{e.stopPropagation();onDelete(a.id);}} style={{ width:22,height:22,borderRadius:5,background:"#21262d",border:"1px solid #30363d",color:"#f87171",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>
      )}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────
export default function App() {
  const [agents,setAgents] = useState(()=>sto.load("ay_agents")||DEFAULT_AGENTS);
  const [activeId,setActiveId] = useState("leads");
  const [histories,setHistories] = useState(()=>Object.fromEntries((sto.load("ay_agents")||DEFAULT_AGENTS).map(a=>[a.id,sto.load(`ay_c_${a.id}`)||[]])));
  const [builderMsgs,setBuilderMsgs] = useState([]);
  const [notes,setNotes] = useState(()=>sto.load("ay_notes")||{});
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const [view,setView] = useState("chat");
  const [sideOpen,setSideOpen] = useState(false);
  const [showMem,setShowMem] = useState(false);
  const [noteInput,setNoteInput] = useState("");
  const [toast,setToast] = useState(null);
  const [tick,setTick] = useState(new Date());
  const [pendingAgent,setPendingAgent] = useState(null);
  const [editingAgent,setEditingAgent] = useState(null);
  const [deleteConfirm,setDeleteConfirm] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const isBuilder = activeId==="__builder__";
  const agent = isBuilder?null:agents.find(a=>a.id===activeId);
  const msgs = isBuilder?builderMsgs:(histories[activeId]||[]);

  useEffect(()=>{ const t=setInterval(()=>setTick(new Date()),1000); return()=>clearInterval(t); },[]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  const popToast=(msg,type="ok")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),2500); };
  const ts=()=>tick.toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit"});

  const sendNormal = async text => {
    const uMsg={role:"user",content:text,time:ts()};
    const next=[...msgs,uMsg];
    setHistories(p=>({...p,[activeId]:next}));
    setLoading(true);
    try {
      const reply=await askClaude(agent.systemPrompt,next);
      const final=[...next,{role:"assistant",content:reply,time:ts()}];
      setHistories(p=>({...p,[activeId]:final}));
      sto.save(`ay_c_${activeId}`,final.slice(-40));
    } catch(e) {
      setHistories(p=>({...p,[activeId]:[...next,{role:"assistant",content:`⚠️ ${e.message}`,time:ts()}]}));
      popToast(e.message,"err");
    }
    setLoading(false);
  };

  const sendBuilder = async text => {
    const uMsg={role:"user",content:text,time:ts()};
    const next=[...builderMsgs,uMsg];
    setBuilderMsgs([...next,{role:"assistant",content:"⚙️ Building your agent...",time:ts()}]);
    setLoading(true);
    try {
      const data=await buildAgent(text);
      data.id="custom_"+Date.now(); data.isDefault=false;
      setBuilderMsgs([...next,{role:"assistant",content:`✅ Here's the agent I built! Check the preview below.`,time:ts()}]);
      setPendingAgent(data);
    } catch(e) {
      setBuilderMsgs([...next,{role:"assistant",content:`⚠️ ${e.message}\n\nTry again with more detail.`,time:ts()}]);
      popToast(e.message,"err");
    }
    setLoading(false);
  };

  const send = async () => {
    const text=input.trim(); if(!text||loading) return;
    setInput(""); setSideOpen(false);
    if(isBuilder) await sendBuilder(text); else await sendNormal(text);
  };
  const onKey=e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} };

  const confirmAgent=()=>{
    if(!pendingAgent) return;
    const updated=[...agents,pendingAgent];
    setAgents(updated); sto.save("ay_agents",updated);
    setHistories(p=>({...p,[pendingAgent.id]:[]}));
    setActiveId(pendingAgent.id); setView("chat"); setPendingAgent(null); setSideOpen(false);
    popToast(`${pendingAgent.name} added! 🎉`);
    setBuilderMsgs(p=>[...p,{role:"assistant",content:`🎉 ${pendingAgent.name} is live in your sidebar!`,time:ts()}]);
  };

  const saveEdit=edited=>{ const u=agents.map(a=>a.id===edited.id?edited:a); setAgents(u); sto.save("ay_agents",u); setEditingAgent(null); popToast("Agent updated ✓"); };
  const deleteAgent=id=>{ const u=agents.filter(a=>a.id!==id); setAgents(u); sto.save("ay_agents",u); sto.del(`ay_c_${id}`); if(activeId===id) setActiveId("leads"); setDeleteConfirm(null); popToast("Agent removed"); };
  const clearMem=()=>{ sto.del(`ay_c_${activeId}`); setHistories(p=>({...p,[activeId]:[]})); popToast("Memory cleared"); setShowMem(false); };
  const addNote=()=>{ if(!noteInput.trim()) return; const u={...notes,[activeId]:[...(notes[activeId]||[]),{text:noteInput.trim(),time:ts()}]}; setNotes(u); sto.save("ay_notes",u); setNoteInput(""); popToast("Note saved ✓"); };
  const delNote=i=>{ const u={...notes,[activeId]:notes[activeId].filter((_,j)=>j!==i)}; setNotes(u); sto.save("ay_notes",u); };
  const totalMsgs=Object.values(histories).reduce((s,h)=>s+h.length,0);

  const BG="#0d1117",SURFACE="#161b22",BORDER="#30363d",TEXT="#e6edf3",SUB="#8b949e",MUTED="#484f58";

  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif",background:BG,height:"100vh",height:"100dvh",display:"flex",flexDirection:"column",overflow:"hidden",color:TEXT }}>
      <style>{`
        @keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#30363d;border-radius:2px}
        textarea::placeholder,input::placeholder{color:#484f58}
      `}</style>

      {toast&&<div style={{ position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:toast.type==="err"?"#2d1515":"#122112",color:toast.type==="err"?"#f87171":"#4ade80",padding:"8px 20px",borderRadius:24,fontSize:12,fontWeight:700,border:`1px solid ${toast.type==="err"?"#f8717140":"#4ade8040"}`,whiteSpace:"nowrap",boxShadow:"0 4px 20px #00000080",animation:"fadein 0.2s ease" }}>{toast.type==="err"?"⚠ ":"✓ "}{toast.msg}</div>}
      {sideOpen&&<div onClick={()=>setSideOpen(false)} style={{ position:"fixed",inset:0,background:"#00000090",zIndex:40,backdropFilter:"blur(2px)" }} />}
      {editingAgent&&<EditModal agent={editingAgent} onSave={saveEdit} onClose={()=>setEditingAgent(null)} />}
      {deleteConfirm&&(
        <div style={{ position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:SURFACE,border:"1px solid #f8717150",borderRadius:14,padding:24,maxWidth:340,width:"100%" }}>
            <div style={{ color:TEXT,fontWeight:800,fontSize:16,marginBottom:8 }}>Remove agent?</div>
            <div style={{ color:SUB,fontSize:13,marginBottom:20 }}>Delete <strong style={{color:TEXT}}>{agents.find(a=>a.id===deleteConfirm)?.name}</strong> and all its chat history?</div>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>deleteAgent(deleteConfirm)} style={{ flex:1,background:"#f87171",color:"#fff",border:"none",borderRadius:9,padding:"10px",fontSize:13,fontWeight:800,cursor:"pointer" }}>Yes, remove</button>
              <button onClick={()=>setDeleteConfirm(null)} style={{ flex:1,background:"#21262d",color:TEXT,border:`1px solid ${BORDER}`,borderRadius:9,padding:"10px",fontSize:13,cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ background:SURFACE,borderBottom:`1px solid ${BORDER}`,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,zIndex:30 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={()=>setSideOpen(!sideOpen)} style={{ background:"transparent",border:"none",color:SUB,cursor:"pointer",fontSize:20,padding:0,lineHeight:1 }}>☰</button>
          <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#f59e0b,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#fff",fontSize:13 }}>AY</div>
          <div>
            <div style={{ color:TEXT,fontWeight:800,fontSize:14 }}>Agent Command Centre</div>
            <div style={{ color:MUTED,fontSize:11 }}>ERA R063636G · {agents.length} agents · {totalMsgs} msgs</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ color:"#58a6ff",fontWeight:800,fontSize:14,fontVariantNumeric:"tabular-nums" }}>{tick.toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
          <div style={{ color:MUTED,fontSize:10 }}>{tick.toLocaleDateString("en-SG",{weekday:"short",day:"numeric",month:"short"})} SGT</div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ background:SURFACE,borderBottom:`1px solid ${BORDER}`,display:"flex",flexShrink:0,overflowX:"auto" }}>
        {[{v:"chat",l:"💬 Chat"},{v:"pipeline",l:"📊 Pipeline"},{v:"overview",l:"🗺️ Cycle"},{v:"connectors",l:"🔌 Tools"}].map(({v,l})=>(
          <button key={v} onClick={()=>setView(v)} style={{ padding:"10px 18px",border:"none",background:"transparent",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap",color:view===v?TEXT:SUB,borderBottom:`2px solid ${view===v?"#58a6ff":"transparent"}`,transition:"all 0.15s" }}>{l}</button>
        ))}
      </div>

      <div style={{ flex:1,display:"flex",overflow:"hidden",position:"relative" }}>

        {/* SIDEBAR */}
        <div style={{ position:"absolute",left:0,top:0,bottom:0,zIndex:50,width:230,background:"#0d1117",borderRight:`1px solid ${BORDER}`,display:"flex",flexDirection:"column",transform:sideOpen?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s ease",boxShadow:sideOpen?"6px 0 24px #00000060":"none" }}>
          <div style={{ padding:"12px 14px 8px",color:MUTED,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",borderBottom:`1px solid ${BORDER}` }}>Agents ({agents.length})</div>
          <div style={{ flex:1,overflowY:"auto",padding:"8px" }}>
            <button onClick={()=>{setActiveId("__builder__");setSideOpen(false);setView("chat");}} style={{ width:"100%",textAlign:"left",background:activeId==="__builder__"?"#1f2a0a":"transparent",border:`1px solid ${activeId==="__builder__"?"#4ade80":"#30363d"}`,borderRadius:8,padding:"10px 12px",marginBottom:8,cursor:"pointer" }}>
              <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                <div style={{ width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>⚡</div>
                <div><div style={{ color:TEXT,fontWeight:700,fontSize:13 }}>Build New Agent</div><div style={{ color:"#4ade80",fontSize:11,marginTop:1 }}>Describe in plain English</div></div>
              </div>
            </button>
            <div style={{ color:MUTED,fontSize:10,fontWeight:700,letterSpacing:0.8,padding:"4px 6px 6px" }}>🏙 PROPERTY</div>
            {agents.filter(a=>!["spacesaver","spy"].includes(a.id)&&!a.id.startsWith("custom_")).map(a=>(
              <AgentBtn key={a.id} a={a} active={activeId===a.id} onClick={()=>{setActiveId(a.id);setSideOpen(false);setShowMem(false);}} onEdit={setEditingAgent} onDelete={setDeleteConfirm} />
            ))}
            <div style={{ color:MUTED,fontSize:10,fontWeight:700,letterSpacing:0.8,padding:"8px 6px 6px" }}>📦 DROPSHIP</div>
            {agents.filter(a=>a.id==="spacesaver").map(a=>(
              <AgentBtn key={a.id} a={a} active={activeId===a.id} onClick={()=>{setActiveId(a.id);setSideOpen(false);setShowMem(false);}} onEdit={setEditingAgent} onDelete={setDeleteConfirm} />
            ))}
            <div style={{ color:MUTED,fontSize:10,fontWeight:700,letterSpacing:0.8,padding:"8px 6px 6px" }}>🕵️ INTEL</div>
            {agents.filter(a=>a.id==="spy").map(a=>(
              <AgentBtn key={a.id} a={a} active={activeId===a.id} onClick={()=>{setActiveId(a.id);setSideOpen(false);setShowMem(false);}} onEdit={setEditingAgent} onDelete={setDeleteConfirm} />
            ))}
            {agents.filter(a=>a.id.startsWith("custom_")).length>0&&(
              <>
                <div style={{ color:MUTED,fontSize:10,fontWeight:700,letterSpacing:0.8,padding:"8px 6px 6px" }}>⚡ MY AGENTS</div>
                {agents.filter(a=>a.id.startsWith("custom_")).map(a=>(
                  <AgentBtn key={a.id} a={a} active={activeId===a.id} onClick={()=>{setActiveId(a.id);setSideOpen(false);setShowMem(false);}} onEdit={setEditingAgent} onDelete={setDeleteConfirm} />
                ))}
              </>
            )}
          </div>
          <div style={{ padding:"10px 14px",borderTop:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:6 }}>
            <div style={{ width:7,height:7,borderRadius:"50%",background:"#3fb950",animation:"pulse 2s infinite" }} />
            <span style={{ color:"#3fb950",fontSize:11,fontWeight:700 }}>All systems online</span>
          </div>
        </div>

        {/* PIPELINE */}
        {view==="pipeline"&&(
          <div style={{ flex:1,overflowY:"auto",padding:20 }}>
            <div style={{ color:TEXT,fontWeight:800,fontSize:17,marginBottom:16 }}>📊 Sales Pipeline</div>
            {[{stage:"New Lead",color:"#6366f1",contacts:["Indra Gunawan","Easin AraFat"]},{stage:"Contacted",color:"#3b82f6",contacts:[]},{stage:"Viewing",color:"#f59e0b",contacts:[]},{stage:"Negotiating",color:"#ef4444",contacts:[]},{stage:"OTP / Close",color:"#22c55e",contacts:[]}].map(s=>(
              <div key={s.stage} style={{ background:SURFACE,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${s.color}`,borderRadius:10,padding:14,marginBottom:10 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:s.contacts.length?10:0 }}>
                  <span style={{ color:TEXT,fontWeight:700,fontSize:14 }}>{s.stage}</span>
                  <span style={{ background:`${s.color}25`,color:s.color,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:700 }}>{s.contacts.length}</span>
                </div>
                {s.contacts.map(c=>(<div key={c} style={{ background:BG,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 13px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}><span style={{ color:TEXT,fontSize:13 }}>{c}</span><button onClick={()=>{setActiveId("leads");setView("chat");setTimeout(()=>setInput(`Help me move ${c} to the next stage`),50);}} style={{ background:`${s.color}20`,border:`1px solid ${s.color}50`,color:s.color,borderRadius:7,padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:700 }}>Ask →</button></div>))}
                {!s.contacts.length&&<div style={{ color:MUTED,fontSize:12,fontStyle:"italic" }}>Empty</div>}
              </div>
            ))}
          </div>
        )}

        {/* OVERVIEW */}
        {view==="overview"&&(
          <div style={{ flex:1,overflowY:"auto",padding:20 }}>
            <div style={{ color:TEXT,fontWeight:800,fontSize:17,marginBottom:16 }}>🗺️ Full Business Cycle</div>
            {[{n:"01",label:"Generate Leads",desc:"Ads, content, social",aids:["marketing","content"],color:"#3b82f6",badge:"1 live"},{n:"02",label:"Qualify & Nurture",desc:"Follow up, build trust",aids:["leads"],color:"#ef4444",badge:"2 action"},{n:"03",label:"Show Listings",desc:"Match buyer to property",aids:["listings","leads"],color:"#22c55e",badge:"4 active"},{n:"04",label:"Negotiate & Close",desc:"Objections, OTP, docs",aids:["closer","listings"],color:"#f59e0b",badge:"0 OTPs"},{n:"05",label:"Review & Scale",desc:"Income, market intel",aids:["analytics"],color:"#6366f1",badge:"Ready"},{n:"06",label:"SpaceSaver",desc:"Products, ads, orders",aids:["spacesaver"],color:"#06b6d4",badge:"Synergy"},{n:"07",label:"Competitor Intel",desc:"Spy, analyse, counter",aids:["spy"],color:"#f43f5e",badge:"INTEL"}].map(s=>(
              <div key={s.n} style={{ background:SURFACE,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${s.color}`,borderRadius:10,padding:14,marginBottom:10 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                  <div><div style={{ color:s.color,fontSize:10,fontWeight:700 }}>STEP {s.n}</div><div style={{ color:TEXT,fontWeight:700,fontSize:15 }}>{s.label}</div><div style={{ color:SUB,fontSize:12 }}>{s.desc}</div></div>
                  <span style={{ background:`${s.color}20`,color:s.color,borderRadius:8,padding:"3px 9px",fontSize:11,fontWeight:700 }}>{s.badge}</span>
                </div>
                <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
                  {s.aids.map(id=>{const a=agents.find(ag=>ag.id===id); if(!a) return null; return <button key={id} onClick={()=>{setActiveId(id);setView("chat");}} style={{ background:`${a.color}20`,border:`1px solid ${a.color}50`,color:a.color,borderRadius:7,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:700 }}>{a.emoji} {a.name}</button>;})}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONNECTORS */}
        {view==="connectors"&&(
          <div style={{ flex:1,overflowY:"auto",padding:20 }}>
            <div style={{ color:TEXT,fontWeight:800,fontSize:17,marginBottom:16 }}>🔌 Active Connectors</div>
            <div style={{ background:"#122112",border:"1px solid #3fb95050",borderRadius:10,padding:14,marginBottom:14 }}>
              <div style={{ color:"#3fb950",fontWeight:700,fontSize:13,marginBottom:4 }}>✓ {Object.keys(CONNECTORS).length} connectors available</div>
              <div style={{ color:SUB,fontSize:12 }}>Ask any agent to use their tools — e.g. "pull my HubSpot leads" or "check Shopify orders".</div>
            </div>
            {Object.entries(CONNECTORS).map(([cid,c])=>{
              const usedBy=agents.filter(a=>(a.connectors||[]).includes(cid));
              return(
                <div key={cid} style={{ background:SURFACE,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${c.color}`,borderRadius:10,padding:14,marginBottom:10 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                    <div style={{ width:40,height:40,borderRadius:10,background:`${c.color}20`,border:`1px solid ${c.color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🔗</div>
                    <div><div style={{ color:TEXT,fontWeight:700,fontSize:14 }}>{c.name}</div><div style={{ display:"flex",alignItems:"center",gap:5,marginTop:2 }}><div style={{ width:6,height:6,borderRadius:"50%",background:"#3fb950" }} /><span style={{ color:"#3fb950",fontSize:11,fontWeight:700 }}>Connected</span></div></div>
                  </div>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                    {usedBy.map(a=><span key={a.id} style={{ background:`${a.color}18`,color:a.color,border:`1px solid ${a.color}40`,borderRadius:7,padding:"3px 10px",fontSize:11,fontWeight:700 }}>{a.emoji} {a.name}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CHAT */}
        {view==="chat"&&(
          <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
            {/* Agent header */}
            {isBuilder?(
              <div style={{ background:SURFACE,borderBottom:`1px solid #4ade8040`,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
                <div style={{ width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>⚡</div>
                <div style={{ flex:1 }}><div style={{ color:TEXT,fontWeight:800,fontSize:15 }}>Agent Builder</div><div style={{ color:"#4ade80",fontSize:12,marginTop:2 }}>Describe the agent you want in plain English</div></div>
                <button onClick={()=>setSideOpen(true)} style={{ background:"#21262d",border:`1px solid ${BORDER}`,color:SUB,borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:700,cursor:"pointer" }}>☰</button>
              </div>
            ):(
              <div style={{ background:SURFACE,borderBottom:`1px solid ${BORDER}`,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0,boxShadow:`0 0 20px ${agent?.color}15` }}>
                <div style={{ width:44,height:44,borderRadius:"50%",background:agent?.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:`0 0 14px ${agent?.color}60` }}>{agent?.emoji}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ color:TEXT,fontWeight:800,fontSize:15 }}>{agent?.name}</div>
                  <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginTop:4 }}>
                    {(agent?.connectors||[]).map(cid=>{ const c=CONNECTORS[cid]; return c?<span key={cid} style={{ background:`${c.color}18`,color:c.color,border:`1px solid ${c.color}40`,borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:3 }}><span style={{ width:4,height:4,borderRadius:"50%",background:"#3fb950",display:"inline-block" }} />{c.name}</span>:null; })}
                  </div>
                </div>
                <div style={{ display:"flex",gap:6 }}>
                  {agent?.id?.startsWith("custom_")&&<button onClick={()=>setEditingAgent(agent)} style={{ background:"#21262d",border:`1px solid ${BORDER}`,color:SUB,borderRadius:8,padding:"7px 10px",fontSize:12,cursor:"pointer" }}>✏️</button>}
                  {CLAUDE_LINKS[activeId]&&(
                    <a href={CLAUDE_LINKS[activeId]} target="_blank" rel="noreferrer" title="Open in Claude.ai Project"
                      style={{ background:"#1a2535",border:"1px solid #58a6ff40",color:"#58a6ff",borderRadius:8,padding:"7px 11px",fontSize:12,fontWeight:700,cursor:"pointer",textDecoration:"none",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap" }}>
                      🔗 Project
                    </a>
                  )}
                  <button onClick={()=>setSideOpen(true)} style={{ background:`${agent?.color}18`,border:`1px solid ${agent?.color}50`,color:agent?.color,borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:700,cursor:"pointer" }}>☰</button>
                  <button onClick={()=>setShowMem(!showMem)} style={{ background:showMem?`${agent?.color}30`:`${agent?.color}18`,border:`1px solid ${agent?.color}50`,color:agent?.color,borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:700,cursor:"pointer" }}>🧠 {msgs.length}</button>
                </div>
              </div>
            )}

            {/* Memory */}
            {showMem&&!isBuilder&&(
              <div style={{ background:"#0d1117",borderBottom:`1px solid ${BORDER}`,padding:"12px 16px",maxHeight:220,overflowY:"auto" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <span style={{ color:TEXT,fontWeight:700,fontSize:13 }}>🧠 Memory — {msgs.length} messages</span>
                  <button onClick={clearMem} style={{ background:"#2d1515",color:"#f87171",border:"1px solid #f8717140",borderRadius:7,padding:"4px 12px",fontSize:12,cursor:"pointer",fontWeight:700 }}>Clear</button>
                </div>
                <div style={{ color:SUB,fontSize:12,marginBottom:10 }}>Saved in browser. Auto-reloads next session.</div>
                <div style={{ display:"flex",gap:7,marginBottom:8 }}>
                  <input value={noteInput} onChange={e=>setNoteInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addNote()} placeholder="Pin a note..." style={{ flex:1,padding:"8px 12px",borderRadius:8,border:`1px solid ${BORDER}`,background:SURFACE,color:TEXT,fontSize:12,outline:"none" }} />
                  <button onClick={addNote} style={{ background:agent?.color,color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,cursor:"pointer",fontWeight:700 }}>+</button>
                </div>
                {(notes[activeId]||[]).map((n,i)=>(<div key={i} style={{ background:"#1c2128",border:`1px solid ${BORDER}`,borderRadius:8,padding:"7px 12px",marginBottom:5,display:"flex",justifyContent:"space-between" }}><div><div style={{ fontSize:13,color:TEXT }}>{n.text}</div><div style={{ fontSize:10,color:MUTED,marginTop:2 }}>{n.time}</div></div><button onClick={()=>delNote(i)} style={{ background:"transparent",border:"none",color:MUTED,cursor:"pointer",fontSize:18 }}>×</button></div>))}
                {!(notes[activeId]||[]).length&&<div style={{ color:MUTED,fontSize:12,fontStyle:"italic" }}>No notes yet</div>}
              </div>
            )}

            {/* Messages */}
            <div style={{ flex:1,overflowY:"auto",padding:"16px 16px 6px",WebkitOverflowScrolling:"touch" }}>
              {isBuilder&&msgs.length===0&&(
                <div style={{ textAlign:"center",padding:"36px 20px",animation:"fadein 0.4s ease" }}>
                  <div style={{ width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 16px",boxShadow:"0 0 28px #f59e0b40" }}>⚡</div>
                  <div style={{ color:TEXT,fontWeight:800,fontSize:18,marginBottom:6 }}>Agent Builder</div>
                  <div style={{ color:SUB,fontSize:13,marginBottom:20,lineHeight:1.6,maxWidth:380,margin:"0 auto 20px" }}>Just tell me what agent you need — I'll build it instantly.</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:8,maxWidth:400,margin:"0 auto",textAlign:"left" }}>
                    {["Create a Telegram marketing agent for property broadcasts","Build a rental management agent for my HDB tenants","Make a golf networking agent for client relationships","Create a nail business agent for @little.nails.girl","Build a morning briefing agent that summarises my day"].map(p=>(
                      <button key={p} onClick={()=>{setInput(p);inputRef.current?.focus();}} style={{ background:SURFACE,color:TEXT,border:"1px solid #4ade8040",borderRadius:10,padding:"12px 15px",fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"left",lineHeight:1.4 }}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
              {!isBuilder&&msgs.length===0&&(
                <div style={{ textAlign:"center",padding:"36px 20px",animation:"fadein 0.4s ease" }}>
                  <div style={{ width:72,height:72,borderRadius:"50%",background:agent?.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 16px",boxShadow:`0 0 28px ${agent?.color}40` }}>{agent?.emoji}</div>
                  <div style={{ color:TEXT,fontWeight:800,fontSize:17,marginBottom:4 }}>Hi! I'm {agent?.name}</div>
                  <div style={{ color:SUB,fontSize:13,marginBottom:6 }}>{agent?.role}</div>
                  {CLAUDE_LINKS[activeId]&&(
                    <a href={CLAUDE_LINKS[activeId]} target="_blank" rel="noreferrer" style={{ display:"inline-flex",alignItems:"center",gap:6,background:"#1a2535",border:"1px solid #58a6ff40",color:"#58a6ff",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,textDecoration:"none",marginBottom:16 }}>
                      🔗 Open deep-work session in Claude.ai
                    </a>
                  )}
                  <div style={{ display:"flex",flexDirection:"column",gap:7,maxWidth:400,margin:"0 auto" }}>
                    {(QUICK[activeId]||[]).map(p=>(
                      <button key={p} onClick={()=>{setInput(p);inputRef.current?.focus();}} style={{ background:SURFACE,color:TEXT,border:`1px solid ${agent?.color}40`,borderRadius:10,padding:"12px 15px",fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"left" }}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map((m,i)=><Bubble key={i} msg={m} agent={agent||{color:"#f59e0b",emoji:"⚡"}} isBuilder={isBuilder} />)}
              {loading&&<Typing color={isBuilder?"#f59e0b":agent?.color||"#58a6ff"} />}
              {pendingAgent&&isBuilder&&(
                <AgentPreview agent={pendingAgent} onConfirm={confirmAgent} onEdit={()=>setEditingAgent(pendingAgent)} onDiscard={()=>{setPendingAgent(null);setBuilderMsgs(p=>[...p,{role:"assistant",content:"Agent discarded. Try a different description?",time:ts()}]);}} />
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ background:SURFACE,borderTop:`1px solid ${BORDER}`,padding:"12px 16px",paddingBottom:"max(12px,env(safe-area-inset-bottom))",flexShrink:0 }}>
              {isBuilder&&<div style={{ background:"#122112",border:"1px solid #4ade8040",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#4ade80" }}>⚡ Describe your new agent below — be specific about what it should do.</div>}
              <div style={{ display:"flex",gap:8,alignItems:"flex-end" }}>
                <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey} placeholder={isBuilder?"Describe the agent you want...":"Message "+(agent?.name||"")+"..."} rows={1} style={{ flex:1,padding:"10px 14px",borderRadius:12,border:`1.5px solid ${input?(isBuilder?"#4ade80":agent?.color||"#58a6ff"):BORDER}`,background:BG,color:TEXT,fontSize:14,fontFamily:"inherit",lineHeight:1.5,outline:"none",resize:"none",transition:"border-color 0.15s" }} />
                <button onClick={send} disabled={!input.trim()||loading} style={{ width:42,height:42,borderRadius:12,border:"none",flexShrink:0,background:input.trim()&&!loading?(isBuilder?"#4ade80":agent?.color||"#58a6ff"):"#21262d",color:input.trim()&&!loading?"#0d1117":"#484f58",cursor:input.trim()&&!loading?"pointer":"default",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",fontWeight:900 }}>↑</button>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",marginTop:7 }}>
                <span style={{ fontSize:11,color:MUTED }}>Enter to send · Shift+Enter new line · ☰ switch agent</span>
                <span style={{ fontSize:11,color:"#3fb950",fontWeight:700,display:"flex",alignItems:"center",gap:4 }}><span style={{ width:6,height:6,borderRadius:"50%",background:"#3fb950",display:"inline-block",animation:"pulse 2s infinite" }} />Live</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
