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