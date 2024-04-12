import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const BOT_NAME = 'rbxdocsearch';
const DESCRIPTION = 'blazingly fast documentation lookup bot on Discord inspired by [Roblox Docs Search by sleitnick](https://github.com/Sleitnick/rbx-doc-search).';

const COPYLEFT_NOTICE = `
this bot is open-sourced under GPLv3 license. the Roblox documentation shown here is used under [CC-BY-4.0-DEED](https://github.com/Roblox/creator-docs/blob/main/LICENSE).
its code sample that is shown in the documentation is used under [MIT license](https://github.com/Roblox/creator-docs/blob/main/LICENSE-CODE).
`;

export default {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('shows something about this bot'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle(BOT_NAME)
			.setImage('https://github.com/loominatrx/rbxdocsearch/blob/main/assets/profile-dark.png?raw=true')
			.setDescription(DESCRIPTION + COPYLEFT_NOTICE)
			.addFields({
				name: 'runtime',
				value: `Bun ${Bun.version}`,
				inline: true,
			})
			.addFields({
				name: 'source code',
				value: 'https://github.com/loominatrx/rbxdocsearch',
				inline: true,
			})
			.addFields({
				name: 'uptime',
				value: `<t:${Date.now() - interaction.client.startTime}>`,
				inline: true,
			})
			.setFooter({
				text: 'Made with <3 by loominatrx.',
			});
		await interaction.reply({
			embeds: [embed],
		});
	},
};