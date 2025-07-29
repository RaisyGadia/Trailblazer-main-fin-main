const API_BASE_URL = import.meta.env.VITE_API_URL;

// Fetch orders
export const fetchOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};
  // Fetch order summary
export const fetchOrderSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/summary`);
    if (!response.ok) {
      throw new Error("Failed to fetch order summary");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching order summary:", error);
    throw error;
  }
};