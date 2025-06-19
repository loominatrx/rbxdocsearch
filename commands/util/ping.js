import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle('Pong!')
			.addFields({
				name: 'bot latency',
				value: `${Date.now() - interaction.createdTimestamp}ms`,
			})
			.addFields({
				name: 'api latency',
				value: `${Math.round(interaction.client.ws.ping)}ms`,
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