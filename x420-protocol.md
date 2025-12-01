# x420 Protocol Description

The **x420 Protocol** is an optimized extension of the internet-native micro-payment standard x402, designed to achieve significant latency reduction by consolidating the price discovery and payment authorization into a single client request. The protocol strictly adheres to a stateless, pay-per-request model, relying on cryptographic authorization and an effective price-mismatch failsafe for security.

## Phase 1: Price Discovery

To enable the single-request access, the Client must first establish a reliable, cached record of the current resource prices.

1. **Proactive Discovery:** The Client initiates a standard `GET` request to a dedicated Price Discovery Endpoint (e.g., `/x420-prices`). The Server responds with a `200 OK` status, providing a payload that clearly details the current cost (price and asset) for all endpoints gated by the x420 Protocol. The Client's responsibility is to maintain this information locally (cache).
    
2. **Reactive Discovery (Failsafe Trigger):** If a Client attempts a subsequent single-request access with a payment authorization based on an incorrect or expired price, the Server will enforce a rejection. The Server responds with the standard **`402 Payment Required`** status code. This response implicitly signals a cache invalidation and forces the Client to immediately execute the Proactive Discovery step to retrieve the new current price before any retry.
    

## Phase 2: Single-Request Access

With the current price cached, the Client executes the optimized one-request payment and access flow.

1. **Client Action:** The Client retrieves the current required price from its local cache. Using this value, the Client constructs a cryptographically signed payment authorization (compliant with established on-chain standards) that explicitly commits the funds required for the access.
    
2. **Client Request:** The Client issues the single access request (e.g., `GET /api/resource`) and includes the complete, signed payment authorization payload within the standard **`X-Payment`** HTTP header.
    
3. **Server Verification:** Upon receiving the request, the Server performs two simultaneous, non-negotiable checks:
    
    - **Authorization Validity:** The signature contained within the `X-Payment` header must be cryptographically valid and correctly attribute the request to the Client's wallet.
        
    - **Price Match:** The specific payment amount authorized within the signed payload **must exactly match** the Server's current internal price for the requested resource.
        
4. **Successful Access:** If both the Authorization Validity and Price Match checks are successfully passed, the Server commits the transaction for on-chain settlement via the Facilitator. Simultaneously, the Server grants access and responds with a **`200 OK`** status and the requested data.
    
5. **Failure (Price Mismatch):** If the Authorization is valid but the Price Match fails, the Server **must halt settlement** and reject the request. The Server responds with **`402 Payment Required`** to trigger the reactive discovery mechanism, preventing access and ensuring the Client updates its price cache before any further attempt.
    

## Security and Protocol Model

The **x420 Protocol** maintains a high level of security by ensuring that every successful access is secured by a **unique, atomic, on-chain transaction**. The protocol remains fully **stateless**, as access is based on a verifiable cryptographic payment authorization for the _current_ request, not on shared server-side state or pre-paid tokens. Latency is minimized through the reliable and accountable price caching mechanism.
