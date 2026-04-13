"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { useSession } from "./auth-client";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  vendorId: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "UPDATE_QUANTITY"; id: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; state: CartState };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "LOAD_CART":
      return action.state;

    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex((i) => i.id === action.item.id);
      let newItems;
      if (existingIndex > -1) {
        newItems = state.items.map((item, i) =>
          i === existingIndex ? { ...item, quantity: item.quantity + action.item.quantity } : item
        );
      } else {
        newItems = [...state.items, action.item];
      }
      return calculateState(newItems);
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((i) => i.id !== action.id);
      return calculateState(newItems);
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.id === action.id ? { ...item, quantity: Math.max(1, action.quantity) } : item
      );
      return calculateState(newItems);
    }

    case "CLEAR_CART":
      return initialState;

    default:
      return state;
  }
};

const calculateState = (items: CartItem[]): CartState => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, totalItems, totalAmount };
};

const CartContext = createContext<{
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
} | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { data: session } = useSession();
  
  // Create a unique key for each user to prevent cart sharing
  const userId = session?.user?.id || "guest";
  const storageKey = `mart-cart-${userId}`;

  // Load from local storage on mount OR when user changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: "LOAD_CART", state: parsed });
      } catch (e) {
        console.error("Failed to load cart", e);
        dispatch({ type: "LOAD_CART", state: initialState });
      }
    } else {
      dispatch({ type: "LOAD_CART", state: initialState });
    }
  }, [storageKey]);

  // Save to local storage on change
  useEffect(() => {
    // Only save if it's not the initial state OR if we already have something in storage
    if (state.items.length > 0 || localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, storageKey]);

  const addItem = (item: CartItem) => dispatch({ type: "ADD_ITEM", item });
  const removeItem = (id: string) => dispatch({ type: "REMOVE_ITEM", id });
  const updateQuantity = (id: string, quantity: number) => dispatch({ type: "UPDATE_QUANTITY", id, quantity });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
