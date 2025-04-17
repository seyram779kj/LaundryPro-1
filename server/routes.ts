import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertOrderSchema,
  insertServiceTypeSchema,
  insertAddressSchema,
  insertOrderStatusUpdateSchema,
  orderStatuses
} from "@shared/schema";
import { nanoid } from "nanoid";

// Middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if the user is a provider
const isProvider = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.userType === "provider") {
    return next();
  }
  res.status(403).json({ message: "Access denied" });
};

// Middleware to check if the user is a client
const isClient = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.userType === "client") {
    return next();
  }
  res.status(403).json({ message: "Access denied" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  setupAuth(app);

  // Address routes
  app.post("/api/addresses", isAuthenticated, async (req, res, next) => {
    try {
      const result = insertAddressSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid address data", errors: result.error.errors });
      }
      
      const address = await storage.createAddress({
        ...result.data,
        userId: req.user.id
      });
      
      res.status(201).json(address);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/addresses", isAuthenticated, async (req, res, next) => {
    try {
      const addresses = await storage.getAddressesByUserId(req.user.id);
      res.json(addresses);
    } catch (error) {
      next(error);
    }
  });

  // Service Type routes
  app.post("/api/service-types", isProvider, async (req, res, next) => {
    try {
      const result = insertServiceTypeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid service type data", errors: result.error.errors });
      }
      
      const provider = await storage.getProviderByUserId(req.user.id);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      const serviceType = await storage.createServiceType({
        ...result.data,
        providerId: provider.id
      });
      
      res.status(201).json(serviceType);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/service-types", async (req, res, next) => {
    try {
      const providerId = req.query.providerId ? Number(req.query.providerId) : undefined;
      const serviceTypes = await storage.getServiceTypes(providerId);
      res.json(serviceTypes);
    } catch (error) {
      next(error);
    }
  });

  // Order routes
  app.post("/api/orders", isClient, async (req, res, next) => {
    try {
      const result = insertOrderSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid order data", errors: result.error.errors });
      }
      
      // Generate order number
      const orderPrefix = "WC-";
      const orderNumber = `${orderPrefix}${nanoid(5).toUpperCase()}`;
      
      const order = await storage.createOrder({
        ...result.data,
        clientId: req.user.id,
        orderNumber
      });
      
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/orders", isAuthenticated, async (req, res, next) => {
    try {
      let orders;
      if (req.user.userType === "client") {
        orders = await storage.getOrdersByClientId(req.user.id);
      } else if (req.user.userType === "provider") {
        const provider = await storage.getProviderByUserId(req.user.id);
        orders = provider ? await storage.getOrdersByProviderId(provider.id) : [];
      }
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res, next) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (req.user.userType === "client" && order.clientId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (req.user.userType === "provider") {
        const provider = await storage.getProviderByUserId(req.user.id);
        if (!provider || order.providerId !== provider.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  // Order status update routes
  app.post("/api/orders/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const orderId = Number(req.params.id);
      const result = insertOrderStatusUpdateSchema.safeParse({
        ...req.body,
        orderId
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid status update data", errors: result.error.errors });
      }
      
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Validate if the user has permission to update this order
      if (req.user.userType === "client" && order.clientId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (req.user.userType === "provider") {
        const provider = await storage.getProviderByUserId(req.user.id);
        if (!provider || order.providerId !== provider.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      // Validate the status transition
      if (!orderStatuses.includes(req.body.status as any)) {
        return res.status(400).json({ message: "Invalid order status" });
      }
      
      // Create status update
      const statusUpdate = await storage.createOrderStatusUpdate(result.data);
      
      // Update the order's status
      const updatedOrder = await storage.updateOrderStatus(orderId, req.body.status);
      
      res.status(200).json({
        statusUpdate,
        order: updatedOrder
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/orders/:id/history", isAuthenticated, async (req, res, next) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (req.user.userType === "client" && order.clientId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (req.user.userType === "provider") {
        const provider = await storage.getProviderByUserId(req.user.id);
        if (!provider || order.providerId !== provider.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const statusHistory = await storage.getOrderStatusHistory(orderId);
      res.json(statusHistory);
    } catch (error) {
      next(error);
    }
  });

  // Provider specific routes
  app.get("/api/provider/dashboard", isProvider, async (req, res, next) => {
    try {
      const provider = await storage.getProviderByUserId(req.user.id);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      const orders = await storage.getOrdersByProviderId(provider.id);
      
      // Calculate statistics
      const activeOrders = orders.filter(order => 
        !["completed", "cancelled"].includes(order.status));
      
      const completedOrders = orders.filter(order => 
        order.status === "completed");
      
      // Calculate weekly revenue
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyOrders = completedOrders.filter(order => 
        order.updatedAt && new Date(order.updatedAt) >= weekAgo);
      
      const weeklyRevenue = weeklyOrders.reduce((sum, order) => 
        sum + (order.total || 0), 0);
      
      // Calculate processed laundry weight
      const processedWeight = completedOrders.reduce((sum, order) => 
        sum + order.quantity, 0);
      
      res.json({
        activeOrderCount: activeOrders.length,
        weeklyRevenue,
        processedWeight,
        recentOrders: orders.slice(0, 5)
      });
    } catch (error) {
      next(error);
    }
  });

  // Seed initial service types if none exist
  app.get("/api/seed-services", async (req, res, next) => {
    try {
      const existingServices = await storage.getServiceTypes();
      
      if (existingServices.length === 0) {
        // Create default service types
        const defaultServices = [
          {
            name: "Wash & Fold",
            description: "Regular laundry, washed and neatly folded",
            pricePerUnit: 1.75,
            unit: "lb",
            isActive: true
          },
          {
            name: "Dry Cleaning",
            description: "Professional cleaning for delicate fabrics",
            pricePerUnit: 4.99,
            unit: "item",
            isActive: true
          },
          {
            name: "Ironing Service",
            description: "Crisp, professionally pressed clothing",
            pricePerUnit: 2.50,
            unit: "item",
            isActive: true
          }
        ];
        
        for (const service of defaultServices) {
          await storage.createServiceType(service);
        }
        
        return res.status(200).json({ message: "Default services created" });
      }
      
      res.status(200).json({ message: "Services already exist" });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
