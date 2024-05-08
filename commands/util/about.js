import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const BOT_NAME = 'rbxdocsearch';
const DESCRIPTION = 'blazingly fast documentation lookup bot on Discord inspired by [Roblox Docs Search by sleitnick](https://github.com/Sleitnick/rbx-doc-search) which unironically have the same repo name LOL.';

const COPYLEFT_NOTICE = `
this bot is open-sourced under [GPLv3 license](https://github.com/loominatrx/rbxdocsearch/blob/main/LICENSE). the Roblox documentation shown here is used under [CC-BY-4.0-DEED](https://github.com/Roblox/creator-docs/blob/main/LICENSE).
its code sample that is shown in the documentation is used under [MIT license](https://github.com/Roblox/creator-docs/blob/main/LICENSE-CODE).
`;

const AUTHOR_BIO = `hello! i'm Mas Gading. people on the internet know me as [loominatrx](https://www.roblox.com/users/1565283543/profile).
i'm a teenager, a roblox game developer, a gamer, and also a [6 digit osu! player](https://osu.ppy.sh/u/loominatrx). i do some lua(u) and javascript programming (i'm no expert at both of them), and also i do UI Design on roblox & figma.`;

export default {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('shows something about this bot'),
	async execute(interaction) {
		let totalSeconds = (interaction.client.uptime / 1000);
		const days = Math.floor(totalSeconds / 86400);
		totalSeconds %= 86400;
		const hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = Math.floor(totalSeconds % 60);

		const aboutBot = new EmbedBuilder()
			.setTitle(BOT_NAME)
			.setThumbnail('https://github.com/loominatrx/rbxdocsearch/blob/main/assets/profile-dark.png?raw=true')
			.setDescription(DESCRIPTION)
			.addFields({
				name: 'notice',
				value: COPYLEFT_NOTICE,
			})
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
				value: `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`,
				inline: true,
			})
			.setFooter({
				text: 'Made with <3 by loominatrx.',
			});
		const aboutCreator = new EmbedBuilder()
			.setAuthor({
				name: 'loominatrx',
				iconURL: 'https://avatars.githubusercontent.com/u/35314624?v=4',
			})
			.setTitle('about me!')
			.setDescription(AUTHOR_BIO)
			.addFields(
				{
					name: 'trakteer me!',
					value: 'by supporting me [here](https://trakteer.id/loominatrx/tip), you helped my financial situation for the better!',
				},
				{
					name: 'twitter.',
					value: '[@rbxlx_](https://twitter.com/rbxlx_)',
					inline: true,
				},
				{
					name: 'roblox.',
					value: '[Loominatrx](https://user.rblx.name/Loominatrx)',
					inline: true,
				},
				{
					name: 'devforum.',
					value: '[Loominatrx](https://user.devforum.link/Loominatrx)',
					inline: true,
				},
				{
					name: 'github.',
					value: '[loominatrx](https://github.com/loominatrx)',
					inline: true,
				},
			);
		await interaction.reply({
			embeds: [aboutBot, aboutCreator],
		});
	},
};