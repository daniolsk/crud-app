export interface Campaign {
	id: number;
	name: string;
	keywords: string;
	bidAmount: number;
	campaignFund: number;
	status: 'active' | 'paused';
	town: string | null;
	radius: number;
}

export interface ApiResponse {
	campaigns: Campaign[];
	emeraldAccountBalance: number;
}

export interface CreateCampaignResponse {
	campaign: Campaign;
	newBalance: number;
}

export interface DeleteCampaignResponse {
	message: string;
	newBalance: number;
}
