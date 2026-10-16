(function () {
  const cfg = window.RFS_CLOUD || {};
  const projectId = cfg.projectId;
  const apiKey = cfg.apiKey;
  const rootDoc = cfg.docPath || "rfs/main";
  const rootCollection = rootDoc.split("/")[0] || "rfs";
  const MEDIA_COLLECTION = cfg.mediaCollection || "rfs_media";
  const storageBucket =
    cfg.storageBucket || (projectId ? `${projectId}.firebasestorage.app` : "");
  const SCHEMA_VERSION = "2";
  /** Base64 / data-URL más largos que esto salen a Storage (o rfs_media de respaldo) */
  const MEDIA_MIN_CHARS = 800;

  let firebaseStorage = null;
  let storageInitTried = false;
  let storageAvailable = null; // null=unknown, true/false after probe

  function isDataUrl(value) {
    return typeof value === "string" && value.startsWith("data:");
  }

  function isHttpUrl(value) {
    return typeof value === "string" && /^https?:\/\//i.test(value);
  }

  function mimeFromDataUrl(dataUrl) {
    const m = String(dataUrl || "").match(/^data:([^;,]+)/i);
    return (m && m[1]) || "application/octet-stream";
  }

  function initFirebaseStorage() {
    if (firebaseStorage) return firebaseStorage;
    if (storageInitTried) return null;
    storageInitTried = true;
    if (!projectId || !apiKey || !storageBucket) return null;
    if (!window.firebase || !window.firebase.storage) {
      console.warn("RFS Storage: falta Firebase SDK (app + storage).");
      return null;
    }
    try {
      if (!window.firebase.apps || !window.firebase.apps.length) {
        window.firebase.initializeApp({
          apiKey,
          projectId,
          storageBucket,
          authDomain: `${projectId}.firebaseapp.com`,
        });
      }
      firebaseStorage = window.firebase.storage();
      return firebaseStorage;
    } catch (err) {
      console.warn("RFS Storage: no se pudo inicializar", err);
      return null;
    }
  }

  async function uploadDataUrlToStorage(path, dataUrl, contentType) {
    const storage = initFirebaseStorage();
    if (!storage) throw new Error("storage not ready");
    const ref = storage.ref(path);
    const mime = contentType || mimeFromDataUrl(dataUrl) || "image/jpeg";
    await ref.putString(dataUrl, "data_url", { contentType: mime });
    const url = await ref.getDownloadURL();
    storageAvailable = true;
    return url;
  }

  async function deleteStoragePath(path) {
    if (!path) return false;
    const storage = initFirebaseStorage();
    if (!storage) return false;
    try {
      await storage.ref(path).delete();
      return true;
    } catch (err) {
      const code = err && (err.code || err.message || "");
      if (String(code).includes("object-not-found") || String(code).includes("404")) return false;
      throw err;
    }
  }

  function storageEnabled() {
    return !!initFirebaseStorage();
  }

  const PART_DOCS = {
    main: true,
    posts: true,
    employees: true,
    loans: true,
    activity: true,
    pettyCash: true,
    hr: true,
    depuracion: true,
    contabilidad: true,
  };

  function baseUrl() {
    return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  }

  function docUrl(path) {
    return `${baseUrl()}/${path}?key=${encodeURIComponent(apiKey)}`;
  }

  function partPath(name) {
    return name === "main" ? `${rootCollection}/main` : `${rootCollection}/${name}`;
  }

  function mediaPath(id) {
    return `${MEDIA_COLLECTION}/${id}`;
  }

  function safeId(value) {
    return String(value || "x")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 96);
  }

  function mediaDocId(kind, ownerId, field) {
    return `${kind}_${safeId(ownerId)}_${field}`;
  }

  function isHeavyMedia(value) {
    return typeof value === "string" && value.length >= MEDIA_MIN_CHARS;
  }

  function parseJsonField(fields, key, fallback) {
    const raw = fields[key] && fields[key].stringValue;
    if (raw == null || raw === "") return fallback;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function parseArrayField(fields, key) {
    const parsed = parseJsonField(fields, key, []);
    return Array.isArray(parsed) ? parsed : [];
  }

  function parseObjectField(fields, key) {
    const parsed = parseJsonField(fields, key, {});
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function getDoc(path, retries = 1) {
    let lastErr = null;
    for (let i = 0; i <= retries; i += 1) {
      try {
        const res = await fetch(docUrl(path), { method: "GET" });
        if (res.status === 404) return null;
        if (res.status === 429) {
          lastErr = new Error(`cloud load ${path} 429`);
          // Fallar rápido: no congelar el login con esperas largas
          if (i < retries) await sleep(1500);
          continue;
        }
        if (!res.ok) throw new Error(`cloud load ${path} ${res.status}`);
        return res.json();
      } catch (err) {
        lastErr = err;
        if (i < retries) await sleep(400);
      }
    }
    throw lastErr || new Error(`cloud load ${path} failed`);
  }

  async function patchDoc(path, fields, fieldPaths, retries = 2) {
    let lastErr = null;
    for (let i = 0; i <= retries; i += 1) {
      try {
        let url = docUrl(path);
        if (fieldPaths && fieldPaths.length) {
          url += fieldPaths.map((p) => `&updateMask.fieldPaths=${encodeURIComponent(p)}`).join("");
        }
        const res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields }),
        });
        if (res.status === 429) {
          lastErr = new Error(`cloud save ${path} 429`);
          if (i < retries) await sleep(2000 * (i + 1));
          continue;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`cloud save ${path} ${res.status}: ${text.slice(0, 220)}`);
        }
        return res.json();
      } catch (err) {
        lastErr = err;
        if (String(err && err.message).includes("429")) {
          if (i < retries) await sleep(2000 * (i + 1));
          continue;
        }
        if (i < retries) await sleep(400);
        else break;
      }
    }
    throw lastErr || new Error(`cloud save ${path} failed`);
  }

  async function putMedia(id, payload) {
    const fields = {
      kind: { stringValue: String(payload.kind || "") },
      ownerId: { stringValue: String(payload.ownerId || "") },
      field: { stringValue: String(payload.field || "") },
      data: { stringValue: String(payload.data || "") },
      name: { stringValue: String(payload.name || "") },
      mime: { stringValue: String(payload.mime || "") },
      updatedAt: { stringValue: new Date().toISOString() },
    };
    return patchDoc(mediaPath(id), fields);
  }

  async function deleteMedia(id) {
    if (!id) return false;
    const res = await fetch(docUrl(mediaPath(id)), { method: "DELETE" });
    if (res.status === 404) return false;
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`cloud media delete ${id} ${res.status}: ${text.slice(0, 180)}`);
    }
    return true;
  }

  async function loadMediaMap(ids) {
    const unique = [...new Set((ids || []).filter(Boolean))];
    const out = {};
    await Promise.all(
      unique.map(async (id) => {
        try {
          const doc = await getDoc(mediaPath(id));
          if (!doc) return;
          const data = doc.fields && doc.fields.data && doc.fields.data.stringValue;
          if (data) out[id] = data;
        } catch (_) {}
      })
    );
    return out;
  }

  function emptyPetty() {
    return { expenses: [], closings: [], people: [], deletedExpenses: [], epoch: 2 };
  }

  function emptyHr() {
    return { applications: [], deletedIds: [] };
  }

  function emptyDepuracion() {
    return { candidates: [], settings: {} };
  }

  function emptyContabilidad() {
    return {
      expenses: [],
      itbisCollected: [],
      officeEmployees: [],
      lotedomEmployees: [],
      payrolls: [],
      payrollBackups: [],
      settings: { defaultBook: "EDWARD" },
    };
  }

  function decodeLegacyMain(doc) {
    const fields = (doc && doc.fields) || {};
    return {
      posts: parseArrayField(fields, "postsJson"),
      reports: parseArrayField(fields, "reportsJson"),
      employees: parseArrayField(fields, "employeesJson"),
      loans: parseArrayField(fields, "loansJson"),
      loanTrash: parseArrayField(fields, "loanTrashJson"),
      monorrielReports: parseArrayField(fields, "monorrielReportsJson"),
      users: parseArrayField(fields, "usersJson"),
      messages: parseArrayField(fields, "messagesJson"),
      radio: parseObjectField(fields, "radioJson"),
      activity: parseArrayField(fields, "activityJson"),
      lva: parseObjectField(fields, "lvaJson"),
      pettyCash: Object.keys(parseObjectField(fields, "pettyCashJson")).length
        ? parseObjectField(fields, "pettyCashJson")
        : emptyPetty(),
      hr: Object.keys(parseObjectField(fields, "hrJson")).length
        ? parseObjectField(fields, "hrJson")
        : emptyHr(),
      depuracion: emptyDepuracion(),
      contabilidad: emptyContabilidad(),
      updatedAt: (fields.updatedAt && fields.updatedAt.stringValue) || null,
      schemaVersion: (fields.schemaVersion && fields.schemaVersion.stringValue) || "1",
    };
  }

  async function putHeavyToStorageOrMedia(opts) {
    const {
      dataUrl,
      storagePath,
      mediaId,
      kind,
      ownerId,
      field,
      name,
      mime,
      mediaJobs,
    } = opts;
    if (!isHeavyMedia(dataUrl) && !isDataUrl(dataUrl)) {
      return { url: "", usedStorage: false };
    }
    if (storageEnabled()) {
      try {
        const url = await uploadDataUrlToStorage(
          storagePath,
          dataUrl,
          mime || mimeFromDataUrl(dataUrl)
        );
        if (mediaId) {
          try {
            await deleteMedia(mediaId);
          } catch (_) {}
        }
        return { url, usedStorage: true };
      } catch (err) {
        console.warn("RFS Storage upload falló, usando rfs_media:", storagePath, err);
        storageAvailable = false;
      }
    }
    mediaJobs.push({
      id: mediaId,
      kind,
      ownerId: ownerId || "",
      field,
      data: dataUrl,
      name: name || "",
      mime: mime || mimeFromDataUrl(dataUrl) || "",
    });
    return { url: "", usedStorage: false, mediaId };
  }

  async function stripEmployees(employees) {
    const mediaJobs = [];
    const light = [];
    for (const emp of employees || []) {
      const copy = { ...(emp || {}) };
      const owner = copy.id || copy.key || copy.name || "x";

      // Foto → Firebase Storage (photoUrl); respaldo rfs_media
      if (isHeavyMedia(copy.photo) || isDataUrl(copy.photo)) {
        const mediaId = mediaDocId("emp", owner, "photo");
        const path = `employees/${safeId(owner)}/photo.jpg`;
        const put = await putHeavyToStorageOrMedia({
          dataUrl: copy.photo,
          storagePath: path,
          mediaId: copy.photoMediaId || mediaId,
          kind: "employee",
          ownerId: copy.id || "",
          field: "photo",
          mime: "image/jpeg",
          mediaJobs,
        });
        if (put.usedStorage) {
          copy.photoUrl = put.url;
          copy.photoStoragePath = path;
          copy.photo = "";
          copy.photoMediaId = "";
        } else {
          copy.photo = "";
          copy.photoMediaId = put.mediaId || mediaId;
        }
      } else if (isHttpUrl(copy.photo)) {
        copy.photoUrl = copy.photo;
        copy.photo = "";
      }
      // Si no hay foto en memoria pero sí URL/path/media, conservar (no borrar Storage en sync)

      // Documento → Storage o rfs_media
      if (isHeavyMedia(copy.documentData) || isDataUrl(copy.documentData)) {
        const mediaId = mediaDocId("emp", owner, "document");
        const path = `employees/${safeId(owner)}/document`;
        const put = await putHeavyToStorageOrMedia({
          dataUrl: copy.documentData,
          storagePath: path,
          mediaId: copy.documentMediaId || mediaId,
          kind: "employee",
          ownerId: copy.id || "",
          field: "documentData",
          name: copy.documentName || "",
          mime: copy.documentMime || mimeFromDataUrl(copy.documentData),
          mediaJobs,
        });
        if (put.usedStorage) {
          copy.documentUrl = put.url;
          copy.documentStoragePath = path;
          copy.documentData = "";
          copy.documentMediaId = "";
        } else {
          copy.documentData = "";
          copy.documentMediaId = put.mediaId || mediaId;
        }
      } else if (isHttpUrl(copy.documentData)) {
        copy.documentUrl = copy.documentData;
        copy.documentData = "";
      }
      // Conservar documentUrl/path/media si el doc no vino en este guardado

      light.push(copy);
    }
    return { light, mediaJobs };
  }

  async function stripPettyCash(pettyCash) {
    const src = pettyCash && typeof pettyCash === "object" ? pettyCash : emptyPetty();
    const mediaJobs = [];
    const mapList = async (list, prefix) => {
      const out = [];
      for (const row of Array.isArray(list) ? list : []) {
        const copy = { ...(row || {}) };
        if (isHeavyMedia(copy.checkPhoto) || isDataUrl(copy.checkPhoto)) {
          const mediaId = mediaDocId(prefix, copy.id || "x", "check");
          const path = `caja/${safeId(copy.id || "x")}/check.jpg`;
          const put = await putHeavyToStorageOrMedia({
            dataUrl: copy.checkPhoto,
            storagePath: path,
            mediaId: copy.checkPhotoMediaId || mediaId,
            kind: "pettyCash",
            ownerId: copy.id || "",
            field: "checkPhoto",
            mime: "image/jpeg",
            mediaJobs,
          });
          if (put.usedStorage) {
            copy.checkPhotoUrl = put.url;
            copy.checkPhotoStoragePath = path;
            copy.checkPhoto = "";
            copy.checkPhotoMediaId = "";
          } else {
            copy.checkPhoto = "";
            copy.checkPhotoMediaId = put.mediaId || mediaId;
          }
        } else if (isHttpUrl(copy.checkPhoto)) {
          copy.checkPhotoUrl = copy.checkPhoto;
          copy.checkPhoto = "";
        }
        out.push(copy);
      }
      return out;
    };
    const light = {
      ...src,
      expenses: await mapList(src.expenses, "caja"),
      deletedExpenses: await mapList(src.deletedExpenses, "cajaDel"),
    };
    return { light, mediaJobs };
  }

  async function stripHr(hr) {
    const src = hr && typeof hr === "object" ? hr : emptyHr();
    const mediaJobs = [];
    const applications = [];
    for (const app of Array.isArray(src.applications) ? src.applications : []) {
      const copy = { ...(app || {}) };
      if (isHeavyMedia(copy.photo) || isDataUrl(copy.photo)) {
        const mediaId = mediaDocId("hr", copy.id || "x", "photo");
        const path = `hr/${safeId(copy.id || "x")}/photo.jpg`;
        const put = await putHeavyToStorageOrMedia({
          dataUrl: copy.photo,
          storagePath: path,
          mediaId: copy.photoMediaId || mediaId,
          kind: "hr",
          ownerId: copy.id || "",
          field: "photo",
          mime: "image/jpeg",
          mediaJobs,
        });
        if (put.usedStorage) {
          copy.photoUrl = put.url;
          copy.photoStoragePath = path;
          copy.photo = "";
          copy.photoMediaId = "";
        } else {
          copy.photo = "";
          copy.photoMediaId = put.mediaId || mediaId;
        }
      } else if (isHttpUrl(copy.photo)) {
        copy.photoUrl = copy.photo;
        copy.photo = "";
      }
      // Cédula (desde Depuración) también a Storage
      if (isHeavyMedia(copy.cedulaPhoto) || isDataUrl(copy.cedulaPhoto)) {
        const mediaId = mediaDocId("hr", copy.id || "x", "cedula");
        const path = `hr/${safeId(copy.id || "x")}/cedula.jpg`;
        const put = await putHeavyToStorageOrMedia({
          dataUrl: copy.cedulaPhoto,
          storagePath: path,
          mediaId: copy.cedulaPhotoMediaId || mediaId,
          kind: "hr",
          ownerId: copy.id || "",
          field: "cedulaPhoto",
          mime: "image/jpeg",
          mediaJobs,
        });
        if (put.usedStorage) {
          copy.cedulaPhotoUrl = put.url;
          copy.cedulaPhotoStoragePath = path;
          copy.cedulaPhoto = "";
          copy.cedulaPhotoMediaId = "";
        } else {
          copy.cedulaPhoto = "";
          copy.cedulaPhotoMediaId = put.mediaId || mediaId;
        }
      } else if (isHttpUrl(copy.cedulaPhoto)) {
        copy.cedulaPhotoUrl = copy.cedulaPhoto;
        copy.cedulaPhoto = "";
      }
      applications.push(copy);
    }
    return { light: { ...src, applications }, mediaJobs };
  }

  function stripContabilidad(data) {
    const src = data && typeof data === "object" ? data : emptyContabilidad();
    return { light: src, mediaJobs: [] };
  }

  async function stripDepuracion(dep) {
    const src = dep && typeof dep === "object" ? dep : emptyDepuracion();
    const mediaJobs = [];
    const candidates = [];
    for (const row of Array.isArray(src.candidates) ? src.candidates : []) {
      const copy = { ...(row || {}) };
      if (isHeavyMedia(copy.cedulaPhoto) || isDataUrl(copy.cedulaPhoto)) {
        const mediaId = mediaDocId("dep", copy.id || "x", "cedula");
        const path = `dep/${safeId(copy.id || "x")}/cedula.jpg`;
        const put = await putHeavyToStorageOrMedia({
          dataUrl: copy.cedulaPhoto,
          storagePath: path,
          mediaId: copy.cedulaPhotoMediaId || mediaId,
          kind: "depuracion",
          ownerId: copy.id || "",
          field: "cedulaPhoto",
          mime: "image/jpeg",
          mediaJobs,
        });
        if (put.usedStorage) {
          copy.cedulaPhotoUrl = put.url;
          copy.cedulaPhotoStoragePath = path;
          copy.cedulaPhoto = "";
          copy.cedulaPhotoMediaId = "";
        } else {
          copy.cedulaPhoto = "";
          copy.cedulaPhotoMediaId = put.mediaId || mediaId;
        }
      } else if (isHttpUrl(copy.cedulaPhoto)) {
        copy.cedulaPhotoUrl = copy.cedulaPhoto;
        copy.cedulaPhoto = "";
      }
      candidates.push(copy);
    }
    return {
      light: {
        ...src,
        settings: src.settings && typeof src.settings === "object" ? src.settings : {},
        candidates,
      },
      mediaJobs,
    };
  }

  function collectMediaIds(employees, pettyCash, hr, depuracion) {
    const ids = [];
    (employees || []).forEach((e) => {
      if (e && e.photoMediaId) ids.push(e.photoMediaId);
      if (e && e.documentMediaId) ids.push(e.documentMediaId);
    });
    const pc = pettyCash || {};
    [...(pc.expenses || []), ...(pc.deletedExpenses || [])].forEach((e) => {
      if (e && e.checkPhotoMediaId) ids.push(e.checkPhotoMediaId);
    });
    ((hr && hr.applications) || []).forEach((a) => {
      if (a && a.photoMediaId) ids.push(a.photoMediaId);
      if (a && a.cedulaPhotoMediaId) ids.push(a.cedulaPhotoMediaId);
    });
    ((depuracion && depuracion.candidates) || []).forEach((c) => {
      if (c && c.cedulaPhotoMediaId) ids.push(c.cedulaPhotoMediaId);
    });
    return ids;
  }

  function storagePublicUrl(path) {
    if (!path || !storageBucket) return "";
    return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(
      path
    )}?alt=media`;
  }

  function hydrateEmployees(employees, mediaMap) {
    return (employees || []).map((emp) => {
      const copy = { ...(emp || {}) };
      // Preferir URL de Storage; legacy rfs_media → data URL en photo
      if (copy.photoUrl && isHttpUrl(copy.photoUrl)) {
        copy.photo = copy.photoUrl;
      } else if (copy.photoMediaId && mediaMap[copy.photoMediaId]) {
        copy.photo = mediaMap[copy.photoMediaId];
      } else if (!copy.photo && copy.photoStoragePath) {
        // Recuperar URL si se perdió photoUrl pero quedó la ruta
        copy.photoUrl = storagePublicUrl(copy.photoStoragePath);
        copy.photo = copy.photoUrl;
      }
      if (copy.documentUrl && isHttpUrl(copy.documentUrl)) {
        copy.documentData = copy.documentUrl;
      } else if (copy.documentMediaId && mediaMap[copy.documentMediaId]) {
        copy.documentData = mediaMap[copy.documentMediaId];
      } else if (!copy.documentData && copy.documentStoragePath) {
        copy.documentUrl = storagePublicUrl(copy.documentStoragePath);
        copy.documentData = copy.documentUrl;
      }
      return copy;
    });
  }

  function hydratePettyCash(pettyCash, mediaMap) {
    const src = pettyCash && typeof pettyCash === "object" ? { ...pettyCash } : emptyPetty();
    const hydrateList = (list) =>
      (Array.isArray(list) ? list : []).map((row) => {
        const copy = { ...(row || {}) };
        if (copy.checkPhotoUrl && isHttpUrl(copy.checkPhotoUrl)) {
          copy.checkPhoto = copy.checkPhotoUrl;
        } else if (copy.checkPhotoMediaId && mediaMap[copy.checkPhotoMediaId]) {
          copy.checkPhoto = mediaMap[copy.checkPhotoMediaId];
        }
        return copy;
      });
    src.expenses = hydrateList(src.expenses);
    src.deletedExpenses = hydrateList(src.deletedExpenses);
    return src;
  }

  function hydrateHr(hr, mediaMap) {
    const src = hr && typeof hr === "object" ? { ...hr } : emptyHr();
    src.applications = (Array.isArray(src.applications) ? src.applications : []).map((app) => {
      const copy = { ...(app || {}) };
      if (copy.photoUrl && isHttpUrl(copy.photoUrl)) {
        copy.photo = copy.photoUrl;
      } else if (copy.photoMediaId && mediaMap[copy.photoMediaId]) {
        copy.photo = mediaMap[copy.photoMediaId];
      }
      if (copy.cedulaPhotoUrl && isHttpUrl(copy.cedulaPhotoUrl)) {
        copy.cedulaPhoto = copy.cedulaPhotoUrl;
      } else if (copy.cedulaPhotoMediaId && mediaMap[copy.cedulaPhotoMediaId]) {
        copy.cedulaPhoto = mediaMap[copy.cedulaPhotoMediaId];
      }
      return copy;
    });
    return src;
  }

  function hydrateDepuracion(dep, mediaMap) {
    const src = dep && typeof dep === "object" ? { ...dep } : emptyDepuracion();
    src.candidates = (Array.isArray(src.candidates) ? src.candidates : []).map((row) => {
      const copy = { ...(row || {}) };
      if (copy.cedulaPhotoUrl && isHttpUrl(copy.cedulaPhotoUrl)) {
        copy.cedulaPhoto = copy.cedulaPhotoUrl;
      } else if (copy.cedulaPhotoMediaId && mediaMap[copy.cedulaPhotoMediaId]) {
        copy.cedulaPhoto = mediaMap[copy.cedulaPhotoMediaId];
      }
      return copy;
    });
    return src;
  }

  async function loadSplitParts() {
    const names = Object.keys(PART_DOCS);
    const docs = await Promise.all(
      names.map(async (n) => {
        try {
          return await getDoc(partPath(n));
        } catch (_) {
          return null;
        }
      })
    );
    const byName = {};
    names.forEach((n, i) => {
      byName[n] = docs[i];
    });
    return byName;
  }

  /** Solo lee updatedAt del documento main (barato, para sync en vivo). */
  async function peekCloudUpdatedAt() {
    if (!projectId || !apiKey) return null;
    try {
      const main = await getDoc(partPath("main"));
      if (!main) return { empty: true, updatedAt: null };
      const fields = main.fields || {};
      return {
        empty: false,
        updatedAt: (fields.updatedAt && fields.updatedAt.stringValue) || null,
      };
    } catch (_) {
      return null;
    }
  }

  /** Lectura ligera para fusionar antes de guardar (main + loans + empleados/hr/contab, sin fotos). */
  async function loadCloudForMerge() {
    if (!projectId || !apiKey) return null;
    let main = null;
    try {
      main = await getDoc(partPath("main"));
    } catch (_) {
      return null;
    }
    if (!main) {
      return {
        empty: true,
        messages: [],
        lva: {},
        loans: [],
        loanTrash: [],
        employees: [],
        hr: emptyHr(),
        contabilidad: emptyContabilidad(),
      };
    }
    const [loans, employees, hr, contab] = await Promise.all([
      getDoc(partPath("loans")).catch(() => null),
      getDoc(partPath("employees")).catch(() => null),
      getDoc(partPath("hr")).catch(() => null),
      getDoc(partPath("contabilidad")).catch(() => null),
    ]);
    const mainFields = main.fields || {};
    const loanFields = (loans && loans.fields) || {};
    const empFields = (employees && employees.fields) || {};
    const hrFields = (hr && hr.fields) || {};
    const contabFields = (contab && contab.fields) || {};
    return {
      empty: false,
      messages: parseArrayField(mainFields, "messagesJson"),
      lva: parseObjectField(mainFields, "lvaJson"),
      loans: loanFields.loansJson
        ? parseArrayField(loanFields, "loansJson")
        : parseArrayField(mainFields, "loansJson"),
      loanTrash: loanFields.loanTrashJson
        ? parseArrayField(loanFields, "loanTrashJson")
        : parseArrayField(mainFields, "loanTrashJson"),
      employees: empFields.employeesJson
        ? parseArrayField(empFields, "employeesJson")
        : parseArrayField(mainFields, "employeesJson"),
      hr: hrFields.hrJson ? parseObjectField(hrFields, "hrJson") : emptyHr(),
      contabilidad: contabFields.contabilidadJson
        ? parseObjectField(contabFields, "contabilidadJson")
        : emptyContabilidad(),
      partial: !loans || !employees,
    };
  }

  function fieldLen(doc, key) {
    const raw = doc && doc.fields && doc.fields[key] && doc.fields[key].stringValue;
    return raw ? raw.length : 0;
  }

  function hasSplitData(parts) {
    if (!parts || !parts.main) return false;
    const ver =
      (parts.main.fields &&
        parts.main.fields.schemaVersion &&
        parts.main.fields.schemaVersion.stringValue) ||
      "";
    if (Number(ver) >= 2) return true;
    // Si ya existen partes con contenido, son la fuente de verdad
    // (aunque un cliente viejo haya vuelto a hinchar rfs/main).
    if (fieldLen(parts.employees, "employeesJson") > 10) return true;
    if (fieldLen(parts.posts, "postsJson") > 10) return true;
    if (fieldLen(parts.pettyCash, "pettyCashJson") > 10) return true;
    if (fieldLen(parts.hr, "hrJson") > 10) return true;
    if (fieldLen(parts.depuracion, "depuracionJson") > 10) return true;
    if (fieldLen(parts.contabilidad, "contabilidadJson") > 10) return true;
    return false;
  }

  function decodeSplit(parts) {
    const main = (parts.main && parts.main.fields) || {};
    const posts = (parts.posts && parts.posts.fields) || {};
    const employees = (parts.employees && parts.employees.fields) || {};
    const loans = (parts.loans && parts.loans.fields) || {};
    const activity = (parts.activity && parts.activity.fields) || {};
    const petty = (parts.pettyCash && parts.pettyCash.fields) || {};
    const hr = (parts.hr && parts.hr.fields) || {};
    const dep = (parts.depuracion && parts.depuracion.fields) || {};
    const contab = (parts.contabilidad && parts.contabilidad.fields) || {};

    // Compat: si un part falta, intentar campo legacy en main
    const legacy = parts.main ? decodeLegacyMain(parts.main) : null;

    return {
      posts: posts.postsJson ? parseArrayField(posts, "postsJson") : (legacy && legacy.posts) || [],
      reports: parseArrayField(main, "reportsJson"),
      employees: employees.employeesJson
        ? parseArrayField(employees, "employeesJson")
        : (legacy && legacy.employees) || [],
      loans: loans.loansJson ? parseArrayField(loans, "loansJson") : (legacy && legacy.loans) || [],
      loanTrash: loans.loanTrashJson
        ? parseArrayField(loans, "loanTrashJson")
        : (legacy && legacy.loanTrash) || [],
      monorrielReports: parseArrayField(main, "monorrielReportsJson"),
      users: parseArrayField(main, "usersJson"),
      messages: parseArrayField(main, "messagesJson"),
      radio: parseObjectField(main, "radioJson"),
      activity: activity.activityJson
        ? parseArrayField(activity, "activityJson")
        : (legacy && legacy.activity) || [],
      lva: parseObjectField(main, "lvaJson"),
      pettyCash: petty.pettyCashJson
        ? parseObjectField(petty, "pettyCashJson")
        : (legacy && legacy.pettyCash) || emptyPetty(),
      hr: hr.hrJson ? parseObjectField(hr, "hrJson") : (legacy && legacy.hr) || emptyHr(),
      depuracion: dep.depuracionJson
        ? parseObjectField(dep, "depuracionJson")
        : (legacy && legacy.depuracion) || emptyDepuracion(),
      contabilidad: contab.contabilidadJson
        ? parseObjectField(contab, "contabilidadJson")
        : (legacy && legacy.contabilidad) || emptyContabilidad(),
      updatedAt: (main.updatedAt && main.updatedAt.stringValue) || null,
      schemaVersion: (main.schemaVersion && main.schemaVersion.stringValue) || SCHEMA_VERSION,
    };
  }

  async function hydrateBundle(bundle) {
    const mediaIds = collectMediaIds(bundle.employees, bundle.pettyCash, bundle.hr, bundle.depuracion);
    // Siempre hidratar: photoUrl de Storage → photo; legacy rfs_media si hay ids
    const mediaMap = mediaIds.length ? await loadMediaMap(mediaIds) : {};
    return {
      ...bundle,
      employees: hydrateEmployees(bundle.employees, mediaMap),
      pettyCash: hydratePettyCash(bundle.pettyCash, mediaMap),
      hr: hydrateHr(bundle.hr, mediaMap),
      depuracion: hydrateDepuracion(bundle.depuracion, mediaMap),
    };
  }

  async function healFatMainIfNeeded(parts) {
    try {
      if (!hasSplitData(parts) || !parts.main) return;
      const mainSize = JSON.stringify(parts.main).length;
      if (mainSize < 200000) return; // main sano
      const fields = parts.main.fields || {};
      await patchDoc(
        partPath("main"),
        {
          usersJson: fields.usersJson || { stringValue: "[]" },
          messagesJson: fields.messagesJson || { stringValue: "[]" },
          radioJson: fields.radioJson || { stringValue: "{}" },
          lvaJson: fields.lvaJson || { stringValue: "{}" },
          reportsJson: fields.reportsJson || { stringValue: "[]" },
          monorrielReportsJson: fields.monorrielReportsJson || { stringValue: "[]" },
          schemaVersion: { stringValue: SCHEMA_VERSION },
          updatedAt: fields.updatedAt || { stringValue: new Date().toISOString() },
          app: fields.app || { stringValue: "Reaction Force Security Ops" },
          postsJson: { stringValue: "[]" },
          employeesJson: { stringValue: "[]" },
          loansJson: { stringValue: "[]" },
          activityJson: { stringValue: "[]" },
          pettyCashJson: { stringValue: "{}" },
          hrJson: { stringValue: "{}" },
        }
      );
    } catch (_) {}
  }

  async function loadCloud() {
    if (!projectId || !apiKey) return null;

    const parts = await loadSplitParts();
    if (!parts.main) {
      return {
        posts: [],
        reports: [],
        employees: [],
        loans: [],
        loanTrash: [],
        monorrielReports: [],
        users: [],
        messages: [],
        radio: {},
        activity: [],
        lva: {},
        pettyCash: emptyPetty(),
        hr: emptyHr(),
        depuracion: emptyDepuracion(),
        contabilidad: emptyContabilidad(),
        updatedAt: null,
        empty: true,
        schemaVersion: SCHEMA_VERSION,
      };
    }

    let bundle;
    if (hasSplitData(parts)) {
      bundle = decodeSplit(parts);
      // Si un cliente viejo rehinchó main, liberarlo en segundo plano
      healFatMainIfNeeded(parts);
    } else {
      bundle = decodeLegacyMain(parts.main);
    }

    const hydrated = await hydrateBundle(bundle);
    const empty =
      !hydrated.posts.length &&
      !hydrated.employees.length &&
      !hydrated.users.length &&
      !(hydrated.pettyCash.expenses || []).length;
    return { ...hydrated, empty };
  }

  async function persistMediaJobs(jobs) {
    const list = jobs || [];
    // Evitar escribir vacíos; sí escribir cuando hay data
    await Promise.all(
      list
        .filter((j) => j && j.id && isHeavyMedia(j.data))
        .map((j) => putMedia(j.id, j))
    );
  }

  async function saveCloud(
    posts,
    reports,
    employees,
    loans,
    monorrielReports,
    users,
    messages,
    radio,
    activity,
    lva,
    pettyCash,
    hr,
    depuracion,
    contabilidad,
    loanTrash,
    options
  ) {
    if (!projectId || !apiKey) throw new Error("cloud not configured");
    const opts = options && typeof options === "object" ? options : {};

    const empPack = await stripEmployees(employees);
    const pettyPack = await stripPettyCash(pettyCash);
    const hrPack = await stripHr(hr);
    const depPack = await stripDepuracion(depuracion);
    const contabPack = stripContabilidad(contabilidad);
    await persistMediaJobs([
      ...empPack.mediaJobs,
      ...pettyPack.mediaJobs,
      ...hrPack.mediaJobs,
      ...depPack.mediaJobs,
      ...contabPack.mediaJobs,
    ]);

    const updatedAt = new Date().toISOString();
    const trashIds = [...new Set((loanTrash || []).map(String).filter(Boolean))].slice(0, 500);
    const mainFields = {
      usersJson: { stringValue: JSON.stringify(users || []) },
      messagesJson: { stringValue: JSON.stringify(messages || []) },
      radioJson: { stringValue: JSON.stringify(radio || {}) },
      reportsJson: { stringValue: JSON.stringify(reports || []) },
      monorrielReportsJson: { stringValue: JSON.stringify(monorrielReports || []) },
      schemaVersion: { stringValue: SCHEMA_VERSION },
      updatedAt: { stringValue: updatedAt },
      app: { stringValue: "Reaction Force Security Ops" },
      // Liberar campos legacy pesados del documento main
      postsJson: { stringValue: "[]" },
      employeesJson: { stringValue: "[]" },
      loansJson: { stringValue: "[]" },
      activityJson: { stringValue: "[]" },
      pettyCashJson: { stringValue: "{}" },
      hrJson: { stringValue: "{}" },
    };
    // Si skipLva: no tocar lvaJson remoto (evita borrar La Vega cuando no hubo fusión)
    if (!opts.skipLva) {
      mainFields.lvaJson = { stringValue: JSON.stringify(lva || {}) };
    }
    const mainMask = Object.keys(mainFields);
    const writes = [
      patchDoc(partPath("main"), mainFields, mainMask),
      patchDoc(partPath("posts"), {
        postsJson: { stringValue: JSON.stringify(posts || []) },
        updatedAt: { stringValue: updatedAt },
      }, ["postsJson", "updatedAt"]),
      patchDoc(partPath("employees"), {
        employeesJson: { stringValue: JSON.stringify(empPack.light || []) },
        updatedAt: { stringValue: updatedAt },
      }, ["employeesJson", "updatedAt"]),
      patchDoc(partPath("loans"), {
        loansJson: { stringValue: JSON.stringify(loans || []) },
        loanTrashJson: { stringValue: JSON.stringify(trashIds) },
        updatedAt: { stringValue: updatedAt },
      }, ["loansJson", "loanTrashJson", "updatedAt"]),
      patchDoc(partPath("activity"), {
        activityJson: { stringValue: JSON.stringify(activity || []) },
        updatedAt: { stringValue: updatedAt },
      }, ["activityJson", "updatedAt"]),
      patchDoc(partPath("pettyCash"), {
        pettyCashJson: { stringValue: JSON.stringify(pettyPack.light || emptyPetty()) },
        updatedAt: { stringValue: updatedAt },
      }, ["pettyCashJson", "updatedAt"]),
      patchDoc(partPath("hr"), {
        hrJson: { stringValue: JSON.stringify(hrPack.light || emptyHr()) },
        updatedAt: { stringValue: updatedAt },
      }, ["hrJson", "updatedAt"]),
      patchDoc(partPath("depuracion"), {
        depuracionJson: { stringValue: JSON.stringify(depPack.light || emptyDepuracion()) },
        updatedAt: { stringValue: updatedAt },
      }, ["depuracionJson", "updatedAt"]),
      patchDoc(partPath("contabilidad"), {
        contabilidadJson: { stringValue: JSON.stringify(contabPack.light || emptyContabilidad()) },
        updatedAt: { stringValue: updatedAt },
      }, ["contabilidadJson", "updatedAt"]),
    ];

    await Promise.all(writes);
    return { ok: true, schemaVersion: SCHEMA_VERSION, updatedAt, skippedLva: !!opts.skipLva };
  }

  /** Parche ligero solo de mensajes (documento main) */
  async function saveMessages(messages) {
    if (!projectId || !apiKey) throw new Error("cloud not configured");
    const body = {
      messagesJson: { stringValue: JSON.stringify(messages || []) },
      updatedAt: { stringValue: new Date().toISOString() },
    };
    return patchDoc(partPath("main"), body, ["messagesJson", "updatedAt"]);
  }

  window.RFSCloudApi = {
    loadCloud,
    loadCloudForMerge,
    peekCloudUpdatedAt,
    saveCloud,
    saveMessages,
    deleteMedia,
    deleteStoragePath,
    storageEnabled,
    storageBucket: () => storageBucket,
    decodeDoc: decodeLegacyMain,
    SCHEMA_VERSION,
  };
})();
