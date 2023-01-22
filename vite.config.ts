import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
//import { viteSingleFile } from "vite-plugin-singlefile";

const config: UserConfig = {
	build: {
		minify: true
	},
	plugins: [
		sveltekit()
		//	viteSingleFile({ removeViteModuleLoader: false })
	]
};

export default config;
