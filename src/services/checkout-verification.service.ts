import { postData, getData } from './api-service';

export interface VerificationConfigResponse {
    requireCheckoutOtp: boolean;
    provider: string;
    mockMode: boolean;
    cooldownSeconds: number;
}

export interface VerificationStartResponse {
    challengeId: string;
    phone: string;
    provider: string;
    expiresAt: string;
    mockOtpCode?: string;
}

export interface VerificationConfirmResponse {
    verificationId: string;
    phone: string;
    provider: string;
    verifiedAt: string;
    expiresAt: string;
}

export class CheckoutVerificationService {
    static async getConfig(): Promise<VerificationConfigResponse> {
        try {
            const res: any = await getData({
                url: 'checkout-verification/config'
            });
            return res?.data || res;
        } catch {
            return {
                requireCheckoutOtp: true,
                provider: 'DIRECT',
                mockMode: false,
                cooldownSeconds: 60
            };
        }
    }

    static async startChallenge(phone: string): Promise<VerificationStartResponse> {
        const res: any = await postData({
            url: 'checkout-verification/start',
            body: { phone }
        });
        return res?.data || res;
    }

    static async confirmVerification(params: {
        phone: string;
        firebaseIdToken?: string;
        otpCode?: string;
        challengeId?: string;
    }): Promise<VerificationConfirmResponse> {
        const res: any = await postData({
            url: 'checkout-verification/confirm',
            body: params
        });
        return res?.data || res;
    }

    static async claimGuestAccount(params: {
        claimToken: string;
        password: string;
        name?: string;
    }): Promise<any> {
        const res: any = await postData({
            url: 'checkout-verification/claim-account',
            body: params
        });
        return res?.data || res;
    }

    static async trackOrder(orderId: string, phone: string): Promise<any> {
        const res: any = await getData({
            url: `orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`
        });
        return res?.data || res;
    }
}
