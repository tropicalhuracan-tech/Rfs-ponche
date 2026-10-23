/* Recovered from production bundle — panel central */
import React, { useEffect, useMemo, useState } from 'react'
import * as api from '../shared/api'

const S = React
const L = { jsx: React.createElement, jsxs: React.createElement, Fragment: React.Fragment }

const periodLabels = {
    "24h": `Últimas 24 horas`,
    "48h": `Últimas 48 horas`,
    "7d": `Última semana`,
    "30d": `Último mes`,
  };
function T(e, t = new Date()) {
  let n = new Date(t);
  return (
    e === `24h` && n.setHours(n.getHours() - 24),
    e === `48h` && n.setHours(n.getHours() - 48),
    e === `7d` && n.setDate(n.getDate() - 7),
    e === `30d` && n.setDate(n.getDate() - 30),
    n
  );
}
function E(e) {
  return e.type === `ponche` || e.type === `photo`;
}
function D(e) {
  let t = e.filter(E),
    n = new Map();
  for (let e of t) {
    let t = new Date(e.timestamp).toLocaleDateString(`es-DO`, {
      day: `2-digit`,
      month: `short`,
    });
    n.set(t, (n.get(t) ?? 0) + 1);
  }
  return [...n.entries()].map(([e, t]) => ({ label: e, count: t })).reverse();
}
function O(e, t) {
  return t <= 0 ? 0 : Math.min(999, Math.round((e / t) * 1e3) / 10);
}
function k(e) {
  return e
    .replaceAll(`&`, `&amp;`)
    .replaceAll(`<`, `&lt;`)
    .replaceAll(`>`, `&gt;`)
    .replaceAll(`"`, `&quot;`);
}
function A(e) {
  return e >= 95
    ? {
        title: `Cumplimiento excelente`,
        note: `El personal alcanzó o superó la meta operativa establecida para el periodo evaluado.`,
        color: `#2f8f5b`,
      }
    : e >= 80
      ? {
          title: `Cumplimiento aceptable`,
          note: `El nivel de actividad es adecuado, con margen menor de mejora para estabilizar la cobertura.`,
          color: `#3d9b6a`,
        }
      : e >= 60
        ? {
            title: `Cumplimiento parcial`,
            note: `Se observan desviaciones frente a la meta. Se recomienda reforzar supervisión y frecuencia de rondas.`,
            color: `#b8891f`,
          }
        : {
            title: `Cumplimiento insuficiente`,
            note: `La cantidad de ponches está por debajo de lo esperado. Requiere acción correctiva inmediata.`,
            color: `#9d2d2d`,
          };
}
function te(e) {
  let t = e.events.filter(E),
    n = e.events.filter((e) => e.type === `photo`),
    r = t.length,
    i = O(r, e.expected),
    a = A(i),
    o = D(e.events),
    s = Math.max(1, ...o.map((e) => e.count)),
    c = T(e.period),
    l = new Date(),
    u = l.toLocaleString(`es-DO`, { dateStyle: `full`, timeStyle: `short` }),
    d = `${c.toLocaleString(`es-DO`, { dateStyle: `medium`, timeStyle: `short` })} — ${l.toLocaleString(`es-DO`, { dateStyle: `medium`, timeStyle: `short` })}`,
    f = Math.max(0, e.expected - r),
    p = Math.max(0, r - e.expected),
    m = `RFS-${l.getFullYear()}${String(l.getMonth() + 1).padStart(2, `0`)}${String(l.getDate()).padStart(2, `0`)}-${Math.abs(
      j(`${e.vigilanteName}-${e.period}-${r}`),
    )
      .toString()
      .slice(0, 6)}`,
    h = t
      .slice(0, 50)
      .map((e, t) => {
        let n = new Date(e.timestamp).toLocaleString(`es-DO`),
          r =
            e.latitude != null && e.longitude != null
              ? `${e.latitude.toFixed(5)}, ${e.longitude.toFixed(5)}`
              : `—`,
          i = e.type === `photo` ? `Foto` : `GPS`,
          a =
            e.type === `ponche` && e.accuracy != null
              ? `±${Math.round(e.accuracy)} m`
              : i;
        return `<tr>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${t + 1}</td>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${k(n)}</td>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${k(r)}</td>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${k(a)}</td>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${k(e.serviceName)}</td>
      </tr>`;
      })
      .join(``),
    g = o
      .map((e) => {
        let t = Math.max(10, Math.round((e.count / s) * 100));
        return `<td style="vertical-align:bottom;text-align:center;padding:0 6px;">
        <div style="font-size:11px;color:#333;margin-bottom:4px;">${e.count}</div>
        <div style="height:${t}px;width:22px;background:#9D2D2D;border-radius:4px 4px 2px 2px;margin:0 auto;"></div>
        <div style="font-size:10px;color:#777;margin-top:6px;white-space:nowrap;">${k(e.label)}</div>
      </td>`;
      })
      .join(``),
    _ = o.map((e) => `  · ${e.label}: ${e.count} ponche(s)`).join(`
`),
    v = t.slice(0, 30).map((e, t) => {
      let n = new Date(e.timestamp).toLocaleString(`es-DO`),
        r =
          e.latitude != null && e.longitude != null
            ? `${e.latitude.toFixed(5)}, ${e.longitude.toFixed(5)}`
            : `s/u`,
        i = e.type === `photo` ? `foto` : `GPS`;
      return `  ${t + 1}. ${n} | ${r} | ${i} | ${e.serviceName}`;
    }).join(`
`),
    y =
      f > 0
        ? `Se identificó un déficit de ${f} ponche(s) respecto a la meta.`
        : p > 0
          ? `Se registró un excedente de ${p} ponche(s) sobre la meta.`
          : `La actividad coincide exactamente con la meta establecida.`,
    ee = [
      `REACTION FORCE SECURITY`,
      `Reporte Corporativo de Efectividad de Ponches`,
      `================================================`,
      `No. de reporte: ${m}`,
      `Fecha de emisión: ${u}`,
      ``,
      `1. IDENTIFICACIÓN DEL SERVICIO`,
      `Vigilante: ${e.vigilanteName}`,
      `Puesto / servicio: ${e.serviceName}`,
      `Periodo evaluado: ${periodLabels[e.period]}`,
      `Rango calendario: ${d}`,
      ``,
      `2. RESUMEN EJECUTIVO`,
      `Durante el periodo indicado se registraron ${r} ponche(s) de un total esperado de ${e.expected}.`,
      `La efectividad operativa calculada es de ${i}%.`,
      `Clasificación: ${a.title}.`,
      a.note,
      y,
      `Además se recibieron ${n.length} evidencia(s) fotográfica(s) asociada(s) al servicio.`,
      ``,
      `3. INDICADORES`,
      `Ponches esperados: ${e.expected}`,
      `Ponches realizados: ${r}`,
      `Evidencias fotográficas: ${n.length}`,
      `Efectividad: ${i}%`,
      ``,
      `4. DISTRIBUCIÓN DIARIA`,
      _ || `  · Sin actividad registrada en el periodo.`,
      ``,
      `5. DETALLE DE PONCHES (muestra)`,
      v || `  · Sin registros detallados.`,
      ``,
      `6. CONCLUSIÓN Y RECOMENDACIÓN`,
      a.note,
      `Este documento es emitido por Reaction Force Security para fines de control operativo y seguimiento contractual del servicio de vigilancia.`,
      ``,
      `Atentamente,`,
      `Centro de Control — Reaction Force Security`,
      `reactionforce23@gmail.com`,
    ].join(`
`),
    b =
      f > 0
        ? `Se observa un déficit de <strong>${f}</strong> ponche(s) respecto a la meta contractual/operativa.`
        : p > 0
          ? `Se registró un excedente de <strong>${p}</strong> ponche(s) sobre la meta.`
          : `La actividad coincide con la meta establecida para el periodo.`;
  return {
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reporte ${k(m)} · Reaction Force Security</title>
  <style>
    @page { margin: 14mm; }
    html, body { margin:0; padding:0; background:#fff; color:#1a1a1a; font-family: Arial, Helvetica, sans-serif; }
    .sheet { max-width:820px; margin:0 auto; background:#fff; }
    .hdr { background:#9D2D2D; color:#fff; padding:22px 26px; }
    .hdr-table { width:100%; border-collapse:collapse; }
    .hdr-table td { vertical-align:middle; }
    .brand { letter-spacing:2px; font-size:12px; opacity:.92; }
    .title { font-size:26px; font-weight:700; margin-top:4px; }
    .sub { font-size:13px; margin-top:4px; opacity:.95; }
    .body { padding:24px 26px 28px; }
    .muted { color:#666; }
    .box { border:1px solid #ececec; padding:12px; }
    .kpi td { width:25%; text-align:center; padding:14px 8px; background:#fafafa; border:1px solid #ececec; }
    .kpi .l { font-size:11px; color:#777; letter-spacing:1px; }
    .kpi .v { font-size:26px; font-weight:700; margin-top:4px; }
    .section { margin:22px 0 8px; font-size:12px; letter-spacing:1.2px; color:#777; font-weight:700; }
    p { line-height:1.55; font-size:14px; margin:0 0 10px; }
    table.data { width:100%; border-collapse:collapse; font-size:12.5px; }
    table.data th { background:#111; color:#fff; text-align:left; padding:8px; }
    .foot { margin-top:26px; padding-top:14px; border-top:1px solid #ececec; font-size:12px; color:#777; }
    @media print {
      .sheet { max-width:none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="hdr">
      <table class="hdr-table">
        <tr>
          <td style="width:84px;">
            <img src="${k(e.logoDataUrl)}" width="72" height="72" alt="Reaction Force Security" style="border-radius:50%;border:2px solid #fff;object-fit:cover;display:block;" />
          </td>
          <td>
            <div class="brand">REACTION FORCE SECURITY</div>
            <div class="title">Reporte Corporativo de Efectividad</div>
            <div class="sub">Control de ponches · ${k(periodLabels[e.period])} · ${k(m)}</div>
          </td>
        </tr>
      </table>
    </div>

    <div class="body">
      <p class="muted" style="font-size:12px;margin-bottom:16px;">Emitido: ${k(u)} · Rango evaluado: ${k(d)}</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td class="box" style="width:50%;">
            <div class="muted" style="font-size:11px;letter-spacing:1px;">VIGILANTE</div>
            <div style="font-size:18px;font-weight:700;margin-top:4px;">${k(e.vigilanteName)}</div>
          </td>
          <td class="box" style="width:50%;">
            <div class="muted" style="font-size:11px;letter-spacing:1px;">SERVICIO / PUESTO</div>
            <div style="font-size:18px;font-weight:700;margin-top:4px;">${k(e.serviceName)}</div>
          </td>
        </tr>
      </table>

      <div class="section">1. RESUMEN EJECUTIVO</div>
      <p>
        El presente informe documenta el desempeño operativo del vigilante
        <strong>${k(e.vigilanteName)}</strong> en el servicio
        <strong>${k(e.serviceName)}</strong> durante
        <strong>${k(periodLabels[e.period]).toLowerCase()}</strong>.
        Se contrastó la meta de <strong>${e.expected}</strong> ponches esperados
        con un total de <strong>${r}</strong> ponches efectivamente registrados
        en el sistema de control de Reaction Force Security.
      </p>
      <p>
        La efectividad resultante es de
        <strong style="color:${a.color};">${i}%</strong>
        (<strong style="color:${a.color};">(${k(a.title)})</strong>.
        ${k(a.note)}
        ${b}
        Durante el mismo lapso se anexaron <strong>${n.length}</strong> evidencia(s) fotográfica(s).
      </p>

      <div class="section">2. INDICADORES CLAVE</div>
      <table class="kpi" style="width:100%;border-collapse:collapse;margin-bottom:8px;">
        <tr>
          <td>
            <div class="l">ESPERADOS</div>
            <div class="v" style="color:#9D2D2D;">${e.expected}</div>
          </td>
          <td>
            <div class="l">REALIZADOS</div>
            <div class="v">${r}</div>
          </td>
          <td>
            <div class="l">FOTOS</div>
            <div class="v">${n.length}</div>
          </td>
          <td>
            <div class="l">EFECTIVIDAD</div>
            <div class="v" style="color:${a.color};">${i}%</div>
          </td>
        </tr>
      </table>

      <div class="section">3. DISTRIBUCIÓN DE PONCHES POR DÍA</div>
      <div class="box" style="min-height:130px;margin-bottom:8px;">
        ${g ? `<table style="margin:0 auto;border-collapse:collapse;"><tr>${g}</tr></table>` : `<p class="muted" style="margin:0;">Sin actividad registrada en el periodo.</p>`}
      </div>

      <div class="section">4. HALLAZGOS OPERATIVOS</div>
      <p>
        El cálculo de efectividad utiliza la fórmula:
        <em>(ponches realizados ÷ ponches esperados) × 100</em>.
        Los registros provienen del dispositivo del vigilante con captura de fecha, hora y,
        cuando está disponible, coordenada GPS al momento del ponche.
      </p>
      <p>
        Este reporte tiene carácter informativo y de control para la supervisión del servicio.
        Cualquier irregularidad detectada (ausencia de ponches, baja frecuencia o desviación de ubicación)
        debe ser tratada según los protocolos internos de Reaction Force Security y los acuerdos con el cliente.
      </p>

      <div class="section">5. DETALLE DE PONCHES</div>
      <table class="data">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha / hora</th>
            <th>Ubicación GPS</th>
            <th>Precisión</th>
            <th>Servicio</th>
          </tr>
        </thead>
        <tbody>
          ${h || `<tr><td colspan="5" style="padding:12px;color:#777;">Sin registros en el periodo seleccionado.</td></tr>`}
        </tbody>
      </table>

      <div class="section">6. CONCLUSIÓN</div>
      <p>${k(a.note)}</p>
      <p>
        Documento emitido por el Centro de Control de <strong>Reaction Force Security</strong>
        para seguimiento del servicio de vigilancia y seguridad.
      </p>

      <div class="foot">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td>
              ${k(m)}<br/>
              Generado automáticamente por RFS Ponche
            </td>
            <td style="text-align:right;">
              reactionforce23@gmail.com<br/>
              Reaction Force Security · Confidencial
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`,
    text: ee,
    subject: `Reporte RFS ${m} · ${e.vigilanteName} · ${periodLabels[e.period]}`,
    effectiveness: i,
  };
}
function j(e) {
  let t = 0;
  for (let n = 0; n < e.length; n += 1)
    ((t = (t << 5) - t + e.charCodeAt(n)), (t |= 0));
  return t;
}
var M = null;
async function N() {
  if (M) return M;
  try {
    let e = await (
      await fetch(`${window.location.origin}/logo-panel-tight.jpg?v=5`, {
        cache: `force-cache`,
      })
    ).blob();
    return (
      (M = await new Promise((t, n) => {
        let r = new FileReader();
        ((r.onload = () => t(String(r.result))),
          (r.onerror = () => n(Error(`No se pudo leer el logo`))),
          r.readAsDataURL(e));
      })),
      M
    );
  } catch {
    return `data:image/gif;base64,R0lGODlhAQABAAAAACw=`;
  }
}
function P(e) {
  let t = document.getElementById(`rfs-print-frame`);
  t && t.remove();
  let n = document.createElement(`iframe`);
  ((n.id = `rfs-print-frame`),
    n.setAttribute(`aria-hidden`, `true`),
    (n.style.position = `fixed`),
    (n.style.right = `0`),
    (n.style.bottom = `0`),
    (n.style.width = `0`),
    (n.style.height = `0`),
    (n.style.border = `0`),
    (n.style.opacity = `0`),
    (n.style.pointerEvents = `none`),
    document.body.appendChild(n));
  let r = n.contentDocument || n.contentWindow?.document;
  if (!r) {
    n.remove();
    return;
  }
  (r.open(), r.write(e), r.close());
  let i = () => {
      try {
        (n.contentWindow?.focus(), n.contentWindow?.print());
      } finally {
        setTimeout(() => n.remove(), 1500);
      }
    },
    a = Array.from(r.images);
  if (a.length === 0) {
    setTimeout(i, 250);
    return;
  }
  let o = a.length,
    s = () => {
      (--o, o <= 0 && setTimeout(i, 200));
    };
  a.forEach((e) => {
    e.complete
      ? s()
      : (e.addEventListener(`load`, s), e.addEventListener(`error`, s));
  });
}
function F(e) {
  let t = `
<style>
  .rfs-preview-bar {
    position: sticky;
    top: 0;
    z-index: 9999;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #111;
    color: #fff;
    font-family: Arial, Helvetica, sans-serif;
    box-shadow: 0 4px 16px rgba(0,0,0,.25);
  }
  .rfs-preview-bar strong { letter-spacing: .04em; }
  .rfs-preview-actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .rfs-preview-bar button {
    border: 0;
    border-radius: 8px;
    min-height: 40px;
    padding: 0 14px;
    font-weight: 700;
    cursor: pointer;
  }
  .rfs-btn-back { background: #fff; color: #111; }
  .rfs-btn-print { background: #9D2D2D; color: #fff; }
  @media print {
    .rfs-preview-bar { display: none !important; }
  }
</style>
<div class="rfs-preview-bar">
  <strong>Vista previa del reporte · Reaction Force</strong>
  <div class="rfs-preview-actions">
    <button type="button" class="rfs-btn-back" onclick="window.close()">← Volver al panel</button>
    <button type="button" class="rfs-btn-print" onclick="window.print()">Imprimir / PDF</button>
  </div>
</div>`;
  return e.includes(`<body>`) ? e.replace(`<body>`, `<body>${t}`) : t + e;
}
function I(e) {
  let t = F(e),
    n = new Blob([t], { type: `text/html;charset=utf-8` }),
    r = URL.createObjectURL(n);
  window.open(r, `_blank`)
    ? setTimeout(() => URL.revokeObjectURL(r), 12e4)
    : (URL.revokeObjectURL(r), ne(t));
}
function ne(e) {
  let t = document.getElementById(`rfs-preview-overlay`);
  t && t.remove();
  let n = document.createElement(`div`);
  ((n.id = `rfs-preview-overlay`),
    (n.style.cssText = `position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.72);display:flex;flex-direction:column;`));
  let r = document.createElement(`div`);
  ((r.style.cssText = `display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;background:#111;color:#fff;font-family:Arial,sans-serif;`),
    (r.innerHTML = `<strong>Vista previa del reporte</strong><button type="button" id="rfs-preview-close" style="border:0;border-radius:8px;min-height:40px;padding:0 14px;font-weight:700;cursor:pointer;background:#fff;color:#111;">← Volver al panel</button>`));
  let i = document.createElement(`iframe`);
  ((i.style.cssText = `flex:1;width:100%;border:0;background:#fff;`),
    (i.srcdoc = e),
    n.appendChild(r),
    n.appendChild(i),
    document.body.appendChild(n),
    r
      .querySelector(`#rfs-preview-close`)
      ?.addEventListener(`click`, () => n.remove()));
}
const R = 432e5;
function z(e) {
  return new Date(e).toLocaleTimeString(`es-DO`, {
    hour: `2-digit`,
    minute: `2-digit`,
  });
}
function B(e) {
  let t = new Date(e);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, `0`)}-${String(t.getDate()).padStart(2, `0`)}`;
}
function V(e) {
  let [t, n, r] = e.split(`-`).map(Number),
    i = new Date(t, n - 1, r),
    a = new Date(),
    o = new Date();
  o.setDate(a.getDate() - 1);
  let s = (e, t) =>
    e.getFullYear() === t.getFullYear() &&
    e.getMonth() === t.getMonth() &&
    e.getDate() === t.getDate();
  return s(i, a)
    ? `Hoy`
    : s(i, o)
      ? `Ayer`
      : i.toLocaleDateString(`es-DO`, {
          weekday: `long`,
          day: `numeric`,
          month: `short`,
        });
}
function H({
  vigilanteName: e,
  guardCode: r = null,
  events: s,
  moderation: c,
  devices: l = [],
  onBack: u,
  onChanged: f,
}) {
  let m = (0, S.useMemo)(() => {
      let t = e.trim().toLowerCase().replace(/\s+/g, ` `);
      return l.filter(
        (e) =>
          e.vigilanteName.trim().toLowerCase().replace(/\s+/g, ` `) === t &&
          e.pushEnabled,
      );
    }, [l, e]),
    h = m.length > 0,
    [y, ee] = (0, S.useState)(`24h`),
    [x, C] = (0, S.useState)(`8`),
    [k, A] = (0, S.useState)(null),
    [j, M] = (0, S.useState)(!1),
    [F, ne] = (0, S.useState)(() => {
      try {
        return localStorage.getItem(`rfs-report-client-email`) ?? ``;
      } catch {
        return ``;
      }
    }),
    [H, U] = (0, S.useState)(() => {
      try {
        return localStorage.getItem(`rfs-report-copy-email`) ?? ``;
      } catch {
        return ``;
      }
    }),
    [re, W] = (0, S.useState)(``),
    [G, K] = (0, S.useState)(!1),
    [q, J] = (0, S.useState)(``),
    [ie, ae] = (0, S.useState)(null),
    [Y, oe] = (0, S.useState)(!1),
    se = s[0]?.serviceName ?? `—`,
    X = Math.max(0, Number(x) || 0),
    Z = (0, S.useMemo)(() => {
      let e = T(y).getTime();
      return s.filter((t) => new Date(t.timestamp).getTime() >= e);
    }, [s, y]),
    Q = (0, S.useMemo)(() => {
      let e = Date.now() - R;
      return s
        .filter((t) => new Date(t.timestamp).getTime() >= e)
        .sort(
          (e, t) =>
            new Date(t.timestamp).getTime() - new Date(e.timestamp).getTime(),
        );
    }, [s]),
    ce = Y
      ? [...s].sort(
          (e, t) =>
            new Date(t.timestamp).getTime() - new Date(e.timestamp).getTime(),
        )
      : Q,
    le = (0, S.useMemo)(() => {
      let e = new Map();
      for (let t of ce) {
        let n = B(t.timestamp),
          r = e.get(n);
        r ? r.push(t) : e.set(n, [t]);
      }
      return [...e.entries()];
    }, [ce]),
    ue = Math.max(0, s.length - Q.length),
    de = Z.filter((e) => e.type === `photo`),
    fe = Z.filter(E).length,
    pe = O(fe, X),
    me = D(Z),
    he = Math.max(1, ...me.map((e) => e.count));
  async function ge() {
    if (!(X <= 0)) {
      (M(!0), W(``));
      try {
        let t = await N(),
          n = te({
            vigilanteName: e,
            serviceName: se,
            period: y,
            expected: X,
            events: Z,
            logoDataUrl: t,
          });
        A(n);
      } catch (e) {
        (W(e instanceof Error ? e.message : `No se pudo generar el reporte`),
          A(null));
      } finally {
        M(!1);
      }
    }
  }
  async function _e() {
    if (confirm(`¿Reiniciar el conteo de ${e}?`)) {
      K(!0);
      try {
        (await api.resetGuard(e), f(), u());
      } catch (e) {
        W(e instanceof Error ? e.message : `Error al reiniciar`);
      } finally {
        K(!1);
      }
    }
  }
  async function je() {
    let t = `¿Eliminar a ${e} del panel?\n\nSe borrarán todos sus ponches, fotos y dispositivos registrados. Esta acción no se puede deshacer.`;
    if (!confirm(t)) return;
    if (!confirm(`Confirmación final: ¿eliminar definitivamente a ${e}?`)) return;
    K(!0);
    try {
      let t = await api.deleteGuard(e);
      W(
        `Vigilante eliminado · ${t.events ?? 0} registro(s) · ${t.devices ?? 0} dispositivo(s)`,
      );
      f();
      u();
    } catch (e) {
      W(e instanceof Error ? e.message : `No se pudo eliminar`);
    } finally {
      K(!1);
    }
  }
  async function ve() {
    let t = !c?.blocked,
      n = t
        ? `¿Bloquear a ${e}? No llegarán más ponches.`
        : `¿Desbloquear a ${e}?`;
    if (confirm(n)) {
      K(!0);
      try {
        (await api.setGuardBlocked(e, t), f());
      } catch (e) {
        W(e instanceof Error ? e.message : `Error de bloqueo`);
      } finally {
        K(!1);
      }
    }
  }
  let $ = api.guardAlertActive(c),
    [ye, be] = (0, S.useState)(() => c?.alertSound ?? `wail`),
    [xe, Se] = (0, S.useState)(!1);
  async function Ce(e) {
    (be(e), Se(!0));
    try {
      let t = new Audio(api.sirenFileFor(e));
      ((t.volume = 1),
        await t.play(),
        window.setTimeout(() => {
          (t.pause(), Se(!1));
        }, 2200));
    } catch {
      (Se(!1), W(`No se pudo reproducir la vista previa en este navegador.`));
    }
  }
  async function we() {
    if ($) {
      if (!confirm(`¿Detener la sirena de ${e}?`)) return;
      (K(!0), W(`Deteniendo sirena…`));
      try {
        (await api.stopGuardAlert(e), W(`Sirena detenida desde central.`), f());
      } catch (e) {
        W(e instanceof Error ? e.message : `No se pudo controlar la sirena`);
      } finally {
        K(!1);
      }
      return;
    }
    let r = api.sirenPresets.find((e) => e.id === ye)?.label ?? `Clásica`;
    if (!h) {
      W(
        `Este vigilante no tiene notificaciones activas en el teléfono. Debe abrir RFS Ponche → Configuración → “Activar alertas” (en iPhone, instalada en pantalla de inicio).`,
      );
      return;
    }
    let i = `¿Enviar sirena «${r}» a ${e}? Se enviará notificación push al teléfono.`;
    if (confirm(i)) {
      (K(!0), W(`Activando sirena ${r}…`));
      try {
        let { push: n } = await api.alertGuard(e, 15, ye);
        (n.sent > 0
          ? W(
              `Sirena «${r}» enviada: ${n.sent} notificación(es) push. Si no aparece, el vigilante debe reactivar alertas en la app.`,
            )
          : n.failed > 0
            ? W(
                `Sirena activada en central, pero el push falló (${n.failed}). Pida al vigilante reactivar alertas en Configuración.`,
              )
            : W(
                `Sirena activada en central, pero no hay teléfono con push registrado para este vigilante.`,
              ),
          f());
      } catch (e) {
        W(e instanceof Error ? e.message : `No se pudo controlar la sirena`);
      } finally {
        K(!1);
      }
    }
  }
  function Te(e, t) {
    try {
      (localStorage.setItem(`rfs-report-client-email`, e),
        localStorage.setItem(`rfs-report-copy-email`, t));
    } catch {}
  }
  async function Ee(e) {
    if (!k) W(`Genere el reporte primero.`);
    else if (!e.to.includes(`@`)) W(`Escriba un correo válido.`);
    else if (e.cc && !e.cc.includes(`@`)) W(`El correo de copia no es válido.`);
    else {
      (K(!0), W(`Enviando ${e.label}…`));
      try {
        let t = await api.sendReportEmail({
          to: e.to,
          cc: e.cc,
          subject: k.subject,
          text: k.text,
          html: k.html,
        });
        if (t.ok) {
          let n = e.cc ? ` · copia a ${e.cc}` : ``;
          W(
            `Enviado a ${e.to}${n} desde ${t.from ?? `reactionforce23@gmail.com`}.`,
          );
        } else
          t.composeUrl
            ? (I(k.html),
              window.open(t.composeUrl, `_blank`),
              W(
                `Se abrió el reporte visual y Gmail. Si no tiene SMTP, use Imprimir/PDF y adjúntelo.`,
              ))
            : W(`No se pudo enviar el correo.`);
      } catch (e) {
        W(e instanceof Error ? e.message : `Error de correo`);
      } finally {
        K(!1);
      }
    }
  }
  async function De() {
    let e = F.trim(),
      t = H.trim();
    (Te(e, t),
      await Ee({
        to: e,
        cc: t || void 0,
        label: t ? `reporte al cliente con copia` : `reporte al cliente`,
      }));
  }
  async function Oe() {
    let e = H.trim();
    (Te(F.trim(), e), await Ee({ to: e, label: `copia del reporte` }));
  }
  function ke() {
    k &&
      window.open(
        `https://wa.me/?text=${encodeURIComponent(k.text)}`,
        `_blank`,
      );
  }
  async function Ae(e) {
    (ae(e.id), J(`Preparando descarga…`));
    try {
      (await api.downloadPhoto(e), J(`Foto lista para guardar en el teléfono o computadora.`));
    } catch (e) {
      J(e instanceof Error ? e.message : `No se pudo descargar`);
    } finally {
      ae(null);
    }
  }
  return (L.jsxs)(`section`, {
    className: `guard-detail`,
    children: [
      (L.jsx)(`button`, {
        type: `button`,
        className: `back-btn no-print`,
        onClick: u,
        children: `← Volver a vigilantes`,
      }),
      (L.jsxs)(`div`, {
        className: `guard-detail-head`,
        children: [
          (L.jsxs)(`div`, {
            children: [
              (L.jsx)(`p`, {
                className: `panel-kicker`,
                children: `Detalle del vigilante`,
              }),
              (L.jsx)(`h2`, { children: e }),
              r
                ? (L.jsxs)(`p`, {
                    className: `guard-code-line`,
                    children: [
                      `Código único: `,
                      (L.jsx)(`strong`, { children: r }),
                    ],
                  })
                : null,
              (L.jsx)(`p`, { className: `service`, children: se }),
              c?.blocked
                ? (L.jsx)(`span`, {
                    className: `badge-blocked`,
                    children: `Bloqueado`,
                  })
                : null,
              $
                ? (L.jsx)(`span`, {
                    className: `badge-siren`,
                    children: `Sirena activa`,
                  })
                : null,
              h
                ? (L.jsxs)(`span`, {
                    className: `badge-push-ok`,
                    children: [`Push activo (`, m.length, `)`],
                  })
                : (L.jsx)(`span`, {
                    className: `badge-push-off`,
                    children: `Sin notificación push`,
                  }),
            ],
          }),
          (L.jsxs)(`div`, {
            className: `guard-actions no-print`,
            children: [
              (L.jsx)(`button`, {
                type: `button`,
                className: $
                  ? `secondary-btn siren-btn-stop`
                  : `secondary-btn siren-btn`,
                disabled: G,
                onClick: () => void we(),
                children: $ ? `Detener sirena` : `Enviar sirena`,
              }),
              (L.jsx)(`button`, {
                type: `button`,
                className: `secondary-btn`,
                disabled: G,
                onClick: () => void _e(),
                children: `Reiniciar conteo`,
              }),
              (L.jsx)(`button`, {
                type: `button`,
                className: `secondary-btn`,
                disabled: G,
                onClick: () => void ve(),
                children: c?.blocked ? `Desbloquear` : `Bloquear`,
              }),
              (L.jsx)(`button`, {
                type: `button`,
                className: `secondary-btn danger-btn`,
                disabled: G,
                onClick: () => void je(),
                children: `Eliminar vigilante`,
              }),
            ],
          }),
        ],
      }),
      $
        ? null
        : (L.jsxs)(`div`, {
            className: `siren-sound-picker no-print`,
            role: `group`,
            "aria-label": `Tipo de sirena`,
            children: [
              (L.jsx)(`p`, {
                className: `siren-sound-label`,
                children: `Elegir sonido de alerta`,
              }),
              (L.jsx)(`div`, {
                className: `siren-sound-options`,
                children: api.sirenPresets.map((e) =>
                  (L.jsxs)(
                    `button`,
                    {
                      type: `button`,
                      className:
                        ye === e.id
                          ? `siren-sound-opt is-selected`
                          : `siren-sound-opt`,
                      disabled: G || xe,
                      onClick: () => void Ce(e.id),
                      children: [
                        (L.jsx)(`strong`, { children: e.label }),
                        (L.jsx)(`span`, { children: e.hint }),
                      ],
                    },
                    e.id,
                  ),
                ),
              }),
            ],
          }),
      (L.jsxs)(`div`, {
        className: `detail-stats`,
        children: [
          (L.jsxs)(`div`, {
            children: [
              (L.jsx)(`strong`, { children: Q.filter(E).length }),
              (L.jsx)(`span`, { children: `Últimas 12 h` }),
            ],
          }),
          (L.jsxs)(`div`, {
            children: [
              (L.jsx)(`strong`, {
                children: Q.filter((e) => e.type === `photo`).length,
              }),
              (L.jsx)(`span`, { children: `Fotos (12 h)` }),
            ],
          }),
          (L.jsxs)(`div`, {
            children: [
              (L.jsx)(`strong`, { children: s.filter(E).length }),
              (L.jsx)(`span`, { children: `Total` }),
            ],
          }),
        ],
      }),
      (L.jsxs)(`div`, {
        className: `section-title-row no-print`,
        children: [
          (L.jsx)(`h3`, {
            className: `section-title`,
            children: Y ? `Historial completo` : `Últimas 12 horas`,
          }),
          ue > 0
            ? (L.jsx)(`button`, {
                type: `button`,
                className: `link-btn`,
                onClick: () => oe((e) => !e),
                children: Y ? `Solo 12 horas` : `Ver anteriores (${ue})`,
              })
            : null,
        ],
      }),
      q
        ? (L.jsx)(`p`, { className: `panel-sync no-print`, children: q })
        : null,
      le.length === 0
        ? (L.jsxs)(`div`, {
            className: `panel-empty`,
            children: [
              (L.jsx)(`h3`, { children: `Sin registros en este periodo` }),
              (L.jsx)(`p`, {
                children: Y
                  ? `Este vigilante aún no tiene ponches.`
                  : `No hay ponches en las últimas 12 horas.`,
              }),
            ],
          })
        : (L.jsx)(`div`, {
            className: `day-groups`,
            children: le.map(([e, t]) =>
              (L.jsxs)(
                `section`,
                {
                  className: `day-group`,
                  children: [
                    (L.jsxs)(`h4`, {
                      className: `day-group-title`,
                      children: [
                        (L.jsx)(`span`, { children: V(e) }),
                        (L.jsxs)(`em`, {
                          children: [t.length, ` registro(s)`],
                        }),
                      ],
                    }),
                    (L.jsx)(`ul`, {
                      className: `panel-list`,
                      children: t.map((e) =>
                        (L.jsxs)(
                          `li`,
                          {
                            className: `panel-row`,
                            children: [
                              (L.jsx)(`span`, {
                                className: `tag tag-${e.type}`,
                                children:
                                  e.type === `ponche`
                                    ? `Ponche`
                                    : `Foto = ponche`,
                              }),
                              (L.jsxs)(`div`, {
                                className: `panel-row-main`,
                                children: [
                                  (L.jsx)(`strong`, {
                                    children: z(e.timestamp),
                                  }),
                                  (L.jsx)(`span`, {
                                    children: e.serviceName,
                                  }),
                                ],
                              }),
                              `latitude` in e &&
                              e.latitude != null &&
                              e.longitude != null
                                ? (L.jsx)(`a`, {
                                    className: `panel-map`,
                                    href: `https://maps.google.com/?q=${e.latitude},${e.longitude}`,
                                    target: `_blank`,
                                    rel: `noreferrer`,
                                    children: `Mapa`,
                                  })
                                : (L.jsx)(`span`, {
                                    className: `panel-map muted`,
                                    children: `—`,
                                  }),
                              e.type === `photo`
                                ? (L.jsxs)(`div`, {
                                    className: `inline-photo-wrap`,
                                    children: [
                                      (L.jsx)(`div`, {
                                        className: `inline-photo`,
                                        children: (L.jsx)(`img`, {
                                          src: api.photoSrcUrl(e),
                                          alt: `Foto de ${e.vigilanteName}`,
                                        }),
                                      }),
                                      (L.jsxs)(`div`, {
                                        className: `photo-actions`,
                                        children: [
                                          (L.jsx)(`a`, {
                                            className: `photo-view`,
                                            href: api.photoSrcUrl(e),
                                            target: `_blank`,
                                            rel: `noreferrer`,
                                            children: `Ver grande`,
                                          }),
                                          (L.jsx)(`button`, {
                                            type: `button`,
                                            className: `photo-download`,
                                            disabled: ie === e.id,
                                            onClick: () => void Ae(e),
                                            children:
                                              ie === e.id
                                                ? `Descargando…`
                                                : `Descargar foto`,
                                          }),
                                          (L.jsx)(`a`, {
                                            className: `photo-download-link`,
                                            href: api.photoDownloadUrl(e),
                                            download: !0,
                                            children: `Guardar archivo`,
                                          }),
                                        ],
                                      }),
                                    ],
                                  })
                                : null,
                            ],
                          },
                          `${e.type}-${e.id}`,
                        ),
                      ),
                    }),
                  ],
                },
                e,
              ),
            ),
          }),
      (L.jsxs)(`div`, {
        className: `report`,
        id: `report-section`,
        children: [
          (L.jsxs)(`div`, {
            className: `report-head`,
            children: [
              (L.jsx)(`h2`, { children: `Reporte de este vigilante` }),
              (L.jsx)(`p`, {
                children: `Elija periodo, meta de ponches y genere el documento corporativo (impresión = correo).`,
              }),
            ],
          }),
          (L.jsxs)(`div`, {
            className: `report-form no-print`,
            children: [
              (L.jsxs)(`div`, {
                className: `field`,
                children: [
                  (L.jsx)(`label`, { children: `Periodo` }),
                  (L.jsx)(`div`, {
                    className: `report-periods`,
                    children: Object.keys(periodLabels).map((e) =>
                      (L.jsx)(
                        `button`,
                        {
                          type: `button`,
                          className: y === e ? `is-on` : ``,
                          onClick: () => {
                            (ee(e), A(null));
                          },
                          children: periodLabels[e as keyof typeof periodLabels],
                        },
                        e,
                      ),
                    ),
                  }),
                ],
              }),
              (L.jsxs)(`div`, {
                className: `field`,
                children: [
                  (L.jsx)(`label`, {
                    htmlFor: `expected-detail`,
                    children: `Ponches que deberían existir`,
                  }),
                  (L.jsx)(`input`, {
                    id: `expected-detail`,
                    type: `number`,
                    min: 1,
                    value: x,
                    onChange: (e) => {
                      (C(e.target.value), A(null));
                    },
                  }),
                ],
              }),
              (L.jsx)(`button`, {
                type: `button`,
                className: `primary-btn report-run`,
                disabled: X <= 0 || j,
                onClick: () => void ge(),
                children: j ? `Preparando…` : `Generar reporte`,
              }),
            ],
          }),
          k
            ? (L.jsxs)(`div`, {
                className: `report-output`,
                id: `report-print-area`,
                children: [
                  (L.jsxs)(`div`, {
                    className: `report-brand`,
                    children: [
                      (L.jsx)(`img`, {
                        src: `/logo-panel-tight.jpg?v=5`,
                        alt: `Reaction Force Security`,
                      }),
                      (L.jsxs)(`div`, {
                        children: [
                          (L.jsx)(`p`, {
                            className: `report-kicker`,
                            children: `Reaction Force Security`,
                          }),
                          (L.jsx)(`h3`, {
                            children: `Reporte de efectividad`,
                          }),
                          (L.jsxs)(`p`, {
                            children: [periodLabels[y as keyof typeof periodLabels], ` · `, e],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (L.jsxs)(`div`, {
                    className: `report-summary`,
                    children: [
                      (L.jsxs)(`div`, {
                        children: [
                          (L.jsx)(`span`, { children: `Esperados` }),
                          (L.jsx)(`strong`, { children: X }),
                        ],
                      }),
                      (L.jsxs)(`div`, {
                        children: [
                          (L.jsx)(`span`, { children: `Realizados` }),
                          (L.jsx)(`strong`, { children: fe }),
                        ],
                      }),
                      (L.jsxs)(`div`, {
                        children: [
                          (L.jsx)(`span`, { children: `Fotos` }),
                          (L.jsx)(`strong`, { children: de.length }),
                        ],
                      }),
                      (L.jsxs)(`div`, {
                        className: `eff`,
                        children: [
                          (L.jsx)(`span`, { children: `Efectividad` }),
                          (L.jsxs)(`strong`, { children: [pe, `%`] }),
                        ],
                      }),
                    ],
                  }),
                  (L.jsxs)(`div`, {
                    className: `report-chart`,
                    children: [
                      (L.jsx)(`h4`, { children: `Ponches por día` }),
                      me.length === 0
                        ? (L.jsx)(`p`, {
                            className: `report-empty`,
                            children: `Sin ponches en este periodo.`,
                          })
                        : (L.jsx)(`div`, {
                            className: `bars`,
                            children: me.map((e) =>
                              (L.jsxs)(
                                `div`,
                                {
                                  className: `bar-col`,
                                  children: [
                                    (L.jsx)(`div`, {
                                      className: `bar`,
                                      style: {
                                        height: `${Math.max(8, (e.count / he) * 120)}px`,
                                      },
                                    }),
                                    (L.jsx)(`span`, {
                                      className: `bar-count`,
                                      children: e.count,
                                    }),
                                    (L.jsx)(`span`, {
                                      className: `bar-label`,
                                      children: e.label,
                                    }),
                                  ],
                                },
                                e.label,
                              ),
                            ),
                          }),
                      (L.jsxs)(`div`, {
                        className: `chart-scale`,
                        children: [
                          (L.jsxs)(`div`, {
                            className: `scale-expected`,
                            children: [`Meta del periodo: `, X, ` ponches`],
                          }),
                          (L.jsx)(`div`, {
                            className: `gauge`,
                            children: (L.jsx)(`div`, {
                              className: `gauge-fill`,
                              style: { width: `${Math.min(100, pe)}%` },
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  (L.jsxs)(`div`, {
                    className: `report-mail no-print`,
                    children: [
                      (L.jsxs)(`div`, {
                        className: `field`,
                        children: [
                          (L.jsx)(`label`, {
                            htmlFor: `client-email`,
                            children: `Correo del cliente`,
                          }),
                          (L.jsx)(`input`, {
                            id: `client-email`,
                            type: `email`,
                            placeholder: `cliente@empresa.com`,
                            value: F,
                            onChange: (e) => ne(e.target.value),
                          }),
                        ],
                      }),
                      (L.jsxs)(`div`, {
                        className: `report-copy-box`,
                        children: [
                          (L.jsx)(`h4`, {
                            children: `Enviar copia a otro correo`,
                          }),
                          (L.jsx)(`p`, {
                            children: `Opcional. Puede mandar una copia al mismo tiempo o solo a este correo.`,
                          }),
                          (L.jsxs)(`div`, {
                            className: `field`,
                            children: [
                              (L.jsx)(`label`, {
                                htmlFor: `copy-email`,
                                children: `Correo de copia`,
                              }),
                              (L.jsx)(`input`, {
                                id: `copy-email`,
                                type: `email`,
                                placeholder: `supervisor@empresa.com`,
                                value: H,
                                onChange: (e) => U(e.target.value),
                              }),
                            ],
                          }),
                          (L.jsx)(`button`, {
                            type: `button`,
                            className: `secondary-btn`,
                            disabled: G || !H.trim(),
                            onClick: () => void Oe(),
                            children: `Enviar solo copia`,
                          }),
                        ],
                      }),
                      (L.jsx)(`small`, {
                        className: `mail-hint`,
                        children: `Sale desde reactionforce23@gmail.com con el mismo HTML del reporte impreso.`,
                      }),
                    ],
                  }),
                  (L.jsxs)(`div`, {
                    className: `report-actions no-print`,
                    children: [
                      (L.jsx)(`button`, {
                        type: `button`,
                        className: `secondary-btn`,
                        onClick: () => P(k.html),
                        children: `Imprimir / PDF`,
                      }),
                      (L.jsx)(`button`, {
                        type: `button`,
                        className: `secondary-btn`,
                        onClick: () => I(k.html),
                        children: `Ver documento`,
                      }),
                      (L.jsxs)(`button`, {
                        type: `button`,
                        className: `secondary-btn`,
                        disabled: G || !F.trim(),
                        onClick: () => void De(),
                        children: [
                          `Enviar al cliente`,
                          H.trim() ? ` + copia` : ``,
                        ],
                      }),
                      (L.jsx)(`button`, {
                        type: `button`,
                        className: `primary-btn`,
                        onClick: ke,
                        children: `WhatsApp`,
                      }),
                    ],
                  }),
                  re
                    ? (L.jsx)(`p`, {
                        className: `panel-sync no-print`,
                        children: re,
                      })
                    : null,
                ],
              })
            : null,
        ],
      }),
    ],
  });
}
function U(e) {
  return new Date(e).toLocaleString(`es-DO`, {
    dateStyle: `short`,
    timeStyle: `short`,
  });
}
function re({ photos: e, onBack: t, onChanged: n }) {
  let [r, i] = (0, S.useState)(null),
    [a, o] = (0, S.useState)(``);
  async function c(e) {
    (i(e.id), o(`Descargando…`));
    try {
      (await api.downloadPhoto(e), o(`Descarga lista`));
    } catch (e) {
      o(e instanceof Error ? e.message : `No se pudo descargar`);
    } finally {
      i(null);
    }
  }
  async function l(e) {
    if (
      confirm(
        `¿Borrar esta foto de ${e.vigilanteName}?\nSe elimina de inmediato del panel.`,
      )
    ) {
      (i(e.id), o(`Borrando…`));
      try {
        (await api.deletePhoto(e.id), o(`Foto borrada`), n());
      } catch (e) {
        o(e instanceof Error ? e.message : `No se pudo borrar`);
      } finally {
        i(null);
      }
    }
  }
  return (L.jsxs)(`div`, {
    className: `photos-gallery`,
    children: [
      (L.jsxs)(`header`, {
        className: `gallery-top no-print`,
        children: [
          (L.jsx)(`button`, {
            type: `button`,
            className: `panel-refresh gallery-back`,
            onClick: t,
            children: `← Volver`,
          }),
          (L.jsxs)(`div`, {
            children: [
              (L.jsx)(`p`, {
                className: `panel-kicker`,
                children: `Central · Fotos`,
              }),
              (L.jsx)(`h1`, { children: `Todas las fotos` }),
              (L.jsxs)(`p`, {
                className: `panel-sub`,
                children: [e.length, ` foto(s) de todos los vigilantes`],
              }),
            ],
          }),
        ],
      }),
      a
        ? (L.jsx)(`p`, { className: `gallery-status no-print`, children: a })
        : null,
      e.length === 0
        ? (L.jsxs)(`div`, {
            className: `panel-empty`,
            children: [
              (L.jsx)(`h3`, { children: `Sin fotos` }),
              (L.jsx)(`p`, {
                children: `Cuando un vigilante envíe una foto, aparecerá aquí.`,
              }),
            ],
          })
        : (L.jsx)(`ul`, {
            className: `gallery-grid`,
            children: e.map((e) =>
              (L.jsxs)(
                `li`,
                {
                  className: `gallery-card`,
                  children: [
                    (L.jsx)(`img`, {
                      src: api.photoSrcUrl(e),
                      alt: `Foto de ${e.vigilanteName}`,
                    }),
                    (L.jsxs)(`div`, {
                      className: `gallery-meta`,
                      children: [
                        (L.jsx)(`strong`, { children: e.vigilanteName }),
                        (L.jsx)(`span`, { children: e.serviceName }),
                        (L.jsx)(`time`, {
                          dateTime: e.timestamp,
                          children: U(e.timestamp),
                        }),
                      ],
                    }),
                    (L.jsxs)(`div`, {
                      className: `gallery-actions`,
                      children: [
                        (L.jsx)(`button`, {
                          type: `button`,
                          className: `gallery-btn gallery-btn-down`,
                          disabled: r === e.id,
                          onClick: () => void c(e),
                          children: `Descargar`,
                        }),
                        (L.jsx)(`button`, {
                          type: `button`,
                          className: `gallery-btn gallery-btn-del`,
                          disabled: r === e.id,
                          onClick: () => void l(e),
                          children: `Borrar`,
                        }),
                      ],
                    }),
                  ],
                },
                e.id,
              ),
            ),
          }),
    ],
  });
}
function W(e) {
  return e.trim().toLowerCase().replace(/\s+/g, ` `);
}
function G() {
  let [e, t] = (0, S.useState)(!1),
    [n, r] = (0, S.useState)(() => !!api.getPanelKey()),
    [i, a] = (0, S.useState)(``),
    [o, s] = (0, S.useState)(``),
    [d, f] = (0, S.useState)(!1),
    [p, m] = (0, S.useState)([]),
    [_, v] = (0, S.useState)({}),
    [y, b] = (0, S.useState)([]),
    [C, w] = (0, S.useState)(``),
    [T, E] = (0, S.useState)(``),
    [D, O] = (0, S.useState)(``),
    [k, A] = (0, S.useState)(null),
    [te, j] = (0, S.useState)(!1),
    [M, N] = (0, S.useState)(``);
  async function P() {
    try {
      let e = await api.fetchPanelEvents();
      (m(e.events),
        v(e.moderation),
        b(e.devices),
        O(new Date().toLocaleTimeString(`es-DO`)),
        w(``),
        t(!0));
    } catch (e) {
      if (e instanceof api.CentralHttpError && e.status === 401) {
        (t(!1), w(`Sesión de central requerida`));
        return;
      }
      w(e instanceof Error ? e.message : `Error de conexión`);
    }
  }
  ((0, S.useEffect)(() => {
    document.title = `RFS Panel · Central`;
    let e = !1;
    async function t() {
      if (!api.getPanelKey()) r(!1);
      else
        try {
          await P();
        } finally {
          e || r(!1);
        }
    }
    return (
      t(),
      () => {
        e = !0;
      }
    );
  }, []),
    (0, S.useEffect)(() => {
      if (!e) return;
      let t = window.setInterval(() => {
          document.visibilityState === `visible` && P();
        }, 12e3),
        n = () => {
          document.visibilityState === `visible` && P();
        },
        r = () => void P();
      return (
        document.addEventListener(`visibilitychange`, n),
        window.addEventListener(`focus`, r),
        () => {
          (window.clearInterval(t),
            document.removeEventListener(`visibilitychange`, n),
            window.removeEventListener(`focus`, r));
        }
      );
    }, [e]));
  async function F(e) {
    (e.preventDefault(), f(!0), s(``));
    try {
      (await api.loginPanel(i.trim()), a(``), t(!0));
    } catch (e) {
      s(e instanceof Error ? e.message : `No se pudo entrar`);
    } finally {
      f(!1);
    }
  }
  async function I() {
    (await api.logoutPanel(), t(!1), m([]), b([]), A(null), j(!1));
  }
  async function ne() {
    N(`Creando respaldo…`);
    try {
      let e = await api.backupRun();
      N(
        `Respaldo OK · ${e.events} eventos · ${e.photos} fotos · ${new Date(e.at).toLocaleString(`es-DO`)}`,
      );
    } catch (e) {
      N(e instanceof Error ? e.message : `Falló el respaldo`);
    }
  }
  let R = (0, S.useMemo)(() => {
      let e = new Map();
      for (let t of y) e.set(W(t.vigilanteName), t.code);
      return e;
    }, [y]),
    z = (0, S.useMemo)(() => {
      let e = new Map();
      for (let t of y) {
        let n = W(t.vigilanteName);
        t.pushEnabled ? e.set(n, !0) : e.has(n) || e.set(n, !1);
      }
      return e;
    }, [y]),
    B = (0, S.useMemo)(() => {
      let e = new Map();
      for (let t of p) {
        let n = W(t.vigilanteName),
          r = e.get(n);
        r
          ? (r.events.push(t),
            (t.type === `ponche` || t.type === `photo`) && (r.ponches += 1),
            t.type === `photo` && (r.photos += 1),
            (r.blocked = !!_[n]?.blocked),
            (r.sirenOn = api.guardAlertActive(_[n])),
            (r.code = R.get(n) ?? r.code),
            (r.pushEnabled = z.get(n) === !0),
            new Date(t.timestamp) > new Date(r.lastAt) &&
              ((r.lastAt = t.timestamp),
              (r.serviceName = t.serviceName),
              (r.vigilanteName = t.vigilanteName)))
          : e.set(n, {
              key: n,
              vigilanteName: t.vigilanteName,
              serviceName: t.serviceName,
              events: [t],
              ponches: +(t.type === `ponche` || t.type === `photo`),
              photos: +(t.type === `photo`),
              lastAt: t.timestamp,
              blocked: !!_[n]?.blocked,
              sirenOn: api.guardAlertActive(_[n]),
              code: R.get(n) ?? null,
              pushEnabled: z.get(n) === !0,
            });
      }
      for (let t of y) {
        let n = W(t.vigilanteName);
        e.has(n) ||
          e.set(n, {
            key: n,
            vigilanteName: t.vigilanteName,
            serviceName: t.serviceName,
            events: [],
            ponches: 0,
            photos: 0,
            lastAt: t.updatedAt,
            blocked: !!_[n]?.blocked,
            sirenOn: api.guardAlertActive(_[n]),
            code: t.code,
            pushEnabled: !!t.pushEnabled,
          });
      }
      return [...e.values()].sort(
        (e, t) => new Date(t.lastAt).getTime() - new Date(e.lastAt).getTime(),
      );
    }, [p, _, y, R, z]),
    V = (0, S.useMemo)(() => {
      let e = T.trim().toLowerCase();
      return e
        ? B.filter(
            (t) =>
              t.vigilanteName.toLowerCase().includes(e) ||
              t.serviceName.toLowerCase().includes(e) ||
              (t.code ? t.code.toLowerCase().includes(e) : !1),
          )
        : B;
    }, [B, T]),
    U = (0, S.useMemo)(
      () =>
        p
          .filter((e) => e.type === `photo`)
          .sort(
            (e, t) =>
              new Date(t.timestamp).getTime() - new Date(e.timestamp).getTime(),
          ),
      [p],
    ),
    G = k ? (B.find((e) => e.key === k) ?? null) : null,
    K = p.filter((e) => e.type === `ponche` || e.type === `photo`).length,
    q = U.length;
  return n
    ? (L.jsx)(`div`, {
        className: `panel panel-login`,
        children: `Cargando panel…`,
      })
    : e
      ? te
        ? (L.jsx)(`div`, {
            className: `panel`,
            children: (L.jsx)(re, {
              photos: U,
              onBack: () => j(!1),
              onChanged: () => void P(),
            }),
          })
        : G
          ? (L.jsx)(`div`, {
              className: `panel`,
              children: (L.jsx)(H, {
                vigilanteName: G.vigilanteName,
                guardCode: G.code,
                events: G.events,
                moderation: _[G.key],
                devices: y,
                onBack: () => A(null),
                onChanged: () => void P(),
              }),
            })
          : (L.jsxs)(`div`, {
              className: `panel`,
              children: [
                (L.jsxs)(`header`, {
                  className: `panel-top no-print`,
                  children: [
                    (L.jsxs)(`div`, {
                      className: `panel-brand`,
                      children: [
                        (L.jsx)(`img`, {
                          src: `/logo-panel-tight.jpg?v=5`,
                          alt: `Reaction Force Security`,
                          className: `panel-logo`,
                        }),
                        (L.jsxs)(`div`, {
                          children: [
                            (L.jsx)(`p`, {
                              className: `panel-kicker`,
                              children: `Reaction Force Security · Panel`,
                            }),
                            (L.jsx)(`h1`, { children: `Panel receptor` }),
                            (L.jsx)(`p`, {
                              className: `panel-sub`,
                              children: `Central · no es la app de vigilantes`,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (L.jsxs)(`div`, {
                      className: `panel-stats`,
                      children: [
                        (L.jsxs)(`div`, {
                          children: [
                            (L.jsx)(`strong`, { children: V.length }),
                            (L.jsx)(`span`, { children: `Vigilantes` }),
                          ],
                        }),
                        (L.jsxs)(`div`, {
                          children: [
                            (L.jsx)(`strong`, { children: K }),
                            (L.jsx)(`span`, { children: `Ponches` }),
                          ],
                        }),
                        (L.jsxs)(`button`, {
                          type: `button`,
                          className: `panel-stat-btn`,
                          onClick: () => j(!0),
                          children: [
                            (L.jsx)(`strong`, { children: q }),
                            (L.jsx)(`span`, { children: `Fotos` }),
                          ],
                        }),
                      ],
                    }),
                    (L.jsxs)(`div`, {
                      className: `panel-actions`,
                      children: [
                        (L.jsx)(`button`, {
                          type: `button`,
                          className: `panel-refresh`,
                          onClick: () => j(!0),
                          children: `Ver fotos`,
                        }),
                        (L.jsx)(`button`, {
                          type: `button`,
                          className: `panel-refresh`,
                          onClick: () => void P(),
                          children: `Actualizar`,
                        }),
                        (L.jsx)(`button`, {
                          type: `button`,
                          className: `panel-refresh`,
                          onClick: () => void ne(),
                          children: `Respaldo`,
                        }),
                        (L.jsx)(`button`, {
                          type: `button`,
                          className: `panel-refresh panel-refresh-muted`,
                          onClick: () => void I(),
                          children: `Salir`,
                        }),
                      ],
                    }),
                  ],
                }),
                (L.jsxs)(`div`, {
                  className: `panel-toolbar no-print`,
                  children: [
                    (L.jsx)(`input`, {
                      type: `search`,
                      placeholder: `Buscar vigilante o servicio…`,
                      value: T,
                      onChange: (e) => E(e.target.value),
                    }),
                    (L.jsx)(`p`, {
                      className: `panel-sync`,
                      children:
                        C || M || (D ? `Última sync: ${D}` : `Conectando…`),
                    }),
                  ],
                }),
                (L.jsxs)(`section`, {
                  className: `live-feed no-print`,
                  "aria-label": `Vigilantes`,
                  children: [
                    (L.jsx)(`h2`, { children: `Vigilantes` }),
                    V.length > 0
                      ? (L.jsx)(`p`, {
                          className: `panel-hint`,
                          children: `Toca un vigilante para ver acciones: sirena, bloqueo y Eliminar vigilante.`,
                        })
                      : null,
                    V.length === 0
                      ? (L.jsxs)(`div`, {
                          className: `panel-empty`,
                          children: [
                            (L.jsx)(`h3`, {
                              children: `Sin eventos todavía`,
                            }),
                            (L.jsx)(`p`, {
                              children: `Cuando un vigilante marque ponche, aparecerá agrupado aquí por nombre.`,
                            }),
                          ],
                        })
                      : (L.jsx)(`ul`, {
                          className: `guard-groups`,
                          children: V.map((e) =>
                            (L.jsx)(
                              `li`,
                              {
                                children: (L.jsxs)(`button`, {
                                  type: `button`,
                                  className: `guard-group`,
                                  onClick: () => A(e.key),
                                  children: [
                                    (L.jsxs)(`div`, {
                                      className: `guard-group-main`,
                                      children: [
                                        (L.jsx)(`strong`, {
                                          children: e.vigilanteName,
                                        }),
                                        e.code
                                          ? (L.jsxs)(`span`, {
                                              className: `guard-code-chip`,
                                              children: [`Código `, e.code],
                                            })
                                          : null,
                                        (L.jsx)(`span`, {
                                          children: e.serviceName,
                                        }),
                                      ],
                                    }),
                                    (L.jsxs)(`div`, {
                                      className: `guard-group-meta`,
                                      children: [
                                        e.blocked
                                          ? (L.jsx)(`em`, {
                                              className: `badge-blocked`,
                                              children: `Bloqueado`,
                                            })
                                          : null,
                                        e.sirenOn
                                          ? (L.jsx)(`em`, {
                                              className: `badge-siren`,
                                              children: `Sirena`,
                                            })
                                          : null,
                                        e.pushEnabled
                                          ? (L.jsx)(`em`, {
                                              className: `badge-push-ok`,
                                              children: `Push`,
                                            })
                                          : (L.jsx)(`em`, {
                                              className: `badge-push-off`,
                                              children: `Sin push`,
                                            }),
                                        (L.jsxs)(`span`, {
                                          children: [e.ponches, ` ponches`],
                                        }),
                                        (L.jsxs)(`span`, {
                                          children: [e.photos, ` con foto`],
                                        }),
                                        (L.jsx)(`span`, {
                                          className: `chevron`,
                                          children: `Ver →`,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              },
                              e.key,
                            ),
                          ),
                        }),
                  ],
                }),
              ],
            })
      : (L.jsx)(`div`, {
          className: `panel panel-login`,
          children: (L.jsxs)(`div`, {
            className: `panel-login-card`,
            children: [
              (L.jsx)(`img`, {
                src: `/logo-panel-tight.jpg?v=5`,
                alt: `Reaction Force Security`,
                className: `panel-logo`,
              }),
              (L.jsx)(`p`, {
                className: `panel-kicker`,
                children: `Reaction Force Security`,
              }),
              (L.jsx)(`h1`, { children: `Panel central` }),
              (L.jsx)(`p`, {
                className: `panel-sub`,
                children: `Ingrese la clave de central para ver vigilantes, GPS y fotos.`,
              }),
              (L.jsxs)(`form`, {
                onSubmit: (e) => void F(e),
                children: [
                  (L.jsxs)(`div`, {
                    className: `field`,
                    children: [
                      (L.jsx)(`label`, {
                        htmlFor: `panel-pass`,
                        children: `Clave de central`,
                      }),
                      (L.jsx)(`input`, {
                        id: `panel-pass`,
                        type: `password`,
                        autoComplete: `current-password`,
                        inputMode: `numeric`,
                        value: i,
                        onChange: (e) => a(e.target.value),
                        placeholder: `••••••`,
                      }),
                    ],
                  }),
                  o
                    ? (L.jsx)(`p`, { className: `setup-error`, children: o })
                    : null,
                  (L.jsx)(`button`, {
                    type: `submit`,
                    className: `primary-btn`,
                    disabled: d || !i.trim(),
                    children: d ? `Entrando…` : `Entrar al panel`,
                  }),
                ],
              }),
            ],
          }),
        });
}
export default G
