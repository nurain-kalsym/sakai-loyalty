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