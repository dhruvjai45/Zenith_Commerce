interface Cart {
  id: string | number;
  documentId: string;
  users_permissions_user?: { id: string | number };
  item?: Array<{
    id: number;
    product?: {
      id: string | number;
      documentId?: string;
      product_type?: Array<{
        __component: 'product-types.simple-product' | 'product-types.grouped-product' | 'product-types.varient-product' | 'product-types.affiliate-product';
        product_price?: number;
        total_tax?: number | null;
        varients?: Array<{
          id: string | number;
          product_price?: number;
          total_tax?: number | null;
        }>;
      }>;
    };
    varient?: {
      id: string | number;
      documentId?: string;
      product_price?: number;
      total_tax?: number | null;
      tax_details?: any;
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
  strapi.log.debug('calculateCartTotals: Starting calculation');
  if (!items || !Array.isArray(items)) {
    strapi.log.warn('calculateCartTotals: No items provided or items is not an array');
    return { total_product_price: 0, total_tax: 0 };
  }

  strapi.log.info(`calculateCartTotals: Processing ${items.length} items`);
  let total_product_price = 0;
  let total_tax = 0;

  for (const [index, item] of items.entries()) {
    strapi.log.debug(`calculateCartTotals: Processing item ${index + 1}: ${JSON.stringify(item, null, 2)}`);
    const quantity = item.quantity || 1;
    strapi.log.debug(`calculateCartTotals: Item ${index + 1} quantity: ${quantity}`);

    if (item.varient) {
      strapi.log.debug(`calculateCartTotals: Item ${index + 1} has varient: ${JSON.stringify(item.varient, null, 2)}`);
      if (!item.varient.product_price) {
        strapi.log.warn(`calculateCartTotals: Item ${index + 1} varient missing product_price: ${JSON.stringify(item.varient, null, 2)}`);
        continue;
      }
      const productPrice = item.varient.product_price;
      const tax = item.varient.total_tax ?? 0;
      total_product_price += productPrice * quantity;
      total_tax += tax * quantity;
      strapi.log.info(`calculateCartTotals: Item ${index + 1} varient - product_price=${productPrice}, total_tax=${tax}, quantity=${quantity}, subtotal=${productPrice * quantity}, subtax=${tax * quantity}`);
    } else if (item.product) {
      strapi.log.debug(`calculateCartTotals: Item ${index + 1} has product: ${JSON.stringify(item.product, null, 2)}`);
      if (!item.product.product_type || !Array.isArray(item.product.product_type) || item.product.product_type.length === 0) {
        strapi.log.warn(`calculateCartTotals: Item ${index + 1} product missing product_type or product_type is empty: ${JSON.stringify(item.product, null, 2)}`);
        continue;
      }
      const productType = item.product.product_type[0];
      strapi.log.debug(`calculateCartTotals: Item ${index + 1} product type: ${JSON.stringify(productType, null, 2)}`);

      if (
        productType.__component === 'product-types.simple-product' ||
        productType.__component === 'product-types.grouped-product'
      ) {
        if (!productType.product_price) {
          strapi.log.warn(`calculateCartTotals: Item ${index + 1} product type (${productType.__component}) missing product_price: ${JSON.stringify(productType, null, 2)}`);
          continue;
        }
        const productPrice = productType.product_price;
        const tax = productType.total_tax ?? 0;
        total_product_price += productPrice * quantity;
        total_tax += tax * quantity;
        strapi.log.info(`calculateCartTotals: Item ${index + 1} product (${productType.__component}) - product_price=${productPrice}, total_tax=${tax}, quantity=${quantity}, subtotal=${productPrice * quantity}, subtax=${tax * quantity}`);
      } else if (productType.__component === 'product-types.varient-product' && productType.varients && productType.varients.length > 0) {
        const varient = productType.varients.find(v => v.id === (item.varient?.id || productType.varients[0].id));
        if (!varient || !varient.product_price) {
          strapi.log.warn(`calculateCartTotals: Item ${index + 1} varient-product missing valid varient or product_price: ${JSON.stringify(productType, null, 2)}`);
          continue;
        }
        const productPrice = varient.product_price;
        const tax = varient.total_tax ?? 0;
        total_product_price += productPrice * quantity;
        total_tax += tax * quantity;
        strapi.log.info(`calculateCartTotals: Item ${index + 1} varient-product - product_price=${productPrice}, total_tax=${tax}, quantity=${quantity}, subtotal=${productPrice * quantity}, subtax=${tax * quantity}`);
      } else {
        strapi.log.warn(`calculateCartTotals: Item ${index + 1} unsupported product_type (${productType.__component}) or missing data: ${JSON.stringify(productType, null, 2)}`);
      }
    } else {
      strapi.log.warn(`calculateCartTotals: Item ${index + 1} has no valid product or varient data: ${JSON.stringify(item, null, 2)}`);
    }
  }

  strapi.log.info(`calculateCartTotals: Final totals - total_product_price=${total_product_price.toFixed(2)}, total_tax=${total_tax.toFixed(2)}`);
  return {
    total_product_price: parseFloat(total_product_price.toFixed(2)),
    total_tax: Math.round(total_tax),
  };
};

export default {
  async afterCreate(event: any) {
    try {
      strapi.log.debug('afterCreate: Starting lifecycle');
      const { result } = event;
      strapi.log.info(`afterCreate: Processing cart result: ${JSON.stringify(result, null, 2)}`);
      strapi.log.debug(`afterCreate: Full event: ${JSON.stringify(event, null, 2)}`);

      if (!result.publishedAt) {
        strapi.log.info(`afterCreate: Skipping draft entry for documentId: ${result.documentId}`);
        return;
      }

      strapi.log.debug(`afterCreate: Fetching cart with id: ${result.id}`);
      const populateQuery = ['item.product.product_type', 'item.varient', 'users_permissions_user'];
      strapi.log.debug(`afterCreate: Populate query: ${JSON.stringify(populateQuery, null, 2)}`);
      const cart: Cart = await strapi.entityService.findOne('api::cart.cart', result.id, {
        populate: populateQuery as any, // Temporary workaround for TS2322
      });

      strapi.log.debug(`afterCreate: Fetched cart: ${JSON.stringify(cart, null, 2)}`);
      if (!cart || !cart.item || !Array.isArray(cart.item)) {
        strapi.log.warn(`afterCreate: No cart or items found for documentId: ${result.documentId}`);
        return;
      }

      // Debug: Fetch product directly
      if (cart.item.some(item => item.product?.id)) {
        const productId = cart.item.find(item => item.product?.id)?.product?.id;
        strapi.log.debug(`afterCreate: Debugging product fetch for id: ${productId}`);
        const product = await strapi.entityService.findOne('api::product.product', productId, {
          populate: ['product_type'] as any,
        });
        strapi.log.debug(`afterCreate: Debug product fetch: ${JSON.stringify(product, null, 2)}`);
      }

      strapi.log.info(`afterCreate: Found ${cart.item.length} items for documentId: ${result.documentId}`);
      const { total_product_price, total_tax } = calculateCartTotals(cart.item);
      strapi.log.debug(`afterCreate: Calculated totals - total_product_price=${total_product_price}, total_tax=${total_tax}`);

      const needsUpdate =
        cart.total_product_price !== total_product_price || cart.total_tax !== total_tax;
      strapi.log.debug(`afterCreate: Needs update: ${needsUpdate} (current: total_product_price=${cart.total_product_price}, total_tax=${cart.total_tax})`);

      if (!needsUpdate) {
        strapi.log.info(`afterCreate: No update needed for documentId: ${result.documentId}, totals unchanged`);
        return;
      }

      strapi.log.debug(`afterCreate: Updating cart with id: ${result.id}`);
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

      strapi.log.debug(`afterCreate: Fetching updated cart with id: ${result.id}`);
      const updatedCart: Cart = await strapi.entityService.findOne('api::cart.cart', result.id, {
        populate: populateQuery as any,
      });
      strapi.log.info(`afterCreate: Updated cart: ${JSON.stringify(updatedCart, null, 2)}`);
    } catch (err) {
      strapi.log.error('afterCreate: Error occurred', {
        message: err.message || 'Unknown error',
        stack: err.stack,
        result: JSON.stringify(event.result, null, 2),
        event: JSON.stringify(event, null, 2),
      });
      throw err;
    }
  },

  async afterUpdate(event: any) {
    try {
      strapi.log.debug('afterUpdate: Starting lifecycle');
      const { result } = event;
      strapi.log.info(`afterUpdate: Processing cart result: ${JSON.stringify(result, null, 2)}`);
      strapi.log.debug(`afterUpdate: Full event: ${JSON.stringify(event, null, 2)}`);

      if (!result.publishedAt) {
        strapi.log.info(`afterUpdate: Skipping draft entry for documentId: ${result.documentId}`);
        return;
      }

      strapi.log.debug(`afterUpdate: Fetching cart with id: ${result.id}`);
      const populateQuery = ['item.product.product_type', 'item.varient', 'users_permissions_user'];
      strapi.log.debug(`afterUpdate: Populate query: ${JSON.stringify(populateQuery, null, 2)}`);
      const cart: Cart = await strapi.entityService.findOne('api::cart.cart', result.id, {
        populate: populateQuery as any,
      });

      strapi.log.debug(`afterUpdate: Fetched cart: ${JSON.stringify(cart, null, 2)}`);
      if (!cart || !cart.item || !Array.isArray(cart.item)) {
        strapi.log.warn(`afterUpdate: No cart or items found for documentId: ${result.documentId}`);
        return;
      }

      // Debug: Fetch product directly
      if (cart.item.some(item => item.product?.id)) {
        const productId = cart.item.find(item => item.product?.id)?.product?.id;
        strapi.log.debug(`afterUpdate: Debugging product fetch for id: ${productId}`);
        const product = await strapi.entityService.findOne('api::product.product', productId, {
          populate: ['product_type'] as any,
        });
        strapi.log.debug(`afterUpdate: Debug product fetch: ${JSON.stringify(product, null, 2)}`);
      }

      strapi.log.info(`afterUpdate: Found ${cart.item.length} items for documentId: ${result.documentId}`);
      const { total_product_price, total_tax } = calculateCartTotals(cart.item);
      strapi.log.debug(`afterUpdate: Calculated totals - total_product_price=${total_product_price}, total_tax=${total_tax}`);

      const needsUpdate =
        cart.total_product_price !== total_product_price || cart.total_tax !== total_tax;
      strapi.log.debug(`afterUpdate: Needs update: ${needsUpdate} (current: total_product_price=${cart.total_product_price}, total_tax=${cart.total_tax})`);

      if (!needsUpdate) {
        strapi.log.info(`afterUpdate: No update needed for documentId: ${result.documentId}, totals unchanged`);
        return;
      }

      strapi.log.debug(`afterUpdate: Updating cart with id: ${result.id}`);
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

      strapi.log.debug(`afterUpdate: Fetching updated cart with id: ${result.id}`);
      const updatedCart: Cart = await strapi.entityService.findOne('api::cart.cart', result.id, {
        populate: populateQuery as any,
      });
      strapi.log.info(`afterUpdate: Updated cart: ${JSON.stringify(updatedCart, null, 2)}`);
    } catch (err) {
      strapi.log.error('afterUpdate: Error occurred', {
        message: err.message || 'Unknown error',
        stack: err.stack,
        result: JSON.stringify(event.result, null, 2),
        event: JSON.stringify(event, null, 2),
      });
      throw err;
    }
  },
};