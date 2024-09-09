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
    tier: number;
    idDoc: {
        status: string;
        createdDate: Date;
        updatedDate: Date;
    }
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

export interface MembershipInfo {
    phone: string;
    name: string;
    email: string;
    membershipTier: {
        status: string;
        startDate: string;
        duration: number;
        tier: number;
    },
    coins: {
        availableCoins: number;
        loyaltyCoins: {
            earned: number;
            used: number;
            expired: number;
        },
        referralCoins: {
            earned: number;
            used: number;
            expired: number;
        }
    },
    referral: {
        referralCode: string;
        referralCount: number;
    },
    idDoc: {
        status: string;
        createdDate: Date;
        updatedDate: Date;
    }
}

export interface MicrodealerDetails {
    _id: string;
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
    _id: string;
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
    _id: string;
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
    _id: string;
    channel: string;
    expiryDuration: number;
    serviceConversions: ServiceConversions[];
    createdAt?: Date;
    updatedAt?: Date;
    cashCoinsRate: number;
}
export interface ServiceConversions {
    serviceId: string;
    serviceName: string;
    microDealer?: Discount;
    referralTiers: Tier[];
    loyaltyTiers: LoyaltyTier[];
    mergedRow?: boolean;
}
export interface Discount {
    discountRate: number;
}
export interface Tier {
    orderSequence: number;
    percentage?: number;
    voucherCode?: string;
}
export interface LoyaltyTier {
    tier: number;
    rate: number;
    voucherCode: string;
}

export interface LoyaltyConfig {
    _id?: string;
    channels: string[];
    loyaltySetup: Config[];
    createdAt: Date;
    updateAt: Date;
}

export interface Config {
    tier: number;
    target: number;
    timeFrame: number; 
    type: string;
}