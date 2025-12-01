import { Request, Response, NextFunction } from 'express';

export interface PaymentAuthorization {
    amount: string;
    asset: string;
    signature: string;
    wallet: string;
    [key: string]: any;
}

export interface ResourcePrice {
    path: string;
    price: string;
    asset: string;
}

export interface PriceMap {
    [path: string]: {
        price: string;
        asset: string;
    };
}

export interface PaymentVerificationResult {
    valid: boolean;
    wallet?: string;
    amount?: string;
    asset?: string;
    error?: string;
}

export interface PaymentProvider {
    verifyPayment(authorization: PaymentAuthorization): Promise<PaymentVerificationResult>;
    settlePayment(authorization: PaymentAuthorization): Promise<void>;
}

export interface X420MiddlewareOptions {
    paymentProvider: PaymentProvider;
    priceMap: PriceMap;
    priceDiscoveryPath?: string;
    paymentHeader?: string;
}

export type X420Request = Request & {
    payment?: PaymentAuthorization;
    wallet?: string;
};
