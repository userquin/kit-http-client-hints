import {
    extractBrowserHints,
    extractCriticalHints,
    extractDeviceHints,
    extractNetworkHints,
} from 'http-client-hints'
import type {
    HttpClientHintsState,
    ResolvedHttpClientHintsOptions
} from 'http-client-hints'
import { parseUserAgent } from 'detect-browser-es'
import { options } from '../../http-client-hints'
import type {RequestEvent} from "@sveltejs/kit";

function writeHeaders(responseHeaders: Headers, headers: Record<string, string[]>) {
    for (const [key, value] of Object.entries(headers)) {
        if (value) {
            const entry = responseHeaders.get(key)
            const headerValue = Array.isArray(value) ? value.join(', ') : value
            if (entry) {
                responseHeaders.set(key, `${entry}, ${headerValue}`)
            }
            else {
                responseHeaders.set(key, headerValue)
            }
        }
    }
}

async function detectBrowser(
    requestHeaders: Record<string, string>,
    responseHeaders: Headers,
    httpClientHintsOptions: ResolvedHttpClientHintsOptions,
    state: HttpClientHintsState,
    userAgentHeader?: string
) {
    const browser = await extractBrowserHints(
        httpClientHintsOptions,
        requestHeaders,
        userAgentHeader ?? undefined,
        (headers) => writeHeaders(
            responseHeaders,
            headers
        )
    )

    if (browser) {
        state.browser = browser
    }
}
function detectCritical(
    requestHeaders: Record<string, string>,
    responseHeaders: Headers,
    httpClientHintsOptions: ResolvedHttpClientHintsOptions,
    state: HttpClientHintsState,
    userAgent?: ReturnType<typeof parseUserAgent>
) {
    if (!userAgent)
        return

    state.critical = extractCriticalHints(
        httpClientHintsOptions,
        requestHeaders,
        userAgent,
        (headers) => writeHeaders(responseHeaders, headers),
        /*(cookieName, path, expires, themeName) => {
          useCookie(cookieName, {
            path,
            expires,
            sameSite: 'lax',
          }).value = themeName
        },*/
    )
}
function detectNetwork(
    requestHeaders: Record<string, string>,
    responseHeaders: Headers,
    httpClientHintsOptions: ResolvedHttpClientHintsOptions,
    state: HttpClientHintsState,
    userAgent?: ReturnType<typeof parseUserAgent>
) {
    if (!userAgent)
        return

    state.network = extractNetworkHints(
        httpClientHintsOptions,
        requestHeaders,
        userAgent,
        (headers) => writeHeaders(responseHeaders, headers)
    )
}
function detectDevice(
    requestHeaders: Record<string, string>,
    responseHeaders: Headers,
    httpClientHintsOptions: ResolvedHttpClientHintsOptions,
    state: HttpClientHintsState,
    userAgent?: ReturnType<typeof parseUserAgent>
) {
    if (!userAgent)
        return

    state.device = extractDeviceHints(
        httpClientHintsOptions,
        requestHeaders,
        userAgent,
        (headers) => writeHeaders(responseHeaders, headers)
    )
}

export async function prepareHtmlRequest(event: RequestEvent) {
    const headers = event.request.headers
    const userAgentHeader = headers.get('user-agent')
    const requestHeaders: Record<string, string> = {}
    const responseHeaders = new Headers()
    for (const [key, value] of headers.entries()) {
        requestHeaders[key] = value
    }
    event.locals.responseHeaders = responseHeaders
    event.locals.httpClientHints = {}
    event.locals.httpClientHintsOptions = options
    event.locals.httpClientHintsUserAgent = userAgentHeader
        ? parseUserAgent(userAgentHeader)
        : null

    await detectBrowser(
        requestHeaders,
        responseHeaders,
        event.locals.httpClientHintsOptions,
        event.locals.httpClientHints,
        userAgentHeader ?? undefined,
    )
    detectCritical(
        requestHeaders,
        responseHeaders,
        event.locals.httpClientHintsOptions,
        event.locals.httpClientHints,
        event.locals.httpClientHintsUserAgent,
    )
    detectDevice(
        requestHeaders,
        responseHeaders,
        event.locals.httpClientHintsOptions,
        event.locals.httpClientHints,
        event.locals.httpClientHintsUserAgent,
    )
    detectNetwork(
        requestHeaders,
        responseHeaders,
        event.locals.httpClientHintsOptions,
        event.locals.httpClientHints,
        event.locals.httpClientHintsUserAgent,
    )
}
