import type { Stats } from '@/types/link-clicks';

interface Props {
    stats: Stats;
}

export function StatsCards({ stats }: Props) {
    const avgLinksPerProduct =
        stats.total_products > 0
            ? Math.round(stats.total_links_generated / stats.total_products)
            : 0;

    const cards = [
        {
            label: 'Total Links',
            value: stats.total_links_generated.toLocaleString(),
            description: 'link yang di-generate',
            color: 'text-[#047857]',
            bgColor: 'bg-[#D1FAE5]',
            delay: 'delay-75',
        },
        {
            label: 'Total Products',
            value: stats.total_products.toLocaleString(),
            description: 'produk terdaftar',
            color: 'text-[#0369A1]',
            bgColor: 'bg-[#BAE6FD]',
            delay: 'delay-150',
        },
        {
            label: 'Total Categories',
            value: stats.total_categories.toLocaleString(),
            description: 'kategori aktif',
            color: 'text-[#B45309]',
            bgColor: 'bg-[#FED7AA]',
            delay: 'delay-300',
        },
        {
            label: 'Avg Links/Product',
            value: avgLinksPerProduct.toLocaleString(),
            description: 'rata-rata per produk',
            color: 'text-[#7C3AED]',
            bgColor: 'bg-[#DDD6FE]',
            delay: 'delay-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-5 w-full">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`
            bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl p-4 min-w-0
            animate-in fade-in slide-in-from-bottom-4 duration-500 ${card.delay}
            hover:shadow-lg hover:-translate-y-1 transition-all
          `}
                >
                    <p className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide mb-2">
                        {card.label}
                    </p>
                    <div className={`inline-flex items-center justify-center ${card.bgColor} dark:opacity-90 rounded-lg px-3 py-1 mb-2`}>
                        <p className={`text-[28px] font-bold leading-none ${card.color} transition-colors`}>
                            {card.value}
                        </p>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] dark:text-[#6B7280] mt-1.5">{card.description}</p>
                </div>
            ))}
        </div>
    );
}
