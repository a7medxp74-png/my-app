const CACHE='commit-shell-v1';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/login','/manifest.webmanifest','/icons/icon-192.svg','/icons/icon-512.svg']))));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET'||new URL(r.url).pathname.startsWith('/api/'))return;event.respondWith(fetch(r).catch(()=>caches.match(r).then(x=>x||caches.match('/login')))});
