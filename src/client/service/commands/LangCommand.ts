import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { CommandContext } from "seyfert";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { LangCommandOptions } from "@/client/commands/admin/lang";
import { PermissionFlagsBits } from "seyfert/lib/types";

export default new ServiceExecute({
	name: "LangCommand",
	filePath: __filename,
	async execute(client, database: IDatabase, interaction: CommandContext<typeof LangCommandOptions>) {
		const lang = interaction.options.language as "en" | "th";
		const t = client.t(database.lang);
		if (!interaction.guild) return;
		if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
			if (database.lang === lang) {
				return interaction.editOrReply({
					content: `${t.lang.already.get()}`,
				});
			} else {
				if (await client.prisma.guild.findFirst({ where: { id: interaction.guildId } })) {
					await client.prisma.guild
					.update({
						where: {
							uuid: database.uuid,
							id: interaction.guildId,
						},
						data: {
							id: interaction.guildId,
							lang: lang,
						},
						select: {
							id: true,
							name: true,
							lang: true,
							room: true,
							uuid: true,
							roomid: true,
						},
					})
					.then(async (data) => {
						await client.redis.set(`guild:${client.me.id}:${data.id}`, JSON.stringify(data));
						interaction.editOrReply({
							content: `${t.lang.success.get()}: ${data.lang}`,
						});
					});
				} else {
					await client.prisma.guild
					.create({
						data: {
							id: interaction.guildId,
							lang: lang,
							client_id: client.me.id,
							name: interaction.guild.name,
							room: { create: { client_id: client.me.id, id: "" } },
							ai: { create: { client_id: client.me.id, name: "", channel: "" } },
						},
						select: {
							uuid: true,
							roomid: true,
							lang: true,
							id: true,
							name: true,
						},
					})
					.then(async (data) => {
						await client.redis.set(`guild:${client.me.id}:${data.id}`, JSON.stringify(data));
						interaction.editOrReply({
							content: `${t.lang.success.get()}: ${data.lang}`,
						});
					});
				}
			}
		}
	},
});
