import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	logLevel: 'info',
	plugins: [sveltekit()]
};

export default config;
