import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ServiceType } from "@shared/schema";
import { useLocation } from "wouter";

type OrderSummaryProps = {
  orderData: any;
  serviceTypes: ServiceType[];
  addresses: any[];
};

export default function OrderSummary({ 
  orderData, 
  serviceTypes, 
  addresses 
}: OrderSummaryProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  
  // Find selected service type and address
  const selectedService = serviceTypes.find(service => service.id === orderData.serviceTypeId);
  const pickupAddress = addresses.find(address => address.id === orderData.pickupAddressId);
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully",
        description: `Your order #${data.orderNumber} has been placed.`,
      });
      setLocation(`/order/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle order placement
  const handlePlaceOrder = () => {
    if (!selectedService || !pickupAddress) return;
    
    const order = {
      ...orderData,
      status: "pending",
    };
    
    createOrderMutation.mutate(order);
  };
  
  if (!selectedService || !pickupAddress) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">Missing Information</h3>
        <p className="text-gray-500 mb-4">Please go back and select a service and address.</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-6">Review Your Order</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Order Details */}
        <div>
          <h3 className="text-md font-medium mb-3">Order Details</h3>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Service:</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="font-medium">{orderData.quantity} {selectedService.unit}</span>
                </div>
                {orderData.specialInstructions && (
                  <div className="pt-2">
                    <span className="text-gray-500">Special Instructions:</span>
                    <p className="mt-1 text-sm">{orderData.specialInstructions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <h3 className="text-md font-medium mt-4 mb-3">Schedule</h3>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pickup:</span>
                  <span className="font-medium">
                    {orderData.scheduledPickupTime
                      ? format(new Date(orderData.scheduledPickupTime), "MMM d, yyyy h:mm a")
                      : "Not scheduled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery:</span>
                  <span className="font-medium">
                    {orderData.scheduledDeliveryTime
                      ? format(new Date(orderData.scheduledDeliveryTime), "MMM d, yyyy h:mm a")
                      : "Not scheduled"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <h3 className="text-md font-medium mt-4 mb-3">Address</h3>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="font-medium">{pickupAddress.address}</p>
                <p className="text-gray-500">
                  {pickupAddress.city}, {pickupAddress.state} {pickupAddress.zipCode}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Payment Details */}
        <div>
          <h3 className="text-md font-medium mb-3">Order Summary</h3>
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {selectedService.name} ({orderData.quantity} {selectedService.unit})
                  </span>
                  <span className="font-medium">
                    ${(selectedService.pricePerUnit * orderData.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup & Delivery</span>
                  <span className="font-medium">${orderData.deliveryFee?.toFixed(2) || "5.00"}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax</span>
                  <span>${orderData.tax?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${orderData.total?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <h3 className="text-md font-medium mt-4 mb-3">Payment Method</h3>
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="credit_card"
                    name="payment_method"
                    value="credit_card"
                    checked={paymentMethod === "credit_card"}
                    onChange={() => setPaymentMethod("credit_card")}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="credit_card" className="ml-3 block text-sm font-medium text-gray-700">
                    Credit Card
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="paypal"
                    name="payment_method"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700">
                    PayPal
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cash"
                    name="payment_method"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="cash" className="ml-3 block text-sm font-medium text-gray-700">
                    Cash on Delivery
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            className="w-full"
            onClick={handlePlaceOrder}
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Place Order"
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            By placing this order, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
