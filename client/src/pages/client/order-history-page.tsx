import { useState } from "react";
import ClientHeader from "@/components/layout/client-header";
import ClientFooter from "@/components/layout/client-footer";
import OrderHistoryList from "@/components/order/order-history-list";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Order } from "@shared/schema";

export default function OrderHistoryPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch orders
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Filter orders based on selected filters
  const filteredOrders = orders?.filter(order => {
    // Status filter
    if (statusFilter && order.status !== statusFilter) {
      return false;
    }
    
    // Date filter
    if (dateFilter) {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      let filterDate = new Date();
      
      if (dateFilter === "30days") {
        filterDate.setDate(now.getDate() - 30);
      } else if (dateFilter === "3months") {
        filterDate.setMonth(now.getMonth() - 3);
      } else if (dateFilter === "year") {
        filterDate.setFullYear(now.getFullYear() - 1);
      }
      
      if (orderDate < filterDate) {
        return false;
      }
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.orderNumber?.toLowerCase().includes(query) ||
        String(order.total).includes(query) ||
        order.status.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <ClientHeader />
      
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Order History</h1>
          
          <Card className="mb-6">
            <CardHeader className="pb-3 flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-medium">Your Past Orders</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>
              
              <div className="mt-2 sm:mt-0 w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </CardHeader>
            
            {showFilters && (
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select
                    value={statusFilter || ""}
                    onValueChange={(value) => setStatusFilter(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="picked_up">Picked Up</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="quality_check">Quality Check</SelectItem>
                      <SelectItem value="ready_for_delivery">Ready for Delivery</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <Select
                    value={dateFilter || ""}
                    onValueChange={(value) => setDateFilter(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All time</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="3months">Last 3 months</SelectItem>
                      <SelectItem value="year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      setStatusFilter(null);
                      setDateFilter(null);
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}

            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading your orders...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Error loading orders. Please try again later.</p>
                </div>
              ) : filteredOrders && filteredOrders.length > 0 ? (
                <OrderHistoryList orders={filteredOrders} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No orders found matching your filters.</p>
                  {(statusFilter || dateFilter || searchQuery) && (
                    <Button 
                      variant="link" 
                      className="mt-2"
                      onClick={() => {
                        setStatusFilter(null);
                        setDateFilter(null);
                        setSearchQuery("");
                      }}
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <ClientFooter />
    </div>
  );
}
