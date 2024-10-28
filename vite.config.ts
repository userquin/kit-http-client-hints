import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { devMiddleware } from './src/middlware';

export default defineConfig({
	plugins: [devMiddleware(), sveltekit()]
});
