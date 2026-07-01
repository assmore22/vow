import { makeReader, write, connectWallet, activeAccount, balanceOf, short, toGen, GEN, fmtErr }
  from "./shared/genlayer-lite.js";

const CONTRACT = "0xe48B45Ee02D755B96a63Bc790E5746ab9b24B9a3";
const { read } = makeReader(CONTRACT);
const ST = { label: ["Active", "Kept", "Broken"], key: ["active", "kept", "broken"] };
const $ = (id) => document.getElementById(id);
const app = () => $("app");
const esc = (s) => (s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (_) { return u; } };

let account = null, vows = [], stats = null, filter = "all";

function toast(msg, kind = "", title = "vow") {
  const el = document.createElement("div"); el.className = "toast " + kind;
  el.innerHTML = `<span class="tt">${title}</span>`; el.appendChild(document.createTextNode(msg));
  $("log").appendChild(el); setTimeout(() => el.remove(), kind === "err" ? 15000 : 5000);
}

async function refreshWallet() {
  account = await activeAccount();
  const slot = $("walletslot");
  if (account) { let b = 0n; try { b = await balanceOf(account); } catch (_) {} slot.innerHTML = `<span class="mono" style="font-size:12.5px;color:var(--grey)">${short(account)} · ${toGen(b)} GEN</span>`; }
  else { slot.innerHTML = `<button class="btn ghost sm" id="connectBtn">Connect</button>`; $("connectBtn").onclick = doConnect; }
}
async function doConnect() { try { account = await connectWallet(); toast("Connected on Bradbury.", "ok"); await refreshWallet(); route(); } catch (e) { toast(fmtErr(e), "err"); } }
async function ensureWallet() { if (!account) account = await connectWallet(); await refreshWallet(); }

async function load() {
  stats = await read("get_stats");
  const n = Number(await read("get_vow_count"));
  const out = [];
  for (let i = 0; i < n; i++) out.push({ id: i, ...(await read("get_vow", [i])) });
  vows = out;
}

/* ---------------- ROUTER ---------------- */
function setNav(r) { document.querySelectorAll(".nl").forEach((a) => a.classList.toggle("on", a.dataset.route === r)); }
function route() {
  const h = location.hash || "#/";
  window.scrollTo(0, 0);
  if (h.startsWith("#/how")) { setNav("how"); return renderHow(); }
  if (h.startsWith("#/vows")) { setNav("vows"); return renderExplore(); }
  if (h.startsWith("#/vow/")) { setNav("vows"); return renderDetail(Number(h.split("/")[2])); }
  if (h.startsWith("#/make")) { setNav(""); return renderMake(); }
  setNav("home"); return renderHome();
}

/* ---------------- HOME ---------------- */
function renderHome() {
  const s = stats || { total: 0, kept: 0, broken: 0, active: 0, staked_active: "0" };
  app().innerHTML = `
  <section class="hero">
    <div class="hero-vis"><i class="ph-fill ph-seal-check"></i></div>
    <div class="hero-inner">
      <span class="eyebrow"><i class="ph-fill ph-lightning"></i> Accountability, settled by evidence</span>
      <h1>Put your <span class="g">word</span> on-chain.</h1>
      <p>Vow turns a promise into a contract. Stake on a commitment, link the proof, and let a validator set read the evidence and decide whether you kept it.</p>
      <div class="hero-cta">
        <a href="#/make" class="btn primary lg"><i class="ph-bold ph-seal-check"></i> Make a vow</a>
        <a href="#/how" class="btn glass lg">See how it works</a>
      </div>
    </div>
  </section>

  <div class="stats"><div class="stats-grid">
    <div class="stat"><div class="n">${s.total}</div><div class="l">Vows made</div></div>
    <div class="stat kept"><div class="n">${s.kept}</div><div class="l">Kept</div></div>
    <div class="stat broken"><div class="n">${s.broken}</div><div class="l">Broken</div></div>
    <div class="stat"><div class="n">${toGen(s.staked_active)}</div><div class="l">GEN staked now</div></div>
  </div></div>

  <section class="section wrap">
    <div class="sec-head"><div class="kicker">What is Vow?</div>
      <h2>A promise that can settle itself.</h2>
      <p>Most promises rely on trust or a referee. Vow replaces both with a simple idea: stake something on your word, then let anyone check the evidence when it is due.</p></div>
    <div class="cards3">
      <div class="infocard"><div class="ic"><i class="ph-bold ph-target"></i></div><h3>Make a commitment</h3><p>State what you will do, lock a stake, and name a beneficiary who receives it if you fall short.</p></div>
      <div class="infocard"><div class="ic"><i class="ph-bold ph-scan"></i></div><h3>Prove it with a link</h3><p>When it is time, the contract reads the public URL you provided as proof - a repo, a page, a record.</p></div>
      <div class="infocard"><div class="ic"><i class="ph-bold ph-scales"></i></div><h3>Validators decide</h3><p>A set of validators reads the same evidence and reaches consensus on whether the vow was kept. No single referee.</p></div>
    </div>
  </section>

  <section class="section tight wrap"><div class="cta-band">
    <h2>Ready to stake your word?</h2>
    <p>It takes a sentence and a stake. The rest is decided by the evidence.</p>
    <a href="#/make" class="btn onlight lg"><i class="ph-bold ph-plus"></i> Make your first vow</a>
  </div></section>`;
}

/* ---------------- HOW IT WORKS ---------------- */
function renderHow() {
  app().innerHTML = `<div class="wrap section">
    <div class="sec-head"><div class="kicker">How it works</div>
      <h2>Four steps from promise to settlement.</h2>
      <p>Vow is an Intelligent Contract on GenLayer. Here is exactly what happens, start to finish.</p></div>
    <div class="steps">
      <div class="step"><div class="num"></div><div><h3>You make a vow and lock a stake</h3>
        <p>Write what you are committing to, link a public URL that will later prove it, name a beneficiary, and lock a GEN stake. The stake is held by the contract - not by us.</p></div></div>
      <div class="step"><div class="num"></div><div><h3>You do the thing</h3>
        <p>Go and keep your word. Update the page, ship the release, publish the record - whatever your proof URL points to should end up showing that you did it.</p></div></div>
      <div class="step"><div class="num"></div><div><h3>Anyone asks the validators to settle</h3>
        <p>When it is due, a settle is triggered. The contract fetches your proof URL and a validator set independently reads the evidence and reaches consensus on a single yes/no answer.</p></div></div>
      <div class="step"><div class="num"></div><div><h3>The stake moves automatically</h3>
        <p>The outcome is final and on-chain.</p>
        <span class="tag ok">Kept → your stake returns to you</span> &nbsp; <span class="tag no">Broken → your stake goes to your beneficiary</span></div></div>
    </div>
    <div style="margin-top:48px" class="cards3">
      <div class="infocard"><div class="ic"><i class="ph-bold ph-robot"></i></div><h3>Why a validator set?</h3><p>Reading evidence is a judgement call. GenLayer runs the same prompt across independent validators and only accepts an answer they agree on - so no single node can fake the result.</p></div>
      <div class="infocard"><div class="ic"><i class="ph-bold ph-lock-key"></i></div><h3>Where is my stake?</h3><p>In the contract, in escrow. It can only ever go back to you or to the beneficiary you chose - the rules are fixed in code.</p></div>
      <div class="infocard"><div class="ic"><i class="ph-bold ph-eye"></i></div><h3>What makes good proof?</h3><p>A public page whose content clearly settles the question. The more concrete the commitment and the proof, the cleaner the verdict.</p></div>
    </div>
    <div style="margin-top:40px"><a href="#/make" class="btn primary lg"><i class="ph-bold ph-seal-check"></i> Make a vow</a></div>
  </div>`;
}

/* ---------------- EXPLORE ---------------- */
function renderExplore() {
  const shown = vows.filter((v) => filter === "all" || ST.key[v.status] === filter);
  app().innerHTML = `<div class="wrap section">
    <div class="explore-head">
      <div class="sec-head" style="margin-bottom:0"><div class="kicker">Explore</div><h2>Every vow on the chain.</h2></div>
      <div class="filters">
        ${["all", "active", "kept", "broken"].map((f) => `<button class="filt ${f === filter ? "on" : ""}" data-f="${f}">${f === "all" ? "All" : ST.label[ST.key.indexOf(f)]}</button>`).join("")}
      </div>
    </div>
    <div class="vgrid">${shown.length ? shown.slice().reverse().map(vcard).join("") : `<p style="color:var(--faint);grid-column:1/-1;padding:40px 0">No vows ${filter === "all" ? "yet" : "in this state"}. <a href="#/make">Make one →</a></p>`}</div>
  </div>`;
  document.querySelectorAll(".filt").forEach((b) => b.onclick = () => { filter = b.dataset.f; renderExplore(); });
  document.querySelectorAll("[data-v]").forEach((c) => c.onclick = () => { location.hash = "#/vow/" + c.dataset.v; });
}
function vcard(v) {
  const k = ST.key[v.status];
  const icon = { active: "ph-hourglass-medium", kept: "ph-check-circle", broken: "ph-x-circle" }[k];
  return `<div class="vcard" data-v="${v.id}">
    <div class="vc-top"><span class="vbadge vb-${k}"><i class="ph-bold ${icon}"></i> ${ST.label[v.status]}</span>
      <span class="vc-stake">${toGen(v.stake)} <small>GEN</small></span></div>
    <h3>${esc(v.title)}</h3><div class="vc-detail">${esc(v.detail)}</div>
    <div class="vc-foot">View vow <i class="ph-bold ph-arrow-right"></i></div>
  </div>`;
}

/* ---------------- DETAIL ---------------- */
function renderDetail(id) {
  const v = vows.find((x) => x.id === id);
  if (!v) { app().innerHTML = `<div class="wrap"><p class="back" onclick="location.hash='#/vows'">← Back</p><p style="padding:40px 0;color:var(--faint)">Vow not found.</p></div>`; return; }
  const k = ST.key[v.status];
  let verdict = "";
  if (v.status === 1) verdict = `<div class="d-verdict dv-ok"><b>Kept.</b> ${v.rationale ? esc(v.rationale) : "The evidence showed the commitment was fulfilled."} The stake was returned to the author.</div>`;
  if (v.status === 2) verdict = `<div class="d-verdict dv-no"><b>Broken.</b> ${v.rationale ? esc(v.rationale) : "The evidence did not show the commitment was met."} The stake went to the beneficiary.</div>`;
  app().innerHTML = `<div class="wrap">
    <p class="back" id="backBtn">← Back to explore</p>
    <div class="detail">
      <div>
        <span class="vbadge vb-${k} d-badge"><i class="ph-bold ph-${k === "kept" ? "check-circle" : k === "broken" ? "x-circle" : "hourglass-medium"}"></i> ${ST.label[v.status]}</span>
        <h1 class="d-title">${esc(v.title)}</h1>
        <p class="d-detail">${esc(v.detail)}</p>
        ${verdict}
      </div>
      <div class="d-side">
        <div class="d-stake-big">${toGen(v.stake)} <small>GEN staked</small></div>
        <div class="d-kv">
          <div class="d-row"><span class="k">Author</span><span class="v">${short(v.author)}</span></div>
          <div class="d-row"><span class="k">Beneficiary</span><span class="v">${short(v.beneficiary)}</span></div>
          <div class="d-row"><span class="k">Proof</span><span class="v"><a href="${esc(v.proof_url)}" target="_blank" rel="noopener">${esc(hostOf(v.proof_url))} ↗</a></span></div>
        </div>
        <div class="d-actions">
          ${v.status === 0
            ? `<button class="btn dark lg" id="resolveBtn" style="width:100%"><i class="ph-bold ph-gavel"></i> Settle this vow</button>
               <p class="fhint" style="margin-top:10px">Validators read the proof and decide. Calls a real LLM consensus.</p>`
            : `<p class="fhint">This vow is settled and final.</p>`}
        </div>
      </div>
    </div></div>`;
  $("backBtn").onclick = () => { location.hash = "#/vows"; };
  if ($("resolveBtn")) $("resolveBtn").onclick = () => doResolve(v.id);
}

/* ---------------- MAKE ---------------- */
function renderMake() {
  app().innerHTML = `<div class="wrap"><div class="make">
    <div class="make-h"><h1>Make a vow</h1><p>Commit to something, lock a stake, and let the evidence decide.</p></div>
    <div class="field"><label>Your commitment <span class="sub">- the headline</span></label><input id="mTitle" maxlength="90" placeholder="e.g. Ship the v1 release this month" /></div>
    <div class="field"><label>The details <span class="sub">- what counts as keeping it</span></label><textarea id="mDetail" placeholder="Be concrete. This is what the validators check the proof against."></textarea></div>
    <div class="field"><label>Proof URL <span class="sub">- where the evidence will live</span></label><input id="mUrl" placeholder="https://…" /><div class="fhint">A public page the validators can read when it is time to settle.</div></div>
    <div class="stake-row">
      <div class="field"><label>Stake (GEN)</label><input id="mStake" type="number" min="0" step="0.5" value="2" /></div>
      <div class="field"><label>Beneficiary address</label><input id="mBen" placeholder="0x… receives the stake if broken" /></div>
    </div>
    <div class="callout"><i class="ph-fill ph-info"></i><div>If the validators decide you <b>kept</b> it, your stake returns to you. If <b>broken</b>, it goes to the beneficiary. Choose someone (or a cause) that motivates you.</div></div>
    <button class="btn primary lg" id="makeBtn" style="margin-top:26px;width:100%"><i class="ph-bold ph-seal-check"></i> Lock stake & make vow</button>
  </div></div>`;
  $("makeBtn").onclick = doMake;
}

/* ---------------- ACTIONS ---------------- */
async function doResolve(id) {
  if (!confirm("Settle this vow? Validators read the proof and decide kept/broken. This is final and calls a real LLM.")) return;
  const btn = $("resolveBtn"); btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> validators reading…';
  try { await ensureWallet(); toast("Validators reading the proof…", "", "settle"); await write(CONTRACT, "resolve", [id]); toast("Settled on-chain.", "ok"); await load(); renderDetail(id); }
  catch (e) { toast(fmtErr(e), "err"); if (btn) { btn.disabled = false; btn.textContent = "Settle this vow"; } }
}
async function doMake() {
  const title = $("mTitle").value.trim(), detail = $("mDetail").value.trim(), url = $("mUrl").value.trim();
  const ben = $("mBen").value.trim(), stake = parseFloat($("mStake").value);
  if (!title) return toast("Add a commitment title.", "err");
  if (!detail) return toast("Describe what counts as keeping it.", "err");
  if (!url) return toast("Add a proof URL.", "err");
  if (!/^0x[0-9a-fA-F]{40}$/.test(ben)) return toast("Enter a valid 0x beneficiary address.", "err");
  if (!(stake > 0)) return toast("Lock a stake above zero.", "err");
  const btn = $("makeBtn"); btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> locking stake';
  try {
    await ensureWallet();
    await write(CONTRACT, "make_vow", [title, detail, url, ben], GEN(stake));
    toast("Vow made - stake locked.", "ok");
    await load(); location.hash = "#/vows";
  } catch (e) { toast(fmtErr(e), "err"); btn.disabled = false; btn.innerHTML = "Lock stake & make vow"; }
}

window.addEventListener("hashchange", route);
const _cb = $("connectBtn"); if (_cb) _cb.onclick = doConnect;
if (window.ethereum) window.ethereum.on?.("accountsChanged", refreshWallet);

(async () => {
  await refreshWallet();
  try { await load(); } catch (e) { app().innerHTML = `<div class="loading">Could not reach the chain. ${fmtErr(e)}</div>`; return; }
  route();
})();
