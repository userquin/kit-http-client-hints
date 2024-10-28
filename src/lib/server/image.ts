import type { RequestEvent } from '@sveltejs/kit'
import { read } from '$app/server'
// import sharp  from 'sharp'

export async function handle(request: RequestEvent) {
  const { path } = request.params
  const file = await read(`src/routes/${path}.md`)
  return {
    body: file,
    headers: {
      'content-type': 'text/markdown'
    }
  }
}
