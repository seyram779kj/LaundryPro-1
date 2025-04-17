import { 
  User, InsertUser, 
  Address, InsertAddress, 
  Provider, InsertProvider, 
  ServiceType, InsertServiceType, 
  Order, InsertOrder, 
  OrderStatusUpdate, InsertOrderStatusUpdate 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Address methods
  getAddress(id: number): Promise<Address | undefined>;
  getAddressesByUserId(userId: number): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  
  // Provider methods
  getProvider(id: number): Promise<Provider | undefined>;
  getProviderByUserId(userId: number): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  
  // Service Type methods
  getServiceType(id: number): Promise<ServiceType | undefined>;
  getServiceTypes(providerId?: number): Promise<ServiceType[]>;
  createServiceType(serviceType: InsertServiceType): Promise<ServiceType>;
  
  // Order methods
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByClientId(clientId: number): Promise<Order[]>;
  getOrdersByProviderId(providerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(orderId: number, status: string): Promise<Order>;
  
  // Order Status Update methods
  getOrderStatusUpdates(orderId: number): Promise<OrderStatusUpdate[]>;
  createOrderStatusUpdate(update: InsertOrderStatusUpdate): Promise<OrderStatusUpdate>;
  getOrderStatusHistory(orderId: number): Promise<OrderStatusUpdate[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private addresses: Map<number, Address>;
  private providers: Map<number, Provider>;
  private serviceTypes: Map<number, ServiceType>;
  private orders: Map<number, Order>;
  private orderStatusUpdates: Map<number, OrderStatusUpdate>;
  
  public sessionStore: session.SessionStore;
  
  private userIdCounter = 1;
  private addressIdCounter = 1;
  private providerIdCounter = 1;
  private serviceTypeIdCounter = 1;
  private orderIdCounter = 1;
  private orderStatusUpdateIdCounter = 1;

  constructor() {
    this.users = new Map();
    this.addresses = new Map();
    this.providers = new Map();
    this.serviceTypes = new Map();
    this.orders = new Map();
    this.orderStatusUpdates = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  // Address methods
  async getAddress(id: number): Promise<Address | undefined> {
    return this.addresses.get(id);
  }

  async getAddressesByUserId(userId: number): Promise<Address[]> {
    return Array.from(this.addresses.values()).filter(
      (address) => address.userId === userId,
    );
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const id = this.addressIdCounter++;
    const newAddress: Address = { ...address, id };
    
    if (address.isDefault) {
      // Unset default flag on any other addresses for this user
      for (const [addrId, existingAddr] of this.addresses.entries()) {
        if (existingAddr.userId === address.userId && existingAddr.isDefault) {
          this.addresses.set(addrId, { ...existingAddr, isDefault: false });
        }
      }
    }
    
    this.addresses.set(id, newAddress);
    return newAddress;
  }

  // Provider methods
  async getProvider(id: number): Promise<Provider | undefined> {
    return this.providers.get(id);
  }

  async getProviderByUserId(userId: number): Promise<Provider | undefined> {
    return Array.from(this.providers.values()).find(
      (provider) => provider.userId === userId,
    );
  }

  async createProvider(provider: InsertProvider): Promise<Provider> {
    const id = this.providerIdCounter++;
    const newProvider: Provider = { 
      ...provider, 
      id,
      rating: 0
    };
    this.providers.set(id, newProvider);
    return newProvider;
  }

  // Service Type methods
  async getServiceType(id: number): Promise<ServiceType | undefined> {
    return this.serviceTypes.get(id);
  }

  async getServiceTypes(providerId?: number): Promise<ServiceType[]> {
    if (providerId) {
      return Array.from(this.serviceTypes.values()).filter(
        (serviceType) => serviceType.providerId === providerId || serviceType.providerId === null
      );
    }
    return Array.from(this.serviceTypes.values());
  }

  async createServiceType(serviceType: InsertServiceType): Promise<ServiceType> {
    const id = this.serviceTypeIdCounter++;
    const newServiceType: ServiceType = { ...serviceType, id };
    this.serviceTypes.set(id, newServiceType);
    return newServiceType;
  }

  // Order methods
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByClientId(clientId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.clientId === clientId)
      .sort((a, b) => {
        // Sort by created date descending (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getOrdersByProviderId(providerId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.providerId === providerId)
      .sort((a, b) => {
        // Sort by created date descending (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    
    const newOrder: Order = { 
      ...order, 
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.orders.set(id, newOrder);
    
    // Create initial status update
    await this.createOrderStatusUpdate({
      orderId: id,
      status: order.status || "pending",
      notes: "Order created"
    });
    
    return newOrder;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    
    const updatedOrder: Order = {
      ...order,
      status: status as any,
      updatedAt: new Date()
    };
    
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  // Order Status Update methods
  async getOrderStatusUpdates(orderId: number): Promise<OrderStatusUpdate[]> {
    return Array.from(this.orderStatusUpdates.values())
      .filter((update) => update.orderId === orderId);
  }

  async createOrderStatusUpdate(update: InsertOrderStatusUpdate): Promise<OrderStatusUpdate> {
    const id = this.orderStatusUpdateIdCounter++;
    const now = new Date();
    
    const newUpdate: OrderStatusUpdate = {
      ...update,
      id,
      createdAt: now
    };
    
    this.orderStatusUpdates.set(id, newUpdate);
    return newUpdate;
  }

  async getOrderStatusHistory(orderId: number): Promise<OrderStatusUpdate[]> {
    return Array.from(this.orderStatusUpdates.values())
      .filter((update) => update.orderId === orderId)
      .sort((a, b) => {
        // Sort by created date (oldest first)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }
}

export const storage = new MemStorage();
