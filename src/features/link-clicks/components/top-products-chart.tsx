'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { Product } from '@/types/link-clicks';
import { CHART_CONFIG } from '../constants';

interface Props {
    products: Product[];
}

function truncateProductName(name: string, maxLength: number): string {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
}

export function TopProductsChart({ products }: Props) {
    // Get top 10 products by total_links_generated
    const topProducts = products
        .filter((p) => p.total_links_generated > 0)
        .sort((a, b) => b.total_links_generated - a.total_links_generated)
        .slice(0, 10);

    if (topProducts.length === 0) {
        return (
            <div className="bg-white dark:bg-[#1F2937] border border-[#E2E0D8] dark:border-[#374151] rounded-xl mb-5 animate-in fade-in slide-in-from-bottom-4 duration-600 delay-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 pt-4 pb-3 border-b border-[#F0EEE8] dark:border-[#374151] gap-2">
                    <h2 className="text-sm font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">Top 10 Produk</h2>
                    <span className="text-xs text-[#B4B2A9] dark:text-[#6B7280]">berdasarkan total clicks</span>
                </div>
                <div className="px-4 sm:px-6 py-12 text-center">
                    <p className="text-sm text-[#B4B2A9] dark:text-[#6B7280] animate-pulse">
                        Belum ada data click untuk ditampilkan
                    </p>
                </div>
            </div>
        );
    }

    const chartData = topProducts.map((product) => ({
        name: truncateProductName(product.name, 15),
        clicks: product.total_links_generated,
        fullName: product.name,
    }));

    return (
        <div className="bg-white dark:bg-[#1F2937] border border-[#E2E0D8] dark:border-[#374151] rounded-xl mb-5 animate-in fade-in slide-in-from-bottom-4 duration-600 delay-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 pt-4 pb-3 border-b border-[#F0EEE8] dark:border-[#374151] gap-2">
                <h2 className="text-sm font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">Top 10 Produk Paling Banyak Diklik</h2>
                <span className="text-xs text-[#B4B2A9] dark:text-[#6B7280]">berdasarkan total clicks</span>
            </div>
            <div className="px-4 sm:px-6 py-6">
                <ResponsiveContainer width="100%" height={CHART_CONFIG.height}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                        <defs>
                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#378ADD" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#378ADD" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" className="dark:stroke-[#374151]" />
                        <XAxis
                            dataKey="name"
                            stroke="#888780"
                            className="dark:stroke-[#9CA3AF]"
                            style={{ fontSize: '11px' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            stroke="#888780"
                            className="dark:stroke-[#9CA3AF]"
                            style={{ fontSize: '12px' }}
                            label={{
                                value: 'Clicks',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fontSize: '12px', fill: '#888780' },
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #E2E0D8',
                                borderRadius: '8px',
                                fontSize: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                            formatter={(value) => [
                                `${Number(value || 0).toLocaleString()} clicks`,
                                'Total',
                            ]}
                            labelFormatter={(label, payload) => {
                                if (payload && payload[0]) {
                                    return payload[0].payload.fullName;
                                }
                                return label;
                            }}
                            labelStyle={{ fontWeight: 600, color: '#1a1a18' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="clicks"
                            stroke="#378ADD"
                            strokeWidth={3}
                            fill="url(#colorClicks)"
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
