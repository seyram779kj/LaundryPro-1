import { formatDistanceToNow, format } from "date-fns";
import { Eye } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ServiceType } from "@shared/schema";

type OrderHistoryListProps = {
  orders: Order[];
};

export default function OrderHistoryList({ orders }: OrderHistoryListProps) {
  // Fetch service types
  const { data: serviceTypes } = useQuery<ServiceType[]>({
    queryKey: ["/api/service-types"],
  });
  
  // Format order status for display
  const formatOrderStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary" | "success"> = {
      pending: "secondary",
      confirmed: "secondary",
      picked_up: "secondary",
      in_progress: "secondary",
      quality_check: "secondary",
      ready_for_delivery: "secondary",
      out_for_delivery: "secondary",
      delivered: "secondary",
      completed: "success",
      cancelled: "destructive"
    };
    return variants[status] || "secondary";
  };

  return (
    <div className="divide-y divide-gray-200">
      {orders.map((order) => {
        // Find service type
        const serviceType = serviceTypes?.find(s => s.id === order.serviceTypeId);
        
        return (
          <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <div className="flex items-center">
                  <h3 className="text-base font-medium text-gray-900">{order.orderNumber}</h3>
                  <Badge 
                    variant={getStatusBadgeVariant(order.status)} 
                    className="ml-2"
                  >
                    {formatOrderStatus(order.status)}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  <span>{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                  <span className="mx-2">•</span>
                  <span>{serviceType?.name || "Laundry Service"}</span>
                  <span className="mx-2">•</span>
                  <span>{order.quantity} {serviceType?.unit || "items"}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-base font-medium text-gray-900">
                    ${order.total?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <Link href={`/order/${order.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
