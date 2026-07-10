export const CHART_COLORS = [
    '#378ADD',
    '#3B6D11',
    '#BA7517',
    '#185FA5',
    '#8B5CF6',
    '#EC4899',
    '#F59E0B',
    '#10B981',
    '#6366F1',
    '#EF4444',
];

export const TABLE_HEADERS = [
    'Produk',
    'Kategori',
    'Harga',
    'Total Clicks',
    'Messages Sent',
] as const;

export const LINK_DETAILS_HEADERS = [
    'Track Code',
    'IP Address',
    'Browser',
    'Agent Phone',
    'Client Phone',
    'Client Name',
    'Clicked At',
    'Status',
] as const;

export const ITEMS_PER_PAGE = 15;

export const CHART_CONFIG = {
    height: 400,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
    yAxisWidth: 150,
    maxProductNameLength: 20,
} as const;
