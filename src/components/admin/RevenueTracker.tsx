import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Plus, TrendingUp, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CommissionPayment {
  id: string;
  payment_date: string;
  amount: number;
  source: string;
  notes: string | null;
  created_at: string;
}

const SOURCES = [
  'Amazon Associates',
  'ShareASale',
  'Commission Junction',
  'Rakuten',
  'Other',
];

export default function RevenueTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Amazon Associates');
  const [notes, setNotes] = useState('');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['commission-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_payments')
        .select('*')
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data as CommissionPayment[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payment: { payment_date: string; amount: number; source: string; notes: string | null }) => {
      const { error } = await supabase.from('commission_payments').insert(payment);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-payments'] });
      toast({ title: 'Payment logged', description: 'Commission payment has been recorded.' });
      setIsOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to log payment.', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
    setAmount('');
    setSource('Amazon Associates');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid amount.', variant: 'destructive' });
      return;
    }
    addMutation.mutate({
      payment_date: paymentDate,
      amount: parseFloat(amount),
      source,
      notes: notes || null,
    });
  };

  // Calculate totals
  const totalAllTime = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEnd = endOfMonth(new Date());
  const totalThisMonth = payments
    .filter(p => {
      const date = new Date(p.payment_date);
      return date >= thisMonthStart && date <= thisMonthEnd;
    })
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Generate monthly data for chart (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const total = payments
      .filter(p => {
        const date = new Date(p.payment_date);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);
    return {
      month: format(monthDate, 'MMM'),
      earnings: total,
    };
  });

  return (
    <Card className="bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-green-500" />
          Revenue Tracker
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Log Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Commission Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-date">Date</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
              <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Saving...' : 'Log Payment'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-green-500/10 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              All Time
            </div>
            <div className="text-2xl font-bold text-green-600">${totalAllTime.toFixed(2)}</div>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              This Month
            </div>
            <div className="text-2xl font-bold text-blue-600">${totalThisMonth.toFixed(2)}</div>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Payments */}
        {payments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Payments</h4>
            <div className="max-h-[120px] overflow-y-auto space-y-1">
              {payments.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{format(new Date(p.payment_date), 'MMM d, yyyy')}</span>
                  <span className="text-xs text-muted-foreground">{p.source}</span>
                  <span className="font-medium text-green-600">${Number(p.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
