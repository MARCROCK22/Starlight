import { createEvent } from "seyfert";

export default createEvent({
	data: { once: true, name: "guildCreate" },
	async run(guild, client) {
		client.logger.info(`Joined guild ${guild.name} (${guild.id})`);

		const db = await client.prisma.guild.create({
			data: {
				id: guild.id,
				lang: "en",
				client_id: client.me.id,
				name: guild.name,
				room: { create: { client_id: client.me.id, id: "" } },
				ai: { create: { client_id: client.me.id, name: "", channel: "" } },
			},
			select: {
				uuid: true,
				roomid: true,
				id: true,
				lang: true,
				name: true,
				room: { select: { id: true, message: true } },
				ai: { select: { name: true, channel: true } },
			},
		});

		await client.redis.set(`guild:${client.me.id}:${guild.id}`, JSON.stringify(db));
		return Promise.resolve();
	},
});
