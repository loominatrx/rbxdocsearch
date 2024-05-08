import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';

const header = {
	'Accept': 'application/vnd.github+json',
	'Authorization': 'Bearer ' + Bun.env.GITHUB_TOKEN,
	'X-GitHub-Api-Version': '2022-11-28',
};

const instance_path = path.join(path.dirname(Bun.main), 'references', 'engine', 'classes');
const globals_path = path.join(path.dirname(Bun.main), 'references', 'engine', 'globals');
const libraries_path = path.join(path.dirname(Bun.main), 'references', 'engine', 'libraries');

fs.mkdirSync(instance_path, { recursive: true });
fs.mkdirSync(globals_path, { recursive: true });
fs.mkdirSync(libraries_path, { recursive: true });

axios.request({
	baseURL: 'https://api.github.com/repos/Roblox/creator-docs/contents',
	url: '/content/en-us/reference/engine/classes',
	header: header,
	responseType: 'json',
}).then((response) => {
	const files = response.data;
	for (const data of files) {
		const filename = data.name;
		const download_url = data.download_url;
		axios.request({
			url: download_url,
			header: header,
			responseType: 'blob',
		}).then((blob) => {
			fs.writeFileSync(path.join(instance_path, filename), blob.data);
			console.log(`File saved at ${path.join(instance_path, filename)}`);
		});
	}
});

axios.request({
	baseURL: 'https://api.github.com/repos/Roblox/creator-docs/contents',
	url: '/content/en-us/reference/engine/globals',
	header: header,
	responseType: 'json',
}).then((response) => {
	const files = response.data;
	for (const data of files) {
		const filename = data.name;
		const download_url = data.download_url;
		axios.request({
			url: download_url,
			header: header,
			responseType: 'blob',
		}).then((blob) => {
			fs.writeFileSync(path.join(globals_path, filename), blob.data);
			console.log(`File saved at ${path.join(globals_path, filename)}`);
		});
	}
});

axios.request({
	baseURL: 'https://api.github.com/repos/Roblox/creator-docs/contents',
	url: '/content/en-us/reference/engine/libraries',
	header: header,
	responseType: 'json',
}).then((response) => {
	const files = response.data;
	for (const data of files) {
		const filename = data.name;
		const download_url = data.download_url;
		axios.request({
			url: download_url,
			header: header,
			responseType: 'blob',
		}).then((blob) => {
			fs.writeFileSync(path.join(libraries_path, filename), blob.data);
			console.log(`File saved at ${path.join(libraries_path, filename)}`);
		});
	}
});