// Fallback type for Strapi's ID
type ID = string | number;

// Define type for entityService.update options to fix TS2339
interface UpdateOptions {
  data: {
    product_type?: any[];
    [key: string]: any;
  };
}

// Interfaces based on provided schemas
interface BillingDetail {
  id: number;
  SGST?: number;
  IGST?: number;
  CGST?: number;
  HSN?: string;
}

interface ImageDetails {
  id: number;
  [key: string]: any; // Placeholder for details.image-details
}

interface ShippingDetails {
  id: number;
  needed?: boolean;
  weight?: number;
  height?: number;
  width?: number;
  depth?: number;
  shipping_description?: string;
}

interface Varient {
  id: number;
  documentId: string;
  varient_name: string;
  slug: string;
  varient_description?: string;
  is_default?: boolean;
  product_price?: number;
  tax_details?: BillingDetail;
  image_details?: ImageDetails;
  shipping_details?: ShippingDetails[];
}

interface Tag {
  id: number;
  tag_name: string;
}

interface ProductCategory {
  id: number;
  documentId: string;
  category_name: string;
  sub_category_name?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface Product {
  id: ID; // string | number to match Strapi's ID type
  documentId: string;
  name?: string;
  description?: string;
  slug?: string;
  short_description?: string;
  review_on?: boolean;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  publishedAt?: string | Date | null;
  locale?: string | null;
  product_categories?: ProductCategory[];
  tag?: Tag[];
  product_type?: Array<{
    __component: 'product-types.simple-product' | 'product-types.grouped-product' | 'product-types.varient-product' | 'product-types.affiliate-product';
    id: number;
    product_price?: number;
    tax_details?: BillingDetail;
    image_details?: ImageDetails;
    shipping_details?: ShippingDetails;
    varients?: Varient[];
    affiliate_tracking_code?: string;
    external_url?: string;
  }>;
}

export default {
  async afterCreate(event: { result: Product }) {
    try {
      const { result } = event;
      strapi.log.info(`afterCreate: Processing product result: ${JSON.stringify(result, null, 2)}`);
      strapi.log.debug(`afterCreate: Full event: ${JSON.stringify(event, null, 2)}`);

      // Skip draft entries if using draft-and-publish
      if (!result.publishedAt) {
        strapi.log.info(`afterCreate: Skipping draft entry for documentId: ${result.documentId}`);
        return;
      }

      // Fetch the product with populated product_type data
      const product: Product = await strapi.entityService.findOne('api::product.product', result.id, {
        populate: {
          product_type: {
            on: {
              'product-types.simple-product': { populate: ['tax_details', 'image_details', 'shipping_details'] },
              'product-types.grouped-product': { populate: ['tax_details', 'image_details', 'shipping_details'] },
              'product-types.varient-product': { populate: ['varients'] },
              'product-types.affiliate-product': { populate: [] },
            },
          },
          product_categories: true,
          tag: true,
        },
      });

      if (!product || !product.product_type) {
        strapi.log.warn(`afterCreate: No product or product_type found for documentId: ${result.documentId}`);
        return;
      }

      strapi.log.info(`afterCreate: Found ${product.product_type.length} product_type components`);

      // No total_tax calculation needed, return early
      strapi.log.info(`afterCreate: No updates required for documentId: ${result.documentId}`);
    } catch (err) {
      strapi.log.error('Error in product afterCreate:', {
        message: err.message || 'Unknown error',
        stack: err.stack,
        result: JSON.stringify(event.result, null, 2),
        event: JSON.stringify(event, null, 2),
      });
      throw err; // Rethrow to ensure error is logged in Strapi
    }
  },

  async afterUpdate(event: { result: Product }) {
    try {
      const { result } = event;
      strapi.log.info(`afterUpdate: Processing product result: ${JSON.stringify(result, null, 2)}`);
      strapi.log.debug(`afterUpdate: Full event: ${JSON.stringify(event, null, 2)}`);

      // Skip draft entries if using draft-and-publish
      if (!result.publishedAt) {
        strapi.log.info(`afterUpdate: Skipping draft entry for documentId: ${result.documentId}`);
        return;
      }

      // Fetch the product with populated product_type data
      const product: Product = await strapi.entityService.findOne('api::product.product', result.id, {
        populate: {
          product_type: {
            on: {
              'product-types.simple-product': { populate: ['tax_details', 'image_details', 'shipping_details'] },
              'product-types.grouped-product': { populate: ['tax_details', 'image_details', 'shipping_details'] },
              'product-types.varient-product': { populate: ['varients'] },
              'product-types.affiliate-product': { populate: [] },
            },
          },
          product_categories: true,
          tag: true,
        },
      });

      if (!product || !product.product_type) {
        strapi.log.warn(`afterUpdate: No product or product_type found for documentId: ${result.documentId}`);
        return;
      }

      strapi.log.info(`afterUpdate: Found ${product.product_type.length} product_type components`);

      // No total_tax calculation needed, return early
      strapi.log.info(`afterUpdate: No updates required for documentId: ${result.documentId}`);
    } catch (err) {
      strapi.log.error('Error in product afterUpdate:', {
        message: err.message || 'Unknown error',
        stack: err.stack,
        result: JSON.stringify(event.result, null, 2),
        event: JSON.stringify(event, null, 2),
      });
      throw err; // Rethrow to ensure error is logged
    }
  },
};