import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import ClientHeader from "@/components/layout/client-header";
import ClientFooter from "@/components/layout/client-footer";
import OrderTracking from "@/components/order/order-tracking";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Order, OrderStatusUpdate } from "@shared/schema";

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [contactSupport, setContactSupport] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch order details
  const { 
    data: order, 
    isLoading: orderLoading, 
    error: orderError 
  } = useQuery<Order>({
    queryKey: [`/api/orders/${id}`],
    enabled: !!id,
  });

  // Fetch order status history
  const { 
    data: statusHistory, 
    isLoading: historyLoading,
    error: historyError
  } = useQuery<OrderStatusUpdate[]>({
    queryKey: [`/api/orders/${id}/history`],
    enabled: !!id,
  });

  // Support message mutation
  const supportMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", `/api/orders/${id}/support`, { message });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent to our support team."
      });
      setContactSupport(false);
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle sending a support message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      supportMutation.mutate(message);
    }
  };

  // Handle errors
  useEffect(() => {
    if (orderError) {
      toast({
        title: "Error loading order",
        description: "Failed to load order details. Please try again.",
        variant: "destructive"
      });
    }

    if (historyError) {
      toast({
        title: "Error loading status history",
        description: "Failed to load order status history. Please try again.",
        variant: "destructive"
      });
    }
  }, [orderError, historyError, toast]);

  const isLoading = orderLoading || historyLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Track Your Order</h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading order details...</span>
            </div>
          ) : order && statusHistory ? (
            <>
              <OrderTracking order={order} statusHistory={statusHistory} />
              
              {contactSupport ? (
                <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Contact Support</h3>
                  <form onSubmit={handleSendMessage}>
                    <div className="mb-4">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="How can we help you with this order?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        type="submit" 
                        disabled={supportMutation.isPending || !message.trim()}
                      >
                        {supportMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Message"
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setContactSupport(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="mt-6 flex flex-wrap gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setContactSupport(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    Contact Support
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
              <h3 className="text-gray-900 font-medium mb-2">Order Not Found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find the order you're looking for. Please check the order number and try again.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <ClientFooter />
    </div>
  );
}
