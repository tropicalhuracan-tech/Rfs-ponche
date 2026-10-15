/* ==== MÓDULO DEPURACIÓN DE CANDIDATOS ==== */
const DEPURACION_KEY = "rfs-ops-depuracion";

const DEP_VERDICT = {
  pending: "Pendiente",
  apto: "Apto",
  observacion: "Con observación",
  no_apto: "No apto",
};

const DEP_CHECKLIST_ITEMS = [
  { key: "cedulaCopy", label: "Copia / foto de cédula" },
  { key: "antecedentesDoc", label: "Certificado de no antecedentes (Procuraduría)" },
  { key: "referencesOk", label: "Referencias laborales / personales verificadas" },
  { key: "interviewOk", label: "Entrevista realizada" },
  { key: "consentOk", label: "Consentimiento firmado / aceptado" },
  { key: "fieldCheckOk", label: "Indagación / verificación en zona" },
  { key: "employerHistoryOk", label: "Historial de empleos / servicios revisado" },
];

let depuracionData = { candidates: [], settings: {} };
let selectedDepId = "";
let depTab = "list";
let pendingDepCedulaPhoto = null;

function emptyDepChecklist() {
  const o = {};
  DEP_CHECKLIST_ITEMS.forEach((i) => {
    o[i.key] = false;
  });
  return o;
}

function emptyDepCandidate() {
  return {
    id: `dep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    cedula: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    hiredPosition: "",
    notes: "",
    consentSigned: false,
    consentAt: "",
    consentBy: "",
    checklist: emptyDepChecklist(),
    references: [
      { name: "", phone: "", note: "" },
      { name: "", phone: "", note: "" },
    ],
    cedulaPhoto: "",
    cedulaPhotoMediaId: "",
    antecedentesNote: "",
    fieldCheckNote: "",
    employerHistoryNote: "",
    riskFlagsNote: "",
    verdict: "pending",
    verdictNote: "",
    hrApplicationId: "",
    createdBy: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeDepChecklist(raw) {
  const base = emptyDepChecklist();
  const src = raw && typeof raw === "object" ? raw : {};
  DEP_CHECKLIST_ITEMS.forEach((i) => {
    base[i.key] = !!src[i.key];
  });
  return base;
}

function normalizeDepReference(r = {}) {
  return {
    name: String(r.name || "").trim(),
    phone: String(r.phone || "").trim(),
    note: String(r.note || "").trim(),
  };
}

function normalizeDepCandidate(c = {}) {
  const refs = Array.isArray(c.references) ? c.references.map(normalizeDepReference) : [];
  while (refs.length < 2) refs.push({ name: "", phone: "", note: "" });
  const verdict = DEP_VERDICT[c.verdict] ? c.verdict : "pending";
  const checklist = normalizeDepChecklist(c.checklist);
  // Migrar checklist viejo de Verifik → indagación interna
  if (c.checklist && c.checklist.verifikOk && !Object.prototype.hasOwnProperty.call(c.checklist, "fieldCheckOk")) {
    checklist.fieldCheckOk = !!c.checklist.verifikOk;
  }
  return {
    id: c.id || `dep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    cedula: String(c.cedula || "").replace(/\D/g, "").slice(0, 11),
    fullName: String(c.fullName || "").trim(),
    phone: String(c.phone || "").trim(),
    email: String(c.email || "").trim(),
    address: String(c.address || "").trim(),
    hiredPosition: String(c.hiredPosition || "").trim(),
    notes: String(c.notes || "").trim(),
    consentSigned: !!c.consentSigned,
    consentAt: c.consentAt || "",
    consentBy: c.consentBy || "",
    checklist,
    references: refs.slice(0, 4),
    cedulaPhoto: typeof c.cedulaPhoto === "string" ? c.cedulaPhoto : "",
    cedulaPhotoUrl: typeof c.cedulaPhotoUrl === "string" ? c.cedulaPhotoUrl : "",
    cedulaPhotoMediaId: c.cedulaPhotoMediaId || "",
    cedulaPhotoStoragePath: c.cedulaPhotoStoragePath || "",
    antecedentesNote: String(c.antecedentesNote || "").trim(),
    fieldCheckNote: String(c.fieldCheckNote || "").trim(),
    employerHistoryNote: String(c.employerHistoryNote || "").trim(),
    riskFlagsNote: String(c.riskFlagsNote || "").trim(),
    verdict,
    verdictNote: String(c.verdictNote || "").trim(),
    hrApplicationId: c.hrApplicationId || "",
    createdBy: c.createdBy || "",
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
  };
}

function emptyDepuracionData() {
  return { candidates: [], settings: {} };
}

function normalizeDepuracionData(raw = {}) {
  return {
    candidates: Array.isArray(raw.candidates) ? raw.candidates.map(normalizeDepCandidate) : [],
    settings: {},
  };
}

function saveDepuracionData(push = true) {
  depuracionData = normalizeDepuracionData(depuracionData);
  localStorage.setItem(DEPURACION_KEY, JSON.stringify(depuracionData));
  if (push && typeof queueCloudSave === "function") queueCloudSave();
}

function applyRemoteDepuracionData(remote) {
  const remoteNorm = normalizeDepuracionData(remote || {});
  const local = normalizeDepuracionData(depuracionData);
  const map = new Map();
  [...local.candidates, ...remoteNorm.candidates].forEach((c) => {
    if (!c || !c.id) return;
    const prev = map.get(c.id);
    if (!prev || String(c.updatedAt) > String(prev.updatedAt)) map.set(c.id, c);
  });
  depuracionData = {
    candidates: [...map.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))),
    settings: {},
  };
  localStorage.setItem(DEPURACION_KEY, JSON.stringify(depuracionData));
}

function getDepCandidate(id) {
  return (depuracionData.candidates || []).find((c) => c.id === id) || null;
}

function formatCedulaDisplay(cedula) {
  const d = String(cedula || "").replace(/\D/g, "");
  if (d.length !== 11) return d || "—";
  return `${d.slice(0, 3)}-${d.slice(3, 10)}-${d.slice(10)}`;
}

function setDepTab(tab) {
  depTab = tab || "list";
  document.querySelectorAll(".dep-tabs .emp-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.depTab === depTab);
  });
  const list = document.getElementById("depTabList");
  const form = document.getElementById("depTabForm");
  if (list) list.hidden = depTab !== "list";
  if (form) form.hidden = depTab !== "form";
  renderDepuracionModule();
}

function startNewDepCandidate() {
  if (typeof canAccessDepuracion === "function" && !canAccessDepuracion()) {
    toast("No tienes acceso a Depuración.");
    return;
  }
  const row = emptyDepCandidate();
  row.createdBy =
    typeof currentUser !== "undefined" && currentUser
      ? currentUser.displayName || currentUser.username
      : "";
  depuracionData.candidates.unshift(row);
  saveDepuracionData(true);
  selectedDepId = row.id;
  pendingDepCedulaPhoto = null;
  setDepTab("form");
  fillDepForm(row);
  toast("Nuevo candidato creado.");
}

function openDepCandidate(id) {
  const row = getDepCandidate(id);
  if (!row) return;
  selectedDepId = row.id;
  pendingDepCedulaPhoto = null;
  setDepTab("form");
  fillDepForm(row);
}

function fillDepForm(c) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === "checkbox") el.checked = !!val;
    else el.value = val == null ? "" : val;
  };
  set("depCedula", c.cedula || "");
  set("depFullName", c.fullName || "");
  set("depPhone", c.phone || "");
  set("depEmail", c.email || "");
  set("depAddress", c.address || "");
  set("depHiredPosition", c.hiredPosition || "");
  set("depNotes", c.notes || "");
  set("depAntecedentesNote", c.antecedentesNote || "");
  set("depConsent", c.consentSigned);
  set("depVerdict", c.verdict || "pending");
  set("depVerdictNote", c.verdictNote || "");
  const meta = document.getElementById("depFormMeta");
  if (meta) {
    meta.textContent = `${DEP_VERDICT[c.verdict] || c.verdict} · ${formatCedulaDisplay(c.cedula)} · ${
      c.fullName || "Sin nombre"
    }`;
  }
  const box = document.getElementById("depChecklistBox");
  if (box) {
    box.innerHTML = DEP_CHECKLIST_ITEMS.map(
      (i) => `<label class="check-row dep-check-row">
        <input type="checkbox" data-dep-check="${i.key}" ${c.checklist[i.key] ? "checked" : ""} />
        <span>${escapeHtml(i.label)}</span>
      </label>`
    ).join("");
  }
  const refs = document.getElementById("depReferencesBox");
  if (refs) {
    refs.innerHTML = (c.references || [])
      .map(
        (r, idx) => `<div class="dep-ref-card">
        <p class="muted tight">Referencia ${idx + 1}</p>
        <label>Nombre<input class="dep-ref-name" data-idx="${idx}" type="text" value="${escapeHtml(
          r.name
        )}" /></label>
        <label>Teléfono<input class="dep-ref-phone" data-idx="${idx}" type="tel" value="${escapeHtml(
          r.phone
        )}" /></label>
        <label>Nota<input class="dep-ref-note" data-idx="${idx}" type="text" value="${escapeHtml(
          r.note
        )}" /></label>
      </div>`
      )
      .join("");
  }
  const img = document.getElementById("depCedulaPreview");
  const wrap = document.getElementById("depCedulaPreviewWrap");
  const photo = pendingDepCedulaPhoto || c.cedulaPhoto || c.cedulaPhotoUrl || "";
  if (img && wrap) {
    if (photo) {
      img.src = photo;
      wrap.hidden = false;
    } else {
      wrap.hidden = true;
      img.removeAttribute("src");
    }
  }
  const fieldEl = document.getElementById("depFieldCheckNote");
  if (fieldEl) fieldEl.value = c.fieldCheckNote || "";
  const employerEl = document.getElementById("depEmployerHistoryNote");
  if (employerEl) employerEl.value = c.employerHistoryNote || "";
  const riskEl = document.getElementById("depRiskFlagsNote");
  if (riskEl) riskEl.value = c.riskFlagsNote || "";
  const consentMeta = document.getElementById("depConsentMeta");
  if (consentMeta) {
    consentMeta.textContent = c.consentSigned
      ? `Aceptado${c.consentAt ? ` · ${new Date(c.consentAt).toLocaleString("es")}` : ""}${
          c.consentBy ? ` · ${c.consentBy}` : ""
        }`
      : "Pendiente de aceptación del candidato";
  }
}

function readDepFormInto(c) {
  c.cedula = String(document.getElementById("depCedula")?.value || "")
    .replace(/\D/g, "")
    .slice(0, 11);
  c.fullName = String(document.getElementById("depFullName")?.value || "").trim();
  c.phone = String(document.getElementById("depPhone")?.value || "").trim();
  c.email = String(document.getElementById("depEmail")?.value || "").trim();
  c.address = String(document.getElementById("depAddress")?.value || "").trim();
  c.hiredPosition = String(document.getElementById("depHiredPosition")?.value || "").trim();
  c.notes = String(document.getElementById("depNotes")?.value || "").trim();
  c.antecedentesNote = String(document.getElementById("depAntecedentesNote")?.value || "").trim();
  c.fieldCheckNote = String(document.getElementById("depFieldCheckNote")?.value || "").trim();
  c.employerHistoryNote = String(document.getElementById("depEmployerHistoryNote")?.value || "").trim();
  c.riskFlagsNote = String(document.getElementById("depRiskFlagsNote")?.value || "").trim();
  c.verdict = document.getElementById("depVerdict")?.value || "pending";
  if (!DEP_VERDICT[c.verdict]) c.verdict = "pending";
  c.verdictNote = String(document.getElementById("depVerdictNote")?.value || "").trim();
  const consentEl = document.getElementById("depConsent");
  const nowConsent = !!(consentEl && consentEl.checked);
  if (nowConsent && !c.consentSigned) {
    c.consentAt = new Date().toISOString();
    c.consentBy =
      typeof currentUser !== "undefined" && currentUser
        ? currentUser.displayName || currentUser.username
        : "";
  }
  if (!nowConsent) {
    c.consentAt = "";
    c.consentBy = "";
  }
  c.consentSigned = nowConsent;
  c.checklist = normalizeDepChecklist(c.checklist);
  document.querySelectorAll("#depChecklistBox [data-dep-check]").forEach((el) => {
    c.checklist[el.dataset.depCheck] = !!el.checked;
  });
  c.checklist.consentOk = c.consentSigned;
  if (c.fieldCheckNote) c.checklist.fieldCheckOk = true;
  if (c.employerHistoryNote) c.checklist.employerHistoryOk = true;
  const refs = [];
  document.querySelectorAll(".dep-ref-name").forEach((el) => {
    const idx = Number(el.dataset.idx);
    if (!refs[idx]) refs[idx] = { name: "", phone: "", note: "" };
    refs[idx].name = el.value.trim();
  });
  document.querySelectorAll(".dep-ref-phone").forEach((el) => {
    const idx = Number(el.dataset.idx);
    if (!refs[idx]) refs[idx] = { name: "", phone: "", note: "" };
    refs[idx].phone = el.value.trim();
  });
  document.querySelectorAll(".dep-ref-note").forEach((el) => {
    const idx = Number(el.dataset.idx);
    if (!refs[idx]) refs[idx] = { name: "", phone: "", note: "" };
    refs[idx].note = el.value.trim();
  });
  c.references = refs.map(normalizeDepReference);
  if (pendingDepCedulaPhoto) {
    c.cedulaPhoto = pendingDepCedulaPhoto;
    c.cedulaPhotoMediaId = "";
  }
  if (c.cedulaPhoto || c.checklist.cedulaCopy) c.checklist.cedulaCopy = true;
  c.updatedAt = new Date().toISOString();
  return c;
}

function saveDepCandidateFromForm() {
  if (typeof canAccessDepuracion === "function" && !canAccessDepuracion()) {
    toast("No tienes acceso a Depuración.");
    return;
  }
  const c = getDepCandidate(selectedDepId);
  if (!c) {
    toast("Abre o crea un candidato.");
    return;
  }
  readDepFormInto(c);
  if (!c.cedula || c.cedula.length < 11) {
    toast("Escribe la cédula completa (11 dígitos).");
    return;
  }
  if (!c.fullName) {
    toast("Escribe el nombre del candidato.");
    return;
  }
  saveDepuracionData(true);
  pendingDepCedulaPhoto = null;
  fillDepForm(c);
  if (typeof logActivity === "function") {
    logActivity("dep_save", `Depuración: ${c.fullName} · ${formatCedulaDisplay(c.cedula)} · ${DEP_VERDICT[c.verdict]}`);
  }
  toast("Candidato guardado.");
}

function deleteDepCandidate(id) {
  const c = getDepCandidate(id || selectedDepId);
  if (!c) return;
  if (!confirm(`¿Eliminar la depuración de ${c.fullName || c.cedula}?`)) return;
  depuracionData.candidates = depuracionData.candidates.filter((x) => x.id !== c.id);
  saveDepuracionData(true);
  if (selectedDepId === c.id) {
    selectedDepId = "";
    setDepTab("list");
  } else {
    renderDepuracionModule();
  }
  toast("Candidato eliminado.");
}

function sendDepToHr() {
  const c = getDepCandidate(selectedDepId);
  if (!c) return;
  readDepFormInto(c);
  if (typeof canAccessRrhh === "function" && !canAccessRrhh()) {
    toast("No tienes acceso a RRHH para crear la solicitud.");
    return;
  }
  if (typeof emptyHrApplication !== "function" || typeof hrData === "undefined") {
    toast("Módulo RRHH no disponible.");
    return;
  }
  // Asegurar foto de cédula pendiente guardada en el candidato
  if (pendingDepCedulaPhoto) {
    c.cedulaPhoto = pendingDepCedulaPhoto;
    c.cedulaPhotoMediaId = "";
    pendingDepCedulaPhoto = null;
  }
  const cedulaPhoto = c.cedulaPhoto || c.cedulaPhotoUrl || "";
  let app = c.hrApplicationId ? getHrApp(c.hrApplicationId) : null;
  if (!app) {
    app = emptyHrApplication();
    app.fullName = c.fullName;
    app.cedula = c.cedula;
    app.phone = c.phone;
    app.email = c.email;
    app.address = c.address;
    app.hiredPosition = c.hiredPosition || "";
    app.fromDepuracionId = c.id;
    app.cedulaPhoto = cedulaPhoto;
    app.cedulaPhotoUrl = /^https?:\/\//i.test(cedulaPhoto) ? cedulaPhoto : "";
    app.hrNotes = `Desde Depuración. Veredicto: ${DEP_VERDICT[c.verdict]}. ${c.verdictNote || ""}`.trim();
    app.createdBy =
      typeof currentUser !== "undefined" && currentUser
        ? currentUser.displayName || currentUser.username
        : "";
    hrData.applications.unshift(app);
    c.hrApplicationId = app.id;
    saveHrData(true);
  } else {
    // Actualizar puesto y datos clave al reenviar
    if (c.hiredPosition) app.hiredPosition = c.hiredPosition;
    if (c.fullName) app.fullName = c.fullName;
    if (c.cedula) app.cedula = c.cedula;
    if (c.phone) app.phone = c.phone;
    if (c.email) app.email = c.email;
    if (c.address) app.address = c.address;
    app.fromDepuracionId = c.id;
    if (cedulaPhoto && !(app.cedulaPhoto || app.cedulaPhotoUrl)) {
      app.cedulaPhoto = cedulaPhoto;
      app.cedulaPhotoUrl = /^https?:\/\//i.test(cedulaPhoto) ? cedulaPhoto : "";
    }
    app.updatedAt = new Date().toISOString();
    saveHrData(true);
  }
  saveDepuracionData(true);
  if (typeof openHrApplication === "function") {
    openHrApplication(app.id);
    if (typeof switchView === "function") switchView("hrView");
  }
  toast(
    c.hiredPosition
      ? `Expediente RRHH listo · puesto: ${c.hiredPosition}`
      : "Expediente RRHH listo. Completa el puesto en RRHH antes de contratar."
  );
}

function renderDepList() {
  const list = document.getElementById("depCandidateList");
  if (!list) return;
  const q = String(document.getElementById("depSearch")?.value || "")
    .trim()
    .toLowerCase();
  let rows = depuracionData.candidates || [];
  if (q) {
    rows = rows.filter(
      (c) =>
        (c.fullName || "").toLowerCase().includes(q) ||
        (c.cedula || "").includes(q.replace(/\D/g, "")) ||
        (c.phone || "").includes(q) ||
        (DEP_VERDICT[c.verdict] || "").toLowerCase().includes(q)
    );
  }
  if (!rows.length) {
    list.innerHTML = `<p class="empty">No hay candidatos en depuración. Crea uno con la cédula y el consentimiento.</p>`;
    return;
  }
  list.innerHTML = rows
    .map((c) => {
      const checks = DEP_CHECKLIST_ITEMS.filter((i) => c.checklist && c.checklist[i.key]).length;
      return `<article class="report-card">
        <h3>${escapeHtml(c.fullName || "Sin nombre")}</h3>
        <p class="muted">${escapeHtml(formatCedulaDisplay(c.cedula))} · ${escapeHtml(
        c.phone || "Sin tel"
      )}</p>
        <p><span class="caja-code-pill">${escapeHtml(DEP_VERDICT[c.verdict] || c.verdict)}</span>
          <span class="muted"> · Checklist ${checks}/${DEP_CHECKLIST_ITEMS.length}
          ${c.riskFlagsNote ? " · Con señales de riesgo" : ""}</span></p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          <button type="button" class="btn secondary btn-dep-open" data-id="${escapeHtml(
            c.id
          )}" style="width:auto;padding:8px 10px;font-size:12px">Abrir</button>
          <button type="button" class="btn danger btn-dep-del" data-id="${escapeHtml(
            c.id
          )}" style="width:auto;padding:8px 10px;font-size:12px">Eliminar</button>
        </div>
      </article>`;
    })
    .join("");
  list.querySelectorAll(".btn-dep-open").forEach((btn) => {
    btn.addEventListener("click", () => openDepCandidate(btn.dataset.id));
  });
  list.querySelectorAll(".btn-dep-del").forEach((btn) => {
    btn.addEventListener("click", () => deleteDepCandidate(btn.dataset.id));
  });
}

function renderDepuracionModule() {
  if (typeof canAccessDepuracion === "function" && !canAccessDepuracion()) return;
  const summary = document.getElementById("depSummary");
  const rows = depuracionData.candidates || [];
  const aptos = rows.filter((c) => c.verdict === "apto").length;
  const pending = rows.filter((c) => c.verdict === "pending").length;
  if (summary) {
    summary.textContent = `${rows.length} candidato(s) · ${pending} pendiente(s) · ${aptos} apto(s). Depuración interna RFS.`;
  }
  if (depTab === "list") renderDepList();
  else if (selectedDepId && getDepCandidate(selectedDepId)) fillDepForm(getDepCandidate(selectedDepId));
}

async function onDepCedulaPhotoSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  try {
    if (typeof compressImage === "function") {
      pendingDepCedulaPhoto = await compressImage(file, 900, 0.72);
    } else {
      pendingDepCedulaPhoto = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    const img = document.getElementById("depCedulaPreview");
    const wrap = document.getElementById("depCedulaPreviewWrap");
    if (img && wrap) {
      img.src = pendingDepCedulaPhoto;
      wrap.hidden = false;
    }
    toast("Foto de cédula lista. Guarda el candidato.");
  } catch (_) {
    toast("No se pudo procesar la imagen.");
    pendingDepCedulaPhoto = null;
  }
}

function clearDepCedulaPhoto() {
  pendingDepCedulaPhoto = "";
  const input = document.getElementById("depCedulaPhoto");
  if (input) input.value = "";
  const img = document.getElementById("depCedulaPreview");
  const wrap = document.getElementById("depCedulaPreviewWrap");
  if (wrap) wrap.hidden = true;
  if (img) img.removeAttribute("src");
  const c = getDepCandidate(selectedDepId);
  if (c) {
    c.cedulaPhoto = "";
    c.cedulaPhotoMediaId = "";
    c.updatedAt = new Date().toISOString();
    saveDepuracionData(true);
  }
}

function printDepCandidateSheet() {
  const c = getDepCandidate(selectedDepId);
  if (!c) {
    toast("Abre un candidato.");
    return;
  }
  readDepFormInto(c);
  saveDepuracionData(true);
  const checks = DEP_CHECKLIST_ITEMS.map(
    (i) => `<li>${c.checklist[i.key] ? "☑" : "☐"} ${escapeHtml(i.label)}</li>`
  ).join("");
  const refs = (c.references || [])
    .filter((r) => r.name || r.phone)
    .map(
      (r) =>
        `<li><strong>${escapeHtml(r.name || "—")}</strong> · ${escapeHtml(r.phone || "—")}${
          r.note ? ` — ${escapeHtml(r.note)}` : ""
        }</li>`
    )
    .join("");
  const body = `
    <h2>Ficha de depuración de candidato</h2>
    <p><strong>${escapeHtml(c.fullName)}</strong><br/>
    Cédula: ${escapeHtml(formatCedulaDisplay(c.cedula))}<br/>
    Tel: ${escapeHtml(c.phone || "—")} · Email: ${escapeHtml(c.email || "—")}<br/>
    Dirección: ${escapeHtml(c.address || "—")}</p>
    <p><strong>Consentimiento:</strong> ${c.consentSigned ? "Sí" : "No"}${
      c.consentAt ? ` · ${escapeHtml(new Date(c.consentAt).toLocaleString("es"))}` : ""
    }</p>
    <h3>Checklist</h3>
    <ul>${checks}</ul>
    <h3>Referencias</h3>
    <ul>${refs || "<li>Sin referencias</li>"}</ul>
    <h3>Verificación operativa</h3>
    <p><strong>Indagación / zona:</strong> ${escapeHtml(c.fieldCheckNote || "—")}<br/>
    <strong>Empleos previos:</strong> ${escapeHtml(c.employerHistoryNote || "—")}<br/>
    <strong>Señales de riesgo:</strong> ${escapeHtml(c.riskFlagsNote || "—")}</p>
    <p><strong>Antecedentes (nota):</strong> ${escapeHtml(c.antecedentesNote || "—")}</p>
    <h3>Veredicto</h3>
    <p><strong>${escapeHtml(DEP_VERDICT[c.verdict] || c.verdict)}</strong><br/>
    ${escapeHtml(c.verdictNote || "")}</p>
    <p><strong>Notas:</strong> ${escapeHtml(c.notes || "—")}</p>
    <p class="footer">Uso interno RFS · Solo con consentimiento del candidato · No sustituye certificado oficial de antecedentes.</p>
  `;
  if (typeof openPrintWindow === "function") {
    openPrintWindow(`Depuración — ${c.fullName || c.cedula}`, body);
  }
}

function bindDepuracionUi() {
  document.querySelectorAll(".dep-tabs .emp-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.depTab === "form" && !selectedDepId) {
        startNewDepCandidate();
        return;
      }
      setDepTab(btn.dataset.depTab);
    });
  });
  document.getElementById("btnDepNew")?.addEventListener("click", startNewDepCandidate);
  document.getElementById("btnDepSave")?.addEventListener("click", saveDepCandidateFromForm);
  document.getElementById("btnDepBackList")?.addEventListener("click", () => setDepTab("list"));
  document.getElementById("btnDepDelete")?.addEventListener("click", () => deleteDepCandidate());
  document.getElementById("btnDepToHr")?.addEventListener("click", sendDepToHr);
  document.getElementById("btnDepPrint")?.addEventListener("click", printDepCandidateSheet);
  document.getElementById("depSearch")?.addEventListener("input", () => {
    if (depTab === "list") renderDepList();
  });
  document.getElementById("depCedulaPhoto")?.addEventListener("change", onDepCedulaPhotoSelected);
  document.getElementById("btnDepClearPhoto")?.addEventListener("click", clearDepCedulaPhoto);
  document.getElementById("depCedula")?.addEventListener("input", (e) => {
    e.target.value = String(e.target.value || "").replace(/\D/g, "").slice(0, 11);
  });
}

/* ==== FIN DEPURACIÓN ==== */
