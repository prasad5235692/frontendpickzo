import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get("/cart");
        setCartItems(res.data);
      } catch (err) {
        console.error("❌ Failed to load cart:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      await axios.delete(`/cart/${itemId}`);
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err) {
      console.error("❌ Failed to remove item:", err);
    }
  };

  const handleClear = async () => {
    try {
      if (cartItems.length === 0) return;
      await axios.delete("/cart");
      setCartItems([]);
    } catch (err) {
      console.error("❌ Failed to clear cart:", err);
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  if (loading) return <div className="p-6 text-center">Loading cart...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">🛒 Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty. Start adding some items!</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded shadow gap-4"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.image || "/images/default.png"}
                  alt={item.name}
                  className="w-24 h-24 object-contain rounded"
                />
                <div className="text-center sm:text-left">
                  <h4 className="text-md font-semibold">{item.name}</h4>
                  <p className="text-blue-600 font-bold">
                    ₹{item.price.toLocaleString()} × {item.quantity}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(item._id)}
                className="text-red-600 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          ))}

          {/* ✅ Total and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 border-t pt-4 gap-4">
            <h3 className="text-lg sm:text-xl font-semibold">
              Total: ₹{totalPrice.toLocaleString()}
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleClear}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm w-full sm:w-auto"
              >
                Clear Cart
              </button>
              <button
                onClick={() => alert("Proceeding to checkout...")}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm w-full sm:w-auto"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
