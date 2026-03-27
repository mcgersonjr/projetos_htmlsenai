/* =========================
   Reserva — fluxo completo
   ========================= */

const steps = [...document.querySelectorAll(".step")];
const bar = document.getElementById("bar");
const badgeStep = document.getElementById("badgeStep");
const hint = document.getElementById("hint");
const slotsWrap = document.getElementById("slots");

const chips = {
  1: document.getElementById("c1"),
  2: document.getElementById("c2"),
  3: document.getElementById("c3"),
  4: document.getElementById("c4"),
};

let state = {
  step: 1,
  date: "",
  time: "",
  people: 2,
  area: "Salão",
  ocasiao: "Jantar",
  notes: "",
  name: "",
  phone: "",
  reservationCode: "",
};

function setStep(n){
  state.step = n;

  steps.forEach(s => s.classList.remove("active"));
  document.querySelector(`.step[data-step="${n}"]`).classList.add("active");

  // progresso só vai até 4 (conclusão é 5)
  const base = Math.min(n, 4);
  const pct = (base / 4) * 100;
  bar.style.width = `${pct}%`;

  // chips
  Object.values(chips).forEach(c => c.classList.remove("on"));
  for(let i=1;i<=base;i++) chips[i].classList.add("on");

  // badge + hint
  const hints = {
    1: "Dica: selecione uma data e um horário.",
    2: "Dica: toque nos atalhos para ajustar rápido.",
    3: "Dica: preferências ajudam a experiência ficar perfeita.",
    4: "Dica: confira o resumo e confirme.",
    5: "Tudo certo! Se quiser, copie os detalhes.",
  };

  if (n <= 4) badgeStep.textContent = `Passo ${n}/4`;
  else badgeStep.textContent = `Concluída`;

  hint.textContent = hints[n] || "";
}

/* ---------- utilidades ---------- */
function todayISO(){
  return new Date().toISOString().split("T")[0];
}

function formatDateBR(iso){
  if(!iso) return "—";
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function pad2(n){ return String(n).padStart(2, "0"); }

function seededRandom(seedStr){
  // PRNG simples baseado em string (determinístico)
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++){
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSlotsForDate(dateISO){
  const times = [];
  // 18:00 até 22:00 de 30 em 30
  for (let h = 18; h <= 22; h++){
    for (let m of [0, 30]){
      if (h === 22 && m === 30) continue;
      times.push(`${pad2(h)}:${pad2(m)}`);
    }
  }

  const rng = seededRandom(dateISO + "|belltavola");
  // marca ~2 horários como indisponíveis (determinístico por data)
  const blocked = new Set();
  while (blocked.size < 2){
    blocked.add(Math.floor(rng() * times.length));
  }

  slotsWrap.innerHTML = "";
  state.time = "";

  times.forEach((t, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot";
    btn.textContent = t;
    btn.setAttribute("role", "option");

    if (blocked.has(idx)){
      btn.disabled = true;
      btn.title = "Indisponível";
    }

    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      document.querySelectorAll(".slot").forEach(x => x.classList.remove("selected"));
      btn.classList.add("selected");
      state.time = t;
    });

    slotsWrap.appendChild(btn);
  });
}

function renderSummary(){
  const div = document.getElementById("summary");
  div.innerHTML = `
    <strong>Resumo</strong><br/>
    📅 <b>${formatDateBR(state.date)}</b> às <b>${state.time || "—"}</b><br/>
    👥 <b>${state.people}</b> pessoa(s)<br/>
    🪑 Área: <b>${state.area}</b><br/>
    🎉 Ocasião: <b>${state.ocasiao}</b><br/>
    📝 ${state.notes ? `Obs: <b>${escapeHTML(state.notes)}</b>` : "Obs: —"}
  `;
}

function escapeHTML(str){
  return str.replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function makeReservationCode(){
  // código simples (não é “protocolo oficial”, é só ID local do app)
  const rnd = Math.floor(1000 + Math.random() * 9000);
  const d = state.date.replaceAll("-", "");
  return `BT-${d}-${rnd}`;
}

function renderTicket(){
  const ticket = document.getElementById("ticket");
  ticket.innerHTML = `
    <div><strong>Código:</strong> <b>${state.reservationCode}</b></div>
    <div><strong>Data:</strong> ${formatDateBR(state.date)} • <strong>Horário:</strong> ${state.time}</div>
    <div><strong>Pessoas:</strong> ${state.people} • <strong>Área:</strong> ${state.area}</div>
    <div><strong>Ocasião:</strong> ${state.ocasiao}</div>
    <div><strong>Nome:</strong> ${escapeHTML(state.name)} • <strong>WhatsApp:</strong> ${escapeHTML(state.phone)}</div>
    <div><strong>Obs:</strong> ${state.notes ? escapeHTML(state.notes) : "—"}</div>
  `;
}

function toast(el, msg){
  el.style.display = "block";
  el.textContent = msg;
  setTimeout(() => { el.style.display = "none"; }, 2800);
}

function resetAll(){
  state = {
    step: 1,
    date: "",
    time: "",
    people: 2,
    area: "Salão",
    ocasiao: "Jantar",
    notes: "",
    name: "",
    phone: "",
    reservationCode: "",
  };

  // reset UI
  dateInput.value = "";
  slotsWrap.innerHTML = "";
  setPeople(2);

  // reset segments
  setSegment("area", "Salão");
  setSegment("ocasiao", "Jantar");

  notesEl.value = "";
  nameEl.value = "";
  phoneEl.value = "";

  setStep(1);
}

/* ---------- Step 1 ---------- */
const dateInput = document.getElementById("date");
dateInput.min = todayISO();

dateInput.addEventListener("change", (e) => {
  state.date = e.target.value;
  if (state.date) buildSlotsForDate(state.date);
});

document.getElementById("next1").addEventListener("click", () => {
  if(!state.date) return alert("Escolha uma data.");
  if(!state.time) return alert("Escolha um horário disponível.");
  setStep(2);
});

/* ---------- Step 2 ---------- */
const peopleEl = document.getElementById("people");
const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));

function setPeople(n){
  state.people = clamp(n, 1, 20);
  peopleEl.textContent = state.people;
}

document.getElementById("minus").addEventListener("click", ()=> setPeople(state.people - 1));
document.getElementById("plus").addEventListener("click", ()=> setPeople(state.people + 1));

document.querySelectorAll(".pill").forEach(b=>{
  b.addEventListener("click", ()=> setPeople(parseInt(b.dataset.p, 10)));
});

document.getElementById("back2").addEventListener("click", ()=> setStep(1));
document.getElementById("next2").addEventListener("click", ()=> setStep(3));

/* ---------- Step 3 ---------- */
const notesEl = document.getElementById("notes");

function bindSegment(selector, key, defaultValue){
  const buttons = [...document.querySelectorAll(selector)];
  const set = (val) => {
    state[key] = val;
    buttons.forEach(x => x.classList.toggle("on", x.dataset[key] === val));
  };
  set(defaultValue);

  buttons.forEach(btn=>{
    btn.addEventListener("click", ()=> set(btn.dataset[key]));
  });

  return set;
}

const setArea = bindSegment(".seg[data-area]", "area", "Salão");
const setOcasiao = bindSegment(".seg[data-ocasiao]", "ocasiao", "Jantar");

function setSegment(key, val){
  if (key === "area") setArea(val);
  if (key === "ocasiao") setOcasiao(val);
}

notesEl.addEventListener("input", (e) => {
  state.notes = e.target.value.trim();
});

document.getElementById("back3").addEventListener("click", ()=> setStep(2));
document.getElementById("next3").addEventListener("click", ()=>{
  renderSummary();
  setStep(4);
});

/* ---------- Step 4 ---------- */
const nameEl = document.getElementById("name");
const phoneEl = document.getElementById("phone");
const toast1 = document.getElementById("toast");

document.getElementById("back4").addEventListener("click", ()=> setStep(3));

phoneEl.addEventListener("input", () => {
  // máscara leve (bem simples)
  let v = phoneEl.value.replace(/\D/g, "").slice(0, 11);
  if (v.length >= 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
  if (v.length >= 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
  phoneEl.value = v;
});

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();

  if(!name || name.length < 2) return alert("Informe seu nome.");
  if(!phone || phone.replace(/\D/g, "").length < 10) return alert("Informe um WhatsApp válido.");

  state.name = name;
  state.phone = phone;

  state.reservationCode = makeReservationCode();

  toast(toast1, "Confirmando sua reserva…");

  // Simula conclusão (aqui você integraria com backend via fetch)
  setTimeout(() => {
    renderTicket();
    setStep(5);
  }, 600);
});

/* ---------- Step 5 ---------- */
const btnCopy = document.getElementById("btnCopy");
const btnCal  = document.getElementById("btnCal");
const btnNew  = document.getElementById("btnNew");
const toast2  = document.getElementById("toast2");

btnCopy.addEventListener("click", async () => {
  const text = [
    `Reserva Bella Tavola`,
    `Código: ${state.reservationCode}`,
    `Data: ${formatDateBR(state.date)} ${state.time}`,
    `Pessoas: ${state.people}`,
    `Área: ${state.area}`,
    `Ocasião: ${state.ocasiao}`,
    `Nome: ${state.name}`,
    `WhatsApp: ${state.phone}`,
    `Obs: ${state.notes || "—"}`
  ].join("\n");

  try{
    await navigator.clipboard.writeText(text);
    toast(toast2, "Copiado ✅");
  }catch{
    toast(toast2, "Não consegui copiar automaticamente.");
  }
});

btnNew.addEventListener("click", () => {
  resetAll();
});

btnCal.addEventListener("click", () => {
  const ics = makeICS();
  downloadTextFile(ics, `reserva-${state.reservationCode}.ics`, "text/calendar");
  toast(toast2, "Arquivo de calendário gerado 📅");
});

function makeICS(){
  // Evento de 90 minutos (horário “flutuante”)
  const [y,m,d] = state.date.split("-");
  const [hh,mm] = state.time.split(":");
  const start = `${y}${m}${d}T${hh}${mm}00`;
  // soma 90 min
  const dt = new Date(Number(y), Number(m)-1, Number(d), Number(hh), Number(mm), 0);
  dt.setMinutes(dt.getMinutes() + 90);
  const end = `${dt.getFullYear()}${pad2(dt.getMonth()+1)}${pad2(dt.getDate())}T${pad2(dt.getHours())}${pad2(dt.getMinutes())}00`;

  const title = `Reserva — Bella Tavola (${state.people} pessoas)`;
  const desc = `Código: ${state.reservationCode}\\nÁrea: ${state.area}\\nOcasião: ${state.ocasiao}\\nNome: ${state.name}\\nWhatsApp: ${state.phone}\\nObs: ${state.notes || "—"}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bella Tavola//Reservas//PT-BR",
    "BEGIN:VEVENT",
    `UID:${state.reservationCode}@bellatavola`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").split(".")[0]}Z`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

function downloadTextFile(content, filename, mime){
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------- Help Sheet ---------- */
const sheet = document.getElementById("sheet");
document.getElementById("btnHelp").addEventListener("click", ()=>{
  sheet.classList.add("show");
  sheet.setAttribute("aria-hidden", "false");
});
document.getElementById("closeSheet").addEventListener("click", ()=>{
  sheet.classList.remove("show");
  sheet.setAttribute("aria-hidden", "true");
});
sheet.addEventListener("click", (e)=>{
  if(e.target === sheet){
    sheet.classList.remove("show");
    sheet.setAttribute("aria-hidden", "true");
  }
});

/* ---------- init ---------- */
setPeople(2);
setSegment("area", "Salão");
setSegment("ocasiao", "Jantar");
setStep(1);