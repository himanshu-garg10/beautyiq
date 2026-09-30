"use client";

import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";

export function useWishlist() {
  const { user, toggleWishlist } = useAuth();
  const { showToast } = useToast();

  const isInWishlist = (productId: string) => {
    return user?.wishlistIds?.includes(productId) ?? false;
  };

  const handleToggle = (productId: string, productName?: string) => {
    if (!user) {
      showToast("Please sign in to save products to your wishlist", "warning");
      return;
    }
    const alreadySaved = isInWishlist(productId);
    toggleWishlist(productId);
    if (alreadySaved) {
      showToast(productName ? `Removed "${productName}" from wishlist` : "Removed from wishlist", "info");
    } else {
      showToast(productName ? `Added "${productName}" to wishlist` : "Added to wishlist", "success");
    }
  };

  return {
    wishlistIds: user?.wishlistIds || [],
    isInWishlist,
    toggleWishlist: handleToggle,
  };
}
