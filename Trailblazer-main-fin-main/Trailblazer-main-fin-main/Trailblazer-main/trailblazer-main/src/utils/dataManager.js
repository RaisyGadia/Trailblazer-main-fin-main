// Central Data Manager for Trailblazer Application
// Handles order data flow from file upload to payment details

// Order Status Constants
export const ORDER_STATUS = {
  PENDING: "pending",
  RECEIVED: "received",
  PROCESSING: "processing",
  ON_THE_WAY: "on_the_way",
  READY_FOR_PICKUP: "ready",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// File Type Constants
export const FILE_TYPES = {
  PDF: "pdf",
  DOC: "doc",
  DOCX: "docx",
  PPT: "ppt",
  PPTX: "pptx",
  PNG: "png",
  JPG: "jpg",
  JPEG: "jpeg",
};

// Data Structure for Orders
export class OrderManager {
  constructor() {
    this.storageKey = "trailblazer_orders";
    this.currentOrderKey = "trailblazer_current_order";
    this.orderIdCounter = "trailblazer_order_counter";
  }

  // Generate unique order ID
  generateOrderId() {
    const counter = localStorage.getItem(this.orderIdCounter) || "10000";
    const newCounter = parseInt(counter) + 1;
    localStorage.setItem(this.orderIdCounter, newCounter.toString());
    return `#${newCounter}`;
  }

  // Generate unique file ID
  generateFileId() {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create new order structure
  createNewOrder(userId = null) {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const orderId = this.generateOrderId();

    return {
      id: orderId,
      userId: userId || user.id || "guest",
      customerName:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Guest User",
      customerEmail: user.email || "",
      customerPhone: user.phoneNumber || "",
      status: ORDER_STATUS.PENDING,
      files: [],
      totalAmount: 0,
      orderDate: new Date().toISOString(),
      deliveryMethod: "pickup",
      paymentMethod: "cash",
      deliveryAddress: "",
      turnaroundTime: "Standard",
      notes: "",
      orderType: "printing", // 'printing' or 'layout'
      templateData: null,
    };
  }

  // Create file specification structure
  createFileSpecification(file, additionalSpecs = {}) {
    return {
      id: this.generateFileId(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      pageCount: additionalSpecs.pageCount || 1,
      specifications: {
        paperSize: additionalSpecs.paperSize || "",
        printOption: additionalSpecs.printOption || "",
        colorMode: additionalSpecs.colorMode || "Black&White",
        turnaroundTime: additionalSpecs.turnaroundTime || "Standard",
        customization: additionalSpecs.customization || "None",
        notes: additionalSpecs.notes || "",
      },
      pricing: {
        basePrice: 0,
        rushFee: 0,
        customizationFee: 0,
        totalFilePrice: 0,
      },
      uploadDate: new Date().toISOString(),
      status: "uploaded",
    };
  }

  // Get current order in progress
  getCurrentOrder() {
    const orderData = localStorage.getItem(this.currentOrderKey);
    return orderData ? JSON.parse(orderData) : null;
  }

  // Save current order
  saveCurrentOrder(orderData) {
    localStorage.setItem(this.currentOrderKey, JSON.stringify(orderData));
  }

  // Clear current order
  clearCurrentOrder() {
    localStorage.removeItem(this.currentOrderKey);
  }

  // Add file to current order
  addFileToOrder(file, specifications) {
    let currentOrder = this.getCurrentOrder();
    if (!currentOrder) {
      currentOrder = this.createNewOrder();
    }

    const fileSpec = this.createFileSpecification(file, specifications);
    currentOrder.files.push(fileSpec);

    // Recalculate total amount
    currentOrder.totalAmount = this.calculateOrderTotal(currentOrder);

    this.saveCurrentOrder(currentOrder);
    return fileSpec;
  }

  // Remove file from current order
  removeFileFromOrder(fileId) {
    const currentOrder = this.getCurrentOrder();
    if (!currentOrder) return false;

    currentOrder.files = currentOrder.files.filter(
      (file) => file.id !== fileId
    );
    currentOrder.totalAmount = this.calculateOrderTotal(currentOrder);

    this.saveCurrentOrder(currentOrder);
    return true;
  }

  // Update file specifications
  updateFileSpecifications(fileId, newSpecifications) {
    const currentOrder = this.getCurrentOrder();
    if (!currentOrder) return false;

    const fileIndex = currentOrder.files.findIndex(
      (file) => file.id === fileId
    );
    if (fileIndex === -1) return false;

    // Update specifications
    currentOrder.files[fileIndex].specifications = {
      ...currentOrder.files[fileIndex].specifications,
      ...newSpecifications,
    };

    // Recalculate pricing for this file
    const fileData = currentOrder.files[fileIndex];
    fileData.pricing = this.calculateFilePrice(fileData);

    // Recalculate total order amount
    currentOrder.totalAmount = this.calculateOrderTotal(currentOrder);

    this.saveCurrentOrder(currentOrder);
    return true;
  }

  // Update order details (delivery, payment, etc.)
  updateOrderDetails(updates) {
    const currentOrder = this.getCurrentOrder();
    if (!currentOrder) return false;

    Object.assign(currentOrder, updates);

    // Recalculate total if delivery method changed
    currentOrder.totalAmount = this.calculateOrderTotal(currentOrder);

    this.saveCurrentOrder(currentOrder);
    return true;
  }

  // Calculate individual file price
  calculateFilePrice(fileData) {
    const PRICES = {
      PRINTING: {
        "Black&White": { Short: 2, A4: 3, Long: 3 },
        "Full color": { Short: 10, A4: 12, Long: 12 },
      },
      CUSTOMIZATION: { None: 0, Basic: 100, High: 150 },
      RUSH_FEE: 7,
    };

    const specs = fileData.specifications;
    const basePrice = PRICES.PRINTING[specs.colorMode]?.[specs.paperSize] || 0;
    const totalFilePrice = basePrice * (fileData.pageCount || 1);
    const rushFee = specs.turnaroundTime === "Rush" ? PRICES.RUSH_FEE : 0;
    const customizationFee = PRICES.CUSTOMIZATION[specs.customization] || 0;

    return {
      basePrice: totalFilePrice,
      rushFee: rushFee,
      customizationFee: customizationFee,
      totalFilePrice: totalFilePrice + rushFee + customizationFee,
    };
  }

  // Calculate total order amount
  calculateOrderTotal(orderData) {
    let subtotal = 0;

    // Sum all file prices
    orderData.files.forEach((file) => {
      if (!file.pricing.totalFilePrice) {
        file.pricing = this.calculateFilePrice(file);
      }
      subtotal += file.pricing.totalFilePrice;
    });

    // Add delivery fee
    const deliveryFee = this.calculateDeliveryFee(orderData);

    return subtotal + deliveryFee;
  }

  // Calculate delivery fee
  calculateDeliveryFee(orderData) {
    const isCashOnDelivery = orderData.paymentMethod === "Cash on Delivery";
    const isLayoutService = orderData.orderType === "layout";

    if (isCashOnDelivery || orderData.deliveryMethod === "deliver") {
      return isLayoutService ? 20.0 : 10.0;
    }
    return 0.0;
  }

  // Complete order and move to history
  completeOrder() {
    const currentOrder = this.getCurrentOrder();
    if (!currentOrder) return null;

    // Update status and completion date
    currentOrder.status = ORDER_STATUS.RECEIVED;
    currentOrder.completedDate = new Date().toISOString();

    // Add to order history
    this.addToOrderHistory(currentOrder);

    // Clear current order
    this.clearCurrentOrder();

    return currentOrder;
  }

  // Add order to history
  addToOrderHistory(orderData) {
    let orders = this.getAllOrders();
    orders.push(orderData);
    localStorage.setItem(this.storageKey, JSON.stringify(orders));
  }

  // Get all orders (for admin and user history)
  getAllOrders() {
    const ordersData = localStorage.getItem(this.storageKey);
    return ordersData ? JSON.parse(ordersData) : [];
  }

  // Get orders by user ID
  getOrdersByUser(userId) {
    const allOrders = this.getAllOrders();
    return allOrders.filter((order) => order.userId === userId);
  }

  // Get order by ID
  getOrderById(orderId) {
    const allOrders = this.getAllOrders();
    return allOrders.find((order) => order.id === orderId);
  }

  // Update order status (for admin)
  updateOrderStatus(orderId, newStatus) {
    const orders = this.getAllOrders();
    const orderIndex = orders.findIndex((order) => order.id === orderId);

    if (orderIndex === -1) return false;

    orders[orderIndex].status = newStatus;
    orders[orderIndex].lastUpdated = new Date().toISOString();

    localStorage.setItem(this.storageKey, JSON.stringify(orders));
    return true;
  }

  // Get order statistics (for admin dashboard)
  getOrderStatistics() {
    const orders = this.getAllOrders();
    const today = new Date().toDateString();

    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === ORDER_STATUS.PENDING).length,
      processing: orders.filter((o) => o.status === ORDER_STATUS.PROCESSING)
        .length,
      delivered: orders.filter((o) => o.status === ORDER_STATUS.DELIVERED)
        .length,
      todayOrders: orders.filter(
        (o) => new Date(o.orderDate).toDateString() === today
      ).length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    };

    return stats;
  }

  // Clear all data (for testing/reset)
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.currentOrderKey);
    localStorage.removeItem(this.orderIdCounter);
  }

  // Clear order queue data when returning to homepage or completing order
  clearOrderQueue() {
    localStorage.removeItem(this.currentOrderKey);
    // Clear any temporary upload data
    localStorage.removeItem("tempUploadSpecs");
    localStorage.removeItem("tempFileList");
    localStorage.removeItem("uploadProgress");
    localStorage.removeItem("basketState");
    localStorage.removeItem("deliverySelection");
    localStorage.removeItem("paymentDetails");
  }
}

// Create singleton instance
export const orderManager = new OrderManager();

// Export utility functions for components
export const getFileIcon = (fileType) => {
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return "PDF";
  if (type.includes("doc")) return "DOC";
  if (type.includes("ppt")) return "PPT";
  if (type.includes("png")) return "PNG";
  if (type.includes("jpg") || type.includes("jpeg")) return "JPG";
  return "FILE";
};

export const formatPrice = (price) => {
  return `₱${parseFloat(price || 0).toFixed(2)}`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
