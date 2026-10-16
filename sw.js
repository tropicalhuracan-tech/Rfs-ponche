const CACHE = "rfs-ops-v138";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "styles.css?v=138",
  "app.js",
  "app.js?v=138",
  "hr.js",
  "hr.js?v=138",
  "depuracion.js",
  "depuracion.js?v=138",
  "contabilidad.js",
  "contabilidad.js?v=138",
  "quotes.js",
  "quotes.js?v=138",
  "cloud.js",
  "cloud.js?v=138",
  "cloud-config.js",
  "cloud-config.js?v=138",
  "monorriel-data.js",
  "monorriel-data.js?v=138",
  "reaction-payroll-data.js",
  "reaction-payroll-data.js?v=138",
  "manifest.json",
  "logo.jpg",
  "logo.jpg?v=138",
  "quote-assets/clientes-rfs-1.jpg",
  "quote-assets/clientes-rfs-2.jpg",
  "import-posts.json",
  "icons/icon-192.png",
  "icons/icon-256.png",
  "icons/icon-512.png",
  "icons/icon-180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const path = url.pathname.split("/").pop() || "";
  const isShell =
    path === "" ||
    path === "index.html" ||
    path.startsWith("styles.css") ||
    path.startsWith("app.js") ||
    path.startsWith("hr.js") ||
    path.startsWith("depuracion.js") ||
    path.startsWith("contabilidad.js") ||
    path.startsWith("quotes.js") ||
    path.includes("quote-assets") ||
    path.startsWith("cloud") ||
    path.startsWith("monorriel") ||
    path.startsWith("reaction") ||
    path.startsWith("sw.js");
  if (isShell) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => cached))
  );
});
