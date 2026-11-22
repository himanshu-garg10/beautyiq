import type { Product, ProductListing } from "@/types";
import { RetailerAggregatorService as ClientRetailerAggregatorService, RETAILER_PLATFORMS, getDirectStoreForBrand } from "@/services/retailer-aggregator.service";

export { RETAILER_PLATFORMS, getDirectStoreForBrand };
export const RetailerAggregatorService = ClientRetailerAggregatorService;
