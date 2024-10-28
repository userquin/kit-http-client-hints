import type { PageServerLoad } from './$types'
import {prepareHtmlRequest} from '$lib/server/extractor'



export const load: PageServerLoad = async (event) => {
    try {
        await prepareHtmlRequest(event)
    }
    catch (e) {
        console.error(e)
    }
    let {
        httpClientHintsOptions,
        // eslint-disable-next-line prefer-const
        httpClientHints,
    } = event.locals

    if (httpClientHintsOptions && httpClientHintsOptions.serverImages) {
        httpClientHintsOptions = {
            ...httpClientHintsOptions,
            serverImages: httpClientHintsOptions.serverImages.map(r => r.source),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
    }

    return JSON.parse(JSON.stringify({
        httpClientHintsOptions,
        httpClientHints,
    }))
}
