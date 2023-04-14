// Caché de la aplicación
const CACHE_NAME = 'mi-app-cache';

// Archivos a cachear
const urlsToCache = [
  '/',
  '/css/style.css',
  '/js/main.js',
  '/img/logo.png'
];

// Instalación del Service Worker
self.addEventListener('install', function(event) {
  // Realizamos la instalación del caché
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Caché abierto');
        // Agregamos los archivos a cachear
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker activado');
});

// Interceptamos la petición y retornamos el archivo desde caché
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Si lo encontramos en caché, lo retornamos
        if (response) {
          console.log('Archivo recuperado desde caché');
          return response;
        }
        // Si no está en caché, lo pedimos al servidor
        return fetch(event.request);
      })
  );
});

// Eliminamos cachés antiguos
self.addEventListener('activate', function(event) {

  const cacheWhitelist = ['mi-app-cache'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
