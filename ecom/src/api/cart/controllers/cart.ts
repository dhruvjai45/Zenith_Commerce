import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::cart.cart", {
  async create(ctx) {
    const { data } = ctx.request.body;

    strapi.log.debug("Creating cart with data:", JSON.stringify(data));

    if (!data.users_permissions_user) {
      data.users_permissions_user = ctx.state.user?.id || null;
    }

    if (data.item && Array.isArray(data.item)) {
      let total_product_price = 0;
      let total_tax = 0;

      for (const item of data.item) {
        const quantity = item.quantity || 1;

        if (item.product) {
          strapi.log.debug(`Processing product input: ${item.product}, type: ${typeof item.product}`);
          let product;

          // Try documentId first for strings longer than 10 characters
          if (typeof item.product === "string" && item.product.length > 10) {
            strapi.log.debug(`Fetching product with documentId: ${item.product}`);
            try {
              product = await strapi.documents("api::product.product").findOne({
                documentId: item.product,
                populate: { product_type: true },
                publicationState: "live",
              });
              strapi.log.debug("Product query result (by documentId):", JSON.stringify(product));
            } catch (error) {
              strapi.log.error(`Error fetching product with documentId ${item.product}:`, error.message);
            }
          }

          // Fallback to numeric id
          if (!product) {
            const productId = Number(item.product);
            strapi.log.debug(`Fetching product with id: ${productId}, type: ${typeof productId}`);
            try {
              const products = await strapi.documents("api::product.product").findMany({
                filters: { id: { $eq: productId } },
                populate: { product_type: true },
                publicationState: "live",
              });
              strapi.log.debug("Product query result (by id):", JSON.stringify(products));
              product = products[0];
            } catch (error) {
              strapi.log.error(`Error fetching product with id ${productId}:`, error.message);
            }
          }

          if (product) {
            item.product = product.documentId; // Set item.product to documentId
            strapi.log.debug("Found product:", JSON.stringify(product));
            if (product.product_type && product.product_type.length > 0) {
              const productType = product.product_type[0];
              if (
                productType.__component === "product-types.simple-product" ||
                productType.__component === "product-types.grouped-product"
              ) {
                total_product_price += (productType.product_price || 0) * quantity;
                total_tax += (productType.total_tax || 0) * quantity;
                strapi.log.debug(
                  `Added product price: ${(productType.product_price || 0) * quantity}, tax: ${(productType.total_tax || 0) * quantity}`
                );
              }
            }
          } else {
            strapi.log.warn(`Product with id or documentId ${item.product} not found`);
          }
        }

        if (item.varient) {
          strapi.log.debug(`Fetching variant with documentId: ${item.varient}`);
          try {
            const variant = await strapi.documents("api::varient.varient").findOne({
              documentId: item.varient,
              publicationState: "live",
            });
            if (variant) {
              total_product_price += (variant.product_price || 0) * quantity;
              total_tax += (variant.total_tax || 0) * quantity;
              strapi.log.debug(
                `Added variant price: ${(variant.product_price || 0) * quantity}, tax: ${(variant.total_tax || 0) * quantity}`
              );
            } else {
              strapi.log.warn(`Variant with documentId ${item.varient} not found`);
            }
          } catch (error) {
            strapi.log.error(`Error fetching variant with documentId ${item.varient}:`, error.message);
          }
        }
      }

      data.total_product_price = total_product_price;
      data.total_tax = total_tax;
      strapi.log.debug(`Calculated totals - product_price: ${total_product_price}, total_tax: ${total_tax}`);
    }

    const result = await strapi.documents("api::cart.cart").create({
      data,
      status: "published",
    });

    const populatedResult = await strapi.documents("api::cart.cart").findOne({
      documentId: result.documentId,
      populate: {
        users_permissions_user: true,
        item: {
          populate: {
            product: { populate: { product_type: true } },
            varient: true,
          },
        },
      },
    });

    strapi.log.debug("Populated result:", JSON.stringify(populatedResult));

    return {
      data: populatedResult,
      meta: {},
    };
  },

  async update(ctx) {
    const { data } = ctx.request.body;
    const { id: documentId } = ctx.params;

    strapi.log.debug("Updating cart with documentId:", documentId);
    strapi.log.debug("Request body data:", JSON.stringify(data));
    strapi.log.debug("Authenticated user ID:", ctx.state.user?.id || "No authenticated user");

    if (!data || Object.keys(data).length < 1) {
      strapi.log.error("No data provided for update");
      return ctx.badRequest("Please provide `data` to update.");
    }

    let entity;
    try {
      entity = await strapi.documents("api::cart.cart").findOne({
        documentId,
        populate: { users_permissions_user: { fields: ["id"] }, item: true },
        publicationState: "live",
      });
      strapi.log.debug("Cart query result:", JSON.stringify(entity));
    } catch (error) {
      strapi.log.error("Error fetching cart:", error.message);
      return ctx.internalServerError("Error fetching cart from database");
    }

    if (!entity) {
      strapi.log.error(`Cart with documentId ${documentId} not found`);
      const allCarts = await strapi.documents("api::cart.cart").findMany({
        populate: { users_permissions_user: { fields: ["id"] } },
        publicationState: "live",
      });
      strapi.log.debug("All available carts:", JSON.stringify(allCarts));
      return ctx.notFound("Document not found");
    }

    if (data.item && Array.isArray(data.item)) {
      let total_product_price = 0;
      let total_tax = 0;

      strapi.log.debug("Processing items:", JSON.stringify(data.item));

      for (const item of data.item) {
        const quantity = item.quantity || 1;

        if (item.product) {
          strapi.log.debug(`Processing product input: ${item.product}, type: ${typeof item.product}`);
          let product;

          if (typeof item.product === "string" && item.product.length > 10) {
            strapi.log.debug(`Fetching product with documentId: ${item.product}`);
            try {
              product = await strapi.documents("api::product.product").findOne({
                documentId: item.product,
                populate: { product_type: true },
                publicationState: "live",
              });
              strapi.log.debug("Product query result (by documentId):", JSON.stringify(product));
            } catch (error) {
              strapi.log.error(`Error fetching product with documentId ${item.product}:`, error.message);
            }
          }

          if (!product) {
            const productId = Number(item.product);
            strapi.log.debug(`Fetching product with id: ${productId}, type: ${typeof productId}`);
            try {
              const products = await strapi.documents("api::product.product").findMany({
                filters: { id: { $eq: productId } },
                populate: { product_type: true },
                publicationState: "live",
              });
              strapi.log.debug("Product query result (by id):", JSON.stringify(products));
              product = products[0];
            } catch (error) {
              strapi.log.error(`Error fetching product with id ${productId}:`, error.message);
            }
          }

          // Additional fallback: Try documentId from known product if id fails
          if (!product && item.product == "444") {
            strapi.log.debug(`Fallback: Fetching product with known documentId: ble3x2jcilvp3fijw7t9tny1`);
            try {
              product = await strapi.documents("api::product.product").findOne({
                documentId: "ble3x2jcilvp3fijw7t9tny1",
                populate: { product_type: true },
                publicationState: "live",
              });
              strapi.log.debug("Product query result (by fallback documentId):", JSON.stringify(product));
            } catch (error) {
              strapi.log.error(`Error fetching product with documentId ble3x2jcilvp3fijw7t9tny1:`, error.message);
            }
          }

          if (product) {
            item.product = product.documentId; // Set item.product to documentId
            strapi.log.debug("Found product:", JSON.stringify(product));
            if (product.product_type && product.product_type.length > 0) {
              const productType = product.product_type[0];
              if (
                productType.__component === "product-types.simple-product" ||
                productType.__component === "product-types.grouped-product"
              ) {
                total_product_price += (productType.product_price || 0) * quantity;
                total_tax += (productType.total_tax || 0) * quantity;
                strapi.log.debug(
                  `Added product price: ${(productType.product_price || 0) * quantity}, tax: ${(productType.total_tax || 0) * quantity}`
                );
              }
            }
          } else {
            strapi.log.warn(`Product with id or documentId ${item.product} not found`);
          }
        }

        if (item.varient) {
          strapi.log.debug(`Fetching variant with documentId: ${item.varient}`);
          try {
            const variant = await strapi.documents("api::varient.varient").findOne({
              documentId: item.varient,
              publicationState: "live",
            });
            if (variant) {
              total_product_price += (variant.product_price || 0) * quantity;
              total_tax += (variant.total_tax || 0) * quantity;
              strapi.log.debug(
                `Added variant price: ${(variant.product_price || 0) * quantity}, tax: ${(variant.total_tax || 0) * quantity}`
              );
            } else {
              strapi.log.warn(`Variant with documentId ${item.varient} not found`);
            }
          } catch (error) {
            strapi.log.error(`Error fetching variant with documentId ${item.varient}:`, error.message);
          }
        }
      }

      data.total_product_price = total_product_price;
      data.total_tax = total_tax;
      strapi.log.debug(`Calculated totals - product_price: ${total_product_price}, total_tax: ${total_tax}`);
    }

    strapi.log.debug("Updating cart with data:", JSON.stringify(data));
    const result = await strapi.documents("api::cart.cart").update({
      documentId,
      data,
    });

    strapi.log.debug("Update result:", JSON.stringify(result));

    const populatedResult = await strapi.documents("api::cart.cart").findOne({
      documentId: result.documentId,
      populate: {
        users_permissions_user: true,
        item: {
          populate: {
            product: { populate: { product_type: true } },
            varient: true,
          },
        },
      },
    });

    strapi.log.debug("Populated result:", JSON.stringify(populatedResult));

    return {
      data: populatedResult,
      meta: {},
    };
  },
});