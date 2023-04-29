import { isValidRequest } from 'discord-verify'
import { APIInteraction, ApplicationCommandType, InteractionType, RouteBases, Routes } from 'discord-api-types/v10'

export interface Env {
	PUBLIC_KEY: string
	TOKEN: string
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> { 
		const isValid = await isValidRequest(request, env.PUBLIC_KEY).catch(console.error)
		if (!isValid) return new Response('Invalid request', { status: 401 })

		const interaction = await request.json() as APIInteraction

		switch (interaction.type) {
			case InteractionType.Ping:
				return Response.json({ type: 1 })
			case InteractionType.ApplicationCommand:
				if (interaction.data.type !== ApplicationCommandType.Message) return new Response('Invalid interaction', { status: 400 })
				const message = interaction.data.resolved?.messages?.[interaction.data.target_id]
				await fetch(RouteBases.api+Routes.channelPin(interaction.channel.id, message.id), {
					method: 'PUT',
					headers: { 'Authorization': `Bot ${env.TOKEN}` }
				})
				return Response.json({ type: 4, data: { content: 'Pinned message' } })
		}
		return new Response('hello world')
	}
}
