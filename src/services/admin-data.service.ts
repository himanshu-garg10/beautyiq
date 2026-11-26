import {
  mockUsers,
  products as seedProducts,
  brandsList as seedBrands,
  categories as seedCategories,
  ingredients as seedIngredients,
  mockProductListings as seedListings,
  mockPlatforms as seedPlatforms,
  mockSellers as seedSellers,
  mockProductReports as seedReports,
  mockSupportRequests as seedSupport,
  mockAdminActivityLogs as seedLogs,
  mockDataQualityIssues as seedDqIssues,
  mockDuplicateCandidates as seedDuplicates,
} from "@/lib/mock-data";
import type {
  User,
  Product,
  Brand,
  Category,
  Ingredient,
  Platform,
  Seller,
  ProductListing,
  ProductReport,
  SupportRequest,
  AdminActivityLog,
  DataQualityIssue,
  DuplicateCandidate,
  AdminDashboardMetrics,
  AvailabilityStatus,
  ReportStatus,
  SupportStatus,
  AdminEntity,
} from "@/types";

// LocalStorage Keys for persistent admin state
const KEYS = {
  USERS: "beautyiq_admin_users",
  PRODUCTS: "beautyiq_admin_products",
  BRANDS: "beautyiq_admin_brands",
  CATEGORIES: "beautyiq_admin_categories",
  INGREDIENTS: "beautyiq_admin_ingredients",
  PLATFORMS: "beautyiq_admin_platforms",
  SELLERS: "beautyiq_admin_sellers",
  LISTINGS: "beautyiq_admin_listings",
  REPORTS: "beautyiq_admin_reports",
  SUPPORT: "beautyiq_admin_support",
  LOGS: "beautyiq_admin_logs",
  DQ_ISSUES: "beautyiq_admin_dq_issues",
  DUPLICATES: "beautyiq_admin_duplicates",
};

export class AdminDataService {
  // Helper to get items from localStorage with fallback
  private static getStored<T>(key: string, seedData: T[]): T[] {
    if (typeof window === "undefined") return seedData;
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        localStorage.setItem(key, JSON.stringify(seedData));
        return seedData;
      }
      const parsed = JSON.parse(stored);
      // Auto-upgrade stale cache: if seedData has expanded (e.g. from 13/60 to 440 products),
      // update localStorage so user browsers are never trapped in outdated smaller counts
      if (Array.isArray(parsed) && Array.isArray(seedData) && parsed.length < seedData.length) {
        localStorage.setItem(key, JSON.stringify(seedData));
        return seedData;
      }
      return parsed;
    } catch {
      return seedData;
    }
  }

  // Helper to save items to localStorage
  private static saveStored<T>(key: string, data: T[]): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.warn(`Failed to persist key ${key}:`, e);
      }
    }
  }

  // ==========================================
  // ACTIVITY LOGGING
  // ==========================================
  static logAction(
    action: string,
    entity: AdminEntity,
    entityId: string,
    entityName: string,
    details: string,
    status: "success" | "warning" | "error" = "success",
    adminEmail = "admin@beautyiq.com",
    adminName = "BeautyIQ Admin"
  ): AdminActivityLog {
    const logs = this.getStored<AdminActivityLog>(KEYS.LOGS, seedLogs);
    const newLog: AdminActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      adminEmail,
      adminName,
      action,
      entity,
      entityId,
      entityName,
      details,
      status,
    };
    const updated = [newLog, ...logs].slice(0, 100); // Keep last 100 logs
    this.saveStored(KEYS.LOGS, updated);
    return newLog;
  }

  static async getLogs(query?: {
    entity?: string;
    action?: string;
    search?: string;
  }): Promise<AdminActivityLog[]> {
    let logs = this.getStored<AdminActivityLog>(KEYS.LOGS, seedLogs);
    if (query?.entity && query.entity !== "all") {
      logs = logs.filter((l) => l.entity === query.entity);
    }
    if (query?.action) {
      logs = logs.filter((l) => l.action.toLowerCase().includes(query.action!.toLowerCase()));
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.entityName.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.adminEmail.toLowerCase().includes(q)
      );
    }
    return logs;
  }

  // ==========================================
  // CUSTOMER MANAGEMENT
  // ==========================================
  static async getCustomers(query?: {
    search?: string;
    status?: string;
  }): Promise<User[]> {
    let users = this.getStored<User>(KEYS.USERS, mockUsers).filter(
      (u) => u.role === "customer"
    );

    // Strip passwordHash before returning to frontend
    users = users.map((u) => {
      const { passwordHash, resetToken, ...safeUser } = u;
      return safeUser as User;
    });

    if (query?.status && query.status !== "all") {
      users = users.filter((u) => (u.status || "active") === query.status);
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.skinProfile?.skinType && u.skinProfile.skinType.toLowerCase().includes(q))
      );
    }
    return users;
  }

  static async getCustomerById(id: string): Promise<User | null> {
    const users = this.getStored<User>(KEYS.USERS, mockUsers);
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, resetToken, ...safeUser } = user;
    return safeUser as User;
  }

  static async updateCustomerStatus(
    id: string,
    status: "active" | "inactive" | "suspended"
  ): Promise<User | null> {
    const users = this.getStored<User>(KEYS.USERS, mockUsers);
    const user = users.find((u) => u.id === id);
    if (!user) return null;

    user.status = status;
    this.saveStored(KEYS.USERS, users);

    this.logAction(
      "UPDATE_CUSTOMER_STATUS",
      "customer",
      user.id,
      user.name,
      `Status changed to ${status.toUpperCase()}`,
      status === "suspended" ? "warning" : "success"
    );

    const { passwordHash, resetToken, ...safeUser } = user;
    return safeUser as User;
  }

  // ==========================================
  // PRODUCT CATALOG MANAGEMENT
  // ==========================================
  static async getProducts(query?: {
    search?: string;
    category?: string;
    brand?: string;
    status?: string;
  }): Promise<Product[]> {
    let products = this.getStored<Product>(KEYS.PRODUCTS, seedProducts);

    if (query?.category && query.category !== "all") {
      products = products.filter((p) => p.category === query.category);
    }
    if (query?.brand && query.brand !== "all") {
      products = products.filter(
        (p) => p.brand.toLowerCase() === query.brand!.toLowerCase()
      );
    }
    if (query?.status && query.status !== "all") {
      products = products.filter((p) => p.productStatus === query.status);
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.keyIngredients.some((i) => i.toLowerCase().includes(q))
      );
    }
    return products;
  }

  static async getProductById(id: string): Promise<Product | null> {
    const products = this.getStored<Product>(KEYS.PRODUCTS, seedProducts);
    return products.find((p) => p.id === id) || null;
  }

  static async createProduct(productData: Partial<Product>): Promise<Product> {
    const products = this.getStored<Product>(KEYS.PRODUCTS, seedProducts);
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: productData.name || "Untitled Product",
      brand: productData.brand || "Independent",
      category: productData.category || "Serum",
      description: productData.description || "",
      images: productData.images && productData.images.length > 0
        ? productData.images
        : ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=700&auto=format&fit=crop"],
      image: productData.image || productData.images?.[0] || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=700&auto=format&fit=crop",
      quantity: productData.quantity || 50,
      unit: productData.unit || "ml",
      keyIngredients: productData.keyIngredients || [],
      allIngredients: productData.allIngredients || productData.keyIngredients || [],
      rating: productData.rating ?? 4.5,
      reviewCount: productData.reviewCount || 1,
      productStatus: productData.productStatus || "Complete",
      dataConfidence: productData.dataConfidence || 90,
      source: productData.source || "Direct Brand Input",
      lastUpdated: new Date().toISOString().split("T")[0],
      skinTypes: productData.skinTypes || ["All Skin Types" as any],
      targetConcerns: productData.targetConcerns || [],
      pHLevel: productData.pHLevel,
      crueltyFree: productData.crueltyFree ?? true,
      vegan: productData.vegan ?? true,
      fragranceFree: productData.fragranceFree ?? true,
      parabenFree: productData.parabenFree ?? true,
      siliconeFree: productData.siliconeFree ?? false,
      usageTime: productData.usageTime || "Both",
      summary: productData.summary || productData.description?.slice(0, 150) || "",
    };

    const updated = [newProduct, ...products];
    this.saveStored(KEYS.PRODUCTS, updated);

    this.logAction(
      "CREATE_PRODUCT",
      "product",
      newProduct.id,
      newProduct.name,
      `Added new product under brand ${newProduct.brand} and category ${newProduct.category}`
    );

    return newProduct;
  }

  static async updateProduct(
    id: string,
    updates: Partial<Product>
  ): Promise<Product | null> {
    const products = this.getStored<Product>(KEYS.PRODUCTS, seedProducts);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...updates,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    this.saveStored(KEYS.PRODUCTS, products);

    this.logAction(
      "UPDATE_PRODUCT",
      "product",
      id,
      products[index].name,
      `Updated product details and metadata`
    );

    return products[index];
  }

  static async toggleProductStatus(id: string): Promise<Product | null> {
    const products = this.getStored<Product>(KEYS.PRODUCTS, seedProducts);
    const product = products.find((p) => p.id === id);
    if (!product) return null;

    const nextStatus = product.productStatus === "Complete" ? "Incomplete" : "Complete";
    product.productStatus = nextStatus;
    product.lastUpdated = new Date().toISOString().split("T")[0];
    this.saveStored(KEYS.PRODUCTS, products);

    this.logAction(
      "TOGGLE_PRODUCT_STATUS",
      "product",
      id,
      product.name,
      `Product status toggled to ${nextStatus}`
    );

    return product;
  }

  static async deleteProduct(id: string): Promise<boolean> {
    let products = this.getStored<Product>(KEYS.PRODUCTS, seedProducts);
    const target = products.find((p) => p.id === id);
    if (!target) return false;

    products = products.filter((p) => p.id !== id);
    this.saveStored(KEYS.PRODUCTS, products);

    this.logAction(
      "DELETE_PRODUCT",
      "product",
      id,
      target.name,
      `Removed product from catalog`,
      "warning"
    );

    return true;
  }

  // ==========================================
  // BRAND MANAGEMENT
  // ==========================================
  static async getBrands(query?: { search?: string }): Promise<Brand[]> {
    let brands = this.getStored<Brand>(KEYS.BRANDS, seedBrands);
    if (query?.search) {
      const q = query.search.toLowerCase();
      brands = brands.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.country.toLowerCase().includes(q) ||
          b.philosophy.toLowerCase().includes(q)
      );
    }
    return brands;
  }

  static async getBrandById(id: string): Promise<Brand | null> {
    const brands = this.getStored<Brand>(KEYS.BRANDS, seedBrands);
    return brands.find((b) => b.id === id) || null;
  }

  static async createBrand(brandData: Partial<Brand>): Promise<Brand> {
    const brands = this.getStored<Brand>(KEYS.BRANDS, seedBrands);
    const slug = (brandData.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newBrand: Brand = {
      id: brandData.id || slug || `brand-${Date.now()}`,
      name: brandData.name || "New Brand",
      country: brandData.country || "India",
      philosophy: brandData.philosophy || "Modern dermatological skincare formulas.",
      productCount: 0,
      status: "active",
      logoUrl: brandData.logoUrl,
    };

    const updated = [...brands, newBrand];
    this.saveStored(KEYS.BRANDS, updated);

    this.logAction(
      "CREATE_BRAND",
      "brand",
      newBrand.id,
      newBrand.name,
      `Registered brand originating from ${newBrand.country}`
    );

    return newBrand;
  }

  static async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand | null> {
    const brands = this.getStored<Brand>(KEYS.BRANDS, seedBrands);
    const index = brands.findIndex((b) => b.id === id);
    if (index === -1) return null;

    brands[index] = { ...brands[index], ...updates };
    this.saveStored(KEYS.BRANDS, brands);

    this.logAction(
      "UPDATE_BRAND",
      "brand",
      id,
      brands[index].name,
      `Updated brand profile and philosophy`
    );

    return brands[index];
  }

  static async toggleBrandStatus(id: string): Promise<Brand | null> {
    const brands = this.getStored<Brand>(KEYS.BRANDS, seedBrands);
    const brand = brands.find((b) => b.id === id);
    if (!brand) return null;

    brand.status = brand.status === "inactive" ? "active" : "inactive";
    this.saveStored(KEYS.BRANDS, brands);

    this.logAction(
      "TOGGLE_BRAND_STATUS",
      "brand",
      id,
      brand.name,
      `Brand status changed to ${brand.status}`
    );

    return brand;
  }

  static checkDuplicateBrand(name: string, excludeId?: string): boolean {
    const brands = this.getStored<Brand>(KEYS.BRANDS, seedBrands);
    const normalized = name.trim().toLowerCase();
    return brands.some(
      (b) => b.name.toLowerCase() === normalized && b.id !== excludeId
    );
  }

  // ==========================================
  // CATEGORY MANAGEMENT
  // ==========================================
  static async getCategories(): Promise<Category[]> {
    return this.getStored<Category>(KEYS.CATEGORIES, seedCategories);
  }

  static async createCategory(catData: Partial<Category>): Promise<Category> {
    const categories = this.getStored<Category>(KEYS.CATEGORIES, seedCategories);
    const slug = (catData.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newCategory: Category = {
      id: catData.id || slug || `cat-${Date.now()}`,
      name: (catData.name as any) || "Serum",
      productCount: 0,
      image: catData.image || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
      description: catData.description || "Skincare routine step",
      status: "active",
    };

    const updated = [...categories, newCategory];
    this.saveStored(KEYS.CATEGORIES, updated);

    this.logAction(
      "CREATE_CATEGORY",
      "category",
      newCategory.id,
      newCategory.name,
      `Added new skincare routine category`
    );

    return newCategory;
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const categories = this.getStored<Category>(KEYS.CATEGORIES, seedCategories);
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    categories[index] = { ...categories[index], ...updates };
    this.saveStored(KEYS.CATEGORIES, categories);

    this.logAction(
      "UPDATE_CATEGORY",
      "category",
      id,
      categories[index].name,
      `Updated category details`
    );

    return categories[index];
  }

  static async toggleCategoryStatus(id: string): Promise<Category | null> {
    const categories = this.getStored<Category>(KEYS.CATEGORIES, seedCategories);
    const cat = categories.find((c) => c.id === id);
    if (!cat) return null;

    cat.status = cat.status === "inactive" ? "active" : "inactive";
    this.saveStored(KEYS.CATEGORIES, categories);

    this.logAction(
      "TOGGLE_CATEGORY_STATUS",
      "category",
      id,
      cat.name,
      `Category status toggled to ${cat.status}`
    );

    return cat;
  }

  // ==========================================
  // INGREDIENT MANAGEMENT
  // ==========================================
  static async getIngredients(query?: {
    search?: string;
    category?: string;
  }): Promise<Ingredient[]> {
    let ingredients = this.getStored<Ingredient>(KEYS.INGREDIENTS, seedIngredients);
    if (query?.category && query.category !== "all") {
      ingredients = ingredients.filter((i) => i.category === query.category);
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      ingredients = ingredients.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.function.toLowerCase().includes(q) ||
          i.commonNames?.some((cn) => cn.toLowerCase().includes(q)) ||
          i.synonyms?.some((syn) => syn.toLowerCase().includes(q))
      );
    }
    return ingredients;
  }

  static async getIngredientById(id: string): Promise<Ingredient | null> {
    const ingredients = this.getStored<Ingredient>(KEYS.INGREDIENTS, seedIngredients);
    return ingredients.find((i) => i.id === id) || null;
  }

  static async createIngredient(data: Partial<Ingredient>): Promise<Ingredient> {
    const ingredients = this.getStored<Ingredient>(KEYS.INGREDIENTS, seedIngredients);
    const slug = (data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newIng: Ingredient = {
      id: data.id || slug || `ing-${Date.now()}`,
      name: data.name || "New Ingredient",
      commonNames: data.commonNames || [],
      synonyms: data.synonyms || [],
      description: data.description || "Skincare ingredient",
      function: data.function || "Skin conditioning",
      category: data.category || "Active ingredient",
      concentration: data.concentration || "1–5%",
      concernTags: data.concernTags || [],
      safetyRating: data.safetyRating || "Low Hazard",
      comedogenicRating: data.comedogenicRating ?? 0,
      suitableSkinTypes: data.suitableSkinTypes || ["All Skin Types" as any],
      contraindications: data.contraindications || [],
      status: "active",
    };

    const updated = [...ingredients, newIng];
    this.saveStored(KEYS.INGREDIENTS, updated);

    this.logAction(
      "CREATE_INGREDIENT",
      "ingredient",
      newIng.id,
      newIng.name,
      `Added ingredient under category ${newIng.category}`
    );

    return newIng;
  }

  static async updateIngredient(
    id: string,
    updates: Partial<Ingredient>
  ): Promise<Ingredient | null> {
    const ingredients = this.getStored<Ingredient>(KEYS.INGREDIENTS, seedIngredients);
    const index = ingredients.findIndex((i) => i.id === id);
    if (index === -1) return null;

    ingredients[index] = { ...ingredients[index], ...updates };
    this.saveStored(KEYS.INGREDIENTS, ingredients);

    this.logAction(
      "UPDATE_INGREDIENT",
      "ingredient",
      id,
      ingredients[index].name,
      `Updated ingredient properties and synonyms`
    );

    return ingredients[index];
  }

  static async toggleIngredientStatus(id: string): Promise<Ingredient | null> {
    const ingredients = this.getStored<Ingredient>(KEYS.INGREDIENTS, seedIngredients);
    const ing = ingredients.find((i) => i.id === id);
    if (!ing) return null;

    ing.status = ing.status === "inactive" ? "active" : "inactive";
    this.saveStored(KEYS.INGREDIENTS, ingredients);

    this.logAction(
      "TOGGLE_INGREDIENT_STATUS",
      "ingredient",
      id,
      ing.name,
      `Ingredient status changed to ${ing.status}`
    );

    return ing;
  }

  static checkDuplicateIngredient(name: string, excludeId?: string): boolean {
    const ingredients = this.getStored<Ingredient>(KEYS.INGREDIENTS, seedIngredients);
    const normalized = name.trim().toLowerCase();
    return ingredients.some(
      (i) =>
        (i.name.toLowerCase() === normalized ||
          i.commonNames?.some((cn) => cn.toLowerCase() === normalized) ||
          i.synonyms?.some((syn) => syn.toLowerCase() === normalized)) &&
        i.id !== excludeId
    );
  }

  // ==========================================
  // PLATFORMS & SELLERS MANAGEMENT
  // ==========================================
  static async getPlatforms(): Promise<Platform[]> {
    return this.getStored<Platform>(KEYS.PLATFORMS, seedPlatforms);
  }

  static async createPlatform(data: Partial<Platform>): Promise<Platform> {
    const platforms = this.getStored<Platform>(KEYS.PLATFORMS, seedPlatforms);
    const slug = (data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newPlatform: Platform = {
      id: data.id || slug || `plat-${Date.now()}`,
      name: data.name || "New Platform",
      baseUrl: data.baseUrl || "https://example.com",
      status: "active",
      listingCount: 0,
      logoUrl: data.logoUrl,
    };

    const updated = [...platforms, newPlatform];
    this.saveStored(KEYS.PLATFORMS, updated);

    this.logAction(
      "CREATE_PLATFORM",
      "platform",
      newPlatform.id,
      newPlatform.name,
      `Added marketplace platform ${newPlatform.baseUrl}`
    );

    return newPlatform;
  }

  static async updatePlatform(id: string, updates: Partial<Platform>): Promise<Platform | null> {
    const platforms = this.getStored<Platform>(KEYS.PLATFORMS, seedPlatforms);
    const index = platforms.findIndex((p) => p.id === id);
    if (index === -1) return null;

    platforms[index] = { ...platforms[index], ...updates };
    this.saveStored(KEYS.PLATFORMS, platforms);

    this.logAction(
      "UPDATE_PLATFORM",
      "platform",
      id,
      platforms[index].name,
      `Updated platform details`
    );

    return platforms[index];
  }

  static async togglePlatformStatus(id: string): Promise<Platform | null> {
    const platforms = this.getStored<Platform>(KEYS.PLATFORMS, seedPlatforms);
    const plat = platforms.find((p) => p.id === id);
    if (!plat) return null;

    plat.status = plat.status === "inactive" ? "active" : "inactive";
    this.saveStored(KEYS.PLATFORMS, platforms);

    this.logAction(
      "TOGGLE_PLATFORM_STATUS",
      "platform",
      id,
      plat.name,
      `Platform status toggled to ${plat.status}`
    );

    return plat;
  }

  static async getSellers(platformId?: string): Promise<Seller[]> {
    let sellers = this.getStored<Seller>(KEYS.SELLERS, seedSellers);
    if (platformId && platformId !== "all") {
      sellers = sellers.filter((s) => s.platformId === platformId);
    }
    return sellers;
  }

  static async createSeller(data: Partial<Seller>): Promise<Seller> {
    const sellers = this.getStored<Seller>(KEYS.SELLERS, seedSellers);
    const slug = (data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newSeller: Seller = {
      id: data.id || slug || `seller-${Date.now()}`,
      name: data.name || "New Seller",
      platformId: data.platformId || "nykaa",
      rating: data.rating ?? 4.5,
      status: "active",
      listingCount: 0,
    };

    const updated = [...sellers, newSeller];
    this.saveStored(KEYS.SELLERS, updated);

    this.logAction(
      "CREATE_SELLER",
      "seller",
      newSeller.id,
      newSeller.name,
      `Added seller under platform ${newSeller.platformId}`
    );

    return newSeller;
  }

  static async updateSeller(id: string, updates: Partial<Seller>): Promise<Seller | null> {
    const sellers = this.getStored<Seller>(KEYS.SELLERS, seedSellers);
    const index = sellers.findIndex((s) => s.id === id);
    if (index === -1) return null;

    sellers[index] = { ...sellers[index], ...updates };
    this.saveStored(KEYS.SELLERS, sellers);

    this.logAction(
      "UPDATE_SELLER",
      "seller",
      id,
      sellers[index].name,
      `Updated seller credentials`
    );

    return sellers[index];
  }

  static async toggleSellerStatus(id: string): Promise<Seller | null> {
    const sellers = this.getStored<Seller>(KEYS.SELLERS, seedSellers);
    const seller = sellers.find((s) => s.id === id);
    if (!seller) return null;

    seller.status = seller.status === "inactive" ? "active" : "inactive";
    this.saveStored(KEYS.SELLERS, sellers);

    this.logAction(
      "TOGGLE_SELLER_STATUS",
      "seller",
      id,
      seller.name,
      `Seller status toggled to ${seller.status}`
    );

    return seller;
  }

  // ==========================================
  // PRODUCT LISTINGS, PRICE & AVAILABILITY
  // ==========================================
  static async getListings(query?: {
    productId?: string;
    platform?: string;
    availability?: string;
    search?: string;
  }): Promise<ProductListing[]> {
    let listings = this.getStored<ProductListing>(KEYS.LISTINGS, seedListings);

    if (query?.productId && query.productId !== "all") {
      listings = listings.filter((l) => l.productId === query.productId);
    }
    if (query?.platform && query.platform !== "all") {
      listings = listings.filter((l) => l.platform.toLowerCase() === query.platform!.toLowerCase());
    }
    if (query?.availability && query.availability !== "all") {
      listings = listings.filter((l) => l.availability === query.availability);
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      listings = listings.filter(
        (l) =>
          l.platform.toLowerCase().includes(q) ||
          l.seller.toLowerCase().includes(q) ||
          l.productId.toLowerCase().includes(q)
      );
    }
    return listings;
  }

  static async getListingById(id: string): Promise<ProductListing | null> {
    const listings = this.getStored<ProductListing>(KEYS.LISTINGS, seedListings);
    return listings.find((l) => l.id === id) || null;
  }

  static async createListing(data: Partial<ProductListing>): Promise<ProductListing> {
    const listings = this.getStored<ProductListing>(KEYS.LISTINGS, seedListings);

    const price = data.price !== undefined ? data.price : 499;
    const quantity = data.quantity || 50;
    const unit = data.unit || "ml";
    const unitPricePerMl = price && unit === "ml" && quantity > 0 ? Number((price / quantity).toFixed(2)) : undefined;

    const newListing: ProductListing = {
      id: data.id || `l-${data.productId || "p1"}-${Date.now().toString(36)}`,
      productId: data.productId || "p1",
      platform: data.platform || "Nykaa",
      seller: data.seller || "Official Store",
      price,
      originalPrice: data.originalPrice || (price ? Math.round(price * 1.15) : undefined),
      discountPercent: data.discountPercent || (price && data.originalPrice ? Math.round(((data.originalPrice - price) / data.originalPrice) * 100) : 0),
      quantity,
      unit,
      availability: data.availability || "Available",
      productUrl: data.productUrl || "https://nykaa.com",
      lastUpdated: new Date().toISOString().split("T")[0],
      unitPricePerMl,
      valueScore: data.valueScore || 88,
    };

    const updated = [newListing, ...listings];
    this.saveStored(KEYS.LISTINGS, updated);

    this.logAction(
      "CREATE_LISTING",
      "listing",
      newListing.id,
      `${newListing.platform} - ${newListing.seller}`,
      `Created listing for product #${newListing.productId} at ₹${newListing.price ?? "N/A"}`
    );

    return newListing;
  }

  static async updateListing(
    id: string,
    updates: Partial<ProductListing>
  ): Promise<ProductListing | null> {
    const listings = this.getStored<ProductListing>(KEYS.LISTINGS, seedListings);
    const index = listings.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const current = listings[index];
    const price = updates.price !== undefined ? updates.price : current.price;
    const quantity = updates.quantity || current.quantity;
    const unit = updates.unit || current.unit;
    const unitPricePerMl = price && unit === "ml" && quantity > 0 ? Number((price / quantity).toFixed(2)) : undefined;

    listings[index] = {
      ...current,
      ...updates,
      price,
      unitPricePerMl,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    this.saveStored(KEYS.LISTINGS, listings);

    this.logAction(
      "UPDATE_LISTING",
      "listing",
      id,
      `${listings[index].platform} - ${listings[index].seller}`,
      `Updated listing attributes`
    );

    return listings[index];
  }

  static async updatePriceAvailability(
    id: string,
    price: number | null,
    availability: AvailabilityStatus
  ): Promise<ProductListing | null> {
    const listings = this.getStored<ProductListing>(KEYS.LISTINGS, seedListings);
    const listing = listings.find((l) => l.id === id);
    if (!listing) return null;

    const oldPrice = listing.price;
    const oldAvail = listing.availability;
    listing.price = price;
    listing.availability = availability;
    listing.lastUpdated = new Date().toISOString().split("T")[0];

    if (price && listing.quantity > 0 && listing.unit === "ml") {
      listing.unitPricePerMl = Number((price / listing.quantity).toFixed(2));
    }

    this.saveStored(KEYS.LISTINGS, listings);

    this.logAction(
      "UPDATE_PRICE_AVAILABILITY",
      "listing",
      id,
      `${listing.platform} - ${listing.seller}`,
      `Price changed from ₹${oldPrice ?? "N/A"} to ₹${price ?? "N/A"}, availability: ${oldAvail} → ${availability}`
    );

    return listing;
  }

  static async deleteListing(id: string): Promise<boolean> {
    let listings = this.getStored<ProductListing>(KEYS.LISTINGS, seedListings);
    const target = listings.find((l) => l.id === id);
    if (!target) return false;

    listings = listings.filter((l) => l.id !== id);
    this.saveStored(KEYS.LISTINGS, listings);

    this.logAction(
      "DELETE_LISTING",
      "listing",
      id,
      `${target.platform} - ${target.seller}`,
      `Deleted listing for product #${target.productId}`,
      "warning"
    );

    return true;
  }

  // ==========================================
  // PRODUCT REPORTS
  // ==========================================
  static async getReports(query?: {
    status?: string;
    reportType?: string;
  }): Promise<ProductReport[]> {
    let reports = this.getStored<ProductReport>(KEYS.REPORTS, seedReports);
    if (query?.status && query.status !== "all") {
      reports = reports.filter((r) => r.status === query.status);
    }
    if (query?.reportType && query.reportType !== "all") {
      reports = reports.filter((r) => r.reportType === query.reportType);
    }
    return reports;
  }

  static async updateReportStatus(
    id: string,
    status: ReportStatus,
    adminNotes?: string
  ): Promise<ProductReport | null> {
    const reports = this.getStored<ProductReport>(KEYS.REPORTS, seedReports);
    const report = reports.find((r) => r.id === id);
    if (!report) return null;

    report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    if (status === "resolved" || status === "rejected") {
      report.resolvedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
    }

    this.saveStored(KEYS.REPORTS, reports);

    this.logAction(
      "UPDATE_REPORT_STATUS",
      "report",
      id,
      report.productName,
      `Report status changed to ${status.toUpperCase()}. Notes: ${adminNotes || "None"}`
    );

    return report;
  }

  // ==========================================
  // SUPPORT REQUESTS
  // ==========================================
  static async getSupportRequests(query?: {
    status?: string;
    priority?: string;
    category?: string;
  }): Promise<SupportRequest[]> {
    let support = this.getStored<SupportRequest>(KEYS.SUPPORT, seedSupport);
    if (query?.status && query.status !== "all") {
      support = support.filter((s) => s.status === query.status);
    }
    if (query?.priority && query.priority !== "all") {
      support = support.filter((s) => s.priority === query.priority);
    }
    if (query?.category && query.category !== "all") {
      support = support.filter((s) => s.category === query.category);
    }
    return support;
  }

  static async updateSupportStatus(
    id: string,
    status: SupportStatus,
    adminResponse?: string
  ): Promise<SupportRequest | null> {
    const support = this.getStored<SupportRequest>(KEYS.SUPPORT, seedSupport);
    const ticket = support.find((s) => s.id === id);
    if (!ticket) return null;

    ticket.status = status;
    if (adminResponse) ticket.adminResponse = adminResponse;
    ticket.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

    this.saveStored(KEYS.SUPPORT, support);

    this.logAction(
      "UPDATE_SUPPORT_STATUS",
      "support",
      id,
      ticket.subject,
      `Ticket status updated to ${status.toUpperCase()}`
    );

    return ticket;
  }

  // ==========================================
  // DATA QUALITY & DUPLICATES
  // ==========================================
  static async getDataQualityIssues(): Promise<DataQualityIssue[]> {
    return this.getStored<DataQualityIssue>(KEYS.DQ_ISSUES, seedDqIssues);
  }

  static async resolveDataQualityIssue(id: string): Promise<boolean> {
    const issues = this.getStored<DataQualityIssue>(KEYS.DQ_ISSUES, seedDqIssues);
    const issue = issues.find((i) => i.id === id);
    if (!issue) return false;

    issue.status = "resolved";
    this.saveStored(KEYS.DQ_ISSUES, issues);

    this.logAction(
      "RESOLVE_DATA_QUALITY_ISSUE",
      "system",
      id,
      issue.entityName,
      `Marked data quality issue (${issue.issueType}) as resolved`
    );

    return true;
  }

  static async getDuplicateCandidates(): Promise<DuplicateCandidate[]> {
    return this.getStored<DuplicateCandidate>(KEYS.DUPLICATES, seedDuplicates);
  }

  static async resolveDuplicateCandidate(
    id: string,
    status: "merged" | "dismissed"
  ): Promise<boolean> {
    const dups = this.getStored<DuplicateCandidate>(KEYS.DUPLICATES, seedDuplicates);
    const dup = dups.find((d) => d.id === id);
    if (!dup) return false;

    dup.status = status;
    this.saveStored(KEYS.DUPLICATES, dups);

    this.logAction(
      "REVIEW_DUPLICATE_CANDIDATE",
      dup.entityType as AdminEntity,
      id,
      `${dup.item1.name} ⟷ ${dup.item2.name}`,
      `Duplicate candidate marked as ${status.toUpperCase()}`
    );

    return true;
  }

  // ==========================================
  // DYNAMIC DASHBOARD METRICS
  // ==========================================
  static async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    const users = this.getStored<User>(KEYS.USERS, mockUsers).filter((u) => u.role === "customer");
    const products = this.getStored<Product>(KEYS.PRODUCTS, seedProducts);
    const brands = this.getStored<Brand>(KEYS.BRANDS, seedBrands);
    const categories = this.getStored<Category>(KEYS.CATEGORIES, seedCategories);
    const ingredients = this.getStored<Ingredient>(KEYS.INGREDIENTS, seedIngredients);
    const platforms = this.getStored<Platform>(KEYS.PLATFORMS, seedPlatforms);
    const sellers = this.getStored<Seller>(KEYS.SELLERS, seedSellers);
    const listings = this.getStored<ProductListing>(KEYS.LISTINGS, seedListings);
    const reports = this.getStored<ProductReport>(KEYS.REPORTS, seedReports);
    const support = this.getStored<SupportRequest>(KEYS.SUPPORT, seedSupport);
    const duplicates = this.getStored<DuplicateCandidate>(KEYS.DUPLICATES, seedDuplicates);
    const logs = this.getStored<AdminActivityLog>(KEYS.LOGS, seedLogs);

    // Dynamic Category Distribution
    const catMap: Record<string, number> = {};
    products.forEach((p) => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(catMap).map(([category, count]) => ({
      category,
      count,
    }));

    // Dynamic Brand Distribution
    const brandMap: Record<string, number> = {};
    products.forEach((p) => {
      brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
    });
    const brandDistribution = Object.entries(brandMap).map(([brand, count]) => ({
      brand,
      count,
    }));

    // Availability Distribution
    const availMap: Record<string, number> = {};
    listings.forEach((l) => {
      availMap[l.availability] = (availMap[l.availability] || 0) + 1;
    });
    const availabilityDistribution = Object.entries(availMap).map(([status, count]) => ({
      status,
      count,
    }));

    // Incomplete / Review Products
    const incompleteCount = products.filter(
      (p) =>
        p.productStatus === "Incomplete" ||
        !p.keyIngredients?.length ||
        !p.images?.length ||
        p.rating === null
    ).length;

    return {
      totalCustomers: users.length,
      activeCustomers: users.filter((u) => (u.status || "active") === "active").length,
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.productStatus === "Complete").length,
      totalBrands: brands.length,
      totalCategories: categories.length,
      totalIngredients: ingredients.length,
      totalPlatforms: platforms.length,
      totalSellers: sellers.length,
      totalListings: listings.length,
      availableListings: listings.filter((l) => l.availability === "Available").length,
      unavailableListings: listings.filter((l) => l.availability === "Unavailable").length,
      incompleteProducts: incompleteCount,
      reviewProducts: products.filter((p) => p.dataConfidence < 85).length,
      duplicateCandidatesCount: duplicates.filter((d) => d.status === "pending").length,
      openReportsCount: reports.filter((r) => r.status === "open" || r.status === "reviewing").length,
      openSupportCount: support.filter((s) => s.status === "open" || s.status === "in_progress").length,
      categoryDistribution,
      brandDistribution,
      availabilityDistribution,
      dataQualityHealthScore: Math.round(
        ((products.length - incompleteCount) / (products.length || 1)) * 100
      ),
      recentActivity: logs.slice(0, 6),
    };
  }
}
