import { Request, Response, NextFunction } from 'express';
import { X420MiddlewareOptions, ResourcePrice } from './types';

export function createPriceDiscoveryHandler(options: X420MiddlewareOptions) {
    const priceDiscoveryPath = options.priceDiscoveryPath || '/x420-prices';

    return (req: Request, res: Response, next: NextFunction) => {
        if (req.path !== priceDiscoveryPath) {
            return next();
        }

        const prices: ResourcePrice[] = Object.entries(options.priceMap).map(([path, priceInfo]) => ({
            path,
            price: priceInfo.price,
            asset: priceInfo.asset,
        }));

        res.status(200).json({ prices });
    };
}
