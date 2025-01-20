import { serve } from 'https://deno.land/std@0.207.0/http/server.ts';
import { getClientAccessToken, getImpersonateAccessToken } from './keycloak.ts';

const requestedSubject = Deno.env.get('KEYCLOAK_REQUESTED_SUBJECT');
const keycloakIssuer = Deno.env.get('KEYCLOAK_ISSUER');
const clientId = Deno.env.get('KEYCLOAK_CLIENT_ID');
const clientSecret = Deno.env.get('KEYCLOAK_CLIENT_SECRET');

async function handler(req: Request): Promise<Response> {
	const url = new URL(req.url);

	// Handle different endpoints
	switch (url.pathname) {
		case '/client-access-token':
			return new Response(
				JSON.stringify(
					await getClientAccessToken(clientId, clientSecret, keycloakIssuer)
				),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		case '/impersonate-access-token':
			return new Response(
				JSON.stringify(
					await getImpersonateAccessToken({
						clientId,
						clientSecret,
						requestedSubject,
						keycloakIssuer,
					})
				),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		default:
			return new Response(JSON.stringify({ error: 'Not Found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
	}
}

serve(handler, { port: 8090 });
