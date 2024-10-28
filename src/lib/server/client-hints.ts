import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { prepareHtmlRequest } from '$lib/server/extractor'
import { options } from '../../http-client-hints'


const detect: Handle = async ({ event, resolve }) => {
  const url = event.request.url
  console.log(`Requesting ${url} (data=${event.isDataRequest}) => ${options.serverImages!.some(r => url.match(r))}`)
  try {
    await prepareHtmlRequest(event)
  }
  catch (err) {
    console.error(err)
  }
  return await resolve(event)
}

const addHeaders: Handle = async  ({ event, resolve }) => {
  const result = await resolve(event);
  if (event.locals.responseHeaders) {
    for (const [key, value] of event.locals.responseHeaders.entries()) {
      result.headers.set(key, value)
    }
  }
  return result;
}

export const handle = sequence(addHeaders, detect);
