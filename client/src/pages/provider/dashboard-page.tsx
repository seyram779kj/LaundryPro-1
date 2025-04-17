import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import ProviderSidebar from "@/components/layout/provider-sidebar";
import ProviderHeader from "@/components/layout/provider-header";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { Order } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

// Dashboard stat card component
function StatCard({ icon, title, value, change = null, iconColor }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: { value: string; isPositive: boolean } | null;
  iconColor: string;
}) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${iconColor}`}>
            {icon}
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">{value}</h2>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
        </div>
        {change && (
          <div className={`mt-4 flex items-center text-sm ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 mr-1.5 ${change.isPositive ? 'rotate-0' : 'rotate-180'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>{change.value} from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProviderDashboardPage() {
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/provider/dashboard"],
  });

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const formatOrderStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-gray-100 text-gray-800",
      confirmed: "bg-blue-100 text-blue-800",
      picked_up: "bg-indigo-100 text-indigo-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      quality_check: "bg-purple-100 text-purple-800",
      ready_for_delivery: "bg-pink-100 text-pink-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-cyan-100 text-cyan-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ProviderSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <ProviderHeader />
        
        <main className="flex-1 px-4 sm:px-6 py-8 overflow-y-auto">
          {isLoading || ordersLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="ml-2">Loading dashboard data...</span>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Overview of your laundry business performance</p>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  icon={<svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>}
                  title="Active Orders"
                  value={dashboardData?.activeOrderCount || "0"}
                  change={{ value: "12%", isPositive: true }}
                  iconColor="bg-blue-100 text-blue-500"
                />
                
                <StatCard
                  icon={<svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>}
                  title="Revenue (This Week)"
                  value={`$${dashboardData?.weeklyRevenue?.toFixed(2) || "0.00"}`}
                  change={{ value: "8%", isPositive: true }}
                  iconColor="bg-green-100 text-green-500"
                />
                
                <StatCard
                  icon={<svg className="h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>}
                  title="Laundry Processed"
                  value={`${dashboardData?.processedWeight?.toFixed(1) || "0"} lb`}
                  change={{ value: "5%", isPositive: true }}
                  iconColor="bg-purple-100 text-purple-500"
                />
                
                <StatCard
                  icon={<svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>}
                  title="Customer Rating"
                  value="4.8/5"
                  iconColor="bg-yellow-100 text-yellow-500"
                />
              </div>
              
              {/* Recent Orders */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <a href="#/provider/orders" className="text-sm text-secondary-600 hover:text-secondary-700 font-medium">View all</a>
                </div>
                
                <Card>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(dashboardData?.recentOrders || []).map((order: Order) => {
                          const customer = { name: "Client", email: "client@example.com" };
                          
                          return (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order.orderNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                    {customer.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                    <div className="text-xs text-gray-500">{customer.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.serviceTypeId ? "Wash & Fold" : "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {formatOrderStatus(order.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${order.total?.toFixed(2) || "0.00"}
                              </td>
                            </tr>
                          );
                        })}
                        
                        {(!dashboardData?.recentOrders || dashboardData.recentOrders.length === 0) && (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                              No orders found. Start by creating your service offerings.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
              
              {/* Weekly Performance */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h2>
                <Card className="p-6">
                  <div className="h-64">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-md font-medium mb-3">Order Completion Rate</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">In Progress</span>
                              <span className="text-sm font-medium">42%</span>
                            </div>
                            <Progress value={42} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Ready for Pickup</span>
                              <span className="text-sm font-medium">18%</span>
                            </div>
                            <Progress value={18} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Completed</span>
                              <span className="text-sm font-medium">78%</span>
                            </div>
                            <Progress value={78} className="h-2" />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium mb-3">Service Breakdown</h3>
                        <div className="flex flex-col space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                              <span className="text-sm">Wash & Fold</span>
                            </div>
                            <span className="text-sm font-medium">65%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              <span className="text-sm">Dry Cleaning</span>
                            </div>
                            <span className="text-sm font-medium">20%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                              <span className="text-sm">Ironing</span>
                            </div>
                            <span className="text-sm font-medium">15%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
