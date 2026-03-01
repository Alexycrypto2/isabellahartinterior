import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, productName?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  isInCart: (productId: string) => boolean;
  getQuantity: (productId: string) => number;
  toggleCart: (productId: string, productName?: string) => void;
  cartCount: number;
  cartProductIds: string[];
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "room-refine-cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Support migration from old wishlist format (string[])
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
          setCart(parsed.map((id: string) => ({ productId: id, quantity: 1 })));
        } else {
          setCart(parsed);
        }
      } catch {
        setCart([]);
      }
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (productId: string, productName?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
    toast({
      description: productName ? `${productName} added to cart` : "Added to cart",
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const isInCart = (productId: string) => {
    return cart.some((item) => item.productId === productId);
  };

  const getQuantity = (productId: string) => {
    return cart.find((item) => item.productId === productId)?.quantity || 0;
  };

  const toggleCart = (productId: string, productName?: string) => {
    if (isInCart(productId)) {
      removeFromCart(productId);
      toast({
        description: productName ? `${productName} removed from cart` : "Removed from cart",
      });
    } else {
      addToCart(productId, productName);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartProductIds = useMemo(() => cart.map((item) => item.productId), [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        isInCart,
        getQuantity,
        toggleCart,
        cartCount,
        cartProductIds,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
