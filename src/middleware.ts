import { Response, NextFunction } from 'express';
import { X420MiddlewareOptions, X420Request, PaymentAuthorization } from './types';

export function createPaymentMiddleware(options: X420MiddlewareOptions) {
    const paymentHeader = options.paymentHeader || 'x-payment';

    return async (req: X420Request, res: Response, next: NextFunction) => {
        const resourcePrice = options.priceMap[req.path];

        if (!resourcePrice) {
            return next();
        }

        const paymentHeaderValue = req.headers[paymentHeader];

        if (!paymentHeaderValue) {
            return res.status(402).json({
                error: 'Payment Required',
                message: 'Missing payment authorization header'
            });
        }

        let paymentAuth: PaymentAuthorization;
        try {
            paymentAuth = typeof paymentHeaderValue === 'string'
                ? JSON.parse(paymentHeaderValue)
                : JSON.parse(paymentHeaderValue[0]);
        } catch (error) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid payment authorization format'
            });
        }

        const verificationResult = await options.paymentProvider.verifyPayment(paymentAuth);

        if (!verificationResult.valid) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: verificationResult.error || 'Invalid payment authorization'
            });
        }

        const authorizedAmount = verificationResult.amount || paymentAuth.amount;
        const authorizedAsset = verificationResult.asset || paymentAuth.asset;

        if (authorizedAmount !== resourcePrice.price || authorizedAsset !== resourcePrice.asset) {
            return res.status(402).json({
                error: 'Payment Required',
                message: 'Price mismatch - please refresh prices',
                expected: {
                    price: resourcePrice.price,
                    asset: resourcePrice.asset
                },
                provided: {
                    price: authorizedAmount,
                    asset: authorizedAsset
                }
            });
        }

        try {
            await options.paymentProvider.settlePayment(paymentAuth);
        } catch (error) {
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Payment settlement failed'
            });
        }

        req.payment = paymentAuth;
        req.wallet = verificationResult.wallet;

        next();
    };
}
