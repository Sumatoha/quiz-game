import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  cream: "#faf5eb", creamDark: "#f0e9d8", white: "#ffffff",
  ink: "#1a1a2e", inkSoft: "#2d2d44", inkMuted: "#6b6b82", inkLight: "#9999ad", inkPale: "#cdcdd8",
  blue: "#3d5afe", bluePale: "#e8ecff", pink: "#ff2d78", pinkPale: "#ffe4ee",
  yellow: "#ffc815", yellowPale: "#fff6d4", mint: "#00d68f", mintPale: "#d4fae9",
  orange: "#ff7043", orangePale: "#ffe4d9", violet: "#7c4dff", violetPale: "#ede4ff",
  correct: "#00c853", danger: "#ff1744",
  teams: ["#3d5afe","#ff2d78","#ffc815","#00d68f","#ff7043","#7c4dff","#00b0ff","#ff6d00"],
};
const uid = () => Math.random().toString(36).slice(2, 9);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');
*{box-sizing:border-box}
body{background:${C.cream}}
.quiz-root{position:relative;overflow:hidden}
.blob{position:fixed;border-radius:50%;z-index:0;pointer-events:none}
.blob-1{width:400px;height:400px;background:${C.bluePale};top:-120px;right:-100px}
.blob-2{width:300px;height:300px;background:${C.pinkPale};bottom:-80px;left:-60px}
.blob-3{width:200px;height:200px;background:${C.yellowPale};top:40%;left:-40px}
.blob-4{width:250px;height:250px;background:${C.mintPale};bottom:20%;right:-60px}
.quiz-content{position:relative;z-index:1}
.pop-card{background:${C.white};border:3px solid ${C.ink};border-radius:20px;box-shadow:6px 6px 0px ${C.ink};transition:all 0.15s ease}
.pop-card-color{border-radius:20px;border:3px solid ${C.ink};transition:all 0.15s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{0%{opacity:0;transform:scale(0.9) rotate(-2deg)}60%{transform:scale(1.02) rotate(0.5deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.q-cell{transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1) !important;cursor:pointer}
.q-cell:not(:disabled):hover{transform:translateY(-5px) scale(1.06) !important;box-shadow:5px 8px 0px var(--cell-ink) !important}
.q-cell:not(:disabled):active{transform:translateY(0) scale(0.98) !important;box-shadow:2px 2px 0px var(--cell-ink) !important}
`;

const SAMPLE_JSON = `{
  "rounds": [
    {
      "name": "Раунд 1",
      "topics": [
        {
          "name": "География",
          "questions": [
            { "text": "Столица Японии?", "answer": "Токио", "points": 10 },
            { "text": "Самая длинная река?", "answer": "Нил", "points": 20 }
          ]
        }
      ]
    }
  ]
}`;

function Btn({children,onClick,disabled,color=C.blue,textColor="#fff",outline,small,style}){
  const bg=outline?"transparent":color,fg=outline?color:textColor;
  return <button onClick={onClick} disabled={disabled} style={{background:bg,color:fg,border:outline?`3px solid ${color}`:`3px solid ${C.ink}`,padding:small?"6px 14px":"10px 22px",borderRadius:small?12:14,fontSize:small?13:14,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.35:1,boxShadow:outline?"none":`4px 4px 0px ${C.ink}`,transition:"all 0.15s",letterSpacing:"0.01em",...style}}>{children}</button>;
}
function Inp({value,onChange,placeholder,style,type="text",onKeyDown}){
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onKeyDown={onKeyDown}
    style={{background:C.cream,border:`2px solid ${C.inkPale}`,borderRadius:12,padding:"10px 14px",color:C.ink,fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600,outline:"none",width:"100%",boxSizing:"border-box",transition:"border-color 0.15s",...style}}
    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.inkPale}/>;
}
function Txt({value,onChange,placeholder,rows=2}){
  return <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{background:C.cream,border:`2px solid ${C.inkPale}`,borderRadius:12,padding:"10px 14px",color:C.ink,fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",lineHeight:1.5}}
    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.inkPale}/>;
}
function Tag({children,bg=C.bluePale,color=C.blue}){
  return <span style={{background:bg,color,padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:800,fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:"0.02em",border:`2px solid ${color}30`,display:"inline-flex",alignItems:"center"}}>{children}</span>;
}

/* ─── SETUP ─── */
function SetupPhase({rounds,setRounds,onNext}){
  const makeQs=(n=10)=>Array.from({length:n},(_,i)=>({id:uid(),text:"",answer:"",points:(i+1)*10}));
  const addRound=()=>setRounds([...rounds,{id:uid(),name:`Раунд ${rounds.length+1}`,topics:[]}]);
  const removeRound=rid=>rounds.length>1&&setRounds(rounds.filter(r=>r.id!==rid));
  const updateRound=(rid,k,v)=>setRounds(rounds.map(r=>r.id===rid?{...r,[k]:v}:r));
  const addTopic=rid=>setRounds(rounds.map(r=>r.id===rid?{...r,topics:[...r.topics,{id:uid(),name:"",questions:makeQs()}]}:r));
  const removeTopic=(rid,tid)=>setRounds(rounds.map(r=>r.id===rid?{...r,topics:r.topics.filter(t=>t.id!==tid)}:r));
  const updateTopic=(rid,tid,k,v)=>setRounds(rounds.map(r=>r.id===rid?{...r,topics:r.topics.map(t=>t.id===tid?{...t,[k]:v}:t)}:r));
  const addQ=(rid,tid)=>setRounds(rounds.map(r=>r.id===rid?{...r,topics:r.topics.map(t=>t.id===tid?{...t,questions:[...t.questions,{id:uid(),text:"",answer:"",points:(t.questions.length+1)*10}]}:t)}:r));
  const removeQ=(rid,tid,qid)=>setRounds(rounds.map(r=>r.id===rid?{...r,topics:r.topics.map(t=>t.id===tid?{...t,questions:t.questions.filter(q=>q.id!==qid)}:t)}:r));
  const updateQ=(rid,tid,qid,k,v)=>setRounds(rounds.map(r=>r.id===rid?{...r,topics:r.topics.map(t=>t.id===tid?{...t,questions:t.questions.map(q=>q.id===qid?{...q,[k]:v}:q)}:t)}:r));
  const totalQ=rounds.reduce((a,r)=>a+r.topics.reduce((b,t)=>b+t.questions.length,0),0);
  const canGo=rounds.every(r=>r.topics.length>0&&r.topics.every(t=>t.name&&t.questions.length>0&&t.questions.every(q=>q.text)));

  // COLLAPSED state — store only collapsed topics, default is OPEN
  const [collapsed,setCollapsed]=useState({});
  const toggle=tid=>setCollapsed(p=>({...p,[tid]:!p[tid]}));
  const [showImport,setShowImport]=useState(false);
  const [importErr,setImportErr]=useState("");
  const fileRef=useRef(null);

  const parseCSV=(text)=>{
    const lines=text.trim().split("\n").map(l=>l.split(/[,\t]/).map(c=>c.trim().replace(/^"|"$/g,"")));
    if(lines.length<2)throw new Error("Мало строк");
    const h=lines[0].map(x=>x.toLowerCase());
    const ri=h.indexOf("round"),ti=h.indexOf("topic"),qi=h.indexOf("question"),ai=h.indexOf("answer"),pi=h.indexOf("points");
    if(qi===-1)throw new Error("Нужен столбец 'question'");
    const rm={};
    for(let i=1;i<lines.length;i++){const row=lines[i],rn=ri>=0?(row[ri]||"Раунд 1"):"Раунд 1",tn=ti>=0?(row[ti]||"Тема 1"):"Тема 1";if(!rm[rn])rm[rn]={};if(!rm[rn][tn])rm[rn][tn]=[];rm[rn][tn].push({text:row[qi]||"",answer:ai>=0?(row[ai]||""):"",points:pi>=0?(parseInt(row[pi])||10):(rm[rn][tn].length+1)*10});}
    return{rounds:Object.entries(rm).map(([n,ts])=>({name:n,topics:Object.entries(ts).map(([tn,qs])=>({name:tn,questions:qs}))}))};
  };
  const handleFile=(e)=>{
    const file=e.target.files?.[0];if(!file)return;setImportErr("");
    const reader=new FileReader();
    reader.onload=(ev)=>{try{let data=file.name.match(/\.(csv|tsv)$/i)?parseCSV(ev.target.result):JSON.parse(ev.target.result);if(!data.rounds?.length)throw new Error("Нужен 'rounds' массив");setRounds(data.rounds.map(r=>({id:uid(),name:r.name||"Раунд",topics:(r.topics||[]).map(t=>({id:uid(),name:t.name||"Тема",questions:(t.questions||[]).map((q,i)=>({id:uid(),text:q.text||"",answer:q.answer||"",points:q.points||(i+1)*10}))}))})));setShowImport(false);}catch(err){setImportErr(err.message);}};
    reader.readAsText(file);
  };

  const topicColors=[{bg:C.pinkPale,border:C.pink,text:C.pink},{bg:C.bluePale,border:C.blue,text:C.blue},{bg:C.mintPale,border:C.mint,text:C.mint},{bg:C.yellowPale,border:C.yellow,text:C.inkSoft},{bg:C.orangePale,border:C.orange,text:C.orange},{bg:C.violetPale,border:C.violet,text:C.violet}];

  return(
    <div style={{maxWidth:840,margin:"0 auto",padding:"28px 16px 80px"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{display:"inline-block",background:C.yellow,border:`3px solid ${C.ink}`,borderRadius:14,padding:"4px 16px",marginBottom:12,boxShadow:`3px 3px 0px ${C.ink}`,fontSize:12,fontWeight:800,color:C.ink,letterSpacing:"0.08em"}}>ШАГ 1 / 2</div>
        <h1 style={{fontSize:48,fontFamily:"'Fraunces',serif",fontWeight:900,color:C.ink,margin:"0 0 4px",lineHeight:1.1}}>Собери свой квиз ✏️</h1>
        <p style={{color:C.inkMuted,fontSize:15,margin:0}}>Раунды → темы → вопросы. Или загрузи из файла!</p>
      </div>

      <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
        <Btn color={C.cream} textColor={C.ink} small onClick={()=>setShowImport(!showImport)} style={{border:`2px solid ${C.inkPale}`,boxShadow:"none"}}>{showImport?"Скрыть ×":"📁 Импорт JSON / CSV"}</Btn>
      </div>

      {showImport&&(
        <div className="pop-card" style={{padding:20,marginBottom:24,animation:"slideUp 0.2s"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
            <Tag bg={C.mintPale} color={C.mint}>JSON</Tag><Tag bg={C.yellowPale} color={C.inkSoft}>CSV</Tag>
          </div>
          <div onClick={()=>fileRef.current?.click()} style={{border:`3px dashed ${C.inkPale}`,borderRadius:16,padding:"32px 20px",textAlign:"center",cursor:"pointer",background:C.cream,transition:"border-color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue} onMouseLeave={e=>e.currentTarget.style.borderColor=C.inkPale}>
            <div style={{fontSize:36,marginBottom:6}}>📄</div>
            <div style={{fontSize:15,fontWeight:700,color:C.ink}}>Нажми чтобы загрузить</div>
            <div style={{fontSize:13,color:C.inkMuted,marginTop:4}}>.json или .csv</div>
            <input ref={fileRef} type="file" accept=".json,.csv,.tsv" onChange={handleFile} style={{display:"none"}}/>
          </div>
          {importErr&&<div style={{marginTop:10,color:C.danger,fontSize:13,fontWeight:700}}>⚠ {importErr}</div>}
          <details style={{marginTop:14}}><summary style={{fontSize:12,color:C.inkMuted,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>Пример JSON</summary><pre style={{background:C.ink,borderRadius:12,padding:14,marginTop:8,fontSize:11,color:C.mint,fontFamily:"'JetBrains Mono',monospace",overflow:"auto",lineHeight:1.6}}>{SAMPLE_JSON}</pre></details>
        </div>
      )}

      {rounds.map((round,ri)=>(
        <div key={round.id} className="pop-card" style={{padding:22,marginBottom:16}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
            <div style={{width:38,height:38,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:C.blue,border:`3px solid ${C.ink}`,boxShadow:`3px 3px 0 ${C.ink}`,fontWeight:900,fontSize:16,color:"#fff",fontFamily:"'Fraunces',serif",flexShrink:0}}>{ri+1}</div>
            <Inp value={round.name} onChange={v=>updateRound(round.id,"name",v)} placeholder="Название раунда" style={{fontWeight:700,fontSize:16,background:C.white}}/>
            {rounds.length>1&&<button onClick={()=>removeRound(round.id)} style={{background:C.cream,border:`2px solid ${C.inkPale}`,borderRadius:10,color:C.inkMuted,cursor:"pointer",fontSize:14,padding:"4px 8px",fontWeight:700}}>✕</button>}
          </div>

          {round.topics.map((topic,ti)=>{
            const isOpen=!collapsed[topic.id];
            const tc=topicColors[ti%topicColors.length];
            const filled=topic.questions.filter(q=>q.text).length;
            return(
              <div key={topic.id} style={{background:tc.bg,border:`2px solid ${tc.border}40`,borderRadius:14,marginBottom:10,overflow:"hidden"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"pointer"}} onClick={()=>toggle(topic.id)}>
                  <span style={{fontSize:11,transition:"transform 0.2s",transform:isOpen?"rotate(90deg)":"rotate(0)",color:tc.text}}>▶</span>
                  <Tag bg={tc.border+"20"} color={tc.text}>T{ti+1}</Tag>
                  <Inp value={topic.name} onChange={v=>updateTopic(round.id,topic.id,"name",v)} placeholder="Название темы" style={{flex:1,background:C.white+"aa"}}/>
                  <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                    <div style={{width:40,height:6,borderRadius:3,background:C.white,overflow:"hidden",border:`1px solid ${tc.border}30`}}><div style={{height:"100%",width:`${topic.questions.length?filled/topic.questions.length*100:0}%`,background:tc.border,borderRadius:3,transition:"width 0.3s"}}/></div>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:tc.text,fontWeight:700}}>{filled}/{topic.questions.length}</span>
                  </div>
                  <button onClick={e=>{e.stopPropagation();removeTopic(round.id,topic.id);}} style={{background:"none",border:"none",color:tc.text,cursor:"pointer",fontSize:14,opacity:0.5}}>✕</button>
                </div>
                {isOpen&&(
                  <div style={{padding:12,borderTop:`1px solid ${tc.border}25`,background:C.white+"40"}}>
                    <div style={{display:"grid",gridTemplateColumns:"26px 1fr 1fr 48px 22px",gap:"3px 6px",marginBottom:6}}>
                      {["#","ВОПРОС","ОТВЕТ","PTS",""].map((h,i)=><span key={i} style={{fontSize:9,color:C.inkLight,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,letterSpacing:"0.1em"}}>{h}</span>)}
                    </div>
                    {topic.questions.map((q,qi)=>(
                      <div key={q.id} style={{display:"grid",gridTemplateColumns:"26px 1fr 1fr 48px 22px",gap:"3px 6px",alignItems:"start",marginBottom:4}}>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.inkLight,width:22,height:22,borderRadius:7,background:tc.border+"15",display:"flex",alignItems:"center",justifyContent:"center",marginTop:5,fontWeight:700}}>{qi+1}</span>
                        <Txt value={q.text} onChange={v=>updateQ(round.id,topic.id,q.id,"text",v)} placeholder="Вопрос..." rows={1}/>
                        <Txt value={q.answer} onChange={v=>updateQ(round.id,topic.id,q.id,"answer",v)} placeholder="Ответ..." rows={1}/>
                        <Inp value={q.points} onChange={v=>updateQ(round.id,topic.id,q.id,"points",parseInt(v)||0)} type="number" style={{textAlign:"center",fontSize:13,fontWeight:700,background:C.white}}/>
                        <button onClick={()=>removeQ(round.id,topic.id,q.id)} style={{background:"none",border:"none",color:C.inkLight,cursor:"pointer",fontSize:11,paddingTop:8}}>✕</button>
                      </div>
                    ))}
                    <Btn color={tc.bg} textColor={tc.text} small onClick={()=>addQ(round.id,topic.id)} style={{boxShadow:"none",border:`2px dashed ${tc.border}50`,marginTop:6}}>+ Вопрос</Btn>
                  </div>
                )}
              </div>
            );
          })}
          <Btn color={C.cream} textColor={C.inkMuted} small onClick={()=>addTopic(round.id)} style={{boxShadow:"none",border:`2px dashed ${C.inkPale}`,marginTop:6}}>+ Тема</Btn>
        </div>
      ))}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:18,flexWrap:"wrap",gap:12}}>
        <Btn color={C.cream} textColor={C.ink} onClick={addRound} style={{boxShadow:"none",border:`2px dashed ${C.inkPale}`}}>+ Раунд</Btn>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <Tag bg={C.cream} color={C.inkMuted}>{totalQ} вопросов</Tag>
          <Btn color={C.blue} onClick={onNext} disabled={!canGo}>Далее →</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─── TEAMS ─── */
function TeamsPhase({teams,setTeams,onBack,onStart}){
  const[name,setName]=useState("");
  const add=()=>{if(!name.trim())return;setTeams([...teams,{id:uid(),name:name.trim(),score:0,color:C.teams[teams.length%C.teams.length]}]);setName("");};
  return(
    <div style={{maxWidth:480,margin:"0 auto",padding:"28px 16px"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{display:"inline-block",background:C.pink,border:`3px solid ${C.ink}`,borderRadius:14,padding:"4px 16px",marginBottom:12,boxShadow:`3px 3px 0 ${C.ink}`,fontSize:12,fontWeight:800,color:"#fff",letterSpacing:"0.08em"}}>ШАГ 2 / 2</div>
        <h1 style={{fontSize:42,fontFamily:"'Fraunces',serif",fontWeight:900,color:C.ink,margin:"0 0 4px"}}>Команды 🎯</h1>
        <p style={{color:C.inkMuted,fontSize:15}}>Минимум две для начала</p>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <Inp value={name} onChange={setName} placeholder="Название команды" onKeyDown={e=>e.key==="Enter"&&add()} style={{background:C.white}}/>
        <Btn color={C.mint} onClick={add} disabled={!name.trim()}>+</Btn>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:32}}>
        {teams.map((team,i)=>(
          <div key={team.id} className="pop-card" style={{padding:"12px 18px",display:"flex",alignItems:"center",gap:12,animation:`slideUp 0.2s ease ${i*0.04}s both`}}>
            <div style={{width:32,height:32,borderRadius:10,background:team.color,border:`3px solid ${C.ink}`,boxShadow:`2px 2px 0 ${C.ink}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff"}}>{i+1}</div>
            <span style={{flex:1,fontWeight:700,fontSize:16,color:C.ink}}>{team.name}</span>
            <button onClick={()=>setTeams(teams.filter(t=>t.id!==team.id))} style={{background:C.cream,border:`2px solid ${C.inkPale}`,borderRadius:8,color:C.inkMuted,cursor:"pointer",fontSize:13,padding:"3px 8px",fontWeight:700}}>✕</button>
          </div>
        ))}
        {teams.length===0&&<div style={{textAlign:"center",padding:36,color:C.inkLight,fontSize:14}}>Добавь команды 👆</div>}
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <Btn color={C.cream} textColor={C.ink} onClick={onBack} style={{boxShadow:"none",border:`2px solid ${C.inkPale}`}}>← Назад</Btn>
        <Btn color={C.yellow} textColor={C.ink} onClick={onStart} disabled={teams.length<2}>Начать игру ⚡</Btn>
      </div>
    </div>
  );
}

/* ─── TIMER ─── */
function TimerRing({seconds,maxSeconds}){
  const r=52,circ=2*Math.PI*r;const pct=seconds/maxSeconds;
  const color=seconds<=5?C.danger:seconds<=15?C.orange:C.blue;
  const danger=seconds<=5;
  return(
    <div style={{position:"relative",width:124,height:124,animation:danger?"shake 0.35s ease infinite":"none"}}>
      <svg width="124" height="124" viewBox="0 0 124 124">
        <circle cx="62" cy="62" r={r} fill="none" stroke={C.inkPale+"40"} strokeWidth="8" style={{transform:"rotate(-90deg)",transformOrigin:"center"}}/>
        <circle cx="62" cy="62" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} style={{transform:"rotate(-90deg)",transformOrigin:"center",transition:"stroke-dashoffset 0.4s linear,stroke 0.3s"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
        <span style={{fontFamily:"'Fraunces',serif",fontSize:44,fontWeight:900,color,animation:danger?"pulse 0.4s ease infinite":"none"}}>{seconds}</span>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:C.inkLight,fontWeight:700,letterSpacing:"0.15em",marginTop:-4}}>СЕК</span>
      </div>
    </div>
  );
}

/* ─── SCOREBOARD ─── */
function Scoreboard({teams,activeTeamId}){
  const sorted=[...teams].sort((a,b)=>b.score-a.score);
  return(
    <div style={{display:"flex",gap:4,padding:"6px 8px",background:C.white,borderRadius:14,border:`2px solid ${C.inkPale}30`,flexWrap:"wrap",justifyContent:"center"}}>
      {sorted.map((team,i)=>{const active=team.id===activeTeamId;return(
        <div key={team.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:10,background:active?team.color+"12":"transparent",border:active?`2px solid ${team.color}30`:"2px solid transparent",transition:"all 0.2s"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:team.color,boxShadow:active?`0 0 8px ${team.color}`:"none"}}/>
          <span style={{fontWeight:800,fontSize:13,color:active?team.color:C.ink}}>{team.name}</span>
          <span style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:15,color:i===0?C.orange:C.inkMuted}}>{team.score}</span>
        </div>
      );})}
    </div>
  );
}

/* ─── QUESTION MODAL ─── */
function QuestionModal({question,teams,activeTeam,onDone,onClose}){
  const MAIN=60,PASS=20;
  const[phase,setPhase]=useState("question");
  const[seconds,setSeconds]=useState(MAIN);
  const[passedTo,setPassedTo]=useState(null);
  const timer=useRef(null);
  const start=useCallback((sec,onEnd)=>{clearInterval(timer.current);let t=sec;setSeconds(t);timer.current=setInterval(()=>{t--;setSeconds(t);if(t<=0){clearInterval(timer.current);onEnd();}},1000);},[]);
  useEffect(()=>{start(MAIN,()=>{const o=teams.filter(t=>t.id!==activeTeam.id);if(o.length){setPassedTo(o[0]);setPhase("passed");}else setPhase("answer");});return()=>clearInterval(timer.current);},[start,activeTeam.id,teams]);
  useEffect(()=>{if(phase==="passed"&&passedTo)start(PASS,()=>setPhase("answer"));},[phase,passedTo,start]);
  const correct=(tid)=>{clearInterval(timer.current);onDone(tid,question.points);setPhase("done");};
  const pass=()=>{clearInterval(timer.current);const o=teams.filter(t=>t.id!==activeTeam.id);if(o.length){setPassedTo(o[0]);setPhase("passed");}else setPhase("answer");};
  const nobody=()=>{clearInterval(timer.current);onDone(null,0);setPhase("done");};
  const showAns=()=>{clearInterval(timer.current);setPhase("answer");};
  const cur=passedTo||activeTeam;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,26,46,0.75)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16,animation:"fadeIn 0.15s"}}>
      <div className="pop-card" style={{padding:"28px 32px",maxWidth:560,width:"100%",animation:"popIn 0.3s",borderWidth:4}}>
        <div style={{position:"absolute",top:-2,left:20,right:20,height:4,background:cur.color,borderRadius:"0 0 4px 4px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <Tag bg={C.yellowPale} color={C.inkSoft}>{question.points} б.</Tag>
            <Tag bg={cur.color+"18"} color={cur.color}>{passedTo?"→ ":""}{cur.name}</Tag>
            {passedTo&&<Tag bg={C.pinkPale} color={C.pink}>20 сек!</Tag>}
          </div>
          {phase==="done"&&<button onClick={onClose} style={{background:C.cream,border:`2px solid ${C.inkPale}`,borderRadius:10,color:C.ink,cursor:"pointer",fontSize:14,padding:"4px 10px",fontWeight:800}}>✕</button>}
        </div>
        <p style={{fontSize:20,fontWeight:700,color:C.ink,lineHeight:1.6,marginBottom:24,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{question.text}</p>
        {(phase==="question"||phase==="passed")&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,marginBottom:16}}>
            <TimerRing seconds={seconds} maxSeconds={passedTo?PASS:MAIN}/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
              {phase==="question"&&<><Btn color={C.mint} onClick={()=>correct(activeTeam.id)}>✓ {activeTeam.name}</Btn><Btn color={C.cream} textColor={C.ink} onClick={pass} style={{boxShadow:"none",border:`2px solid ${C.inkPale}`}}>Не знают →</Btn></>}
              {phase==="passed"&&<><Btn color={C.mint} onClick={()=>correct(passedTo.id)}>✓ {passedTo.name}</Btn><Btn color={C.cream} textColor={C.ink} onClick={nobody} style={{boxShadow:"none",border:`2px solid ${C.inkPale}`}}>Тоже нет</Btn></>}
              <Btn color={C.cream} textColor={C.inkMuted} small onClick={showAns} style={{boxShadow:"none",border:`2px solid ${C.inkPale}`}}>Ответ</Btn>
            </div>
          </div>
        )}
        {(phase==="answer"||phase==="done")&&(
          <div style={{animation:"slideUp 0.2s"}}>
            <div style={{background:C.mintPale,border:`2px solid ${C.mint}35`,borderRadius:14,padding:"14px 18px",marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:800,color:C.mint,marginBottom:4,letterSpacing:"0.08em"}}>ОТВЕТ</div>
              <div style={{fontSize:19,fontWeight:800,color:C.ink}}>{question.answer||"—"}</div>
            </div>
            {phase==="answer"&&(<div><div style={{fontSize:13,color:C.inkMuted,marginBottom:8,fontWeight:700}}>Кто ответил правильно?</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{teams.map(team=><Btn key={team.id} color={team.color} onClick={()=>correct(team.id)}>{team.name}</Btn>)}<Btn color={C.cream} textColor={C.ink} onClick={nobody} style={{boxShadow:"none",border:`2px solid ${C.inkPale}`}}>Никто</Btn></div></div>)}
            {phase==="done"&&<div style={{textAlign:"center",padding:"10px 0",fontSize:15,fontWeight:800,color:C.mint}}>✓ Записано — нажми ✕</div>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── GAME ─── */
function GamePhase({rounds,teams,setTeams,onFinish}){
  const[curRound,setCurRound]=useState(0);const[answered,setAnswered]=useState(new Set());const[activeQ,setActiveQ]=useState(null);const[turn,setTurn]=useState(0);
  const round=rounds[curRound];const activeTeam=teams[turn%teams.length];
  const handleDone=(tid,pts)=>{if(tid&&pts)setTeams(teams.map(t=>t.id===tid?{...t,score:t.score+pts}:t));setAnswered(prev=>new Set([...prev,activeQ.id]));};
  const handleClose=()=>{setActiveQ(null);setTurn(turn+1);};
  const total=round.topics.reduce((a,t)=>a+t.questions.length,0);
  const done=round.topics.reduce((a,t)=>a+t.questions.filter(q=>answered.has(q.id)).length,0);
  const allDone=done===total;const isLast=curRound===rounds.length-1;
  const hdrColors=[C.blue,C.pink,C.mint,C.orange,C.violet,C.yellow];

  return(
    <div style={{minHeight:"100vh",padding:16}}>
      <div style={{maxWidth:1000,margin:"0 auto 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:8}}>
          <div><Tag bg={C.bluePale} color={C.blue}>РАУНД {curRound+1}/{rounds.length}</Tag><h2 style={{margin:"6px 0 0",fontSize:30,fontFamily:"'Fraunces',serif",fontWeight:900,color:C.ink}}>{round.name}</h2></div>
          <Tag bg={C.cream} color={C.inkMuted}>{done}/{total}</Tag>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 18px",borderRadius:14,background:activeTeam.color+"10",border:`3px solid ${activeTeam.color}30`,marginBottom:12}}>
          <div style={{width:12,height:12,borderRadius:"50%",background:activeTeam.color,boxShadow:`0 0 10px ${activeTeam.color}60`,animation:"pulse 1.5s infinite"}}/>
          <span style={{fontWeight:800,fontSize:15,color:activeTeam.color}}>Выбирает: {activeTeam.name}</span>
        </div>
        <Scoreboard teams={teams} activeTeamId={activeTeam.id}/>
      </div>
      <div style={{maxWidth:1000,margin:"16px auto 0"}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${round.topics.length},1fr)`,gap:8,marginBottom:8}}>
          {round.topics.map((topic,ti)=>{const hc=hdrColors[ti%hdrColors.length];return(
            <div key={topic.id} className="pop-card-color" style={{padding:"14px 8px",textAlign:"center",fontWeight:800,fontSize:13,color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:"0.03em",textTransform:"uppercase",background:hc,boxShadow:`4px 4px 0 ${C.ink}`}}>{topic.name}</div>
          );})}
        </div>
        {(()=>{const maxQ=Math.max(...round.topics.map(t=>t.questions.length));return Array.from({length:maxQ},(_,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:`repeat(${round.topics.length},1fr)`,gap:8,marginBottom:8}}>
            {round.topics.map((topic,ti)=>{const q=topic.questions[i];if(!q)return<div key={topic.id+i}/>;const d=answered.has(q.id);const hc=hdrColors[ti%hdrColors.length];return(
              <button key={q.id} className="q-cell" disabled={d} onClick={()=>setActiveQ(q)} style={{'--cell-ink':C.ink,background:d?C.creamDark:C.white,border:`3px solid ${d?C.inkPale+"40":C.ink}`,borderRadius:16,padding:"22px 8px",cursor:d?"default":"pointer",opacity:d?0.25:1,boxShadow:d?"none":`4px 4px 0 ${C.ink}`}}>
                <div style={{fontSize:26,fontWeight:900,fontFamily:"'Fraunces',serif",color:d?C.inkPale:hc}}>{q.points}</div>
              </button>
            );})}
          </div>
        ));})()}
      </div>
      {allDone&&(<div style={{textAlign:"center",marginTop:28,animation:"slideUp 0.3s"}}>{isLast?<Btn color={C.yellow} textColor={C.ink} onClick={onFinish}>Финиш 🏆</Btn>:<Btn onClick={()=>{setCurRound(curRound+1);setTurn(0);}}>Следующий раунд →</Btn>}</div>)}
      {activeQ&&<QuestionModal question={activeQ} teams={teams} activeTeam={activeTeam} onDone={handleDone} onClose={handleClose}/>}
    </div>
  );
}

/* ─── RESULTS ─── */
function ResultsPhase({teams,onRestart}){
  const sorted=[...teams].sort((a,b)=>b.score-a.score);const medals=["🥇","🥈","🥉"];const podColors=[C.yellow,C.inkLight,C.orange];
  return(
    <div style={{maxWidth:500,margin:"0 auto",padding:"60px 16px",textAlign:"center"}}>
      <div style={{display:"inline-block",animation:"float 2.5s ease infinite",marginBottom:16}}>
        <div style={{width:100,height:100,borderRadius:"50%",background:C.yellowPale,border:`4px solid ${C.ink}`,boxShadow:`6px 6px 0 ${C.ink}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:52}}>🏆</span></div>
      </div>
      <h1 style={{fontSize:42,fontFamily:"'Fraunces',serif",fontWeight:900,color:C.ink,margin:"8px 0 4px"}}>{sorted[0]?.name}</h1>
      <p style={{color:C.inkMuted,fontSize:15,marginBottom:32}}>Победа! 🎉</p>
      {sorted.map((team,i)=>(
        <div key={team.id} className="pop-card" style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:12,marginBottom:10,animation:`slideUp 0.3s ease ${i*0.06}s both`,borderColor:i===0?C.yellow:C.ink,boxShadow:i===0?`6px 6px 0 ${C.yellow}`:`4px 4px 0 ${C.ink}`,background:i===0?C.yellowPale:C.white}}>
          <span style={{fontSize:28,width:36,textAlign:"center"}}>{medals[i]||`${i+1}`}</span>
          <div style={{width:12,height:12,borderRadius:"50%",background:team.color,border:`2px solid ${C.ink}`}}/>
          <span style={{flex:1,textAlign:"left",fontWeight:800,fontSize:17,color:C.ink}}>{team.name}</span>
          <span style={{fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:900,color:podColors[i]||C.inkMuted}}>{team.score}</span>
        </div>
      ))}
      <Btn color={C.blue} onClick={onRestart} style={{marginTop:28}}>Новая игра 🔄</Btn>
    </div>
  );
}

/* ─── APP ─── */
export default function QuizApp(){
  const[phase,setPhase]=useState("setup");
  const[rounds,setRounds]=useState([{id:uid(),name:"Раунд 1",topics:[{id:uid(),name:"",questions:Array.from({length:10},(_,i)=>({id:uid(),text:"",answer:"",points:(i+1)*10}))}]}]);
  const[teams,setTeams]=useState([]);
  return(
    <div className="quiz-root" style={{minHeight:"100vh",background:C.cream,color:C.ink,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{CSS}</style>
      <div className="blob blob-1"/><div className="blob blob-2"/><div className="blob blob-3"/><div className="blob blob-4"/>
      <div className="quiz-content">
        {phase==="setup"&&<SetupPhase rounds={rounds} setRounds={setRounds} onNext={()=>setPhase("teams")}/>}
        {phase==="teams"&&<TeamsPhase teams={teams} setTeams={setTeams} onBack={()=>setPhase("setup")} onStart={()=>setPhase("game")}/>}
        {phase==="game"&&<GamePhase rounds={rounds} teams={teams} setTeams={setTeams} onFinish={()=>setPhase("results")}/>}
        {phase==="results"&&<ResultsPhase teams={teams} onRestart={()=>{setPhase("setup");setTeams(teams.map(t=>({...t,score:0})));}}/>}
      </div>
    </div>
  );
}
