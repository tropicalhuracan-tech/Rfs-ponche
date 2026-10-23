import{R as ie,h as he,i as se,k as Re,C as Fe,l as de,m as ge,o as Ae,q as Le,t as Ie,u as fe,v as Oe,w as Pe,x as Te,y as Me,z as ze,c as Ue,A as Ve,d as Be,e as qe,j as ve,r as Ge}from"./api-CnKulVIZ.js";const p=ie,e={jsx:ie.createElement,jsxs:ie.createElement,Fragment:ie.Fragment},te={"24h":"Últimas 24 horas","48h":"Últimas 48 horas","7d":"Última semana","30d":"Último mes"};function be(t,o=new Date){let s=new Date(o);return t==="24h"&&s.setHours(s.getHours()-24),t==="48h"&&s.setHours(s.getHours()-48),t==="7d"&&s.setDate(s.getDate()-7),t==="30d"&&s.setDate(s.getDate()-30),s}function Z(t){return t.type==="ponche"||t.type==="photo"}function ye(t){let o=t.filter(Z),s=new Map;for(let l of o){let m=new Date(l.timestamp).toLocaleDateString("es-DO",{day:"2-digit",month:"short"});s.set(m,(s.get(m)??0)+1)}return[...s.entries()].map(([l,m])=>({label:l,count:m})).reverse()}function je(t,o){return o<=0?0:Math.min(999,Math.round(t/o*1e3)/10)}function b(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function He(t){return t>=95?{title:"Cumplimiento excelente",note:"El personal alcanzó o superó la meta operativa establecida para el periodo evaluado.",color:"#2f8f5b"}:t>=80?{title:"Cumplimiento aceptable",note:"El nivel de actividad es adecuado, con margen menor de mejora para estabilizar la cobertura.",color:"#3d9b6a"}:t>=60?{title:"Cumplimiento parcial",note:"Se observan desviaciones frente a la meta. Se recomienda reforzar supervisión y frecuencia de rondas.",color:"#b8891f"}:{title:"Cumplimiento insuficiente",note:"La cantidad de ponches está por debajo de lo esperado. Requiere acción correctiva inmediata.",color:"#9d2d2d"}}function Ye(t){let o=t.events.filter(Z),s=t.events.filter(r=>r.type==="photo"),l=o.length,m=je(l,t.expected),h=He(m),x=ye(t.events),E=Math.max(1,...x.map(r=>r.count)),$=be(t.period),c=new Date,y=c.toLocaleString("es-DO",{dateStyle:"full",timeStyle:"short"}),z=`${$.toLocaleString("es-DO",{dateStyle:"medium",timeStyle:"short"})} — ${c.toLocaleString("es-DO",{dateStyle:"medium",timeStyle:"short"})}`,k=Math.max(0,t.expected-l),S=Math.max(0,l-t.expected),N=`RFS-${c.getFullYear()}${String(c.getMonth()+1).padStart(2,"0")}${String(c.getDate()).padStart(2,"0")}-${Math.abs(_e(`${t.vigilanteName}-${t.period}-${l}`)).toString().slice(0,6)}`,q=o.slice(0,50).map((r,C)=>{let D=new Date(r.timestamp).toLocaleString("es-DO"),F=r.latitude!=null&&r.longitude!=null?`${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`:"—",T=r.type==="photo"?"Foto":"GPS",U=r.type==="ponche"&&r.accuracy!=null?`±${Math.round(r.accuracy)} m`:T;return`<tr>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${C+1}</td>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${b(D)}</td>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${b(F)}</td>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${b(U)}</td>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${b(r.serviceName)}</td>
      </tr>`}).join(""),G=x.map(r=>{let C=Math.max(10,Math.round(r.count/E*100));return`<td style="vertical-align:bottom;text-align:center;padding:0 6px;">
        <div style="font-size:11px;color:#333;margin-bottom:4px;">${r.count}</div>
        <div style="height:${C}px;width:22px;background:#9D2D2D;border-radius:4px 4px 2px 2px;margin:0 auto;"></div>
        <div style="font-size:10px;color:#777;margin-top:6px;white-space:nowrap;">${b(r.label)}</div>
      </td>`}).join(""),L=x.map(r=>`  · ${r.label}: ${r.count} ponche(s)`).join(`
`),H=o.slice(0,30).map((r,C)=>{let D=new Date(r.timestamp).toLocaleString("es-DO"),F=r.latitude!=null&&r.longitude!=null?`${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`:"s/u",T=r.type==="photo"?"foto":"GPS";return`  ${C+1}. ${D} | ${F} | ${T} | ${r.serviceName}`}).join(`
`),P=k>0?`Se identificó un déficit de ${k} ponche(s) respecto a la meta.`:S>0?`Se registró un excedente de ${S} ponche(s) sobre la meta.`:"La actividad coincide exactamente con la meta establecida.",Y=["REACTION FORCE SECURITY","Reporte Corporativo de Efectividad de Ponches","================================================",`No. de reporte: ${N}`,`Fecha de emisión: ${y}`,"","1. IDENTIFICACIÓN DEL SERVICIO",`Vigilante: ${t.vigilanteName}`,`Puesto / servicio: ${t.serviceName}`,`Periodo evaluado: ${te[t.period]}`,`Rango calendario: ${z}`,"","2. RESUMEN EJECUTIVO",`Durante el periodo indicado se registraron ${l} ponche(s) de un total esperado de ${t.expected}.`,`La efectividad operativa calculada es de ${m}%.`,`Clasificación: ${h.title}.`,h.note,P,`Además se recibieron ${s.length} evidencia(s) fotográfica(s) asociada(s) al servicio.`,"","3. INDICADORES",`Ponches esperados: ${t.expected}`,`Ponches realizados: ${l}`,`Evidencias fotográficas: ${s.length}`,`Efectividad: ${m}%`,"","4. DISTRIBUCIÓN DIARIA",L||"  · Sin actividad registrada en el periodo.","","5. DETALLE DE PONCHES (muestra)",H||"  · Sin registros detallados.","","6. CONCLUSIÓN Y RECOMENDACIÓN",h.note,"Este documento es emitido por Reaction Force Security para fines de control operativo y seguimiento contractual del servicio de vigilancia.","","Atentamente,","Centro de Control — Reaction Force Security","reactionforce23@gmail.com"].join(`
`),_=k>0?`Se observa un déficit de <strong>${k}</strong> ponche(s) respecto a la meta contractual/operativa.`:S>0?`Se registró un excedente de <strong>${S}</strong> ponche(s) sobre la meta.`:"La actividad coincide con la meta establecida para el periodo.";return{html:`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reporte ${b(N)} · Reaction Force Security</title>
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
            <img src="${b(t.logoDataUrl)}" width="72" height="72" alt="Reaction Force Security" style="border-radius:50%;border:2px solid #fff;object-fit:cover;display:block;" />
          </td>
          <td>
            <div class="brand">REACTION FORCE SECURITY</div>
            <div class="title">Reporte Corporativo de Efectividad</div>
            <div class="sub">Control de ponches · ${b(te[t.period])} · ${b(N)}</div>
          </td>
        </tr>
      </table>
    </div>

    <div class="body">
      <p class="muted" style="font-size:12px;margin-bottom:16px;">Emitido: ${b(y)} · Rango evaluado: ${b(z)}</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td class="box" style="width:50%;">
            <div class="muted" style="font-size:11px;letter-spacing:1px;">VIGILANTE</div>
            <div style="font-size:18px;font-weight:700;margin-top:4px;">${b(t.vigilanteName)}</div>
          </td>
          <td class="box" style="width:50%;">
            <div class="muted" style="font-size:11px;letter-spacing:1px;">SERVICIO / PUESTO</div>
            <div style="font-size:18px;font-weight:700;margin-top:4px;">${b(t.serviceName)}</div>
          </td>
        </tr>
      </table>

      <div class="section">1. RESUMEN EJECUTIVO</div>
      <p>
        El presente informe documenta el desempeño operativo del vigilante
        <strong>${b(t.vigilanteName)}</strong> en el servicio
        <strong>${b(t.serviceName)}</strong> durante
        <strong>${b(te[t.period]).toLowerCase()}</strong>.
        Se contrastó la meta de <strong>${t.expected}</strong> ponches esperados
        con un total de <strong>${l}</strong> ponches efectivamente registrados
        en el sistema de control de Reaction Force Security.
      </p>
      <p>
        La efectividad resultante es de
        <strong style="color:${h.color};">${m}%</strong>
        (<strong style="color:${h.color};">(${b(h.title)})</strong>.
        ${b(h.note)}
        ${_}
        Durante el mismo lapso se anexaron <strong>${s.length}</strong> evidencia(s) fotográfica(s).
      </p>

      <div class="section">2. INDICADORES CLAVE</div>
      <table class="kpi" style="width:100%;border-collapse:collapse;margin-bottom:8px;">
        <tr>
          <td>
            <div class="l">ESPERADOS</div>
            <div class="v" style="color:#9D2D2D;">${t.expected}</div>
          </td>
          <td>
            <div class="l">REALIZADOS</div>
            <div class="v">${l}</div>
          </td>
          <td>
            <div class="l">FOTOS</div>
            <div class="v">${s.length}</div>
          </td>
          <td>
            <div class="l">EFECTIVIDAD</div>
            <div class="v" style="color:${h.color};">${m}%</div>
          </td>
        </tr>
      </table>

      <div class="section">3. DISTRIBUCIÓN DE PONCHES POR DÍA</div>
      <div class="box" style="min-height:130px;margin-bottom:8px;">
        ${G?`<table style="margin:0 auto;border-collapse:collapse;"><tr>${G}</tr></table>`:'<p class="muted" style="margin:0;">Sin actividad registrada en el periodo.</p>'}
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
          ${q||'<tr><td colspan="5" style="padding:12px;color:#777;">Sin registros en el periodo seleccionado.</td></tr>'}
        </tbody>
      </table>

      <div class="section">6. CONCLUSIÓN</div>
      <p>${b(h.note)}</p>
      <p>
        Documento emitido por el Centro de Control de <strong>Reaction Force Security</strong>
        para seguimiento del servicio de vigilancia y seguridad.
      </p>

      <div class="foot">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td>
              ${b(N)}<br/>
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
</html>`,text:Y,subject:`Reporte RFS ${N} · ${t.vigilanteName} · ${te[t.period]}`,effectiveness:m}}function _e(t){let o=0;for(let s=0;s<t.length;s+=1)o=(o<<5)-o+t.charCodeAt(s),o|=0;return o}var ae=null;async function We(){if(ae)return ae;try{let t=await(await fetch(`${window.location.origin}/logo-panel-tight.jpg?v=5`,{cache:"force-cache"})).blob();return ae=await new Promise((o,s)=>{let l=new FileReader;l.onload=()=>o(String(l.result)),l.onerror=()=>s(Error("No se pudo leer el logo")),l.readAsDataURL(t)}),ae}catch{return"data:image/gif;base64,R0lGODlhAQABAAAAACw="}}function Ke(t){var $;let o=document.getElementById("rfs-print-frame");o&&o.remove();let s=document.createElement("iframe");s.id="rfs-print-frame",s.setAttribute("aria-hidden","true"),s.style.position="fixed",s.style.right="0",s.style.bottom="0",s.style.width="0",s.style.height="0",s.style.border="0",s.style.opacity="0",s.style.pointerEvents="none",document.body.appendChild(s);let l=s.contentDocument||(($=s.contentWindow)==null?void 0:$.document);if(!l){s.remove();return}l.open(),l.write(t),l.close();let m=()=>{var c,y;try{(c=s.contentWindow)==null||c.focus(),(y=s.contentWindow)==null||y.print()}finally{setTimeout(()=>s.remove(),1500)}},h=Array.from(l.images);if(h.length===0){setTimeout(m,250);return}let x=h.length,E=()=>{--x,x<=0&&setTimeout(m,200)};h.forEach(c=>{c.complete?E():(c.addEventListener("load",E),c.addEventListener("error",E))})}function Je(t){let o=`
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
</div>`;return t.includes("<body>")?t.replace("<body>",`<body>${o}`):o+t}function xe(t){let o=Je(t),s=new Blob([o],{type:"text/html;charset=utf-8"}),l=URL.createObjectURL(s);window.open(l,"_blank")?setTimeout(()=>URL.revokeObjectURL(l),12e4):(URL.revokeObjectURL(l),Ze(o))}function Ze(t){var h;let o=document.getElementById("rfs-preview-overlay");o&&o.remove();let s=document.createElement("div");s.id="rfs-preview-overlay",s.style.cssText="position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.72);display:flex;flex-direction:column;";let l=document.createElement("div");l.style.cssText="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;background:#111;color:#fff;font-family:Arial,sans-serif;",l.innerHTML='<strong>Vista previa del reporte</strong><button type="button" id="rfs-preview-close" style="border:0;border-radius:8px;min-height:40px;padding:0 14px;font-weight:700;cursor:pointer;background:#fff;color:#111;">← Volver al panel</button>';let m=document.createElement("iframe");m.style.cssText="flex:1;width:100%;border:0;background:#fff;",m.srcdoc=t,s.appendChild(l),s.appendChild(m),document.body.appendChild(s),(h=l.querySelector("#rfs-preview-close"))==null||h.addEventListener("click",()=>s.remove())}const Qe=432e5;function Xe(t){return new Date(t).toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"})}function et(t){let o=new Date(t);return`${o.getFullYear()}-${String(o.getMonth()+1).padStart(2,"0")}-${String(o.getDate()).padStart(2,"0")}`}function tt(t){let[o,s,l]=t.split("-").map(Number),m=new Date(o,s-1,l),h=new Date,x=new Date;x.setDate(h.getDate()-1);let E=($,c)=>$.getFullYear()===c.getFullYear()&&$.getMonth()===c.getMonth()&&$.getDate()===c.getDate();return E(m,h)?"Hoy":E(m,x)?"Ayer":m.toLocaleDateString("es-DO",{weekday:"long",day:"numeric",month:"short"})}function at({vigilanteName:t,guardCode:o=null,events:s,moderation:l,devices:m=[],onBack:h,onChanged:x}){var ue;let E=(0,p.useMemo)(()=>{let n=t.trim().toLowerCase().replace(/\s+/g," ");return m.filter(d=>d.vigilanteName.trim().toLowerCase().replace(/\s+/g," ")===n&&d.pushEnabled)},[m,t]),$=E.length>0,[c,y]=(0,p.useState)("24h"),[z,k]=(0,p.useState)("8"),[S,N]=(0,p.useState)(null),[q,G]=(0,p.useState)(!1),[L,H]=(0,p.useState)(()=>{try{return localStorage.getItem("rfs-report-client-email")??""}catch{return""}}),[P,Y]=(0,p.useState)(()=>{try{return localStorage.getItem("rfs-report-copy-email")??""}catch{return""}}),[_,r]=(0,p.useState)(""),[C,D]=(0,p.useState)(!1),[F,T]=(0,p.useState)(""),[U,I]=(0,p.useState)(null),[W,re]=(0,p.useState)(!1),Q=((ue=s[0])==null?void 0:ue.serviceName)??"—",O=Math.max(0,Number(z)||0),V=(0,p.useMemo)(()=>{let n=be(c).getTime();return s.filter(d=>new Date(d.timestamp).getTime()>=n)},[s,c]),M=(0,p.useMemo)(()=>{let n=Date.now()-Qe;return s.filter(d=>new Date(d.timestamp).getTime()>=n).sort((d,u)=>new Date(u.timestamp).getTime()-new Date(d.timestamp).getTime())},[s]),K=W?[...s].sort((n,d)=>new Date(d.timestamp).getTime()-new Date(n.timestamp).getTime()):M,J=(0,p.useMemo)(()=>{let n=new Map;for(let d of K){let u=et(d.timestamp),R=n.get(u);R?R.push(d):n.set(u,[d])}return[...n.entries()]},[K]),B=Math.max(0,s.length-M.length),le=V.filter(n=>n.type==="photo"),X=V.filter(Z).length,i=je(X,O),g=ye(V),A=Math.max(1,...g.map(n=>n.count));async function ee(){if(!(O<=0)){G(!0),r("");try{let n=await We(),d=Ye({vigilanteName:t,serviceName:Q,period:c,expected:O,events:V,logoDataUrl:n});N(d)}catch(n){r(n instanceof Error?n.message:"No se pudo generar el reporte"),N(null)}finally{G(!1)}}}async function v(){if(confirm(`¿Reiniciar el conteo de ${t}?`)){D(!0);try{await Me(t),x(),h()}catch(n){r(n instanceof Error?n.message:"Error al reiniciar")}finally{D(!1)}}}async function f(){let n=!(l!=null&&l.blocked),d=n?`¿Bloquear a ${t}? No llegarán más ponches.`:`¿Desbloquear a ${t}?`;if(confirm(d)){D(!0);try{await ze(t,n),x()}catch(u){r(u instanceof Error?u.message:"Error de bloqueo")}finally{D(!1)}}}let j=se(l),[oe,Ne]=(0,p.useState)(()=>(l==null?void 0:l.alertSound)??"wail"),[we,ce]=(0,p.useState)(!1);async function Se(n){Ne(n),ce(!0);try{let d=new Audio(Ue(n));d.volume=1,await d.play(),window.setTimeout(()=>{d.pause(),ce(!1)},2200)}catch{ce(!1),r("No se pudo reproducir la vista previa en este navegador.")}}async function Ee(){var u;if(j){if(!confirm(`¿Detener la sirena de ${t}?`))return;D(!0),r("Deteniendo sirena…");try{await Pe(t),r("Sirena detenida desde central."),x()}catch(R){r(R instanceof Error?R.message:"No se pudo controlar la sirena")}finally{D(!1)}return}let n=((u=ge.find(R=>R.id===oe))==null?void 0:u.label)??"Clásica";if(!$){r("Este vigilante no tiene notificaciones activas en el teléfono. Debe abrir RFS Ponche → Configuración → “Activar alertas” (en iPhone, instalada en pantalla de inicio).");return}let d=`¿Enviar sirena «${n}» a ${t}? Se enviará notificación push al teléfono.`;if(confirm(d)){D(!0),r(`Activando sirena ${n}…`);try{let{push:R}=await Te(t,15,oe);R.sent>0?r(`Sirena «${n}» enviada: ${R.sent} notificación(es) push. Si no aparece, el vigilante debe reactivar alertas en la app.`):R.failed>0?r(`Sirena activada en central, pero el push falló (${R.failed}). Pida al vigilante reactivar alertas en Configuración.`):r("Sirena activada en central, pero no hay teléfono con push registrado para este vigilante."),x()}catch(R){r(R instanceof Error?R.message:"No se pudo controlar la sirena")}finally{D(!1)}}}function pe(n,d){try{localStorage.setItem("rfs-report-client-email",n),localStorage.setItem("rfs-report-copy-email",d)}catch{}}async function me(n){if(!S)r("Genere el reporte primero.");else if(!n.to.includes("@"))r("Escriba un correo válido.");else if(n.cc&&!n.cc.includes("@"))r("El correo de copia no es válido.");else{D(!0),r(`Enviando ${n.label}…`);try{let d=await Ve({to:n.to,cc:n.cc,subject:S.subject,text:S.text,html:S.html});if(d.ok){let u=n.cc?` · copia a ${n.cc}`:"";r(`Enviado a ${n.to}${u} desde ${d.from??"reactionforce23@gmail.com"}.`)}else d.composeUrl?(xe(S.html),window.open(d.composeUrl,"_blank"),r("Se abrió el reporte visual y Gmail. Si no tiene SMTP, use Imprimir/PDF y adjúntelo.")):r("No se pudo enviar el correo.")}catch(d){r(d instanceof Error?d.message:"Error de correo")}finally{D(!1)}}}async function $e(){let n=L.trim(),d=P.trim();pe(n,d),await me({to:n,cc:d||void 0,label:d?"reporte al cliente con copia":"reporte al cliente"})}async function Ce(){let n=P.trim();pe(L.trim(),n),await me({to:n,label:"copia del reporte"})}function De(){S&&window.open(`https://wa.me/?text=${encodeURIComponent(S.text)}`,"_blank")}async function ke(n){I(n.id),T("Preparando descarga…");try{await fe(n),T("Foto lista para guardar en el teléfono o computadora.")}catch(d){T(d instanceof Error?d.message:"No se pudo descargar")}finally{I(null)}}return e.jsxs("section",{className:"guard-detail",children:[e.jsx("button",{type:"button",className:"back-btn no-print",onClick:h,children:"← Volver a vigilantes"}),e.jsxs("div",{className:"guard-detail-head",children:[e.jsxs("div",{children:[e.jsx("p",{className:"panel-kicker",children:"Detalle del vigilante"}),e.jsx("h2",{children:t}),o?e.jsxs("p",{className:"guard-code-line",children:["Código único: ",e.jsx("strong",{children:o})]}):null,e.jsx("p",{className:"service",children:Q}),l!=null&&l.blocked?e.jsx("span",{className:"badge-blocked",children:"Bloqueado"}):null,j?e.jsx("span",{className:"badge-siren",children:"Sirena activa"}):null,$?e.jsxs("span",{className:"badge-push-ok",children:["Push activo (",E.length,")"]}):e.jsx("span",{className:"badge-push-off",children:"Sin notificación push"})]}),e.jsxs("div",{className:"guard-actions no-print",children:[e.jsx("button",{type:"button",className:j?"secondary-btn siren-btn-stop":"secondary-btn siren-btn",disabled:C,onClick:()=>void Ee(),children:j?"Detener sirena":"Enviar sirena"}),e.jsx("button",{type:"button",className:"secondary-btn",disabled:C,onClick:()=>void v(),children:"Reiniciar conteo"}),e.jsx("button",{type:"button",className:"secondary-btn",disabled:C,onClick:()=>void f(),children:l!=null&&l.blocked?"Desbloquear":"Bloquear"})]})]}),j?null:e.jsxs("div",{className:"siren-sound-picker no-print",role:"group","aria-label":"Tipo de sirena",children:[e.jsx("p",{className:"siren-sound-label",children:"Elegir sonido de alerta"}),e.jsx("div",{className:"siren-sound-options",children:ge.map(n=>e.jsxs("button",{type:"button",className:oe===n.id?"siren-sound-opt is-selected":"siren-sound-opt",disabled:C||we,onClick:()=>void Se(n.id),children:[e.jsx("strong",{children:n.label}),e.jsx("span",{children:n.hint})]},n.id))})]}),e.jsxs("div",{className:"detail-stats",children:[e.jsxs("div",{children:[e.jsx("strong",{children:M.filter(Z).length}),e.jsx("span",{children:"Últimas 12 h"})]}),e.jsxs("div",{children:[e.jsx("strong",{children:M.filter(n=>n.type==="photo").length}),e.jsx("span",{children:"Fotos (12 h)"})]}),e.jsxs("div",{children:[e.jsx("strong",{children:s.filter(Z).length}),e.jsx("span",{children:"Total"})]})]}),e.jsxs("div",{className:"section-title-row no-print",children:[e.jsx("h3",{className:"section-title",children:W?"Historial completo":"Últimas 12 horas"}),B>0?e.jsx("button",{type:"button",className:"link-btn",onClick:()=>re(n=>!n),children:W?"Solo 12 horas":`Ver anteriores (${B})`}):null]}),F?e.jsx("p",{className:"panel-sync no-print",children:F}):null,J.length===0?e.jsxs("div",{className:"panel-empty",children:[e.jsx("h3",{children:"Sin registros en este periodo"}),e.jsx("p",{children:W?"Este vigilante aún no tiene ponches.":"No hay ponches en las últimas 12 horas."})]}):e.jsx("div",{className:"day-groups",children:J.map(([n,d])=>e.jsxs("section",{className:"day-group",children:[e.jsxs("h4",{className:"day-group-title",children:[e.jsx("span",{children:tt(n)}),e.jsxs("em",{children:[d.length," registro(s)"]})]}),e.jsx("ul",{className:"panel-list",children:d.map(u=>e.jsxs("li",{className:"panel-row",children:[e.jsx("span",{className:`tag tag-${u.type}`,children:u.type==="ponche"?"Ponche":"Foto = ponche"}),e.jsxs("div",{className:"panel-row-main",children:[e.jsx("strong",{children:Xe(u.timestamp)}),e.jsx("span",{children:u.serviceName})]}),"latitude"in u&&u.latitude!=null&&u.longitude!=null?e.jsx("a",{className:"panel-map",href:`https://maps.google.com/?q=${u.latitude},${u.longitude}`,target:"_blank",rel:"noreferrer",children:"Mapa"}):e.jsx("span",{className:"panel-map muted",children:"—"}),u.type==="photo"?e.jsxs("div",{className:"inline-photo-wrap",children:[e.jsx("div",{className:"inline-photo",children:e.jsx("img",{src:de(u),alt:`Foto de ${u.vigilanteName}`})}),e.jsxs("div",{className:"photo-actions",children:[e.jsx("a",{className:"photo-view",href:de(u),target:"_blank",rel:"noreferrer",children:"Ver grande"}),e.jsx("button",{type:"button",className:"photo-download",disabled:U===u.id,onClick:()=>void ke(u),children:U===u.id?"Descargando…":"Descargar foto"}),e.jsx("a",{className:"photo-download-link",href:a(u),download:!0,children:"Guardar archivo"})]})]}):null]},`${u.type}-${u.id}`))})]},n))}),e.jsxs("div",{className:"report",id:"report-section",children:[e.jsxs("div",{className:"report-head",children:[e.jsx("h2",{children:"Reporte de este vigilante"}),e.jsx("p",{children:"Elija periodo, meta de ponches y genere el documento corporativo (impresión = correo)."})]}),e.jsxs("div",{className:"report-form no-print",children:[e.jsxs("div",{className:"field",children:[e.jsx("label",{children:"Periodo"}),e.jsx("div",{className:"report-periods",children:Object.keys(w).map(n=>e.jsx("button",{type:"button",className:c===n?"is-on":"",onClick:()=>{y(n),N(null)},children:w[n]},n))})]}),e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"expected-detail",children:"Ponches que deberían existir"}),e.jsx("input",{id:"expected-detail",type:"number",min:1,value:z,onChange:n=>{k(n.target.value),N(null)}})]}),e.jsx("button",{type:"button",className:"primary-btn report-run",disabled:O<=0||q,onClick:()=>void ee(),children:q?"Preparando…":"Generar reporte"})]}),S?e.jsxs("div",{className:"report-output",id:"report-print-area",children:[e.jsxs("div",{className:"report-brand",children:[e.jsx("img",{src:"/logo-panel-tight.jpg?v=5",alt:"Reaction Force Security"}),e.jsxs("div",{children:[e.jsx("p",{className:"report-kicker",children:"Reaction Force Security"}),e.jsx("h3",{children:"Reporte de efectividad"}),e.jsxs("p",{children:[w[c]," · ",t]})]})]}),e.jsxs("div",{className:"report-summary",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Esperados"}),e.jsx("strong",{children:O})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Realizados"}),e.jsx("strong",{children:X})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Fotos"}),e.jsx("strong",{children:le.length})]}),e.jsxs("div",{className:"eff",children:[e.jsx("span",{children:"Efectividad"}),e.jsxs("strong",{children:[i,"%"]})]})]}),e.jsxs("div",{className:"report-chart",children:[e.jsx("h4",{children:"Ponches por día"}),g.length===0?e.jsx("p",{className:"report-empty",children:"Sin ponches en este periodo."}):e.jsx("div",{className:"bars",children:g.map(n=>e.jsxs("div",{className:"bar-col",children:[e.jsx("div",{className:"bar",style:{height:`${Math.max(8,n.count/A*120)}px`}}),e.jsx("span",{className:"bar-count",children:n.count}),e.jsx("span",{className:"bar-label",children:n.label})]},n.label))}),e.jsxs("div",{className:"chart-scale",children:[e.jsxs("div",{className:"scale-expected",children:["Meta del periodo: ",O," ponches"]}),e.jsx("div",{className:"gauge",children:e.jsx("div",{className:"gauge-fill",style:{width:`${Math.min(100,i)}%`}})})]})]}),e.jsxs("div",{className:"report-mail no-print",children:[e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"client-email",children:"Correo del cliente"}),e.jsx("input",{id:"client-email",type:"email",placeholder:"cliente@empresa.com",value:L,onChange:n=>H(n.target.value)})]}),e.jsxs("div",{className:"report-copy-box",children:[e.jsx("h4",{children:"Enviar copia a otro correo"}),e.jsx("p",{children:"Opcional. Puede mandar una copia al mismo tiempo o solo a este correo."}),e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"copy-email",children:"Correo de copia"}),e.jsx("input",{id:"copy-email",type:"email",placeholder:"supervisor@empresa.com",value:P,onChange:n=>Y(n.target.value)})]}),e.jsx("button",{type:"button",className:"secondary-btn",disabled:C||!P.trim(),onClick:()=>void Ce(),children:"Enviar solo copia"})]}),e.jsx("small",{className:"mail-hint",children:"Sale desde reactionforce23@gmail.com con el mismo HTML del reporte impreso."})]}),e.jsxs("div",{className:"report-actions no-print",children:[e.jsx("button",{type:"button",className:"secondary-btn",onClick:()=>Ke(S.html),children:"Imprimir / PDF"}),e.jsx("button",{type:"button",className:"secondary-btn",onClick:()=>xe(S.html),children:"Ver documento"}),e.jsxs("button",{type:"button",className:"secondary-btn",disabled:C||!L.trim(),onClick:()=>void $e(),children:["Enviar al cliente",P.trim()?" + copia":""]}),e.jsx("button",{type:"button",className:"primary-btn",onClick:De,children:"WhatsApp"})]}),_?e.jsx("p",{className:"panel-sync no-print",children:_}):null]}):null]})]})}function nt(t){return new Date(t).toLocaleString("es-DO",{dateStyle:"short",timeStyle:"short"})}function it({photos:t,onBack:o,onChanged:s}){let[l,m]=(0,p.useState)(null),[h,x]=(0,p.useState)("");async function E(c){m(c.id),x("Descargando…");try{await fe(c),x("Descarga lista")}catch(y){x(y instanceof Error?y.message:"No se pudo descargar")}finally{m(null)}}async function $(c){if(confirm(`¿Borrar esta foto de ${c.vigilanteName}?
Se elimina de inmediato del panel.`)){m(c.id),x("Borrando…");try{await Oe(c.id),x("Foto borrada"),s()}catch(y){x(y instanceof Error?y.message:"No se pudo borrar")}finally{m(null)}}}return e.jsxs("div",{className:"photos-gallery",children:[e.jsxs("header",{className:"gallery-top no-print",children:[e.jsx("button",{type:"button",className:"panel-refresh gallery-back",onClick:o,children:"← Volver"}),e.jsxs("div",{children:[e.jsx("p",{className:"panel-kicker",children:"Central · Fotos"}),e.jsx("h1",{children:"Todas las fotos"}),e.jsxs("p",{className:"panel-sub",children:[t.length," foto(s) de todos los vigilantes"]})]})]}),h?e.jsx("p",{className:"gallery-status no-print",children:h}):null,t.length===0?e.jsxs("div",{className:"panel-empty",children:[e.jsx("h3",{children:"Sin fotos"}),e.jsx("p",{children:"Cuando un vigilante envíe una foto, aparecerá aquí."})]}):e.jsx("ul",{className:"gallery-grid",children:t.map(c=>e.jsxs("li",{className:"gallery-card",children:[e.jsx("img",{src:de(c),alt:`Foto de ${c.vigilanteName}`}),e.jsxs("div",{className:"gallery-meta",children:[e.jsx("strong",{children:c.vigilanteName}),e.jsx("span",{children:c.serviceName}),e.jsx("time",{dateTime:c.timestamp,children:nt(c.timestamp)})]}),e.jsxs("div",{className:"gallery-actions",children:[e.jsx("button",{type:"button",className:"gallery-btn gallery-btn-down",disabled:l===c.id,onClick:()=>void E(c),children:"Descargar"}),e.jsx("button",{type:"button",className:"gallery-btn gallery-btn-del",disabled:l===c.id,onClick:()=>void $(c),children:"Borrar"})]})]},c.id))})]})}function ne(t){return t.trim().toLowerCase().replace(/\s+/g," ")}function st(){let[t,o]=(0,p.useState)(!1),[s,l]=(0,p.useState)(()=>!!he()),[m,h]=(0,p.useState)(""),[x,E]=(0,p.useState)(""),[$,c]=(0,p.useState)(!1),[y,z]=(0,p.useState)([]),[k,S]=(0,p.useState)({}),[N,q]=(0,p.useState)([]),[G,L]=(0,p.useState)(""),[H,P]=(0,p.useState)(""),[Y,_]=(0,p.useState)(""),[r,C]=(0,p.useState)(null),[D,F]=(0,p.useState)(!1),[T,U]=(0,p.useState)("");async function I(){try{let i=await Re();z(i.events),S(i.moderation),q(i.devices),_(new Date().toLocaleTimeString("es-DO")),L(""),o(!0)}catch(i){if(i instanceof Fe&&i.status===401){o(!1),L("Sesión de central requerida");return}L(i instanceof Error?i.message:"Error de conexión")}}(0,p.useEffect)(()=>{document.title="RFS Panel · Central";let i=!1;async function g(){if(!he())l(!1);else try{await I()}finally{i||l(!1)}}return g(),()=>{i=!0}},[]),(0,p.useEffect)(()=>{if(!t)return;let i=window.setInterval(()=>{document.visibilityState==="visible"&&I()},12e3),g=()=>{document.visibilityState==="visible"&&I()},A=()=>void I();return document.addEventListener("visibilitychange",g),window.addEventListener("focus",A),()=>{window.clearInterval(i),document.removeEventListener("visibilitychange",g),window.removeEventListener("focus",A)}},[t]);async function W(i){i.preventDefault(),c(!0),E("");try{await Ie(m.trim()),h(""),o(!0)}catch(g){E(g instanceof Error?g.message:"No se pudo entrar")}finally{c(!1)}}async function re(){await Le(),o(!1),z([]),q([]),C(null),F(!1)}async function Q(){U("Creando respaldo…");try{let i=await Ae();U(`Respaldo OK · ${i.events} eventos · ${i.photos} fotos · ${new Date(i.at).toLocaleString("es-DO")}`)}catch(i){U(i instanceof Error?i.message:"Falló el respaldo")}}let O=(0,p.useMemo)(()=>{let i=new Map;for(let g of N)i.set(ne(g.vigilanteName),g.code);return i},[N]),V=(0,p.useMemo)(()=>{let i=new Map;for(let g of N){let A=ne(g.vigilanteName);g.pushEnabled?i.set(A,!0):i.has(A)||i.set(A,!1)}return i},[N]),M=(0,p.useMemo)(()=>{var g,A,ee;let i=new Map;for(let v of y){let f=ne(v.vigilanteName),j=i.get(f);j?(j.events.push(v),(v.type==="ponche"||v.type==="photo")&&(j.ponches+=1),v.type==="photo"&&(j.photos+=1),j.blocked=!!((g=k[f])!=null&&g.blocked),j.sirenOn=se(k[f]),j.code=O.get(f)??j.code,j.pushEnabled=V.get(f)===!0,new Date(v.timestamp)>new Date(j.lastAt)&&(j.lastAt=v.timestamp,j.serviceName=v.serviceName,j.vigilanteName=v.vigilanteName)):i.set(f,{key:f,vigilanteName:v.vigilanteName,serviceName:v.serviceName,events:[v],ponches:+(v.type==="ponche"||v.type==="photo"),photos:+(v.type==="photo"),lastAt:v.timestamp,blocked:!!((A=k[f])!=null&&A.blocked),sirenOn:se(k[f]),code:O.get(f)??null,pushEnabled:V.get(f)===!0})}for(let v of N){let f=ne(v.vigilanteName);i.has(f)||i.set(f,{key:f,vigilanteName:v.vigilanteName,serviceName:v.serviceName,events:[],ponches:0,photos:0,lastAt:v.updatedAt,blocked:!!((ee=k[f])!=null&&ee.blocked),sirenOn:se(k[f]),code:v.code,pushEnabled:!!v.pushEnabled})}return[...i.values()].sort((v,f)=>new Date(f.lastAt).getTime()-new Date(v.lastAt).getTime())},[y,k,N,O,V]),K=(0,p.useMemo)(()=>{let i=H.trim().toLowerCase();return i?M.filter(g=>g.vigilanteName.toLowerCase().includes(i)||g.serviceName.toLowerCase().includes(i)||(g.code?g.code.toLowerCase().includes(i):!1)):M},[M,H]),J=(0,p.useMemo)(()=>y.filter(i=>i.type==="photo").sort((i,g)=>new Date(g.timestamp).getTime()-new Date(i.timestamp).getTime()),[y]),B=r?M.find(i=>i.key===r)??null:null,le=y.filter(i=>i.type==="ponche"||i.type==="photo").length,X=J.length;return s?e.jsx("div",{className:"panel panel-login",children:"Cargando panel…"}):t?D?e.jsx("div",{className:"panel",children:e.jsx(it,{photos:J,onBack:()=>F(!1),onChanged:()=>void I()})}):B?e.jsx("div",{className:"panel",children:e.jsx(at,{vigilanteName:B.vigilanteName,guardCode:B.code,events:B.events,moderation:k[B.key],devices:N,onBack:()=>C(null),onChanged:()=>void I()})}):e.jsxs("div",{className:"panel",children:[e.jsxs("header",{className:"panel-top no-print",children:[e.jsxs("div",{className:"panel-brand",children:[e.jsx("img",{src:"/logo-panel-tight.jpg?v=5",alt:"Reaction Force Security",className:"panel-logo"}),e.jsxs("div",{children:[e.jsx("p",{className:"panel-kicker",children:"Reaction Force Security · Panel"}),e.jsx("h1",{children:"Panel receptor"}),e.jsx("p",{className:"panel-sub",children:"Central · no es la app de vigilantes"})]})]}),e.jsxs("div",{className:"panel-stats",children:[e.jsxs("div",{children:[e.jsx("strong",{children:K.length}),e.jsx("span",{children:"Vigilantes"})]}),e.jsxs("div",{children:[e.jsx("strong",{children:le}),e.jsx("span",{children:"Ponches"})]}),e.jsxs("button",{type:"button",className:"panel-stat-btn",onClick:()=>F(!0),children:[e.jsx("strong",{children:X}),e.jsx("span",{children:"Fotos"})]})]}),e.jsxs("div",{className:"panel-actions",children:[e.jsx("button",{type:"button",className:"panel-refresh",onClick:()=>F(!0),children:"Ver fotos"}),e.jsx("button",{type:"button",className:"panel-refresh",onClick:()=>void I(),children:"Actualizar"}),e.jsx("button",{type:"button",className:"panel-refresh",onClick:()=>void Q(),children:"Respaldo"}),e.jsx("button",{type:"button",className:"panel-refresh panel-refresh-muted",onClick:()=>void re(),children:"Salir"})]})]}),e.jsxs("div",{className:"panel-toolbar no-print",children:[e.jsx("input",{type:"search",placeholder:"Buscar vigilante o servicio…",value:H,onChange:i=>P(i.target.value)}),e.jsx("p",{className:"panel-sync",children:G||T||(Y?`Última sync: ${Y}`:"Conectando…")})]}),e.jsxs("section",{className:"live-feed no-print","aria-label":"Vigilantes",children:[e.jsx("h2",{children:"Vigilantes"}),K.length===0?e.jsxs("div",{className:"panel-empty",children:[e.jsx("h3",{children:"Sin eventos todavía"}),e.jsx("p",{children:"Cuando un vigilante marque ponche, aparecerá agrupado aquí por nombre."})]}):e.jsx("ul",{className:"guard-groups",children:K.map(i=>e.jsx("li",{children:e.jsxs("button",{type:"button",className:"guard-group",onClick:()=>C(i.key),children:[e.jsxs("div",{className:"guard-group-main",children:[e.jsx("strong",{children:i.vigilanteName}),i.code?e.jsxs("span",{className:"guard-code-chip",children:["Código ",i.code]}):null,e.jsx("span",{children:i.serviceName})]}),e.jsxs("div",{className:"guard-group-meta",children:[i.blocked?e.jsx("em",{className:"badge-blocked",children:"Bloqueado"}):null,i.sirenOn?e.jsx("em",{className:"badge-siren",children:"Sirena"}):null,i.pushEnabled?e.jsx("em",{className:"badge-push-ok",children:"Push"}):e.jsx("em",{className:"badge-push-off",children:"Sin push"}),e.jsxs("span",{children:[i.ponches," ponches"]}),e.jsxs("span",{children:[i.photos," con foto"]}),e.jsx("span",{className:"chevron",children:"Ver →"})]})]})},i.key))})]})]}):e.jsx("div",{className:"panel panel-login",children:e.jsxs("div",{className:"panel-login-card",children:[e.jsx("img",{src:"/logo-panel-tight.jpg?v=5",alt:"Reaction Force Security",className:"panel-logo"}),e.jsx("p",{className:"panel-kicker",children:"Reaction Force Security"}),e.jsx("h1",{children:"Panel central"}),e.jsx("p",{className:"panel-sub",children:"Ingrese la clave de central para ver vigilantes, GPS y fotos."}),e.jsxs("form",{onSubmit:i=>void W(i),children:[e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"panel-pass",children:"Clave de central"}),e.jsx("input",{id:"panel-pass",type:"password",autoComplete:"current-password",inputMode:"numeric",value:m,onChange:i=>h(i.target.value),placeholder:"••••••"})]}),x?e.jsx("p",{className:"setup-error",children:x}):null,e.jsx("button",{type:"submit",className:"primary-btn",disabled:$||!m.trim(),children:$?"Entrando…":"Entrar al panel"})]})]})})}Be();qe.createRoot(document.getElementById("root")).render(ve.jsx(Ge.StrictMode,{children:ve.jsx(st,{})}));
