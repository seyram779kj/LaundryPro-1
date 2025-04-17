import { format } from "date-fns";
import { Check, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order, OrderStatusUpdate } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ServiceType } from "@shared/schema";
import { Link } from "wouter";

type OrderTrackingProps = {
  order: Order;
  statusHistory: OrderStatusUpdate[];
};

export default function OrderTracking({ order, statusHistory }: OrderTrackingProps) {
  // Fetch service types to get the name of the service
  const { data: serviceTypes } = useQuery<ServiceType[]>({
    queryKey: ["/api/service-types"],
  });

  // Fetch address details
  const { data: addresses } = useQuery({
    queryKey: ["/api/addresses"],
  });

  // Get the pickup and delivery addresses
  const pickupAddress = addresses?.find(addr => addr.id === order.pickupAddressId);
  const deliveryAddress = addresses?.find(addr => addr.id === order.deliveryAddressId);

  // Get service type name
  const serviceType = serviceTypes?.find(service => service.id === order.serviceTypeId);

  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Define all possible statuses in order
  const allStatuses = [
    { key: "pending", label: "Order Placed" },
    { key: "confirmed", label: "Order Confirmed" },
    { key: "picked_up", label: "Laundry Picked Up" },
    { key: "in_progress", label: "Washing in Progress" },
    { key: "quality_check", label: "Quality Check" },
    { key: "ready_for_delivery", label: "Ready for Delivery" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
    { key: "completed", label: "Completed" }
  ];

  // Find the current status index
  const currentStatusIndex = allStatuses.findIndex(s => s.key === order.status);

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      {/* Order Info Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">{order.orderNumber}</h2>
            <p className="text-sm text-gray-500">
              Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <Badge variant={
              order.status === "completed" ? "success" :
              order.status === "cancelled" ? "destructive" :
              "warning"
            }>
              {formatStatus(order.status)}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Progress Tracker */}
      <div className="px-6 py-6">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-0 ml-2.5 w-0.5 h-full bg-gray-200"></div>
          
          {/* Progress Steps */}
          <ol className="relative space-y-6">
            {allStatuses.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isPending = index > currentStatusIndex;
              
              // Find the timestamp for this status
              const statusUpdate = statusHistory?.find(update => update.status === status.key);
              
              return (
                <li key={status.key} className="relative pl-10">
                  <div 
                    className={`absolute left-0 flex items-center justify-center w-5 h-5 rounded-full 
                      ${isCompleted ? "bg-primary text-white" : 
                        isCurrent ? "bg-yellow-500 ring-4 ring-yellow-100" : 
                        "bg-gray-200 text-gray-400"}`}
                  >
                    {isCompleted ? (
                      <Check className="h-3 w-3" />
                    ) : isCurrent ? (
                      <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <span className="h-3 w-3"></span>
                    )}
                  </div>
                  <div className={isPending ? "text-gray-500" : ""}>
                    <h3 className="font-medium">{status.label}</h3>
                    <p className="text-sm">
                      {statusUpdate ? 
                        format(new Date(statusUpdate.createdAt), "MMMM d, h:mm a") : 
                        isPending ? "Scheduled" : ""}
                    </p>
                    {statusUpdate?.notes && (
                      <p className="mt-1 text-sm text-gray-600">{statusUpdate.notes}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      
      {/* Order Details */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Order Details</h3>
        <div className="flex flex-col sm:flex-row">
          <div className="mb-4 sm:mb-0 sm:w-1/2">
            <h4 className="text-sm font-medium text-gray-700">Services</h4>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              <li>
                {serviceType?.name || "Laundry Service"} 
                ({order.quantity} {serviceType?.unit || "items"}) - 
                ${(order.total - (order.deliveryFee || 0) - (order.tax || 0)).toFixed(2)}
              </li>
              <li>Pickup & Delivery - ${order.deliveryFee?.toFixed(2) || "5.00"}</li>
              <li>Tax - ${order.tax?.toFixed(2) || "0.00"}</li>
              <li className="font-medium pt-1">Total - ${order.total?.toFixed(2) || "0.00"}</li>
            </ul>
          </div>
          <div className="sm:w-1/2">
            <h4 className="text-sm font-medium text-gray-700">Delivery Address</h4>
            {deliveryAddress ? (
              <address className="mt-2 not-italic text-sm text-gray-600">
                {deliveryAddress.address}<br />
                {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipCode}
              </address>
            ) : (
              <p className="mt-2 text-sm text-gray-600">No delivery address specified</p>
            )}
            
            {order.scheduledDeliveryTime && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700">Scheduled Delivery</h4>
                <p className="text-sm text-gray-600">
                  {format(new Date(order.scheduledDeliveryTime), "MMMM d, yyyy h:mm a")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-4">
        <Link href="/orders">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View All Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}
