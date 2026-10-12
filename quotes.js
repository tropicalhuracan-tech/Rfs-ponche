/* ==== MÓDULO COTIZACIONES / PROPUESTAS ==== */
const QUOTES_KEY = "rfs-ops-quotes";
const QUOTE_DAYS = 30;
const QUOTE_ITBIS = 0.18;

const RFS_COMPANY = {
  name: "Reaction Force Security, S.R.L.",
  slogan: "Tu mejor alternativa de seguridad",
  rnc: "1-31-14462-4",
  license: "Licencia de Operación No. 279",
  address: "Calle Penetración No. 2, sector El Paraíso, Gurabo, Santiago, R.D.",
  phones: "809-581-8181 / 809-694-3232",
  email: "reactionforce45@gmail.com",
  signer: "Edward Cruz",
};

/** Clientes de referencia (extraídos del material RFS) */
const QUOTE_REF_CLIENTS = [
  "Acero Estrella",
  "Auto Chang",
  "Bancas La Suerte",
  "Casa Yanet",
  "Distribuidora 2000",
  "Fraga Industrial",
  "Monorriel de Santiago",
  "Óptica Klaridad",
  "Productos María",
  "Universidad ISA",
  "Vial Gas",
  "Vidmetal",
];

const QUOTE_MODELS = [
  {
    id: "ejecutiva",
    label: "Modelo 1 — Ejecutiva",
    blurb: "Propuesta comercial completa: presentación, alcance, inversión y clientes.",
  },
  {
    id: "cotizacion",
    label: "Modelo 2 — Cotización formal",
    blurb: "Carta breve con tabla de servicio, subtotal, ITBIS y total.",
  },
  {
    id: "institucional",
    label: "Modelo 3 — Institucional",
    blurb: "Enfoque en cobertura, beneficios y detalle económico para el cliente.",
  },
];

let quotesHistory = [];
let selectedQuoteModel = "ejecutiva";

function moneyRD(n) {
  const v = Number(n);
  const safe = Number.isFinite(v) ? v : 0;
  return `RD$${safe.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function emptyQuoteForm() {
  return {
    modelId: "ejecutiva",
    clientName: "",
    clientRnc: "",
    menCount: 1,
    shiftHours: 12,
    hourlyRate: 155,
    discountType: "none",
    discountValue: 0,
    note: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

function calcQuoteTotals(input = {}) {
  const men = Math.max(0, Number(input.menCount) || 0);
  const hours = Number(input.shiftHours) === 24 ? 24 : 12;
  const rate = Math.max(0, Number(input.hourlyRate) || 0);
  const days = QUOTE_DAYS;
  const hoursMonth = men * hours * days;
  const gross = hoursMonth * rate;

  let discount = 0;
  const dtype = input.discountType || "none";
  const dval = Math.max(0, Number(input.discountValue) || 0);
  if (dtype === "percent") discount = gross * (Math.min(dval, 100) / 100);
  else if (dtype === "amount") discount = Math.min(dval, gross);

  const subtotal = Math.max(0, gross - discount);
  const itbis = subtotal * QUOTE_ITBIS;
  const total = subtotal + itbis;

  return {
    men,
    hours,
    days,
    rate,
    hoursMonth,
    gross,
    discount,
    discountType: dtype,
    discountValue: dval,
    subtotal,
    itbis,
    total,
  };
}

function loadQuotesHistory() {
  try {
    const raw = localStorage.getItem(QUOTES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    quotesHistory = Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    quotesHistory = [];
  }
  return quotesHistory;
}

function saveQuotesHistory() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotesHistory.slice(0, 80)));
}

function readQuoteForm() {
  const modelId = selectedQuoteModel || document.querySelector(".quote-model-card.active")?.dataset.model || "ejecutiva";
  const discountType = document.getElementById("quoteDiscountType")?.value || "none";
  return {
    modelId,
    clientName: String(document.getElementById("quoteClientName")?.value || "").trim(),
    clientRnc: String(document.getElementById("quoteClientRnc")?.value || "").trim(),
    menCount: Number(document.getElementById("quoteMenCount")?.value || 0),
    shiftHours: Number(document.getElementById("quoteShiftHours")?.value || 12),
    hourlyRate: Number(document.getElementById("quoteHourlyRate")?.value || 0),
    discountType,
    discountValue: Number(document.getElementById("quoteDiscountValue")?.value || 0),
    note: String(document.getElementById("quoteNote")?.value || "").trim(),
    date: document.getElementById("quoteDate")?.value || new Date().toISOString().slice(0, 10),
    preparedBy:
      (typeof currentUser !== "undefined" && currentUser && (currentUser.displayName || currentUser.username)) ||
      RFS_COMPANY.signer,
  };
}

function formatQuoteDate(iso) {
  try {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" });
  } catch (_) {
    return iso;
  }
}

function quoteClientsBlock() {
  return QUOTE_REF_CLIENTS.join(" · ");
}

function quoteNoteBlock() {
  return `Los valores fueron calculados para un período de ${QUOTE_DAYS} días. La facturación puede variar en meses de 28, 29 o 31 días, así como por la incidencia de días feriados, conforme al calendario y a las condiciones del servicio.`;
}

function buildQuoteHeader(data) {
  // El logo ya lo pone openPrintWindow; aquí van datos de empresa
  return `
    <p style="margin:0 0 12px;color:#444;font-size:12px">
      <strong>${escapeHtml(RFS_COMPANY.name)}</strong> · “${escapeHtml(RFS_COMPANY.slogan)}”<br/>
      RNC: ${escapeHtml(RFS_COMPANY.rnc)} · ${escapeHtml(RFS_COMPANY.license)}<br/>
      ${escapeHtml(RFS_COMPANY.address)}<br/>
      Tel: ${escapeHtml(RFS_COMPANY.phones)} · ${escapeHtml(RFS_COMPANY.email)}
    </p>`;
}

function buildQuoteTotalsTable(data, calc) {
  const discountRow =
    calc.discount > 0
      ? `<tr><td colspan="3"><strong>Descuento especial${
          calc.discountType === "percent" ? ` (${calc.discountValue}%)` : ""
        }</strong></td><td class="right">− ${moneyRD(calc.discount)}</td></tr>`
      : "";
  return `
    <table>
      <thead>
        <tr>
          <th>Servicio</th>
          <th>Cant. hombres</th>
          <th>Detalle</th>
          <th class="right">Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Seguridad privada · ${calc.hours} horas</td>
          <td>${calc.men}</td>
          <td>${calc.hours} h × ${calc.days} días × ${moneyRD(calc.rate)}/h</td>
          <td class="right">${moneyRD(calc.gross)}</td>
        </tr>
        ${discountRow}
        <tr><td colspan="3"><strong>Subtotal</strong></td><td class="right"><strong>${moneyRD(calc.subtotal)}</strong></td></tr>
        <tr><td colspan="3">ITBIS (18%)</td><td class="right">${moneyRD(calc.itbis)}</td></tr>
        <tr><td colspan="3"><strong>TOTAL MENSUAL</strong></td><td class="right"><strong>${moneyRD(calc.total)}</strong></td></tr>
      </tbody>
    </table>`;
}

function buildModelEjecutiva(data, calc) {
  const shiftLabel = calc.hours === 24 ? "24 horas (recomendado)" : "12 horas";
  return `
    ${buildQuoteHeader(data)}
    <h2 style="margin:0 0 6px">Propuesta ejecutiva de servicios de seguridad privada</h2>
    <p style="margin:0 0 14px;color:#444">Santiago, ${escapeHtml(formatQuoteDate(data.date))}</p>
    <div class="meta">
      <div><strong>Cliente</strong><br/>${escapeHtml(data.clientName)}</div>
      <div><strong>RNC</strong><br/>${escapeHtml(data.clientRnc || "—")}</div>
      <div><strong>Modalidad</strong><br/>${escapeHtml(shiftLabel)}</div>
      <div><strong>Personal</strong><br/>${calc.men} hombre${calc.men === 1 ? "" : "s"}</div>
    </div>

    <h3>Presentación</h3>
    <p>Reaction Force Security agradece la oportunidad de presentar esta propuesta comercial. Nuestro objetivo es brindar un servicio de seguridad privada confiable, preventivo y orientado a la protección de las personas, instalaciones y activos de nuestros clientes, respaldado por personal profesional y una supervisión permanente.</p>

    <h3>¿Quiénes somos?</h3>
    <p>Reaction Force Security cuenta con más de 12 años de experiencia en el sector de la seguridad privada. La empresa opera bajo la ${escapeHtml(
      RFS_COMPANY.license
    )}, emitida por la Superintendencia de Vigilancia y Seguridad Privada. Oficinas: ${escapeHtml(
    RFS_COMPANY.address
  )}.</p>
    <p>Disponemos de personal previamente evaluado y capacitado, armas con su licencia operativa correspondiente, supervisión constante y seguro de responsabilidad civil por daños a terceros.</p>

    <h3>Alcance del servicio</h3>
    <ul>
      <li>Vigilancia física y control de accesos</li>
      <li>Supervisión operativa permanente</li>
      <li>Reportes diarios de novedades</li>
      <li>Reemplazos por vacaciones y licencias</li>
      <li>Personal uniformado y debidamente identificado</li>
    </ul>

    <h3>Inversión del servicio</h3>
    ${buildQuoteTotalsTable(data, calc)}
    <p class="footer">${escapeHtml(quoteNoteBlock())}</p>
    ${data.note ? `<p><strong>Nota adicional:</strong> ${escapeHtml(data.note)}</p>` : ""}

    <h3>Algunos de nuestros clientes</h3>
    <p>${escapeHtml(quoteClientsBlock())}</p>

    <h3>Nuestra recomendación</h3>
    <p>${
      calc.hours === 24
        ? "La modalidad de 24 horas proporciona cobertura continua, mayor capacidad de respuesta y una mejor relación costo-beneficio."
        : "La modalidad de 12 horas cubre el turno acordado con personal profesional y supervisión permanente. Si requiere cobertura continua, recomendamos evaluar la opción de 24 horas."
    }</p>

    <h3>Mensaje final</h3>
    <p>Agradecemos el tiempo dedicado a evaluar nuestra propuesta. Será un honor contar con la confianza de <strong>${escapeHtml(
      data.clientName
    )}</strong> y contribuir a la seguridad de sus operaciones.</p>

    <p style="margin-top:18px"><strong>Contacto:</strong> ${escapeHtml(RFS_COMPANY.phones)} · ${escapeHtml(RFS_COMPANY.email)}</p>
    <div class="sign-box">
      <div><div class="sign-line">${escapeHtml(data.preparedBy || RFS_COMPANY.signer)}<br/>Reaction Force Security</div></div>
      <div><div class="sign-line">Recibido por el cliente<br/>Nombre / Firma</div></div>
    </div>`;
}

function buildModelCotizacion(data, calc) {
  return `
    ${buildQuoteHeader(data)}
    <p style="margin:0 0 12px">Santiago, Rep. Dom. · ${escapeHtml(formatQuoteDate(data.date))}</p>
    <p style="margin:0 0 4px"><strong>Señores:</strong> ${escapeHtml(data.clientName)}</p>
    ${data.clientRnc ? `<p style="margin:0 0 12px"><strong>RNC:</strong> ${escapeHtml(data.clientRnc)}</p>` : ""}
    <p>Después de saludarles, le remitimos la cotización requerida para el servicio de seguridad privada.</p>
    <h2 style="margin:16px 0 8px">Cotización</h2>
    ${buildQuoteTotalsTable(data, calc)}
    <p class="footer" style="margin-top:12px">${escapeHtml(quoteNoteBlock())}</p>
    ${data.note ? `<p><strong>Nota:</strong> ${escapeHtml(data.note)}</p>` : ""}
    <p style="margin-top:14px"><strong>Algunos de nuestros clientes:</strong> ${escapeHtml(quoteClientsBlock())}</p>
    <p style="margin-top:18px">Atentamente,</p>
    <div class="sign-box">
      <div><div class="sign-line">${escapeHtml(data.preparedBy || "Gerente de ventas")}<br/>${escapeHtml(
    RFS_COMPANY.name
  )}<br/>Tel: ${escapeHtml(RFS_COMPANY.phones)}<br/>${escapeHtml(RFS_COMPANY.email)}</div></div>
      <div></div>
    </div>`;
}

function buildModelInstitucional(data, calc) {
  return `
    ${buildQuoteHeader(data)}
    <h2 style="margin:0 0 6px">Propuesta de servicios de seguridad</h2>
    <p style="margin:0 0 14px;color:#444">Santiago de los Caballeros, ${escapeHtml(formatQuoteDate(data.date))}</p>
    <p><strong>Señores:</strong> ${escapeHtml(data.clientName)}${
    data.clientRnc ? ` · RNC ${escapeHtml(data.clientRnc)}` : ""
  }</p>
    <p>En nombre de ${escapeHtml(
      RFS_COMPANY.name
    )}, nos complace presentar nuestra propuesta de servicios de seguridad, orientada a brindar protección integral a sus instalaciones. Detallamos cobertura, personal asignado y esquema económico, con el compromiso de profesionalidad, supervisión y respuesta inmediata.</p>

    <h3>Presentación de la empresa</h3>
    <p>REACTION FORCE SECURITY es una empresa especializada en seguridad privada, con experiencia en resguardo de instalaciones de alta importancia. Contamos con personal capacitado y armado, supervisión permanente y ${escapeHtml(
      RFS_COMPANY.license
    )}.</p>

    <h3>Objetivo</h3>
    <p>Brindar un servicio integral de seguridad a <strong>${escapeHtml(
      data.clientName
    )}</strong>, garantizando la protección de personas, activos e instalaciones mediante agentes asignados según la modalidad contratada.</p>

    <h3>Cobertura propuesta</h3>
    <ul>
      <li><strong>${calc.men}</strong> hombre${calc.men === 1 ? "" : "s"} de seguridad</li>
      <li>Jornada de <strong>${calc.hours} horas</strong></li>
      <li>Cálculo base: <strong>${QUOTE_DAYS} días</strong> al mes</li>
      <li>Tarifa: <strong>${moneyRD(calc.rate)}</strong> por hora</li>
      <li>Supervisión operativa y reportes de novedades</li>
    </ul>

    <h3>Detalle económico</h3>
    ${buildQuoteTotalsTable(data, calc)}
    <p class="footer">${escapeHtml(quoteNoteBlock())}</p>
    ${data.note ? `<p><strong>Observaciones:</strong> ${escapeHtml(data.note)}</p>` : ""}

    <h3>Beneficios de elegirnos</h3>
    <ul>
      <li>Personal armado y capacitado</li>
      <li>Supervisión constante</li>
      <li>Reportes y control operativo</li>
      <li>Experiencia en proyectos de gran magnitud</li>
      <li>Respuesta inmediata ante incidencias</li>
    </ul>

    <h3>Algunos de nuestros clientes</h3>
    <p>${escapeHtml(quoteClientsBlock())}</p>

    <p style="margin-top:16px">${escapeHtml(RFS_COMPANY.name)} reitera su compromiso de ser la mejor alternativa de seguridad para ${escapeHtml(
    data.clientName
  )}.</p>
    <p><strong>Contacto:</strong> ${escapeHtml(RFS_COMPANY.phones)} · ${escapeHtml(RFS_COMPANY.email)}</p>
    <div class="sign-box">
      <div><div class="sign-line">${escapeHtml(data.preparedBy || RFS_COMPANY.signer)}<br/>${escapeHtml(
    RFS_COMPANY.name
  )}</div></div>
      <div><div class="sign-line">Aceptación del cliente<br/>Nombre / Firma / Sello</div></div>
    </div>`;
}

function buildQuoteBodyHtml(data, calc) {
  if (data.modelId === "cotizacion") return buildModelCotizacion(data, calc);
  if (data.modelId === "institucional") return buildModelInstitucional(data, calc);
  return buildModelEjecutiva(data, calc);
}

function updateQuoteTotalsUi() {
  const data = readQuoteForm();
  const calc = calcQuoteTotals(data);
  const box = document.getElementById("quoteTotalsBox");
  if (!box) return;
  box.innerHTML = `
    <div class="detail-grid">
      <div><span>Horas / mes</span><strong>${calc.hoursMonth.toLocaleString("es-DO")}</strong></div>
      <div><span>Bruto</span><strong>${moneyRD(calc.gross)}</strong></div>
      <div><span>Descuento</span><strong>${calc.discount ? "− " + moneyRD(calc.discount) : "—"}</strong></div>
      <div><span>Subtotal</span><strong>${moneyRD(calc.subtotal)}</strong></div>
      <div><span>ITBIS 18%</span><strong>${moneyRD(calc.itbis)}</strong></div>
      <div><span>Total mensual</span><strong>${moneyRD(calc.total)}</strong></div>
    </div>
    <p class="muted tight" style="margin-top:8px">Cálculo fijo a ${QUOTE_DAYS} días · ${calc.men} hombre(s) · ${calc.hours} h</p>`;
}

function selectQuoteModel(modelId) {
  selectedQuoteModel = QUOTE_MODELS.some((m) => m.id === modelId) ? modelId : "ejecutiva";
  document.querySelectorAll(".quote-model-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.model === selectedQuoteModel);
  });
  updateQuoteTotalsUi();
}

function renderQuoteModelCards() {
  const box = document.getElementById("quoteModelCards");
  if (!box) return;
  box.innerHTML = QUOTE_MODELS.map(
    (m) => `<button type="button" class="quote-model-card${m.id === selectedQuoteModel ? " active" : ""}" data-model="${m.id}">
      <strong>${escapeHtml(m.label)}</strong>
      <span>${escapeHtml(m.blurb)}</span>
    </button>`
  ).join("");
  box.querySelectorAll(".quote-model-card").forEach((btn) => {
    btn.addEventListener("click", () => selectQuoteModel(btn.dataset.model));
  });
}

function renderQuotesHistory() {
  const list = document.getElementById("quoteHistoryList");
  if (!list) return;
  const items = loadQuotesHistory();
  if (!items.length) {
    list.innerHTML = `<p class="empty">Aún no hay cotizaciones guardadas en este equipo.</p>`;
    return;
  }
  list.innerHTML = items
    .map((q) => {
      const calc = calcQuoteTotals(q);
      const model = QUOTE_MODELS.find((m) => m.id === q.modelId);
      return `<article class="report-card">
        <h3>${escapeHtml(q.clientName || "Sin cliente")}</h3>
        <p class="muted">${escapeHtml(model?.label || q.modelId)} · ${escapeHtml(q.date || "")} · ${calc.men} homb. · ${calc.hours}h</p>
        <p><strong>${moneyRD(calc.total)}</strong> <span class="muted">(con ITBIS)</span></p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          <button type="button" class="btn secondary btn-quote-load" data-id="${escapeHtml(q.id)}" style="width:auto;padding:8px 10px;font-size:12px">Cargar</button>
          <button type="button" class="btn primary btn-quote-reprint" data-id="${escapeHtml(q.id)}" style="width:auto;padding:8px 10px;font-size:12px">Imprimir</button>
        </div>
      </article>`;
    })
    .join("");
  list.querySelectorAll(".btn-quote-load").forEach((btn) => {
    btn.addEventListener("click", () => loadQuoteIntoForm(btn.dataset.id));
  });
  list.querySelectorAll(".btn-quote-reprint").forEach((btn) => {
    btn.addEventListener("click", () => reprintSavedQuote(btn.dataset.id));
  });
}

function fillQuoteForm(data) {
  const d = { ...emptyQuoteForm(), ...(data || {}) };
  selectedQuoteModel = d.modelId || "ejecutiva";
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  set("quoteClientName", d.clientName || "");
  set("quoteClientRnc", d.clientRnc || "");
  set("quoteMenCount", d.menCount ?? 1);
  set("quoteShiftHours", d.shiftHours === 24 ? 24 : 12);
  set("quoteHourlyRate", d.hourlyRate ?? 155);
  set("quoteDiscountType", d.discountType || "none");
  set("quoteDiscountValue", d.discountValue || 0);
  set("quoteNote", d.note || "");
  set("quoteDate", d.date || new Date().toISOString().slice(0, 10));
  renderQuoteModelCards();
  toggleQuoteDiscountField();
  updateQuoteTotalsUi();
}

function loadQuoteIntoForm(id) {
  const q = quotesHistory.find((x) => x.id === id);
  if (!q) return;
  fillQuoteForm(q);
  toast("Cotización cargada. Puedes ajustar e imprimir.");
}

function reprintSavedQuote(id) {
  const q = quotesHistory.find((x) => x.id === id);
  if (!q) return;
  printQuoteProposal(q);
}

function toggleQuoteDiscountField() {
  const type = document.getElementById("quoteDiscountType")?.value || "none";
  const wrap = document.getElementById("quoteDiscountValueWrap");
  if (wrap) wrap.hidden = type === "none";
}

function validateQuoteForm(data, calc) {
  if (!data.clientName) {
    toast("Escribe el nombre del cliente.");
    return false;
  }
  if (!calc.men || calc.men < 1) {
    toast("Indica la cantidad de hombres (mínimo 1).");
    return false;
  }
  if (!calc.rate || calc.rate <= 0) {
    toast("Indica el precio por hora.");
    return false;
  }
  return true;
}

function persistQuote(data, calc) {
  const row = {
    ...data,
    id: data.id || `quote-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: data.createdAt || new Date().toISOString(),
    total: calc.total,
  };
  quotesHistory = [row, ...quotesHistory.filter((q) => q.id !== row.id)].slice(0, 80);
  saveQuotesHistory();
  renderQuotesHistory();
  return row;
}

function printQuoteProposal(dataIn) {
  if (typeof openPrintWindow !== "function") {
    toast("No se pudo abrir la ventana de impresión.");
    return;
  }
  const data = dataIn || readQuoteForm();
  const calc = calcQuoteTotals(data);
  if (!validateQuoteForm(data, calc)) return;
  const saved = persistQuote(data, calc);
  const model = QUOTE_MODELS.find((m) => m.id === saved.modelId);
  const body = buildQuoteBodyHtml(saved, calc);
  openPrintWindow(model?.label || "Cotización RFS", body);
  if (typeof logActivity === "function") {
    logActivity(
      "quote_print",
      `Cotización ${saved.modelId}: ${saved.clientName} · ${calc.men} homb. · ${calc.hours}h · ${moneyRD(calc.total)}`
    );
  }
  toast("Propuesta lista para imprimir o guardar PDF.");
}

function renderQuotesModule() {
  loadQuotesHistory();
  if (!document.getElementById("quoteClientName")?.value) {
    fillQuoteForm(emptyQuoteForm());
  } else {
    renderQuoteModelCards();
    updateQuoteTotalsUi();
  }
  renderQuotesHistory();
}

function wireQuotesModule() {
  renderQuoteModelCards();
  fillQuoteForm(emptyQuoteForm());
  renderQuotesHistory();

  ["quoteClientName", "quoteClientRnc", "quoteMenCount", "quoteShiftHours", "quoteHourlyRate", "quoteDiscountValue", "quoteNote", "quoteDate"].forEach(
    (id) => {
      document.getElementById(id)?.addEventListener("input", updateQuoteTotalsUi);
      document.getElementById(id)?.addEventListener("change", updateQuoteTotalsUi);
    }
  );
  document.getElementById("quoteDiscountType")?.addEventListener("change", () => {
    toggleQuoteDiscountField();
    updateQuoteTotalsUi();
  });
  document.getElementById("btnQuotePrint")?.addEventListener("click", () => printQuoteProposal());
  document.getElementById("btnQuoteReset")?.addEventListener("click", () => {
    fillQuoteForm(emptyQuoteForm());
    toast("Formulario limpio.");
  });
}

/* Se conecta desde app.js al iniciar (necesita toast/escapeHtml/openPrintWindow). */
