export default function PaymentsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Payment History</h1>
      <div className="bg-card border rounded-xl overflow-hidden">
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
            <tr className="border-t">
              <td className="p-4 text-muted-foreground">Oct 05, 2024</td>
              <td className="p-4">Rental Booking - Toyota Camry</td>
              <td className="p-4 font-medium">$150.00</td>
              <td className="p-4">
                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">Paid</span>
              </td>
            </tr>
            <tr className="border-t">
              <td className="p-4 text-muted-foreground">Sep 20, 2024</td>
              <td className="p-4">Service Request - Ford Mustang (Oil Change)</td>
              <td className="p-4 font-medium">$85.00</td>
              <td className="p-4">
                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">Paid</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
