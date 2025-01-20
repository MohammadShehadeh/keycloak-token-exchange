# Keycloak

## Running Keycloak in a container

Enable token exchange when running Keycloak

```bash
docker run -p 8080:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:26.0.1 start-dev --features=preview
```

## Environment Setup

Create a `.env` file with the following variables:

```env
KEYCLOAK_REQUESTED_SUBJECT="user-id-to-impersonate"
KEYCLOAK_ISSUER="http://localhost:8080/realms/your-realm"
KEYCLOAK_CLIENT_ID="your-client-id"
KEYCLOAK_CLIENT_SECRET="your-client-secret"
```
## Development

Run the service in development mode:

```bash
deno task dev
```

The service will start on port 8090.

## Available Endpoints

| Endpoint | Description |
| -------- | ----------- |
| GET http://localhost:8090/impersonate-access-token | Returns an access token for impersonating the requested subject. |
| GET http://localhost:8090/client-access-token | Returns an client access token for the requested subject. |

## Notes

- Ensure Keycloak is running with preview features enabled for token exchange
- The client must have token exchange permissions configured in Keycloak
- All responses are in JSON format
