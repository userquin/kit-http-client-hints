// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { HttpClientHintsState, ResolvedHttpClientHintsOptions } from 'http-client-hints'
import { parseUserAgent } from 'detect-browser-es'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			requestHeaders?: Record<string, string>
			responseHeaders?: Headers
			httpClientHints?: HttpClientHintsState
			httpClientHintsOptions?: ResolvedHttpClientHintsOptions
			httpClientHintsUserAgent?: ReturnType<typeof parseUserAgent>
		}
		interface PageData {
			httpClientHints?: HttpClientHintsState
			httpClientHintsOptions?: ResolvedHttpClientHintsOptions
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
