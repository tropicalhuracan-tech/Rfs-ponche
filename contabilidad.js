/* ==== MÓDULO CONTABILIDAD (DGII / NÓMINA OFICINA) ==== */
const CONTABILIDAD_KEY = "rfs-ops-contabilidad";
const ITBIS_RATE = 0.18;

let contabilidadData = emptyContabilidadData();
let contabTab = "gastos";
let selectedContabExpenseId = "";
let selectedOfficeEmpId = "";
let selectedPayrollId = "";

function emptyContabilidadData() {
  return {
    expenses: [],
    itbisCollected: [],
    officeEmployees: [],
    payrolls: [],
    settings: { defaultBook: "EDWARD" },
  };
}

function moneyRd(n) {
  const v = Number(n) || 0;
  return `RD$ ${v.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthKeyFromDate(isoDate) {
  const s = String(isoDate || "").slice(0, 7);
  return /^\d{4}-\d{2}$/.test(s) ? s : "";
}

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(ym) {
  if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return "—";
  const [y, m] = ym.split("-").map(Number);
  const names = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return `${names[m - 1] || m} ${y}`;
}

function emptyFiscalExpense() {
  return {
    id: `cfe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    itbis: 0,
    vendor: "",
    ncf: "",
    rnc: "",
    book: "EDWARD",
    note: "",
    createdBy: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeFiscalExpense(e = {}) {
  const amount = Math.max(0, Number(e.amount) || 0);
  let itbis = Math.max(0, Number(e.itbis) || 0);
  if (!itbis && amount > 0 && e.autoItbis) {
    itbis = Math.round((amount - amount / (1 + ITBIS_RATE)) * 100) / 100;
  }
  return {
    id: e.id || `cfe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: String(e.date || "").slice(0, 10),
    amount,
    itbis,
    vendor: String(e.vendor || "").trim(),
    ncf: String(e.ncf || "").trim().toUpperCase(),
    rnc: String(e.rnc || "").replace(/\D/g, "").slice(0, 11),
    book: String(e.book || "EDWARD").trim() || "EDWARD",
    note: String(e.note || "").trim(),
    createdBy: e.createdBy || "",
    createdAt: e.createdAt || new Date().toISOString(),
    updatedAt: e.updatedAt || new Date().toISOString(),
  };
}

function emptyItbisCollected() {
  return {
    id: `itc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString().slice(0, 10),
    client: "",
    invoiceRef: "",
    baseAmount: 0,
    itbis: 0,
    totalAmount: 0,
    note: "",
    createdBy: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeItbisCollected(r = {}) {
  let base = Math.max(0, Number(r.baseAmount) || 0);
  let itbis = Math.max(0, Number(r.itbis) || 0);
  let total = Math.max(0, Number(r.totalAmount) || 0);
  if (base > 0 && !itbis) itbis = Math.round(base * ITBIS_RATE * 100) / 100;
  if (base > 0 && !total) total = Math.round((base + itbis) * 100) / 100;
  if (total > 0 && !base && !itbis) {
    base = Math.round((total / (1 + ITBIS_RATE)) * 100) / 100;
    itbis = Math.round((total - base) * 100) / 100;
  }
  return {
    id: r.id || `itc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: String(r.date || "").slice(0, 10),
    client: String(r.client || "").trim(),
    invoiceRef: String(r.invoiceRef || "").trim(),
    baseAmount: base,
    itbis,
    totalAmount: total,
    note: String(r.note || "").trim(),
    createdBy: r.createdBy || "",
    createdAt: r.createdAt || new Date().toISOString(),
    updatedAt: r.updatedAt || new Date().toISOString(),
  };
}

function emptyOfficeEmployee() {
  return {
    id: `oemp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fullName: "",
    cedula: "",
    position: "",
    phone: "",
    email: "",
    bankAccount: "",
    bankName: "",
    salary: 0,
    active: true,
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeOfficeEmployee(e = {}) {
  return {
    id: e.id || `oemp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fullName: String(e.fullName || "").trim(),
    cedula: String(e.cedula || "").replace(/\D/g, "").slice(0, 11),
    position: String(e.position || "").trim(),
    phone: String(e.phone || "").trim(),
    email: String(e.email || "").trim(),
    bankAccount: String(e.bankAccount || "").trim(),
    bankName: String(e.bankName || "").trim(),
    salary: Math.max(0, Number(e.salary) || 0),
    active: e.active !== false,
    notes: String(e.notes || "").trim(),
    createdAt: e.createdAt || new Date().toISOString(),
    updatedAt: e.updatedAt || new Date().toISOString(),
  };
}

function emptyPayroll() {
  return {
    id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    period: currentMonthKey(),
    payDate: "",
    status: "draft",
    lines: [],
    note: "",
    createdBy: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizePayrollLine(l = {}) {
  const salary = Math.max(0, Number(l.salary) || 0);
  const other = Number(l.other) || 0;
  const deductions = Math.max(0, Number(l.deductions) || 0);
  const net = Math.max(0, salary + other - deductions);
  return {
    employeeId: l.employeeId || "",
    fullName: String(l.fullName || "").trim(),
    position: String(l.position || "").trim(),
    salary,
    other,
    deductions,
    net,
    note: String(l.note || "").trim(),
  };
}

function normalizePayroll(p = {}) {
  const period = monthKeyFromDate(p.period) || String(p.period || "").slice(0, 7);
  let payDate = String(p.payDate || "").slice(0, 10);
  if (!payDate && /^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split("-").map(Number);
    const last = new Date(y, m, 0).getDate();
    const day = Math.min(30, last);
    payDate = `${period}-${String(day).padStart(2, "0")}`;
  }
  const status = ["draft", "paid", "cancelled"].includes(p.status) ? p.status : "draft";
  return {
    id: p.id || `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    period: period || currentMonthKey(),
    payDate,
    status,
    lines: Array.isArray(p.lines) ? p.lines.map(normalizePayrollLine) : [],
    note: String(p.note || "").trim(),
    createdBy: p.createdBy || "",
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  };
}

function normalizeContabilidadData(raw = {}) {
  return {
    expenses: Array.isArray(raw.expenses) ? raw.expenses.map(normalizeFiscalExpense) : [],
    itbisCollected: Array.isArray(raw.itbisCollected)
      ? raw.itbisCollected.map(normalizeItbisCollected)
      : [],
    officeEmployees: Array.isArray(raw.officeEmployees)
      ? raw.officeEmployees.map(normalizeOfficeEmployee)
      : [],
    payrolls: Array.isArray(raw.payrolls) ? raw.payrolls.map(normalizePayroll) : [],
    settings: {
      defaultBook: String((raw.settings && raw.settings.defaultBook) || "EDWARD").trim() || "EDWARD",
    },
  };
}

function saveContabilidadData(push = true) {
  contabilidadData = normalizeContabilidadData(contabilidadData);
  localStorage.setItem(CONTABILIDAD_KEY, JSON.stringify(contabilidadData));
  if (push && typeof queueCloudSave === "function") queueCloudSave();
}

function applyRemoteContabilidadData(remote) {
  const remoteNorm = normalizeContabilidadData(remote || {});
  const local = normalizeContabilidadData(contabilidadData);

  function mergeById(a, b) {
    const map = new Map();
    [...a, ...b].forEach((row) => {
      if (!row || !row.id) return;
      const prev = map.get(row.id);
      if (!prev || String(row.updatedAt) > String(prev.updatedAt)) map.set(row.id, row);
    });
    return [...map.values()].sort((x, y) => String(y.updatedAt).localeCompare(String(x.updatedAt)));
  }

  contabilidadData = {
    expenses: mergeById(local.expenses, remoteNorm.expenses),
    itbisCollected: mergeById(local.itbisCollected, remoteNorm.itbisCollected),
    officeEmployees: mergeById(local.officeEmployees, remoteNorm.officeEmployees),
    payrolls: mergeById(local.payrolls, remoteNorm.payrolls),
    settings: {
      defaultBook: remoteNorm.settings.defaultBook || local.settings.defaultBook || "EDWARD",
    },
  };
  localStorage.setItem(CONTABILIDAD_KEY, JSON.stringify(contabilidadData));
}

function canAccessContabilidad() {
  if (!currentUser) return false;
  if (currentUser.role === "owner") return true;
  return !!(currentUser.modules && currentUser.modules.contabilidad);
}

function setContabTab(tab) {
  contabTab = tab || "gastos";
  document.querySelectorAll(".contab-tabs .emp-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.contabTab === contabTab);
  });
  const map = {
    gastos: "contabTabGastos",
    itbis: "contabTabItbis",
    liquidacion: "contabTabLiquidacion",
    oficina: "contabTabOficina",
    nomina: "contabTabNomina",
  };
  Object.entries(map).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.hidden = contabTab !== key;
  });
  renderContabilidadModule();
}

function getSelectedMonth() {
  const el = document.getElementById("contabMonthFilter");
  const v = el && el.value;
  return monthKeyFromDate(v) || currentMonthKey();
}

function ensureMonthFilter() {
  const el = document.getElementById("contabMonthFilter");
  if (!el) return;
  if (!el.value) el.value = currentMonthKey();
}

function filterByMonth(rows, dateField = "date") {
  const ym = getSelectedMonth();
  return (rows || []).filter((r) => monthKeyFromDate(r[dateField]) === ym);
}

function sumField(rows, field) {
  return (rows || []).reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
}

function fillExpenseForm(e) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val == null ? "" : val;
  };
  set("cfeDate", e.date || "");
  set("cfeAmount", e.amount ? String(e.amount) : "");
  set("cfeItbis", e.itbis ? String(e.itbis) : "");
  set("cfeVendor", e.vendor || "");
  set("cfeNcf", e.ncf || "");
  set("cfeRnc", e.rnc || "");
  set("cfeBook", e.book || "EDWARD");
  set("cfeNote", e.note || "");
  const title = document.getElementById("cfeFormTitle");
  if (title) title.textContent = e.id && selectedContabExpenseId ? "Editar gasto fiscal" : "Nuevo gasto fiscal";
}

function clearExpenseForm() {
  selectedContabExpenseId = "";
  fillExpenseForm({
    ...emptyFiscalExpense(),
    book: (contabilidadData.settings && contabilidadData.settings.defaultBook) || "EDWARD",
  });
}

function readExpenseForm() {
  const amount = Math.max(0, Number(document.getElementById("cfeAmount")?.value) || 0);
  let itbis = Math.max(0, Number(document.getElementById("cfeItbis")?.value) || 0);
  if (!itbis && amount > 0) {
    itbis = Math.round((amount - amount / (1 + ITBIS_RATE)) * 100) / 100;
  }
  return normalizeFiscalExpense({
    id: selectedContabExpenseId || undefined,
    date: document.getElementById("cfeDate")?.value || "",
    amount,
    itbis,
    vendor: document.getElementById("cfeVendor")?.value || "",
    ncf: document.getElementById("cfeNcf")?.value || "",
    rnc: document.getElementById("cfeRnc")?.value || "",
    book: document.getElementById("cfeBook")?.value || "EDWARD",
    note: document.getElementById("cfeNote")?.value || "",
  });
}

function saveExpenseFromForm() {
  if (!canAccessContabilidad()) {
    toast("No tienes acceso a Contabilidad.");
    return;
  }
  const row = readExpenseForm();
  if (!row.date) {
    toast("Indica la fecha.");
    return;
  }
  if (!row.amount) {
    toast("Indica el monto.");
    return;
  }
  if (!row.vendor) {
    toast("Indica el nombre comercial.");
    return;
  }
  if (!row.ncf) {
    toast("Indica el NCF.");
    return;
  }
  row.updatedAt = new Date().toISOString();
  if (selectedContabExpenseId) {
    const idx = contabilidadData.expenses.findIndex((x) => x.id === selectedContabExpenseId);
    if (idx >= 0) {
      row.id = selectedContabExpenseId;
      row.createdAt = contabilidadData.expenses[idx].createdAt;
      row.createdBy = contabilidadData.expenses[idx].createdBy;
      contabilidadData.expenses[idx] = row;
    } else {
      contabilidadData.expenses.unshift(row);
    }
  } else {
    row.createdBy =
      typeof currentUser !== "undefined" && currentUser
        ? currentUser.displayName || currentUser.username
        : "";
    contabilidadData.expenses.unshift(row);
  }
  saveContabilidadData(true);
  clearExpenseForm();
  renderContabilidadModule();
  toast("Gasto fiscal guardado.");
}

function editExpense(id) {
  const row = contabilidadData.expenses.find((x) => x.id === id);
  if (!row) return;
  selectedContabExpenseId = row.id;
  fillExpenseForm(row);
  setContabTab("gastos");
  document.getElementById("cfeVendor")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function deleteExpense(id) {
  const row = contabilidadData.expenses.find((x) => x.id === id);
  if (!row) return;
  if (!confirm(`¿Eliminar gasto de ${row.vendor} · ${moneyRd(row.amount)}?`)) return;
  contabilidadData.expenses = contabilidadData.expenses.filter((x) => x.id !== id);
  if (selectedContabExpenseId === id) clearExpenseForm();
  saveContabilidadData(true);
  renderContabilidadModule();
  toast("Gasto eliminado.");
}

function renderExpensesTab() {
  const list = document.getElementById("contabExpenseList");
  const stats = document.getElementById("contabExpenseStats");
  if (!list) return;
  const rows = filterByMonth(contabilidadData.expenses).sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  );
  const totalMonto = sumField(rows, "amount");
  const totalItbis = sumField(rows, "itbis");
  if (stats) {
    stats.innerHTML = `<div class="stats-grid">
      <div class="stat-box"><span class="muted">Facturas</span><strong>${rows.length}</strong></div>
      <div class="stat-box"><span class="muted">Total monto</span><strong>${escapeHtml(moneyRd(totalMonto))}</strong></div>
      <div class="stat-box"><span class="muted">Total ITBIS</span><strong>${escapeHtml(moneyRd(totalItbis))}</strong></div>
    </div>`;
  }
  if (!rows.length) {
    list.innerHTML = `<p class="empty">No hay gastos fiscales en ${escapeHtml(monthLabel(getSelectedMonth()))}. Digita las facturas con NCF como en la relación de gastos.</p>`;
    return;
  }
  list.innerHTML = rows
    .map(
      (e) => `<article class="report-card">
      <h3>${escapeHtml(e.vendor)}</h3>
      <p class="muted">${escapeHtml(e.date)} · NCF ${escapeHtml(e.ncf || "—")} · RNC ${escapeHtml(
        e.rnc || "—"
      )}</p>
      <p><strong>${escapeHtml(moneyRd(e.amount))}</strong>
        <span class="muted"> · ITBIS ${escapeHtml(moneyRd(e.itbis))} · ${escapeHtml(e.book || "")}</span></p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <button type="button" class="btn secondary btn-cfe-edit" data-id="${escapeHtml(
          e.id
        )}" style="width:auto;padding:8px 10px;font-size:12px">Editar</button>
        <button type="button" class="btn danger btn-cfe-del" data-id="${escapeHtml(
          e.id
        )}" style="width:auto;padding:8px 10px;font-size:12px">Eliminar</button>
      </div>
    </article>`
    )
    .join("");
  list.querySelectorAll(".btn-cfe-edit").forEach((btn) =>
    btn.addEventListener("click", () => editExpense(btn.dataset.id))
  );
  list.querySelectorAll(".btn-cfe-del").forEach((btn) =>
    btn.addEventListener("click", () => deleteExpense(btn.dataset.id))
  );
}

function clearItbisForm() {
  document.getElementById("itcDate").value = new Date().toISOString().slice(0, 10);
  document.getElementById("itcClient").value = "";
  document.getElementById("itcInvoice").value = "";
  document.getElementById("itcBase").value = "";
  document.getElementById("itcItbis").value = "";
  document.getElementById("itcTotal").value = "";
  document.getElementById("itcNote").value = "";
}

function saveItbisFromForm() {
  if (!canAccessContabilidad()) {
    toast("No tienes acceso a Contabilidad.");
    return;
  }
  const base = Math.max(0, Number(document.getElementById("itcBase")?.value) || 0);
  let itbis = Math.max(0, Number(document.getElementById("itcItbis")?.value) || 0);
  let total = Math.max(0, Number(document.getElementById("itcTotal")?.value) || 0);
  if (base > 0 && !itbis) itbis = Math.round(base * ITBIS_RATE * 100) / 100;
  if (base > 0 && !total) total = Math.round((base + itbis) * 100) / 100;
  if (!itbis && total > 0) {
    const b = Math.round((total / (1 + ITBIS_RATE)) * 100) / 100;
    itbis = Math.round((total - b) * 100) / 100;
  }
  const row = normalizeItbisCollected({
    date: document.getElementById("itcDate")?.value || "",
    client: document.getElementById("itcClient")?.value || "",
    invoiceRef: document.getElementById("itcInvoice")?.value || "",
    baseAmount: base,
    itbis,
    totalAmount: total,
    note: document.getElementById("itcNote")?.value || "",
    createdBy:
      typeof currentUser !== "undefined" && currentUser
        ? currentUser.displayName || currentUser.username
        : "",
  });
  if (!row.date) {
    toast("Indica la fecha.");
    return;
  }
  if (!row.itbis) {
    toast("Indica el ITBIS cobrado (o la base / total de la factura).");
    return;
  }
  contabilidadData.itbisCollected.unshift(row);
  saveContabilidadData(true);
  clearItbisForm();
  renderContabilidadModule();
  toast("ITBIS cobrado registrado.");
}

function deleteItbisCollected(id) {
  const row = contabilidadData.itbisCollected.find((x) => x.id === id);
  if (!row) return;
  if (!confirm(`¿Eliminar ITBIS de ${row.client || "cliente"} · ${moneyRd(row.itbis)}?`)) return;
  contabilidadData.itbisCollected = contabilidadData.itbisCollected.filter((x) => x.id !== id);
  saveContabilidadData(true);
  renderContabilidadModule();
  toast("Registro eliminado.");
}

function renderItbisTab() {
  const list = document.getElementById("contabItbisList");
  const stats = document.getElementById("contabItbisStats");
  if (!list) return;
  const rows = filterByMonth(contabilidadData.itbisCollected).sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  );
  const totalItbis = sumField(rows, "itbis");
  const totalFact = sumField(rows, "totalAmount");
  if (stats) {
    stats.innerHTML = `<div class="stats-grid">
      <div class="stat-box"><span class="muted">Cobros</span><strong>${rows.length}</strong></div>
      <div class="stat-box"><span class="muted">ITBIS cobrado</span><strong>${escapeHtml(moneyRd(totalItbis))}</strong></div>
      <div class="stat-box"><span class="muted">Total facturado</span><strong>${escapeHtml(moneyRd(totalFact))}</strong></div>
    </div>`;
  }
  if (!rows.length) {
    list.innerHTML = `<p class="empty">Aún no hay ITBIS cobrado en ${escapeHtml(
      monthLabel(getSelectedMonth())
    )}. Cuando cobras una factura, registra aquí el 18%.</p>`;
    return;
  }
  list.innerHTML = rows
    .map(
      (r) => `<article class="report-card">
      <h3>${escapeHtml(r.client || "Cliente")}</h3>
      <p class="muted">${escapeHtml(r.date)}${r.invoiceRef ? ` · Factura ${escapeHtml(r.invoiceRef)}` : ""}</p>
      <p><strong>ITBIS ${escapeHtml(moneyRd(r.itbis))}</strong>
        <span class="muted"> · Base ${escapeHtml(moneyRd(r.baseAmount))} · Total ${escapeHtml(
        moneyRd(r.totalAmount)
      )}</span></p>
      <button type="button" class="btn danger btn-itc-del" data-id="${escapeHtml(
        r.id
      )}" style="width:auto;padding:8px 10px;font-size:12px;margin-top:8px">Eliminar</button>
    </article>`
    )
    .join("");
  list.querySelectorAll(".btn-itc-del").forEach((btn) =>
    btn.addEventListener("click", () => deleteItbisCollected(btn.dataset.id))
  );
}

function renderLiquidacionTab() {
  const box = document.getElementById("contabLiquidacionBox");
  if (!box) return;
  const ym = getSelectedMonth();
  const gastos = filterByMonth(contabilidadData.expenses);
  const cobros = filterByMonth(contabilidadData.itbisCollected);
  const itbisCompras = sumField(gastos, "itbis");
  const itbisVentas = sumField(cobros, "itbis");
  const aPagar = Math.round((itbisVentas - itbisCompras) * 100) / 100;
  const verb =
    aPagar > 0
      ? `A pagar a DGII: ${moneyRd(aPagar)}`
      : aPagar < 0
        ? `Saldo a favor / crédito: ${moneyRd(Math.abs(aPagar))}`
        : "Liquidación en cero";
  box.innerHTML = `
    <p class="muted">Mes: <strong>${escapeHtml(monthLabel(ym))}</strong></p>
    <div class="stats-grid" style="margin-top:10px">
      <div class="stat-box"><span class="muted">ITBIS cobrado (ventas)</span><strong>${escapeHtml(
        moneyRd(itbisVentas)
      )}</strong></div>
      <div class="stat-box"><span class="muted">ITBIS en compras (crédito)</span><strong>${escapeHtml(
        moneyRd(itbisCompras)
      )}</strong></div>
    </div>
    <div class="form-card finance-total" style="margin-top:12px">
      <p class="muted">ITBIS cobrado − ITBIS de gastos con NCF</p>
      <div class="money-big">${escapeHtml(verb)}</div>
      <p class="muted tight" style="margin-top:10px">Fórmula: impuestos que te pagaron los clientes menos el ITBIS de las facturas de compra con comprobante fiscal.</p>
    </div>
    <p class="muted tight" style="margin-top:12px">${gastos.length} factura(s) de gasto · ${
      cobros.length
    } cobro(s) de ITBIS</p>`;
}

function fillOfficeEmpForm(e) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === "checkbox") el.checked = !!val;
    else el.value = val == null ? "" : val;
  };
  set("oempName", e.fullName || "");
  set("oempCedula", e.cedula || "");
  set("oempPosition", e.position || "");
  set("oempPhone", e.phone || "");
  set("oempEmail", e.email || "");
  set("oempSalary", e.salary ? String(e.salary) : "");
  set("oempBank", e.bankName || "");
  set("oempAccount", e.bankAccount || "");
  set("oempNotes", e.notes || "");
  set("oempActive", e.active !== false);
  const title = document.getElementById("oempFormTitle");
  if (title) title.textContent = selectedOfficeEmpId ? "Editar empleado de oficina" : "Nuevo empleado de oficina";
}

function clearOfficeEmpForm() {
  selectedOfficeEmpId = "";
  fillOfficeEmpForm(emptyOfficeEmployee());
}

function saveOfficeEmpFromForm() {
  if (!canAccessContabilidad()) {
    toast("No tienes acceso a Contabilidad.");
    return;
  }
  const row = normalizeOfficeEmployee({
    id: selectedOfficeEmpId || undefined,
    fullName: document.getElementById("oempName")?.value || "",
    cedula: document.getElementById("oempCedula")?.value || "",
    position: document.getElementById("oempPosition")?.value || "",
    phone: document.getElementById("oempPhone")?.value || "",
    email: document.getElementById("oempEmail")?.value || "",
    salary: document.getElementById("oempSalary")?.value || 0,
    bankName: document.getElementById("oempBank")?.value || "",
    bankAccount: document.getElementById("oempAccount")?.value || "",
    notes: document.getElementById("oempNotes")?.value || "",
    active: !!document.getElementById("oempActive")?.checked,
  });
  if (!row.fullName) {
    toast("Escribe el nombre del empleado.");
    return;
  }
  row.updatedAt = new Date().toISOString();
  if (selectedOfficeEmpId) {
    const idx = contabilidadData.officeEmployees.findIndex((x) => x.id === selectedOfficeEmpId);
    if (idx >= 0) {
      row.createdAt = contabilidadData.officeEmployees[idx].createdAt;
      contabilidadData.officeEmployees[idx] = row;
    } else contabilidadData.officeEmployees.unshift(row);
  } else {
    contabilidadData.officeEmployees.unshift(row);
  }
  saveContabilidadData(true);
  clearOfficeEmpForm();
  renderContabilidadModule();
  toast("Empleado de oficina guardado.");
}

function editOfficeEmp(id) {
  const row = contabilidadData.officeEmployees.find((x) => x.id === id);
  if (!row) return;
  selectedOfficeEmpId = row.id;
  fillOfficeEmpForm(row);
  setContabTab("oficina");
}

function deleteOfficeEmp(id) {
  const row = contabilidadData.officeEmployees.find((x) => x.id === id);
  if (!row) return;
  if (!confirm(`¿Eliminar a ${row.fullName} de la lista de oficina?`)) return;
  contabilidadData.officeEmployees = contabilidadData.officeEmployees.filter((x) => x.id !== id);
  if (selectedOfficeEmpId === id) clearOfficeEmpForm();
  saveContabilidadData(true);
  renderContabilidadModule();
  toast("Empleado eliminado de oficina.");
}

function renderOficinaTab() {
  const list = document.getElementById("contabOfficeList");
  if (!list) return;
  const rows = (contabilidadData.officeEmployees || []).slice().sort((a, b) =>
    String(a.fullName).localeCompare(String(b.fullName), "es")
  );
  if (!rows.length) {
    list.innerHTML = `<p class="empty">Todavía no hay empleados de oficina. Crea la lista aquí; luego armamos la nómina del día 30.</p>`;
    return;
  }
  list.innerHTML = rows
    .map(
      (e) => `<article class="report-card">
      <h3>${escapeHtml(e.fullName)}${e.active ? "" : ' <span class="muted">(inactivo)</span>'}</h3>
      <p class="muted">${escapeHtml(e.position || "Sin cargo")}${
        e.cedula ? ` · ${escapeHtml(e.cedula)}` : ""
      }</p>
      <p><strong>${escapeHtml(moneyRd(e.salary))}</strong>
        <span class="muted">${e.phone ? ` · ${escapeHtml(e.phone)}` : ""}</span></p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <button type="button" class="btn secondary btn-oemp-edit" data-id="${escapeHtml(
          e.id
        )}" style="width:auto;padding:8px 10px;font-size:12px">Editar</button>
        <button type="button" class="btn danger btn-oemp-del" data-id="${escapeHtml(
          e.id
        )}" style="width:auto;padding:8px 10px;font-size:12px">Eliminar</button>
      </div>
    </article>`
    )
    .join("");
  list.querySelectorAll(".btn-oemp-edit").forEach((btn) =>
    btn.addEventListener("click", () => editOfficeEmp(btn.dataset.id))
  );
  list.querySelectorAll(".btn-oemp-del").forEach((btn) =>
    btn.addEventListener("click", () => deleteOfficeEmp(btn.dataset.id))
  );
}

function generateOfficePayroll() {
  if (!canAccessContabilidad()) {
    toast("No tienes acceso a Contabilidad.");
    return;
  }
  const period = getSelectedMonth();
  const active = (contabilidadData.officeEmployees || []).filter((e) => e.active);
  if (!active.length) {
    toast("Primero agrega empleados de oficina activos.");
    return;
  }
  const existing = contabilidadData.payrolls.find((p) => p.period === period && p.status !== "cancelled");
  if (existing && !confirm(`Ya hay nómina de ${monthLabel(period)}. ¿Reemplazar el borrador?`)) {
    return;
  }
  const [y, m] = period.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  const payDay = Math.min(30, last);
  const payDate = `${period}-${String(payDay).padStart(2, "0")}`;
  const lines = active.map((e) =>
    normalizePayrollLine({
      employeeId: e.id,
      fullName: e.fullName,
      position: e.position,
      salary: e.salary,
      other: 0,
      deductions: 0,
      net: e.salary,
    })
  );
  const payroll = normalizePayroll({
    id: existing && existing.status === "draft" ? existing.id : undefined,
    period,
    payDate,
    status: "draft",
    lines,
    note: "Nómina oficina · pago día 30",
    createdBy:
      typeof currentUser !== "undefined" && currentUser
        ? currentUser.displayName || currentUser.username
        : "",
  });
  if (existing && existing.status === "draft") {
    const idx = contabilidadData.payrolls.findIndex((p) => p.id === existing.id);
    payroll.createdAt = existing.createdAt;
    contabilidadData.payrolls[idx] = payroll;
  } else {
    contabilidadData.payrolls.unshift(payroll);
  }
  selectedPayrollId = payroll.id;
  saveContabilidadData(true);
  setContabTab("nomina");
  toast(`Nómina ${monthLabel(period)} lista (pago ${payDate}).`);
}

function markPayrollPaid(id) {
  const p = contabilidadData.payrolls.find((x) => x.id === id);
  if (!p) return;
  p.status = "paid";
  p.updatedAt = new Date().toISOString();
  saveContabilidadData(true);
  renderContabilidadModule();
  toast("Nómina marcada como pagada.");
}

function deletePayroll(id) {
  const p = contabilidadData.payrolls.find((x) => x.id === id);
  if (!p) return;
  if (!confirm(`¿Eliminar nómina de ${monthLabel(p.period)}?`)) return;
  contabilidadData.payrolls = contabilidadData.payrolls.filter((x) => x.id !== id);
  if (selectedPayrollId === id) selectedPayrollId = "";
  saveContabilidadData(true);
  renderContabilidadModule();
  toast("Nómina eliminada.");
}

function renderNominaTab() {
  const list = document.getElementById("contabPayrollList");
  const detail = document.getElementById("contabPayrollDetail");
  if (!list) return;
  const rows = (contabilidadData.payrolls || [])
    .slice()
    .sort((a, b) => String(b.period).localeCompare(String(a.period)));
  if (!rows.length) {
    list.innerHTML = `<p class="empty">No hay nóminas aún. Con la lista de oficina, genera la del mes (pago día 30). Cuando envíes el formato completo, lo afinamos.</p>`;
  } else {
    list.innerHTML = rows
      .map((p) => {
        const total = sumField(p.lines, "net");
        const st = p.status === "paid" ? "Pagada" : p.status === "cancelled" ? "Cancelada" : "Borrador";
        return `<article class="report-card">
          <h3>Nómina ${escapeHtml(monthLabel(p.period))}</h3>
          <p class="muted">Pago ${escapeHtml(p.payDate || "—")} · ${escapeHtml(st)} · ${
            (p.lines || []).length
          } empleado(s)</p>
          <p><strong>${escapeHtml(moneyRd(total))}</strong></p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
            <button type="button" class="btn secondary btn-pay-open" data-id="${escapeHtml(
              p.id
            )}" style="width:auto;padding:8px 10px;font-size:12px">Ver</button>
            ${
              p.status === "draft"
                ? `<button type="button" class="btn primary btn-pay-paid" data-id="${escapeHtml(
                    p.id
                  )}" style="width:auto;padding:8px 10px;font-size:12px">Marcar pagada</button>`
                : ""
            }
            <button type="button" class="btn danger btn-pay-del" data-id="${escapeHtml(
              p.id
            )}" style="width:auto;padding:8px 10px;font-size:12px">Eliminar</button>
          </div>
        </article>`;
      })
      .join("");
    list.querySelectorAll(".btn-pay-open").forEach((btn) =>
      btn.addEventListener("click", () => {
        selectedPayrollId = btn.dataset.id;
        renderNominaTab();
      })
    );
    list.querySelectorAll(".btn-pay-paid").forEach((btn) =>
      btn.addEventListener("click", () => markPayrollPaid(btn.dataset.id))
    );
    list.querySelectorAll(".btn-pay-del").forEach((btn) =>
      btn.addEventListener("click", () => deletePayroll(btn.dataset.id))
    );
  }

  if (!detail) return;
  const p =
    contabilidadData.payrolls.find((x) => x.id === selectedPayrollId) ||
    rows.find((x) => x.period === getSelectedMonth()) ||
    rows[0];
  if (!p) {
    detail.innerHTML = "";
    return;
  }
  selectedPayrollId = p.id;
  const total = sumField(p.lines, "net");
  detail.innerHTML = `
    <h2>Detalle · ${escapeHtml(monthLabel(p.period))}</h2>
    <p class="muted">Pago programado: ${escapeHtml(p.payDate || "día 30")} · Estado: ${escapeHtml(
      p.status === "paid" ? "Pagada" : "Borrador"
    )}</p>
    <div class="card-list" style="margin-top:10px">
      ${(p.lines || [])
        .map(
          (l) => `<article class="report-card" style="padding:10px">
          <h3 style="font-size:15px;margin:0">${escapeHtml(l.fullName)}</h3>
          <p class="muted tight">${escapeHtml(l.position || "—")}</p>
          <p style="margin:6px 0 0"><strong>${escapeHtml(moneyRd(l.net))}</strong>
            <span class="muted"> · Sueldo ${escapeHtml(moneyRd(l.salary))}${
              l.deductions ? ` · Desc. ${escapeHtml(moneyRd(l.deductions))}` : ""
            }</span></p>
        </article>`
        )
        .join("")}
    </div>
    <p style="margin-top:12px"><strong>Total nómina: ${escapeHtml(moneyRd(total))}</strong></p>`;
}

function renderContabilidadModule() {
  if (!canAccessContabilidad()) return;
  ensureMonthFilter();
  const summary = document.getElementById("contabSummary");
  if (summary) {
    summary.textContent = `${monthLabel(getSelectedMonth())} · Gastos con NCF, ITBIS cobrado, liquidación DGII y nómina de oficina (día 30).`;
  }
  if (contabTab === "gastos") renderExpensesTab();
  else if (contabTab === "itbis") renderItbisTab();
  else if (contabTab === "liquidacion") renderLiquidacionTab();
  else if (contabTab === "oficina") renderOficinaTab();
  else if (contabTab === "nomina") renderNominaTab();
}

function onItbisBaseOrTotalInput() {
  const baseEl = document.getElementById("itcBase");
  const itbisEl = document.getElementById("itcItbis");
  const totalEl = document.getElementById("itcTotal");
  if (!baseEl || !itbisEl || !totalEl) return;
  const base = Math.max(0, Number(baseEl.value) || 0);
  if (base > 0 && document.activeElement === baseEl) {
    const itbis = Math.round(base * ITBIS_RATE * 100) / 100;
    itbisEl.value = String(itbis);
    totalEl.value = String(Math.round((base + itbis) * 100) / 100);
  }
}

function onExpenseAmountInput() {
  const amountEl = document.getElementById("cfeAmount");
  const itbisEl = document.getElementById("cfeItbis");
  if (!amountEl || !itbisEl) return;
  if (document.activeElement !== amountEl) return;
  const amount = Math.max(0, Number(amountEl.value) || 0);
  if (!amount) return;
  if (itbisEl.value && Number(itbisEl.value) > 0) return;
  const itbis = Math.round((amount - amount / (1 + ITBIS_RATE)) * 100) / 100;
  itbisEl.value = String(itbis);
}

function bindContabilidadUi() {
  document.querySelectorAll(".contab-tabs .emp-tab").forEach((btn) => {
    btn.addEventListener("click", () => setContabTab(btn.dataset.contabTab));
  });
  document.getElementById("contabMonthFilter")?.addEventListener("change", () => renderContabilidadModule());
  document.getElementById("btnCfeSave")?.addEventListener("click", saveExpenseFromForm);
  document.getElementById("btnCfeClear")?.addEventListener("click", clearExpenseForm);
  document.getElementById("cfeAmount")?.addEventListener("input", onExpenseAmountInput);
  document.getElementById("btnItcSave")?.addEventListener("click", saveItbisFromForm);
  document.getElementById("btnItcClear")?.addEventListener("click", clearItbisForm);
  document.getElementById("itcBase")?.addEventListener("input", onItbisBaseOrTotalInput);
  document.getElementById("btnOempSave")?.addEventListener("click", saveOfficeEmpFromForm);
  document.getElementById("btnOempClear")?.addEventListener("click", clearOfficeEmpForm);
  document.getElementById("btnContabGenPayroll")?.addEventListener("click", generateOfficePayroll);
  document.getElementById("cfeRnc")?.addEventListener("input", (e) => {
    e.target.value = String(e.target.value || "").replace(/\D/g, "").slice(0, 11);
  });
  document.getElementById("oempCedula")?.addEventListener("input", (e) => {
    e.target.value = String(e.target.value || "").replace(/\D/g, "").slice(0, 11);
  });
  clearExpenseForm();
  clearItbisForm();
  clearOfficeEmpForm();
}

/* ==== FIN CONTABILIDAD ==== */
