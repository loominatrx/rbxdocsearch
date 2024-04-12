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
	if (params.length === 0) return null;

	const p = [];
	params.forEach(element => {
		const description = parseDescription(element.summary);
		p.push({
			name: `\`${element.type}\` ${element.name}`,
			value: `default: \`${(element.default !== null || element.default !== undefined || element.default !== '') ? element.default : 'nil'}\`\n\n${description}`,
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

export default {
	parseDescription: parseDescription,
	parseParameters: parseParameters,
	parseReturnedValue: parseReturnedValues,
	removeMaskedLinks: removeMaskedLinks,

	baseUrl: baseUrl,
	classesUrl: classesUrl,
	datatypeUrl: datatypeUrl,
};