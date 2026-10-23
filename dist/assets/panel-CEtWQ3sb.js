import{R as ne,h as he,i as ie,k as Ae,C as Fe,l as de,m as ge,o as Le,q as Ie,t as Oe,u as Pe,v as be,w as Te,x as Me,y as Ue,z as ze,A as Ve,B as Be,c as qe,D as Ge,d as He,e as _e,j as ve,r as Ye}from"./api-GDf-eiiH.js";const d=ne,e={jsx:ne.createElement,jsxs:ne.createElement,Fragment:ne.Fragment},xe="2026.10.23c",se=t=>`/${t.replace(/^\//,"")}`,H={"24h":"Últimas 24 horas","48h":"Últimas 48 horas","7d":"Última semana","30d":"Último mes"};function ye(t,o=new Date){let i=new Date(o);return t==="24h"&&i.setHours(i.getHours()-24),t==="48h"&&i.setHours(i.getHours()-48),t==="7d"&&i.setDate(i.getDate()-7),t==="30d"&&i.setDate(i.getDate()-30),i}function Z(t){return t.type==="ponche"||t.type==="photo"}function je(t){let o=t.filter(Z),i=new Map;for(let r of o){let p=new Date(r.timestamp).toLocaleDateString("es-DO",{day:"2-digit",month:"short"});i.set(p,(i.get(p)??0)+1)}return[...i.entries()].map(([r,p])=>({label:r,count:p})).reverse()}function Ne(t,o){return o<=0?0:Math.min(999,Math.round(t/o*1e3)/10)}function f(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function We(t){return t>=95?{title:"Cumplimiento excelente",note:"El personal alcanzó o superó la meta operativa establecida para el periodo evaluado.",color:"#2f8f5b"}:t>=80?{title:"Cumplimiento aceptable",note:"El nivel de actividad es adecuado, con margen menor de mejora para estabilizar la cobertura.",color:"#3d9b6a"}:t>=60?{title:"Cumplimiento parcial",note:"Se observan desviaciones frente a la meta. Se recomienda reforzar supervisión y frecuencia de rondas.",color:"#b8891f"}:{title:"Cumplimiento insuficiente",note:"La cantidad de ponches está por debajo de lo esperado. Requiere acción correctiva inmediata.",color:"#9d2d2d"}}function Ke(t){let o=t.events.filter(Z),i=t.events.filter(s=>s.type==="photo"),r=o.length,p=Ne(r,t.expected),u=We(p),v=je(t.events),S=Math.max(1,...v.map(s=>s.count)),E=ye(t.period),c=new Date,b=c.toLocaleString("es-DO",{dateStyle:"full",timeStyle:"short"}),T=`${E.toLocaleString("es-DO",{dateStyle:"medium",timeStyle:"short"})} — ${c.toLocaleString("es-DO",{dateStyle:"medium",timeStyle:"short"})}`,$=Math.max(0,t.expected-r),N=Math.max(0,r-t.expected),y=`RFS-${c.getFullYear()}${String(c.getMonth()+1).padStart(2,"0")}${String(c.getDate()).padStart(2,"0")}-${Math.abs(Je(`${t.vigilanteName}-${t.period}-${r}`)).toString().slice(0,6)}`,V=o.slice(0,50).map((s,w)=>{let j=new Date(s.timestamp).toLocaleString("es-DO"),k=s.latitude!=null&&s.longitude!=null?`${s.latitude.toFixed(5)}, ${s.longitude.toFixed(5)}`:"—",O=s.type==="photo"?"Foto":"GPS",M=s.type==="ponche"&&s.accuracy!=null?`±${Math.round(s.accuracy)} m`:O;return`<tr>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${w+1}</td>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${f(j)}</td>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${f(k)}</td>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${f(M)}</td>
        <td style="padding:9px 8px;border-bottom:1px solid #e8e8e8;">${f(s.serviceName)}</td>
      </tr>`}).join(""),B=v.map(s=>{let w=Math.max(10,Math.round(s.count/S*100));return`<td style="vertical-align:bottom;text-align:center;padding:0 6px;">
        <div style="font-size:11px;color:#333;margin-bottom:4px;">${s.count}</div>
        <div style="height:${w}px;width:22px;background:#9D2D2D;border-radius:4px 4px 2px 2px;margin:0 auto;"></div>
        <div style="font-size:10px;color:#777;margin-top:6px;white-space:nowrap;">${f(s.label)}</div>
      </td>`}).join(""),A=v.map(s=>`  · ${s.label}: ${s.count} ponche(s)`).join(`
`),q=o.slice(0,30).map((s,w)=>{let j=new Date(s.timestamp).toLocaleString("es-DO"),k=s.latitude!=null&&s.longitude!=null?`${s.latitude.toFixed(5)}, ${s.longitude.toFixed(5)}`:"s/u",O=s.type==="photo"?"foto":"GPS";return`  ${w+1}. ${j} | ${k} | ${O} | ${s.serviceName}`}).join(`
`),I=$>0?`Se identificó un déficit de ${$} ponche(s) respecto a la meta.`:N>0?`Se registró un excedente de ${N} ponche(s) sobre la meta.`:"La actividad coincide exactamente con la meta establecida.",_=["REACTION FORCE SECURITY","Reporte Corporativo de Efectividad de Ponches","================================================",`No. de reporte: ${y}`,`Fecha de emisión: ${b}`,"","1. IDENTIFICACIÓN DEL SERVICIO",`Vigilante: ${t.vigilanteName}`,`Puesto / servicio: ${t.serviceName}`,`Periodo evaluado: ${H[t.period]}`,`Rango calendario: ${T}`,"","2. RESUMEN EJECUTIVO",`Durante el periodo indicado se registraron ${r} ponche(s) de un total esperado de ${t.expected}.`,`La efectividad operativa calculada es de ${p}%.`,`Clasificación: ${u.title}.`,u.note,I,`Además se recibieron ${i.length} evidencia(s) fotográfica(s) asociada(s) al servicio.`,"","3. INDICADORES",`Ponches esperados: ${t.expected}`,`Ponches realizados: ${r}`,`Evidencias fotográficas: ${i.length}`,`Efectividad: ${p}%`,"","4. DISTRIBUCIÓN DIARIA",A||"  · Sin actividad registrada en el periodo.","","5. DETALLE DE PONCHES (muestra)",q||"  · Sin registros detallados.","","6. CONCLUSIÓN Y RECOMENDACIÓN",u.note,"Este documento es emitido por Reaction Force Security para fines de control operativo y seguimiento contractual del servicio de vigilancia.","","Atentamente,","Centro de Control — Reaction Force Security","reactionforce23@gmail.com"].join(`
`),Y=$>0?`Se observa un déficit de <strong>${$}</strong> ponche(s) respecto a la meta contractual/operativa.`:N>0?`Se registró un excedente de <strong>${N}</strong> ponche(s) sobre la meta.`:"La actividad coincide con la meta establecida para el periodo.";return{html:`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reporte ${f(y)} · Reaction Force Security</title>
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
            <img src="${f(t.logoDataUrl)}" width="72" height="72" alt="Reaction Force Security" style="border-radius:50%;border:2px solid #fff;object-fit:cover;display:block;" />
          </td>
          <td>
            <div class="brand">REACTION FORCE SECURITY</div>
            <div class="title">Reporte Corporativo de Efectividad</div>
            <div class="sub">Control de ponches · ${f(H[t.period])} · ${f(y)}</div>
          </td>
        </tr>
      </table>
    </div>

    <div class="body">
      <p class="muted" style="font-size:12px;margin-bottom:16px;">Emitido: ${f(b)} · Rango evaluado: ${f(T)}</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td class="box" style="width:50%;">
            <div class="muted" style="font-size:11px;letter-spacing:1px;">VIGILANTE</div>
            <div style="font-size:18px;font-weight:700;margin-top:4px;">${f(t.vigilanteName)}</div>
          </td>
          <td class="box" style="width:50%;">
            <div class="muted" style="font-size:11px;letter-spacing:1px;">SERVICIO / PUESTO</div>
            <div style="font-size:18px;font-weight:700;margin-top:4px;">${f(t.serviceName)}</div>
          </td>
        </tr>
      </table>

      <div class="section">1. RESUMEN EJECUTIVO</div>
      <p>
        El presente informe documenta el desempeño operativo del vigilante
        <strong>${f(t.vigilanteName)}</strong> en el servicio
        <strong>${f(t.serviceName)}</strong> durante
        <strong>${f(H[t.period]).toLowerCase()}</strong>.
        Se contrastó la meta de <strong>${t.expected}</strong> ponches esperados
        con un total de <strong>${r}</strong> ponches efectivamente registrados
        en el sistema de control de Reaction Force Security.
      </p>
      <p>
        La efectividad resultante es de
        <strong style="color:${u.color};">${p}%</strong>
        (<strong style="color:${u.color};">(${f(u.title)})</strong>.
        ${f(u.note)}
        ${Y}
        Durante el mismo lapso se anexaron <strong>${i.length}</strong> evidencia(s) fotográfica(s).
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
            <div class="v">${r}</div>
          </td>
          <td>
            <div class="l">FOTOS</div>
            <div class="v">${i.length}</div>
          </td>
          <td>
            <div class="l">EFECTIVIDAD</div>
            <div class="v" style="color:${u.color};">${p}%</div>
          </td>
        </tr>
      </table>

      <div class="section">3. DISTRIBUCIÓN DE PONCHES POR DÍA</div>
      <div class="box" style="min-height:130px;margin-bottom:8px;">
        ${B?`<table style="margin:0 auto;border-collapse:collapse;"><tr>${B}</tr></table>`:'<p class="muted" style="margin:0;">Sin actividad registrada en el periodo.</p>'}
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
          ${V||'<tr><td colspan="5" style="padding:12px;color:#777;">Sin registros en el periodo seleccionado.</td></tr>'}
        </tbody>
      </table>

      <div class="section">6. CONCLUSIÓN</div>
      <p>${f(u.note)}</p>
      <p>
        Documento emitido por el Centro de Control de <strong>Reaction Force Security</strong>
        para seguimiento del servicio de vigilancia y seguridad.
      </p>

      <div class="foot">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td>
              ${f(y)}<br/>
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
</html>`,text:_,subject:`Reporte RFS ${y} · ${t.vigilanteName} · ${H[t.period]}`,effectiveness:p}}function Je(t){let o=0;for(let i=0;i<t.length;i+=1)o=(o<<5)-o+t.charCodeAt(i),o|=0;return o}var te=null;async function Ze(){if(te)return te;try{let t=await(await fetch(new URL(se("logo-panel-tight.jpg?v=5"),window.location.href).href,{cache:"force-cache"})).blob();return te=await new Promise((o,i)=>{let r=new FileReader;r.onload=()=>o(String(r.result)),r.onerror=()=>i(Error("No se pudo leer el logo")),r.readAsDataURL(t)}),te}catch{return"data:image/gif;base64,R0lGODlhAQABAAAAACw="}}function Qe(t){var E;let o=document.getElementById("rfs-print-frame");o&&o.remove();let i=document.createElement("iframe");i.id="rfs-print-frame",i.setAttribute("aria-hidden","true"),i.style.position="fixed",i.style.right="0",i.style.bottom="0",i.style.width="0",i.style.height="0",i.style.border="0",i.style.opacity="0",i.style.pointerEvents="none",document.body.appendChild(i);let r=i.contentDocument||((E=i.contentWindow)==null?void 0:E.document);if(!r){i.remove();return}r.open(),r.write(t),r.close();let p=()=>{var c,b;try{(c=i.contentWindow)==null||c.focus(),(b=i.contentWindow)==null||b.print()}finally{setTimeout(()=>i.remove(),1500)}},u=Array.from(r.images);if(u.length===0){setTimeout(p,250);return}let v=u.length,S=()=>{--v,v<=0&&setTimeout(p,200)};u.forEach(c=>{c.complete?S():(c.addEventListener("load",S),c.addEventListener("error",S))})}function Xe(t){let o=`
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
</div>`;return t.includes("<body>")?t.replace("<body>",`<body>${o}`):o+t}function fe(t){let o=Xe(t),i=new Blob([o],{type:"text/html;charset=utf-8"}),r=URL.createObjectURL(i);window.open(r,"_blank")?setTimeout(()=>URL.revokeObjectURL(r),12e4):(URL.revokeObjectURL(r),et(o))}function et(t){var u;let o=document.getElementById("rfs-preview-overlay");o&&o.remove();let i=document.createElement("div");i.id="rfs-preview-overlay",i.style.cssText="position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.72);display:flex;flex-direction:column;";let r=document.createElement("div");r.style.cssText="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;background:#111;color:#fff;font-family:Arial,sans-serif;",r.innerHTML='<strong>Vista previa del reporte</strong><button type="button" id="rfs-preview-close" style="border:0;border-radius:8px;min-height:40px;padding:0 14px;font-weight:700;cursor:pointer;background:#fff;color:#111;">← Volver al panel</button>';let p=document.createElement("iframe");p.style.cssText="flex:1;width:100%;border:0;background:#fff;",p.srcdoc=t,i.appendChild(r),i.appendChild(p),document.body.appendChild(i),(u=r.querySelector("#rfs-preview-close"))==null||u.addEventListener("click",()=>i.remove())}const tt=432e5;function at(t){return new Date(t).toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"})}function nt(t){let o=new Date(t);return`${o.getFullYear()}-${String(o.getMonth()+1).padStart(2,"0")}-${String(o.getDate()).padStart(2,"0")}`}function it(t){let[o,i,r]=t.split("-").map(Number),p=new Date(o,i-1,r),u=new Date,v=new Date;v.setDate(u.getDate()-1);let S=(E,c)=>E.getFullYear()===c.getFullYear()&&E.getMonth()===c.getMonth()&&E.getDate()===c.getDate();return S(p,u)?"Hoy":S(p,v)?"Ayer":p.toLocaleDateString("es-DO",{weekday:"long",day:"numeric",month:"short"})}function st({vigilanteName:t,guardCode:o=null,events:i,moderation:r,devices:p=[],onBack:u,onChanged:v}){var ue;let S=(0,d.useMemo)(()=>{let a=t.trim().toLowerCase().replace(/\s+/g," ");return p.filter(l=>l.vigilanteName.trim().toLowerCase().replace(/\s+/g," ")===a&&l.pushEnabled)},[p,t]),E=S.length>0,[c,b]=(0,d.useState)("24h"),[T,$]=(0,d.useState)("8"),[N,y]=(0,d.useState)(null),[V,B]=(0,d.useState)(!1),[A,q]=(0,d.useState)(()=>{try{return localStorage.getItem("rfs-report-client-email")??""}catch{return""}}),[I,_]=(0,d.useState)(()=>{try{return localStorage.getItem("rfs-report-copy-email")??""}catch{return""}}),[Y,s]=(0,d.useState)(""),[w,j]=(0,d.useState)(!1),[k,O]=(0,d.useState)(""),[M,F]=(0,d.useState)(null),[W,re]=(0,d.useState)(!1),Q=((ue=i[0])==null?void 0:ue.serviceName)??"—",L=Math.max(0,Number(T)||0),U=(0,d.useMemo)(()=>{let a=ye(c).getTime();return i.filter(l=>new Date(l.timestamp).getTime()>=a)},[i,c]),P=(0,d.useMemo)(()=>{let a=Date.now()-tt;return i.filter(l=>new Date(l.timestamp).getTime()>=a).sort((l,m)=>new Date(m.timestamp).getTime()-new Date(l.timestamp).getTime())},[i]),G=W?[...i].sort((a,l)=>new Date(l.timestamp).getTime()-new Date(a.timestamp).getTime()):P,K=(0,d.useMemo)(()=>{let a=new Map;for(let l of G){let m=nt(l.timestamp),D=a.get(m);D?D.push(l):a.set(m,[l])}return[...a.entries()]},[G]),z=Math.max(0,i.length-P.length),le=U.filter(a=>a.type==="photo"),X=U.filter(Z).length,n=Ne(X,L),h=je(U),R=Math.max(1,...h.map(a=>a.count));async function ee(){if(!(L<=0)){B(!0),s("");try{let a=await Ze(),l=Ke({vigilanteName:t,serviceName:Q,period:c,expected:L,events:U,logoDataUrl:a});y(l)}catch(a){s(a instanceof Error?a.message:"No se pudo generar el reporte"),y(null)}finally{B(!1)}}}async function g(){if(confirm(`¿Reiniciar el conteo de ${t}?`)){j(!0);try{await Ve(t),v(),u()}catch(a){s(a instanceof Error?a.message:"Error al reiniciar")}finally{j(!1)}}}async function x(){let a=`¿Eliminar a ${t} del panel?

Se borrarán todos sus ponches, fotos y dispositivos registrados. Esta acción no se puede deshacer.`;if(confirm(a)&&confirm(`Confirmación final: ¿eliminar definitivamente a ${t}?`)){j(!0);try{let l=await Me(t);s(`Vigilante eliminado · ${l.events??0} registro(s) · ${l.devices??0} dispositivo(s)`),v(),u()}catch(l){s(l instanceof Error?l.message:"No se pudo eliminar")}finally{j(!1)}}}async function C(){let a=!(r!=null&&r.blocked),l=a?`¿Bloquear a ${t}? No llegarán más ponches.`:`¿Desbloquear a ${t}?`;if(confirm(l)){j(!0);try{await Be(t,a),v()}catch(m){s(m instanceof Error?m.message:"Error de bloqueo")}finally{j(!1)}}}let J=ie(r),[oe,we]=(0,d.useState)(()=>(r==null?void 0:r.alertSound)??"wail"),[Se,ce]=(0,d.useState)(!1);async function Ee(a){we(a),ce(!0);try{let l=new Audio(qe(a));l.volume=1,await l.play(),window.setTimeout(()=>{l.pause(),ce(!1)},2200)}catch{ce(!1),s("No se pudo reproducir la vista previa en este navegador.")}}async function $e(){var m;if(J){if(!confirm(`¿Detener la sirena de ${t}?`))return;j(!0),s("Deteniendo sirena…");try{await Ue(t),s("Sirena detenida desde central."),v()}catch(D){s(D instanceof Error?D.message:"No se pudo controlar la sirena")}finally{j(!1)}return}let a=((m=ge.find(D=>D.id===oe))==null?void 0:m.label)??"Clásica";if(!E){s("Este vigilante no tiene notificaciones activas en el teléfono. Debe abrir RFS Ponche → Configuración → “Activar alertas” (en iPhone, instalada en pantalla de inicio).");return}let l=`¿Enviar sirena «${a}» a ${t}? Se enviará notificación push al teléfono.`;if(confirm(l)){j(!0),s(`Activando sirena ${a}…`);try{let{push:D}=await ze(t,15,oe);D.sent>0?s(`Sirena «${a}» enviada: ${D.sent} notificación(es) push. Si no aparece, el vigilante debe reactivar alertas en la app.`):D.failed>0?s(`Sirena activada en central, pero el push falló (${D.failed}). Pida al vigilante reactivar alertas en Configuración.`):s("Sirena activada en central, pero no hay teléfono con push registrado para este vigilante."),v()}catch(D){s(D instanceof Error?D.message:"No se pudo controlar la sirena")}finally{j(!1)}}}function pe(a,l){try{localStorage.setItem("rfs-report-client-email",a),localStorage.setItem("rfs-report-copy-email",l)}catch{}}async function me(a){if(!N)s("Genere el reporte primero.");else if(!a.to.includes("@"))s("Escriba un correo válido.");else if(a.cc&&!a.cc.includes("@"))s("El correo de copia no es válido.");else{j(!0),s(`Enviando ${a.label}…`);try{let l=await Ge({to:a.to,cc:a.cc,subject:N.subject,text:N.text,html:N.html});if(l.ok){let m=a.cc?` · copia a ${a.cc}`:"";s(`Enviado a ${a.to}${m} desde ${l.from??"reactionforce23@gmail.com"}.`)}else l.composeUrl?(fe(N.html),window.open(l.composeUrl,"_blank"),s("Se abrió el reporte visual y Gmail. Si no tiene SMTP, use Imprimir/PDF y adjúntelo.")):s("No se pudo enviar el correo.")}catch(l){s(l instanceof Error?l.message:"Error de correo")}finally{j(!1)}}}async function Ce(){let a=A.trim(),l=I.trim();pe(a,l),await me({to:a,cc:l||void 0,label:l?"reporte al cliente con copia":"reporte al cliente"})}async function De(){let a=I.trim();pe(A.trim(),a),await me({to:a,label:"copia del reporte"})}function ke(){N&&window.open(`https://wa.me/?text=${encodeURIComponent(N.text)}`,"_blank")}async function Re(a){F(a.id),O("Preparando descarga…");try{await be(a),O("Foto lista para guardar en el teléfono o computadora.")}catch(l){O(l instanceof Error?l.message:"No se pudo descargar")}finally{F(null)}}return e.jsxs("section",{className:"guard-detail",children:[e.jsx("button",{type:"button",className:"back-btn no-print",onClick:u,children:"← Volver a vigilantes"}),e.jsxs("div",{className:"guard-detail-head",children:[e.jsxs("div",{children:[e.jsx("p",{className:"panel-kicker",children:"Detalle del vigilante"}),e.jsx("h2",{children:t}),o?e.jsxs("p",{className:"guard-code-line",children:["Código único: ",e.jsx("strong",{children:o})]}):null,e.jsx("p",{className:"service",children:Q}),r!=null&&r.blocked?e.jsx("span",{className:"badge-blocked",children:"Bloqueado"}):null,J?e.jsx("span",{className:"badge-siren",children:"Sirena activa"}):null,E?e.jsxs("span",{className:"badge-push-ok",children:["Push activo (",S.length,")"]}):e.jsx("span",{className:"badge-push-off",children:"Sin notificación push"})]}),e.jsx("div",{className:"guard-delete-bar no-print",children:e.jsx("button",{type:"button",className:"secondary-btn danger-btn guard-delete-main",disabled:w,onClick:()=>void x(),children:"Eliminar vigilante"})}),e.jsxs("div",{className:"guard-actions no-print",children:[e.jsx("button",{type:"button",className:J?"secondary-btn siren-btn-stop":"secondary-btn siren-btn",disabled:w,onClick:()=>void $e(),children:J?"Detener sirena":"Enviar sirena"}),e.jsx("button",{type:"button",className:"secondary-btn",disabled:w,onClick:()=>void g(),children:"Reiniciar conteo"}),e.jsx("button",{type:"button",className:"secondary-btn",disabled:w,onClick:()=>void C(),children:r!=null&&r.blocked?"Desbloquear":"Bloquear"})]})]}),J?null:e.jsxs("div",{className:"siren-sound-picker no-print",role:"group","aria-label":"Tipo de sirena",children:[e.jsx("p",{className:"siren-sound-label",children:"Elegir sonido de alerta"}),e.jsx("div",{className:"siren-sound-options",children:ge.map(a=>e.jsxs("button",{type:"button",className:oe===a.id?"siren-sound-opt is-selected":"siren-sound-opt",disabled:w||Se,onClick:()=>void Ee(a.id),children:[e.jsx("strong",{children:a.label}),e.jsx("span",{children:a.hint})]},a.id))})]}),e.jsxs("div",{className:"detail-stats",children:[e.jsxs("div",{children:[e.jsx("strong",{children:P.filter(Z).length}),e.jsx("span",{children:"Últimas 12 h"})]}),e.jsxs("div",{children:[e.jsx("strong",{children:P.filter(a=>a.type==="photo").length}),e.jsx("span",{children:"Fotos (12 h)"})]}),e.jsxs("div",{children:[e.jsx("strong",{children:i.filter(Z).length}),e.jsx("span",{children:"Total"})]})]}),e.jsxs("div",{className:"section-title-row no-print",children:[e.jsx("h3",{className:"section-title",children:W?"Historial completo":"Últimas 12 horas"}),z>0?e.jsx("button",{type:"button",className:"link-btn",onClick:()=>re(a=>!a),children:W?"Solo 12 horas":`Ver anteriores (${z})`}):null]}),k?e.jsx("p",{className:"panel-sync no-print",children:k}):null,K.length===0?e.jsxs("div",{className:"panel-empty",children:[e.jsx("h3",{children:"Sin registros en este periodo"}),e.jsx("p",{children:W?"Este vigilante aún no tiene ponches.":"No hay ponches en las últimas 12 horas."})]}):e.jsx("div",{className:"day-groups",children:K.map(([a,l])=>e.jsxs("section",{className:"day-group",children:[e.jsxs("h4",{className:"day-group-title",children:[e.jsx("span",{children:it(a)}),e.jsxs("em",{children:[l.length," registro(s)"]})]}),e.jsx("ul",{className:"panel-list",children:l.map(m=>e.jsxs("li",{className:"panel-row",children:[e.jsx("span",{className:`tag tag-${m.type}`,children:m.type==="ponche"?"Ponche":"Foto = ponche"}),e.jsxs("div",{className:"panel-row-main",children:[e.jsx("strong",{children:at(m.timestamp)}),e.jsx("span",{children:m.serviceName})]}),"latitude"in m&&m.latitude!=null&&m.longitude!=null?e.jsx("a",{className:"panel-map",href:`https://maps.google.com/?q=${m.latitude},${m.longitude}`,target:"_blank",rel:"noreferrer",children:"Mapa"}):e.jsx("span",{className:"panel-map muted",children:"—"}),m.type==="photo"?e.jsxs("div",{className:"inline-photo-wrap",children:[e.jsx("div",{className:"inline-photo",children:e.jsx("img",{src:de(m),alt:`Foto de ${m.vigilanteName}`})}),e.jsxs("div",{className:"photo-actions",children:[e.jsx("a",{className:"photo-view",href:de(m),target:"_blank",rel:"noreferrer",children:"Ver grande"}),e.jsx("button",{type:"button",className:"photo-download",disabled:M===m.id,onClick:()=>void Re(m),children:M===m.id?"Descargando…":"Descargar foto"}),e.jsx("a",{className:"photo-download-link",href:Le(m),download:!0,children:"Guardar archivo"})]})]}):null]},`${m.type}-${m.id}`))})]},a))}),e.jsxs("div",{className:"report",id:"report-section",children:[e.jsxs("div",{className:"report-head",children:[e.jsx("h2",{children:"Reporte de este vigilante"}),e.jsx("p",{children:"Elija periodo, meta de ponches y genere el documento corporativo (impresión = correo)."})]}),e.jsxs("div",{className:"report-form no-print",children:[e.jsxs("div",{className:"field",children:[e.jsx("label",{children:"Periodo"}),e.jsx("div",{className:"report-periods",children:Object.keys(H).map(a=>e.jsx("button",{type:"button",className:c===a?"is-on":"",onClick:()=>{b(a),y(null)},children:H[a]},a))})]}),e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"expected-detail",children:"Ponches que deberían existir"}),e.jsx("input",{id:"expected-detail",type:"number",min:1,value:T,onChange:a=>{$(a.target.value),y(null)}})]}),e.jsx("button",{type:"button",className:"primary-btn report-run",disabled:L<=0||V,onClick:()=>void ee(),children:V?"Preparando…":"Generar reporte"})]}),N?e.jsxs("div",{className:"report-output",id:"report-print-area",children:[e.jsxs("div",{className:"report-brand",children:[e.jsx("img",{src:se("logo-panel-tight.jpg?v=5"),alt:"Reaction Force Security"}),e.jsxs("div",{children:[e.jsx("p",{className:"report-kicker",children:"Reaction Force Security"}),e.jsx("h3",{children:"Reporte de efectividad"}),e.jsxs("p",{children:[H[c]," · ",t]})]})]}),e.jsxs("div",{className:"report-summary",children:[e.jsxs("div",{children:[e.jsx("span",{children:"Esperados"}),e.jsx("strong",{children:L})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Realizados"}),e.jsx("strong",{children:X})]}),e.jsxs("div",{children:[e.jsx("span",{children:"Fotos"}),e.jsx("strong",{children:le.length})]}),e.jsxs("div",{className:"eff",children:[e.jsx("span",{children:"Efectividad"}),e.jsxs("strong",{children:[n,"%"]})]})]}),e.jsxs("div",{className:"report-chart",children:[e.jsx("h4",{children:"Ponches por día"}),h.length===0?e.jsx("p",{className:"report-empty",children:"Sin ponches en este periodo."}):e.jsx("div",{className:"bars",children:h.map(a=>e.jsxs("div",{className:"bar-col",children:[e.jsx("div",{className:"bar",style:{height:`${Math.max(8,a.count/R*120)}px`}}),e.jsx("span",{className:"bar-count",children:a.count}),e.jsx("span",{className:"bar-label",children:a.label})]},a.label))}),e.jsxs("div",{className:"chart-scale",children:[e.jsxs("div",{className:"scale-expected",children:["Meta del periodo: ",L," ponches"]}),e.jsx("div",{className:"gauge",children:e.jsx("div",{className:"gauge-fill",style:{width:`${Math.min(100,n)}%`}})})]})]}),e.jsxs("div",{className:"report-mail no-print",children:[e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"client-email",children:"Correo del cliente"}),e.jsx("input",{id:"client-email",type:"email",placeholder:"cliente@empresa.com",value:A,onChange:a=>q(a.target.value)})]}),e.jsxs("div",{className:"report-copy-box",children:[e.jsx("h4",{children:"Enviar copia a otro correo"}),e.jsx("p",{children:"Opcional. Puede mandar una copia al mismo tiempo o solo a este correo."}),e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"copy-email",children:"Correo de copia"}),e.jsx("input",{id:"copy-email",type:"email",placeholder:"supervisor@empresa.com",value:I,onChange:a=>_(a.target.value)})]}),e.jsx("button",{type:"button",className:"secondary-btn",disabled:w||!I.trim(),onClick:()=>void De(),children:"Enviar solo copia"})]}),e.jsx("small",{className:"mail-hint",children:"Sale desde reactionforce23@gmail.com con el mismo HTML del reporte impreso."})]}),e.jsxs("div",{className:"report-actions no-print",children:[e.jsx("button",{type:"button",className:"secondary-btn",onClick:()=>Qe(N.html),children:"Imprimir / PDF"}),e.jsx("button",{type:"button",className:"secondary-btn",onClick:()=>fe(N.html),children:"Ver documento"}),e.jsxs("button",{type:"button",className:"secondary-btn",disabled:w||!A.trim(),onClick:()=>void Ce(),children:["Enviar al cliente",I.trim()?" + copia":""]}),e.jsx("button",{type:"button",className:"primary-btn",onClick:ke,children:"WhatsApp"})]}),Y?e.jsx("p",{className:"panel-sync no-print",children:Y}):null]}):null]})]})}function rt(t){return new Date(t).toLocaleString("es-DO",{dateStyle:"short",timeStyle:"short"})}function lt({photos:t,onBack:o,onChanged:i}){let[r,p]=(0,d.useState)(null),[u,v]=(0,d.useState)("");async function S(c){p(c.id),v("Descargando…");try{await be(c),v("Descarga lista")}catch(b){v(b instanceof Error?b.message:"No se pudo descargar")}finally{p(null)}}async function E(c){if(confirm(`¿Borrar esta foto de ${c.vigilanteName}?
Se elimina de inmediato del panel.`)){p(c.id),v("Borrando…");try{await Te(c.id),v("Foto borrada"),i()}catch(b){v(b instanceof Error?b.message:"No se pudo borrar")}finally{p(null)}}}return e.jsxs("div",{className:"photos-gallery",children:[e.jsxs("header",{className:"gallery-top no-print",children:[e.jsx("button",{type:"button",className:"panel-refresh gallery-back",onClick:o,children:"← Volver"}),e.jsxs("div",{children:[e.jsx("p",{className:"panel-kicker",children:"Central · Fotos"}),e.jsx("h1",{children:"Todas las fotos"}),e.jsxs("p",{className:"panel-sub",children:[t.length," foto(s) de todos los vigilantes"]})]})]}),u?e.jsx("p",{className:"gallery-status no-print",children:u}):null,t.length===0?e.jsxs("div",{className:"panel-empty",children:[e.jsx("h3",{children:"Sin fotos"}),e.jsx("p",{children:"Cuando un vigilante envíe una foto, aparecerá aquí."})]}):e.jsx("ul",{className:"gallery-grid",children:t.map(c=>e.jsxs("li",{className:"gallery-card",children:[e.jsx("img",{src:de(c),alt:`Foto de ${c.vigilanteName}`}),e.jsxs("div",{className:"gallery-meta",children:[e.jsx("strong",{children:c.vigilanteName}),e.jsx("span",{children:c.serviceName}),e.jsx("time",{dateTime:c.timestamp,children:rt(c.timestamp)})]}),e.jsxs("div",{className:"gallery-actions",children:[e.jsx("button",{type:"button",className:"gallery-btn gallery-btn-down",disabled:r===c.id,onClick:()=>void S(c),children:"Descargar"}),e.jsx("button",{type:"button",className:"gallery-btn gallery-btn-del",disabled:r===c.id,onClick:()=>void E(c),children:"Borrar"})]})]},c.id))})]})}function ae(t){return t.trim().toLowerCase().replace(/\s+/g," ")}function ot(){let[t,o]=(0,d.useState)(!1),[i,r]=(0,d.useState)(()=>!!he()),[p,u]=(0,d.useState)(""),[v,S]=(0,d.useState)(""),[E,c]=(0,d.useState)(!1),[b,T]=(0,d.useState)([]),[$,N]=(0,d.useState)({}),[y,V]=(0,d.useState)([]),[B,A]=(0,d.useState)(""),[q,I]=(0,d.useState)(""),[_,Y]=(0,d.useState)(""),[s,w]=(0,d.useState)(null),[j,k]=(0,d.useState)(!1),[O,M]=(0,d.useState)("");async function F(){try{let n=await Ae();T(n.events),N(n.moderation),V(n.devices),Y(new Date().toLocaleTimeString("es-DO")),A(""),o(!0)}catch(n){if(n instanceof Fe&&n.status===401){o(!1),A("Sesión de central requerida");return}A(n instanceof Error?n.message:"Error de conexión")}}(0,d.useEffect)(()=>{document.title="RFS Panel · Central";let n=!1;async function h(){if(!he())r(!1);else try{await F()}finally{n||r(!1)}}return h(),()=>{n=!0}},[]),(0,d.useEffect)(()=>{if(!t)return;let n=window.setInterval(()=>{document.visibilityState==="visible"&&F()},12e3),h=()=>{document.visibilityState==="visible"&&F()},R=()=>void F();return document.addEventListener("visibilitychange",h),window.addEventListener("focus",R),()=>{window.clearInterval(n),document.removeEventListener("visibilitychange",h),window.removeEventListener("focus",R)}},[t]);async function W(n){n.preventDefault(),c(!0),S("");try{await Pe(p.trim()),u(""),o(!0)}catch(h){S(h instanceof Error?h.message:"No se pudo entrar")}finally{c(!1)}}async function re(){await Oe(),o(!1),T([]),V([]),w(null),k(!1)}async function Q(){M("Creando respaldo…");try{let n=await Ie();M(`Respaldo OK · ${n.events} eventos · ${n.photos} fotos · ${new Date(n.at).toLocaleString("es-DO")}`)}catch(n){M(n instanceof Error?n.message:"Falló el respaldo")}}let L=(0,d.useMemo)(()=>{let n=new Map;for(let h of y)n.set(ae(h.vigilanteName),h.code);return n},[y]),U=(0,d.useMemo)(()=>{let n=new Map;for(let h of y){let R=ae(h.vigilanteName);h.pushEnabled?n.set(R,!0):n.has(R)||n.set(R,!1)}return n},[y]),P=(0,d.useMemo)(()=>{var h,R,ee;let n=new Map;for(let g of b){let x=ae(g.vigilanteName),C=n.get(x);C?(C.events.push(g),(g.type==="ponche"||g.type==="photo")&&(C.ponches+=1),g.type==="photo"&&(C.photos+=1),C.blocked=!!((h=$[x])!=null&&h.blocked),C.sirenOn=ie($[x]),C.code=L.get(x)??C.code,C.pushEnabled=U.get(x)===!0,new Date(g.timestamp)>new Date(C.lastAt)&&(C.lastAt=g.timestamp,C.serviceName=g.serviceName,C.vigilanteName=g.vigilanteName)):n.set(x,{key:x,vigilanteName:g.vigilanteName,serviceName:g.serviceName,events:[g],ponches:+(g.type==="ponche"||g.type==="photo"),photos:+(g.type==="photo"),lastAt:g.timestamp,blocked:!!((R=$[x])!=null&&R.blocked),sirenOn:ie($[x]),code:L.get(x)??null,pushEnabled:U.get(x)===!0})}for(let g of y){let x=ae(g.vigilanteName);n.has(x)||n.set(x,{key:x,vigilanteName:g.vigilanteName,serviceName:g.serviceName,events:[],ponches:0,photos:0,lastAt:g.updatedAt,blocked:!!((ee=$[x])!=null&&ee.blocked),sirenOn:ie($[x]),code:g.code,pushEnabled:!!g.pushEnabled})}return[...n.values()].sort((g,x)=>new Date(x.lastAt).getTime()-new Date(g.lastAt).getTime())},[b,$,y,L,U]),G=(0,d.useMemo)(()=>{let n=q.trim().toLowerCase();return n?P.filter(h=>h.vigilanteName.toLowerCase().includes(n)||h.serviceName.toLowerCase().includes(n)||(h.code?h.code.toLowerCase().includes(n):!1)):P},[P,q]),K=(0,d.useMemo)(()=>b.filter(n=>n.type==="photo").sort((n,h)=>new Date(h.timestamp).getTime()-new Date(n.timestamp).getTime()),[b]),z=s?P.find(n=>n.key===s)??null:null,le=b.filter(n=>n.type==="ponche"||n.type==="photo").length,X=K.length;return i?e.jsx("div",{className:"panel panel-login",children:"Cargando panel…"}):t?j?e.jsx("div",{className:"panel",children:e.jsx(lt,{photos:K,onBack:()=>k(!1),onChanged:()=>void F()})}):z?e.jsx("div",{className:"panel",children:e.jsx(st,{vigilanteName:z.vigilanteName,guardCode:z.code,events:z.events,moderation:$[z.key],devices:y,onBack:()=>w(null),onChanged:()=>void F()})}):e.jsxs("div",{className:"panel",children:[e.jsxs("header",{className:"panel-top no-print",children:[e.jsxs("div",{className:"panel-brand",children:[e.jsx("img",{src:se("logo-panel-tight.jpg?v=5"),alt:"Reaction Force Security",className:"panel-logo"}),e.jsxs("div",{children:[e.jsx("p",{className:"panel-kicker",children:"Reaction Force Security · Panel"}),e.jsx("h1",{children:"Panel receptor"}),e.jsx("p",{className:"panel-sub",children:"Central · no es la app de vigilantes"})]})]}),e.jsxs("div",{className:"panel-stats",children:[e.jsxs("div",{children:[e.jsx("strong",{children:G.length}),e.jsx("span",{children:"Vigilantes"})]}),e.jsxs("div",{children:[e.jsx("strong",{children:le}),e.jsx("span",{children:"Ponches"})]}),e.jsxs("button",{type:"button",className:"panel-stat-btn",onClick:()=>k(!0),children:[e.jsx("strong",{children:X}),e.jsx("span",{children:"Fotos"})]})]}),e.jsxs("div",{className:"panel-actions",children:[e.jsx("button",{type:"button",className:"panel-refresh",onClick:()=>k(!0),children:"Ver fotos"}),e.jsx("button",{type:"button",className:"panel-refresh",onClick:()=>void F(),children:"Actualizar"}),e.jsx("button",{type:"button",className:"panel-refresh",onClick:()=>void Q(),children:"Respaldo"}),e.jsx("button",{type:"button",className:"panel-refresh panel-refresh-muted",onClick:()=>void re(),children:"Salir"})]})]}),e.jsxs("div",{className:"panel-toolbar no-print",children:[e.jsx("input",{type:"search",placeholder:"Buscar vigilante o servicio…",value:q,onChange:n=>I(n.target.value)}),e.jsx("p",{className:"panel-sync",children:B||O||(_?`Última sync: ${_} · v${xe}`:`Conectando… · v${xe}`)})]}),e.jsxs("section",{className:"live-feed no-print","aria-label":"Vigilantes",children:[e.jsx("h2",{children:"Vigilantes"}),G.length>0?e.jsx("p",{className:"panel-hint",children:"Toca un vigilante para ver acciones: sirena, bloqueo y Eliminar vigilante."}):null,G.length===0?e.jsxs("div",{className:"panel-empty",children:[e.jsx("h3",{children:"Sin eventos todavía"}),e.jsx("p",{children:"Cuando un vigilante marque ponche, aparecerá agrupado aquí por nombre."})]}):e.jsx("ul",{className:"guard-groups",children:G.map(n=>e.jsx("li",{children:e.jsxs("button",{type:"button",className:"guard-group",onClick:()=>w(n.key),children:[e.jsxs("div",{className:"guard-group-main",children:[e.jsx("strong",{children:n.vigilanteName}),n.code?e.jsxs("span",{className:"guard-code-chip",children:["Código ",n.code]}):null,e.jsx("span",{children:n.serviceName})]}),e.jsxs("div",{className:"guard-group-meta",children:[n.blocked?e.jsx("em",{className:"badge-blocked",children:"Bloqueado"}):null,n.sirenOn?e.jsx("em",{className:"badge-siren",children:"Sirena"}):null,n.pushEnabled?e.jsx("em",{className:"badge-push-ok",children:"Push"}):e.jsx("em",{className:"badge-push-off",children:"Sin push"}),e.jsxs("span",{children:[n.ponches," ponches"]}),e.jsxs("span",{children:[n.photos," con foto"]}),e.jsx("span",{className:"chevron",children:"Ver →"})]})]})},n.key))})]})]}):e.jsx("div",{className:"panel panel-login",children:e.jsxs("div",{className:"panel-login-card",children:[e.jsx("img",{src:se("logo-panel-tight.jpg?v=5"),alt:"Reaction Force Security",className:"panel-logo"}),e.jsx("p",{className:"panel-kicker",children:"Reaction Force Security"}),e.jsx("h1",{children:"Panel central"}),e.jsx("p",{className:"panel-sub",children:"Ingrese la clave de central para ver vigilantes, GPS y fotos."}),e.jsxs("form",{onSubmit:n=>void W(n),children:[e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"panel-pass",children:"Clave de central"}),e.jsx("input",{id:"panel-pass",type:"password",autoComplete:"current-password",inputMode:"numeric",value:p,onChange:n=>u(n.target.value),placeholder:"••••••"})]}),v?e.jsx("p",{className:"setup-error",children:v}):null,e.jsx("button",{type:"submit",className:"primary-btn",disabled:E||!p.trim(),children:E?"Entrando…":"Entrar al panel"})]})]})})}He();_e.createRoot(document.getElementById("root")).render(ve.jsx(Ye.StrictMode,{children:ve.jsx(ot,{})}));
