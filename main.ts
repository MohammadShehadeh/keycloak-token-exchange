import { serve } from 'https://deno.land/std@0.207.0/http/server.ts';
import { getSession, tokenExchange } from './keycloak.ts';

const requestedSubject = Deno.env.get('KEYCLOAK_REQUESTED_SUBJECT');
const keycloakIssuer = Deno.env.get('KEYCLOAK_ISSUER');

// Realm A - Client A
const realmA = Deno.env.get('KEYCLOAK_A_REALM');
const clientIdA = Deno.env.get('KEYCLOAK_A_CLIENT_ID');
const clientSecretA = Deno.env.get('KEYCLOAK_A_CLIENT_SECRET');


async function handler(req: Request): Promise<Response> {
	const url = new URL(req.url);

	// Handle different endpoints
	switch (url.pathname) {
		case '/session':
			return getSession({
				accessToken: req.headers.get('Authorization')?.split(' ')[1],
				keycloakIssuer: keycloakIssuer,
			});
		case '/token-exchange':
			return tokenExchange({
				clientId: clientIdA,
				clientSecret: clientSecretA,
				issuerId: realmA,
				requestedSubject: requestedSubject,
				keycloakIssuer: keycloakIssuer,
			});
		default:
			return new Response(JSON.stringify({ error: 'Not Found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
	}
}

serve(handler, { port: 8090 });
