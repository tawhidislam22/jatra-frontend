export default function DashboardOverview() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-primary text-primary-foreground rounded-xl shadow-sm">
          <h3 className="text-sm font-medium opacity-80">Active Bookings</h3>
          <p className="text-4xl font-extrabold mt-2">2</p>
        </div>
        <div className="p-6 bg-card border rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">My Vehicles</h3>
          <p className="text-4xl font-extrabold mt-2">1</p>
        </div>
        <div className="p-6 bg-card border rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Service Requests</h3>
          <p className="text-4xl font-extrabold mt-2">0</p>
        </div>
      </div>
      
      <div className="mt-8 bg-card border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <div>
              <p className="font-semibold">Booked Toyota Camry</p>
              <p className="text-sm text-muted-foreground">Oct 10 - Oct 15</p>
            </div>
            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">Confirmed</span>
          </div>
          <div className="flex justify-between items-center pb-4">
            <div>
              <p className="font-semibold">Service completed for Ford Mustang</p>
              <p className="text-sm text-muted-foreground">Sep 20</p>
            </div>
            <span className="bg-muted text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded text-xs font-medium">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
