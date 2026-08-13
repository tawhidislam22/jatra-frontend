import { Button } from "@/components/ui/button";

export default function MyVehiclesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Vehicles</h1>
        <Button>Add Vehicle</Button>
      </div>
      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 font-semibold">Make/Model</th>
              <th className="p-4 font-semibold">Year</th>
              <th className="p-4 font-semibold">License Plate</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-4">Ford Mustang</td>
              <td className="p-4">2021</td>
              <td className="p-4 font-mono">FAST-01</td>
              <td className="p-4">
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-xs font-medium">Active</span>
              </td>
              <td className="p-4 text-right">
                <Button variant="outline" size="sm">Request Service</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
