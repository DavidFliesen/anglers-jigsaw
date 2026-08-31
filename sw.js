const CACHE_NAME = "anglers-jigsaw-v3-9-9";
const SHELL = ["./","./index.html","./manifest.json","./css/styles.css","./js/app.js","./js/data.js"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const r=e.request,u=new URL(r.url),networkFirst=r.mode==="navigate"||["/index.html","/css/styles.css","/js/app.js","/js/data.js"].some(p=>u.pathname.endsWith(p));
  if(networkFirst){e.respondWith(fetch(r).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(r,copy));return res}).catch(()=>caches.match(r)));return}
  e.respondWith(caches.match(r).then(c=>c||fetch(r)));
});
