import { Wallet, ArrowUpRight, ArrowDownRight, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WalletPage() {
  const transactions = [
    { id: 1, type: "deposit", amount: 500, date: "Aug 10, 2026", status: "completed", description: "Added funds" },
    { id: 2, type: "payment", amount: -150, date: "Aug 12, 2026", status: "completed", description: "Service Booking - Jatra Premier Service" },
    { id: 3, type: "payment", amount: -45, date: "Aug 05, 2026", status: "completed", description: "Car Rental Deposit" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Wallet & Transactions</h2>
          <p className="text-muted-foreground">Manage your balance, payments, and view transaction history.</p>
        </div>
        <div className="flex gap-2">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Funds
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary text-primary-foreground p-6 rounded-lg shadow-md col-span-1 md:col-span-1 flex flex-col justify-between h-48 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Wallet className="h-24 w-24" />
          </div>
          <div>
            <p className="font-medium opacity-80 uppercase tracking-widest text-xs">Total Balance</p>
            <h3 className="text-4xl font-bold mt-2">$305.00</h3>
          </div>
          <p className="text-sm opacity-80">Available for rentals and services</p>
        </div>

        <div className="bg-card border p-6 rounded-lg shadow-sm col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          
          <div className="space-y-4">
            {transactions.map(t => (
              <div key={t.id} className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-md transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${t.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'deposit' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{t.date} &middot; <span className="capitalize">{t.status}</span></p>
                  </div>
                </div>
                <div className={`font-bold ${t.type === 'deposit' ? 'text-emerald-600' : 'text-[#1a1a1a]'}`}>
                  {t.type === 'deposit' ? '+' : ''}{t.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
