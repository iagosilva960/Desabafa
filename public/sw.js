// Service Worker para Desabafa Aí PWA
const CACHE_NAME = 'desabafa-ai-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('Service Worker: Erro ao cachear arquivos:', error);
      })
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Apenas interceptar requisições GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Não interceptar requisições para APIs externas
  if (event.request.url.includes('api.openai.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se encontrado
        if (response) {
          return response;
        }

        // Senão, busca na rede
        return fetch(event.request)
          .then((response) => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta para cachear
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Em caso de erro de rede, retorna página offline para navegação
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Sincronização em background (para futuras implementações)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Sincronização em background');
    // Aqui poderia implementar sincronização de dados quando voltar online
  }
});

// Notificações push (para futuras implementações)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'Abrir App',
          icon: '/icon-192.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icon-192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Clique em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

