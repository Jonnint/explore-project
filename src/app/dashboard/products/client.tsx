'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Filter,
    Search,
    Download,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    Sparkles,
    BadgeDollarSign,
    Touchpad,
    ChartBar,
    CircleDollarSign
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Static data
const productsData = [
    {
        id: '#BC-001',
        name: 'VHAC Premium 1000mg',
        category: 'Kecantikan',
        klik: 947,
        nilai: 324,
        konversi: 284,
        tingkat: '34.2%',
        pendapatan: 'Rp 44.382.000',
        status: 'Hot'
    },
    {
        id: '#BC-002',
        name: 'Kausoft Plus',
        category: 'Kecantikan',
        klik: 1024,
        nilai: 268,
        konversi: 247,
        tingkat: '24.1%',
        pendapatan: 'Rp 38.244.000',
        status: 'Hot'
    },
    {
        id: '#BC-003',
        name: 'Omega-3 Minyak Ikan',
        category: 'Jantung',
        klik: 892,
        nilai: 247,
        konversi: 247,
        tingkat: '27.7%',
        pendapatan: 'Rp 29.847.000',
        status: 'Warm'
    },
    {
        id: '#BC-004',
        name: 'Paket Bundle Wellness',
        category: 'Paket',
        klik: 768,
        nilai: 189,
        konversi: 76,
        tingkat: '9.9%',
        pendapatan: 'Rp 22.384.000',
        status: 'Warm'
    },
    {
        id: '#BC-005',
        name: 'Collagen Beauty Plus',
        category: 'Kecantikan',
        klik: 437,
        nilai: 284,
        konversi: 64,
        tingkat: '14.6%',
        pendapatan: 'Rp 18.482.000',
        status: 'Cold'
    }
];

const productLinkClicksData = [
    { date: 'Dec 15', value: 45 },
    { date: 'Dec 17', value: 52 },
    { date: 'Dec 18', value: 68 },
    { date: 'Dec 19', value: 75 },
    { date: 'Dec 20', value: 85 },
    { date: 'Dec 21', value: 95 },
    { date: 'Dec 22', value: 110 }
];

const conversionTrendData = [
    { date: 'Dec 15', value: 20 },
    { date: 'Dec 17', value: 28 },
    { date: 'Dec 18', value: 35 },
    { date: 'Dec 19', value: 42 },
    { date: 'Dec 20', value: 48 },
    { date: 'Dec 21', value: 55 },
    { date: 'Dec 22', value: 60 }
];

const statsData = [
    {
        title: 'Total Revenue',
        value: '48392000',
        change: '+24% vs last month',
        trend: 'up',
        icon: BadgeDollarSign,
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-50 dark:bg-emerald-950'
    },
    {
        title: 'Total Clicks',
        value: '847',
        change: '+24% vs last month',
        trend: 'up',
        icon: Touchpad,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-50 dark:bg-blue-950'
    },
    {
        title: 'Conversions',
        value: '284',
        change: '+24% new',
        trend: 'up',
        icon: ChartBar,
        iconColor: 'text-violet-500',
        iconBg: 'bg-violet-50 dark:bg-violet-950'
    },
    {
        title: 'Avg Order Value',
        value: 'Rp 170.000',
        change: '+24% vs last month',
        trend: 'up',
        icon: CircleDollarSign,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-50 dark:bg-orange-950'
    }
];

export default function ProductsClient() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#1a1a18] dark:text-[#F9FAFB]">Pelacakan Produk</h1>
                    <p className="text-sm text-[#888780] dark:text-[#9CA3AF] mt-1">
                        Analisis dan tracking produk untuk setiap pelanggan
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 border-[#E2E0D8] dark:border-[#374151]">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888780] dark:text-[#9CA3AF]" />
                        <Input
                            placeholder="Cari produk..."
                            className="pl-9 w-[200px] border-[#E2E0D8] dark:border-[#374151] dark:bg-[#111827]"
                        />
                    </div>
                    <Button size="sm" className="bg-[#1a1a18] dark:bg-[#10B981] hover:bg-[#2a2a28] dark:hover:bg-[#059669] gap-2">
                        <Download className="w-4 h-4" />
                        Ekspor CSV
                    </Button>
                </div>
            </div>

            {/* Products Table */}
            <Card className="border-[#E2E0D8] dark:border-[#374151]">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                        Performa Produk
                    </CardTitle>
                    <CardDescription className="text-sm text-[#888780] dark:text-[#9CA3AF]">
                        Klik untuk melihat wawasan detail
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#E2E0D8] dark:border-[#374151]">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">ID</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Nama Produk</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Kategori</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Klik</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Nilai</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Konversi</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Tingkat</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Pendapatan</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Status</th>
                                    <th className="py-3 px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {productsData.map((product, index) => (
                                    <tr key={index} className="border-b border-[#E2E0D8] dark:border-[#374151] hover:bg-[#F8F7F4] dark:hover:bg-[#374151] transition-colors">
                                        <td className="py-4 px-4">
                                            <Badge variant="secondary" className="bg-[#1a1a18] dark:bg-[#374151] text-white text-xs px-2 py-1">
                                                {product.id}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="font-medium text-sm text-[#1a1a18] dark:text-[#F9FAFB]">{product.name}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="text-sm text-[#888780] dark:text-[#9CA3AF]">{product.category}</p>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-[#1a1a18] dark:text-[#F9FAFB]">{product.klik}</td>
                                        <td className="py-4 px-4 text-sm text-[#1a1a18] dark:text-[#F9FAFB]">{product.nilai}</td>
                                        <td className="py-4 px-4 text-sm text-[#1a1a18] dark:text-[#F9FAFB]">{product.konversi}</td>
                                        <td className="py-4 px-4 text-sm text-[#1a1a18] dark:text-[#F9FAFB]">{product.tingkat}</td>
                                        <td className="py-4 px-4 text-sm font-medium text-[#1a1a18] dark:text-[#F9FAFB]">{product.pendapatan}</td>
                                        <td className="py-4 px-4">
                                            <Badge
                                                variant="secondary"
                                                className={`text-xs ${product.status === 'Hot'
                                                    ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                                                    : product.status === 'Warm'
                                                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                    }`}
                                            >
                                                {product.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2E0D8] dark:border-[#374151]">
                        <p className="text-sm text-[#888780] dark:text-[#9CA3AF]">Menampilkan 5 dari 28 di 6 produk</p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="border-[#E2E0D8] dark:border-[#374151]">
                                &lt;
                            </Button>
                            <Button size="sm" className="bg-[#1a1a18] dark:bg-[#10B981] hover:bg-[#2a2a28] dark:hover:bg-[#059669]">
                                1
                            </Button>
                            <Button variant="outline" size="sm" className="border-[#E2E0D8] dark:border-[#374151]">
                                2
                            </Button>
                            <Button variant="outline" size="sm" className="border-[#E2E0D8] dark:border-[#374151]">
                                &gt;
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* VHAC Premium Performance Trends - Takes 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-[#E2E0D8] dark:border-[#374151]">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                VitaC Premium 1000mg - Performance Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Product Link Clicks */}
                                <div>
                                    <h4 className="text-sm font-medium text-[#1a1a18] dark:text-[#F9FAFB] mb-4">Product Link Clicks</h4>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={productLinkClicksData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E0D8" className="dark:stroke-[#374151]" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: '#888780', fontSize: 11 }}
                                                axisLine={{ stroke: '#E2E0D8' }}
                                            />
                                            <YAxis
                                                tick={{ fill: '#888780', fontSize: 11 }}
                                                axisLine={{ stroke: '#E2E0D8' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #E2E0D8',
                                                    borderRadius: '8px',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                dot={{ fill: '#3b82f6', r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Conversion Trend */}
                                <div>
                                    <h4 className="text-sm font-medium text-[#1a1a18] dark:text-[#F9FAFB] mb-4">Conversion Trend</h4>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={conversionTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E0D8" className="dark:stroke-[#374151]" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: '#888780', fontSize: 11 }}
                                                axisLine={{ stroke: '#E2E0D8' }}
                                            />
                                            <YAxis
                                                tick={{ fill: '#888780', fontSize: 11 }}
                                                axisLine={{ stroke: '#E2E0D8' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #E2E0D8',
                                                    borderRadius: '8px',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                dot={{ fill: '#10b981', r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {statsData.map((stat, index) => (
                            <Card key={index} className="border-[#E2E0D8] dark:border-[#374151]">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                                            <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                                        </div>
                                        {stat.trend === 'up' ? (
                                            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                    <p className="text-xs text-[#888780] dark:text-[#9CA3AF] mb-1">{stat.title}</p>
                                    <p className="text-xl font-bold text-[#1a1a18] dark:text-[#F9FAFB] mb-1">{stat.value}</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{stat.change}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* AI Product Insights - Takes 1 column */}
                <Card className="border-[#E2E0D8] dark:border-[#374151] bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                AI Product Insights
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Top Customer Demographic */}
                        <div className="p-4 bg-white dark:bg-[#1F2937] rounded-lg border border-[#E2E0D8] dark:border-[#374151]">
                            <h4 className="text-sm font-semibold text-[#1a1a18] dark:text-[#F9FAFB] mb-2">
                                Top Customer Demographic
                            </h4>
                            <p className="text-xs text-[#888780] dark:text-[#9CA3AF]">
                                Female, Age 25-34, Health-conscious
                            </p>
                        </div>

                        {/* Behavioral Approach */}
                        <div className="p-4 bg-white dark:bg-[#1F2937] rounded-lg border border-[#E2E0D8] dark:border-[#374151]">
                            <h4 className="text-sm font-semibold text-[#1a1a18] dark:text-[#F9FAFB] mb-2">
                                Behavioral Approach
                            </h4>
                            <p className="text-xs text-[#888780] dark:text-[#9CA3AF]">
                                Educational content about immunity benefits increases conversion rate
                            </p>
                        </div>

                        {/* Common Customer Objective */}
                        <div className="p-4 bg-white dark:bg-[#1F2937] rounded-lg border border-[#E2E0D8] dark:border-[#374151]">
                            <h4 className="text-sm font-semibold text-[#1a1a18] dark:text-[#F9FAFB] mb-2">
                                Common Customer Objective
                            </h4>
                            <ul className="text-xs text-[#888780] dark:text-[#9CA3AF] space-y-1">
                                <li>• Safety during pregnancy</li>
                                <li>• Dosage recommendations</li>
                                <li>• Product authenticity</li>
                            </ul>
                        </div>

                        {/* Recommended Upsell */}
                        <div className="p-4 bg-white dark:bg-[#1F2937] rounded-lg border border-[#E2E0D8] dark:border-[#374151]">
                            <h4 className="text-sm font-semibold text-[#1a1a18] dark:text-[#F9FAFB] mb-2">
                                Recommended Upsell
                            </h4>
                            <p className="text-xs text-[#888780] dark:text-[#9CA3AF]">
                                Customers buying this product have 67% probability of purchasing Omega-3 within 30 days
                            </p>
                        </div>

                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            Lihat Full Analysis
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
