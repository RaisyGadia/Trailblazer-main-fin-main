import { db } from "../assets/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const pushToAdminLiveOrders = async (order) => {
  try {
    await addDoc(collection(db, "admin_live_orders"), {
      ...order,
      pushedAt: serverTimestamp(),
    });
    console.log("📤 Pushed to admin_live_orders:", order.id || order.orderId);
  } catch (error) {
    console.error("❌ Failed to push to admin dashboard", error);
  }
};
