import {defineConfig} from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import {VitePWA} from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [react(), tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true
            }
        })],
    server: {
        // allowedHosts: ['*', 'ywmn4g-92-37-143-11.ru.tuna.am'],
    },
})
