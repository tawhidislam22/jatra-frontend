export default function ServiceRequestsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Service Requests</h1>
      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 font-semibold">Service ID</th>
              <th className="p-4 font-semibold">Vehicle</th>
              <th className="p-4 font-semibold">Center</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-4 font-mono">REQ-8910</td>
              <td className="p-4">Ford Mustang</td>
              <td className="p-4">Downtown Auto Care</td>
              <td className="p-4">
                <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded text-xs font-medium">IN_PROGRESS</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
