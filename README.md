# x420 Middleware

Express.js middleware implementation of the **x420 Protocol** - an optimized extension of the x402 internet-native micro-payment standard.

## Overview

The x420 Protocol reduces latency by consolidating price discovery and payment authorization into a single client request. It maintains a stateless, pay-per-request model with cryptographic authorization and price-mismatch failsafe mechanisms.

## Installation

```bash
npm install x420-middleware
```

## Quick Start

```typescript
import express from 'express';
import { x420, PaymentProvider, PaymentVerificationResult, PaymentAuthorization } from 'x420-middleware';

class MyPaymentProvider implements PaymentProvider {
  async verifyPayment(authorization: PaymentAuthorization): Promise<PaymentVerificationResult> {
    return {
      valid: true,
      wallet: authorization.wallet,
      amount: authorization.amount,
      asset: authorization.asset
    };
  }

  async settlePayment(authorization: PaymentAuthorization): Promise<void> {
    console.log('Settling payment:', authorization);
  }
}

const app = express();

const middleware = x420({
  paymentProvider: new MyPaymentProvider(),
  priceMap: {
    '/api/premium-data': { price: '100', asset: 'USDC' },
    '/api/exclusive-content': { price: '50', asset: 'USDC' }
  },
  priceDiscoveryPath: '/x420-prices',
  paymentHeader: 'x-payment'
});

app.use(middleware);

app.get('/api/premium-data', (req, res) => {
  res.json({ data: 'This is premium content' });
});

app.listen(3000);
```

## Protocol Flow

### Phase 1: Price Discovery

Clients retrieve current prices for protected resources:

```bash
GET /x420-prices
```

Response:
```json
{
  "prices": [
    {
      "path": "/api/premium-data",
      "price": "100",
      "asset": "USDC"
    },
    {
      "path": "/api/exclusive-content",
      "price": "50",
      "asset": "USDC"
    }
  ]
}
```

### Phase 2: Single-Request Access

Clients make authenticated requests with payment authorization:

```bash
GET /api/premium-data
X-Payment: {"amount":"100","asset":"USDC","signature":"0x...","wallet":"0x..."}
```

**Success (200 OK):** Payment verified and settled, resource delivered

**Price Mismatch (402 Payment Required):** Client must refresh prices

**Invalid Authorization (401 Unauthorized):** Signature verification failed

## Configuration

### X420MiddlewareOptions

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `paymentProvider` | `PaymentProvider` | Yes | - | Payment verification and settlement implementation |
| `priceMap` | `PriceMap` | Yes | - | Mapping of resource paths to prices |
| `priceDiscoveryPath` | `string` | No | `/x420-prices` | Endpoint for price discovery |
| `paymentHeader` | `string` | No | `x-payment` | HTTP header name for payment authorization |

### PriceMap Structure

```typescript
{
  '/resource/path': {
    price: '100',
    asset: 'USDC'
  }
}
```

## Payment Provider Interface

Implement the `PaymentProvider` interface to integrate with your payment system:

```typescript
interface PaymentProvider {
  verifyPayment(authorization: PaymentAuthorization): Promise<PaymentVerificationResult>;
  settlePayment(authorization: PaymentAuthorization): Promise<void>;
}
```

### verifyPayment

Validates the cryptographic signature and returns verification results.

**Parameters:**
- `authorization`: Payment authorization object from client

**Returns:**
```typescript
{
  valid: boolean;
  wallet?: string;
  amount?: string;
  asset?: string;
  error?: string;
}
```

### settlePayment

Commits the transaction for on-chain settlement.

**Parameters:**
- `authorization`: Verified payment authorization

**Returns:** Promise that resolves when settlement is initiated

## Payment Authorization Format

```typescript
{
  amount: string;
  asset: string;
  signature: string;
  wallet: string;
}
```

Additional fields can be included based on your payment provider requirements.

## Advanced Usage

### Separate Middleware Components

You can use price discovery and payment middleware independently:

```typescript
import { createPriceDiscoveryHandler, createPaymentMiddleware } from 'x420-middleware';

const priceDiscovery = createPriceDiscoveryHandler(options);
const payment = createPaymentMiddleware(options);

app.use(priceDiscovery);
app.use('/api', payment);
```

### Custom Error Handling

```typescript
app.use((err, req, res, next) => {
  if (err.status === 402) {
    res.status(402).json({
      error: 'Payment Required',
      message: 'Please refresh prices and retry'
    });
  } else {
    next(err);
  }
});
```

### Accessing Payment Information

Payment details are attached to the request object:

```typescript
app.get('/api/premium-data', (req, res) => {
  const wallet = req.wallet;
  const payment = req.payment;
  
  res.json({ 
    data: 'Premium content',
    paidBy: wallet
  });
});
```

## Example Payment Provider

Here's a skeleton implementation for a blockchain-based payment provider:

```typescript
import { PaymentProvider, PaymentAuthorization, PaymentVerificationResult } from 'x420-middleware';

class BlockchainPaymentProvider implements PaymentProvider {
  async verifyPayment(authorization: PaymentAuthorization): Promise<PaymentVerificationResult> {
    try {
      const isValid = await this.verifySignature(
        authorization.signature,
        authorization.wallet,
        authorization.amount,
        authorization.asset
      );

      if (!isValid) {
        return { valid: false, error: 'Invalid signature' };
      }

      return {
        valid: true,
        wallet: authorization.wallet,
        amount: authorization.amount,
        asset: authorization.asset
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async settlePayment(authorization: PaymentAuthorization): Promise<void> {
    await this.submitToBlockchain(authorization);
  }

  private async verifySignature(signature: string, wallet: string, amount: string, asset: string): Promise<boolean> {
    return true;
  }

  private async submitToBlockchain(authorization: PaymentAuthorization): Promise<void> {
    console.log('Submitting to blockchain:', authorization);
  }
}
```

## Security Considerations

- **Stateless Design:** Each request requires a unique cryptographic authorization
- **Price Matching:** Exact price match required - prevents stale price exploitation
- **Atomic Transactions:** Payment settlement occurs only after successful verification
- **No Pre-paid Tokens:** Every access requires a fresh, verifiable payment authorization

## Protocol Specification

For detailed protocol specification, see [x420-protocol.md](./x420-protocol.md)

## TypeScript Support

This package includes full TypeScript type definitions. All interfaces and types are exported for use in your application.

## License

MIT
