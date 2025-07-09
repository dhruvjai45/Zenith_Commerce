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
  total_tax?: number;
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
    total_tax?: number;
    tax_details?: BillingDetail;
    image_details?: ImageDetails;
    shipping_details?: ShippingDetails;
    varients?: Varient[];
    affiliate_tracking_code?: string; // Optional, as schema is unclear
    external_url?: string; // Optional, as schema is unclear
  }>;
}

const calculateTotalTax = (component: any): number => {
  const taxDetails = component.tax_details;
  const productPrice = component.product_price || 0;

  if (!taxDetails) {
    strapi.log.warn('No tax_details provided for total tax calculation');
    return 0;
  }

  if (!productPrice) {
    strapi.log.warn('No product_price provided for total tax calculation');
    return 0;
  }

  const { SGST = 0, CGST = 0 } = taxDetails;
  const totalTax = parseFloat((productPrice * (SGST + CGST) / 100).toFixed(2));
  strapi.log.info(`Calculated total tax: ${totalTax} for product_price: ${productPrice}, tax_details: ${JSON.stringify(taxDetails)}`);
  return totalTax;
};

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
              'product-types.affiliate-product': { populate: [] }, // Removed invalid affiliate_tracking_code, external_url
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

      // Prepare updated product_type array
      const updatedProductType = product.product_type.map((component) => {
        strapi.log.debug(`afterCreate: Raw component: ${JSON.stringify(component)}`);
        const componentName = component.__component;
        strapi.log.debug(`afterCreate: Processing component: ${componentName}`);

        if (
          componentName === 'product-types.simple-product' ||
          componentName === 'product-types.grouped-product'
        ) {
          const totalTax = calculateTotalTax(component);
          strapi.log.info(`afterCreate: Calculated total_tax: ${totalTax} for component ${componentName}`);

          // Only update if total_tax differs to prevent recursive updates
          if (component.total_tax !== totalTax) {
            return {
              ...component,
              total_tax: totalTax,
            };
          }
        }
        return component; // Return unchanged for non-relevant components
      });

      // Only update if there are changes to avoid recursive triggers
      const needsUpdate = updatedProductType.some((component, index) => component.total_tax !== product.product_type![index].total_tax);
      if (!needsUpdate) {
        strapi.log.info(`afterCreate: No update needed for documentId: ${result.documentId}, total_tax unchanged`);
        return;
      }

      strapi.log.debug(`afterCreate: Updated product_type: ${JSON.stringify(updatedProductType, null, 2)}`);

      // Update the product with the modified product_type array
      try {
        await strapi.entityService.update('api::product.product', result.id, {
          data: {
            product_type: updatedProductType,
          },
        } as UpdateOptions);
        strapi.log.info(`afterCreate: Updated product with new product_type for documentId: ${result.documentId}`);
      } catch (updateErr) {
        strapi.log.error(`afterCreate: Failed to update product for id ${result.id}`, {
          message: updateErr.message || 'Unknown error',
          stack: updateErr.stack,
          details: JSON.stringify(updateErr, null, 2),
        });
        throw updateErr;
      }

      // Fetch and log the updated product
      const updatedProduct: Product = await strapi.entityService.findOne('api::product.product', result.id, {
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
      strapi.log.info(`afterCreate: Updated product: ${JSON.stringify(updatedProduct, null, 2)}`);
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

      // Prepare updated product_type array
      const updatedProductType = product.product_type.map((component) => {
        strapi.log.debug(`afterUpdate: Raw component: ${JSON.stringify(component)}`);
        const componentName = component.__component;
        strapi.log.debug(`afterUpdate: Processing component: ${componentName}`);

        if (
          componentName === 'product-types.simple-product' ||
          componentName === 'product-types.grouped-product'
        ) {
          const totalTax = calculateTotalTax(component);
          strapi.log.info(`afterUpdate: Calculated total_tax: ${totalTax} for component ${componentName}`);

          // Only update if total_tax differs to prevent recursive updates
          if (component.total_tax !== totalTax) {
            return {
              ...component,
              total_tax: totalTax,
            };
          }
        }
        return component; // Return unchanged for non-relevant components
      });

      // Only update if there are changes to avoid recursive triggers
      const needsUpdate = updatedProductType.some((component, index) => component.total_tax !== product.product_type![index].total_tax);
      if (!needsUpdate) {
        strapi.log.info(`afterUpdate: No update needed for documentId: ${result.documentId}, total_tax unchanged`);
        return;
      }

      strapi.log.debug(`afterUpdate: Updated product_type: ${JSON.stringify(updatedProductType, null, 2)}`);

      // Update the product with the modified product_type array
      try {
        await strapi.entityService.update('api::product.product', result.id, {
          data: {
            product_type: updatedProductType,
          },
        } as UpdateOptions);
        strapi.log.info(`afterUpdate: Updated product with new product_type for documentId: ${result.documentId}`);
      } catch (updateErr) {
        strapi.log.error(`afterUpdate: Failed to update product for id ${result.id}`, {
          message: updateErr.message || 'Unknown error',
          stack: updateErr.stack,
          details: JSON.stringify(updateErr, null, 2),
        });
        throw updateErr;
      }

      // Fetch and log the updated product
      const updatedProduct: Product = await strapi.entityService.findOne('api::product.product', result.id, {
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
      strapi.log.info(`afterUpdate: Updated product: ${JSON.stringify(updatedProduct, null, 2)}`);
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