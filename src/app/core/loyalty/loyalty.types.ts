export interface Aging {
    month: number;
    year: number;
    referral: CoinsData;
    loyalty: CoinsData;
}

export interface CoinsData { 
    type?: string;
    status?: string;
    channel?: string;
    totalEarned?: number; 
    totalUsed?: number; 
    totalExpired?: number
}

export interface Pagination {
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
export interface Month {
    month: number;
    display: string;
}

export interface Earner {
    name: string;
    phone: string;
    rank: number;
    totalCoins: number;
}
export interface CoinsHistory {
    phone: string;
    amount: number;
    type: string;
    channel: string;
    status: string;
    date: Date;
}

export interface Members {
    phone: string;
    name: string;
    email: string;
    channels: Channels[];
    totalCoins: number;
    loyalty: CoinsData[];
    referral: CoinsData[];
    microDealer: CoinsData[]; 
    summary?: CoinsData[];
}

export interface Channels {
    channelName: string;
    registrationDate: Date;
    status: string;
}
export interface ReferralTree {
    expanded: boolean;
    styleClass: string;
    data: TreeObj;
    children: ReferralTree[];
}

export interface TreeObj {
    name: string;
    phone: string;
    refCode: string;
    layer: number;
}

export interface MicrodealerDetails {
    id: string;
    name: string;
    createdAt: Date;
    email: string;
    phone: string;
    referral: ReferralObj;
    channel: Channels[];
    cashback: CashBack;
    loyaltyPrograms: LoyaltyProgram;
    microDealer: MicroDealer[];
}
export interface ReferralObj {
    channel: string;
    referralCount: string;
    originCode: string;
    referralCode: string;
}
export interface CashBack {
    totalCoins: number;
    totalCoinsUsed: number;
    totalCoinsExpired:number;
}

export interface LoyaltyProgram {
    totalCoins: number;
    totalCoinsUsed: number;
    totalCoinsExpired:number;
    memberTiers: number;
}

export interface MicroDealer {
    channel: string;
    status: string;
    createdDate: Date;
    updatedDate: Date;
}
export interface MicrodealerChannel {
    id: string;
    name: string;
    createdAt: Date;
    email: string;
    phone: string;
    referral: ReferralObj;
    cashback: CashBack;
    loyaltyPrograms: LoyaltyProgram;
    channel: string;
    microDealerStatus: string;
}
export interface ReferralUsers {
    id: string;
    name: string;
    createdAt: Date;
    phone: string;
    email: string;
    referral: ReferralObj[];
    channel: Channels[];
    cashback: Cash[];
    loyaltyPrograms: LoyaltyPrograms[];
    microDealer: MicroDealer[];
    updatedAt: Date;
}
export interface ReferralObj {
    channel: string;
    referralCount: string;
    originCode: string;
    referralCode: string;
}

export interface Cash {
    totalCoins: number;
    totalCoinsUsed: number;
    totalCoinsExpired: number;
    channel: string;
}

export interface LoyaltyPrograms {
    totalCoins: number;
    totalCoinsUsed: number;
    totalCoinsExpired:number;
    membershipTier: number;
    channel: string;
}
export interface Conversion {
    id: string;
    channel: string;
    expiryDuration: number;
    serviceConversions: ServiceConversions[];
    createdAt: Date;
    updatedAt: Date;
    cashCoinsRate: number;
}
export interface ServiceConversions {
    serviceId: string;
    serviceName: string;
    microDealer: Discount;
    referralTiers: Tier;
    loyaltyTiers: LoyaltyTier;
}
export interface Discount {
    discountRate: number;
}
export interface Tier {
    orderSequence: number;
    percentage: number;
    voucherCode: string;
}
export interface LoyaltyTier {
    tier: number;
    rate: number;
    voucherCode: string;
}