import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shirt, UserRoundCheck, Anvil } from "lucide-react";
import { ServiceType } from "@shared/schema";

type OrderFormProps = {
  serviceTypes: ServiceType[];
  orderData: any;
  updateOrderData: (data: any) => void;
  onContinue: () => void;
};

export default function OrderForm({ 
  serviceTypes, 
  orderData, 
  updateOrderData,
  onContinue 
}: OrderFormProps) {
  const [weight, setWeight] = useState(orderData.quantity || 15);
  
  // Find the selected service type
  const selectedService = serviceTypes.find(service => service.id === orderData.serviceTypeId);
  
  // Helper to calculate price
  const calculatePrice = (serviceType: ServiceType, quantity: number) => {
    return serviceType.pricePerUnit * quantity;
  };
  
  // Handle service selection
  const handleServiceSelect = (serviceType: ServiceType) => {
    updateOrderData({ serviceTypeId: serviceType.id });
  };
  
  // Handle weight change
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setWeight(value);
    updateOrderData({ quantity: value });
  };
  
  // Handle special instructions
  const handleSpecialInstructions = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateOrderData({ specialInstructions: e.target.value });
  };
  
  // Calculate subtotal
  const subtotal = selectedService ? calculatePrice(selectedService, weight) : 0;
  
  // Calculate delivery fee and tax
  const deliveryFee = 5.00;
  const tax = (subtotal + deliveryFee) * 0.08; // Assuming 8% tax
  const total = subtotal + deliveryFee + tax;
  
  // Update order with calculated values
  const handleContinue = () => {
    updateOrderData({
      total,
      tax,
      deliveryFee
    });
    onContinue();
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-6">Select Services & Items</h2>
      
      {/* Service Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {serviceTypes.map((service) => (
          <div 
            key={service.id}
            className={`border rounded-lg p-4 relative cursor-pointer ${
              orderData.serviceTypeId === service.id
                ? "border-primary bg-primary-50"
                : "border-gray-200 hover:border-primary-200 hover:bg-gray-50"
            }`}
            onClick={() => handleServiceSelect(service)}
          >
            <label className="flex flex-col h-full cursor-pointer">
              <span className={`mb-2 ${orderData.serviceTypeId === service.id ? "text-primary" : "text-gray-400"}`}>
                {service.name === "Wash & Fold" ? (
                  <Shirt className="h-8 w-8" />
                ) : service.name === "Dry Cleaning" ? (
                  <UserRoundCheck className="h-8 w-8" />
                ) : (
                  <Anvil className="h-8 w-8" />
                )}
              </span>
              <span className="font-medium text-gray-900">{service.name}</span>
              <span className="text-sm text-gray-500 mt-1">{service.description}</span>
              <span className="mt-auto pt-2 text-gray-700 font-medium">
                ${service.pricePerUnit.toFixed(2)}/{service.unit}
              </span>
            </label>
            {orderData.serviceTypeId === service.id && (
              <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-white">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Weight/Quantity Estimation */}
      {selectedService && (
        <div className="mb-8">
          <h3 className="text-md font-medium mb-4">
            {selectedService.unit === "lb" ? "Weight Estimate" : "Item Count"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {selectedService.unit === "lb" 
              ? "Please estimate the weight of your laundry. We'll weigh it precisely at pickup."
              : "Please indicate how many items you'll be sending."}
          </p>
          
          <div className="flex items-center mb-6">
            <input 
              type="range" 
              min={selectedService.unit === "lb" ? 5 : 1} 
              max={selectedService.unit === "lb" ? 50 : 20} 
              value={weight} 
              onChange={handleWeightChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
            />
            <span className="ml-4 text-lg font-medium text-gray-900 w-16 text-center">
              {weight} {selectedService.unit}
            </span>
          </div>
          
          {selectedService.unit === "lb" && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Common Items:</span>
                <span>Approximate Weight</span>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li className="flex justify-between">
                  <span>T-shirt</span>
                  <span>0.25 lb</span>
                </li>
                <li className="flex justify-between">
                  <span>Jeans</span>
                  <span>1.5 lb</span>
                </li>
                <li className="flex justify-between">
                  <span>Bed sheet (queen)</span>
                  <span>1.5 lb</span>
                </li>
                <li className="flex justify-between">
                  <span>Bath towel</span>
                  <span>1.0 lb</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Special Instructions */}
      <div className="mb-8">
        <label htmlFor="special-instructions" className="block text-sm font-medium text-gray-700 mb-2">
          Special Instructions
        </label>
        <textarea 
          id="special-instructions" 
          rows={3} 
          className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
          placeholder="Any special requests or instructions for handling your laundry..."
          value={orderData.specialInstructions || ""}
          onChange={handleSpecialInstructions}
        ></textarea>
      </div>
      
      {/* Order Summary */}
      {selectedService && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {selectedService.name} ({weight} {selectedService.unit})
              </span>
              <span className="font-medium">
                ${calculatePrice(selectedService, weight).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pickup & Delivery</span>
              <span className="font-medium">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between font-medium">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={handleContinue}
          disabled={!selectedService}
        >
          Continue to Schedule
        </Button>
      </div>
    </div>
  );
}
