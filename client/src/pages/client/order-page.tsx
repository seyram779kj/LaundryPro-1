import { useState } from "react";
import ClientHeader from "@/components/layout/client-header";
import ClientFooter from "@/components/layout/client-footer";
import OrderForm from "@/components/order/order-form";
import OrderSummary from "@/components/order/order-summary";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ServiceType } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function OrderPage() {
  const [selectedTab, setSelectedTab] = useState("services");
  const [orderData, setOrderData] = useState<any>({
    serviceTypeId: null,
    quantity: 15,
    specialInstructions: "",
    pickupAddressId: null,
    deliveryAddressId: null,
    scheduledPickupTime: null,
    scheduledDeliveryTime: null
  });

  const { data: serviceTypes, isLoading } = useQuery<ServiceType[]>({
    queryKey: ["/api/service-types"],
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["/api/addresses"],
  });

  const updateOrderData = (data: any) => {
    setOrderData((prev: any) => ({ ...prev, ...data }));
  };

  const handleContinue = () => {
    const nextTab = {
      "services": "schedule",
      "schedule": "review",
      "review": "review"
    }[selectedTab];
    
    if (nextTab) {
      setSelectedTab(nextTab);
    }
  };

  if (isLoading || addressesLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <ClientHeader />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-2">Loading services...</span>
        </div>
        <ClientFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ClientHeader />
      
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Order</h1>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="services">1. Select Services</TabsTrigger>
              <TabsTrigger value="schedule">2. Schedule</TabsTrigger>
              <TabsTrigger value="review">3. Review & Pay</TabsTrigger>
            </TabsList>
            
            <Card className="p-6">
              <TabsContent value="services">
                <OrderForm 
                  serviceTypes={serviceTypes || []} 
                  orderData={orderData}
                  updateOrderData={updateOrderData}
                  onContinue={handleContinue}
                />
              </TabsContent>
              
              <TabsContent value="schedule">
                <div className="space-y-6">
                  <h2 className="text-lg font-medium mb-4">Schedule Pickup & Delivery</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-md font-medium mb-4">Select Address</h3>
                      <div className="space-y-4">
                        {addresses && addresses.length > 0 ? (
                          addresses.map((address: any) => (
                            <div 
                              key={address.id}
                              className={`p-4 border rounded-lg cursor-pointer ${
                                orderData.pickupAddressId === address.id ? 
                                'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'
                              }`}
                              onClick={() => updateOrderData({ 
                                pickupAddressId: address.id,
                                deliveryAddressId: address.id 
                              })}
                            >
                              <p className="font-medium">{address.address}</p>
                              <p className="text-sm text-gray-500">
                                {address.city}, {address.state} {address.zipCode}
                              </p>
                              {address.isDefault && (
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">Default</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>No addresses found. Please add an address in your profile.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-4">Select Times</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Date & Time
                          </label>
                          <input 
                            type="datetime-local"
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                            onChange={(e) => updateOrderData({ 
                              scheduledPickupTime: e.target.value 
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Date & Time
                          </label>
                          <input 
                            type="datetime-local"
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                            onChange={(e) => updateOrderData({ 
                              scheduledDeliveryTime: e.target.value 
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-8">
                    <button 
                      type="button" 
                      className="bg-primary text-white py-2 px-6 rounded-lg font-medium hover:bg-primary-700"
                      onClick={handleContinue}
                      disabled={!orderData.pickupAddressId || !orderData.scheduledPickupTime || !orderData.scheduledDeliveryTime}
                    >
                      Continue to Review
                    </button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="review">
                <OrderSummary 
                  orderData={orderData} 
                  serviceTypes={serviceTypes || []}
                  addresses={addresses || []}
                />
              </TabsContent>
            </Card>
          </Tabs>
        </div>
      </main>
      
      <ClientFooter />
    </div>
  );
}
