"use client";

import { useEffect, useState } from "react";
import { paymentService } from "@/services/payment.service";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await paymentService.getPaymentHistory();
        if (response && response.data) {
          setPayments(response.data);
        } else if (Array.isArray(response)) {
          setPayments(response);
        }
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading Payments...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Payment History</h1>
      <div className="bg-card border rounded-xl overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No payment history found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-muted-foreground">
                    {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'Pending'}
                  </td>
                  <td className="p-4 font-medium text-primary">
                    {payment.rentalBookingId ? "Vehicle Rental" : payment.serviceRequestId ? "Service Request" : "Emergency Assistance"}
                    <div className="text-xs font-normal text-muted-foreground tracking-widest uppercase mt-1">ID: {payment.transactionId?.substring(0, 15) || payment.id.substring(0, 8)}...</div>
                  </td>
                  <td className="p-4 font-black">${payment.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      payment.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
