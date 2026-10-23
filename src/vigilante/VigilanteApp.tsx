/* Recovered from production bundle — vigilante app */
import React, { useEffect, useRef, useState } from 'react'
import {
  CentralHttpError as u,
  postPhoto as t,
  saveDeviceProfile as r,
  normalizeAlertSound as i,
  getDeviceSignal as a,
  sirenFileFor as o,
  fetchDeviceProfile as c,
  postPonche as f,
  recoverDeviceProfile as p,
} from '../shared/api'
import { CameraCapture } from './camera'

const b = React
const $ = {
  jsx: React.createElement,
  jsxs: React.createElement,
  Fragment: React.Fragment,
}


  Dn = `rfs.deviceId`,
  On = `rfs_device`;
function kn(e) {
  let t = document.cookie
    .split(`;`)
    .map((e) => e.trim())
    .find((t) => t.startsWith(`${e}=`));
  return t ? decodeURIComponent(t.slice(e.length + 1)) : null;
}
function An(e, t) {
  document.cookie = `${e}=${encodeURIComponent(t)}; Max-Age=34560000; Path=/; SameSite=Lax`;
}
function q() {
  try {
    let e = localStorage.getItem(Dn),
      t = kn(On),
      n = e || t || crypto.randomUUID();
    return (localStorage.setItem(Dn, n), An(On, n), n);
  } catch {
    let e = crypto.randomUUID();
    try {
      An(On, e);
    } catch {}
    return e;
  }
}
async function jn() {
  try {
    navigator.storage?.persist && (await navigator.storage.persist());
  } catch {}
}
function Mn() {
  return new Promise((e, t) => {
    `geolocation` in navigator
      ? navigator.geolocation.getCurrentPosition(
          (t) => {
            e({
              latitude: t.coords.latitude,
              longitude: t.coords.longitude,
              accuracy: Number.isFinite(t.coords.accuracy)
                ? t.coords.accuracy
                : null,
            });
          },
          (e) => {
            e.code === e.PERMISSION_DENIED
              ? t(Error(`Permiso de ubicación denegado.`))
              : e.code === e.POSITION_UNAVAILABLE
                ? t(Error(`Ubicación no disponible.`))
                : e.code === e.TIMEOUT
                  ? t(Error(`Tiempo de espera del GPS agotado.`))
                  : t(Error(`No se pudo obtener la ubicación.`));
          },
          { enableHighAccuracy: !0, timeout: 2e4, maximumAge: 0 },
        )
      : t(Error(`Este dispositivo no soporta GPS.`));
  });
}
var Nn = `rfs.outbox`,
  Pn = 40;
function Fn() {
  try {
    let e = localStorage.getItem(Nn);
    if (!e) return [];
    let t = JSON.parse(e);
    return Array.isArray(t) ? t : [];
  } catch {
    return [];
  }
}
function In(e) {
  try {
    localStorage.setItem(Nn, JSON.stringify(e.slice(0, Pn)));
  } catch {
    let t = [
      ...e.filter((e) => e.kind === `ponche`),
      ...e.filter((e) => e.kind === `photo`).slice(0, 5),
    ].slice(0, 20);
    try {
      localStorage.setItem(Nn, JSON.stringify(t));
    } catch {}
  }
}
function Ln(e) {
  let t = Fn().filter((t) => t.id !== e.id);
  (t.unshift({ ...e, attempts: 0, nextAt: Date.now() }), In(t));
}
function Rn() {
  return Fn().length;
}
function zn(e) {
  if (e instanceof u) return e.permanent;
  if (e instanceof Error) {
    let t = e.message.toLowerCase();
    return (
      t.includes(`bloqueado`) ||
      t.includes(`demasiado grande`) ||
      t.includes(`incompletos`)
    );
  }
  return !1;
}
var Bn = !1;
async function Vn() {
  if (Bn) return { sent: 0, left: Fn().length, dropped: 0 };
  Bn = !0;
  let e = 0,
    n = 0;
  try {
    let r = Date.now(),
      i = Fn(),
      a = [];
    for (let o of i)
      if (o.nextAt > r) a.push(o);
      else
        try {
          (o.kind === `ponche` ? await f(o.payload) : await t(o.payload),
            (e += 1));
        } catch (e) {
          if (zn(e)) {
            n += 1;
            continue;
          }
          let t = o.attempts + 1,
            r = Math.min(12e4, 2e3 * 2 ** Math.min(t, 5));
          a.push({ ...o, attempts: t, nextAt: Date.now() + r });
        }
    return (In(a), { sent: e, left: a.length, dropped: n });
  } finally {
    Bn = !1;
  }
}
var Hn = null,
  J = null,
  Un = null,
  Wn = null,
  Gn = [],
  Y = null,
  Kn = !1,
  qn = !1,
  Jn = `wail`,
  Yn = !1;
function Xn() {
  return (
    (Hn ||= new (window.AudioContext || window.webkitAudioContext)()),
    Hn
  );
}
function Zn(e) {
  let t = o(e);
  if (!Y)
    ((Y = new Audio(t)), (Y.loop = !0), (Y.preload = `auto`), (Y.volume = 1));
  else if (!Y.src.endsWith(t) && !Y.src.includes(t.replace(/^\//, ``))) {
    let e = !Y.paused;
    (Y.pause(),
      (Y.src = t),
      (Y.loop = !0),
      Y.load(),
      e && Y.play().catch(() => void 0));
  }
  return ((Y.volume = 1), Y);
}
function Qn(e) {
  if (!J)
    try {
      ((J = e.createOscillator()),
        (Un = e.createGain()),
        (J.type = `sine`),
        (J.frequency.value = 20),
        (Un.gain.value = 1e-5),
        J.connect(Un),
        Un.connect(e.destination),
        J.start());
    } catch {
      ((J = null), (Un = null));
    }
}
function $n() {
  if (qn) return;
  qn = !0;
  let e = () => {
    er();
  };
  (window.addEventListener(`pointerdown`, e, { capture: !0 }),
    window.addEventListener(`touchstart`, e, { capture: !0 }),
    window.addEventListener(`keydown`, e, { capture: !0 }),
    document.addEventListener(`visibilitychange`, () => {
      document.visibilityState === `visible` &&
        Kn &&
        (Xn().resume(), Yn && ir(Jn));
    }));
}
async function er() {
  try {
    let e = Xn();
    (e.state === `suspended` && (await e.resume()), Qn(e));
    for (let e of [`wail`, `horn`, `pulse`]) {
      let t = new Audio(o(e));
      ((t.muted = !0), (t.volume = 0), (t.preload = `auto`));
      try {
        (await t.play(), t.pause(), (t.currentTime = 0));
      } catch {}
    }
    let t = Zn(Jn);
    ((t.muted = !1), (t.volume = 1), (Kn = !0));
  } catch {
    Kn = !1;
  }
}
function tr() {
  for (let e of Gn)
    try {
      (`stop` in e && typeof e.stop == `function` && e.stop(), e.disconnect());
    } catch {}
  Gn = [];
}
function nr(e, t = 2.4) {
  let n = e.createWaveShaper(),
    r = new Float32Array(256);
  for (let e = 0; e < 256; e++) {
    let n = (e * 2) / 256 - 1;
    r[e] = Math.tanh(n * t);
  }
  return ((n.curve = r), (n.oversample = `2x`), n);
}
function rr(e, t) {
  tr();
  let n = e.currentTime,
    r = e.createGain(),
    i = e.createDynamicsCompressor();
  (i.threshold.setValueAtTime(-18, n),
    i.knee.setValueAtTime(8, n),
    i.ratio.setValueAtTime(12, n),
    i.attack.setValueAtTime(0.003, n),
    i.release.setValueAtTime(0.12, n));
  let a = nr(e, t === `pulse` ? 2.8 : 2.2);
  (r.gain.setValueAtTime(1e-4, n),
    r.gain.exponentialRampToValueAtTime(1.4, n + 0.05),
    r.connect(a),
    a.connect(i),
    i.connect(e.destination));
  let o = [r, a, i];
  if (t === `horn`) {
    let t = e.createOscillator(),
      i = e.createOscillator(),
      a = e.createGain();
    ((t.type = `square`), (i.type = `sawtooth`), (a.gain.value = 0.35));
    let s = 0.45;
    for (let e = 0; e < 48; e++) {
      let r = n + e * s,
        a = e % 2 == 0 ? 980 : 780;
      (t.frequency.setValueAtTime(a, r), i.frequency.setValueAtTime(a * 2, r));
    }
    (t.connect(r),
      i.connect(a),
      a.connect(r),
      t.start(n),
      i.start(n),
      t.stop(n + 48 * s),
      i.stop(n + 48 * s),
      o.push(t, i, a));
  } else if (t === `pulse`)
    for (let t = 0; t < 64; t++) {
      let i = n + t * 0.25,
        a = t % 2 == 0 ? 880 : 1320,
        s = e.createOscillator(),
        c = e.createGain();
      ((s.type = `square`),
        s.frequency.setValueAtTime(a, i),
        c.gain.setValueAtTime(1e-4, i),
        c.gain.exponentialRampToValueAtTime(1.2, i + 0.01),
        c.gain.exponentialRampToValueAtTime(1e-4, i + 0.17),
        s.connect(c),
        c.connect(r),
        s.start(i),
        s.stop(i + 0.2),
        o.push(s, c));
    }
  else {
    let t = e.createOscillator(),
      i = e.createOscillator(),
      a = e.createGain();
    ((t.type = `sawtooth`), (i.type = `triangle`), (a.gain.value = 0.45));
    let s = 2.8;
    for (let e = 0; e < 40; e++) {
      let r = n + (s / 2) * e,
        a = e % 2 == 0 ? 620 : 1580;
      e === 0
        ? (t.frequency.setValueAtTime(a, r),
          i.frequency.setValueAtTime(a * 0.5, r))
        : (t.frequency.linearRampToValueAtTime(a, r),
          i.frequency.linearRampToValueAtTime(a * 0.5, r));
    }
    (t.connect(r),
      i.connect(a),
      a.connect(r),
      t.start(n),
      i.start(n),
      t.stop(n + (s / 2) * 40 + 0.05),
      i.stop(n + (s / 2) * 40 + 0.05),
      o.push(t, i, a));
  }
  Gn = o;
}
function ir(e) {
  let t = i(e ?? Jn),
    n = Yn && t !== Jn;
  if (((Jn = t), (Yn = !0), Wn != null && !n))
    try {
      let e = Zn(t);
      e.paused && e.play();
    } catch {}
  else {
    if (n) {
      tr();
      try {
        Y && (Y.pause(), (Y.currentTime = 0));
      } catch {}
    }
    if (
      (er().then(() => {
        try {
          let e = Zn(t);
          ((e.loop = !0), (e.volume = 1));
          let n = e.play();
          n &&
            typeof n.then == `function` &&
            n.catch(() => {
              try {
                let e = Xn();
                e.resume().then(() => rr(e, t));
              } catch {}
            });
        } catch {}
        window.setTimeout(() => {
          try {
            let e = Y;
            if (e && !e.paused && e.currentTime > 0) return;
            let n = Xn();
            n.resume().then(() => rr(n, t));
          } catch {}
        }, 220);
      }),
      Wn == null)
    ) {
      Wn = window.setInterval(() => {
        if (Yn) {
          try {
            let e = Zn(Jn);
            e.paused && e.play();
          } catch {}
          try {
            let e = Xn();
            e.resume().then(() => {
              let t = Y;
              !(t && !t.paused && t.currentTime > 0) &&
                Gn.length === 0 &&
                rr(e, Jn);
            });
          } catch {}
          try {
            navigator.vibrate?.([500, 100, 500, 100, 800, 120, 500, 100, 900]);
          } catch {}
        }
      }, 2800);
      try {
        navigator.vibrate?.([600, 100, 600, 100, 900, 120, 600]);
      } catch {}
    }
  }
}
function ar() {
  ((Yn = !1), Wn != null && (window.clearInterval(Wn), (Wn = null)), tr());
  try {
    Y && (Y.pause(), (Y.currentTime = 0));
  } catch {}
  try {
    navigator.vibrate?.(0);
  } catch {}
}
var or = [
    {
      id: `cdn`,
      label: `CDN`,
      subtitle: `Noticias`,
      url: `https://play.cdnradio.com.do/cdnlive`,
      kind: `live`,
    },
    {
      id: `z101`,
      label: `Z101`,
      subtitle: `Comentario`,
      url: `https://streaming.z101digital.com/z101`,
      kind: `live`,
    },
    {
      id: `music`,
      label: `Música`,
      subtitle: `Sin cortes`,
      url: `https://c11.radioboss.fm:18269/stream`,
      kind: `live`,
    },
    { id: `tremenda`, label: `Tremenda`, subtitle: `Humor`, kind: `podcast` },
  ],
  sr = new Set(),
  X = null,
  cr = [],
  lr = 0,
  ur = null,
  Z = {
    stationId: null,
    playing: !1,
    loading: !1,
    error: ``,
    title: ``,
    interruptedByAlarm: !1,
  };
function dr() {
  for (let e of sr) e(Z);
}
function Q(e) {
  ((Z = { ...Z, ...e }), dr());
}
function fr() {
  return (
    X ||
    ((X = new Audio()),
    (X.preload = `none`),
    X.addEventListener(`playing`, () => {
      Q({ playing: !0, loading: !1, error: `` });
    }),
    X.addEventListener(`waiting`, () => {
      Z.stationId && Q({ loading: !0 });
    }),
    X.addEventListener(`pause`, () => {
      Z.interruptedByAlarm || Q({ playing: !1, loading: !1 });
    }),
    X.addEventListener(`error`, () => {
      Q({
        playing: !1,
        loading: !1,
        error: `No se pudo reproducir esta emisora. Revise la red.`,
      });
    }),
    X.addEventListener(`ended`, () => {
      Z.stationId === `tremenda`
        ? hr()
        : Q({ playing: !1, loading: !1, stationId: null, title: `` });
    }),
    X)
  );
}
function pr(e) {
  return (
    sr.add(e),
    e(Z),
    () => {
      sr.delete(e);
    }
  );
}
async function mr() {
  if (cr.length > 0) return cr;
  let e = await fetch(`/api/radio/tremenda`);
  if (!e.ok) throw Error(`No se pudieron cargar los episodios`);
  let t = await e.json();
  if (((cr = Array.isArray(t.episodes) ? t.episodes : []), cr.length === 0))
    throw Error(`No hay episodios disponibles`);
  return ((lr = Math.floor(Math.random() * cr.length)), cr);
}
async function hr() {
  let e = await mr();
  lr = (lr + 1) % e.length;
  let t = e[lr],
    n = fr();
  ((n.src = t.url),
    Q({
      stationId: `tremenda`,
      loading: !0,
      error: ``,
      title: t.title,
      interruptedByAlarm: !1,
    }),
    await n.play());
}
async function gr(e) {
  let t = or.find((t) => t.id === e);
  if (!t) return;
  if (Z.stationId === e && (Z.playing || Z.loading) && !Z.interruptedByAlarm) {
    _r();
    return;
  }
  ur = null;
  let n = fr();
  (n.pause(),
    Q({
      stationId: e,
      playing: !1,
      loading: !0,
      error: ``,
      title: t.label,
      interruptedByAlarm: !1,
    }));
  try {
    if (t.kind === `podcast`) {
      await hr();
      return;
    }
    if (!t.url) throw Error(`Emisora sin señal`);
    ((n.src = t.url),
      Q({ title: `${t.label} · ${t.subtitle}` }),
      await n.play());
  } catch (e) {
    Q({
      playing: !1,
      loading: !1,
      error:
        e instanceof Error
          ? e.message
          : `No se pudo iniciar la radio. Toque de nuevo.`,
    });
  }
}
function _r() {
  ur = null;
  try {
    X && (X.pause(), X.removeAttribute(`src`), X.load());
  } catch {}
  Q({
    stationId: null,
    playing: !1,
    loading: !1,
    error: ``,
    title: ``,
    interruptedByAlarm: !1,
  });
}
function vr() {
  if (Z.stationId && (Z.playing || Z.loading)) {
    ur = Z.stationId;
    try {
      X?.pause();
    } catch {}
    Q({
      playing: !1,
      loading: !1,
      interruptedByAlarm: !0,
      error: ``,
      title: `Radio en pausa por alarma`,
    });
  }
}
function yr() {
  if (!Z.interruptedByAlarm || !ur) {
    Z.interruptedByAlarm && Q({ interruptedByAlarm: !1, title: `` });
    return;
  }
  let e = ur;
  ((ur = null), gr(e));
}
var br = ``;
function xr(e) {
  let t = (e + `=`.repeat((4 - (e.length % 4)) % 4))
      .replace(/-/g, `+`)
      .replace(/_/g, `/`),
    n = atob(t),
    r = new Uint8Array(n.length);
  for (let e = 0; e < n.length; e += 1) r[e] = n.charCodeAt(e);
  return r;
}
async function Sr() {
  let e = await fetch(`${br}/api/push/vapid-public`);
  if (!e.ok) throw Error(`Push no disponible en el servidor`);
  let t = await e.json();
  if (!t.publicKey) throw Error(`Falta clave VAPID`);
  return t.publicKey;
}
async function Cr(e) {
  let t = q(),
    n = await fetch(`${br}/api/devices/${encodeURIComponent(t)}/push`, {
      method: `PUT`,
      headers: { "Content-Type": `application/json` },
      body: JSON.stringify({ subscription: e ? e.toJSON() : null }),
    });
  if (!n.ok) {
    let e = await n.text().catch(() => ``);
    throw n.status === 404
      ? Error(
          `Configure su nombre de vigilante antes de activar alertas remotas.`,
        )
      : Error(e || `No se pudo registrar la alerta remota`);
  }
}
function wr() {
  return (
    typeof window < `u` &&
    `Notification` in window &&
    `serviceWorker` in navigator &&
    `PushManager` in window
  );
}
async function Tr() {
  if (!wr())
    return {
      supported: !1,
      permission: `unsupported`,
      subscribed: !1,
      standalone: Er(),
    };
  let e = Notification.permission,
    t = !1;
  try {
    t = !!(await (
      await navigator.serviceWorker.ready
    ).pushManager.getSubscription());
  } catch {
    t = !1;
  }
  return { supported: !0, permission: e, subscribed: t, standalone: Er() };
}
function Er() {
  try {
    let e = window.matchMedia?.(`(display-mode: standalone)`)?.matches,
      t = !!navigator.standalone;
    return !!(e || t);
  } catch {
    return !1;
  }
}
async function Dr(e) {
  if (typeof window > `u`) return { ok: !1, reason: `Entorno no compatible` };
  if (!wr())
    return {
      ok: !1,
      reason: `Este teléfono no soporta alertas remotas. En iPhone: Safari → Compartir → Agregar a pantalla de inicio, luego abra la app desde el ícono.`,
    };
  let t = navigator.userAgent || ``;
  if (
    (/iPad|iPhone|iPod/.test(t) ||
      (navigator.platform === `MacIntel` && navigator.maxTouchPoints > 1)) &&
    !Er()
  )
    return {
      ok: !1,
      reason: `En iPhone debe instalar la app: Safari → Compartir → “Agregar a pantalla de inicio”. Luego ábrala desde el ícono y active notificaciones.`,
    };
  let n = Notification.permission;
  if (n !== `granted`)
    try {
      n = await Notification.requestPermission();
    } catch {
      return {
        ok: !1,
        reason: `No se pudo pedir permiso de notificaciones. Toque el botón “Activar alertas”.`,
      };
    }
  if (n !== `granted`)
    return {
      ok: !1,
      reason:
        n === `denied`
          ? `Notificaciones bloqueadas. Actívelas en Ajustes del teléfono para RFS Ponche.`
          : `Debe permitir notificaciones para recibir la sirena con la app cerrada.`,
    };
  let r = await navigator.serviceWorker.ready;
  try {
    await r.update();
  } catch {}
  let i = xr(await Sr()),
    a = await r.pushManager.getSubscription();
  if (a && e?.forceResubscribe) {
    try {
      await a.unsubscribe();
    } catch {}
    a = null;
  }
  if (!a)
    try {
      a = await r.pushManager.subscribe({
        userVisibleOnly: !0,
        applicationServerKey: i,
      });
    } catch (e) {
      return {
        ok: !1,
        reason:
          e instanceof Error
            ? `No se pudo suscribir al push: ${e.message}`
            : `No se pudo suscribir al push`,
      };
    }
  (await Cr(a), await kr(r), await Or());
  try {
    await r.showNotification(`RFS · Alertas activas`, {
      body: `Este teléfono recibirá la sirena de central aunque la app esté cerrada.`,
      icon: `/icon-192.png`,
      badge: `/icon-192.png`,
      tag: `rfs-push-armed`,
    });
  } catch {}
  return { ok: !0, permission: n };
}
async function Or() {
  try {
    let e = localStorage.getItem(`rfs.lastActivityAt`),
      t = e ? new Date(e).getTime() : Date.now();
    await (
      await caches.open(`rfs-meta`)
    ).put(
      `/rfs-last-activity`,
      new Response(String(Number.isFinite(t) ? t : Date.now()), {
        headers: { "Content-Type": `text/plain` },
      }),
    );
  } catch {}
}
async function kr(e) {
  try {
    let t = e.periodicSync;
    if (!t?.register) return;
    await t.register(`rfs-overdue-check`, { minInterval: 9e5 });
  } catch {}
}
async function Ar() {
  if (!wr() || Notification.permission !== `granted`) return;
  let e = await (
    await navigator.serviceWorker.ready
  ).pushManager.getSubscription();
  e ? await Cr(e) : await Dr({ forceResubscribe: !0 });
}
var jr = `rfs.ponches`,
  Mr = `rfs.photos`,
  Nr = `rfs.profile`,
  Pr = `rfs.lastActivityAt`,
  Fr = `rfs.dutyStartedAt`,
  Ir = 72e5;
function Lr(e) {
  try {
    return localStorage.getItem(e);
  } catch {
    return null;
  }
}
function Rr(e, t) {
  try {
    return (localStorage.setItem(e, t), Lr(e) === t);
  } catch {
    return !1;
  }
}
function zr() {
  try {
    let e = Lr(jr);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Br(e) {
  let t = [e, ...zr()].slice(0, 50);
  return (Rr(jr, JSON.stringify(t)), t);
}
function Vr() {
  try {
    let e = Lr(Mr);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Hr(e) {
  let t = [e, ...Vr()].slice(0, 20);
  return (Rr(Mr, JSON.stringify(t)), t);
}
function Ur() {
  try {
    let e = Lr(Nr);
    if (!e) return null;
    let t = JSON.parse(e);
    if (!t.vigilanteName?.trim() || !t.serviceName?.trim()) return null;
    let n = t.code
      ?.trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, ``);
    return {
      vigilanteName: t.vigilanteName.trim(),
      serviceName: t.serviceName.trim(),
      ...(n ? { code: n } : {}),
    };
  } catch {
    return null;
  }
}
function Wr(e) {
  let t = e.code
      ?.trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, ``),
    n = {
      vigilanteName: e.vigilanteName.trim(),
      serviceName: e.serviceName.trim(),
      ...(t ? { code: t } : {}),
    };
  return Rr(Nr, JSON.stringify(n));
}
function Gr() {
  let e = Lr(Fr);
  if (e) return e;
  let t = new Date().toISOString();
  return (Rr(Fr, t), t);
}
function Kr(e = new Date().toISOString()) {
  Rr(Pr, e);
  try {
    (caches
      .open(`rfs-meta`)
      .then((t) =>
        t.put(
          `/rfs-last-activity`,
          new Response(String(new Date(e).getTime()), {
            headers: { "Content-Type": `text/plain` },
          }),
        ),
      ),
      `serviceWorker` in navigator &&
        navigator.serviceWorker.ready.then((t) => {
          t.active?.postMessage({ type: `RFS_ACTIVITY`, at: e });
        }));
  } catch {}
}
function qr() {
  let e = Lr(Pr),
    t = e ? new Date(e).getTime() : 0;
  for (let e of zr()) {
    let n = new Date(e.timestamp).getTime();
    Number.isFinite(n) && n > t && (t = n);
  }
  for (let e of Vr()) {
    let n = new Date(e.timestamp).getTime();
    Number.isFinite(n) && n > t && (t = n);
  }
  return t > 0 ? new Date(t).toISOString() : Gr();
}
function Jr(e = Date.now()) {
  let t = new Date(qr()).getTime();
  return Number.isFinite(t) ? t + Ir - e : Ir;
}
function Yr(e = Date.now()) {
  return Jr(e) <= 0;
}
var Xr = 85e4;
async function Zr(e, t) {
  let n = t?.maxWidth ?? 960,
    r = t?.quality ?? 0.58,
    i = await Qr(e);
  for (let t = 0; t < 6; t += 1) {
    let t = i.width > n ? n / i.width : 1,
      a = Math.max(1, Math.round(i.width * t)),
      o = Math.max(1, Math.round(i.height * t)),
      s = document.createElement(`canvas`);
    ((s.width = a), (s.height = o));
    let c = s.getContext(`2d`);
    if (!c) return e;
    c.drawImage(i, 0, 0, a, o);
    let l = s.toDataURL(`image/jpeg`, r);
    if (l.length <= Xr) return l;
    ((r = Math.max(0.32, r - 0.08)), (n = Math.max(480, Math.round(n * 0.85))));
  }
  throw Error(`Foto demasiado grande para enviar a central`);
}
function Qr(e) {
  return new Promise((t, n) => {
    let r = new Image();
    ((r.onload = () => t(r)),
      (r.onerror = () => n(Error(`No se pudo procesar la foto`))),
      (r.src = e));
  });
}
function $r(e) {
  let t = Math.max(0, Math.ceil(e / 6e4)),
    n = Math.floor(t / 60),
    r = t % 60;
  return n <= 0 ? `${r} min` : `${n} h ${r} min`;
}
function ei(e) {
  return new Date(e).toLocaleString(`es-DO`, {
    dateStyle: `short`,
    timeStyle: `medium`,
  });
}
function ti() {
  return ($.jsxs)(`svg`, {
    className: `camera-icon`,
    viewBox: `0 0 24 24`,
    "aria-hidden": `true`,
    children: [
      ($.jsx)(`path`, {
        d: `M4 8.5h3l1.4-2h7.2l1.4 2H20a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5Z`,
      }),
      ($.jsx)(`circle`, { cx: `12`, cy: `13.5`, r: `3.2` }),
    ],
  });
}
function ni() {
  let [e, n] = (0, b.useState)(!1),
    [i, o] = (0, b.useState)(null),
    [s, l] = (0, b.useState)(`idle`),
    [d, m] = (0, b.useState)(
      `Toque el centro del logo para registrar su ponche.`,
    ),
    [h, g] = (0, b.useState)(``),
    [_, v] = (0, b.useState)([]),
    [y, x] = (0, b.useState)(``),
    [S, C] = (0, b.useState)(``),
    [w, T] = (0, b.useState)(!1),
    [E, D] = (0, b.useState)(``),
    [O, ee] = (0, b.useState)(`new`),
    [te, ne] = (0, b.useState)(``),
    [k, A] = (0, b.useState)(!1),
    [re, ie] = (0, b.useState)(!1),
    [ae, oe] = (0, b.useState)(!1),
    [j, M] = (0, b.useState)(!1),
    [N, P] = (0, b.useState)(!1),
    [se, ce] = (0, b.useState)(``),
    [F, le] = (0, b.useState)(() => ({
      stationId: null,
      playing: !1,
      loading: !1,
      error: ``,
      title: ``,
      interruptedByAlarm: !1,
    })),
    [ue, I] = (0, b.useState)(``),
    [de, L] = (0, b.useState)(!1),
    [fe, pe] = (0, b.useState)(!1),
    R = (0, b.useRef)(null),
    me = (0, b.useRef)(null),
    z = (0, b.useRef)(!1),
    B = (0, b.useRef)(!1),
    [cameraOpen, setCameraOpen] = (0, b.useState)(!1),
    [torchOn, setTorchOn] = (0, b.useState)(!1);
  ((0, b.useEffect)(() => {
    let e = !1;
    async function t() {
      await jn();
      let t = q(),
        i = Ur();
      if (i)
        try {
          let e = await r(t, i);
          (Wr(e), (i = e));
        } catch {}
      else
        try {
          let e = await c(t);
          e && (Wr(e), (i = e));
        } catch {}
      if (!e) {
        (o(i),
          i
            ? (x(i.vigilanteName),
              C(i.serviceName),
              (document.title = `RFS Ponche · ${i.vigilanteName}`))
            : (document.title = `RFS Ponche`),
          v(zr()),
          Gr(),
          qr(),
          $n(),
          n(!0));
        try {
          let { sent: t, left: n } = await Vn();
          !e &&
            (t > 0 || n > 0) &&
            g(
              n > 0
                ? `Reenviando a central… quedan ${n}`
                : `Se reenviaron ${t} registro(s) pendientes a central`,
            );
        } catch {}
      }
    }
    t();
    let i = window.setInterval(() => {
        Vn().then(({ sent: e, left: t }) => {
          e > 0 &&
            t === 0 &&
            (m(`Cola enviada a central`),
            g(`Se reenviaron ${e} registro(s) pendientes`));
        });
      }, 8e3),
      a = () => {
        Vn();
      };
    return (
      window.addEventListener(`online`, a),
      () => {
        ((e = !0),
          window.clearInterval(i),
          window.removeEventListener(`online`, a));
      }
    );
  }, []),
    (0, b.useEffect)(() => pr(le), []),
    (0, b.useEffect)(
      () => () => {
        R.current != null && window.clearTimeout(R.current);
      },
      [],
    ),
    (0, b.useEffect)(() => {
      if (!i) return;
      try {
        Kr(qr());
      } catch {}
      let e = !1;
      return (
        (async () => {
          try {
            let t = await Tr();
            if (e) return;
            if (t.supported && t.permission === `granted` && t.subscribed) {
              if ((await Ar(), e)) return;
              (L(!0), I(`Alertas remotas activas (suenan con la app cerrada)`));
              return;
            }
            if ((L(!1), !t.supported))
              I(
                `Este teléfono no soporta alertas remotas. En iPhone instale la app en pantalla de inicio.`,
              );
            else if (t.permission === `denied`)
              I(
                `Notificaciones bloqueadas. Actívelas en Ajustes del teléfono.`,
              );
            else if (t.permission === `granted` && !t.subscribed) {
              let t = await Dr({ forceResubscribe: !0 });
              if (e) return;
              (L(t.ok),
                I(
                  t.ok
                    ? `Alertas remotas activas (suenan con la app cerrada)`
                    : t.reason,
                ));
            } else
              I(
                `Toque “Activar alertas” para recibir la sirena con la app cerrada.`,
              );
          } catch (t) {
            e ||
              (L(!1),
              I(
                t instanceof Error
                  ? t.message
                  : `No se activaron alertas remotas`,
              ));
          }
        })(),
        () => {
          e = !0;
        }
      );
    }, [i?.vigilanteName, i?.code]),
    (0, b.useEffect)(() => {
      if (!(`serviceWorker` in navigator)) return;
      function e(e) {
        let t = e.data;
        t &&
          typeof t == `object` &&
          t.type === `RFS_PUSH` &&
          (t.kind === `remote-alert-stop`
            ? (ar(),
              yr(),
              P(!1),
              (B.current = !1),
              m(`Sirena de central detenida`),
              g(`Puede continuar su labor.`))
            : (t.kind === `remote-alert` || t.kind === `overdue-alert`) &&
              (vr(),
              ir(
                t.sound === `horn` || t.sound === `pulse` || t.sound === `wail`
                  ? t.sound
                  : t.kind === `overdue-alert`
                    ? `pulse`
                    : `wail`,
              ),
              P(!0),
              (B.current = !0),
              t.kind === `overdue-alert`
                ? (M(!0),
                  (z.current = !0),
                  m(`¡ALERTA! Debe ponchar ahora`),
                  g(
                    `Lleva más de 2 horas sin ponche. Toque el lobo para ponchar y apagar la sirena.`,
                  ))
                : (m(`¡ALERTA DE CENTRAL! Debe ponchar ahora`),
                  g(
                    `Central activó la sirena. Toque el lobo para ponchar y apagarla.`,
                  ))));
      }
      return (
        navigator.serviceWorker.addEventListener(`message`, e),
        () => navigator.serviceWorker.removeEventListener(`message`, e)
      );
    }, []),
    (0, b.useEffect)(() => {
      function e(e) {
        e.key === `Escape` &&
          w &&
          i &&
          (x(i.vigilanteName), C(i.serviceName), T(!1));
      }
      return (
        window.addEventListener(`keydown`, e),
        () => window.removeEventListener(`keydown`, e)
      );
    }, [w, i]),
    (0, b.useEffect)(() => {
      if (!i) {
        (ar(), M(!1), P(!1), (z.current = !1), (B.current = !1));
        return;
      }
      function e(e, t, n) {
        (M(e), (z.current = e), P(t), (B.current = t));
        let r = Jr();
        (ce(
          e
            ? `Sin ponche por más de 2 horas`
            : t
              ? `Alerta de central activa`
              : `Próxima alerta en ${$r(r)}`,
        ),
          e || t
            ? (vr(),
              ir(n ?? (e ? `pulse` : `wail`)),
              m(
                e
                  ? `¡ALERTA! Debe ponchar ahora`
                  : `¡ALERTA DE CENTRAL! Debe ponchar ahora`,
              ),
              g(
                e
                  ? `Lleva más de 2 horas sin registrar ponche. Toque el lobo para ponchar y apagar la sirena.`
                  : `Central activó la sirena. Toque el lobo para ponchar y apagarla.`,
              ))
            : (ar(), yr()));
      }
      function t() {
        e(Yr(), B.current);
      }
      async function n() {
        try {
          let t = await a(q());
          e(Yr(), t.alertActive, t.alertSound);
        } catch {
          t();
        }
      }
      (t(), n());
      let r = window.setInterval(t, 15e3),
        o = window.setInterval(() => void n(), 8e3),
        s = () => {
          document.visibilityState === `visible` && (t(), n());
        };
      return (
        document.addEventListener(`visibilitychange`, s),
        () => {
          (window.clearInterval(r),
            window.clearInterval(o),
            document.removeEventListener(`visibilitychange`, s),
            ar());
        }
      );
    }, [i, _]));
  function V(e, t) {
    return Wr(e)
      ? (o(e),
        (document.title = `RFS Ponche · ${e.vigilanteName}`),
        D(``),
        Gr(),
        er(),
        t?.revealCode && e.code && A(!0),
        t?.fromSettings && T(!1),
        !0)
      : (D(
          `No se pudo guardar en este teléfono. Revise el modo privado o el almacenamiento.`,
        ),
        !1);
  }
  async function he(e) {
    let t = { vigilanteName: y.trim(), serviceName: S.trim(), code: i?.code };
    if (!t.vigilanteName || !t.serviceName)
      D(`Escriba el nombre del vigilante y el nombre del servicio.`);
    else
      try {
        V(await r(q(), t), { revealCode: !e && !i?.code, fromSettings: e });
      } catch (n) {
        if (!e) {
          D(
            n instanceof Error
              ? n.message
              : `Necesita conexión para crear su código de vigilante.`,
          );
          return;
        }
        V(t, { fromSettings: e });
      }
  }
  async function ge() {
    let e = te.trim();
    if (!e) D(`Escriba el código único del vigilante.`);
    else {
      (ie(!0), D(``));
      try {
        (V(await p(e, q())), ne(``), ee(`new`));
      } catch (e) {
        D(
          e instanceof Error
            ? e.message
            : `No se pudo recuperar con ese código.`,
        );
      } finally {
        ie(!1);
      }
    }
  }
  function _e(e) {
    let t = e.replace(/[^A-Z0-9]/gi, ``).toUpperCase();
    return t.length === 6 ? `${t.slice(0, 3)}-${t.slice(3)}` : t;
  }
  async function ve(e) {
    try {
      (await navigator.clipboard.writeText(e), g(`Código copiado`));
    } catch {
      g(`No se pudo copiar el código`);
    }
  }
  function ye(e = `press`) {
    (pe(!0), R.current != null && window.clearTimeout(R.current));
    let t = e === `ok` ? 1100 : e === `err` ? 900 : 450;
    R.current = window.setTimeout(() => {
      (pe(!1), (R.current = null), (e === `ok` || e === `err`) && l(`idle`));
    }, t);
    try {
      e === `ok`
        ? navigator.vibrate?.([30, 40, 45])
        : e === `err`
          ? navigator.vibrate?.([60, 30, 60])
          : navigator.vibrate?.([20]);
    } catch {}
  }
  async function be() {
    if (i && s !== `locating`) {
      (ye(`press`),
        await er(),
        l(`locating`),
        m(`Obteniendo ubicación…`),
        g(`Mantenga el GPS activo y espere un momento.`));
      try {
        let e = await Mn(),
          t = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            latitude: e.latitude,
            longitude: e.longitude,
            accuracy: e.accuracy,
            vigilanteName: i.vigilanteName,
            serviceName: i.serviceName,
          },
          n = Br(t);
        (Kr(t.timestamp),
          v(n),
          ar(),
          M(!1),
          P(!1),
          (z.current = !1),
          (B.current = !1));
        let r = { ...t, deviceId: q() },
          a = !1,
          o = !1,
          s = ``;
        try {
          (await f(r), (a = !0));
        } catch (e) {
          ((s = e instanceof Error ? e.message : `Error de red`),
            (e instanceof u && e.permanent) ||
              (Ln({ kind: `ponche`, id: t.id, payload: r }), (o = !0), Vn()));
        }
        let c = Rn();
        (l(a ? `success` : `error`),
          ye(a ? `ok` : `err`),
          m(
            a
              ? `Ponche enviado a central — alarma apagada`
              : o
                ? `Ponche en cola — se reenviará a central`
                : `Ponche no enviado a central`,
          ),
          g(
            `${t.vigilanteName} · ${t.serviceName} · ${ei(t.timestamp)} · ${t.latitude.toFixed(5)}, ${t.longitude.toFixed(5)}` +
              (t.accuracy == null ? `` : ` · ±${Math.round(t.accuracy)} m`) +
              (a
                ? ``
                : ` · ${s.slice(0, 80)}${o && c > 0 ? ` · cola: ${c}` : ``}`),
          ));
      } catch (e) {
        (l(`error`),
          m(`No se pudo marcar el ponche`),
          g(e instanceof Error ? e.message : `Error desconocido`));
      }
    }
  }
  function xe() {
    if (ae) return;
    er();
    if (typeof navigator !== `undefined` && navigator.mediaDevices?.getUserMedia) {
      setCameraOpen(!0);
      return;
    }
    me.current?.click();
  }
  async function H(e) {
    if (i && !ae) {
      (oe(!0),
        l(`locating`),
        m(`Enviando foto a central…`),
        g(`Envío automático, no requiere confirmación.`));
      try {
        let n, r;
        try {
          let e = await Mn();
          ((n = e.latitude), (r = e.longitude));
        } catch {}
        let a = new Date().toISOString(),
          o = await Zr(e),
          s = {
            id: crypto.randomUUID(),
            timestamp: a,
            dataUrl: o,
            latitude: n,
            longitude: r,
            vigilanteName: i.vigilanteName,
            serviceName: i.serviceName,
          };
        (Hr(s),
          Kr(a),
          ar(),
          M(!1),
          P(!1),
          (z.current = !1),
          (B.current = !1),
          v(zr()));
        let c = { ...s, deviceId: q() };
        try {
          (await t(c),
            l(`success`),
            ye(`ok`),
            m(`Foto enviada a central — alarma apagada`),
            g(
              `${i.vigilanteName} · ${i.serviceName} · ${ei(a)}` +
                (n != null && r != null
                  ? ` · ${n.toFixed(5)}, ${r.toFixed(5)}`
                  : ``),
            ));
        } catch (e) {
          let t = e instanceof u && e.permanent;
          (t || Ln({ kind: `photo`, id: s.id, payload: c }),
            l(`error`),
            m(
              t
                ? `Foto no enviada a central`
                : `Foto en cola — se reenviará a central`,
            ),
            g(
              (e instanceof Error ? e.message : `Sin conexión`) +
                (t ? `` : ` · cola: ${Rn()}`),
            ));
        }
      } catch (e) {
        (l(`error`),
          m(`No se pudo preparar la foto`),
          g(e instanceof Error ? e.message : `Error desconocido`));
      } finally {
        (oe(!1), me.current && (me.current.value = ``));
      }
    }
  }
  function U(e) {
    let t = e?.[0];
    if (!t) return;
    let n = new FileReader();
    ((n.onload = () => {
      typeof n.result == `string` && H(n.result);
    }),
      n.readAsDataURL(t));
  }
  if (!e)
    return ($.jsx)(`div`, { className: `app boot`, children: `Cargando…` });
  if (!i)
    return ($.jsxs)(`div`, {
      className: `app setup-screen`,
      children: [
        ($.jsx)(`div`, {
          className: `setup-badge`,
          "aria-hidden": `true`,
          children: `RFS`,
        }),
        ($.jsx)(`h1`, {
          className: `setup-title`,
          children: `Configurar teléfono`,
        }),
        ($.jsx)(`p`, {
          className: `setup-copy`,
          children: `Nuevo vigilante: nombre y servicio. Si ya usaba la app, recupere su código único para conservar sus ponches.`,
        }),
        ($.jsxs)(`div`, {
          className: `setup-tabs`,
          role: `tablist`,
          "aria-label": `Tipo de configuración`,
          children: [
            ($.jsx)(`button`, {
              type: `button`,
              role: `tab`,
              "aria-selected": O === `new`,
              className: O === `new` ? `setup-tab is-active` : `setup-tab`,
              onClick: () => {
                (ee(`new`), D(``));
              },
              children: `Nuevo vigilante`,
            }),
            ($.jsx)(`button`, {
              type: `button`,
              role: `tab`,
              "aria-selected": O === `recover`,
              className: O === `recover` ? `setup-tab is-active` : `setup-tab`,
              onClick: () => {
                (ee(`recover`), D(``));
              },
              children: `Ya tengo código`,
            }),
          ],
        }),
        O === `new`
          ? ($.jsxs)($.Fragment, {
              children: [
                ($.jsxs)(`div`, {
                  className: `field`,
                  children: [
                    ($.jsx)(`label`, {
                      htmlFor: `setup-vigilante`,
                      children: `Nombre del vigilante`,
                    }),
                    ($.jsx)(`input`, {
                      id: `setup-vigilante`,
                      type: `text`,
                      autoComplete: `name`,
                      placeholder: `Ej. Juan Pérez`,
                      value: y,
                      onChange: (e) => x(e.target.value),
                    }),
                  ],
                }),
                ($.jsxs)(`div`, {
                  className: `field`,
                  children: [
                    ($.jsx)(`label`, {
                      htmlFor: `setup-service`,
                      children: `Nombre del servicio`,
                    }),
                    ($.jsx)(`input`, {
                      id: `setup-service`,
                      type: `text`,
                      placeholder: `Ej. Torre Empresarial / Plaza Central`,
                      value: S,
                      onChange: (e) => C(e.target.value),
                    }),
                  ],
                }),
                E
                  ? ($.jsx)(`p`, { className: `setup-error`, children: E })
                  : null,
                ($.jsx)(`button`, {
                  type: `button`,
                  className: `primary-btn setup-save`,
                  onClick: () => void he(!1),
                  children: `Guardar y crear código`,
                }),
              ],
            })
          : ($.jsxs)($.Fragment, {
              children: [
                ($.jsxs)(`div`, {
                  className: `field`,
                  children: [
                    ($.jsx)(`label`, {
                      htmlFor: `setup-code`,
                      children: `Código único del vigilante`,
                    }),
                    ($.jsx)(`input`, {
                      id: `setup-code`,
                      type: `text`,
                      inputMode: `text`,
                      autoCapitalize: `characters`,
                      autoCorrect: `off`,
                      spellCheck: !1,
                      placeholder: `Ej. A7K-2M9`,
                      value: te,
                      onChange: (e) => ne(e.target.value.toUpperCase()),
                    }),
                  ],
                }),
                ($.jsx)(`p`, {
                  className: `setup-copy setup-copy-tight`,
                  children: `Al recuperar, verá el mismo nombre, servicio e historial de ponches en central.`,
                }),
                E
                  ? ($.jsx)(`p`, { className: `setup-error`, children: E })
                  : null,
                ($.jsx)(`button`, {
                  type: `button`,
                  className: `primary-btn setup-save`,
                  disabled: re,
                  onClick: () => void ge(),
                  children: re ? `Recuperando…` : `Recuperar mi perfil`,
                }),
              ],
            }),
      ],
    });
  let Se =
      s === `success`
        ? `is-success`
        : s === `error`
          ? `is-error`
          : s === `locating`
            ? `is-busy`
            : ``,
    Ce =
      j || N
        ? `is-alarm`
        : s === `locating`
          ? `is-busy`
          : s === `success`
            ? `is-ok`
            : s === `error`
              ? `is-err`
              : ``;
  return ($.jsxs)(`div`, {
    className: `app ${j || N ? `app-alarm` : ``}`,
    children: [
      ($.jsxs)(`header`, {
        className: `brand-bar`,
        children: [
          ($.jsxs)(`div`, {
            children: [
              ($.jsx)(`p`, { className: `brand-rfs`, children: `RFS` }),
              ($.jsx)(`p`, {
                className: `brand-ponche`,
                children: `Ponche`,
              }),
              ($.jsx)(`p`, {
                className: `guard-line`,
                children: i.vigilanteName,
              }),
              ($.jsx)(`p`, {
                className: `guard-service`,
                children: i.serviceName,
              }),
              i.code
                ? ($.jsxs)(`p`, {
                    className: `guard-code`,
                    children: [`Código `, _e(i.code)],
                  })
                : null,
            ],
          }),
          ($.jsx)(`button`, {
            type: `button`,
            className: `settings-btn`,
            "aria-label": `Configurar vigilante y servicio`,
            onClick: () => {
              (x(i.vigilanteName), C(i.serviceName), D(``), T(!0));
            },
            children: ($.jsxs)(`svg`, {
              viewBox: `0 0 24 24`,
              width: `18`,
              height: `18`,
              "aria-hidden": `true`,
              children: [
                ($.jsx)(`path`, {
                  fill: `none`,
                  stroke: `currentColor`,
                  strokeWidth: `1.8`,
                  d: `M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z`,
                }),
                ($.jsx)(`path`, {
                  fill: `none`,
                  stroke: `currentColor`,
                  strokeWidth: `1.8`,
                  d: `M19.4 13.5v-3l1.7-1.3-1.6-2.8-2 .5a6.7 6.7 0 0 0-1.6-.9l-.4-2.1h-3.2l-.4 2.1c-.56.2-1.1.5-1.6.9l-2-.5-1.6 2.8L4.6 10.5v3l-1.7 1.3 1.6 2.8 2-.5c.5.4 1.04.7 1.6.9l.4 2.1h3.2l.4-2.1c.56-.2 1.1-.5 1.6-.9l2 .5 1.6-2.8-1.7-1.3Z`,
                }),
              ],
            }),
          }),
        ],
      }),
      ($.jsx)(`section`, {
        className: `hero`,
        "aria-label": `Marcar ponche`,
        children: ($.jsxs)(`button`, {
          type: `button`,
          className: `logo-button ${Ce}${fe ? ` is-firing` : ``}`,
          onClick: be,
          disabled: s === `locating`,
          "aria-label": `Tocar el logo para marcar ponche con GPS`,
          children: [
            ($.jsx)(`span`, {
              className: `logo-ring`,
              "aria-hidden": `true`,
            }),
            ($.jsx)(`img`, {
              className: `logo-img`,
              src: `/logo-tight.jpg`,
              alt: `Reaction Force Security`,
            }),
            ($.jsxs)(`span`, {
              className: `logo-eyes`,
              "aria-hidden": `true`,
              children: [
                ($.jsx)(`span`, { className: `logo-eye logo-eye-l` }),
                ($.jsx)(`span`, { className: `logo-eye logo-eye-r` }),
              ],
            }),
            ($.jsx)(`span`, {
              className: `logo-flash`,
              "aria-hidden": `true`,
            }),
            ($.jsx)(`span`, {
              className: `logo-hit`,
              "aria-hidden": `true`,
            }),
          ],
        }),
      }),
      j || N
        ? ($.jsxs)(`div`, {
            className: `alarm-banner`,
            role: `alert`,
            children: [
              ($.jsx)(`strong`, {
                children: N && !j ? `Alerta de central` : `Alerta automática`,
              }),
              ($.jsx)(`span`, {
                children:
                  N && !j
                    ? `Central activó la sirena. Ponche ahora para apagarla.`
                    : `Más de 2 horas sin ponche. Sirena activa — ponche ahora para apagarla.`,
              }),
            ],
          })
        : ($.jsxs)(`p`, {
            className: `prompt`,
            children: [
              ($.jsx)(`strong`, { children: `Toque el centro` }),
              ($.jsxs)(`span`, {
                children: [
                  `Envía su ubicación y registra el ponche.`,
                  ` `,
                  se || `Alerta a las 2 horas sin ponche.`,
                ],
              }),
            ],
          }),
      i && !de && !j && !N
        ? ($.jsxs)(`div`, {
            className: `push-arm-banner`,
            role: `status`,
            children: [
              ($.jsx)(`strong`, { children: `Notificaciones apagadas` }),
              ($.jsx)(`span`, {
                children:
                  ue ||
                  `Active alertas para que central pueda avisarle con la app cerrada.`,
              }),
              ($.jsx)(`button`, {
                type: `button`,
                className: `push-arm-btn`,
                onClick: () => {
                  (async () => {
                    try {
                      let e = await Dr({ forceResubscribe: !0 });
                      (L(e.ok),
                        I(
                          e.ok
                            ? `Alertas remotas activas (suenan con la app cerrada)`
                            : e.reason,
                        ));
                    } catch (e) {
                      (L(!1),
                        I(
                          e instanceof Error
                            ? e.message
                            : `No se activaron alertas`,
                        ));
                    }
                  })();
                },
                children: `Activar alertas`,
              }),
            ],
          })
        : null,
      ($.jsxs)(`div`, {
        className: `status ${j || N ? `is-alarm` : Se}`,
        role: `status`,
        "aria-live": `polite`,
        children: [
          ($.jsx)(`div`, {
            className: `status-label`,
            children: j || N ? `Alerta` : `Estado`,
          }),
          ($.jsx)(`div`, { className: `status-value`, children: d }),
          h
            ? ($.jsx)(`div`, { className: `status-meta`, children: h })
            : null,
        ],
      }),
      ($.jsxs)(`div`, {
        className: `actions`,
        children: [
          ($.jsxs)(`button`, {
            type: `button`,
            className: `camera-btn`,
            onClick: xe,
            disabled: ae,
            children: [
              ($.jsx)(ti, {}),
              ae ? `Enviando foto…` : `Tomar foto`,
            ],
          }),
          ($.jsx)(`button`, {
            type: `button`,
            className: `flash-btn ${torchOn ? `is-on` : ``}`,
            "aria-pressed": torchOn,
            onClick: () => setTorchOn((e) => !e),
            disabled: ae,
            title: `Flash (cámara en vivo en Android Chrome)`,
            children: torchOn ? `Flash ON` : `Flash`,
          }),
          ($.jsx)(CameraCapture, {
            open: cameraOpen,
            torchOn,
            onTorchChange: setTorchOn,
            onClose: () => setCameraOpen(!1),
            onCapture: (e) => void H(e),
          }),
          ($.jsx)(`input`, {
            ref: me,
            className: `hidden-input`,
            type: `file`,
            accept: `image/*`,
            capture: `environment`,
            onChange: (e) => U(e.target.files),
          }),
        ],
      }),
      ($.jsxs)(`section`, {
        className: `radio-dock`,
        "aria-label": `Emisoras para el vigilante`,
        children: [
          ($.jsxs)(`div`, {
            className: `radio-head`,
            children: [
              ($.jsx)(`h2`, { children: `Radio` }),
              ($.jsx)(`p`, {
                children: `Toque una emisora para escuchar. Se pausa sola con la alarma de ponche.`,
              }),
            ],
          }),
          ($.jsx)(`div`, {
            className: `radio-grid`,
            children: or.map((e) => {
              let t = F.stationId === e.id,
                n = t && (F.playing || F.loading);
              return ($.jsxs)(
                `button`,
                {
                  type: `button`,
                  className: `radio-chip ${n ? `is-on` : ``} ${t && F.interruptedByAlarm ? `is-paused` : ``}`,
                  onClick: () => {
                    (er(), gr(e.id));
                  },
                  "aria-pressed": n,
                  children: [
                    ($.jsx)(`span`, {
                      className: `radio-icon`,
                      "aria-hidden": `true`,
                      children:
                        e.id === `cdn`
                          ? `N`
                          : e.id === `z101`
                            ? `Z`
                            : e.id === `music`
                              ? `M`
                              : `TC`,
                    }),
                    ($.jsx)(`span`, {
                      className: `radio-label`,
                      children: e.label,
                    }),
                    ($.jsx)(`span`, {
                      className: `radio-sub`,
                      children: e.subtitle,
                    }),
                  ],
                },
                e.id,
              );
            }),
          }),
          F.stationId || F.error
            ? ($.jsxs)(`p`, {
                className: `radio-status ${F.error ? `is-error` : ``}`,
                children: [
                  F.error
                    ? F.error
                    : F.interruptedByAlarm
                      ? `Radio en pausa por alarma — se reanuda al ponchar.`
                      : F.loading
                        ? `Conectando ${F.title || ``}…`
                        : F.playing
                          ? `En vivo · ${F.title}`
                          : F.title || ``,
                  F.playing
                    ? ($.jsxs)($.Fragment, {
                        children: [
                          ` `,
                          ($.jsx)(`button`, {
                            type: `button`,
                            className: `radio-stop`,
                            onClick: () => _r(),
                            children: `Detener`,
                          }),
                        ],
                      })
                    : null,
                ],
              })
            : null,
        ],
      }),
      ($.jsxs)(`section`, {
        className: `history`,
        "aria-label": `Últimos ponches`,
        children: [
          ($.jsx)(`h2`, { children: `Últimos ponches` }),
          _.length === 0
            ? ($.jsx)(`p`, {
                className: `empty`,
                children: `Aún no hay ponches en este dispositivo.`,
              })
            : ($.jsx)(`ul`, {
                className: `history-list`,
                children: _.slice(0, 3).map((e) =>
                  ($.jsxs)(
                    `li`,
                    {
                      className: `history-item`,
                      children: [
                        ($.jsxs)(`div`, {
                          children: [
                            ($.jsx)(`time`, {
                              dateTime: e.timestamp,
                              children: ei(e.timestamp),
                            }),
                            ($.jsxs)(`small`, {
                              children: [e.vigilanteName, ` · `, e.serviceName],
                            }),
                          ],
                        }),
                        ($.jsxs)(`span`, {
                          children: [
                            e.latitude.toFixed(4),
                            `, `,
                            e.longitude.toFixed(4),
                          ],
                        }),
                      ],
                    },
                    e.id,
                  ),
                ),
              }),
        ],
      }),
      k && i.code
        ? ($.jsx)(`div`, {
            className: `overlay`,
            role: `dialog`,
            "aria-modal": `true`,
            "aria-label": `Código de vigilante`,
            children: ($.jsxs)(`div`, {
              className: `sheet code-reveal`,
              children: [
                ($.jsx)(`h2`, { children: `Guarde su código` }),
                ($.jsx)(`p`, {
                  children: `Este código identifica al vigilante. Si desinstala la app o cambia de teléfono, escríbalo en “Ya tengo código” para recuperar nombre, servicio y reportes.`,
                }),
                ($.jsx)(`div`, {
                  className: `code-box`,
                  children: ($.jsx)(`strong`, {
                    className: `code-box-value`,
                    children: _e(i.code),
                  }),
                }),
                ($.jsxs)(`div`, {
                  className: `sheet-actions`,
                  children: [
                    ($.jsx)(`button`, {
                      type: `button`,
                      className: `secondary-btn`,
                      onClick: () => void ve(i.code),
                      children: `Copiar`,
                    }),
                    ($.jsx)(`button`, {
                      type: `button`,
                      className: `primary-btn`,
                      onClick: () => A(!1),
                      children: `Ya lo anoté`,
                    }),
                  ],
                }),
              ],
            }),
          })
        : null,
      w
        ? ($.jsx)(`div`, {
            className: `overlay`,
            role: `dialog`,
            "aria-modal": `true`,
            "aria-label": `Configuración`,
            onClick: () => T(!1),
            children: ($.jsxs)(`div`, {
              className: `sheet`,
              onClick: (e) => e.stopPropagation(),
              children: [
                ($.jsx)(`h2`, { children: `Configuración` }),
                ($.jsx)(`p`, {
                  children: `Actualice el nombre o servicio. Su código único no cambia y conserva sus reportes.`,
                }),
                i.code
                  ? ($.jsxs)(`div`, {
                      className: `code-box`,
                      children: [
                        ($.jsx)(`span`, {
                          className: `code-box-label`,
                          children: `Su código único`,
                        }),
                        ($.jsx)(`strong`, {
                          className: `code-box-value`,
                          children: _e(i.code),
                        }),
                        ($.jsx)(`p`, {
                          className: `code-box-hint`,
                          children: `Anótelo. Si reinstala la app o cambia de teléfono, úselo en “Ya tengo código”.`,
                        }),
                        ($.jsx)(`button`, {
                          type: `button`,
                          className: `secondary-btn`,
                          onClick: () => void ve(i.code),
                          children: `Copiar código`,
                        }),
                      ],
                    })
                  : null,
                ($.jsxs)(`div`, {
                  className: `code-box`,
                  children: [
                    ($.jsx)(`span`, {
                      className: `code-box-label`,
                      children: `Alerta remota de central`,
                    }),
                    ($.jsx)(`p`, {
                      className: `code-box-hint`,
                      children:
                        ue ||
                        (wr()
                          ? `Active notificaciones para que la sirena suene aunque la app esté cerrada.`
                          : `Este teléfono no soporta alertas remotas en segundo plano.`),
                    }),
                    ($.jsx)(`button`, {
                      type: `button`,
                      className: `secondary-btn`,
                      onClick: () => {
                        (async () => {
                          try {
                            let e = await Dr({ forceResubscribe: !0 });
                            (L(e.ok),
                              I(
                                e.ok
                                  ? `Alertas remotas activas (suenan con la app cerrada)`
                                  : e.reason,
                              ));
                          } catch (e) {
                            I(
                              e instanceof Error
                                ? e.message
                                : `No se pudo activar`,
                            );
                          }
                        })();
                      },
                      children: `Activar alerta remota`,
                    }),
                  ],
                }),
                ($.jsxs)(`div`, {
                  className: `field`,
                  children: [
                    ($.jsx)(`label`, {
                      htmlFor: `edit-vigilante`,
                      children: `Nombre del vigilante`,
                    }),
                    ($.jsx)(`input`, {
                      id: `edit-vigilante`,
                      type: `text`,
                      value: y,
                      onChange: (e) => x(e.target.value),
                    }),
                  ],
                }),
                ($.jsxs)(`div`, {
                  className: `field`,
                  children: [
                    ($.jsx)(`label`, {
                      htmlFor: `edit-service`,
                      children: `Nombre del servicio`,
                    }),
                    ($.jsx)(`input`, {
                      id: `edit-service`,
                      type: `text`,
                      value: S,
                      onChange: (e) => C(e.target.value),
                    }),
                  ],
                }),
                E
                  ? ($.jsx)(`p`, { className: `setup-error`, children: E })
                  : null,
                ($.jsxs)(`div`, {
                  className: `sheet-actions`,
                  children: [
                    ($.jsx)(`button`, {
                      type: `button`,
                      className: `secondary-btn`,
                      onClick: () => {
                        (x(i.vigilanteName), C(i.serviceName), D(``), T(!1));
                      },
                      children: `Cancelar`,
                    }),
                    ($.jsx)(`button`, {
                      type: `button`,
                      className: `primary-btn`,
                      onClick: () => void he(!0),
                      children: `Guardar`,
                    }),
                  ],
                }),
              ],
            }),
          })
        : null,
    ],
  });
}
export default function VigilanteApp() {
  return $.jsx(ni, {})
}
