import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { eur, monthOf } from '@/lib/format';

export function AnalyticsPage() {
  const { activeHousehold } = useAuth();
  const [month, setMonth] = useState(monthOf(new Date()));

  const { data: byCat } = useQuery({
    queryKey: ['by-category', activeHousehold?.id, month],
    queryFn: () => api(`/analytics/by-category?monthYear=${month}`),
    enabled: !!activeHousehold,
  });
  const { data: trend } = useQuery({
    queryKey: ['trend', activeHousehold?.id],
    queryFn: () => api('/analytics/monthly-trend?months=12'),
    enabled: !!activeHousehold,
  });
  const { data: cmp } = useQuery({
    queryKey: ['user-cmp', activeHousehold?.id, month],
    queryFn: () => api(`/analytics/user-comparison?monthYear=${month}`),
    enabled: !!activeHousehold,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analíticas</h1>
        <Input type="month" className="w-44" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gasto por categoría</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCat?.byCategory ?? []} dataKey="total" nameKey="name" outerRadius={100} label>
                  {(byCat?.byCategory ?? []).map((c, i) => (
                    <Cell key={i} fill={c.color ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => eur(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia (12 meses)</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend?.trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthYear" />
                <YAxis />
                <Tooltip formatter={(v) => eur(v)} />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Comparativa por miembro</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cmp?.users ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayName" />
                <YAxis />
                <Tooltip formatter={(v) => eur(v)} />
                <Bar dataKey="total" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
