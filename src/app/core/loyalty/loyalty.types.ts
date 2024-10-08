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
    expended: Boolean;
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
    activeChannels: string[],
    membershipTier: {
        status: string;
        startDate: string;
        duration: number;
        tier: number;
    },
    spending: {
      totalSpending: number;
      currentTierTarget: number;
      nextTierTarget: number;
      memberStatus: string;
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
}

export interface ServiceConversions {
    serviceId: string;
    serviceName: string;
    referralTiers: Tier[];
    loyaltyTiers: LoyaltyTier[];
    microDealer: Discount;
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
    loyaltyRate: number;
    referralRate?: number;
    voucherCode: string;
    rate?: number;
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