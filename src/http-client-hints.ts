import type { ResolvedHttpClientHintsOptions } from 'http-client-hints'

export const options: ResolvedHttpClientHintsOptions = {
    detectBrowser: true,
    detectOS: 'windows-11',
    userAgent: ['architecture', 'bitness', 'model', 'platformVersion', 'fullVersionList'],
    network: ['savedata', 'downlink', 'ect', 'rtt'],
    device: ['memory'],
    critical: {
        width: true,
        viewportSize: true,
        prefersColorScheme: true
    },
    serverImages: [/\.(png|jpeg|jpg|webp|avif|tiff|gif)$/]
}
