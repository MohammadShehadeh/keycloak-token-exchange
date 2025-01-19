/**
 * Get client access token from keycloak
 * @param clientId - The client ID
 * @param clientSecret - The client secret
 * @param keycloakIssuer - The keycloak issuer
 * @returns The access token
 */
const getClientAccessToken = async (
	clientId: string,
	clientSecret: string,
	keycloakIssuer: string
) => {
	try {
		const response = await fetch(
			`${keycloakIssuer}/protocol/openid-connect/token`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					grant_type: 'client_credentials',
					client_id: clientId,
					client_secret: clientSecret,
				}).toString(),
			}
		);

		if (!response.ok) {
			throw new Error('Failed to generate token');
		}

		const tokenResponseData = await response.json();
		const accessToken = tokenResponseData?.access_token as string;

		return {
			success: true,
			accessToken,
		};
	} catch (error) {
		return {
			success: false,
			message: error.message,
		};
	}
};

/**
 * Get impersonate access token from keycloak
 * @param clientId - The client ID
 * @param clientSecret - The client secret
 * @param requestedSubject - The requested subject
 * @param keycloakIssuer - The keycloak issuer
 * @returns The access token
 *
 * @note This function will create new session for the requested subject in keycloak
 * The returned access token is supposed to be used for impersonate auth.js session
 */
const getImpersonateAccessToken = async ({
	clientId,
	clientSecret,
	requestedSubject,
	keycloakIssuer,
}: {
	clientId: string;
	clientSecret: string;
	requestedSubject: string;
	keycloakIssuer: string;
}) => {
	try {
		const results = await getClientAccessToken(
			clientId,
			clientSecret,
			keycloakIssuer
		);

		if (!results.success) {
			throw new Error(results.message);
		}

		const grantType = 'urn:ietf:params:oauth:grant-type:token-exchange';

		const response = await fetch(
			`${keycloakIssuer}/protocol/openid-connect/token`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					grant_type: grantType,
					subject_token: results.accessToken!,
					requested_subject: requestedSubject,
				}).toString(),
			}
		);

		if (!response.ok) {
			throw new Error('Failed to get impersonate token');
		}

		const data = await response.json();
		return data.access_token as string;
	} catch (error) {
		return {
			success: false,
			message: error.message,
		};
	}
};

export { getClientAccessToken, getImpersonateAccessToken };
