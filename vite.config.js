/* eslint-disable no-undef */
/**
 * @file vite.config.js
 * @description Configuration de Vite pour le build de l'application
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Configuration Vite et PWA
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: [
                "favicon.ico",
                "robots.txt",
                "apple-touch-icon.png",
            ],
            manifest: {
                name: "MathMemo - Mémorisation des faits numériques",
                short_name: "MathMemo",
                description:
                    "Application de mémorisation des faits numériques pour les élèves de cycle 2",
                theme_color: "#3b82f6",
                background_color: "#f9fafb",
                display: "standalone",
                scope: "/",
                start_url: "/",
                orientation: "portrait",
                icons: [
                    {
                        src: "icons/icon-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "icons/icon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "icons/icon-512x512-maskable.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
            workbox: {
                // Options Workbox pour la gestion du cache
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google-fonts-cache",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google-fonts-styles",
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|mp3|wav)$/,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "assets-cache",
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
                            },
                        },
                    },
                    {
                        urlPattern: /\.(?:js|css)$/,
                        handler: "StaleWhileRevalidate",
                        options: {
                            cacheName: "static-resources",
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 * 24, // 1 jour
                            },
                        },
                    },
                    {
                        urlPattern: /^https?:\/\/api\..+$/,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "api-cache",
                            networkTimeoutSeconds: 10,
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60, // 1 heure
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            "@": "/src", // Alias pour faciliter les imports
        },
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        sourcemap: process.env.NODE_ENV !== "production",
    },
    server: {
        port: 3000,
        open: true,
    },
});
