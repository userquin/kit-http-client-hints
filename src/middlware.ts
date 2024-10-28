import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { lstat, readFile } from 'node:fs/promises'
import { options } from './http-client-hints'
import {
    extractBrowserHints,
    extractCriticalHints,
    extractDeviceHints,
    extractNetworkHints,
    type HttpClientHintsState
} from 'http-client-hints'
import { parseUserAgent } from 'detect-browser-es'
import sharp from 'sharp'

const critical = !!options.critical
const device = options.device.length > 0
const network = options.network.length > 0
const detect = options.detectOS || options.detectBrowser || options.userAgent.length > 0

const staticFolder = resolve(fileURLToPath(import.meta.url), '../../static')

export function devMiddleware(): Plugin {
    return <Plugin>{
        name: 'dev-middleware',
        apply: 'serve',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const url = req.url
                if (url) {
                    const headers = req.headers
                    function builder() {
                        const requestHeaders: Record<string, string> = {}
                        for (const [key, value] of Object.entries(headers)) {
                            if (!value)
                                continue
                            if (Array.isArray(value)) {
                                if (value.length > 0) {
                                    requestHeaders[key] = value[0]
                                }
                            }
                            else {
                                requestHeaders[key] = value
                            }
                        }
                        return requestHeaders
                    }
                    const clientHints = await extractImageClientHints(
                        url,
                        builder
                    )
                    if (clientHints) {
                        console.log('dev-image', url, clientHints?.httpClientHints.critical)
                        const {
                            widthAvailable = false,
                            width = -1,
                        } = clientHints.httpClientHints.critical ?? {}
                        if (widthAvailable && width > -1) {
                            const image = await convertImage(url, width)
                            if (image) {
                                console.log('dev-image:Sec-CH-Width:', width)
                                res.setHeader('Vary', 'Sec-CH-Width')
                                const contentType = url.endsWith('.webp')
                                    ? 'image/webp'
                                    : url.endsWith('.jpeg') || url.endsWith('.jpg')
                                        ? 'image/jpeg'
                                        : 'image/png'
                                res.setHeader('Content-Type', contentType)
                                res.setHeader('Content-Length', image.length)
                                res.end(image)
                                return
                            }
                        }
                    }
                }
                next()
            })
        }
    }
}

async function convertImage(path: string, width: number) {
    /* try {
      const image = await readAsset(path)
      if (image) {
        return await sharp(image).resize({ width }).toBuffer()
      }
    }
    catch (e) {
      // just ignore
      console.error('WTF', e)
    } */

    // return undefined
    if (path.startsWith('/')) {
        path = path.slice(1)
    }
    // const folders = appConfig.publicAssets
    // let image: string
    // for (const folder of folders) {
    try {
        const image = resolve(staticFolder, path)
        const stats = await lstat(image)
        if (stats.isFile()) {
            return await sharp(await readFile(image)).resize({width}).toBuffer()
        }
    } catch {
        // just ignore
    }
}

async function extractImageClientHints(
  url: string,
  headersBuilder: () => Record<string, string>,
) {

    // expose the client hints in the context
    if (options.serverImages?.some(r => url.match(r))) {
        const headers = headersBuilder()
        const userAgentHeader = headers['user-agent']
        const requestHeaders: { [key in Lowercase<string>]?: string } = {}
        for (const [key, value] of Object.entries(headers)) {
            requestHeaders[key.toLowerCase() as Lowercase<string>] = value
        }
        const userAgent = userAgentHeader
            ? parseUserAgent(userAgentHeader)
            : null
        const clientHints: HttpClientHintsState = {}
        if (detect) {
            clientHints.browser = await extractBrowserHints(options, requestHeaders as Record<string, string>, userAgentHeader ?? undefined)
        }
        if (device) {
            clientHints.device = extractDeviceHints(options, requestHeaders, userAgent)
        }
        if (network) {
            clientHints.network = extractNetworkHints(options, requestHeaders, userAgent)
        }
        if (critical) {
            clientHints.critical = extractCriticalHints(options, requestHeaders, userAgent)
        }
        return {
            httpClientHintsOptions: options,
            httpClientHints: clientHints,
        }
    }
}

