import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                skipWaiting: true,
                clientsClaim: true,
            },
            manifest: {
                name: 'HEXCode',
                short_name: 'HEXCode',
                description: 'Guess the secret hex color code',
                theme_color: '#1a1a1a',
                background_color: '#1a1a1a',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: 'images/pwa-64x64.png',
                        sizes: '64x64',
                        type: 'image/png',
                    },
                    {
                        src: 'images/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'images/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'images/maskable-icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
        }),
    ],
});
