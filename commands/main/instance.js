import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import parser from '../../utils/parseDescription';
import fs from 'node:fs';
import path from 'node:path';
import jsYaml from 'js-yaml';

const basePath = path.join(Bun.main, 'references', 'engine', 'classes');
const classesUrl = parser.classesUrl;

export default {
	data: new SlashCommandBuilder()
		.setName('instance')
		.setDescription('get instance details')
		.addSubcommand(subcommand =>
			subcommand
				.setName('description')
				.setDescription('describe the description of the said instance')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('the instance you want to look for')
						.setRequired(true)
						.setAutocomplete(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('event')
				.setDescription('describes an event for the said instance')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('the instance you want to look for')
						.setRequired(true)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('event')
						.setDescription('the event you want to look for')
						.setRequired(true)
						.setAutocomplete(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('method')
				.setDescription('describes an method/function for the said instance')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('the instance you want to look for')
						.setRequired(true)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('method')
						.setDescription('the method/function you want to look for')
						.setRequired(true)
						.setAutocomplete(true)),
		),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		let choices = [];

		if (focusedOption.name === 'name') {
			choices = fs.readdirSync(basePath).map(element => {
				return element.replace('.yaml', '');
			});
		} else if (focusedOption.name === 'event') {
			const instance = interaction.options.getString('name');
			if (instance) {
				const filepath = path.join(basePath, instance + '.yaml');
				const details = jsYaml.load(fs.readFileSync(filepath));

				choices = details.events.map(element => {
					return element.name.replace(`${instance}.`, '');
				});
			} else {
				choices = [];
			}
		} else if (focusedOption.name === 'method') {
			const instance = interaction.options.getString('name');
			if (instance) {
				const filepath = path.join(basePath, instance + '.yaml');
				const details = jsYaml.load(fs.readFileSync(filepath));
				choices = details.methods.map(element => {
					return element.name.replace(`${instance}:`, '');
				});
			} else {
				choices = [];
			}
		}

		const value = focusedOption.value.trim().toLowerCase();
		const filtered = choices.filter(choice => choice.toLowerCase().startsWith(value)).slice(0, 24);
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},
	async execute(interaction) {
		await interaction.deferReply();
		console.log(`subcommand used: ${interaction.options.getSubcommand()}`);
		if (interaction.options.getSubcommand() === 'description') {
			const instance = interaction.options.getString('name');
			const embed = new EmbedBuilder();
			const filepath = path.join(basePath, instance + '.yaml');

			if (!fs.existsSync(filepath)) {
				embed
					.setTitle('Oops')
					.setDescription(`The requested instance \`${instance}\` is not found, perhaps look it up on Roblox docs?`);
				await interaction.editReply({
					embeds: [embed],
				});
				return;
			}

			try {
				const details = jsYaml.load(fs.readFileSync(filepath));

				let tags = details.tags.join(', ');
				if (tags === '') tags = '<not available>';

				const url = `${classesUrl}/${instance}`;

				// redirect relative links to docs link
				let description = parser.parseDescription(details.description);

				// handle description length
				if (description.length > 4096) {
					description = parser.removeMaskedLinks(description);
				} else if (description.length === 0) {
					description = details.summary + `\n\n*'The description is truncated. If you want a better understanding of this Instance', [please open this documentation page instead.](${url})*`;
				} else if (details.summary.length === 0) {
					description = `*No description available, [you may open this documentation page instead.](${url})*`;
				}

				const inheritance = details.inherits[0];

				embed
					.setTitle(details.name)
					.setURL(url)
					.setDescription(`Tags: \`${tags}\` | Inheritance of ${inheritance ? `[\`${inheritance}\`](${classesUrl}/${inheritance})` : 'none'}\n\n${description}`);
				await interaction.editReply({
					embeds: [embed],
				});
			} catch (err) {
				console.error(err);
				embed
					.setTitle('Oops...')
					.setDescription(`There was an unexpected error while looking for this document. If this error persists, [you may open the documentation page instead.](${classesUrl}/${instance})`);
				await interaction.editReply({
					embeds: [embed],
				});
			}
		} else if (interaction.options.getSubcommand() === 'event') {
			const instance = interaction.options.getString('name');
			const event = interaction.options.getString('event');
			const embed = new EmbedBuilder();
			const filepath = path.join(basePath, instance + '.yaml');

			if (!fs.existsSync(filepath)) {
				embed
					.setTitle('Oops')
					.setDescription(`The requested instance \`${instance}\` is not found, perhaps look it up on Roblox docs?`);
				await interaction.editReply({
					embeds: [embed],
				});
				return;
			}

			try {
				const details = jsYaml.load(fs.readFileSync(filepath));
				const eventDetails = details.events.find(element => element.name.endsWith(event));

				let tags = details.tags.join(', ');
				if (tags === '') tags = '<not available>';

				const url = `${classesUrl}/${instance}#${event}`;

				// redirect relative links to docs link
				let description = parser.parseDescription(eventDetails.description);

				// handle description length
				if (description.length > 4096) {
					description = parser.removeMaskedLinks(description);
				} else if (description.length === 0) {
					description = details.summary + `\n\n*'The description is truncated. If you want a better understanding of this Instance', [please open this documentation page instead.](${url})*`;
				} else if (details.summary.length === 0) {
					description = `*No description available, [you may open this documentation page instead.](${url})*`;
				}

				embed
					.setTitle(eventDetails.name)
					.setURL(url)
					.setDescription(`Tags: \`${tags}\` | Security: \`${eventDetails.security}\` | Thread safety: ${eventDetails.thread_safety}\n\n${description}`);
				await interaction.editReply({
					embeds: [embed],
				});
			} catch (err) {
				console.error(err);
				embed
					.setTitle('Oops...')
					.setDescription(`There was an unexpected error while looking for this document. If this error persists, [you may open the documentation page instead.](${classesUrl}/${instance})`);
				await interaction.editReply({
					embeds: [embed],
				});
			}
		} else if (interaction.options.getSubcommand() === 'method') {
			const instance = interaction.options.getString('name');
			const method = interaction.options.getString('method');
			const embed = new EmbedBuilder();
			const filepath = path.join(basePath, instance + '.yaml');

			if (!fs.existsSync(filepath)) {
				embed
					.setTitle('Oops')
					.setDescription(`The requested instance \`${instance}\` is not found, perhaps look it up on Roblox docs?`);
				await interaction.editReply({
					embeds: [embed],
				});
				return;
			}

			try {
				const embeds = [embed];
				const details = jsYaml.load(fs.readFileSync(filepath));
				const methodDetails = details.methods.find(element => element.name.endsWith(method));

				let tags = details.tags.join(', ');
				if (tags === '') tags = '<not available>';

				const url = `${classesUrl}/${instance}#${method}`;

				// redirect relative links to docs link
				let description = parser.parseDescription(methodDetails.description);

				// handle description length
				if (description.length > 4096) {
					description = parser.removeMaskedLinks(description);
				} else if (description.length === 0) {
					description = details.summary + `\n\n*'The description is truncated. If you want a better understanding of this Instance', [please open this documentation page instead.](${url})*`;
				} else if (details.summary.length === 0) {
					description = `*No description available, [you may open this documentation page instead.](${url})*`;
				}

				embed
					.setTitle(methodDetails.name + '()')
					.setURL(url)
					.setDescription(`Tags: \`${tags}\` | Security: \`${methodDetails.security}\` | Thread safety: ${methodDetails.thread_safety}\n\n${description}`);

				if (methodDetails.parameters.length >= 1) {
					const parameterEmbed = new EmbedBuilder()
						.setTitle('Parameters')
						.setFields(parser.parseParameters(methodDetails.parameters));
					embeds.push(parameterEmbed);
				}

				if (methodDetails.returns.length >= 1) {
					const returnEmbed = new EmbedBuilder()
						.setTitle('Returned value')
						.setFields(parser.parseReturnedValue(methodDetails.returns));
					embeds.push(returnEmbed);
				}

				await interaction.editReply({
					embeds: embeds,
				});
			} catch (err) {
				console.error(err);
				embed
					.setTitle('Oops...')
					.setDescription(`There was an unexpected error while looking for this document. If this error persists, [you may open the documentation page instead.](${classesUrl}/${instance})`);
				await interaction.editReply({
					embeds: [embed],
				});
			}
		}
	},
};