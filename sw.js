var V="rn-v1",SHELL=["./","index.html","privacidade.html","site.webmanifest","assets/css/style.css","assets/css/extra.css","assets/js/app.js","assets/js/backend.js","assets/js/config.js"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(V).then(function(c){return Promise.all(SHELL.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==V}).map(function(x){return caches.delete(x)}))}).then(function(){return clients.claim()}))});
self.addEventListener("fetch",function(e){var r=e.request,u=new URL(r.url);
  if(r.method!=="GET"||u.origin!==location.origin||u.pathname.indexOf("admin")>-1)return; // Supabase, CDN e painel: sempre direto da rede
  e.respondWith(fetch(r).then(function(res){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)});return res}).catch(function(){return caches.match(r).then(function(m){return m||caches.match("index.html")})}))});
