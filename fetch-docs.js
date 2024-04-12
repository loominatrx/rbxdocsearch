import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';

const header = {
	'Accept': 'application/vnd.github+json',
	'Authorization': 'Bearer ' + Bun.env.GITHUB_TOKEN,
	'X-GitHub-Api-Version': '2022-11-28',
};

const filepath = path.join(path.dirname(Bun.main), 'references', 'engine', 'classes');
fs.mkdirSync(filepath, { recursive: true });

axios.request({
	baseURL: 'https://api.github.com/repos/Roblox/creator-docs/contents',
	url: '/content/en-us/reference/engine/classes',
	header: header,
	responseType: 'json',
}).then((response) => {
	console.log('Get response!');
	const files = response.data;
	for (const data of files) {
		const filename = data.name;
		const download_url = data.download_url;
		axios.request({
			url: download_url,
			header: header,
			responseType: 'blob',
		}).then((blob) => {
			fs.writeFileSync(path.join(filepath, filename), blob.data);
			console.log(`File saved at ${path.join(filepath, filename)}`);
		});
	}
});