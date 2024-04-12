import { SlashCommandBuilder } from 'discord.js';
import parser from '../../utils/parser';
import fs from 'node:fs';
import path from 'node:path';
import jsYaml from 'js-yaml';

const basePath = path.join(Bun.main, 'references', 'engine', 'classes');

const lookup = (instance, query) => {
	const filepath = path.join(basePath, instance + '.yaml');
	const details = jsYaml.load(fs.readFileSync(filepath));

	const pattern = `${instance}${query === 'methods' ? ':' : '.'}`;
	return details[query].map(element => {
		return element.name.replace(pattern, '');
	});
};

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
				.setDescription('describes a method/function for the said instance')
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
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('property')
				.setDescription('describes a property for the said instance')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('the instance you want to look for')
						.setRequired(true)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('property')
						.setDescription('the property you want to look for')
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
			choices = lookup(instance, 'events') || [];
		} else if (focusedOption.name === 'method') {
			const instance = interaction.options.getString('name');
			choices = lookup(instance, 'methods') || [];
		} else if (focusedOption.name === 'property') {
			const instance = interaction.options.getString('name');
			choices = lookup(instance, 'properties') || [];
		}

		const value = focusedOption.value.trim().toLowerCase();
		const filtered = choices.filter(choice => choice.toLowerCase().startsWith(value)).slice(0, 24);
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},
	async execute(interaction) {
		await interaction.deferReply();
		// console.log(`subcommand used: ${interaction.options.getSubcommand()}`);
		const instance = interaction.options.getString('name');
		const subcommand = interaction.options.getSubcommand();
		const query = interaction.options.getString('method') ||
			interaction.options.getString('event') ||
			interaction.options.getString('property');
		const embeds = parser.makeReferenceEmbed(instance, subcommand, query);

		await interaction.editReply({
			embeds: embeds,
		});
	},
};