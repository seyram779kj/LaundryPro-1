import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Order } from "@shared/schema";
import ProviderSidebar from "@/components/layout/provider-sidebar";
import ProviderHeader from "@/components/layout/provider-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Search, Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

export default function OrdersPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  
  // Fetch orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Fetch service types
  const { data: serviceTypes } = useQuery({
    queryKey: ["/api/service-types"],
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await apiRequest("POST", `/api/orders/${orderId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Status updated",
        description: "Order status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle status change
  const handleStatusChange = (orderId: number, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  // Format order status for display
  const formatOrderStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get status badge color
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

  // Get first letter of each word for customer initials
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  // Filter orders based on selected filters
  const filteredOrders = orders?.filter(order => {
    // Status filter
    if (statusFilter && order.status !== statusFilter) {
      return false;
    }

    // Service filter
    if (serviceFilter && String(order.serviceTypeId) !== serviceFilter) {
      return false;
    }
    
    // Date filter
    if (dateFilter) {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      let filterDate = new Date();
      
      if (dateFilter === "today") {
        filterDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === "yesterday") {
        filterDate.setDate(now.getDate() - 1);
        filterDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === "week") {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === "month") {
        filterDate.setMonth(now.getMonth() - 1);
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
        String(order.total).includes(query)
      );
    }
    
    return true;
  });

  // Show order details
  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ProviderSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <ProviderHeader />
        
        <main className="flex-1 px-4 sm:px-6 py-8 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and update customer orders</p>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="w-full md:w-auto flex-1 md:max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Orders</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Order ID or customer name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="w-full md:w-auto flex-1 md:max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select
                    value={statusFilter || ""}
                    onValueChange={(value) => setStatusFilter(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
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
                
                <div className="w-full md:w-auto flex-1 md:max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <Select 
                    value={serviceFilter || ""}
                    onValueChange={(value) => setServiceFilter(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Services</SelectItem>
                      {serviceTypes?.map((service) => (
                        <SelectItem key={service.id} value={String(service.id)}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-auto flex-1 md:max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <Select
                    value={dateFilter || ""}
                    onValueChange={(value) => setDateFilter(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order List */}
          <Card>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading orders...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items/Weight</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders && filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => {
                        // Find service type name
                        const serviceType = serviceTypes?.find(
                          (service) => service.id === order.serviceTypeId
                        );
                        
                        return (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                  C{order.clientId}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">Client {order.clientId}</div>
                                  <div className="text-xs text-gray-500">client{order.clientId}@example.com</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {serviceType?.name || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.quantity} {serviceType?.unit || "items"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.createdAt ? (
                                <>
                                  <div>{format(new Date(order.createdAt), 'MMM d, yyyy')}</div>
                                  <div className="text-xs text-gray-400">
                                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                  </div>
                                </>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value)}
                                disabled={updateStatusMutation.isPending}
                              >
                                <SelectTrigger className={`text-xs h-8 ${getStatusColor(order.status)}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="picked_up">Picked Up</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="quality_check">Quality Check</SelectItem>
                                  <SelectItem value="ready_for_delivery">Ready for Delivery</SelectItem>
                                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${order.total?.toFixed(2) || "0.00"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-600 hover:text-gray-900 mr-2"
                                onClick={() => showOrderDetails(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary hover:text-primary-dark"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          {searchQuery || statusFilter || serviceFilter || dateFilter
                            ? "No orders found matching your filters."
                            : "No orders found. Once you receive orders, they will appear here."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {filteredOrders && filteredOrders.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button variant="outline" disabled>Previous</Button>
                  <Button variant="outline">Next</Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to{" "}
                      <span className="font-medium">{filteredOrders.length}</span> of{" "}
                      <span className="font-medium">{filteredOrders.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <Button variant="outline" disabled className="relative inline-flex items-center px-2 py-2 rounded-l-md">
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </Button>
                      <Button variant="outline" className="relative inline-flex items-center px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        1
                      </Button>
                      <Button variant="outline" disabled className="relative inline-flex items-center px-2 py-2 rounded-r-md">
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Order Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="text-sm font-medium">Status:</div>
                      <div className="text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {formatOrderStatus(selectedOrder.status)}
                        </span>
                      </div>
                      
                      <div className="text-sm font-medium">Created:</div>
                      <div className="text-sm">
                        {selectedOrder.createdAt
                          ? format(new Date(selectedOrder.createdAt), 'MMM d, yyyy h:mm a')
                          : "N/A"}
                      </div>
                      
                      <div className="text-sm font-medium">Scheduled Pickup:</div>
                      <div className="text-sm">
                        {selectedOrder.scheduledPickupTime
                          ? format(new Date(selectedOrder.scheduledPickupTime), 'MMM d, yyyy h:mm a')
                          : "Not scheduled"}
                      </div>
                      
                      <div className="text-sm font-medium">Scheduled Delivery:</div>
                      <div className="text-sm">
                        {selectedOrder.scheduledDeliveryTime
                          ? format(new Date(selectedOrder.scheduledDeliveryTime), 'MMM d, yyyy h:mm a')
                          : "Not scheduled"}
                      </div>
                      
                      <div className="text-sm font-medium">Actual Pickup:</div>
                      <div className="text-sm">
                        {selectedOrder.actualPickupTime
                          ? format(new Date(selectedOrder.actualPickupTime), 'MMM d, yyyy h:mm a')
                          : "Not picked up yet"}
                      </div>
                      
                      <div className="text-sm font-medium">Actual Delivery:</div>
                      <div className="text-sm">
                        {selectedOrder.actualDeliveryTime
                          ? format(new Date(selectedOrder.actualDeliveryTime), 'MMM d, yyyy h:mm a')
                          : "Not delivered yet"}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Service Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="text-sm font-medium">Service Type:</div>
                      <div className="text-sm">
                        {serviceTypes?.find(s => s.id === selectedOrder.serviceTypeId)?.name || "Unknown"}
                      </div>
                      
                      <div className="text-sm font-medium">Quantity:</div>
                      <div className="text-sm">
                        {selectedOrder.quantity} {serviceTypes?.find(s => s.id === selectedOrder.serviceTypeId)?.unit || "items"}
                      </div>
                      
                      <div className="text-sm font-medium">Sub-Total:</div>
                      <div className="text-sm">${(selectedOrder.total - (selectedOrder.tax || 0) - (selectedOrder.deliveryFee || 0)).toFixed(2)}</div>
                      
                      <div className="text-sm font-medium">Delivery Fee:</div>
                      <div className="text-sm">${selectedOrder.deliveryFee?.toFixed(2) || "0.00"}</div>
                      
                      <div className="text-sm font-medium">Tax:</div>
                      <div className="text-sm">${selectedOrder.tax?.toFixed(2) || "0.00"}</div>
                      
                      <div className="text-sm font-medium">Total:</div>
                      <div className="text-sm font-bold">${selectedOrder.total?.toFixed(2) || "0.00"}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedOrder.specialInstructions && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Special Instructions</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedOrder.specialInstructions}</p>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Status Updates</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
                    <div className="space-y-6 ml-10 relative">
                      <div className="relative">
                        <div className="absolute -left-10 mt-1 h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                          <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formatOrderStatus(selectedOrder.status)}</p>
                          <p className="text-xs text-gray-500">
                            {selectedOrder.updatedAt
                              ? format(new Date(selectedOrder.updatedAt), 'MMM d, yyyy h:mm a')
                              : format(new Date(selectedOrder.createdAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-10 mt-1 h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                          <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Order Created</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(selectedOrder.createdAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setOrderDetailsOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              // Handle updating order status
              if (selectedOrder) {
                const nextStatus = {
                  pending: "confirmed",
                  confirmed: "picked_up",
                  picked_up: "in_progress",
                  in_progress: "quality_check",
                  quality_check: "ready_for_delivery",
                  ready_for_delivery: "out_for_delivery",
                  out_for_delivery: "delivered",
                  delivered: "completed"
                }[selectedOrder.status as keyof typeof nextStatus];
                
                if (nextStatus) {
                  handleStatusChange(selectedOrder.id, nextStatus);
                  setOrderDetailsOpen(false);
                }
              }
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
