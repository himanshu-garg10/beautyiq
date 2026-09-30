/**
 * BeautyIQ Repositories Layer
 * Encapsulated data-access repositories for Users, Sessions, Wishlists, and Recommendations.
 */

import { UserRepository } from "./userRepository";
import { WishlistRepository } from "./wishlistRepository";
import { RecommendationRepository } from "./recommendationRepository";

export * from "./userRepository";
export * from "./wishlistRepository";
export * from "./recommendationRepository";

/**
 * Unified DbService facade combining all repositories for backward compatibility.
 */
export class DbService {
  // User operations
  static createUser = UserRepository.createUser.bind(UserRepository);
  static findUserByEmailWithAuth = UserRepository.findUserByEmailWithAuth.bind(UserRepository);
  static findUserById = UserRepository.findUserById.bind(UserRepository);
  static createSession = UserRepository.createSession.bind(UserRepository);
  static getSession = UserRepository.getSession.bind(UserRepository);
  static deleteSession = UserRepository.deleteSession.bind(UserRepository);
  static deleteUserSessions = UserRepository.deleteUserSessions.bind(UserRepository);
  static updateUserProfile = UserRepository.updateUserProfile.bind(UserRepository);

  // Wishlist operations
  static getWishlistProductIds = WishlistRepository.getWishlistProductIds.bind(WishlistRepository);
  static addToWishlist = WishlistRepository.addToWishlist.bind(WishlistRepository);
  static removeFromWishlist = WishlistRepository.removeFromWishlist.bind(WishlistRepository);
  static clearWishlist = WishlistRepository.clearWishlist.bind(WishlistRepository);
  static getSavedProducts = WishlistRepository.getSavedProducts.bind(WishlistRepository);
  static saveProduct = WishlistRepository.saveProduct.bind(WishlistRepository);
  static removeSavedProduct = WishlistRepository.removeSavedProduct.bind(WishlistRepository);

  // Recommendation operations
  static getRecommendationHistory = RecommendationRepository.getRecommendationHistory.bind(RecommendationRepository);
  static saveRecommendationSession = RecommendationRepository.saveRecommendationSession.bind(RecommendationRepository);
  static deleteRecommendationSession = RecommendationRepository.deleteRecommendationSession.bind(RecommendationRepository);
  static clearRecommendationHistory = RecommendationRepository.clearRecommendationHistory.bind(RecommendationRepository);
}
