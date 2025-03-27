import {defineConfig} from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import {VitePWA} from 'vite-plugin-pwa'

export default defineConfig({
    server: {
        port: 3000,
        host: true,
        allowedHosts: ['localhost:5000'],
    },
    plugins: [react(), tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true
            }
        })],
})
