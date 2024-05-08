import { SlashCommandBuilder } from 'discord.js';
import parser from '../../utils/parser';
import fs from 'node:fs';
import path from 'node:path';
import jsYaml from 'js-yaml';

const basePath = path.join(Bun.main, 'references', 'engine', 'globals');

const lookup = (global, query) => {
	const filepath = path.join(basePath, global + '.yaml');
	const details = jsYaml.load(fs.readFileSync(filepath));

	return details[query].map(e => e.name);
};

const whereItBelongs = (global, query) => {
	const methods = lookup(global, 'functions');
	const properties = lookup(global, 'properties');

	return (methods.find(e => e === query) && 'function') || (properties.find(e => e === query) && 'property') || '';
};

export default {
	data: new SlashCommandBuilder()
		.setName('global')
		.setDescription('get global details')
		.addStringOption(option =>
			option.setName('which_one')
				.setDescription('the global you want to look for')
				.setRequired(true)
				.addChoices(
					{ name: 'Roblox', value: 'RobloxGlobals' },
					{ name: 'Lua', value: 'LuaGlobals' },
				))
		.addStringOption(option =>
			option.setName('query')
				.setDescription('property/event you want to look for')
				.setRequired(true)
				.setAutocomplete(true)),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		const global = interaction.options.getString('which_one');
		let choices = [];

		if (focusedOption.name === 'query' && global !== undefined && global !== null) {
			choices = [].concat(lookup(global, 'properties'), lookup(global, 'functions'));
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
		const global = interaction.options.getString('which_one');
		const query = interaction.options.getString('query');
		const embeds = parser.makeReferenceEmbed(global, whereItBelongs(global, query), query, 'globals');

		await interaction.editReply({
			embeds: embeds,
		});
	},
};