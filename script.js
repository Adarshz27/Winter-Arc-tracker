const KEY="winterArcV2";
const habits=[
  ["workout","Workout","Complete today's training","◆"],
  ["steps","5K or 10K steps","Hit your step target","↗"],
  ["diet","Clean diet","Stay aligned with your nutrition plan","◈"],
  ["water","4L water","Reach your personal hydration target","◉"],
  ["sleep","7–8h sleep","Log last night's sleep tomorrow morning","☾"],
  ["learn","Read / Learn","Learn something useful today","✦"],
  ["alcohol","No alcohol until end","Protect the streak","○"],
  ["distractions","No distractions","Keep your attention on the mission","◎"]
];
const quotes=[
  "You do not need motivation. You need a standard.",
  "Small promises kept daily become a different life.",
  "Discipline today. Freedom tomorrow.",
  "Make today's version of you proud of tomorrow's.",
  "The goal is not perfection. The goal is returning to the plan."
];
const workouts=[
 {name:"FULL BODY A",focus:"Strength • 35 min",items:[["Goblet squat","3 × 12"],["Dumbbell floor press","3 × 10"],["One-arm dumbbell row","3 × 10 / side"],["Romanian deadlift","3 × 12"],["Plank","3 × 40 sec"]]},
 {name:"FULL BODY B",focus:"Strength • 35 min",items:[["Reverse lunge","3 × 10 / side"],["Dumbbell shoulder press","3 × 10"],["Bent-over row","3 × 12"],["Glute bridge","3 × 15"],["Dead bug","3 × 10 / side"]]},
 {name:"CONDITIONING",focus:"Cardio • 25 min",items:[["March / jog in place","5 min"],["Bodyweight squat","4 × 15"],["Mountain climber","4 × 20"],["Push-up","4 × 8–12"],["Fast walk","10 min"]]},
 {name:"RECOVERY",focus:"Mobility • 20 min",items:[["Cat-cow","2 × 10"],["World's greatest stretch","2 × 5 / side"],["Hip flexor stretch","2 × 30 sec"],["Hamstring stretch","2 × 30 sec"],["Easy walk","10 min"]]}
];

let state=load();
function todayKey(){return new Date().toISOString().slice(0,10)}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x)return x}catch(e){}return {profile:{name:"",age:25,sex:"male",height:170,weight:70,activity:1.55,start:todayKey(),steps:10000,sleep:7,water:4},days:{},settings:{notify:false}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function iso(d){return d.toISOString().slice(0,10)}
function dateObj(k){return new Date(k+"T00:00:00")}
function dayIndex(k=todayKey()){return Math.floor((dateObj(k)-dateObj(state.profile.start))/86400000)+1}
function dayRec(k=todayKey()){if(!state.days[k])state.days[k]={habits:{},steps:0,water:0,workout:{},nutrition:{},learn:{},sleep:null};return state.days[k]}
function currentDay(){return Math.min(122,Math.max(1,dayIndex()))}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function fmt(n){return Number(n||0).toLocaleString("en-IN")}
function toast(t){const el=document.getElementById("toast");el.textContent=t;el.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove("show"),2200)}
function showScreen(name){
 document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id==="screen-"+name));
 document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.screen===name));
 window.scrollTo({top:0,behavior:"smooth"});
 if(name==="home")renderHome(); if(name==="workout")renderWorkout(); if(name==="nutrition")renderNutrition(); if(name==="water")renderWater(); if(name==="learn")renderLearn(); if(name==="progress")renderProgress(); if(name==="history")renderHistory(); if(name==="settings")renderSettings();
}
function statusFor(id,k=todayKey()){
 const r=dayRec(k), v=r.habits[id];
 if(v==="done")return"done"; if(v==="missed")return"missed";
 if(id==="steps" && r.steps>=state.profile.steps)return"done";
 if(id==="water" && r.water>=state.profile.water)return"done";
 if(id==="workout" && r.workout.complete)return"done";
 if(id==="learn" && r.learn.text)return"done";
 if(id==="sleep" && r.sleep!=null && r.sleep>=7 && r.sleep<=8)return"done";
 return"pending"
}
function setHabit(id,status="done",k=todayKey()){dayRec(k).habits[id]=status;save();renderAll();toast(status==="done"?`${id} marked done`:`${id} marked missed`)}
function cycleHabit(id){
 const s=statusFor(id); if(s==="done")setHabit(id,"missed"); else setHabit(id,"done");
}
function renderHome(){
 const d=currentDay(), k=todayKey(), r=dayRec(k);
 document.getElementById("dayNo").textContent=d;
 document.getElementById("dateLabel").textContent=new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
 const statuses=habits.map(h=>statusFor(h[0]));
 const done=statuses.filter(x=>x==="done").length;
 const pct=Math.round(done/8*100);
 document.getElementById("overallPct").textContent=pct+"%";document.getElementById("overallBar").style.width=pct+"%";
 document.getElementById("habitCount").textContent=`${done}/8`;
 document.getElementById("streak").textContent=calcStreak()+" days";
 document.getElementById("daysCompleted").textContent=`${completedDays()}/122`;
 document.getElementById("quote").textContent=quotes[(d-1)%quotes.length];
 const list=document.getElementById("habitList");list.innerHTML="";
 habits.forEach(h=>{
   const s=statusFor(h[0]); const label=s==="done"?"DONE":s==="missed"?"MISSED":"PENDING";
   const el=document.createElement("div");el.className="habit "+(s==="done"?"done":"");
   el.innerHTML=`<div class="hicon">${h[3]}</div><div class="habit-main"><b>${h[1]}</b><small>${h[2]}</small></div><button data-habit="${h[0]}">${label}</button>`;
   el.querySelector("button").onclick=()=>habitAction(h[0]);list.appendChild(el);
 });
}
function habitAction(id){
 if(id==="workout"){showScreen("workout");return}
 if(id==="steps"){showScreen("workout");document.getElementById("stepsInput").focus();return}
 if(id==="water"){showScreen("water");return}
 if(id==="learn"){showScreen("learn");return}
 if(id==="sleep"){enterSleep();return}
 if(id==="diet"){showScreen("nutrition");return}
 cycleHabit(id)
}
function enterSleep(){
 const prev=new Date();prev.setDate(prev.getDate()-1);const k=iso(prev),r=dayRec(k);
 openModal(`<span class="eyebrow">MORNING CHECK-IN</span><h2>Last night's sleep</h2><p>Sleep belongs to the previous challenge day. Log it this morning.</p><label>Hours slept<input id="sleepModalIn" type="number" min="0" max="16" step=".25" value="${r.sleep??""}" placeholder="e.g. 7.5"></label><button class="primary full" id="saveSleep">Save sleep</button>`);
 document.getElementById("saveSleep").onclick=()=>{const v=Number(document.getElementById("sleepModalIn").value);if(!Number.isFinite(v)||v<=0)return toast("Enter your sleep hours");r.sleep=v;r.habits.sleep=(v>=7&&v<=8)?"done":"missed";save();closeModal();renderAll();toast("Sleep saved to yesterday")};
}
function renderWorkout(){
 const d=currentDay(),w=workouts[(d-1)%workouts.length],r=dayRec();
 document.getElementById("workoutBox").innerHTML=`<div class="workout-card"><span class="eyebrow" style="color:#9eb4ff">TODAY'S PLAN</span><h3>${w.name}</h3><p>${w.focus} · Rest 45–75 sec between sets.</p>${w.items.map((x,i)=>`<div class="exercise"><div><b>${x[0]}</b><br><small>${x[1]}</small></div><button class="check ${r.workout[i]?"on":""}" data-ex="${i}">${r.workout[i]?"✓":"+"}</button></div>`).join("")}<button id="completeWorkout" class="primary full" style="margin-top:16px">${r.workout.complete?"Workout completed ✓":"Complete workout"}</button></div>`;
 document.querySelectorAll("[data-ex]").forEach(b=>b.onclick=()=>{r.workout[b.dataset.ex]=!r.workout[b.dataset.ex];save();renderWorkout()});
 document.getElementById("completeWorkout").onclick=()=>{r.workout.complete=!r.workout.complete;r.habits.workout=r.workout.complete?"done":"missed";save();renderAll();toast(r.workout.complete?"Workout complete. Strong work.":"Workout reopened")};
 const steps=r.steps||0,target=state.profile.steps,p=clamp(Math.round(steps/target*100),0,100);
 document.getElementById("stepTargetLabel").textContent=fmt(target)+" steps";document.getElementById("stepProgressText").textContent=`${fmt(steps)} / ${fmt(target)}`;document.getElementById("stepPct").textContent=p+"%";document.getElementById("stepRing").style.setProperty("--p",p+"%");document.getElementById("stepsInput").value=steps||"";
}
function renderNutrition(){
 const p=state.profile, bmr=p.sex==="male"?10*p.weight+6.25*p.height-5*p.age+5:10*p.weight+6.25*p.height-5*p.age-161;
 const cal=Math.round(bmr*p.activity), protein=Math.round(p.weight*1.6), carbs=Math.round((cal*.45)/4), fat=Math.round((cal*.30)/9);
 document.getElementById("calTarget").textContent=fmt(cal);document.getElementById("proteinTarget").textContent=protein;document.getElementById("carbTarget").textContent=carbs;document.getElementById("fatTarget").textContent=fat;
 const r=dayRec();document.getElementById("calIn").value=r.nutrition.cal||"";document.getElementById("proteinIn").value=r.nutrition.protein||"";
}
function renderWater(){
 const r=dayRec(),target=state.profile.water,l=Math.max(0,r.water||0),p=clamp(Math.round(l/target*100),0,100);
 document.getElementById("waterTarget").textContent=target.toFixed(1)+" L";document.getElementById("waterText").textContent=l.toFixed(2)+" L logged";document.getElementById("waterPct").textContent=p+"%";document.getElementById("waterRing").style.setProperty("--p",p+"%");document.getElementById("waterTargetInput").value=target;
}
function renderLearn(){const r=dayRec();document.getElementById("learnText").value=r.learn.text||"";document.getElementById("learnKey").value=r.learn.key||"";document.getElementById("learnSaved").textContent=r.learn.saved?"Saved for today ✓":""}
function completionForDay(k){
 const done=habits.filter(h=>statusFor(h[0],k)==="done").length;return {done,pct:Math.round(done/8*100)}
}
function completedDays(){let n=0;for(let i=1;i<=122;i++){const k=iso(new Date(dateObj(state.profile.start).getTime()+(i-1)*86400000));if(completionForDay(k).done>=8)n++}return n}
function calcStreak(){let s=0,d=new Date();for(let i=0;i<122;i++){const k=iso(d),c=completionForDay(k);if(c.done>=8){s++;d.setDate(d.getDate()-1)}else break}return s}
function renderProgress(){
 const c=completionForDay(todayKey());document.getElementById("progressBig").textContent=c.pct+"%";document.getElementById("progressSub").textContent=`${c.done} of 8 habits completed today.`;
 const hs=document.getElementById("habitStats");hs.innerHTML="";
 habits.forEach(h=>{let n=0;for(let i=1;i<=122;i++){const k=iso(new Date(dateObj(state.profile.start).getTime()+(i-1)*86400000));if(statusFor(h[0],k)==="done")n++}const p=Math.round(n/122*100);hs.innerHTML+=`<div class="habit-stat"><div class="habit-stat-top"><b>${h[1]}</b><span>${n}/122</span></div><div class="bar"><i style="width:${p}%"></i></div></div>`});
 const cal=document.getElementById("calendar");cal.innerHTML="";
 for(let i=1;i<=122;i++){const k=iso(new Date(dateObj(state.profile.start).getTime()+(i-1)*86400000)),c=completionForDay(k);let cls=c.done===8?"good":c.done>0?"partial":(state.days[k]?"bad":"");const e=document.createElement("button");e.className="day-cell "+cls;e.textContent=i;e.title=`Day ${i}: ${c.done}/8`;e.onclick=()=>showDay(k,i);cal.appendChild(e)}
}
function showDay(k,i){const c=completionForDay(k),r=dayRec(k);openModal(`<span class="eyebrow">DAY ${i}</span><h2>${new Date(k+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</h2><p>${c.done}/8 habits completed.</p><div>${habits.map(h=>`<div class="history-item"><div><b>${h[1]}</b><small>${statusFor(h[0],k).toUpperCase()}</small></div><span class="status-dot ${statusFor(h[0],k)==="done"?"good":statusFor(h[0],k)==="missed"?"bad":""}"></span></div>`).join("")}</div>`)}
function renderHistory(){
 const list=document.getElementById("historyList");list.innerHTML="";
 for(let i=Math.min(122,Math.max(1,dayIndex()));i>=1;i--){const k=iso(new Date(dateObj(state.profile.start).getTime()+(i-1)*86400000));const c=completionForDay(k);const e=document.createElement("button");e.className="history-item";e.innerHTML=`<div><b>Day ${i}</b><small>${new Date(k+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short"})} · ${c.done}/8</small></div><span class="status-dot ${c.done===8?"good":c.done?"partial":"bad"}"></span>`;e.onclick=()=>showDay(k,i);list.appendChild(e)}
}
function renderSettings(){
 const p=state.profile;document.getElementById("nameIn").value=p.name||"";document.getElementById("ageIn").value=p.age;document.getElementById("sexIn").value=p.sex;document.getElementById("heightIn").value=p.height;document.getElementById("weightIn").value=p.weight;document.getElementById("activityIn").value=p.activity;document.getElementById("startIn").value=p.start;document.getElementById("stepIn").value=p.steps;document.getElementById("sleepIn").value=p.sleep;document.getElementById("waterIn").value=p.water;
}
function renderAll(){renderHome();const active=document.querySelector(".screen.active")?.id?.replace("screen-","");if(active==="workout")renderWorkout();if(active==="nutrition")renderNutrition();if(active==="water")renderWater();if(active==="learn")renderLearn();if(active==="progress")renderProgress();if(active==="history")renderHistory();if(active==="settings")renderSettings()}
function openModal(html){document.getElementById("modalContent").innerHTML=html;document.getElementById("modal").classList.add("show")}
function closeModal(){document.getElementById("modal").classList.remove("show")}
function beep(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C();[0,.18,.36].forEach((t,i)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=660+i*110;g.gain.setValueAtTime(.001,c.currentTime+t);g.gain.exponentialRampToValueAtTime(.18,c.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t+.14);o.connect(g);g.connect(c.destination);o.start(c.currentTime+t);o.stop(c.currentTime+t+.16)})}catch(e){}}
function notify(title,body){beep();if("Notification"in window&&Notification.permission==="granted")new Notification(title,{body,icon:"assets/icon.svg"})}
async function enableNotifications(){if(!("Notification"in window))return toast("Notifications are not supported here");const p=await Notification.requestPermission();if(p==="granted"){state.settings.notify=true;save();toast("Notifications enabled");notify("Winter ARC","Notifications are ready.");}else toast("Notification permission was not granted")}
function scheduleCheck(){if(!state.settings.notify)return;const now=new Date(),m=now.getHours()*60+now.getMinutes();if(m===360)markNotify("morning");if(m===1320)markNotify("night")}
function markNotify(type){const k=todayKey(),key=type+k;if(localStorage.getItem("arcNotify")===key)return;localStorage.setItem("arcNotify",key);if(type==="morning")notify("Winter ARC — 6:00 AM",`Day ${currentDay()} begins. Show up for yourself.`);else notify("Winter ARC — 10:00 PM",`Day ${currentDay()} is ending. Mark today's challenge.`)}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-screen]");if(b)showScreen(b.dataset.screen);
});
document.getElementById("settingsBtn").onclick=()=>showScreen("settings");
document.getElementById("alarmBtn").onclick=()=>{beep();toast("Alarm sound test");}
document.getElementById("modalClose").onclick=closeModal;
document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
document.getElementById("focusBtn").onclick=()=>document.querySelector(".habit button")?.scrollIntoView({behavior:"smooth",block:"center"});
document.getElementById("saveSteps").onclick=()=>{const v=Math.max(0,Number(document.getElementById("stepsInput").value)||0);const r=dayRec();r.steps=v;r.habits.steps=v>=state.profile.steps?"done":"pending";save();renderAll();toast(v>=state.profile.steps?"Step target reached!":"Steps saved")};
document.querySelectorAll("[data-water]").forEach(b=>b.onclick=()=>{const r=dayRec();r.water=Math.max(0,(r.water||0)+Number(b.dataset.water));r.habits.water=r.water>=state.profile.water?"done":"pending";save();renderAll();toast("Water updated")});
document.getElementById("saveWaterTarget").onclick=()=>{const v=Number(document.getElementById("waterTargetInput").value);if(v>0){state.profile.water=v;save();renderAll();toast("Water target updated")}};
document.getElementById("saveNutrition").onclick=()=>{const r=dayRec();r.nutrition.cal=Number(document.getElementById("calIn").value)||0;r.nutrition.protein=Number(document.getElementById("proteinIn").value)||0;save();toast("Nutrition saved")};
document.getElementById("saveLearn").onclick=()=>{const r=dayRec();r.learn={text:document.getElementById("learnText").value.trim(),key:document.getElementById("learnKey").value.trim(),saved:true};r.habits.learn=r.learn.text?"done":"pending";save();renderAll();toast("Learning saved")};
document.getElementById("saveSettings").onclick=()=>{const p=state.profile;p.name=document.getElementById("nameIn").value.trim();p.age=Number(document.getElementById("ageIn").value)||25;p.sex=document.getElementById("sexIn").value;p.height=Number(document.getElementById("heightIn").value)||170;p.weight=Number(document.getElementById("weightIn").value)||70;p.activity=Number(document.getElementById("activityIn").value)||1.55;p.start=document.getElementById("startIn").value||todayKey();p.steps=Number(document.getElementById("stepIn").value)||10000;p.sleep=Number(document.getElementById("sleepIn").value)||7;p.water=Number(document.getElementById("waterIn").value)||4;save();renderAll();toast("Profile saved")};
document.getElementById("notifyBtn").onclick=enableNotifications;
document.getElementById("resetBtn").onclick=()=>{if(confirm("Reset all Winter ARC challenge data?")){localStorage.removeItem(KEY);state=load();renderAll();toast("Challenge reset")}};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
renderAll();setInterval(scheduleCheck,30000);
