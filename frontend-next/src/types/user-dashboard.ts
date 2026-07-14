export interface TokenUsage {
    limit: number | null;
    used: number;
    remaining: number | null;
    percentage: number;
    status: 'safe' | 'warning' | 'critical' | 'unlimited';
    reset_at?: string;
}

export interface ChatHistoryItem {
    id: number;
    name: string;
    phone_number: string;
    last_message: string;
    last_message_at: string | null;
    last_message_at_human: string | null;
    last_sender: string;
    status: 'hot' | 'warm' | 'cold';
    message_count: number;
}

export interface ChatLogItem {
    id: number;
    message_id: string;
    client_phone: string;
    profile_name: string;
    body_snippet: string;
    intent: string;
    status: 'pending' | 'processing' | 'done' | 'failed';
    api_status: string;
    estimated_tokens: number;
    response_snippet: string | null;
    created_at: string | null;
    created_at_human: string | null;
}

export interface UserDashboardData {
    token_usage: TokenUsage;
    recent_chat_history: ChatHistoryItem[];
    recent_chat_logs: ChatLogItem[];
}

export interface PaginatedChatLogs {
    logs: ChatLogItem[];
    meta: PaginationMeta;
}

export interface PaginatedChatHistory {
    history: ChatHistoryItem[];
    meta: PaginationMeta;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
