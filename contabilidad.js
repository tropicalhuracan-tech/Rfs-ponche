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

/** Monto sin RD$ (impresión / celdas densas) */
function moneyPlain(n) {
  const v = Number(n) || 0;
  if (!v) return "";
  return v.toLocaleString("es-DO", {
    minimumFractionDigits: Number.isInteger(v) ? 0 : 2,
    maximumFractionDigits: 2,
  });
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

const LVA_PAYROLL_DEFAULT_MONTHLY = 24000;
const LVA_PAYROLL_UNIFORMES = 115;
const LVA_PAYROLL_RIFA = 85;
const LVA_PAYROLL_SFS_RATE = 0.0591; // ~SFS/SVDS observado en nómina Excel
const LVA_PAYROLL_DAY_BASE = 26;
/** Seguro de vida (SVDA): fijo RD$ 90 La Vega. Columna Almuerzo/SVDA = comida (editable) + SVDA. */
const LVA_PAYROLL_SVDA = 90;
/** Nómina oficina: SFS fijo; quincena = sueldo mensual / 2 (días no influyen). */
const OFFICE_PAYROLL_SFS = 800;
const OFFICE_PAYROLL_RIFA = 85;

function roundMoney2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function roundTo50(n) {
  return Math.round((Number(n) || 0) / 50) * 50;
}

function parsePayrollDays(raw) {
  const s = String(raw == null ? "" : raw).trim();
  if (!s) return { label: "", days: 0, incidental: false };
  if (/^inc/i.test(s)) return { label: s || "INC", days: 0, incidental: true };
  const m = s.match(/^(\d+(?:\.\d+)?)\s*(?:\+\s*(\d+(?:\.\d+)?))?$/);
  if (!m) return { label: s, days: Math.max(0, Number(s) || 0), incidental: false };
  const a = Number(m[1]) || 0;
  const b = Number(m[2]) || 0;
  return { label: s, days: a + b, incidental: false };
}

function computePayrollLineTotals(line, opts = {}) {
  const office = !!(opts && opts.office);
  const lavega = !!(opts && opts.lavega);
  const salaryMonthly = Math.max(0, Number(line.salaryMonthly) || 0);
  const daysInfo = parsePayrollDays(line.daysWorked);
  let salaryQuincena = Math.max(0, Number(line.salaryQuincena) || 0);
  let sfs = Math.max(0, Number(line.sfs) || 0);
  let uniformes = Math.max(0, Number(line.uniformes) || 0);
  let volaos = Math.max(0, Number(line.volaos) || 0);
  let incentivos = Math.max(0, Number(line.incentivos) || 0);
  let horasExtras = Math.max(0, Number(line.horasExtras) || 0);
  let feriado = Math.max(0, Number(line.feriado) || 0);
  let almuerzo = Math.max(0, Number(line.almuerzo) || 0);
  let rifa = Math.max(0, Number(line.rifa) || 0);
  const adelantos = Math.max(0, Number(line.adelantos) || 0);
  const prestamos = Math.max(0, Number(line.prestamos) || 0);
  const hasName = !!String(line.fullName || "").trim();

  if (office) {
    // Oficina: quincena = mitad del sueldo; días no influyen. SFS fijo. Sin unif/volao/comida/feriado/extras.
    salaryQuincena = salaryMonthly ? roundMoney2(salaryMonthly / 2) : 0;
    sfs = hasName ? OFFICE_PAYROLL_SFS : 0;
    uniformes = 0;
    volaos = 0;
    horasExtras = 0;
    feriado = 0;
    almuerzo = 0;
    if (!hasName) rifa = 0;
  } else {
    if (!salaryQuincena && salaryMonthly && daysInfo.days > 0) {
      salaryQuincena = roundMoney2((salaryMonthly * daysInfo.days) / LVA_PAYROLL_DAY_BASE);
    }
    if (!sfs && salaryQuincena) sfs = roundMoney2(salaryQuincena * LVA_PAYROLL_SFS_RATE);
  }

  // La Vega: comida (almuerzo editable) + SVDA fijo 90; ambas suman en descuentos
  const svda = lavega && hasName ? LVA_PAYROLL_SVDA : 0;
  const almuerzoSvda = roundMoney2(almuerzo + svda);

  // Restan: SFS/SVDS, uniformes, almuerzo+SVDA, rifa, adelantos, descuento préstamos
  const totalDescuentos = roundMoney2(sfs + uniformes + almuerzo + svda + rifa + adelantos + prestamos);
  // Suman al quincenal: volaos, incentivos, horas extras, feriado
  const totalCobrar = roundMoney2(salaryQuincena + volaos + incentivos + horasExtras + feriado);
  const salarioDepositar = roundMoney2(Math.max(0, totalCobrar - totalDescuentos));
  const redondeo = roundTo50(salarioDepositar);
  const salary = salaryMonthly;
  const other = roundMoney2(volaos + incentivos + horasExtras + feriado);
  const deductions = totalDescuentos;
  const net = redondeo;
  return {
    ...line,
    salaryMonthly,
    salaryQuincena,
    sfs,
    uniformes,
    volaos,
    incentivos,
    horasExtras,
    feriado,
    almuerzo,
    svda,
    almuerzoSvda,
    rifa,
    adelantos,
    prestamos,
    totalDescuentos,
    totalCobrar,
    salarioDepositar,
    redondeo,
    salary,
    other,
    deductions,
    net,
    daysWorked: office ? "" : daysInfo.label || String(line.daysWorked || ""),
  };
}

function computePayrollLineTotalsForPayroll(p, line) {
  return computePayrollLineTotals(line, {
    office: payrollIsOffice(p),
    lavega: payrollIsLavega(p),
  });
}

function normalizePayrollLine(l = {}, opts = {}) {
  const office = !!(opts && opts.office);
  const lavega = !!(opts && opts.lavega);
  const base = {
    employeeId: l.employeeId || "",
    fullName: String(l.fullName || "").trim(),
    position: String(l.position || "").trim(),
    cedula: String(l.cedula || "").trim(),
    daysWorked: office
      ? ""
      : String(l.daysWorked != null ? l.daysWorked : l.days || "15").trim() || "15",
    salaryMonthly: Math.max(0, Number(l.salaryMonthly != null ? l.salaryMonthly : l.salary) || 0),
    salaryQuincena: Math.max(0, Number(l.salaryQuincena) || 0),
    sfs: Math.max(0, Number(l.sfs) || 0),
    uniformes: Math.max(0, Number(l.uniformes) || 0),
    volaos: Math.max(0, Number(l.volaos) || 0),
    incentivos: Math.max(0, Number(l.incentivos) || 0),
    horasExtras: Math.max(0, Number(l.horasExtras) || 0),
    feriado: Math.max(0, Number(l.feriado) || 0),
    almuerzo: Math.max(0, Number(l.almuerzo) || 0),
    rifa: Math.max(0, Number(l.rifa) || 0),
    adelantos: Math.max(0, Number(l.adelantos) || 0),
    prestamos: Math.max(0, Number(l.prestamos) || 0),
    totalDescuentos: Math.max(0, Number(l.totalDescuentos) || 0),
    totalCobrar: Math.max(0, Number(l.totalCobrar) || 0),
    salarioDepositar: Math.max(0, Number(l.salarioDepositar) || 0),
    redondeo: Math.max(0, Number(l.redondeo) || 0),
    salary: Math.max(0, Number(l.salary) || 0),
    other: Number(l.other) || 0,
    deductions: Math.max(0, Number(l.deductions) || 0),
    net: Math.max(0, Number(l.net) || 0),
    note: String(l.note || "").trim(),
  };
  // Si viene de nómina oficina antigua (solo salary/net), conservar
  if (!base.salaryMonthly && base.salary) base.salaryMonthly = base.salary;
  const hasExcelShape =
    base.salaryQuincena ||
    base.sfs ||
    base.uniformes ||
    base.volaos ||
    base.rifa ||
    base.totalCobrar ||
    base.salarioDepositar ||
    base.redondeo ||
    (base.daysWorked && base.salaryMonthly) ||
    (office && base.salaryMonthly);
  if (hasExcelShape || base.salaryMonthly) {
    return computePayrollLineTotals(base, { office, lavega });
  }
  const salary = base.salary || base.salaryMonthly;
  const other = base.other;
  const deductions = base.deductions;
  const net = Math.max(0, salary + other - deductions);
  return { ...base, salary, other, deductions, net, salaryMonthly: salary, redondeo: net, salarioDepositar: net };
}

function normalizePayroll(p = {}) {
  const period = monthKeyFromDate(p.period) || String(p.period || "").slice(0, 7);
  let payDate = String(p.payDate || "").slice(0, 10);
  const half = p.half === 2 || p.half === "2" ? 2 : 1;
  if (!payDate && /^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split("-").map(Number);
    const last = new Date(y, m, 0).getDate();
    const day = half === 1 ? 15 : Math.min(30, last);
    payDate = `${period}-${String(day).padStart(2, "0")}`;
  }
  const status = ["draft", "paid", "cancelled"].includes(p.status) ? p.status : "draft";
  const group = ["oficina", "lavega", "monorriel", "general"].includes(p.group)
    ? p.group
    : p.group || "lavega";
  const office = group === "oficina";
  const lavega = group === "lavega";
  return {
    id: p.id || `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    period: period || currentMonthKey(),
    half,
    group,
    payDate,
    status,
    showFeriado: office ? false : p.showFeriado === true,
    lines: Array.isArray(p.lines) ? p.lines.map((l) => normalizePayrollLine(l, { office, lavega })) : [],
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

const PAYROLL_GROUP_META = {
  lavega: { label: "La Vega Autopista", short: "La Vega", title: "LA VEGA AUTOPISTA" },
  oficina: { label: "Oficina", short: "Oficina", title: "OFICINA" },
  monorriel: { label: "Monorriel", short: "Monorriel", title: "MONORRIEL" },
  general: { label: "General / Otros", short: "General", title: "GENERAL / OTROS" },
};

function payrollGroupMeta(group) {
  return PAYROLL_GROUP_META[group] || PAYROLL_GROUP_META.lavega;
}

function getSelectedPayrollGroup() {
  const el = document.getElementById("contabPayrollGroup");
  const v = el && el.value ? String(el.value) : "lavega";
  return PAYROLL_GROUP_META[v] ? v : "lavega";
}

function getSelectedPayrollPaper() {
  const el = document.getElementById("contabPayrollPaper");
  return el && el.value === "letter" ? "letter" : "legal";
}

/** Oficina: siempre Carta horizontal (menos columnas). La Vega/otros: selector. */
function getPayrollPaperForExport(p) {
  if (payrollIsOffice(p) || getSelectedPayrollGroup() === "oficina") return "letter";
  return getSelectedPayrollPaper();
}

function syncPayrollPaperUiForGroup(group) {
  const office = group === "oficina";
  const paper = office ? "letter" : getSelectedPayrollPaper();
  const main = document.getElementById("contabPayrollPaper");
  const detail = document.getElementById("contabPayrollPaper2");
  if (main) {
    if (office) main.value = "letter";
    main.disabled = office;
    main.title = office ? "Oficina: siempre Carta horizontal (como impresión La Vega)" : "";
  }
  if (detail) {
    detail.value = main ? main.value : paper;
    detail.disabled = office;
  }
  const hint = document.getElementById("contabPayrollHint");
  if (hint) {
    hint.textContent = office
      ? `Mes: ${monthLabel(getSelectedMonth())} · Hoja Carta horizontal`
      : `Mes: ${monthLabel(getSelectedMonth())}`;
  }
}

function getLvaStaffForPayroll() {
  try {
    if (typeof lvaState === "undefined" || !lvaState) return [];
    return (lvaState.staff || [])
      .filter((s) => s && s.active !== false && String(s.name || "").trim())
      .slice()
      .sort((a, b) => String(a.name).localeCompare(String(b.name), "es"));
  } catch (_) {
    return [];
  }
}

function getOfficeStaffForPayroll() {
  return (contabilidadData.officeEmployees || [])
    .filter((e) => e && e.active !== false && String(e.fullName || "").trim())
    .slice()
    .sort((a, b) => String(a.fullName).localeCompare(String(b.fullName), "es"))
    .map((e) => ({
      id: e.id,
      employeeId: e.id,
      name: e.fullName,
      cedula: e.cedula || "",
      salaryMonthly: e.salary || 0,
      position: e.position || "Oficina",
    }));
}

function getMonorrielStaffForPayroll() {
  try {
    if (typeof getMonorrielEmployees !== "function") return [];
    return getMonorrielEmployees(false)
      .filter((e) => e && String(e.name || "").trim())
      .slice()
      .sort((a, b) => String(a.name).localeCompare(String(b.name), "es"))
      .map((e) => ({
        id: e.id,
        employeeId: e.id,
        name: e.name,
        cedula: e.cedula || "",
        salaryMonthly: e.salary || 0,
        position: e.role || e.position || "Monorriel",
      }));
  } catch (_) {
    return [];
  }
}

function getStaffForPayrollGroup(group) {
  if (group === "oficina") return getOfficeStaffForPayroll();
  if (group === "monorriel") return getMonorrielStaffForPayroll();
  if (group === "general") return [];
  return getLvaStaffForPayroll();
}

function getLvaPostLabel(staff) {
  if (!staff) return "";
  if (staff.postName) return String(staff.postName).trim();
  try {
    if (typeof getLvaPostName === "function") return getLvaPostName(staff.postId) || "";
  } catch (_) {}
  return "";
}

/** Limpia puesto / paréntesis del nombre. */
function payrollCleanEmployeeName(name) {
  return String(name || "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Un nombre + un apellido (omite segundo nombre y segundo apellido). */
function payrollShortEmployeeName(name) {
  const clean = payrollCleanEmployeeName(name);
  if (!clean) return "";
  const parts = clean.split(" ").filter(Boolean);
  if (parts.length <= 2) return parts.join(" ");
  // Un nombre + un apellido (último token = apellido a imprimir)
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function payrollIsOffice(p) {
  return !!(p && p.group === "oficina");
}

function payrollIsLavega(p) {
  if (!p) return false;
  if (p.group === "lavega") return true;
  if (!p.group && String(p.note || "").toLowerCase().includes("vega")) return true;
  return false;
}

/** Columnas editor/impresión exclusivas de nómina oficina. */
const PAYROLL_OFFICE_TABLE_COLS = [
  ["fullName", "Nombre", "name"],
  ["cedula", "Cédula", "text"],
  ["salaryMonthly", "Sueldo mes", "num"],
  ["salaryQuincena", "Quincena", "ro"],
  ["sfs", "SFS", "ro"],
  ["rifa", "Rifa", "num"],
  ["incentivos", "Incent.", "num"],
  ["adelantos", "Adelantos", "num"],
  ["prestamos", "Préstamos", "num"],
  ["totalDescuentos", "Desc.", "ro"],
  ["totalCobrar", "Cobrar", "ro"],
  ["salarioDepositar", "Depositar", "ro"],
  ["redondeo", "Redondeo", "ro"],
];

const PAYROLL_OFFICE_PRINT_COLS = [
  ["fullName", "Nombre", "name"],
  ["salaryMonthly", "Sueldo mes", "num"],
  ["salaryQuincena", "Quincena", "num"],
  ["sfs", "SFS", "num"],
  ["rifa", "Rifa", "num"],
  ["incentivos", "Incent.", "num"],
  ["adelantos", "Adelantos", "num"],
  ["prestamos", "Préstamos", "num"],
  ["totalDescuentos", "Desc.", "ro"],
  ["totalCobrar", "Cobrar", "ro"],
  ["salarioDepositar", "Depositar", "ro"],
  ["redondeo", "Redondeo", "ro"],
];

function buildPayrollLineFromPerson(person, prev, defaultPosition, options = {}) {
  const opts = options && typeof options === "object" ? options : {};
  const isOffice = !!opts.office;
  const isLavega = !!opts.lavega;
  const rawName = String(person.name || person.fullName || "").trim();
  // Oficina y La Vega: un nombre + un apellido (compacto para Carta horizontal).
  const baseName = payrollShortEmployeeName(rawName) || payrollCleanEmployeeName(rawName) || rawName;
  const post =
    person.position ||
    (person.postName ? String(person.postName).trim() : "") ||
    getLvaPostLabel(person) ||
    defaultPosition ||
    "";
  const prevLine = prev || {};
  const daysWorked = isOffice ? "" : prevLine.daysWorked || "15";
  const salaryMonthly =
    Math.max(0, Number(person.salaryMonthly) || 0) ||
    Math.max(0, Number(prevLine.salaryMonthly) || 0) ||
    (isOffice ? 0 : LVA_PAYROLL_DEFAULT_MONTHLY);
  const prevUniformes = Number(prevLine.uniformes);
  const prevRifa = Number(prevLine.rifa);
  return normalizePayrollLine(
    {
      employeeId: person.employeeId || person.id || "",
      fullName: baseName,
      position: post || defaultPosition || "",
      cedula: person.cedula || prevLine.cedula || "",
      daysWorked,
      salaryMonthly,
      salaryQuincena: 0,
      sfs: isOffice ? OFFICE_PAYROLL_SFS : prevLine.sfs || 0,
      // Oficina: sin uniforme/volao/comida/feriado/extras; sí rifa
      uniformes: isOffice
        ? 0
        : prevLine.uniformes != null && Number.isFinite(prevUniformes)
          ? Math.max(0, prevUniformes)
          : LVA_PAYROLL_UNIFORMES,
      volaos: isOffice ? 0 : prevLine.volaos || 0,
      incentivos: prevLine.incentivos || 0,
      horasExtras: isOffice ? 0 : prevLine.horasExtras || 0,
      feriado: isOffice ? 0 : prevLine.feriado || 0,
      almuerzo: isOffice ? 0 : prevLine.almuerzo || 0,
      rifa: isOffice
        ? prevLine.rifa != null && Number.isFinite(prevRifa)
          ? Math.max(0, prevRifa)
          : OFFICE_PAYROLL_RIFA
        : LVA_PAYROLL_RIFA,
      adelantos: prevLine.adelantos || 0,
      prestamos: prevLine.prestamos || 0,
      note: prevLine.note || "",
    },
    { office: isOffice, lavega: isLavega }
  );
}

function buildLvaPayrollLineFromStaff(staff, prev) {
  return buildPayrollLineFromPerson(staff, prev, "La Vega Autopista");
}

function payrollPeriodKey(period, half) {
  return `${period}-q${half === 2 ? 2 : 1}`;
}

function findPayrollByGroup(period, half, group) {
  const h = half === 2 || half === "2" ? 2 : 1;
  const g = group || "lavega";
  return (contabilidadData.payrolls || []).find((p) => {
    if (p.period !== period || p.status === "cancelled") return false;
    if (!(p.half === h || (!p.half && h === 1))) return false;
    if (g === "lavega") {
      return p.group === "lavega" || !p.group || String(p.note || "").toLowerCase().includes("vega");
    }
    return p.group === g;
  });
}

function findLvaPayroll(period, half) {
  return findPayrollByGroup(period, half, "lavega");
}

function getSelectedPayrollHalf() {
  const el = document.getElementById("contabPayrollHalf");
  return el && el.value === "2" ? 2 : 1;
}

function halfLabel(half) {
  return half === 2 ? "16 al fin de mes" : "01 al 15";
}

/** Genera / actualiza nómina del grupo seleccionado (mismo formato). */
function generateOfficePayroll() {
  if (!canAccessContabilidad()) {
    toast("No tienes acceso a Contabilidad.");
    return;
  }
  const period = getSelectedMonth();
  const half = getSelectedPayrollHalf();
  const group = getSelectedPayrollGroup();
  const meta = payrollGroupMeta(group);
  const staff = getStaffForPayrollGroup(group);
  if (group !== "general" && !staff.length) {
    toast(
      group === "oficina"
        ? "No hay empleados activos en Oficina. Agrégalos en la pestaña Oficina."
        : group === "monorriel"
          ? "No hay personal activo de Monorriel."
          : "No hay empleados activos en La Vega Autopista."
    );
    return;
  }
  const existing = findPayrollByGroup(period, half, group);
  if (
    existing &&
    !confirm(`Ya hay nómina ${meta.short} de ${monthLabel(period)} (${halfLabel(half)}). ¿Actualizar?`)
  ) {
    return;
  }
  const [y, m] = period.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  const payDay = half === 1 ? 15 : Math.min(30, last);
  const payDate = `${period}-${String(payDay).padStart(2, "0")}`;
  const prevById = new Map();
  const prevByName = new Map();
  (existing && existing.lines ? existing.lines : []).forEach((l) => {
    if (l.employeeId) prevById.set(l.employeeId, l);
    const key = String(l.fullName || "")
      .replace(/\s*\([^)]*\)\s*$/, "")
      .trim()
      .toLowerCase();
    if (key) prevByName.set(key, l);
  });
  const isOffice = group === "oficina";
  const isLavega = group === "lavega";
  let lines;
  if (group === "general") {
    const kept = (existing && existing.lines ? existing.lines : []).map((l) =>
      computePayrollLineTotals(l)
    );
    lines = kept.length ? kept : Array.from({ length: 8 }, () => emptyPayrollLine());
  } else {
    lines = staff.map((s) => {
      const prev =
        prevById.get(s.employeeId) ||
        prevById.get(s.id) ||
        prevByName.get(String(s.name || "").trim().toLowerCase());
      return buildPayrollLineFromPerson(s, prev, meta.label, { office: isOffice, lavega: isLavega });
    });
  }
  const payroll = normalizePayroll({
    id: existing && existing.status === "draft" ? existing.id : undefined,
    period,
    half,
    group,
    payDate,
    status: "draft",
    // Oficina nunca usa feriado; La Vega/otros conservan preferencia previa
    showFeriado: isOffice ? false : existing ? !!existing.showFeriado : false,
    lines,
    note: isOffice
      ? `Nómina Oficina · ${halfLabel(half)} · ${monthLabel(period)} · SFS ${OFFICE_PAYROLL_SFS} · con rifa · sin días/unif/volao/comida/feriado/extras`
      : `Nómina ${meta.label} · ${halfLabel(half)} · ${monthLabel(period)}`,
    createdBy:
      typeof currentUser !== "undefined" && currentUser
        ? currentUser.displayName || currentUser.username
        : "",
  });
  if (existing) {
    const idx = contabilidadData.payrolls.findIndex((p) => p.id === existing.id);
    payroll.createdAt = existing.createdAt;
    if (idx >= 0) contabilidadData.payrolls[idx] = payroll;
    else contabilidadData.payrolls.unshift(payroll);
  } else {
    contabilidadData.payrolls.unshift(payroll);
  }
  selectedPayrollId = payroll.id;
  saveContabilidadData(true);
  setContabTab("nomina");
  toast(`Nómina ${meta.short} ${halfLabel(half)} · ${monthLabel(period)} · ${lines.length} fila(s).`);
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

function moneyCell(n) {
  // Sin RD$ para que el ancho de columna lo marque el título, no el prefijo
  const v = Number(n) || 0;
  return v ? moneyPlain(v) : "—";
}

function readPayrollLinesFromDom(payrollId) {
  const root = document.getElementById("contabPayrollDetail");
  if (!root) return null;
  const rows = [...root.querySelectorAll("tr[data-line-idx]")];
  const p = contabilidadData.payrolls.find((x) => x.id === payrollId);
  if (!p) return null;
  const lines = rows.map((tr, idx) => {
    const prev = (p.lines || [])[Number(tr.dataset.lineIdx)] || (p.lines || [])[idx] || {};
    const g = (name) => {
      const el = tr.querySelector(`[data-f="${name}"]`);
      return el ? el.value : "";
    };
    const isOffice = payrollIsOffice(p);
    const isLavega = payrollIsLavega(p);
    const ur = isOffice ? { uniformes: 0, rifa: 0 } : parseUnifRifa(g("unifRifa"), prev);
    const showFer = !isOffice && payrollShowsFeriado(p);
    const rifaVal = isOffice
      ? g("rifa") !== "" && g("rifa") != null
        ? g("rifa")
        : prev.rifa != null
          ? prev.rifa
          : OFFICE_PAYROLL_RIFA
      : ur.rifa || LVA_PAYROLL_RIFA;
    return normalizePayrollLine(
      {
        ...prev,
        fullName: g("fullName") || prev.fullName,
        cedula: g("cedula") || prev.cedula,
        daysWorked: isOffice ? "" : g("daysWorked") || prev.daysWorked,
        salaryMonthly: g("salaryMonthly"),
        salaryQuincena: isOffice ? 0 : g("salaryQuincena"),
        sfs: isOffice ? OFFICE_PAYROLL_SFS : g("sfs"),
        uniformes: isOffice ? 0 : ur.uniformes,
        rifa: rifaVal,
        volaos: isOffice ? 0 : g("volaos"),
        incentivos: g("incentivos"),
        horasExtras: isOffice ? 0 : g("horasExtras"),
        feriado: showFer ? g("feriado") : 0,
        almuerzo: isOffice
          ? 0
          : isLavega
            ? parseAlmuerzoSvda(g("almuerzoSvda") || g("almuerzo"), prev).almuerzo
            : g("almuerzo"),
        adelantos: g("adelantos"),
        prestamos: g("prestamos"),
      },
      { office: isOffice, lavega: isLavega }
    );
  });
  return lines;
}

function recalculateOpenPayroll(save = false) {
  const p = contabilidadData.payrolls.find((x) => x.id === selectedPayrollId);
  if (!p) {
    toast("No hay nómina abierta.");
    return;
  }
  const lines = readPayrollLinesFromDom(p.id);
  if (!lines) return;
  // Recalcular: La Vega desde días+sueldo; Oficina = sueldo/2 + SFS fijo
  const office = payrollIsOffice(p);
  const lavega = payrollIsLavega(p);
  p.lines = lines.map((l) =>
    computePayrollLineTotals(
      {
        ...l,
        salaryQuincena: 0,
        sfs: office ? OFFICE_PAYROLL_SFS : 0,
      },
      { office, lavega }
    )
  );
  p.updatedAt = new Date().toISOString();
  if (save) saveContabilidadData(true);
  renderNominaTab();
  toast(save ? "Nómina recalculada y guardada." : "Totales recalculados.");
}

function saveOpenPayrollEdits() {
  const p = contabilidadData.payrolls.find((x) => x.id === selectedPayrollId);
  if (!p) {
    toast("No hay nómina abierta.");
    return;
  }
  const lines = readPayrollLinesFromDom(p.id);
  if (!lines) return;
  p.lines = lines.map((l) => computePayrollLineTotalsForPayroll(p, l));
  p.updatedAt = new Date().toISOString();
  saveContabilidadData(true);
  renderNominaTab();
  toast("Cambios de nómina guardados.");
}

/**
 * Columnas editor. Solo Unif/Rifa va abreviado; el resto con nombre completo.
 * El ancho de cada columna numérica se limita al del encabezado (CSS).
 */
const PAYROLL_TABLE_COLS_BASE = [
  ["daysWorked", "Días", "days"],
  ["cedula", "Cédula", "text"],
  ["fullName", "Nombres", "name"],
  ["salaryMonthly", "Sueldo mes", "num"],
  ["salaryQuincena", "Sueldo quincena", "num"],
  ["sfs", "SFS", "num"],
  ["unifRifa", "Unif/Rifa", "unifRifa"],
  ["volaos", "Volaos", "num"],
  ["incentivos", "Incentivos", "num"],
  ["horasExtras", "Horas extras", "num"],
  ["feriado", "Feriado", "num"],
  ["almuerzo", "Almuerzo", "num"],
  ["adelantos", "Adelantos", "num"],
  ["prestamos", "Préstamos", "num"],
  ["totalDescuentos", "Total descuentos", "ro"],
  ["totalCobrar", "Total cobrar", "ro"],
  ["salarioDepositar", "A depositar", "ro"],
  ["redondeo", "Redondeo", "ro"],
];

/** Columnas impresión: sin cédula; mismos títulos (solo Unif/Rifa abreviado). */
const PAYROLL_PRINT_COLS_BASE = [
  ["daysWorked", "Días", "days"],
  ["fullName", "Nombres", "name"],
  ["salaryMonthly", "Sueldo mes", "num"],
  ["salaryQuincena", "Sueldo quincena", "num"],
  ["sfs", "SFS", "num"],
  ["unifRifa", "Unif/Rifa", "unifRifa"],
  ["volaos", "Volaos", "num"],
  ["incentivos", "Incentivos", "num"],
  ["horasExtras", "Horas extras", "num"],
  ["feriado", "Feriado", "num"],
  ["almuerzo", "Almuerzo", "num"],
  ["adelantos", "Adelantos", "num"],
  ["prestamos", "Préstamos", "num"],
  ["totalDescuentos", "Total descuentos", "ro"],
  ["totalCobrar", "Total cobrar", "ro"],
  ["salarioDepositar", "A depositar", "ro"],
  ["redondeo", "Redondeo", "ro"],
];

function payrollShowsFeriado(p) {
  if (payrollIsOffice(p)) return false;
  return !!(p && p.showFeriado);
}

function getPayrollEditorCols(p) {
  if (payrollIsOffice(p)) return PAYROLL_OFFICE_TABLE_COLS;
  const lavega = payrollIsLavega(p);
  return PAYROLL_TABLE_COLS_BASE.filter(([key]) => {
    if (key === "feriado") return payrollShowsFeriado(p);
    return true;
  }).map(([key, label, kind]) => {
    if (lavega && key === "almuerzo") return ["almuerzo", "Almuerzo / SVDA", "almuerzoSvda"];
    return [key, label, kind];
  });
}

function getPayrollPrintCols(p) {
  if (payrollIsOffice(p)) return PAYROLL_OFFICE_PRINT_COLS;
  const lavega = payrollIsLavega(p);
  return PAYROLL_PRINT_COLS_BASE.filter(([key]) => {
    if (key === "feriado") return payrollShowsFeriado(p);
    return true;
  }).map(([key, label, kind]) => {
    if (lavega && key === "almuerzo") return ["almuerzo", "Almuerzo / SVDA", "almuerzoSvda"];
    return [key, label, kind];
  });
}

// compat por si algo aún referencia PAYROLL_TABLE_COLS
const PAYROLL_TABLE_COLS = PAYROLL_TABLE_COLS_BASE;

function formatUnifRifa(line) {
  const u = Math.max(0, Number(line && line.uniformes) || 0);
  const r = Math.max(0, Number(line && line.rifa) || 0);
  if (!u && !r) return "";
  return `${u || 0}/${r || LVA_PAYROLL_RIFA}`;
}

/** Comida editable / SVDA fijo 90 (La Vega). */
function formatAlmuerzoSvda(line) {
  const meal = Math.max(0, Number(line && line.almuerzo) || 0);
  const hasName = payrollLineHasEmployeeName(line);
  if (!hasName && !meal) return "";
  return `${meal || 0}/${LVA_PAYROLL_SVDA}`;
}

function parseAlmuerzoSvda(raw, prev = {}) {
  const s = String(raw == null ? "" : raw).trim();
  if (!s) {
    return { almuerzo: Math.max(0, Number(prev.almuerzo) || 0) };
  }
  const m = s.match(/^(\d+(?:[.,]\d+)?)\s*[\/|]\s*(\d+(?:[.,]\d+)?)?$/);
  if (m) {
    return { almuerzo: Math.max(0, Number(String(m[1]).replace(",", ".")) || 0) };
  }
  return { almuerzo: Math.max(0, Number(String(s).replace(",", ".")) || 0) };
}

function almuerzoSvdaAmount(line) {
  const meal = Math.max(0, Number(line && line.almuerzo) || 0);
  const svda = Math.max(0, Number(line && line.svda) || 0);
  if (svda) return roundMoney2(meal + svda);
  if (payrollLineHasEmployeeName(line)) return roundMoney2(meal + LVA_PAYROLL_SVDA);
  return meal;
}

function parseUnifRifa(raw, prev = {}) {
  const s = String(raw == null ? "" : raw).trim();
  if (!s) {
    return {
      uniformes: Math.max(0, Number(prev.uniformes) || 0),
      rifa: Math.max(0, Number(prev.rifa) || 0),
    };
  }
  const m = s.match(/^(\d+(?:[.,]\d+)?)\s*[/|]\s*(\d+(?:[.,]\d+)?)$/);
  if (m) {
    return {
      uniformes: Math.max(0, Number(String(m[1]).replace(",", ".")) || 0),
      rifa: Math.max(0, Number(String(m[2]).replace(",", ".")) || 0),
    };
  }
  // Solo un número → uniforme; rifa fija
  const only = Math.max(0, Number(String(s).replace(",", ".")) || 0);
  return {
    uniformes: only,
    rifa: Math.max(0, Number(prev.rifa) || LVA_PAYROLL_RIFA),
  };
}

function unifRifaAmount(line) {
  return roundMoney2((Number(line.uniformes) || 0) + (Number(line.rifa) || 0));
}

function payrollLineHasEmployeeName(line) {
  return !!(line && String(line.fullName || "").trim());
}

/** Solo filas con nombre de empleado entran en totales (las vacías no suman). */
function payrollLinesForTotals(lines) {
  return (lines || []).filter(payrollLineHasEmployeeName);
}

function sumPayrollField(lines, field) {
  return sumField(payrollLinesForTotals(lines), field);
}

function emptyPayrollLine(overrides = {}) {
  // Fila en blanco: sin montos por defecto para que no “parezca” sumar hasta poner nombre
  return normalizePayrollLine({
    employeeId: "",
    fullName: "",
    position: "La Vega Autopista",
    cedula: "",
    daysWorked: "",
    salaryMonthly: 0,
    salaryQuincena: 0,
    sfs: 0,
    uniformes: 0,
    volaos: 0,
    incentivos: 0,
    horasExtras: 0,
    feriado: 0,
    almuerzo: 0,
    rifa: 0,
    adelantos: 0,
    prestamos: 0,
    ...overrides,
  });
}

function removePayrollLineAt(idx) {
  syncOpenPayrollFromDom(false);
  const p = ensureOpenPayrollDraft();
  if (!p) return;
  const i = Number(idx);
  if (!Number.isFinite(i) || i < 0 || i >= (p.lines || []).length) return;
  const name = (p.lines[i].fullName || "").trim() || `fila ${i + 1}`;
  if (!confirm(`¿Eliminar la fila de "${name}"?`)) return;
  p.lines.splice(i, 1);
  p.updatedAt = new Date().toISOString();
  saveContabilidadData(true);
  renderNominaTab();
  toast("Fila eliminada.");
}

function ensureOpenPayrollDraft() {
  let p = contabilidadData.payrolls.find((x) => x.id === selectedPayrollId);
  if (p) return p;
  const period = getSelectedMonth();
  const half = getSelectedPayrollHalf();
  const group = getSelectedPayrollGroup();
  p = findPayrollByGroup(period, half, group);
  if (p) {
    selectedPayrollId = p.id;
    return p;
  }
  return null;
}

function syncOpenPayrollFromDom(recalc = false) {
  const p = ensureOpenPayrollDraft();
  if (!p) return null;
  const lines = readPayrollLinesFromDom(p.id);
  if (!lines) return p;
  const office = payrollIsOffice(p);
  const lavega = payrollIsLavega(p);
  p.lines = lines.map((l) =>
    computePayrollLineTotals(
      recalc
        ? {
            ...l,
            salaryQuincena: 0,
            sfs: office ? OFFICE_PAYROLL_SFS : 0,
          }
        : l,
      { office, lavega }
    )
  );
  p.updatedAt = new Date().toISOString();
  return p;
}

function addBlankPayrollRows() {
  if (!canAccessContabilidad()) {
    toast("No tienes acceso a Contabilidad.");
    return;
  }
  syncOpenPayrollFromDom(false);
  let p = ensureOpenPayrollDraft();
  if (!p) {
    // crear borrador vacío del grupo seleccionado si aún no hay
    const period = getSelectedMonth();
    const half = getSelectedPayrollHalf();
    const group = getSelectedPayrollGroup();
    const meta = payrollGroupMeta(group);
    const [y, m] = period.split("-").map(Number);
    const last = new Date(y, m, 0).getDate();
    const payDay = half === 1 ? 15 : Math.min(30, last);
    p = normalizePayroll({
      period,
      half,
      group,
      payDate: `${period}-${String(payDay).padStart(2, "0")}`,
      status: "draft",
      lines: [],
      note: `Nómina ${meta.label} · ${halfLabel(half)} · ${monthLabel(period)}`,
      createdBy:
        typeof currentUser !== "undefined" && currentUser
          ? currentUser.displayName || currentUser.username
          : "",
    });
    contabilidadData.payrolls.unshift(p);
    selectedPayrollId = p.id;
  }
  const countEl = document.getElementById("contabAddRowsCount");
  let n = Math.max(1, Math.min(40, Number(countEl && countEl.value) || 1));
  const blankOpts = payrollIsOffice(p)
    ? {
        position: "Oficina",
        daysWorked: "",
        uniformes: 0,
        rifa: 0,
        volaos: 0,
        almuerzo: 0,
        feriado: 0,
        horasExtras: 0,
        sfs: 0,
      }
    : {};
  for (let i = 0; i < n; i += 1) {
    p.lines.push(
      normalizePayrollLine(emptyPayrollLine(blankOpts), {
        office: payrollIsOffice(p),
        lavega: payrollIsLavega(p),
      })
    );
  }
  p.updatedAt = new Date().toISOString();
  saveContabilidadData(true);
  renderNominaTab();
  toast(`${n} fila(s) agregada(s) al final de la nómina.`);
}

function payrollShareCaption(p) {
  if (!p) return "Nómina Reaction";
  const g =
    p.group === "lavega" || (!p.group && String(p.note || "").toLowerCase().includes("vega"))
      ? "lavega"
      : p.group || "general";
  const meta = payrollGroupMeta(g);
  return `Nómina ${meta.short} - ${halfLabel(p.half || 1)} ${monthLabel(p.period)}`;
}

function buildPayrollPrintHtml(p) {
  const cols = getPayrollPrintCols(p);
  const isOffice = payrollIsOffice(p);
  const isLavega = payrollIsLavega(p);
  const allLines = payrollLinesForTotals(p.lines || []).map((l) => {
    // Migrar uniforme viejo 215 → 115 (salvo que ya lo hayan cambiado a otro valor)
    let uniformes = Number(l.uniformes) || 0;
    if (!isOffice && uniformes === 215) uniformes = LVA_PAYROLL_UNIFORMES;
    if (isOffice) uniformes = 0;
    const named = {
      ...l,
      fullName: payrollShortEmployeeName(l.fullName) || payrollCleanEmployeeName(l.fullName) || l.fullName,
      uniformes,
      rifa: isOffice ? Number(l.rifa) || OFFICE_PAYROLL_RIFA : Number(l.rifa) || LVA_PAYROLL_RIFA,
      volaos: isOffice ? 0 : l.volaos,
      almuerzo: isOffice ? 0 : l.almuerzo,
      feriado: isOffice ? 0 : l.feriado,
      horasExtras: isOffice ? 0 : l.horasExtras,
      daysWorked: isOffice ? "" : l.daysWorked,
      salaryQuincena: isOffice ? 0 : l.salaryQuincena,
      sfs: isOffice ? OFFICE_PAYROLL_SFS : l.sfs,
    };
    const computed = computePayrollLineTotals(named, { office: isOffice, lavega: isLavega });
    if (!payrollShowsFeriado(p) && Number(computed.feriado)) {
      return computePayrollLineTotals({ ...computed, feriado: 0 }, { office: isOffice, lavega: isLavega });
    }
    return computed;
  });
  const totals = {};
  cols.forEach(([key, , kind]) => {
    if (key === "unifRifa") {
      totals.unifRifa = roundMoney2(
        sumPayrollField(allLines, "uniformes") + sumPayrollField(allLines, "rifa")
      );
      return;
    }
    if (kind === "almuerzoSvda") {
      totals.almuerzo = roundMoney2(
        allLines.reduce((acc, l) => acc + almuerzoSvdaAmount(l), 0)
      );
      return;
    }
    if (kind === "ro" || kind === "num") totals[key] = sumPayrollField(allLines, key);
  });
  const head = cols
    .map(([key, label, kind]) => {
      const cls = key === "fullName" ? "col-name" : kind === "days" ? "col-days" : "col-num";
      return `<th class="${cls}">${escapeHtml(label)}</th>`;
    })
    .join("");
  const body = allLines
    .map((l) => {
      const tds = cols
        .map(([key, , kind]) => {
          if (key === "fullName") {
            return `<td class="col-name">${escapeHtml(String(l.fullName || ""))}</td>`;
          }
          if (key === "unifRifa") {
            return `<td class="right col-num">${escapeHtml(formatUnifRifa(l))}</td>`;
          }
          if (kind === "almuerzoSvda") {
            return `<td class="right col-num">${escapeHtml(formatAlmuerzoSvda(l))}</td>`;
          }
          if (kind === "ro" || kind === "num") {
            const v = Number(l[key]) || 0;
            return `<td class="right col-num">${escapeHtml(moneyPlain(v))}</td>`;
          }
          return `<td class="col-num">${escapeHtml(String(l[key] || ""))}</td>`;
        })
        .join("");
      return `<tr>${tds}</tr>`;
    })
    .join("");
  // TOTAL en la primera columna visible (Oficina empieza en Nombres, no en Días)
  const totalLabelKey = cols.some(([k]) => k === "daysWorked")
    ? "daysWorked"
    : cols.some(([k]) => k === "fullName")
      ? "fullName"
      : cols[0]
        ? cols[0][0]
        : "";
  const totalRow = cols
    .map(([key, , kind]) => {
      if (key === totalLabelKey) {
        const cls = key === "fullName" ? "col-name" : key === "daysWorked" ? "col-days" : "col-num";
        return `<td class="${cls}"><strong>TOTAL</strong></td>`;
      }
      if (key === "fullName") return `<td class="col-name"></td>`;
      if (key === "daysWorked") return `<td class="col-days"></td>`;
      if (key === "unifRifa") {
        return `<td class="right col-num"><strong>${escapeHtml(moneyPlain(totals.unifRifa))}</strong></td>`;
      }
      if (kind === "almuerzoSvda") {
        return `<td class="right col-num"><strong>${escapeHtml(moneyPlain(totals.almuerzo))}</strong></td>`;
      }
      if (key === "redondeo") {
        const v = Number(totals.redondeo) || 0;
        return `<td class="right col-num col-redondeo-total"><strong>${escapeHtml(moneyPlain(v))}</strong></td>`;
      }
      if (kind === "ro" || kind === "num") {
        const v = Number(totals[key]) || 0;
        return `<td class="right col-num"><strong>${escapeHtml(moneyPlain(v))}</strong></td>`;
      }
      return `<td></td>`;
    })
    .join("");
  const g =
    p.group === "lavega" || (!p.group && String(p.note || "").toLowerCase().includes("vega"))
      ? "lavega"
      : p.group || "general";
  const groupTitle = payrollGroupMeta(g).title;
  const paper = getPayrollPaperForExport(p);
  const paperLabel = paper === "letter" ? "Carta" : "Legal";
  return `
    <h2 style="margin:0 0 4px;font-size:13px;font-weight:800;color:#111;text-align:center">
      NOMINA REACTION · ${escapeHtml(groupTitle)} · ${escapeHtml(halfLabel(p.half || 1).toUpperCase())} · ${escapeHtml(
        monthLabel(p.period).toUpperCase()
      )}
    </h2>
    <div class="meta" style="margin-bottom:4px;font-size:11px;justify-content:center">
      <div><strong>Pago:</strong> ${escapeHtml(p.payDate || "—")}</div>
      <div><strong>Empleados:</strong> ${allLines.length}</div>
      <div><strong>Total redondeo:</strong> ${escapeHtml(moneyPlain(totals.redondeo || 0))}</div>
      ${payrollShowsFeriado(p) ? "<div><strong>Feriado:</strong> activo</div>" : ""}
    </div>
    <table class="nomina-print${isOffice ? " nomina-print-office" : ""}${
      isLavega ? " nomina-print-lavega" : ""
    }">
      <thead><tr>${head}</tr></thead>
      <tbody>${body || `<tr><td colspan="${cols.length}">Sin líneas</td></tr>`}</tbody>
      <tfoot><tr>${totalRow}</tr></tfoot>
    </table>
    <div class="sign-box${isOffice ? " sign-box-office" : ""}">
      <div class="sign-line">Preparado por / Contabilidad</div>
      <div class="sign-line">Autorizado / Operaciones</div>
    </div>
    <p class="footer">${escapeHtml(paperLabel)} horizontal · Reaction Force Security · ${escapeHtml(
      new Date().toLocaleString("es-DO")
    )}</p>`;
}

function payrollPrintCss(paperSize, options = {}) {
  const paper = paperSize === "letter" ? "letter" : "legal";
  const office = !!(options && options.office);
  const lavega = !!(options && options.lavega);
  const colored = office || lavega;
  // Keyword landscape evita hoja en blanco / orientación mal interpretada en Chrome
  const page =
    paper === "letter"
      ? "@page{size:letter landscape;margin:7mm}"
      : "@page{size:legal landscape;margin:6mm}";
  return `
    ${page}
    html,body.print-nomina{width:100% !important;max-width:none !important;min-height:0;overflow:visible !important;background:#fff !important;color:#111 !important}
    body.print-nomina{-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:8px 10px;font-size:${
      office ? "12px" : "12px"
    };line-height:1.15;margin:0}
    body.print-nomina .brand{margin:0 auto 8px;justify-content:center;text-align:center;display:flex;align-items:center;gap:10px}
    body.print-nomina .brand img{width:${office ? "44px" : "38px"};height:${office ? "44px" : "38px"}}
    body.print-nomina h1{font-size:${office ? "17px" : "15px"};font-weight:900}
    body.print-nomina h2{font-size:${office ? "14px" : "13px"};margin:0 0 4px;font-weight:900;text-align:center;color:#111}
    #rfsPrintRoot{max-width:none;width:100%;min-width:0;box-sizing:border-box;display:flex;flex-direction:column;align-items:stretch;background:#fff;color:#111}
    #rfsPrintRoot > .footer{text-align:center;align-self:center}
    table.nomina-print{width:${office ? "100%" : "auto"};max-width:100%;border-collapse:collapse;table-layout:auto;font-size:${
      office ? "11.5px" : "11.5px"
    };margin:0 auto}
    table.nomina-print th,table.nomina-print td{border:1px solid #222;padding:${
      office ? "4px 5px" : "2px 4px"
    };vertical-align:middle}
    table.nomina-print th{background:${colored ? "#b71c1c" : "#e8e8e8"};color:${
      colored ? "#fff" : "#000"
    };font-weight:900;font-size:${office ? "11px" : "11px"};line-height:1.15;white-space:nowrap;letter-spacing:0.01em}
    table.nomina-print td{white-space:nowrap;padding:${office ? "4px 5px" : "2px 4px"}}
    table.nomina-print th.col-name,table.nomina-print td.col-name{text-align:left;font-weight:700;padding:${
      office ? "4px 6px" : "2px 5px"
    };max-width:11em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap !important;word-break:normal}
    table.nomina-print th.col-num,table.nomina-print td.col-num{text-align:right}
    table.nomina-print th.col-days,table.nomina-print td.col-days{text-align:center}
    table.nomina-print tfoot td{background:${colored ? "#ffe082" : "#efefef"};font-weight:900}
    table.nomina-print tfoot td.col-redondeo-total{font-size:${office ? "12px" : "11.5px"}}
    table.nomina-print-office{width:100% !important}
    table.nomina-print-office tbody tr:nth-child(even) td,
    table.nomina-print-lavega tbody tr:nth-child(even) td{background:#f3f3f3}
    table.nomina-print-office tbody tr:nth-child(odd) td,
    table.nomina-print-lavega tbody tr:nth-child(odd) td{background:#ffffff}
    table.nomina-print-office tbody tr:nth-child(even) td.col-name,
    table.nomina-print-lavega tbody tr:nth-child(even) td.col-name{background:#eceff1}
    table.nomina-print-office td.col-name,
    table.nomina-print-lavega td.col-name{color:#0d47a1;font-weight:800}
    .meta{font-size:11px;display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
    .sign-box{margin-top:${office ? "16px" : "12px"};display:grid;grid-template-columns:1fr 1fr;gap:18px;width:${
      office ? "min(100%,640px)" : "min(100%,520px)"
    };align-self:center;margin-left:auto;margin-right:auto}
    .sign-line{border-top:1px solid #111;margin-top:${office ? "28px" : "26px"};padding-top:3px;text-align:center;font-size:${
      office ? "11px" : "10px"
    }}
    .footer{font-size:9px;margin-top:6px;text-align:center}
    @media print{
      html,body.print-nomina{overflow:visible !important;height:auto !important;background:#fff !important}
      body.print-nomina{padding:0 !important;margin:0 !important}
      .no-print{display:none !important}
      #rfsPrintRoot{width:100% !important;align-items:stretch;visibility:visible !important}
      table.nomina-print{font-size:${office ? "11.5px" : "11.5px"};width:${
        office ? "100%" : "auto"
      };margin:0 auto}
      table.nomina-print th{font-size:${office ? "11px" : "11px"};font-weight:900}
      table.nomina-print-office{width:100% !important}
      table.nomina-print td,table.nomina-print th{white-space:nowrap !important}
    }
  `;
}

function togglePayrollFeriado() {
  syncOpenPayrollFromDom(false);
  const p = ensureOpenPayrollDraft();
  if (!p) {
    toast("Abre o genera una nómina primero.");
    return;
  }
  if (payrollIsOffice(p)) {
    toast("La nómina de oficina no usa feriado.");
    return;
  }
  p.showFeriado = !p.showFeriado;
  if (!p.showFeriado) {
    p.lines = (p.lines || []).map((l) =>
      computePayrollLineTotals(
        { ...l, feriado: 0 },
        { office: payrollIsOffice(p), lavega: payrollIsLavega(p) }
      )
    );
  }
  p.updatedAt = new Date().toISOString();
  saveContabilidadData(true);
  renderNominaTab();
  toast(p.showFeriado ? "Columna Feriado habilitada." : "Columna Feriado oculta.");
}

function resolveOpenPayrollForExport() {
  if (!canAccessContabilidad()) {
    toast("No tienes acceso a Contabilidad.");
    return null;
  }
  try {
    syncOpenPayrollFromDom(false);
  } catch (_) {}
  const p = ensureOpenPayrollDraft();
  if (!p || !payrollLinesForTotals(p.lines || []).length) {
    toast("Abre o genera una nómina con empleados antes de imprimir o compartir.");
    return null;
  }
  try {
    saveContabilidadData(true);
  } catch (_) {}
  return p;
}

function payrollPdfFileName(p) {
  const caption = payrollShareCaption(p);
  const safe = String(caption || "nomina")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${safe || "nomina"}.pdf`;
}

/** PDF en la misma ventana (no depende de pop-ups; sirve en móvil/PWA). */
async function buildPayrollPdfBlob(p) {
  if (typeof ensureHtml2Pdf !== "function") throw new Error("PDF no disponible");
  const html2pdf = await ensureHtml2Pdf();
  const paper = getPayrollPaperForExport(p);
  const fmt = paper === "letter" ? "letter" : "legal";
  const isOffice = payrollIsOffice(p);
  const isLavega = payrollIsLavega(p);
  // Ancho del lienzo ≈ hoja horizontal (Carta ~1056px @96dpi; Legal más ancha)
  const canvasW = fmt === "legal" ? 1340 : isOffice ? 1020 : 1100;
  const caption = payrollShareCaption(p);
  const logoUrl = (() => {
    try {
      return new URL("logo.jpg", window.location.href).href;
    } catch (_) {
      return "logo.jpg";
    }
  })();
  const host = document.createElement("div");
  host.setAttribute("data-rfs-payroll-pdf", "1");
  // Visible para html2canvas (opacity:0 a veces deja captura vacía / minúscula)
  host.style.cssText = `position:fixed;left:0;top:0;width:${canvasW}px;background:#fff;color:#111;padding:${
    isOffice ? "14px 16px" : "12px 14px"
  };box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;font-size:${
    isOffice ? "13px" : "12px"
  };line-height:1.25;z-index:2147483000;pointer-events:none;`;
  host.innerHTML = `
    <style>${payrollPrintCss(paper, { office: isOffice, lavega: isLavega })}
      [data-rfs-payroll-pdf] #rfsPdfInner{width:100%;box-sizing:border-box}
      [data-rfs-payroll-pdf] table.nomina-print{width:100% !important;max-width:100%}
      [data-rfs-payroll-pdf] .brand{justify-content:center;margin:0 auto 10px}
    </style>
    <div id="rfsPdfInner">
      <div class="brand" style="display:flex;align-items:center;gap:12px;margin-bottom:10px;justify-content:center">
        <img src="${escapeHtml(logoUrl)}" alt="RFS" crossorigin="anonymous" style="width:${
          isOffice ? "48" : "40"
        }px;height:${isOffice ? "48" : "40"}px;object-fit:contain" />
        <div style="text-align:left">
          <div style="font-size:${isOffice ? "18" : "15"}px;font-weight:800;margin:0">Reaction Force Security</div>
          <div style="font-size:${isOffice ? "13" : "12"}px">${escapeHtml(caption)}</div>
        </div>
      </div>
      ${buildPayrollPrintHtml(p)}
    </div>
  `;
  document.body.appendChild(host);
  try {
    if (typeof waitForImages === "function") await waitForImages(host);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const target = host.querySelector("#rfsPdfInner") || host;
    const opt = {
      margin: isOffice ? [8, 8, 8, 8] : [6, 6, 6, 6],
      filename: payrollPdfFileName(p),
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: isOffice ? 2 : 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: canvasW,
        width: canvasW,
        scrollX: 0,
        scrollY: 0,
      },
      // Formato con nombre + landscape (NO [w,h]+portrait: jsPDF invierte a vertical)
      jsPDF: {
        unit: "mm",
        format: fmt,
        orientation: "landscape",
      },
      pagebreak: { mode: ["css", "legacy"] },
    };
    let blob = null;
    try {
      blob = await html2pdf().set(opt).from(target).outputPdf("blob");
    } catch (_) {
      blob = await html2pdf().set(opt).from(target).toPdf().get("pdf").then((pdf) => pdf.output("blob"));
    }
    if (!blob || !blob.size) throw new Error("PDF vacío");
    return blob;
  } finally {
    host.remove();
  }
}

function printOpenPayrollSheet() {
  const p = resolveOpenPayrollForExport();
  if (!p) return;
  const caption = payrollShareCaption(p);
  const paper = getPayrollPaperForExport(p);
  const paperLabel = paper === "letter" ? "Carta" : "Legal";
  const isOffice = payrollIsOffice(p);
  const isLavega = payrollIsLavega(p);
  if (typeof openPrintWindow !== "function") {
    downloadOpenPayrollPdf().catch(() => toast("No se pudo abrir la impresión."));
    return;
  }
  const win = openPrintWindow(caption, buildPayrollPrintHtml(p), {
    bodyClass: "print-nomina",
    pageSize: paper,
    orientation: "landscape",
    pdfFormat: paper,
    pdfOrientation: "landscape",
    wide: true,
    autoPrint: false,
    extraCss: payrollPrintCss(paper, { office: isOffice, lavega: isLavega }),
    share: {
      text: caption,
      subject: caption,
      fileName: payrollPdfFileName(p),
    },
  });
  if (!win) {
    // Pop-up bloqueado (muy común en móvil/PWA): descarga PDF directo
    toast("Ventana bloqueada · descargando PDF…");
    downloadOpenPayrollPdf().catch(() => {});
    return;
  }
  toast(
    `${paperLabel} horizontal · en el diálogo elige Horizontal / Landscape. Usa Imprimir o Descargar PDF.`
  );
}

async function downloadOpenPayrollPdf() {
  const p = resolveOpenPayrollForExport();
  if (!p) return;
  toast("Generando PDF…");
  try {
    const blob = await buildPayrollPdfBlob(p);
    const name = payrollPdfFileName(p);
    if (typeof downloadBlobFile === "function") downloadBlobFile(blob, name);
    else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2500);
    }
    toast("PDF descargado.");
  } catch (err) {
    console.error(err);
    toast("No se pudo crear el PDF. Prueba Imprimir → Guardar como PDF.");
  }
}

async function shareOpenPayrollSheet(mode = "share") {
  const p = resolveOpenPayrollForExport();
  if (!p) return;
  const caption = payrollShareCaption(p);
  const wantMail = mode === "mail" || mode === "gmail" || mode === "email";
  toast(wantMail ? "Preparando PDF para Gmail / correo…" : "Preparando PDF para compartir…");
  try {
    const blob = await buildPayrollPdfBlob(p);
    const file = new File([blob], payrollPdfFileName(p), { type: "application/pdf" });
    if (typeof trySharePdfFile === "function") {
      const shared = await trySharePdfFile(file, caption, caption);
      if (shared) {
        toast(wantMail ? "Elige Gmail o Correo en el menú y adjunta el PDF." : "Elige WhatsApp o Gmail en el menú.");
        return;
      }
    } else if (navigator.share) {
      try {
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({ title: caption, text: caption, files: [file] });
          toast(wantMail ? "Elige Gmail en el menú." : "PDF listo para enviar.");
          return;
        }
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }
    // Fallback: descargar PDF y abrir correo o WhatsApp
    if (typeof downloadBlobFile === "function") downloadBlobFile(file, file.name);
    else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2500);
    }
    if (wantMail) {
      window.location.href = `mailto:?subject=${encodeURIComponent(caption)}&body=${encodeURIComponent(
        `${caption}\n\nAdjunta el PDF descargado (${file.name}).`
      )}`;
      toast("PDF descargado. Adjúntalo en Gmail / correo.");
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank");
    toast("PDF descargado. Adjúntalo en WhatsApp.");
  } catch (err) {
    console.error(err);
    printOpenPayrollSheet();
    toast("Abre Descargar PDF o Correo PDF en la barra de impresión.");
  }
}

function emailOpenPayrollPdf() {
  return shareOpenPayrollSheet("mail");
}


let payrollLiveTimer = null;
let payrollSaveTimer = null;

function schedulePayrollAutosave() {
  clearTimeout(payrollSaveTimer);
  payrollSaveTimer = setTimeout(() => {
    try {
      saveContabilidadData(true);
    } catch (_) {}
  }, 900);
}

function updatePayrollReadonlyDom(p) {
  const root = document.getElementById("contabPayrollDetail");
  if (!root || !p) return;
  const lines = p.lines || [];
  root.querySelectorAll("tr[data-line-idx]").forEach((tr) => {
    const idx = Number(tr.dataset.lineIdx);
    const l = lines[idx];
    if (!l) return;
    tr.classList.toggle("nomina-row-empty", !payrollLineHasEmployeeName(l));
    ["salaryQuincena", "sfs", "totalDescuentos", "totalCobrar", "salarioDepositar", "redondeo"].forEach((key) => {
      const td = [...tr.children].find((cell) => cell.dataset && cell.dataset.ro === key);
      if (td) td.textContent = moneyCell(l[key]);
    });
    // also sync computed quincena/sfs / Almuerzo-SVDA when auto-forced (La Vega)
    const q = tr.querySelector('[data-f="salaryQuincena"]');
    const s = tr.querySelector('[data-f="sfs"]');
    const asv = tr.querySelector('[data-f="almuerzoSvda"]');
    if (q && document.activeElement !== q) q.value = l.salaryQuincena || "";
    if (s && document.activeElement !== s) s.value = l.sfs || "";
    if (asv && document.activeElement !== asv) asv.value = formatAlmuerzoSvda(l);
  });
  const totals = {
    salaryMonthly: sumPayrollField(lines, "salaryMonthly"),
    salaryQuincena: sumPayrollField(lines, "salaryQuincena"),
    sfs: sumPayrollField(lines, "sfs"),
    uniformes: sumPayrollField(lines, "uniformes"),
    volaos: sumPayrollField(lines, "volaos"),
    incentivos: sumPayrollField(lines, "incentivos"),
    horasExtras: sumPayrollField(lines, "horasExtras"),
    feriado: sumPayrollField(lines, "feriado"),
    almuerzo: payrollIsLavega(p)
      ? roundMoney2(payrollLinesForTotals(lines).reduce((acc, l) => acc + almuerzoSvdaAmount(l), 0))
      : sumPayrollField(lines, "almuerzo"),
    rifa: sumPayrollField(lines, "rifa"),
    adelantos: sumPayrollField(lines, "adelantos"),
    prestamos: sumPayrollField(lines, "prestamos"),
    totalDescuentos: sumPayrollField(lines, "totalDescuentos"),
    totalCobrar: sumPayrollField(lines, "totalCobrar"),
    salarioDepositar: sumPayrollField(lines, "salarioDepositar"),
    redondeo: sumPayrollField(lines, "redondeo"),
    unifRifa: roundMoney2(sumPayrollField(lines, "uniformes") + sumPayrollField(lines, "rifa")),
  };
  const foot = root.querySelector("tfoot tr.nomina-total-row");
  if (foot) {
    const cells = [...foot.children];
    const cols = getPayrollEditorCols(p);
    cols.forEach((col, i) => {
      const [key] = col;
      if (!cells[i]) return;
      if (key === "daysWorked" || key === "cedula" || key === "fullName") return;
      if (key === "redondeo") {
        const v = Number(totals.redondeo) || 0;
        cells[i].innerHTML = `<strong>${escapeHtml(moneyPlain(v) || "0")}</strong>`;
        return;
      }
      cells[i].textContent = moneyCell(totals[key]);
    });
  }
  const summary = root.querySelector("[data-nomina-total-summary]");
  if (summary) {
    const named = payrollLinesForTotals(lines).length;
    summary.innerHTML = `<strong>Total redondeo: ${escapeHtml(moneyRd(totals.redondeo))}</strong>
      <span class="muted"> · A depositar ${escapeHtml(moneyRd(totals.salarioDepositar))} · A cobrar ${escapeHtml(
        moneyRd(totals.totalCobrar)
      )} · ${named} con nombre (auto)</span>`;
  }
}

function applyPayrollLiveUpdate(ev) {
  const field = ev && ev.target && ev.target.dataset ? ev.target.dataset.f : "";
  const tr = ev && ev.target && ev.target.closest ? ev.target.closest("tr[data-line-idx]") : null;
  const idx = tr ? Number(tr.dataset.lineIdx) : -1;
  const p = ensureOpenPayrollDraft();
  if (!p) return;
  const lines = readPayrollLinesFromDom(p.id);
  if (!lines) return;
  const office = payrollIsOffice(p);
  const lavega = payrollIsLavega(p);
  const forceBase = field === "daysWorked" || field === "salaryMonthly";
  p.lines = lines.map((l, i) => {
    if (forceBase && i === idx) {
      return computePayrollLineTotals(
        { ...l, salaryQuincena: 0, sfs: office ? OFFICE_PAYROLL_SFS : 0 },
        { office, lavega }
      );
    }
    return computePayrollLineTotals(l, { office, lavega });
  });
  p.updatedAt = new Date().toISOString();
  updatePayrollReadonlyDom(p);
  schedulePayrollAutosave();
}

function schedulePayrollLiveUpdate(ev) {
  clearTimeout(payrollLiveTimer);
  payrollLiveTimer = setTimeout(() => applyPayrollLiveUpdate(ev), 220);
}

function bindPayrollLiveTotals() {
  const root = document.getElementById("contabPayrollDetail");
  if (!root) return;
  if (root.dataset.liveBound === "1") return;
  root.dataset.liveBound = "1";
  root.addEventListener("input", (ev) => {
    if (ev.target && ev.target.classList && ev.target.classList.contains("nomina-inp")) {
      schedulePayrollLiveUpdate(ev);
    }
  });
  root.addEventListener("change", (ev) => {
    if (ev.target && ev.target.classList && ev.target.classList.contains("nomina-inp")) {
      schedulePayrollLiveUpdate(ev);
    }
  });
}

function renderNominaTab() {
  const list = document.getElementById("contabPayrollList");
  const detail = document.getElementById("contabPayrollDetail");
  if (!list) return;
  const halfSel = document.getElementById("contabPayrollHalf");
  const groupSel = document.getElementById("contabPayrollGroup");
  const group = getSelectedPayrollGroup();
  const meta = payrollGroupMeta(group);
  syncPayrollPaperUiForGroup(group);
  const titleEl = document.getElementById("contabNominaTitle");
  if (titleEl) titleEl.textContent = `Nómina · ${meta.label}`;
  const genBtn = document.getElementById("btnContabGenPayroll");
  if (genBtn) {
    genBtn.textContent =
      group === "general" ? "Crear / abrir plantilla General" : `Generar / actualizar · ${meta.short}`;
  }

  const rows = (contabilidadData.payrolls || [])
    .filter((p) => {
      if (group === "lavega") {
        return p.group === "lavega" || !p.group || String(p.note || "").toLowerCase().includes("vega");
      }
      return p.group === group;
    })
    .slice()
    .sort((a, b) => {
      const pk = String(b.period).localeCompare(String(a.period));
      if (pk) return pk;
      return (b.half || 1) - (a.half || 1);
    });
  if (!rows.length) {
    const nStaff = getStaffForPayrollGroup(group).length;
    list.innerHTML = `<p class="empty">Aún no hay nómina ${escapeHtml(meta.short)}. Pulsa «Generar / actualizar»${
      group === "general" ? " para crear la plantilla" : ` (${nStaff} persona(s) disponibles)`
    }.</p>`;
  } else {
    list.innerHTML = rows
      .map((p) => {
        const total = sumPayrollField(p.lines, "redondeo") || sumPayrollField(p.lines, "net");
        const st = p.status === "paid" ? "Pagada" : p.status === "cancelled" ? "Cancelada" : "Borrador";
        const gMeta = payrollGroupMeta(
          p.group === "lavega" || (!p.group && String(p.note || "").toLowerCase().includes("vega"))
            ? "lavega"
            : p.group || "general"
        );
        return `<article class="report-card">
          <h3>${escapeHtml(gMeta.short)} · ${escapeHtml(monthLabel(p.period))} · ${escapeHtml(halfLabel(p.half || 1))}</h3>
          <p class="muted">Pago ${escapeHtml(p.payDate || "—")} · ${escapeHtml(st)} · ${
            payrollLinesForTotals(p.lines).length
          } empleado(s)</p>
          <p><strong>${escapeHtml(moneyRd(total))}</strong> <span class="muted">(redondeo)</span></p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
            <button type="button" class="btn secondary btn-pay-open" data-id="${escapeHtml(
              p.id
            )}" style="width:auto;padding:8px 10px;font-size:12px">Abrir tabla</button>
            <button type="button" class="btn secondary btn-pay-print" data-id="${escapeHtml(
              p.id
            )}" style="width:auto;padding:8px 10px;font-size:12px">Imprimir</button>
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
        const p = contabilidadData.payrolls.find((x) => x.id === btn.dataset.id);
        if (p && halfSel) halfSel.value = String(p.half || 1);
        if (p && groupSel && p.group && PAYROLL_GROUP_META[p.group]) groupSel.value = p.group;
        renderNominaTab();
      })
    );
    list.querySelectorAll(".btn-pay-print").forEach((btn) =>
      btn.addEventListener("click", () => {
        selectedPayrollId = btn.dataset.id;
        const p = contabilidadData.payrolls.find((x) => x.id === btn.dataset.id);
        if (p && halfSel) halfSel.value = String(p.half || 1);
        if (p && groupSel && p.group && PAYROLL_GROUP_META[p.group]) groupSel.value = p.group;
        renderNominaTab();
        setTimeout(() => printOpenPayrollSheet(), 50);
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
  const period = getSelectedMonth();
  const half = getSelectedPayrollHalf();
  let p =
    contabilidadData.payrolls.find((x) => x.id === selectedPayrollId) ||
    findPayrollByGroup(period, half, group) ||
    rows[0];
  if (!p) {
    detail.innerHTML = payrollIsOffice({ group })
      ? `<p class="muted">Genera la nómina de Oficina (01–15 o 16–fin) para cargar los ${getOfficeStaffForPayroll().length} empleado(s): nombre, cédula, cargo y sueldo. Quincena = sueldo/2, SFS fijo RD$ ${OFFICE_PAYROLL_SFS}, con rifa. Sin días, unif, volao, comida, feriado ni horas extras.</p>`
      : `<p class="muted">Genera la nómina ${escapeHtml(
          meta.short
        )} para ver la tabla (mismo formato: días, sueldo, SFS, Unif/Rifa, volaos, extras, descuentos, depósito y redondeo).</p>`;
    return;
  }
  selectedPayrollId = p.id;
  if (halfSel && !document.activeElement?.id?.includes("contabPayrollHalf")) {
    // keep user selection unless opening a different payroll
  }
  // Oficina: reglas propias + nombre corto (1 nombre + 1 apellido)
  if (payrollIsOffice(p)) {
    p.showFeriado = false;
    const officeStaffById = new Map();
    try {
      getOfficeStaffForPayroll().forEach((s) => {
        if (s.employeeId) officeStaffById.set(s.employeeId, s);
        if (s.id) officeStaffById.set(s.id, s);
      });
    } catch (_) {}
    let cleanedOffice = false;
    p.lines = (p.lines || []).map((l) => {
      const staff = officeStaffById.get(l.employeeId);
      const short = staff
        ? payrollShortEmployeeName(staff.name || staff.fullName)
        : payrollShortEmployeeName(l.fullName);
      let next = computePayrollLineTotals(
        {
          ...l,
          fullName: short || l.fullName,
          daysWorked: "",
          salaryQuincena: 0,
          sfs: OFFICE_PAYROLL_SFS,
          uniformes: 0,
          volaos: 0,
          almuerzo: 0,
          feriado: 0,
          horasExtras: 0,
          rifa: l.rifa != null && l.rifa !== "" ? l.rifa : OFFICE_PAYROLL_RIFA,
        },
        { office: true }
      );
      if (
        (short && short !== String(l.fullName || "").trim()) ||
        Number(l.salaryQuincena) !== Number(next.salaryQuincena) ||
        Number(l.sfs) !== Number(next.sfs) ||
        Number(l.uniformes) ||
        Number(l.volaos) ||
        Number(l.almuerzo) ||
        Number(l.feriado) ||
        Number(l.horasExtras) ||
        String(l.daysWorked || "") !== ""
      ) {
        cleanedOffice = true;
      }
      return next;
    });
    if (cleanedOffice) {
      p.updatedAt = new Date().toISOString();
      saveContabilidadData(true);
    }
  }
  // La Vega: nombre corto + uniforme 215→115; comida editable + SVDA 90 aparte
  if (payrollIsLavega(p)) {
    const staffById = new Map();
    try {
      getLvaStaffForPayroll().forEach((s) => {
        if (s.employeeId) staffById.set(s.employeeId, s);
        if (s.id) staffById.set(s.id, s);
      });
    } catch (_) {}
    let cleaned = false;
    // v110 metió SVDA dentro de almuerzo (=90); una sola vez dejar comida en 0
    if (!p.svdaMealSplit) {
      p.lines = (p.lines || []).map((l) => {
        if (Number(l.almuerzo) === LVA_PAYROLL_SVDA) {
          cleaned = true;
          return { ...l, almuerzo: 0 };
        }
        return l;
      });
      p.svdaMealSplit = true;
      cleaned = true;
    }
    p.lines = (p.lines || []).map((l) => {
      let next = l;
      const staff = staffById.get(l.employeeId);
      const short = staff
        ? payrollShortEmployeeName(staff.name)
        : payrollShortEmployeeName(l.fullName);
      if (short && short !== String(l.fullName || "").trim()) {
        cleaned = true;
        next = { ...next, fullName: short };
      }
      if (Number(next.uniformes) === 215) {
        cleaned = true;
        next = computePayrollLineTotals(
          {
            ...next,
            uniformes: LVA_PAYROLL_UNIFORMES,
            rifa: Number(next.rifa) || LVA_PAYROLL_RIFA,
          },
          { lavega: true }
        );
      } else {
        next = computePayrollLineTotals(next, { lavega: true });
      }
      return next;
    });
    if (cleaned) {
      p.updatedAt = new Date().toISOString();
      saveContabilidadData(true);
    }
  }
  const cols = getPayrollEditorCols(p);
  const lines = p.lines || [];
  const namedCount = payrollLinesForTotals(lines).length;
  const totals = {
    salaryMonthly: sumPayrollField(lines, "salaryMonthly"),
    salaryQuincena: sumPayrollField(lines, "salaryQuincena"),
    sfs: sumPayrollField(lines, "sfs"),
    uniformes: sumPayrollField(lines, "uniformes"),
    volaos: sumPayrollField(lines, "volaos"),
    incentivos: sumPayrollField(lines, "incentivos"),
    horasExtras: sumPayrollField(lines, "horasExtras"),
    feriado: sumPayrollField(lines, "feriado"),
    almuerzo: payrollIsLavega(p)
      ? roundMoney2(payrollLinesForTotals(lines).reduce((acc, l) => acc + almuerzoSvdaAmount(l), 0))
      : sumPayrollField(lines, "almuerzo"),
    rifa: sumPayrollField(lines, "rifa"),
    adelantos: sumPayrollField(lines, "adelantos"),
    prestamos: sumPayrollField(lines, "prestamos"),
    totalDescuentos: sumPayrollField(lines, "totalDescuentos"),
    totalCobrar: sumPayrollField(lines, "totalCobrar"),
    salarioDepositar: sumPayrollField(lines, "salarioDepositar"),
    redondeo: sumPayrollField(lines, "redondeo"),
    unifRifa: roundMoney2(sumPayrollField(lines, "uniformes") + sumPayrollField(lines, "rifa")),
  };
  const head =
    cols
      .map(([key, label, kind]) => {
        let cls = "nomina-col-fit";
        if (key === "fullName") cls = "sticky-name";
        else if (key === "sfs") cls = "nomina-col-fit nomina-col-sfs";
        else if (key === "redondeo") cls = "nomina-col-fit nomina-col-redondeo";
        else if (kind === "days") cls = "nomina-col-fit nomina-col-days";
        const tip =
          kind === "almuerzoSvda"
            ? `${label} · comida editable / SVDA fijo ${LVA_PAYROLL_SVDA}`
            : label;
        return `<th class="${cls}" title="${escapeHtml(tip)}">${escapeHtml(label)}</th>`;
      })
      .join("") +
    `<th class="nomina-col-del" title="Eliminar fila (no se imprime)">−</th>`;
  const body = lines
    .map((l, idx) => {
      const empty = !payrollLineHasEmployeeName(l);
      const tds = cols
        .map(([key, , kind]) => {
          if (key === "fullName") {
            return `<td class="sticky-name"><input class="nomina-inp nomina-inp-wide" data-f="fullName" type="text" value="${escapeHtml(
              String(l.fullName || "")
            )}" /></td>`;
          }
          let fit = "nomina-col-fit";
          if (key === "sfs") fit += " nomina-col-sfs";
          if (key === "redondeo") fit += " nomina-col-redondeo";
          if (kind === "ro") {
            return `<td class="right ${fit}" data-ro="${key}">${escapeHtml(moneyCell(l[key]))}</td>`;
          }
          if (kind === "unifRifa") {
            return `<td class="${fit}"><input class="nomina-inp nomina-inp-unifrifa" data-f="unifRifa" type="text" inputmode="decimal" placeholder="115/85" value="${escapeHtml(
              formatUnifRifa(l)
            )}" title="Uniforme/Rifa (uniforme editable · rifa fija 85)" /></td>`;
          }
          if (kind === "almuerzoSvda") {
            return `<td class="${fit}"><input class="nomina-inp nomina-inp-unifrifa" data-f="almuerzoSvda" type="text" inputmode="decimal" placeholder="0/${LVA_PAYROLL_SVDA}" value="${escapeHtml(
              formatAlmuerzoSvda(l)
            )}" title="Comida editable / SVDA fijo ${LVA_PAYROLL_SVDA} (ambas suman)" /></td>`;
          }
          const cls = kind === "days" ? "nomina-inp nomina-inp-days" : kind === "text" ? "nomina-inp nomina-inp-ced" : "nomina-inp";
          const val = l[key] == null ? "" : l[key];
          const type = kind === "num" ? "number" : "text";
          const step = kind === "num" ? ' step="0.01" min="0"' : "";
          return `<td class="${fit}"><input class="${cls}" data-f="${key}" type="${type}"${step} value="${escapeHtml(
            String(val)
          )}" /></td>`;
        })
        .join("");
      return `<tr data-line-idx="${idx}" class="${empty ? "nomina-row-empty" : ""}">${tds}<td class="nomina-col-del"><button type="button" class="btn-row-del" data-idx="${idx}" title="Eliminar fila" aria-label="Eliminar fila">−</button></td></tr>`;
    })
    .join("");
  const totalRow =
    cols
      .map(([key, , kind]) => {
        if (key === "daysWorked") return `<td class="nomina-col-fit"><strong>TOTAL</strong></td>`;
        if (key === "cedula") return `<td class="nomina-col-fit"></td>`;
        if (key === "fullName") return `<td class="sticky-name"></td>`;
        if (key === "unifRifa") {
          return `<td class="right nomina-col-fit" data-ro="unifRifa">${escapeHtml(moneyCell(totals.unifRifa))}</td>`;
        }
        if (kind === "almuerzoSvda") {
          return `<td class="right nomina-col-fit" data-ro="almuerzo">${escapeHtml(moneyCell(totals.almuerzo))}</td>`;
        }
        if (key === "redondeo") {
          return `<td class="right nomina-col-fit nomina-col-redondeo nomina-total-redondeo" data-ro="redondeo"><strong>${escapeHtml(
            moneyPlain(totals.redondeo || 0) || "0"
          )}</strong></td>`;
        }
        if (key === "sfs") {
          return `<td class="right nomina-col-fit nomina-col-sfs">${escapeHtml(moneyCell(totals.sfs))}</td>`;
        }
        return `<td class="right nomina-col-fit">${escapeHtml(moneyCell(totals[key]))}</td>`;
      })
      .join("") + `<td class="nomina-col-del"></td>`;
  const openMeta = payrollGroupMeta(
    p.group === "lavega" || (!p.group && String(p.note || "").toLowerCase().includes("vega"))
      ? "lavega"
      : p.group || getSelectedPayrollGroup()
  );
  const exportPaper = getPayrollPaperForExport(p);
  const paperLabel = exportPaper === "letter" ? "Carta" : "Legal";
  const isOfficeOpen = payrollIsOffice(p);
  const helpLine = isOfficeOpen
    ? `Pago ${escapeHtml(p.payDate || "—")} · ${
        p.status === "paid" ? "Pagada" : "Borrador"
      } · ${namedCount}/${lines.length} con nombre. Nombre = 1 nombre + 1 apellido · Quincena = sueldo/2 · SFS RD$ ${OFFICE_PAYROLL_SFS}. Impresión ${paperLabel} horizontal.`
    : `Pago ${escapeHtml(p.payDate || "—")} · ${
        p.status === "paid" ? "Pagada" : "Borrador"
      } · ${namedCount}/${lines.length} con nombre. Nombre = nombre + 1 apellido. Unif/Rifa 115/85.${
        payrollIsLavega(p)
          ? ` Almuerzo/SVDA = comida (editable) + SVDA fijo RD$ ${LVA_PAYROLL_SVDA}; ambas suman.`
          : ""
      } Feriado ${p.showFeriado ? "ON" : "OFF"}. Impresión centrada (${paperLabel}) sin cédula ni RD$.`;
  detail.innerHTML = `
    <h2>NOMINA REACTION · ${escapeHtml(openMeta.title)} · ${escapeHtml(halfLabel(p.half || 1).toUpperCase())} · ${escapeHtml(
      monthLabel(p.period).toUpperCase()
    )}</h2>
    <p class="muted tight">${helpLine}</p>
    ${
      isOfficeOpen
        ? ""
        : `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 10px">
      <button type="button" class="btn secondary btn-sm" id="btnToggleFeriado" style="width:auto">${
        p.showFeriado ? "Ocultar feriado" : "Habilitar feriado"
      }</button>
    </div>`
    }
    <div class="nomina-table-wrap${isOfficeOpen ? " nomina-table-wrap-office" : ""}">
      <table class="nomina-table${isOfficeOpen ? " nomina-table-office" : ""}">
        <thead><tr>${head}</tr></thead>
        <tbody>${body || `<tr><td colspan="${cols.length + 1}">Sin líneas</td></tr>`}</tbody>
        <tfoot><tr class="nomina-total-row">${totalRow}</tr></tfoot>
      </table>
    </div>
    <p style="margin-top:12px" data-nomina-total-summary><strong>Total redondeo: ${escapeHtml(moneyRd(totals.redondeo))}</strong>
      <span class="muted"> · A depositar ${escapeHtml(moneyRd(totals.salarioDepositar))} · A cobrar ${escapeHtml(
        moneyRd(totals.totalCobrar)
      )} · ${namedCount} con nombre (auto)</span></p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:end">
      <label class="muted tight" style="margin:0">Hoja
        <select id="contabPayrollPaper2" style="display:block;margin-top:4px"${isOfficeOpen ? " disabled" : ""}>
          <option value="legal"${exportPaper === "legal" ? " selected" : ""}>Legal</option>
          <option value="letter"${exportPaper === "letter" ? " selected" : ""}>Carta</option>
        </select>
      </label>
      <button type="button" class="btn secondary" id="btnContabPrintPayroll2" style="width:auto">Imprimir ↔</button>
      <button type="button" class="btn secondary" id="btnContabDownloadPayroll2" style="width:auto">Descargar PDF</button>
      <button type="button" class="btn secondary" id="btnContabSharePayroll2" style="width:auto">Compartir PDF</button>
      <button type="button" class="btn secondary" id="btnContabMailPayroll2" style="width:auto">Correo / Gmail</button>
    </div>`;
  document.querySelectorAll(".btn-row-del").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      removePayrollLineAt(btn.dataset.idx);
    });
  });
  document.getElementById("btnToggleFeriado")?.addEventListener("click", togglePayrollFeriado);
  document.getElementById("contabPayrollPaper2")?.addEventListener("change", (ev) => {
    const main = document.getElementById("contabPayrollPaper");
    if (main) main.value = ev.target.value;
  });
  document.getElementById("btnContabPrintPayroll2")?.addEventListener("click", () => printOpenPayrollSheet());
  document.getElementById("btnContabDownloadPayroll2")?.addEventListener("click", () => {
    downloadOpenPayrollPdf().catch(() => {});
  });
  document.getElementById("btnContabSharePayroll2")?.addEventListener("click", () => {
    shareOpenPayrollSheet().catch(() => {});
  });
  document.getElementById("btnContabMailPayroll2")?.addEventListener("click", () => {
    emailOpenPayrollPdf().catch(() => {});
  });
  const detailRoot = document.getElementById("contabPayrollDetail");
  if (detailRoot) detailRoot.dataset.liveBound = "";
  bindPayrollLiveTotals();
}

function renderContabilidadModule() {
  if (!canAccessContabilidad()) return;
  ensureMonthFilter();
  const summary = document.getElementById("contabSummary");
  if (summary) {
    summary.textContent = `${monthLabel(getSelectedMonth())} · Gastos con NCF, ITBIS cobrado, liquidación DGII y nómina La Vega.`;
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
  document.getElementById("btnOempGenPayroll")?.addEventListener("click", () => {
    const groupSel = document.getElementById("contabPayrollGroup");
    if (groupSel) groupSel.value = "oficina";
    // Misma lógica quincenal (01–15 / 16–fin); por defecto la quincena seleccionada o 01–15
    const halfSel = document.getElementById("contabPayrollHalf");
    if (halfSel && !halfSel.value) halfSel.value = "1";
    generateOfficePayroll();
  });
  document.getElementById("btnContabGenPayroll")?.addEventListener("click", generateOfficePayroll);
  document.getElementById("btnContabSavePayroll")?.addEventListener("click", saveOpenPayrollEdits);
  document.getElementById("btnContabAddRows")?.addEventListener("click", addBlankPayrollRows);
  document.getElementById("btnContabPrintPayroll")?.addEventListener("click", () => printOpenPayrollSheet());
  document.getElementById("btnContabDownloadPayroll")?.addEventListener("click", () => {
    downloadOpenPayrollPdf().catch(() => {});
  });
  document.getElementById("btnContabSharePayroll")?.addEventListener("click", () => {
    shareOpenPayrollSheet().catch(() => {});
  });
  document.getElementById("btnContabMailPayroll")?.addEventListener("click", () => {
    emailOpenPayrollPdf().catch(() => {});
  });
  document.getElementById("contabPayrollGroup")?.addEventListener("change", () => {
    const period = getSelectedMonth();
    const half = getSelectedPayrollHalf();
    const group = getSelectedPayrollGroup();
    syncPayrollPaperUiForGroup(group);
    const found = findPayrollByGroup(period, half, group);
    selectedPayrollId = found ? found.id : "";
    renderNominaTab();
  });
  document.getElementById("contabPayrollHalf")?.addEventListener("change", () => {
    const period = getSelectedMonth();
    const half = getSelectedPayrollHalf();
    const group = getSelectedPayrollGroup();
    const found = findPayrollByGroup(period, half, group);
    selectedPayrollId = found ? found.id : selectedPayrollId;
    renderNominaTab();
  });
  document.getElementById("contabPayrollPaper")?.addEventListener("change", () => {
    const detailPaper = document.getElementById("contabPayrollPaper2");
    const main = document.getElementById("contabPayrollPaper");
    if (detailPaper && main) detailPaper.value = main.value;
  });
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
