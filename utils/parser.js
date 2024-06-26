import jsYaml from 'js-yaml';
import fs from 'node:fs';
import path from 'node:path';
import { EmbedBuilder } from 'discord.js';

const basePath = path.join(Bun.main, 'references', 'engine');

const baseUrl = 'https://create.roblox.com/docs';
const classesUrl = baseUrl + '/reference/engine/classes';
const datatypeUrl = baseUrl + '/reference/engine/datatypes';

const classReferenceRegex = /`Class\.(?<Instance>[a-zA-Z0-9]+)[.:](?<Index>[a-zA-Z0-9]+)[()]*\|?(?<String>[a-zA-Z0-9()]+)?`/g;
const datatypeReferenceRegex = /`Datatype\.(?<Datatype>[a-zA-Z0-9]+)[.:](?<Index>[a-zA-Z0-9]+)[()]*`/g;
const classRegex = /`Class\.(?<Instance>[a-zA-Z]+)\|?(?<String>[a-zA-Z0-9]+)?`/g;

const parseDescription = (desc) => {
	let description = desc;
	description = description.replace(/(\.\.\/\.\.\/\.\.)/g, baseUrl).replace(/(index)?\.md/g, '');
	description = description.replace(classReferenceRegex, (_, instance, index, string) => {
		return `[\`${string ?? `${instance}.${index}`}\`](${classesUrl}/${instance}#${index})`;
	});
	description = description.replace(classRegex, (_, instance, string) => {
		return `[\`${string ?? instance}\`](${classesUrl}/${instance})`;
	});
	description = description.replace(datatypeReferenceRegex, (match, datatype, index) => {
		if (index !== undefined && match.endsWith('()')) {
			return `[\`${datatype}.${index}()\`](${datatypeUrl}/${datatype}#${index})`;
		} else if (index !== undefined) {
			return `[\`${datatype}.${index}\`](${datatypeUrl}/${datatype}#${index})`;
		} else {
			return `[\`${datatype}]\`(${datatypeUrl}/${datatype})`;
		}
	});
	return description;
};

const parseParameters = (params) => {
	const p = [];
	params.forEach(element => {
		const description = parseDescription(element.summary);
		p.push({
			name: `\`${element.type}\` ${element.name}`,
			value: `default: \`${(element.default !== '') ? element.default : 'nil'}\`\n${description}`,
			inline: true,
		});
	});

	return p;
};

const parseReturnedValues = (values) => {
	const p = [];

	values.forEach(element => {
		const summary = element.summary.length >= 1 ? parseDescription(element.summary) : '*No summary was given.*';
		p.push({
			name: `\`${element.type}\``,
			value: `${summary}`,
			inline: true,
		});
	});

	return p;
};

const removeMaskedLinks = (desc) => {
	let description = desc;
	description = description.replace(/\[([a-zA-Z0-9` -.]+)\]\([http(s)?://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)\)/g, (match, string) => {
		return string;
	});
	return description;
};


const makeReferenceEmbed = (instance, whichInfoToShow, query, type = 'classes') => {
	const embed = new EmbedBuilder();
	const embeds = [embed];
	const filepath = path.join(basePath, type, instance + '.yaml');

	if (!fs.existsSync(filepath)) {
		embed
			.setTitle('Oops')
			.setDescription(`The requested instance \`${instance}\` is not found, perhaps look it up on Roblox docs?`);
		return embeds;
	}

	let details = jsYaml.load(fs.readFileSync(filepath));
	const predicate = element => element.name.endsWith(query);
	if (whichInfoToShow === 'method') {
		details = details.methods.find(predicate);
	} else if (whichInfoToShow === 'event') {
		details = details.events.find(predicate);
	} else if (whichInfoToShow === 'property') {
		details = details.properties.find(predicate);
	} else if (whichInfoToShow === 'function') {
		details = details.functions.find(predicate);
	}

	const url = `${classesUrl}/${instance}#${query}`;

	// redirect relative links to docs link
	let description = parseDescription(details.description);
	const truncatedNote = `*You are now viewing a summary of the description. If you want a better understanding of this Instance, [please open this documentation page instead.](${url})*`;

	// handle description length
	if (description.length > 4096) {
		// masked links tends to take space, so we remove them
		// completely IF the text hit > 4096 characters
		description = removeMaskedLinks(description);
	} else if (description.length === 0) {
		// fallback to the sumamry if there is no description to show
		description = parseDescription(details.summary) + `\n*${truncatedNote}*`;
	} else if (details.summary.length === 0) {
		// inform the user that there is no description available
		description = `*No description available, [you may open this documentation page instead.](${url})*`;
	}

	// fallback to summary if the description is still longer than
	// 4096 characters OR has html tags (like in Player:GetJoinData())
	// because discord doesn't understand html tags, yet...
	if (description.length > 4096 || description.match(/<[^>]*>/g)) {
		description = parseDescription(details.summary) + `\n${truncatedNote}`;
	}

	const info = [];
	if (type === 'classes') {
		const hasTags = details.tags.length >= 1;
		if (hasTags) {
			info.push(`Tags: \`${details.tags.join(', ')}\``);
		}

		const hasSecurityTag = details.security !== undefined;
		if (hasSecurityTag) {
			const isObject = details.security instanceof Object &&
				details.security.read !== undefined &&
				details.security.write !== undefined;
			const isString = details.security instanceof String &&
				details.security !== '';

			if (isObject) {
				info.push(`Security: \`read:${details.security.read}, write:${details.security.write}\``);
			} else if (isString) {
				info.push(`Security: \`${details.security}\``);
			}
		}

		const hasThreadSafetyTag = details.thread_safety !== undefined;
		if (hasThreadSafetyTag) {
			info.push(`ThreadSafety: \`${details.thread_safety}\``);
		}
	}

	const title = type !== 'classes' ? query : details.name + (whichInfoToShow === 'method' ? '()' : '');

	embed
		.setTitle(title)
		.setURL(url)
		.setDescription(`${info.length > 0 ? info.join(' | ') + '\n—' : ''} \n${description}`);

	if ((whichInfoToShow === 'method' || whichInfoToShow === 'function' || whichInfoToShow === 'event') && details.parameters.length >= 1) {
		const parameterEmbed = new EmbedBuilder()
			.setTitle('Parameters')
			.setFields(parseParameters(details.parameters));
		embeds.push(parameterEmbed);
	}

	if ((whichInfoToShow === 'method' || whichInfoToShow === 'function') && (details.returns.length >= 1 && details.returns[0].type !== 'void')) {
		const returnEmbed = new EmbedBuilder()
			.setTitle('Returned value')
			.setFields(parseReturnedValues(details.returns));
		embeds.push(returnEmbed);
	}

	return embeds;
};

export default {
	parseDescription: parseDescription,
	parseParameters: parseParameters,
	parseReturnedValues: parseReturnedValues,
	removeMaskedLinks: removeMaskedLinks,
	makeReferenceEmbed: makeReferenceEmbed,

	baseUrl: baseUrl,
	classesUrl: classesUrl,
	datatypeUrl: datatypeUrl,
};