import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface LinkClick {
    id: number;
    track_code: string;
    product: { name: string };
    original_url: string;
    clicked_at: string | null;
    ip_address: string | null;
    created_at: string;
}

interface Props {
    clicks: any;
    stats: any;
    products: any;
    filters: any;
}

export default function LinkClicksIndex({ clicks, stats, products, filters }: Props) {
    return (
        <>
            <Head title="Link Click Tracking" />

            <div className="space-y-6 p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Generated</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.total_clicks}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Sudah Diklik</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600">{stats.clicked}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Belum Diklik</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Produk Paling Banyak Diklik</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Isi dengan tabel top products */}
                    </CardContent>
                </Card>

                {/* Main Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Link Click</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead>Track Code</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clicks.data.map((click: LinkClick) => (
                                    <TableRow key={click.id}>
                                        <TableCell>{click.product.name}</TableCell>
                                        <TableCell className="font-mono text-sm">{click.track_code}</TableCell>
                                        <TableCell>{click.ip_address || '-'}</TableCell>
                                        <TableCell>{format(new Date(click.created_at), 'dd MMM yyyy HH:mm')}</TableCell>
                                        <TableCell>
                                            {click.clicked_at ? (
                                                <Badge variant="default">Clicked</Badge>
                                            ) : (
                                                <Badge variant="secondary">Pending</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}