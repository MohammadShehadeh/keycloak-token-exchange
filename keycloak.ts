const generateToken = async (
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

const tokenExchange = async ({
	clientId,
	clientSecret,
	issuerId,
	requestedSubject,
	keycloakIssuer,
}: {
	clientId: string;
	clientSecret: string;
	issuerId: string;
	requestedSubject: string;
	keycloakIssuer: string;
}) => {
	try {
		const results = await generateToken(clientId, clientSecret, keycloakIssuer);

		if (!results.success) {
			throw new Error(results.message);
		}

		const grantType = 'urn:ietf:params:oauth:grant-type:token-exchange';
		const subjectTokenType = 'urn:ietf:params:oauth:token-type:id_token';

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
					subject_issuer: issuerId,
					subject_token_type: subjectTokenType,
					requested_subject: requestedSubject,
					scope: 'openid',
				}).toString(),
			}
		);

		if (!response.ok) {
			throw new Error('Failed to exchange token');
		}

		const data = await response.json();
		return data.access_token;
	} catch (error) {
		return {
			success: false,
			message: error.message,
		};
	}
};

const getSession = async (accessToken: string, keycloakIssuer: string) => {
	const response = await fetch(
		`${keycloakIssuer}/protocol/openid-connect/userinfo`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
	);

	if (!response.ok) {
		throw new Error('Failed to get session');
	}

	return response.json();
};

export { generateToken, tokenExchange, getSession };
