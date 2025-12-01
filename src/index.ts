import { X420MiddlewareOptions } from './types';
import { createPriceDiscoveryHandler } from './price-discovery';
import { createPaymentMiddleware } from './middleware';

export function x420(options: X420MiddlewareOptions) {
    const priceDiscovery = createPriceDiscoveryHandler(options);
    const paymentMiddleware = createPaymentMiddleware(options);

    return [priceDiscovery, paymentMiddleware];
}

export * from './types';
export { createPriceDiscoveryHandler } from './price-discovery';
export { createPaymentMiddleware } from './middleware';
