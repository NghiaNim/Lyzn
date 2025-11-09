# Security & Compliance

## Server-to-Server Authentication

All communication between the Next.js web app and the Go chain-adapter service uses HMAC-SHA256 authentication.

### HMAC Headers

- `X-Timestamp`: Unix timestamp in milliseconds
- `X-Signature`: HMAC-SHA256 signature of `{timestamp}.{request_body}`

### Implementation

The HMAC secret is shared between services via environment variable `HMAC_SECRET`. Requests without valid signatures are rejected with 401 Unauthorized.

## Idempotency

All POST mutator endpoints support idempotency keys to prevent duplicate operations.

### Usage

Include an `idempotencyKey` (UUID) in the request body:

```json
{
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
  "strike": 50000,
  "notional": 1000,
  ...
}
```

If the same idempotency key is used again, the original response is returned without re-executing the operation.

### Supported Endpoints

- `POST /api/orders`
- `POST /api/matches/:id/counter`
- `POST /api/matches/:id/sign`
- `POST /api/contracts/initialize`

## Rate Limiting

Rate limiting is enforced on sensitive endpoints to prevent abuse.

### Endpoints with Rate Limits

- `POST /api/matches/:id/counter`: 10 requests per minute per user
- `POST /api/matches/:id/sign`: 10 requests per minute per user

### Rate Limit Headers

When rate limited, the response includes:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: Timestamp when limit resets
- `Retry-After`: Seconds until retry is allowed

Response status: `429 Too Many Requests`

## Notional Limits

Per-user daily notional limits are enforced to manage risk exposure.

### Default Limits

- Maximum: 100,000 USDC per day per user
- Configurable via environment variable `MAX_NOTIONAL_PER_DAY`

### Enforcement

When creating orders or counters, the system checks:
1. Sum of all notional from orders created today
2. If adding the new notional would exceed the limit, request is rejected

Response includes:
- `used`: Notional used today
- `limit`: Maximum allowed
- `remaining`: Remaining notional available

## Custodial Mode Security

**IMPORTANT**: When using custodial mode (`NON_CUSTODIAL=false`), private keys must NEVER be sent to the web application.

### Security Requirements

1. **Key Isolation**: Signer keypairs must be stored in a separate process or KMS (Key Management Service)
2. **No Key Transmission**: Private keys must never be:
   - Sent over HTTP/HTTPS to the web app
   - Stored in the web app's database
   - Logged or exposed in error messages
3. **KMS Integration**: Recommended approach:
   - Use AWS KMS, Google Cloud KMS, or HashiCorp Vault
   - Chain-adapter service requests signatures from KMS
   - KMS signs transactions and returns signatures
4. **Process Isolation**: Alternative approach:
   - Run signer in a separate microservice
   - Communicate via secure gRPC or Unix sockets
   - Signer service never exposes keys

### Implementation

The chain-adapter service supports:

```bash
# Option 1: Keypair file (development only - NOT for production)
SIGNER_KEYPAIR_PATH=/path/to/keypair.json

# Option 2: KMS (recommended for production)
KMS_PROVIDER=aws
KMS_KEY_ID=arn:aws:kms:...
AWS_REGION=us-east-1
```

### Best Practices

1. **Never log private keys**: Ensure logging libraries don't accidentally log key material
2. **Rotate keys regularly**: Implement key rotation procedures
3. **Monitor access**: Log all signing operations for audit
4. **Use hardware security modules (HSM)**: For production deployments
5. **Separate environments**: Use different keys for dev/staging/production

## Audit Trail

All operations are logged to the `AuditLog` table:

- Entity type (Order, Match, Contract)
- Entity ID
- Action (CREATE, UPDATE, DELETE, SETTLE)
- User ID
- Timestamp
- Optional metadata (JSON)

## Data Protection

- All sensitive data is encrypted at rest
- Database connections use TLS
- API endpoints use HTTPS only
- Session tokens are HTTP-only and secure

## Compliance

- All user actions are logged for audit
- Rate limits prevent abuse
- Notional limits manage risk exposure
- Idempotency prevents duplicate charges
- HMAC ensures request integrity

