const CACHE_NAME = "mark-etf-tools-v1";

const URLS_TO_CACHE = [
  "./",
  "./etf-app-home.html",
  "./reverse.html",
  "./etf-tracker.html",
  "./etf-dividend-wall.html",
  "./newbie-village.html",
  "./manifest.json",
  "./sw.js"
];

// 安裝：預先快取
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE).catch(err => {
        console.log("[SW] 預先快取失敗：", err);
      });
    })
  );
  self.skipWaiting();
});

// 啟用：清除舊快取
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 取得：快取優先，沒有再走網路
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then(networkResponse => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
          return networkResponse;
        })
        .catch(() => {
          // 離線又沒快取 → 給簡單離線頁
          if (request.headers.get("accept")?.includes("text/html")) {
            return new Response(`
              <!doctype html>
              <html lang="zh-Hant">
              <head>
                <meta charset="UTF-8" />
                <title>暫時離線｜馬克 ETF 工具箱</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
              </head>
              <body style="font-family:-apple-system,BlinkMacSystemFont,'Noto Sans TC',sans-serif;background:#020304;color:#f5f2e9;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1.5rem;text-align:center;">
                <div>
                  <h1 style="font-size:1.4rem;margin-bottom:0.75rem;">📡 暫時離線了</h1>
                  <p style="font-size:0.95rem;line-height:1.6;margin-bottom:0.9rem;">
                    看起來目前沒有網路連線。<br />
                    已經快取過的 ETF 工具頁面，重新整理後還是可以打開。<br />
                    若要更新最新配息資料，請再連回網路試試。
                  </p>
                </div>
              </body>
              </html>
            `, {
              headers: { "Content-Type": "text/html; charset=utf-8" }
            });
          }
        });
    })
  );
});
