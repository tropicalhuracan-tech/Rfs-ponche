/* ==== MÓDULO SUPLIDORES (gastos a proveedores + vínculo fiscal) ==== */
const SUPLIDORES_KEY = "rfs-ops-suplidores";

const SUP_CATEGORIES = [
  { id: "uniformes", label: "Uniformes" },
  { id: "armeria", label: "Armería" },
  { id: "seguros", label: "Seguros" },
  { id: "botas", label: "Botas" },
  { id: "alarmas", label: "Alarmas" },
  { id: "oficina", label: "Trabajos de oficina" },
  { id: "publicidad", label: "Publicidad" },
  { id: "otros", label: "Otros gastos" },
];

let suplidoresData = emptySuplidoresData();
let suplidoresTab = "pagos";
let selectedSupplierId = "";
let selectedSupPaymentId = "";
let pendingSupEvidencePhoto = "";

function emptySuplidoresData() {
  return {
    suppliers: [],
    payments: [],
    nextCodeSeq: 1,
  };
}

function supCategoryLabel(id) {
  const row = SUP_CATEGORIES.find((c) => c.id === id);
  return row ? row.label : String(id || "Otros");
}

function emptySupplier() {
  return {
    id: `sup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code: "",
    name: "",
    category: "otros",
    phone: "",
    rnc: "",
    notes: "",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function emptySupPayment() {
  return {
    id: `spay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    supplierId: "",
    supplierCode: "",
    supplierName: "",
    category: "otros",
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    concept: "",
    hasFiscal: false,
    ncf: "",
    rnc: "",
    itbis: 0,
    evidenceType: "",
    evidenceText: "",
    evidencePhoto: "",
    evidencePhotoUrl: "",
    evidencePhotoMediaId: "",
    evidencePhotoStoragePath: "",
    fiscalExpenseId: "",
    createdBy: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeSupplier(s = {}) {
  return {
    id: s.id || `sup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code: String(s.code || "").trim().toUpperCase(),
    name: String(s.name || "").trim(),
    category: SUP_CATEGORIES.some((c) => c.id === s.category) ? s.category : "otros",
    phone: String(s.phone || "").trim(),
    rnc: String(s.rnc || "").replace(/\D/g, "").slice(0, 11),
    notes: String(s.notes || "").trim(),
    active: s.active !== false,
    createdAt: s.createdAt || new Date().toISOString(),
    updatedAt: s.updatedAt || new Date().toISOString(),
  };
}

function normalizeSupPayment(p = {}) {
  const amount = Math.max(0, Number(p.amount) || 0);
  let itbis = Math.max(0, Number(p.itbis) || 0);
  const hasFiscal = !!(p.hasFiscal || p.ncf);
  if (hasFiscal && amount > 0 && !itbis) {
    itbis = Math.round((amount - amount / 1.18) * 100) / 100;
  }
  return {
    id: p.id || `spay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    supplierId: String(p.supplierId || "").trim(),
    supplierCode: String(p.supplierCode || "").trim().toUpperCase(),
    supplierName: String(p.supplierName || "").trim(),
    category: SUP_CATEGORIES.some((c) => c.id === p.category) ? p.category : "otros",
    date: String(p.date || "").slice(0, 10),
    amount,
    concept: String(p.concept || "").trim(),
    hasFiscal,
    ncf: String(p.ncf || "").trim().toUpperCase(),
    rnc: String(p.rnc || "").replace(/\D/g, "").slice(0, 11),
    itbis,
    evidenceType: String(p.evidenceType || "").trim(),
    evidenceText: String(p.evidenceText || "").trim(),
    evidencePhoto: p.evidencePhoto || "",
    evidencePhotoUrl: p.evidencePhotoUrl || "",
    evidencePhotoMediaId: p.evidencePhotoMediaId || "",
    evidencePhotoStoragePath: p.evidencePhotoStoragePath || "",
    fiscalExpenseId: String(p.fiscalExpenseId || "").trim(),
    createdBy: p.createdBy || "",
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  };
}

function normalizeSuplidoresData(raw = {}) {
  const suppliers = Array.isArray(raw.suppliers) ? raw.suppliers.map(normalizeSupplier) : [];
  const payments = Array.isArray(raw.payments) ? raw.payments.map(normalizeSupPayment) : [];
  let next = Math.max(1, Number(raw.nextCodeSeq) || 1);
  suppliers.forEach((s) => {
    const m = String(s.code || "").match(/^SUP-(\d+)$/i);
    if (m) next = Math.max(next, Number(m[1]) + 1);
  });
  return { suppliers, payments, nextCodeSeq: next };
}

function saveSuplidoresData(push = true) {
  suplidoresData = normalizeSuplidoresData(suplidoresData);
  localStorage.setItem(SUPLIDORES_KEY, JSON.stringify(suplidoresData));
  if (push && typeof queueCloudSave === "function") queueCloudSave();
}

function applyRemoteSuplidoresData(remote) {
  const remoteNorm = normalizeSuplidoresData(remote || {});
  const local = normalizeSuplidoresData(suplidoresData);

  function mergeById(a, b) {
    const map = new Map();
    [...a, ...b].forEach((row) => {
      if (!row || !row.id) return;
      const prev = map.get(row.id);
      if (!prev || String(row.updatedAt) > String(prev.updatedAt)) map.set(row.id, row);
    });
    return [...map.values()];
  }

  function mergePayments(a, b) {
    const map = new Map();
    [...a, ...b].forEach((row) => {
      if (!row || !row.id) return;
      const prev = map.get(row.id);
      if (!prev) {
        map.set(row.id, row);
        return;
      }
      let winner = String(row.updatedAt) > String(prev.updatedAt) ? row : prev;
      let other = winner === row ? prev : row;
      // Conservar evidencia/foto si el más nuevo llegó vacío
      if (!(winner.evidencePhoto || winner.evidencePhotoUrl) && (other.evidencePhoto || other.evidencePhotoUrl)) {
        winner = {
          ...winner,
          evidencePhoto: other.evidencePhoto,
          evidencePhotoUrl: other.evidencePhotoUrl,
          evidencePhotoMediaId: other.evidencePhotoMediaId,
          evidencePhotoStoragePath: other.evidencePhotoStoragePath,
          evidenceType: winner.evidenceType || other.evidenceType,
          evidenceText: winner.evidenceText || other.evidenceText,
        };
      }
      if (!winner.fiscalExpenseId && other.fiscalExpenseId) {
        winner = { ...winner, fiscalExpenseId: other.fiscalExpenseId };
      }
      map.set(row.id, winner);
    });
    return [...map.values()].sort((x, y) => String(y.date).localeCompare(String(x.date)));
  }

  suplidoresData = {
    suppliers: mergeById(local.suppliers, remoteNorm.suppliers).sort((a, b) =>
      String(a.code).localeCompare(String(b.code))
    ),
    payments: mergePayments(local.payments, remoteNorm.payments),
    nextCodeSeq: Math.max(local.nextCodeSeq || 1, remoteNorm.nextCodeSeq || 1),
  };
  localStorage.setItem(SUPLIDORES_KEY, JSON.stringify(suplidoresData));
}

function canAccessSuplidores() {
  if (typeof currentUser === "undefined" || !currentUser) return false;
  if (currentUser.role === "owner") return true;
  if (typeof canAccessModule === "function" && canAccessModule("admin")) return true;
  if (String(currentUser.username || "").toLowerCase() === "fortuna") return true;
  return typeof canAccessModule === "function" ? canAccessModule("suplidores") : false;
}

function nextSupplierCode() {
  const n = Math.max(1, Number(suplidoresData.nextCodeSeq) || 1);
  suplidoresData.nextCodeSeq = n + 1;
  return `SUP-${String(n).padStart(4, "0")}`;
}

function findSupplier(id) {
  return (suplidoresData.suppliers || []).find((s) => s.id === id) || null;
}

function moneySup(n) {
  if (typeof moneyRd === "function") return moneyRd(n);
  const v = Number(n) || 0;
  return `RD$ ${v.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeSup(s) {
  if (typeof escapeHtml === "function") return escapeHtml(s);
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toastSup(msg) {
  if (typeof toast === "function") toast(msg);
  else alert(msg);
}

function syncPaymentToFiscalExpense(payment) {
  if (typeof normalizeFiscalExpense !== "function" || typeof contabilidadData === "undefined") {
    return payment;
  }
  if (!contabilidadData.expenses) contabilidadData.expenses = [];

  // Sin NCF / sin fiscal → quitar vínculo si existía
  if (!payment.hasFiscal || !payment.ncf) {
    if (payment.fiscalExpenseId) {
      contabilidadData.expenses = contabilidadData.expenses.filter((e) => e.id !== payment.fiscalExpenseId);
      payment.fiscalExpenseId = "";
      if (typeof saveContabilidadData === "function") saveContabilidadData(true);
    }
    return payment;
  }

  const existing = payment.fiscalExpenseId
    ? contabilidadData.expenses.find((e) => e.id === payment.fiscalExpenseId)
    : null;
  const row = normalizeFiscalExpense({
    id: existing ? existing.id : payment.fiscalExpenseId || undefined,
    date: payment.date,
    amount: payment.amount,
    itbis: payment.itbis,
    autoItbis: !payment.itbis,
    vendor: payment.supplierName,
    ncf: payment.ncf,
    rnc: payment.rnc || "",
    book: "EDWARD",
    note: `Suplidor ${payment.supplierCode || ""} · ${supCategoryLabel(payment.category)} · ${payment.concept || ""}`.trim(),
    createdBy:
      (existing && existing.createdBy) ||
      (typeof currentUser !== "undefined" && currentUser
        ? currentUser.displayName || currentUser.username
        : ""),
    createdAt: (existing && existing.createdAt) || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  if (existing) {
    const idx = contabilidadData.expenses.findIndex((e) => e.id === existing.id);
    if (idx >= 0) contabilidadData.expenses[idx] = row;
    else contabilidadData.expenses.unshift(row);
  } else {
    contabilidadData.expenses.unshift(row);
  }
  payment.fiscalExpenseId = row.id;
  if (typeof saveContabilidadData === "function") saveContabilidadData(true);
  return payment;
}

function removeFiscalLinkForPayment(payment) {
  if (!payment || !payment.fiscalExpenseId) return;
  if (typeof contabilidadData === "undefined") return;
  contabilidadData.expenses = (contabilidadData.expenses || []).filter((e) => e.id !== payment.fiscalExpenseId);
  payment.fiscalExpenseId = "";
  if (typeof saveContabilidadData === "function") saveContabilidadData(true);
}

function setSuplidoresTab(tab) {
  suplidoresTab = tab || "pagos";
  document.querySelectorAll(".sup-tabs .emp-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.supTab === suplidoresTab);
  });
  const map = {
    pagos: "supTabPagos",
    suplidores: "supTabSuplidores",
    totales: "supTabTotales",
  };
  Object.entries(map).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.hidden = key !== suplidoresTab;
  });
  renderSuplidoresModule();
}

function fillSupplierSelect(selectedId) {
  const sel = document.getElementById("supPaySupplier");
  if (!sel) return;
  const list = [...(suplidoresData.suppliers || [])]
    .filter((s) => s.active !== false)
    .sort((a, b) => String(a.name).localeCompare(String(b.name), "es"));
  const cur = selectedId || sel.value || "";
  sel.innerHTML =
    `<option value="">— Elegir suplidor —</option>` +
    list
      .map(
        (s) =>
          `<option value="${escapeSup(s.id)}">${escapeSup(s.code)} · ${escapeSup(s.name)} (${escapeSup(
            supCategoryLabel(s.category)
          )})</option>`
      )
      .join("");
  if (cur && list.some((s) => s.id === cur)) sel.value = cur;
}

function fillCategorySelects() {
  const opts = SUP_CATEGORIES.map((c) => `<option value="${c.id}">${escapeSup(c.label)}</option>`).join("");
  ["supSupplierCategory", "supPayCategory"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const prev = el.value;
    el.innerHTML = opts;
    if (prev) el.value = prev;
  });
}

function toggleFiscalFields() {
  const on = !!document.getElementById("supPayHasFiscal")?.checked;
  const box = document.getElementById("supPayFiscalFields");
  if (box) box.hidden = !on;
}

function clearSupplierForm() {
  selectedSupplierId = "";
  document.getElementById("supSupplierFormTitle").textContent = "Nuevo suplidor";
  document.getElementById("supSupplierName").value = "";
  document.getElementById("supSupplierCategory").value = "otros";
  document.getElementById("supSupplierPhone").value = "";
  document.getElementById("supSupplierRnc").value = "";
  document.getElementById("supSupplierNotes").value = "";
  document.getElementById("supSupplierCodeHint").textContent =
    "Código: se asignará al guardar (único, ej. SUP-0001)";
}

function fillSupplierForm(s) {
  selectedSupplierId = s.id;
  document.getElementById("supSupplierFormTitle").textContent = `Editar ${s.code}`;
  document.getElementById("supSupplierName").value = s.name || "";
  document.getElementById("supSupplierCategory").value = s.category || "otros";
  document.getElementById("supSupplierPhone").value = s.phone || "";
  document.getElementById("supSupplierRnc").value = s.rnc || "";
  document.getElementById("supSupplierNotes").value = s.notes || "";
  document.getElementById("supSupplierCodeHint").textContent = `Código: ${s.code}`;
}

function clearPaymentForm() {
  selectedSupPaymentId = "";
  pendingSupEvidencePhoto = "";
  document.getElementById("supPayFormTitle").textContent = "Nuevo pago a suplidor";
  document.getElementById("supPaySupplier").value = "";
  document.getElementById("supPayCategory").value = "otros";
  document.getElementById("supPayDate").value = new Date().toISOString().slice(0, 10);
  document.getElementById("supPayAmount").value = "";
  document.getElementById("supPayConcept").value = "";
  document.getElementById("supPayHasFiscal").checked = false;
  document.getElementById("supPayNcf").value = "";
  document.getElementById("supPayRnc").value = "";
  document.getElementById("supPayItbis").value = "";
  document.getElementById("supPayEvidenceText").value = "";
  const file = document.getElementById("supPayEvidencePhoto");
  if (file) file.value = "";
  const wrap = document.getElementById("supPayEvidencePreviewWrap");
  const img = document.getElementById("supPayEvidencePreview");
  if (wrap) wrap.hidden = true;
  if (img) img.src = "";
  toggleFiscalFields();
}

function fillPaymentForm(p) {
  selectedSupPaymentId = p.id;
  pendingSupEvidencePhoto = p.evidencePhoto || "";
  document.getElementById("supPayFormTitle").textContent = "Editar pago";
  fillSupplierSelect(p.supplierId);
  document.getElementById("supPaySupplier").value = p.supplierId || "";
  document.getElementById("supPayCategory").value = p.category || "otros";
  document.getElementById("supPayDate").value = p.date || "";
  document.getElementById("supPayAmount").value = p.amount ? String(p.amount) : "";
  document.getElementById("supPayConcept").value = p.concept || "";
  document.getElementById("supPayHasFiscal").checked = !!p.hasFiscal;
  document.getElementById("supPayNcf").value = p.ncf || "";
  document.getElementById("supPayRnc").value = p.rnc || "";
  document.getElementById("supPayItbis").value = p.itbis ? String(p.itbis) : "";
  document.getElementById("supPayEvidenceText").value = p.evidenceText || "";
  const src = p.evidencePhoto || p.evidencePhotoUrl || "";
  const wrap = document.getElementById("supPayEvidencePreviewWrap");
  const img = document.getElementById("supPayEvidencePreview");
  if (src && wrap && img) {
    img.src = src;
    wrap.hidden = false;
  } else if (wrap) wrap.hidden = true;
  toggleFiscalFields();
}

function onSupplierSelectChange() {
  const id = document.getElementById("supPaySupplier")?.value;
  const s = findSupplier(id);
  if (!s) return;
  document.getElementById("supPayCategory").value = s.category || "otros";
  if (s.rnc) document.getElementById("supPayRnc").value = s.rnc;
}

function saveSupplierFromForm() {
  if (!canAccessSuplidores()) {
    toastSup("No tienes acceso a Suplidores.");
    return;
  }
  const name = String(document.getElementById("supSupplierName")?.value || "").trim();
  if (!name) {
    toastSup("Indica el nombre del suplidor.");
    return;
  }
  const category = document.getElementById("supSupplierCategory")?.value || "otros";
  const phone = String(document.getElementById("supSupplierPhone")?.value || "").trim();
  const rnc = String(document.getElementById("supSupplierRnc")?.value || "").replace(/\D/g, "").slice(0, 11);
  const notes = String(document.getElementById("supSupplierNotes")?.value || "").trim();

  if (selectedSupplierId) {
    const idx = suplidoresData.suppliers.findIndex((s) => s.id === selectedSupplierId);
    if (idx < 0) {
      toastSup("Suplidor no encontrado.");
      return;
    }
    const prev = suplidoresData.suppliers[idx];
    suplidoresData.suppliers[idx] = normalizeSupplier({
      ...prev,
      name,
      category,
      phone,
      rnc,
      notes,
      updatedAt: new Date().toISOString(),
    });
  } else {
    const row = normalizeSupplier({
      ...emptySupplier(),
      code: nextSupplierCode(),
      name,
      category,
      phone,
      rnc,
      notes,
    });
    suplidoresData.suppliers.unshift(row);
    selectedSupplierId = row.id;
  }
  saveSuplidoresData(true);
  fillSupplierSelect(selectedSupplierId);
  clearSupplierForm();
  renderSuplidoresModule();
  toastSup("Suplidor guardado.");
}

async function savePaymentFromForm() {
  if (!canAccessSuplidores()) {
    toastSup("No tienes acceso a Suplidores.");
    return;
  }
  const supplierId = document.getElementById("supPaySupplier")?.value || "";
  const supplier = findSupplier(supplierId);
  if (!supplier) {
    toastSup("Elige un suplidor (regístralo primero si hace falta).");
    return;
  }
  const date = document.getElementById("supPayDate")?.value || "";
  const amount = Math.max(0, Number(document.getElementById("supPayAmount")?.value) || 0);
  const concept = String(document.getElementById("supPayConcept")?.value || "").trim();
  const hasFiscal = !!document.getElementById("supPayHasFiscal")?.checked;
  const ncf = String(document.getElementById("supPayNcf")?.value || "").trim().toUpperCase();
  const rnc = String(document.getElementById("supPayRnc")?.value || "").replace(/\D/g, "").slice(0, 11);
  let itbis = Math.max(0, Number(document.getElementById("supPayItbis")?.value) || 0);
  const evidenceText = String(document.getElementById("supPayEvidenceText")?.value || "").trim();

  if (!date) {
    toastSup("Indica la fecha.");
    return;
  }
  if (!amount) {
    toastSup("Indica el monto pagado.");
    return;
  }
  if (!concept) {
    toastSup("Explica el concepto del pago.");
    return;
  }
  if (hasFiscal && !ncf) {
    toastSup("Si tiene comprobante fiscal, indica el NCF.");
    return;
  }
  if (!evidenceText && !pendingSupEvidencePhoto) {
    const existing = selectedSupPaymentId
      ? (suplidoresData.payments || []).find((p) => p.id === selectedSupPaymentId)
      : null;
    const hasOldPhoto = existing && (existing.evidencePhoto || existing.evidencePhotoUrl);
    if (!hasOldPhoto) {
      toastSup("Sube evidencia (foto/cheque) o escribe una explicación.");
      return;
    }
  }

  if (hasFiscal && amount > 0 && !itbis) {
    itbis = Math.round((amount - amount / 1.18) * 100) / 100;
  }

  let evidenceType = "";
  if (pendingSupEvidencePhoto) evidenceType = "photo";
  else if (evidenceText) evidenceType = "text";

  let payment;
  if (selectedSupPaymentId) {
    const idx = suplidoresData.payments.findIndex((p) => p.id === selectedSupPaymentId);
    if (idx < 0) {
      toastSup("Pago no encontrado.");
      return;
    }
    const prev = suplidoresData.payments[idx];
    payment = normalizeSupPayment({
      ...prev,
      supplierId: supplier.id,
      supplierCode: supplier.code,
      supplierName: supplier.name,
      category: document.getElementById("supPayCategory")?.value || supplier.category || "otros",
      date,
      amount,
      concept,
      hasFiscal,
      ncf: hasFiscal ? ncf : "",
      rnc: hasFiscal ? rnc || supplier.rnc : "",
      itbis: hasFiscal ? itbis : 0,
      evidenceType: evidenceType || prev.evidenceType,
      evidenceText,
      evidencePhoto: pendingSupEvidencePhoto || prev.evidencePhoto || "",
      evidencePhotoUrl: pendingSupEvidencePhoto ? "" : prev.evidencePhotoUrl || "",
      updatedAt: new Date().toISOString(),
    });
    payment = syncPaymentToFiscalExpense(payment);
    suplidoresData.payments[idx] = payment;
  } else {
    payment = normalizeSupPayment({
      ...emptySupPayment(),
      supplierId: supplier.id,
      supplierCode: supplier.code,
      supplierName: supplier.name,
      category: document.getElementById("supPayCategory")?.value || supplier.category || "otros",
      date,
      amount,
      concept,
      hasFiscal,
      ncf: hasFiscal ? ncf : "",
      rnc: hasFiscal ? rnc || supplier.rnc : "",
      itbis: hasFiscal ? itbis : 0,
      evidenceType,
      evidenceText,
      evidencePhoto: pendingSupEvidencePhoto || "",
      createdBy:
        typeof currentUser !== "undefined" && currentUser
          ? currentUser.displayName || currentUser.username
          : "",
    });
    payment = syncPaymentToFiscalExpense(payment);
    suplidoresData.payments.unshift(payment);
  }

  saveSuplidoresData(true);
  clearPaymentForm();
  renderSuplidoresModule();
  const fiscalNote = payment.hasFiscal ? " · sumado a Gastos fiscales" : "";
  toastSup(`Pago guardado${fiscalNote}.`);
}

function deleteSupplier(id) {
  const s = findSupplier(id);
  if (!s) return;
  const linked = (suplidoresData.payments || []).filter((p) => p.supplierId === id).length;
  if (linked) {
    if (
      !confirm(
        `${s.code} · ${s.name} tiene ${linked} pago(s).\n¿Marcarlo como inactivo? (no se borran los pagos)`
      )
    ) {
      return;
    }
    s.active = false;
    s.updatedAt = new Date().toISOString();
  } else {
    if (!confirm(`¿Eliminar suplidor ${s.code} · ${s.name}?`)) return;
    suplidoresData.suppliers = suplidoresData.suppliers.filter((x) => x.id !== id);
  }
  saveSuplidoresData(true);
  renderSuplidoresModule();
}

function deleteSupPayment(id) {
  const p = (suplidoresData.payments || []).find((x) => x.id === id);
  if (!p) return;
  if (!confirm(`¿Eliminar pago de ${p.supplierName} · ${moneySup(p.amount)}?`)) return;
  removeFiscalLinkForPayment(p);
  suplidoresData.payments = suplidoresData.payments.filter((x) => x.id !== id);
  saveSuplidoresData(true);
  renderSuplidoresModule();
  toastSup("Pago eliminado.");
}

function paymentEvidenceSrc(p) {
  return (p && (p.evidencePhoto || p.evidencePhotoUrl)) || "";
}

function renderSuppliersList() {
  const host = document.getElementById("supSupplierList");
  if (!host) return;
  const rows = [...(suplidoresData.suppliers || [])].sort((a, b) =>
    String(a.code).localeCompare(String(b.code))
  );
  if (!rows.length) {
    host.innerHTML = `<p class="empty">Aún no hay suplidores. Registra el primero arriba.</p>`;
    return;
  }
  host.innerHTML = rows
    .map((s) => {
      const pays = (suplidoresData.payments || []).filter((p) => p.supplierId === s.id);
      const total = pays.reduce((n, p) => n + (Number(p.amount) || 0), 0);
      return `<article class="report-card">
        <h3 style="font-size:15px">${escapeSup(s.code)} · ${escapeSup(s.name)}${
          s.active === false ? ' <span class="muted">(inactivo)</span>' : ""
        }</h3>
        <p class="muted">${escapeSup(supCategoryLabel(s.category))}${
          s.phone ? ` · ${escapeSup(s.phone)}` : ""
        }${s.rnc ? ` · RNC ${escapeSup(s.rnc)}` : ""}</p>
        <p><strong>${escapeSup(moneySup(total))}</strong> <span class="muted">· ${pays.length} pago(s)</span></p>
        ${s.notes ? `<p class="muted tight">${escapeSup(s.notes)}</p>` : ""}
        <div class="row-actions" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">
          <button type="button" class="btn secondary btn-sup-edit" data-id="${escapeSup(
            s.id
          )}" style="width:auto;padding:8px 12px;font-size:12px">Editar</button>
          <button type="button" class="btn danger btn-sup-del" data-id="${escapeSup(
            s.id
          )}" style="width:auto;padding:8px 12px;font-size:12px">${
            s.active === false ? "Quitar" : "Inactivar / eliminar"
          }</button>
        </div>
      </article>`;
    })
    .join("");
  host.querySelectorAll(".btn-sup-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const s = findSupplier(btn.dataset.id);
      if (!s) return;
      fillSupplierForm(s);
      setSuplidoresTab("suplidores");
      document.getElementById("supSupplierName")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  host.querySelectorAll(".btn-sup-del").forEach((btn) => {
    btn.addEventListener("click", () => deleteSupplier(btn.dataset.id));
  });
}

function renderPaymentsList() {
  const host = document.getElementById("supPaymentList");
  if (!host) return;
  const rows = [...(suplidoresData.payments || [])].sort((a, b) =>
    String(b.date || "").localeCompare(String(a.date || ""))
  );
  if (!rows.length) {
    host.innerHTML = `<p class="empty">Sin pagos registrados.</p>`;
    return;
  }
  host.innerHTML = rows
    .slice(0, 80)
    .map((p) => {
      const evid = paymentEvidenceSrc(p);
      const fiscal = p.hasFiscal
        ? `<span class="muted"> · NCF ${escapeSup(p.ncf)}${
            p.fiscalExpenseId ? " · en Contabilidad" : ""
          }</span>`
        : `<span class="muted"> · sin NCF</span>`;
      return `<article class="report-card">
        <h3 style="font-size:15px">${escapeSup(p.date)} · ${escapeSup(p.supplierCode)} ${escapeSup(
        p.supplierName
      )}</h3>
        <p class="muted">${escapeSup(supCategoryLabel(p.category))}${fiscal}</p>
        <p><strong>${escapeSup(moneySup(p.amount))}</strong></p>
        <p>${escapeSup(p.concept)}</p>
        ${
          p.evidenceText
            ? `<p class="muted tight">Evidencia: ${escapeSup(p.evidenceText)}</p>`
            : ""
        }
        ${
          evid
            ? `<p style="margin-top:8px"><img src="${evid}" alt="Evidencia" style="max-width:100%;max-height:160px;border-radius:8px;border:1px solid #ccc" /></p>`
            : ""
        }
        <div class="row-actions" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">
          <button type="button" class="btn secondary btn-spay-edit" data-id="${escapeSup(
            p.id
          )}" style="width:auto;padding:8px 12px;font-size:12px">Editar</button>
          <button type="button" class="btn danger btn-spay-del" data-id="${escapeSup(
            p.id
          )}" style="width:auto;padding:8px 12px;font-size:12px">Eliminar</button>
        </div>
      </article>`;
    })
    .join("");
  host.querySelectorAll(".btn-spay-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = (suplidoresData.payments || []).find((x) => x.id === btn.dataset.id);
      if (!p) return;
      fillPaymentForm(p);
      setSuplidoresTab("pagos");
      document.getElementById("supPayAmount")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  host.querySelectorAll(".btn-spay-del").forEach((btn) => {
    btn.addEventListener("click", () => deleteSupPayment(btn.dataset.id));
  });
}

function paymentsInRange(from, to) {
  return (suplidoresData.payments || []).filter((p) => p.date >= from && p.date <= to);
}

function yearRange(y) {
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

function monthRange(ym) {
  const [y, m] = String(ym || "").split("-").map(Number);
  if (!y || !m) return { from: "1970-01-01", to: "1970-01-01" };
  const last = new Date(y, m, 0).getDate();
  return { from: `${ym}-01`, to: `${ym}-${String(last).padStart(2, "0")}` };
}

function renderSupTotales() {
  const host = document.getElementById("supTotalesBox");
  if (!host) return;
  const today = new Date();
  const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const year = String(today.getFullYear());
  let week;
  if (typeof weekRangeFromPivot === "function") {
    week = weekRangeFromPivot(today.toISOString().slice(0, 10));
  } else {
    week = { from: today.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
  }
  const monthSel = document.getElementById("supTotalesMonth")?.value || ym;
  const yearSel = document.getElementById("supTotalesYear")?.value || year;

  const weekPays = paymentsInRange(week.from, week.to);
  const monthPays = paymentsInRange(monthRange(monthSel).from, monthRange(monthSel).to);
  const yearPays = paymentsInRange(yearRange(yearSel).from, yearRange(yearSel).to);

  function byCat(list) {
    const map = new Map();
    SUP_CATEGORIES.forEach((c) => map.set(c.id, 0));
    list.forEach((p) => {
      const k = p.category || "otros";
      map.set(k, (map.get(k) || 0) + (Number(p.amount) || 0));
    });
    return [...map.entries()]
      .filter(([, v]) => v > 0)
      .map(
        ([k, v]) =>
          `<div class="stat-box"><span class="muted">${escapeSup(supCategoryLabel(k))}</span><strong>${escapeSup(
            moneySup(v)
          )}</strong></div>`
      )
      .join("");
  }

  const sum = (list) => list.reduce((n, p) => n + (Number(p.amount) || 0), 0);

  host.innerHTML = `
    <div class="form-card finance-total">
      <p class="muted">Semana ${escapeSup(week.from)} → ${escapeSup(week.to)}</p>
      <div class="money-big">${escapeSup(moneySup(sum(weekPays)))}</div>
      <p class="muted">${weekPays.length} pago(s)</p>
      <div class="stats-grid" style="margin-top:10px">${byCat(weekPays) || "<p class='muted'>Sin movimientos</p>"}</div>
    </div>
    <div class="form-card finance-total">
      <p class="muted">Mes seleccionado</p>
      <div class="money-big">${escapeSup(moneySup(sum(monthPays)))}</div>
      <p class="muted">${monthPays.length} pago(s)</p>
      <div class="stats-grid" style="margin-top:10px">${byCat(monthPays) || "<p class='muted'>Sin movimientos</p>"}</div>
    </div>
    <div class="form-card finance-total">
      <p class="muted">Año ${escapeSup(yearSel)}</p>
      <div class="money-big">${escapeSup(moneySup(sum(yearPays)))}</div>
      <p class="muted">${yearPays.length} pago(s)</p>
      <div class="stats-grid" style="margin-top:10px">${byCat(yearPays) || "<p class='muted'>Sin movimientos</p>"}</div>
    </div>`;
}

function renderSuplidoresModule() {
  if (!canAccessSuplidores()) return;
  fillCategorySelects();
  fillSupplierSelect();
  const summary = document.getElementById("suplidoresSummary");
  if (summary) {
    const nSup = (suplidoresData.suppliers || []).filter((s) => s.active !== false).length;
    const nPay = (suplidoresData.payments || []).length;
    const total = (suplidoresData.payments || []).reduce((n, p) => n + (Number(p.amount) || 0), 0);
    summary.textContent = `${nSup} suplidor(es) · ${nPay} pago(s) · ${moneySup(total)}`;
  }
  if (suplidoresTab === "pagos") renderPaymentsList();
  else if (suplidoresTab === "suplidores") renderSuppliersList();
  else if (suplidoresTab === "totales") renderSupTotales();
}

async function onSupEvidenceFile(file) {
  if (!file) return;
  try {
    if (typeof compressImage === "function") {
      pendingSupEvidencePhoto = await compressImage(file, 1100, 0.68);
    } else if (typeof readFileAsDataUrl === "function") {
      pendingSupEvidencePhoto = await readFileAsDataUrl(file);
    } else {
      pendingSupEvidencePhoto = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
    }
    const wrap = document.getElementById("supPayEvidencePreviewWrap");
    const img = document.getElementById("supPayEvidencePreview");
    if (wrap && img && pendingSupEvidencePhoto) {
      img.src = pendingSupEvidencePhoto;
      wrap.hidden = false;
    }
  } catch (_) {
    toastSup("No se pudo leer la imagen.");
  }
}

function bindSuplidoresUi() {
  document.querySelectorAll(".sup-tabs .emp-tab").forEach((btn) => {
    btn.addEventListener("click", () => setSuplidoresTab(btn.dataset.supTab));
  });
  document.getElementById("btnSupSupplierSave")?.addEventListener("click", saveSupplierFromForm);
  document.getElementById("btnSupSupplierClear")?.addEventListener("click", clearSupplierForm);
  document.getElementById("btnSupPaySave")?.addEventListener("click", () => {
    savePaymentFromForm().catch(() => toastSup("Error al guardar el pago."));
  });
  document.getElementById("btnSupPayClear")?.addEventListener("click", clearPaymentForm);
  document.getElementById("supPaySupplier")?.addEventListener("change", onSupplierSelectChange);
  document.getElementById("supPayHasFiscal")?.addEventListener("change", toggleFiscalFields);
  document.getElementById("supPayAmount")?.addEventListener("input", () => {
    if (!document.getElementById("supPayHasFiscal")?.checked) return;
    const itbisEl = document.getElementById("supPayItbis");
    if (!itbisEl || (itbisEl.value && Number(itbisEl.value) > 0)) return;
    const amount = Math.max(0, Number(document.getElementById("supPayAmount")?.value) || 0);
    if (!amount) return;
    itbisEl.value = String(Math.round((amount - amount / 1.18) * 100) / 100);
  });
  document.getElementById("supPayEvidencePhoto")?.addEventListener("change", (ev) => {
    const file = ev.target.files && ev.target.files[0];
    onSupEvidenceFile(file);
  });
  document.getElementById("btnSupPayCamera")?.addEventListener("click", async () => {
    if (typeof openPcCameraCapture !== "function") {
      document.getElementById("supPayEvidencePhoto")?.click();
      return;
    }
    try {
      const dataUrl = await openPcCameraCapture({ title: "Evidencia de pago" });
      if (!dataUrl) return;
      pendingSupEvidencePhoto = dataUrl;
      const wrap = document.getElementById("supPayEvidencePreviewWrap");
      const img = document.getElementById("supPayEvidencePreview");
      if (wrap && img) {
        img.src = dataUrl;
        wrap.hidden = false;
      }
    } catch (_) {
      toastSup("No se pudo usar la cámara.");
    }
  });
  document.getElementById("btnSupClearEvidence")?.addEventListener("click", () => {
    pendingSupEvidencePhoto = "";
    const file = document.getElementById("supPayEvidencePhoto");
    if (file) file.value = "";
    const wrap = document.getElementById("supPayEvidencePreviewWrap");
    const img = document.getElementById("supPayEvidencePreview");
    if (wrap) wrap.hidden = true;
    if (img) img.src = "";
  });
  document.getElementById("supTotalesMonth")?.addEventListener("change", () => renderSupTotales());
  document.getElementById("supTotalesYear")?.addEventListener("change", () => renderSupTotales());

  const monthEl = document.getElementById("supTotalesMonth");
  const yearEl = document.getElementById("supTotalesYear");
  const now = new Date();
  if (monthEl && !monthEl.value) {
    monthEl.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  if (yearEl && !yearEl.value) yearEl.value = String(now.getFullYear());

  clearPaymentForm();
  clearSupplierForm();
}
