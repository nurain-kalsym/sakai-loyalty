export interface AddNotificationConfig {
    _id: string;
    channel: string;
    type: string;
    threshold: number;
    status: string;
    title: string;
    body: string;
    description: string;
    reward?: any;
    file?: File;
}

export interface NotificationConfig {
    _id: string;
    channel: string;
    type: string;
    threshold: number;
    status: string;
    title: string;
    body: string;
    description: string;
    imageId: string;
    rewards: Rewards;
}

export interface Rewards {
    status: string;
    description: string;
    rewardType: string;
    rewards: string;
    days: number;
}

export interface CampaignNotification {
    _id?: string;
    channel: string;
    status:  string;
    sendMethod:  string;
    sendDate: Date;
    title: string;
    body:  string;
    description: string;
    imageId?: string;
    rewards: Rewards;
}

export interface AddCampaignNotification {
    _id?: string;
    channel: string;
    status:  string;
    sendMethod:  string;
    sendDate?: Date | null;
    title: string;
    body:  string;
    description: string;
    reward?: any;
    file?: File;
}