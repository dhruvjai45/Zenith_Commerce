interface Cart {
  id: string | number;
  documentId: string;
  users_permissions_user?: { id: string | number };
  item?: Array<{
    id: number;
    product?: {
      id: string | number;
      product_type?: Array<{
        __component: 'product-types.simple-product' | 'product-types.grouped-product' | 'product-types.varient-product' | 'product-types.affiliate-product';
        product_price?: number;
        total_tax?: number;
        varients?: Array<{
          id: string | number;
          product_price?: number;
          total_tax?: number;
        }>;
      }>;
    };
    varient?: {
      id: string | number;
      product_price?: number;
      total_tax?: number;
    };
    quantity?: number;
  }>;
  total_product_price?: number;
  total_tax?: number;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  publishedAt?: string | Date | null;
  locale?: string | null;
}

const calculateCartTotals = (items: Cart['item']): { total_product_price: number; total_tax: number } => {
  if (!items || !Array.isArray(items)) {
    strapi.log.warn('No items provided for cart totals calculation');
    return { total_product_price: 0, total_tax: 0 };
  }

  let total_product_price = 0;
  let total_tax = 0;

  for (const item of items) {
    const quantity = item.quantity || 1;
    strapi.log.debug(`Processing item: ${JSON.stringify(item, null, 2)}`);

    if (item.varient) {
      if (!item.varient.product_price || !item.varient.total_tax) {
        strapi.log.warn(`Varient missing product_price or total_tax: ${JSON.stringify(item.varient, null, 2)}`);
        continue;
      }
      const productPrice = item.varient.product_price;
      const tax = item.varient.total_tax;
      total_product_price += productPrice * quantity;
      total_tax += tax * quantity;
      strapi.log.info(`Varient item: product_price=${productPrice}, total_tax=${tax}, quantity=${quantity}`);
    } else if (item.product && item.product.product_type && item.product.product_type.length > 0) {
      const productType = item.product.product_type[0];
      strapi.log.debug(`Product type: ${JSON.stringify(productType, null, 2)}`);

      if (
        productType.__component === 'product-types.simple-product' ||
        productType.__component === 'product-types.grouped-product'
      ) {
        if (!productType.product_price || !productType.total_tax) {
          strapi.log.warn(`Product type (${productType.__component}) missing product_price or total_tax: ${JSON.stringify(productType, null, 2)}`);
          continue;
        }
        const productPrice = productType.product_price;
        const tax = productType.total_tax;
        total_product_price += productPrice * quantity;
        total_tax += tax * quantity;
        strapi.log.info(`Product item (${productType.__component}): product_price=${productPrice}, total_tax=${tax}, quantity=${quantity}`);
      } else if (productType.__component === 'product-types.varient-product' && productType.varients && productType.varients.length > 0) {
        const varient = productType.varients.find(v => v.id === (item.varient?.id || productType.varients[0].id));
        if (!varient || !varient.product_price || !varient.total_tax) {
          strapi.log.warn(`Varient-product missing valid varient or data: ${JSON.stringify(productType, null, 2)}`);
          continue;
        }
        const productPrice = varient.product_price;
        const tax = varient.total_tax;
        total_product_price += productPrice * quantity;
        total_tax += tax * quantity;
        strapi.log.info(`Varient-product item: product_price=${productPrice}, total_tax=${tax}, quantity=${quantity}`);
      } else {
        strapi.log.warn(`Unsupported product_type (${productType.__component}) or missing data: ${JSON.stringify(productType, null, 2)}`);
      }
    } else {
      strapi.log.warn(`Item has no valid product or varient data: ${JSON.stringify(item, null, 2)}`);
    }
  }

  return {
    total_product_price: parseFloat(total_product_price.toFixed(2)),
    total_tax: parseFloat(total_tax.toFixed(2)),
  };
};

export default {
  async afterCreate(event: any) {
    try {
      const { result } = event;
      strapi.log.info(`afterCreate: Processing cart result: ${JSON.stringify(result, null, 2)}`);
      strapi.log.debug(`afterCreate: Full event: ${JSON.stringify(event, null, 2)}`);

      if (!result.publishedAt) {
        strapi.log.info(`afterCreate: Skipping draft entry for documentId: ${result.documentId}`);
        return;
      }

      const cart: Cart = await strapi.entityService.findOne('api::cart.cart', result.id, {
        populate: {
          item: {
            populate: {
              product: {
                populate: {
                  product_type: true,
                },
              },
              varient: {
                fields: ['product_price', 'total_tax'],
                populate: ['tax_details'],
              },
            },
          },
        } as any, // Temporary workaround for TS2322
      });

      if (!cart || !cart.item || !Array.isArray(cart.item)) {
        strapi.log.warn(`afterCreate: No cart or items found for documentId: ${result.documentId}`);
        return;
      }

      strapi.log.info(`afterCreate: Found ${cart.item.length} items`);

      const { total_product_price, total_tax } = calculateCartTotals(cart.item);

      const needsUpdate =
        cart.total_product_price !== total_product_price || cart.total_tax !== total_tax;

      if (!needsUpdate) {
        strapi.log.info(`afterCreate: No update needed for documentId: ${result.documentId}, totals unchanged`);
        return;
      }

      strapi.log.debug(`afterCreate: Calculated totals: total_product_price=${total_product_price}, total_tax=${total_tax}`);

      try {
        await strapi.entityService.update('api::cart.cart', result.id, {
          data: {
            total_product_price,
            total_tax,
          },
        });
        strapi.log.info(`afterCreate: Updated cart with new totals for documentId: ${result.documentId}`);
      } catch (updateErr) {
        strapi.log.error(`afterCreate: Failed to update cart for id ${result.id}`, {
          message: updateErr.message || 'Unknown error',
          stack: updateErr.stack,
          details: JSON.stringify(updateErr, null, 2),
        });
        throw updateErr;
      }

      const updatedCart: Cart = await strapi.entityService.findOne('api::cart.cart', result.id, {
        populate: {
          item: {
            populate: {
              product: {
                populate: {
                  product_type: true,
                },
              },
              varient: {
                fields: ['product_price', 'total_tax'],
                populate: ['tax_details'],
              },
            },
          },
        } as any, // Temporary workaround for TS2322
      });
      strapi.log.info(`afterCreate: Updated cart: ${JSON.stringify(updatedCart, null, 2)}`);
    } catch (err) {
      strapi.log.error('Error in cart afterCreate:', {
        message: err.message || 'Unknown error',
        stack: err.stack,
        result: JSON.stringify(event.result, null, 2),
        event: JSON.stringify(event, null, 2),
      });
    }
  },

  async afterUpdate(event: any) {
    try {
      const { result } = event;
      strapi.log.info(`afterUpdate: Processing cart result: ${JSON.stringify(result, null, 2)}`);
      strapi.log.debug(`afterUpdate: Full event: ${JSON.stringify(event, null, 2)}`);

      if (!result.publishedAt) {
        strapi.log.info(`afterUpdate: Skipping draft entry for documentId: ${result.documentId}`);
        return;
      }

      const cart: Cart = await strapi.entityService.findOne('api::cart.cart', result.id, {
        populate: {
          item: {
            populate: {
              product: {
                populate: {
                  product_type: true,
                },
              },
              varient: {
                fields: ['product_price', 'total_tax'],
                populate: ['tax_details'],
              },
            },
          },
        } as any, // Temporary workaround for TS2322
      });

      if (!cart || !cart.item || !Array.isArray(cart.item)) {
        strapi.log.warn(`afterUpdate: No cart or items found for documentId: ${result.documentId}`);
        return;
      }

      strapi.log.info(`afterUpdate: Found ${cart.item.length} items`);

      const { total_product_price, total_tax } = calculateCartTotals(cart.item);

      const needsUpdate =
        cart.total_product_price !== total_product_price || cart.total_tax !== total_tax;

      if (!needsUpdate) {
        strapi.log.info(`afterUpdate: No update needed for documentId: ${result.documentId}, totals unchanged`);
        return;
      }

      strapi.log.debug(`afterUpdate: Calculated totals: total_product_price=${total_product_price}, total_tax=${total_tax}`);

      try {
        await strapi.entityService.update('api::cart.cart', result.id, {
          data: {
            total_product_price,
            total_tax,
          },
        });
        strapi.log.info(`afterUpdate: Updated cart with new totals for documentId: ${result.documentId}`);
      } catch (updateErr) {
        strapi.log.error(`afterUpdate: Failed to update cart for id ${result.id}`, {
          message: updateErr.message || 'Unknown error',
          stack: updateErr.stack,
          details: JSON.stringify(updateErr, null, 2),
        });
        throw updateErr;
      }

      const updatedCart: Cart = await strapi.entityService.findOne('api::cart.cart', result.id, {
        populate: {
          item: {
            populate: {
              product: {
                populate: {
                  product_type: true,
                },
              },
              varient: {
                fields: ['product_price', 'total_tax'],
                populate: ['tax_details'],
              },
            },
          },
        } as any, // Temporary workaround for TS2322
      });
      strapi.log.info(`afterUpdate: Updated cart: ${JSON.stringify(updatedCart, null, 2)}`);
    } catch (err) {
      strapi.log.error('Error in cart afterUpdate:', {
        message: err.message || 'Unknown error',
        stack: err.stack,
        result: JSON.stringify(event.result, null, 2),
        event: JSON.stringify(event, null, 2),
      });
    }
  },
};