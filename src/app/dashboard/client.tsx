'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Percent,
    ShoppingCart,
    Users,
    Filter,
    Search,
    ChevronRight,
    ExternalLink,
    Clock
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Static data
const statsData = [
    {
        title: 'Transaksi Sukses',
        value: 'Rp 847.392.000',
        subtitle: 'Marketing funds only',
        change: '+4%',
        trend: 'up',
        icon: DollarSign,
        iconBg: 'bg-emerald-50 dark:bg-emerald-950',
        iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
        title: 'Tingkat Konversi',
        value: '34.2%',
        subtitle: 'vs last month',
        change: '+8.3%',
        trend: 'up',
        icon: Percent,
        iconBg: 'bg-emerald-50 dark:bg-emerald-950',
        iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
        title: 'Total Lead',
        value: '247',
        subtitle: 'vs last month',
        change: '+23.5%',
        trend: 'up',
        icon: ShoppingCart,
        iconBg: 'bg-emerald-50 dark:bg-emerald-950',
        iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
        title: 'Jumlah Klik',
        value: '2.847',
        subtitle: 'vs last month',
        change: '-11%',
        trend: 'down',
        icon: Users,
        iconBg: 'bg-red-50 dark:bg-red-950',
        iconColor: 'text-red-600 dark:text-red-400'
    }
];

const productsData = [
    {
        id: 'PRD-001',
        name: 'VHAC Premium 1000mg',
        category: 'Kecantikan',
        klik: 947,
        konversi: 324,
        tingkat: '34.2%',
        revenue: 'Rp 44.382.000',
        status: 'Hot'
    },
    {
        id: 'PRD-002',
        name: 'Kausoft Plus',
        category: 'Kecantikan',
        klik: 1024,
        konversi: 268,
        tingkat: '26.1%',
        revenue: 'Rp 38.244.000',
        status: 'Hot'
    },
    {
        id: 'PRD-003',
        name: 'Omega-3 Minyak Ikan',
        category: 'Jantung',
        klik: 892,
        konversi: 247,
        tingkat: '27.7%',
        revenue: 'Rp 29.847.000',
        status: 'Warm'
    },
    {
        id: 'PRD-004',
        name: 'Paket Bundle Wellness',
        category: 'Bundle',
        klik: 768,
        konversi: 76,
        tingkat: '9.9%',
        revenue: 'Rp 22.384.000',
        status: 'Warm'
    },
    {
        id: 'PRD-005',
        name: 'Collagen Beauty Plus',
        category: 'Kecantikan',
        klik: 437,
        konversi: 64,
        tingkat: '14.6%',
        revenue: 'Rp 18.482.000',
        status: 'Cold'
    }
];

const leadPriorities = [
    {
        name: 'Siti Nurhaliza',
        email: 'siti@gmail.com',
        score: 'Score: 94',
        status: 'Potensi ini sudah mencapai tahap akhir, tindakan segera dibutuhkan',
        action: 'Buka Chat WhatsApp',
        priority: 'Hot'
    },
    {
        name: 'Budi Santoso',
        email: 'budi@plus.co.id',
        score: 'Score: 87',
        status: 'Klien berpotensi tinggi untuk upsell produk bundle',
        action: 'Buka Chat WhatsApp',
        priority: 'Hot'
    },
    {
        name: 'Dewi Lestari',
        email: 'dewi@wellness',
        score: 'Score: 82',
        status: 'Menunjukkan minat, butuh follow up lebih lanjut',
        action: 'Buka Chat WhatsApp',
        priority: 'medium'
    }
];

const automationUpdates = [
    {
        title: 'Waku Keuangan Optimal',
        description: 'Pelanggan yang membeli VHAC mendapat email tindak dengan follow-up dalam 3 hari.',
        link: 'Lihat Strategi →',
        time: '2 jam lalu'
    },
    {
        title: 'Laporan Penjualan Produk',
        description: 'Omega-3 Minyak Ikan mengalami lonjakan 45% Pertimbangkan promosi bundle melalui.',
        link: 'Lihat Produk →',
        time: '5 jam lalu'
    },
    {
        title: 'Pembaruan Hot Lead',
        description: '5 lead baru ditambahkan hari ini! Segera tindak lanjut. Prioritaskan follow-up untuk konversi.',
        link: 'Lihat Lead →',
        time: '1 hari lalu'
    },
    {
        title: 'Pola Konversi',
        description: 'Tingkat konversi meningkat pada produk VHAC sebesar 12%. Untuk grafik lengkap, klik di bawah.',
        link: 'Pelajari Lebih Lanjut →',
        time: '2 hari lalu'
    }
];

const salesTrendData = [
    { month: 'May', value: 30 },
    { month: 'Jun', value: 35 },
    { month: 'Jul', value: 32 },
    { month: 'Aug', value: 38 },
    { month: 'Sep', value: 42 },
    { month: 'Oct', value: 45 },
    { month: 'Nov', value: 40 },
    { month: 'Dec', value: 48 },
    { month: 'Jan', value: 52 },
    { month: 'Feb', value: 50 },
    { month: 'Mar', value: 55 },
    { month: 'Apr', value: 58 },
    { month: 'May', value: 60 }
];

const topConvertingProducts = [
    { name: 'VHAC Premium 1000mg', value: 44.8, color: 'bg-emerald-500' },
    { name: 'Kausoft Plus', value: 38.2, color: 'bg-emerald-500' },
    { name: 'Omega-3 Minyak Ikan', value: 29.8, color: 'bg-emerald-500' },
    { name: 'Paket Bundle Wellness', value: 22.4, color: 'bg-emerald-500' },
    { name: 'Collagen Beauty Plus', value: 18.5, color: 'bg-emerald-500' }
];

export default function DashboardClient() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#1a1a18] dark:text-[#F9FAFB]">Dashboard</h1>
                    <p className="text-sm text-[#888780] dark:text-[#9CA3AF] mt-1">
                        Pusat analitik penjualan Anda - lihat data apa yang perlu Anda perhatikan sekarang
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#888780] dark:text-[#9CA3AF]">
                    <Clock className="w-4 h-4" />
                    <span>26 Sep 2025 - 31 May 12:08</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat, index) => (
                    <Card key={index} className="border-[#E2E0D8] dark:border-[#374151]">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                                            <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                                        </div>
                                        <span className={`text-xs font-medium ${stat.trend === 'up'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#888780] dark:text-[#9CA3AF] mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-[#1a1a18] dark:text-[#F9FAFB]">{stat.value}</p>
                                    <p className="text-xs text-[#888780] dark:text-[#9CA3AF] mt-1">{stat.subtitle}</p>
                                </div>
                                {stat.trend === 'up' ? (
                                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Products Table */}
            <Card className="border-[#E2E0D8] dark:border-[#374151]">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                Performa Produk
                            </CardTitle>
                            <CardDescription className="text-sm text-[#888780] dark:text-[#9CA3AF]">
                                Produk mana yang paling banyak konversi
                            </CardDescription>
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
                            <Button size="sm" className="bg-[#1a1a18] dark:bg-[#10B981] hover:bg-[#2a2a28] dark:hover:bg-[#059669]">
                                + Lihat Lebih Banyak Produk
                            </Button>
                        </div>
                    </div>
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
                                    <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Konversi</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Tingkat</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-[#888780] dark:text-[#9CA3AF]">Revenue</th>
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
                                        <td className="py-4 px-4 text-sm text-[#1a1a18] dark:text-[#F9FAFB]">{product.konversi}</td>
                                        <td className="py-4 px-4 text-sm text-[#1a1a18] dark:text-[#F9FAFB]">{product.tingkat}</td>
                                        <td className="py-4 px-4 text-sm font-medium text-[#1a1a18] dark:text-[#F9FAFB]">{product.revenue}</td>
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
                        <p className="text-sm text-[#888780] dark:text-[#9CA3AF]">Menampilkan 5 dari 28 di 4 produk</p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="border-[#E2E0D8] dark:border-[#374151]">
                                Sebelumnya
                            </Button>
                            <Button size="sm" className="bg-[#1a1a18] dark:bg-[#10B981] hover:bg-[#2a2a28] dark:hover:bg-[#059669]">
                                1
                            </Button>
                            <Button variant="outline" size="sm" className="border-[#E2E0D8] dark:border-[#374151]">
                                Berikutnya
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lead Priorities & Automation Updates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Priorities */}
                <Card className="border-[#E2E0D8] dark:border-[#374151]">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                    Lead Priorities
                                </CardTitle>
                                <CardDescription className="text-sm text-[#888780] dark:text-[#9CA3AF]">
                                    Pelanggan berikut yang perlu Anda prioritaskan
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
                                3 Urgent
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {leadPriorities.map((lead, index) => (
                            <div key={index} className="p-4 rounded-lg border border-[#E2E0D8] dark:border-[#374151] bg-white dark:bg-[#111827]">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-medium text-sm text-[#1a1a18] dark:text-[#F9FAFB]">{lead.name}</p>
                                        <p className="text-xs text-[#888780] dark:text-[#9CA3AF]">{lead.email}</p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={`text-xs ${lead.priority === 'Hot'
                                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {lead.score}
                                    </Badge>
                                </div>
                                <p className="text-xs text-[#888780] dark:text-[#9CA3AF] mb-3">{lead.status}</p>
                                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    {lead.action}
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Automation Updates */}
                <Card className="border-[#E2E0D8] dark:border-[#374151]">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                            Wawasan Otomatis
                        </CardTitle>
                        <CardDescription className="text-sm text-[#888780] dark:text-[#9CA3AF]">
                            Data penting WhatsApp AI Anda untuk mengoptimalkan penjualan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {automationUpdates.map((update, index) => (
                            <div key={index} className="pb-4 border-b border-[#E2E0D8] dark:border-[#374151] last:border-0 last:pb-0">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-sm text-[#1a1a18] dark:text-[#F9FAFB]">{update.title}</h4>
                                    {index === 0 && (
                                        <Badge variant="secondary" className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs">
                                            Baru
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-[#888780] dark:text-[#9CA3AF] mb-2">{update.description}</p>
                                <div className="flex items-center justify-between">
                                    <button className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                                        {update.link}
                                    </button>
                                    <span className="text-xs text-[#888780] dark:text-[#9CA3AF]">{update.time}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Sales Trend & Top Converting Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Performance Trend */}
                <Card className="border-[#E2E0D8] dark:border-[#374151]">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                            Sales Performance Trend
                        </CardTitle>
                        <CardDescription className="text-sm text-[#888780] dark:text-[#9CA3AF]">
                            Gambaran revenue & ROI penjualan setiap bulan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={salesTrendData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E0D8" className="dark:stroke-[#374151]" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: '#888780', fontSize: 11 }}
                                    axisLine={{ stroke: '#E2E0D8' }}
                                    className="dark:[&_line]:stroke-[#374151]"
                                />
                                <YAxis
                                    tick={{ fill: '#888780', fontSize: 11 }}
                                    axisLine={{ stroke: '#E2E0D8' }}
                                    className="dark:[&_line]:stroke-[#374151]"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #E2E0D8',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Converting Products */}
                <Card className="border-[#E2E0D8] dark:border-[#374151]">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                            Top Converting Products
                        </CardTitle>
                        <CardDescription className="text-sm text-[#888780] dark:text-[#9CA3AF]">
                            What customers are buying most
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topConvertingProducts.map((product, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-[#1a1a18] dark:text-[#F9FAFB]">{product.name}</span>
                                    <span className="text-sm font-medium text-[#1a1a18] dark:text-[#F9FAFB]">Rp {product.value} jt</span>
                                </div>
                                <div className="w-full bg-[#F8F7F4] dark:bg-[#374151] rounded-full h-2">
                                    <div
                                        className={`${product.color} h-2 rounded-full transition-all`}
                                        style={{ width: `${(product.value / 50) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
