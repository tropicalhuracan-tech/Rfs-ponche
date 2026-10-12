/* ==== MÓDULO COTIZACIONES / PROPUESTAS ==== */
const QUOTES_KEY = "rfs-ops-quotes";
const QUOTE_DAYS = 30;
const QUOTE_ITBIS = 0.18;
/** Cada hombre trabaja siempre 12 horas */
const QUOTE_HOURS_PER_MAN = 12;

const RFS_COMPANY = {
  name: "Reaction Force Security, S.R.L.",
  slogan: "Tu mejor alternativa de seguridad",
  rnc: "1-31-14462-4",
  license: "Licencia de Operación No. 279",
  address: "Calle Penetración No. 2, sector El Paraíso, Gurabo, Santiago, R.D.",
  phones: "809-581-8181 / 809-694-3232",
  email: "reactionforce45@gmail.com",
  signerTitle: "Gerente de ventas",
};

const QUOTE_REF_CLIENTS = [
  "Acero Estrella",
  "Auto Chang",
  "Bancas La Suerte",
  "Casa Yanet",
  "Distribuidora 2000",
  "El Navidón",
  "Fernández Cáceres Comercial",
  "Fraga Industrial",
  "Industrias Dominca",
  "Monorriel de Santiago",
  "Óptica Klaridad",
  "Productos María",
  "Residencial Casa Club Mediterráneo",
  "Residencial Paseo del Prado I",
  "Residencial Porto Sole",
  "Supermercado Central",
  "Tienda Concepto",
  "Universidad ISA",
  "Vial Gas",
  "Vidmetal",
];

const QUOTE_MODELS = [
  {
    id: "ejecutiva",
    label: "Modelo 1 — Ejecutiva",
    blurb:
      "Propuesta comercial completa: quiénes somos, tecnología (GPS + Ponche RFS), alcance, inversión, clientes y cierre persuasivo.",
  },
  {
    id: "cotizacion",
    label: "Modelo 2 — Cotización formal",
    blurb:
      "Carta formal con tabla clara de diurnos/nocturnos, horas, subtotal, ITBIS y total. Ideal para envío rápido.",
  },
  {
    id: "institucional",
    label: "Modelo 3 — Institucional",
    blurb:
      "Enfoque en cobertura, beneficios, supervisión y confianza de clientes institucionales y comerciales.",
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
    attentionTo: "",
    dayMen: 1,
    nightMen: 0,
    hourlyRate: 155,
    discountType: "none",
    discountValue: 0,
    includeItbis: true,
    note: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

function calcQuoteTotals(input = {}) {
  // Compat: cotizaciones viejas con menCount/shiftHours
  let dayMen = Math.max(0, Number(input.dayMen));
  let nightMen = Math.max(0, Number(input.nightMen));
  if (!Number.isFinite(dayMen)) dayMen = 0;
  if (!Number.isFinite(nightMen)) nightMen = 0;
  if (!dayMen && !nightMen && Number(input.menCount) > 0) {
    const legacyHours = Number(input.shiftHours) === 24 ? 24 : 12;
    const legacyMen = Math.max(0, Number(input.menCount) || 0);
    // Aprox: si era 24h con N "cupos", equivalía a N hombres de 12h en la lógica nueva
    // mantenemos menCount como total y lo ponemos en día por defecto
    dayMen = legacyMen;
    nightMen = 0;
    if (legacyHours === 24 && legacyMen >= 1) {
      // 24h legacy facturaba hours=24*men; nueva lógica men*12 — documentamos en UI
      dayMen = legacyMen;
    }
  }

  const men = dayMen + nightMen;
  const hoursPerMan = QUOTE_HOURS_PER_MAN;
  const hoursPerDay = men * hoursPerMan;
  const rate = Math.max(0, Number(input.hourlyRate) || 0);
  const days = QUOTE_DAYS;
  const hoursMonth = men * hoursPerMan * days;
  const gross = hoursMonth * rate;

  let discount = 0;
  const dtype = input.discountType || "none";
  const dval = Math.max(0, Number(input.discountValue) || 0);
  if (dtype === "percent") discount = gross * (Math.min(dval, 100) / 100);
  else if (dtype === "amount") discount = Math.min(dval, gross);

  const subtotal = Math.max(0, gross - discount);
  const includeItbis = input.includeItbis !== false;
  const itbis = includeItbis ? subtotal * QUOTE_ITBIS : 0;
  const total = subtotal + itbis;

  return {
    dayMen,
    nightMen,
    men,
    hoursPerMan,
    hoursPerDay,
    days,
    rate,
    hoursMonth,
    gross,
    discount,
    discountType: dtype,
    discountValue: dval,
    includeItbis,
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
    attentionTo: String(document.getElementById("quoteAttentionTo")?.value || "").trim(),
    dayMen: Number(document.getElementById("quoteDayMen")?.value || 0),
    nightMen: Number(document.getElementById("quoteNightMen")?.value || 0),
    hourlyRate: Number(document.getElementById("quoteHourlyRate")?.value || 0),
    discountType,
    discountValue: Number(document.getElementById("quoteDiscountValue")?.value || 0),
    includeItbis: !!document.getElementById("quoteIncludeItbis")?.checked,
    note: String(document.getElementById("quoteNote")?.value || "").trim(),
    date: document.getElementById("quoteDate")?.value || new Date().toISOString().slice(0, 10),
  };
}

function quoteCompanySignBlock() {
  return `<div class="sign-line">${escapeHtml(RFS_COMPANY.signerTitle)}<br/>${escapeHtml(RFS_COMPANY.name)}<br/>Tel: ${escapeHtml(
    RFS_COMPANY.phones
  )}<br/>${escapeHtml(RFS_COMPANY.email)}</div>`;
}

function quoteMandatoryNoteHtml() {
  return `<p class="footer" style="margin-top:14px;padding:10px;border:1px solid #ccc;background:#f7f7f7;font-size:11px;line-height:1.4"><strong>Nota importante:</strong> ${escapeHtml(
    quoteNoteBlock()
  )}</p>`;
}

function quoteAttentionHtml(data) {
  if (!data.attentionTo && !data.clientRnc) return "";
  return `
    <div class="meta" style="margin:8px 0 12px">
      ${data.clientRnc ? `<div><strong>RNC</strong><br/>${escapeHtml(data.clientRnc)}</div>` : ""}
      ${data.attentionTo ? `<div><strong>Atención a</strong><br/>${escapeHtml(data.attentionTo)}</div>` : ""}
    </div>`;
}

function formatQuoteDate(iso) {
  try {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" });
  } catch (_) {
    return iso;
  }
}

function quoteShiftLabel(calc) {
  const parts = [];
  if (calc.dayMen > 0) parts.push(`${calc.dayMen} diurno${calc.dayMen === 1 ? "" : "s"}`);
  if (calc.nightMen > 0) parts.push(`${calc.nightMen} nocturno${calc.nightMen === 1 ? "" : "s"}`);
  return parts.join(" + ") || "Sin personal";
}

function quoteNoteBlock() {
  return "Los valores fueron calculados para un período de 30 días. Cada hombre labora 12 horas por jornada. La facturación puede variar en meses de 28, 29 o 31 días, así como por la incidencia de días feriados, conforme al calendario y a las condiciones del servicio.";
}

function buildQuoteHeader() {
  return `
    <p style="margin:0 0 12px;color:#444;font-size:12px">
      <strong>${escapeHtml(RFS_COMPANY.name)}</strong> · “${escapeHtml(RFS_COMPANY.slogan)}”<br/>
      RNC: ${escapeHtml(RFS_COMPANY.rnc)} · ${escapeHtml(RFS_COMPANY.license)}<br/>
      ${escapeHtml(RFS_COMPANY.address)}<br/>
      Tel: ${escapeHtml(RFS_COMPANY.phones)} · ${escapeHtml(RFS_COMPANY.email)}
    </p>`;
}

function buildTechBlock() {
  return `
    <h3>Tecnología y control operativo</h3>
    <ul>
      <li><strong>Monitoreo con GPS:</strong> seguimiento de supervisión y recorridos para mayor control del servicio en tiempo real.</li>
      <li><strong>Aplicación exclusiva Ponche Reaction Force Security:</strong> registro digital de entrada y salida del personal, con evidencia operativa para la empresa y el cliente.</li>
      <li><strong>Entrega de reportes a clientes:</strong> novedades, incidencias y seguimiento del puesto, para que usted tenga visibilidad clara de lo que ocurre en su instalación.</li>
      <li><strong>Supervisión permanente:</strong> refuerzo operativo y respuesta ante irregularidades.</li>
    </ul>`;
}

function buildClientsBlock() {
  return `
    <h3>Algunos de nuestros clientes</h3>
    <p>La confianza de empresas e instituciones que ya operan con Reaction Force Security respalda nuestra propuesta. Trabajamos con clientes de alto tráfico, industria, comercio, residenciales y proyectos de infraestructura, manteniendo supervisión, disciplina y respuesta oportuna.</p>
    <p style="font-size:12px;line-height:1.45"><strong>Referencias:</strong> ${escapeHtml(QUOTE_REF_CLIENTS.join(" · "))}</p>
    <p style="margin:10px 0 6px;font-size:12px;color:#444">Logotipos / cartera de clientes (material RFS):</p>
    <div style="display:grid;gap:10px;margin:8px 0 14px">
      <img src="quote-assets/clientes-rfs-1.jpg" alt="Clientes Reaction Force Security 1"
        style="width:100%;max-width:640px;border:1px solid #ccc;border-radius:8px" />
      <img src="quote-assets/clientes-rfs-2.jpg" alt="Clientes Reaction Force Security 2"
        style="width:100%;max-width:640px;border:1px solid #ccc;border-radius:8px" />
    </div>
    <p style="font-size:12px;color:#444">Esta cartera demuestra experiencia comprobada y la tranquilidad de quienes ya nos eligieron como su aliado de seguridad.</p>`;
}

function buildQuoteTotalsTable(data, calc) {
  const discountRow =
    calc.discount > 0
      ? `<tr><td colspan="3"><strong>Descuento especial${
          calc.discountType === "percent" ? ` (${calc.discountValue}%)` : ""
        }</strong></td><td class="right">− ${moneyRD(calc.discount)}</td></tr>`
      : "";
  const serviceLines = [];
  if (calc.dayMen > 0) {
    serviceLines.push(
      `<tr>
        <td>Turno diurno · ${QUOTE_HOURS_PER_MAN} h/hombre</td>
        <td>${calc.dayMen}</td>
        <td>${calc.dayMen} × ${QUOTE_HOURS_PER_MAN} h × ${calc.days} días × ${moneyRD(calc.rate)}</td>
        <td class="right">${moneyRD(calc.dayMen * QUOTE_HOURS_PER_MAN * calc.days * calc.rate)}</td>
      </tr>`
    );
  }
  if (calc.nightMen > 0) {
    serviceLines.push(
      `<tr>
        <td>Turno nocturno · ${QUOTE_HOURS_PER_MAN} h/hombre</td>
        <td>${calc.nightMen}</td>
        <td>${calc.nightMen} × ${QUOTE_HOURS_PER_MAN} h × ${calc.days} días × ${moneyRD(calc.rate)}</td>
        <td class="right">${moneyRD(calc.nightMen * QUOTE_HOURS_PER_MAN * calc.days * calc.rate)}</td>
      </tr>`
    );
  }
  if (!serviceLines.length) {
    serviceLines.push(`<tr><td colspan="4">Sin personal asignado</td></tr>`);
  }
  return `
    <table>
      <thead>
        <tr>
          <th>Servicio</th>
          <th>Hombres</th>
          <th>Detalle</th>
          <th class="right">Importe</th>
        </tr>
      </thead>
      <tbody>
        ${serviceLines.join("")}
        <tr>
          <td colspan="3">Horas diarias totales (${calc.men} × ${QUOTE_HOURS_PER_MAN} h)</td>
          <td class="right"><strong>${calc.hoursPerDay} h/día</strong></td>
        </tr>
        <tr>
          <td colspan="3">Horas mensuales (${calc.hoursPerDay} × ${calc.days} días)</td>
          <td class="right"><strong>${calc.hoursMonth.toLocaleString("es-DO")} h</strong></td>
        </tr>
        ${discountRow}
        <tr><td colspan="3"><strong>Subtotal</strong></td><td class="right"><strong>${moneyRD(calc.subtotal)}</strong></td></tr>
        ${
          calc.includeItbis
            ? `<tr><td colspan="3">ITBIS (18%)</td><td class="right">${moneyRD(calc.itbis)}</td></tr>`
            : `<tr><td colspan="3">ITBIS</td><td class="right">No incluido</td></tr>`
        }
        <tr><td colspan="3"><strong>TOTAL MENSUAL</strong></td><td class="right"><strong>${moneyRD(calc.total)}</strong></td></tr>
      </tbody>
    </table>`;
}

function buildModelEjecutiva(data, calc) {
  return `
    ${buildQuoteHeader()}
    <h2 style="margin:0 0 6px">Propuesta ejecutiva de servicios de seguridad privada</h2>
    <p style="margin:0 0 14px;color:#444">Santiago, ${escapeHtml(formatQuoteDate(data.date))}</p>
    <div class="meta">
      <div><strong>Cliente</strong><br/>${escapeHtml(data.clientName)}</div>
      <div><strong>RNC</strong><br/>${escapeHtml(data.clientRnc || "—")}</div>
      <div><strong>Atención a</strong><br/>${escapeHtml(data.attentionTo || "—")}</div>
      <div><strong>Turnos</strong><br/>${escapeHtml(quoteShiftLabel(calc))}</div>
      <div><strong>Personal</strong><br/>${calc.men} hombre${calc.men === 1 ? "" : "s"} · ${calc.hoursPerDay} h/día</div>
    </div>

    <h3>Presentación</h3>
    <p>Reaction Force Security agradece la oportunidad de presentar esta propuesta comercial. Nuestro objetivo es brindar un servicio de seguridad privada confiable, preventivo y orientado a la protección de las personas, instalaciones y activos de nuestros clientes, respaldado por personal profesional, supervisión permanente y herramientas tecnológicas de control.</p>

    <h3>¿Quiénes somos?</h3>
    <p>Reaction Force Security cuenta con más de 12 años de experiencia en el sector de la seguridad privada. Operamos bajo la ${escapeHtml(
      RFS_COMPANY.license
    )}, emitida por la Superintendencia de Vigilancia y Seguridad Privada. Oficinas: ${escapeHtml(RFS_COMPANY.address)}.</p>
    <p>Disponemos de personal previamente evaluado y capacitado, armas con licencia operativa, supervisión constante y seguro de responsabilidad civil por daños a terceros. Nuestro compromiso es convertir la seguridad en un servicio medible, disciplinado y transparente para el cliente.</p>

    ${buildTechBlock()}

    <h3>Alcance del servicio</h3>
    <ul>
      <li>Vigilancia física y control de accesos</li>
      <li>Cobertura diurna y/o nocturna según el personal contratado (cada hombre: ${QUOTE_HOURS_PER_MAN} horas)</li>
      <li>Supervisión operativa permanente</li>
      <li>Reportes de novedades e incidencias para el cliente</li>
      <li>Reemplazos por vacaciones y licencias</li>
      <li>Personal uniformado y debidamente identificado</li>
    </ul>

    <h3>Inversión del servicio</h3>
    ${buildQuoteTotalsTable(data, calc)}
    ${quoteMandatoryNoteHtml()}
    ${data.note ? `<p><strong>Nota adicional:</strong> ${escapeHtml(data.note)}</p>` : ""}

    ${buildClientsBlock()}

    <h3>Nuestra recomendación</h3>
    <p>Definir la cantidad de hombres diurnos y nocturnos según el riesgo y el horario de su operación permite una cobertura precisa. Con monitoreo GPS, la app de ponche Reaction Force Security y la entrega de reportes, usted mantiene control real del servicio día a día.</p>

    <h3>Mensaje final</h3>
    <p>Agradecemos el tiempo dedicado a evaluar nuestra propuesta. En Reaction Force Security estamos convencidos de que podemos convertirnos en un aliado estratégico para la protección de <strong>${escapeHtml(
      data.clientName
    )}</strong>. Será un honor contar con su confianza.</p>

    <p style="margin-top:18px"><strong>Contacto:</strong> ${escapeHtml(RFS_COMPANY.phones)} · ${escapeHtml(RFS_COMPANY.email)}</p>
    <div class="sign-box">
      <div>${quoteCompanySignBlock()}</div>
      <div><div class="sign-line">Recibido por el cliente<br/>${
        data.attentionTo ? escapeHtml(data.attentionTo) + "<br/>" : ""
      }Nombre / Firma</div></div>
    </div>
    ${quoteMandatoryNoteHtml()}`;
}

function buildModelCotizacion(data, calc) {
  return `
    ${buildQuoteHeader()}
    <p style="margin:0 0 12px">Santiago, Rep. Dom. · ${escapeHtml(formatQuoteDate(data.date))}</p>
    <p style="margin:0 0 4px"><strong>Señores:</strong> ${escapeHtml(data.clientName)}</p>
    ${quoteAttentionHtml(data)}
    <p>Después de saludarles, le remitimos la cotización requerida para el servicio de seguridad privada, con personal diurno y/o nocturno, supervisión y herramientas de control (GPS, app de ponche Reaction Force Security y reportes al cliente).</p>
    <h2 style="margin:16px 0 8px">Cotización</h2>
    <p style="font-size:12px;color:#444;margin:0 0 8px">Turnos: <strong>${escapeHtml(
      quoteShiftLabel(calc)
    )}</strong> · Cada hombre: ${QUOTE_HOURS_PER_MAN} h · Horas/día: <strong>${calc.hoursPerDay}</strong></p>
    ${buildQuoteTotalsTable(data, calc)}
    ${quoteMandatoryNoteHtml()}
    ${data.note ? `<p><strong>Nota:</strong> ${escapeHtml(data.note)}</p>` : ""}
    ${buildTechBlock()}
    ${buildClientsBlock()}
    <p style="margin-top:18px">Atentamente,</p>
    <div class="sign-box">
      <div>${quoteCompanySignBlock()}</div>
      <div><div class="sign-line">Recibido por el cliente<br/>${
        data.attentionTo ? escapeHtml(data.attentionTo) + "<br/>" : ""
      }Nombre / Firma</div></div>
    </div>
    ${quoteMandatoryNoteHtml()}`;
}

function buildModelInstitucional(data, calc) {
  return `
    ${buildQuoteHeader()}
    <h2 style="margin:0 0 6px">Propuesta de servicios de seguridad</h2>
    <p style="margin:0 0 14px;color:#444">Santiago de los Caballeros, ${escapeHtml(formatQuoteDate(data.date))}</p>
    <p><strong>Señores:</strong> ${escapeHtml(data.clientName)}</p>
    ${quoteAttentionHtml(data)}
    <p>En nombre de ${escapeHtml(
      RFS_COMPANY.name
    )}, nos complace presentar nuestra propuesta de servicios de seguridad, orientada a brindar protección integral a sus instalaciones. Detallamos cobertura, personal (diurno/nocturno), logística tecnológica y esquema económico, con el compromiso de profesionalidad, supervisión y respuesta inmediata.</p>

    <h3>Presentación de la empresa</h3>
    <p>REACTION FORCE SECURITY es una empresa especializada en seguridad privada, con experiencia en resguardo de instalaciones de alta importancia: industria, comercio, residenciales, campus y proyectos de infraestructura. Contamos con personal capacitado y armado, supervisión permanente y ${escapeHtml(
      RFS_COMPANY.license
    )}.</p>

    <h3>Objetivo</h3>
    <p>Brindar un servicio integral de seguridad a <strong>${escapeHtml(
      data.clientName
    )}</strong>${
      data.attentionTo ? `, a la atención de <strong>${escapeHtml(data.attentionTo)}</strong>` : ""
    }, garantizando la protección de personas, activos e instalaciones mediante agentes asignados en turnos diurnos y/o nocturnos, con soporte de supervisión y evidencia digital del servicio.</p>

    <h3>Cobertura propuesta</h3>
    <ul>
      <li><strong>${calc.men}</strong> hombre${calc.men === 1 ? "" : "s"} de seguridad (${escapeHtml(quoteShiftLabel(calc))})</li>
      <li>Cada hombre labora <strong>${QUOTE_HOURS_PER_MAN} horas</strong> por jornada</li>
      <li>Horas diarias totales: <strong>${calc.hoursPerDay} h</strong></li>
      <li>Cálculo base: <strong>${QUOTE_DAYS} días</strong> al mes</li>
      <li>Tarifa: <strong>${moneyRD(calc.rate)}</strong> por hora</li>
    </ul>

    ${buildTechBlock()}

    <h3>Detalle económico</h3>
    ${buildQuoteTotalsTable(data, calc)}
    ${quoteMandatoryNoteHtml()}
    ${data.note ? `<p><strong>Observaciones:</strong> ${escapeHtml(data.note)}</p>` : ""}

    <h3>Beneficios de elegirnos</h3>
    <ul>
      <li>Personal armado y altamente capacitado</li>
      <li>Supervisión constante y capacidad de respuesta</li>
      <li>Monitoreo con GPS y app exclusiva de ponche Reaction Force Security</li>
      <li>Reportes y control operativo para el cliente</li>
      <li>Experiencia comprobada en proyectos de gran magnitud</li>
      <li>Respuesta inmediata ante incidencias</li>
    </ul>

    ${buildClientsBlock()}

    <p style="margin-top:16px">${escapeHtml(RFS_COMPANY.name)} reitera su compromiso de ser la mejor alternativa de seguridad para ${escapeHtml(
    data.clientName
  )}, asegurando tranquilidad, disciplina y resguardo permanente.</p>
    <p><strong>Contacto:</strong> ${escapeHtml(RFS_COMPANY.phones)} · ${escapeHtml(RFS_COMPANY.email)}</p>
    <div class="sign-box">
      <div>${quoteCompanySignBlock()}</div>
      <div><div class="sign-line">Aceptación del cliente<br/>${
        data.attentionTo ? escapeHtml(data.attentionTo) + "<br/>" : ""
      }Nombre / Firma / Sello</div></div>
    </div>
    ${quoteMandatoryNoteHtml()}`;
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
  const totalMenEl = document.getElementById("quoteTotalMenLabel");
  if (totalMenEl) {
    totalMenEl.textContent = `${calc.men} hombre${calc.men === 1 ? "" : "s"} · ${calc.hoursPerDay} h/día · ${calc.hoursMonth.toLocaleString(
      "es-DO"
    )} h/mes`;
  }
  if (!box) return;
  box.innerHTML = `
    <div class="detail-grid">
      <div><span>Diurnos</span><strong>${calc.dayMen}</strong></div>
      <div><span>Nocturnos</span><strong>${calc.nightMen}</strong></div>
      <div><span>Horas / día</span><strong>${calc.hoursPerDay}</strong></div>
      <div><span>Horas / mes</span><strong>${calc.hoursMonth.toLocaleString("es-DO")}</strong></div>
      <div><span>Bruto</span><strong>${moneyRD(calc.gross)}</strong></div>
      <div><span>Descuento</span><strong>${calc.discount ? "− " + moneyRD(calc.discount) : "—"}</strong></div>
      <div><span>Subtotal</span><strong>${moneyRD(calc.subtotal)}</strong></div>
      <div><span>${calc.includeItbis ? "ITBIS 18%" : "ITBIS"}</span><strong>${
        calc.includeItbis ? moneyRD(calc.itbis) : "No incluido"
      }</strong></div>
      <div><span>Total mensual</span><strong>${moneyRD(calc.total)}</strong></div>
    </div>
    <p class="muted tight" style="margin-top:8px">Cada hombre = ${QUOTE_HOURS_PER_MAN} h · Cálculo a ${QUOTE_DAYS} días${
      calc.includeItbis ? "" : " · sin ITBIS"
    }</p>`;
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
        <p class="muted">${escapeHtml(model?.label || q.modelId)} · ${escapeHtml(q.date || "")} · ${escapeHtml(
        quoteShiftLabel(calc)
      )} · ${calc.hoursPerDay} h/día</p>
        <p><strong>${moneyRD(calc.total)}</strong> <span class="muted">${
          calc.includeItbis ? "(con ITBIS)" : "(sin ITBIS)"
        }</span></p>
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
  // Migrar historial viejo
  if ((d.dayMen == null || d.nightMen == null) && d.menCount) {
    d.dayMen = Number(d.menCount) || 1;
    d.nightMen = 0;
  }
  selectedQuoteModel = d.modelId || "ejecutiva";
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  set("quoteClientName", d.clientName || "");
  set("quoteClientRnc", d.clientRnc || "");
  set("quoteAttentionTo", d.attentionTo || "");
  set("quoteDayMen", d.dayMen ?? 1);
  set("quoteNightMen", d.nightMen ?? 0);
  set("quoteHourlyRate", d.hourlyRate ?? 155);
  set("quoteDiscountType", d.discountType || "none");
  set("quoteDiscountValue", d.discountValue || 0);
  set("quoteNote", d.note || "");
  set("quoteDate", d.date || new Date().toISOString().slice(0, 10));
  const itbisEl = document.getElementById("quoteIncludeItbis");
  if (itbisEl) itbisEl.checked = d.includeItbis !== false;
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
    toast("Indica al menos 1 hombre en Día y/o Noche.");
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
    menCount: calc.men,
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
      `Cotización ${saved.modelId}: ${saved.clientName} · ${quoteShiftLabel(calc)} · ${calc.hoursPerDay}h/día · ${moneyRD(calc.total)}`
    );
  }
  toast("Propuesta lista para imprimir o guardar PDF.");
}

function renderQuotesModule() {
  loadQuotesHistory();
  if (!document.getElementById("quoteClientName")?.value && !document.getElementById("quoteDayMen")?.value) {
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

  ["quoteClientName", "quoteClientRnc", "quoteAttentionTo", "quoteDayMen", "quoteNightMen", "quoteHourlyRate", "quoteDiscountValue", "quoteNote", "quoteDate"].forEach(
    (id) => {
      document.getElementById(id)?.addEventListener("input", updateQuoteTotalsUi);
      document.getElementById(id)?.addEventListener("change", updateQuoteTotalsUi);
    }
  );
  document.getElementById("quoteIncludeItbis")?.addEventListener("change", updateQuoteTotalsUi);
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
