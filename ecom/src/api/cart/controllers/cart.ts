import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::cart.cart", {
  async create(ctx) {
    const { data } = ctx.request.body;

    strapi.log.debug("Creating cart with data:", JSON.stringify(data));

    // Set users_permissions_user from authenticated user if not provided
    if (!data.users_permissions_user) {
      data.users_permissions_user = ctx.state.user?.id || null;
      strapi.log.debug(`Set users_permissions_user to: ${data.users_permissions_user}`);
    }

    // Initialize totals
    let total_product_price = 0;
    let total_tax = 0;

    // Process items (details.item-list component) if provided
    if (data.item && Array.isArray(data.item) && data.item.length > 0) {
      for (const item of data.item) {
        const quantity = item.quantity || 1;
        strapi.log.debug(`Processing item product: ${item.product}, type: ${typeof item.product}`);

        // Fetch product
        let product;
        if (typeof item.product === "string" && item.product.length > 10) {
          strapi.log.debug(`Fetching product with documentId: ${item.product}`);
          try {
            product = await strapi.documents("api::product.product").findOne({
              documentId: item.product,
              populate: { product_type: true },
              status: "published",
            });
            strapi.log.debug("Product query result (by documentId):", JSON.stringify(product));
          } catch (error) {
            strapi.log.error(`Error fetching product with documentId ${item.product}:`, error.message);
          }
        } else {
          const productId = Number(item.product);
          strapi.log.debug(`Fetching product with id: ${productId}, type: ${typeof productId}`);
          try {
            const products = await strapi.documents("api::product.product").findMany({
              filters: { id: { $eq: productId } },
              populate: { product_type: true },
              status: "published",
            });
            product = products[0];
            strapi.log.debug("Product query result (by id):", JSON.stringify(product));
          } catch (error) {
            strapi.log.error(`Error fetching product with id ${productId}:`, error.message);
          }
        }

        if (product) {
          item.product = product.documentId;
          strapi.log.debug("Found product:", JSON.stringify(product));

          // Handle variant if specified
          if (item.varient) {
            strapi.log.debug(`Processing variant input: ${item.varient}, type: ${typeof item.varient}`);
            let variantDocumentId;
            let variant;

            if (typeof item.varient === "string" && item.varient.length > 10) {
              strapi.log.debug(`Fetching variant with documentId: ${item.varient}`);
              try {
                variant = await strapi.documents("api::varient.varient").findOne({
                  documentId: item.varient,
                  status: "published",
                });
                if (variant) {
                  variantDocumentId = item.varient;
                  strapi.log.debug("Variant found by documentId:", JSON.stringify(variant));
                }
              } catch (error) {
                strapi.log.error(`Error fetching variant with documentId ${item.varient}:`, error.message);
              }
            } else {
              const variantId = Number(item.varient);
              strapi.log.debug(`Fetching variant with id: ${variantId}`);
              try {
                const variants = await strapi.documents("api::varient.varient").findMany({
                  filters: { id: { $eq: variantId } },
                  status: "published",
                });
                if (variants && variants.length > 0) {
                  variant = variants[0];
                  variantDocumentId = variant.documentId;
                  strapi.log.debug("Variant found by id:", JSON.stringify(variant));
                }
              } catch (error) {
                strapi.log.error(`Error fetching variant with id ${variantId}:`, error.message);
              }
            }

            if (variant && variantDocumentId) {
              item.varient = variantDocumentId;
              let adjustedPrice = variant.product_price || 0;

              // Check for special price offers on the parent product
              strapi.log.debug(`Checking for special_price offer for variant's parent product: ${product.documentId}`);
              try {
                const offers = await strapi.documents("api::product-offer.product-offer").findMany({
                  filters: { products: { documentId: { $eq: product.documentId } } },
                  populate: { type_of_offer: true },
                  status: "published",
                });
                strapi.log.debug("Product offer query result for variant:", JSON.stringify(offers));

                const validOffer = offers.find(offer => {
                  if (offer.type_of_offer && offer.type_of_offer.length > 0) {
                    const offerDetails = offer.type_of_offer[0];
                    if (offerDetails.__component === "offers.special-price") {
                      const startDate = new Date(offerDetails.start_date);
                      const expiredDate = new Date(offerDetails.expired_date);
                      const currentDate = new Date();
                      return startDate <= currentDate && expiredDate >= currentDate;
                    }
                  }
                  return false;
                });

                if (validOffer && validOffer.type_of_offer && validOffer.type_of_offer.length > 0) {
                  strapi.log.debug(`Valid offer found: ${JSON.stringify(validOffer)}`);
                  const specialPrice = validOffer.type_of_offer[0];
                  if (specialPrice.__component === "offers.special-price") {
                    if (specialPrice.price_type === "fixed_discount" && specialPrice.amount) {
                      adjustedPrice = Math.max(0, adjustedPrice - specialPrice.amount);
                      strapi.log.debug(
                        `Applied fixed discount to variant: ${specialPrice.amount}, adjusted price: ${adjustedPrice}`
                      );
                    } else if (specialPrice.price_type === "percentage_discount" && specialPrice.amount) {
                      const discount = (adjustedPrice * specialPrice.amount) / 100;
                      adjustedPrice = Math.max(0, adjustedPrice - discount);
                      strapi.log.debug(
                        `Applied percentage discount to variant: ${specialPrice.amount}%, adjusted price: ${adjustedPrice}`
                      );
                    }
                  }
                }
              } catch (error) {
                strapi.log.error(`Error fetching product offer for product ${product.documentId}:`, error.message);
              }

              total_product_price += Math.round(adjustedPrice * quantity);
              total_tax += (variant.total_tax || 0) * quantity;
              strapi.log.debug(
                `Added variant price: ${adjustedPrice * quantity}, tax: ${(variant.total_tax || 0) * quantity}`
              );
            } else {
              strapi.log.warn(`Variant with id or documentId ${item.varient} not found`);
            }
          } else if (product.product_type && product.product_type.length > 0) {
            // Use product price/tax for non-variant items
            const productType = product.product_type[0];
            if (
              productType.__component === "product-types.simple-product" ||
              productType.__component === "product-types.grouped-product" ||
              productType.__component === "product-types.varient-product"
            ) {
              let adjustedPrice = productType.product_price || 0;

              strapi.log.debug(`Checking for special_price offer for product: ${product.documentId}`);
              try {
                const offers = await strapi.documents("api::product-offer.product-offer").findMany({
                  filters: { products: { documentId: { $eq: product.documentId } } },
                  populate: { type_of_offer: true },
                  status: "published",
                });
                strapi.log.debug("Product offer query result:", JSON.stringify(offers));

                const validOffer = offers.find(offer => {
                  if (offer.type_of_offer && offer.type_of_offer.length > 0) {
                    const offerDetails = offer.type_of_offer[0];
                    if (offerDetails.__component === "offers.special-price") {
                      const startDate = new Date(offerDetails.start_date);
                      const expiredDate = new Date(offerDetails.expired_date);
                      const currentDate = new Date();
                      return startDate <= currentDate && expiredDate >= currentDate;
                    }
                  }
                  return false;
                });

                if (validOffer && validOffer.type_of_offer && validOffer.type_of_offer.length > 0) {
                  strapi.log.debug(`Valid offer found: ${JSON.stringify(validOffer)}`);
                  const specialPrice = validOffer.type_of_offer[0];
                  if (specialPrice.__component === "offers.special-price") {
                    if (specialPrice.price_type === "fixed_discount" && specialPrice.amount) {
                      adjustedPrice = Math.max(0, adjustedPrice - specialPrice.amount);
                      strapi.log.debug(
                        `Applied fixed discount: ${specialPrice.amount}, adjusted price: ${adjustedPrice}`
                      );
                    } else if (specialPrice.price_type === "percentage_discount" && specialPrice.amount) {
                      const discount = (adjustedPrice * specialPrice.amount) / 100;
                      adjustedPrice = Math.max(0, adjustedPrice - discount);
                      strapi.log.debug(
                        `Applied percentage discount: ${specialPrice.amount}%, adjusted price: ${adjustedPrice}`
                      );
                    }
                  }
                }
              } catch (error) {
                strapi.log.error(`Error fetching product offer for product ${product.documentId}:`, error.message);
              }

              total_product_price += Math.round(adjustedPrice * quantity);
              total_tax += (productType.total_tax || 0) * quantity;
              strapi.log.debug(
                `Added product price: ${adjustedPrice * quantity}, tax: ${(productType.total_tax || 0) * quantity}`
              );
            } else {
              strapi.log.warn(`Invalid product type component: ${productType.__component}`);
            }
          } else {
            strapi.log.warn(`No product type found for product ${product.documentId}`);
          }
        } else {
          strapi.log.warn(`Product with id or documentId ${item.product} not found`);
        }
      }
    }

    // Set totals (null if no items)
    data.total_product_price = data.item && data.item.length > 0 ? Math.round(total_product_price) : null;
    data.total_tax = data.item && data.item.length > 0 ? total_tax : null;
    strapi.log.debug(`Final totals - product_price: ${data.total_product_price}, tax: ${data.total_tax}`);

    // Create cart
    strapi.log.debug("Creating cart with final data:", JSON.stringify(data));
    const result = await strapi.documents("api::cart.cart").create({
      data,
      status: "published",
    });

    // Fetch populated result
    const populatedResult = await strapi.documents("api::cart.cart").findOne({
      documentId: result.documentId,
      populate: {
        users_permissions_user: true,
        item: { populate: { product: true, varient: true } },
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

    // Fetch existing cart
    let entity;
    try {
      entity = await strapi.documents("api::cart.cart").findOne({
        documentId,
        populate: {
          users_permissions_user: { fields: ["id"] },
          item: { populate: { product: true, varient: true } },
        },
      });
      strapi.log.debug("Cart query result:", JSON.stringify(entity));
    } catch (error) {
      strapi.log.error("Error fetching cart:", error.message);
      return ctx.internalServerError("Error fetching cart from database");
    }

    if (!entity) {
      strapi.log.error(`Cart with documentId ${documentId} not found`);
      return ctx.notFound("Document not found");
    }

    // Set users_permissions_user from authenticated user if not provided
    if (!data.users_permissions_user) {
      data.users_permissions_user = ctx.state.user?.id || null;
      strapi.log.debug(`Set users_permissions_user to: ${data.users_permissions_user}`);
    }

    // Initialize totals
    let total_product_price = 0;
    let total_tax = 0;

    // Process items (details.item-list component) if provided
    if (data.item && Array.isArray(data.item) && data.item.length > 0) {
      for (const item of data.item) {
        const quantity = item.quantity || 1;
        strapi.log.debug(`Processing item product: ${item.product}, type: ${typeof item.product}`);

        // Fetch product
        let product;
        if (typeof item.product === "string" && item.product.length > 10) {
          strapi.log.debug(`Fetching product with documentId: ${item.product}`);
          try {
            product = await strapi.documents("api::product.product").findOne({
              documentId: item.product,
              populate: { product_type: true },
              status: "published",
            });
            strapi.log.debug("Product query result (by documentId):", JSON.stringify(product));
          } catch (error) {
            strapi.log.error(`Error fetching product with documentId ${item.product}:`, error.message);
          }
        } else {
          const productId = Number(item.product);
          strapi.log.debug(`Fetching product with id: ${productId}, type: ${typeof productId}`);
          try {
            const products = await strapi.documents("api::product.product").findMany({
              filters: { id: { $eq: productId } },
              populate: { product_type: true },
              status: "published",
            });
            product = products[0];
            strapi.log.debug("Product query result (by id):", JSON.stringify(product));
          } catch (error) {
            strapi.log.error(`Error fetching product with id ${productId}:`, error.message);
          }
        }

        if (product) {
          item.product = product.documentId;
          strapi.log.debug("Found product:", JSON.stringify(product));

          // Handle variant if specified
          if (item.varient) {
            strapi.log.debug(`Processing variant input: ${item.varient}, type: ${typeof item.varient}`);
            let variantDocumentId;
            let variant;

            if (typeof item.varient === "string" && item.varient.length > 10) {
              strapi.log.debug(`Fetching variant with documentId: ${item.varient}`);
              try {
                variant = await strapi.documents("api::varient.varient").findOne({
                  documentId: item.varient,
                  status: "published",
                });
                if (variant) {
                  variantDocumentId = item.varient;
                  strapi.log.debug("Variant found by documentId:", JSON.stringify(variant));
                }
              } catch (error) {
                strapi.log.error(`Error fetching variant with documentId ${item.varient}:`, error.message);
              }
            } else {
              const variantId = Number(item.varient);
              strapi.log.debug(`Fetching variant with id: ${variantId}`);
              try {
                const variants = await strapi.documents("api::varient.varient").findMany({
                  filters: { id: { $eq: variantId } },
                  status: "published",
                });
                if (variants && variants.length > 0) {
                  variant = variants[0];
                  variantDocumentId = variant.documentId;
                  strapi.log.debug("Variant found by id:", JSON.stringify(variant));
                }
              } catch (error) {
                strapi.log.error(`Error fetching variant with id ${variantId}:`, error.message);
              }
            }

            if (variant && variantDocumentId) {
              item.varient = variantDocumentId;
              let adjustedPrice = variant.product_price || 0;

              // Check for special price offers on the parent product
              strapi.log.debug(`Checking for special_price offer for variant's parent product: ${product.documentId}`);
              try {
                const offers = await strapi.documents("api::product-offer.product-offer").findMany({
                  filters: { products: { documentId: { $eq: product.documentId } } },
                  populate: { type_of_offer: true },
                  status: "published",
                });
                strapi.log.debug("Product offer query result for variant:", JSON.stringify(offers));

                const validOffer = offers.find(offer => {
                  if (offer.type_of_offer && offer.type_of_offer.length > 0) {
                    const offerDetails = offer.type_of_offer[0];
                    if (offerDetails.__component === "offers.special-price") {
                      const startDate = new Date(offerDetails.start_date);
                      const expiredDate = new Date(offerDetails.expired_date);
                      const currentDate = new Date();
                      return startDate <= currentDate && expiredDate >= currentDate;
                    }
                  }
                  return false;
                });

                if (validOffer && validOffer.type_of_offer && validOffer.type_of_offer.length > 0) {
                  strapi.log.debug(`Valid offer found: ${JSON.stringify(validOffer)}`);
                  const specialPrice = validOffer.type_of_offer[0];
                  if (specialPrice.__component === "offers.special-price") {
                    if (specialPrice.price_type === "fixed_discount" && specialPrice.amount) {
                      adjustedPrice = Math.max(0, adjustedPrice - specialPrice.amount);
                      strapi.log.debug(
                        `Applied fixed discount to variant: ${specialPrice.amount}, adjusted price: ${adjustedPrice}`
                      );
                    } else if (specialPrice.price_type === "percentage_discount" && specialPrice.amount) {
                      const discount = (adjustedPrice * specialPrice.amount) / 100;
                      adjustedPrice = Math.max(0, adjustedPrice - discount);
                      strapi.log.debug(
                        `Applied percentage discount to variant: ${specialPrice.amount}%, adjusted price: ${adjustedPrice}`
                      );
                    }
                  }
                }
              } catch (error) {
                strapi.log.error(`Error fetching product offer for product ${product.documentId}:`, error.message);
              }

              total_product_price += Math.round(adjustedPrice * quantity);
              total_tax += (variant.total_tax || 0) * quantity;
              strapi.log.debug(
                `Added variant price: ${adjustedPrice * quantity}, tax: ${(variant.total_tax || 0) * quantity}`
              );
            } else {
              strapi.log.warn(`Variant with id or documentId ${item.varient} not found`);
            }
          } else if (product.product_type && product.product_type.length > 0) {
            // Use product price/tax for non-variant items
            const productType = product.product_type[0];
            if (
              productType.__component === "product-types.simple-product" ||
              productType.__component === "product-types.grouped-product" ||
              productType.__component === "product-types.varient-product"
            ) {
              let adjustedPrice = productType.product_price || 0;

              strapi.log.debug(`Checking for special_price offer for product: ${product.documentId}`);
              try {
                const offers = await strapi.documents("api::product-offer.product-offer").findMany({
                  filters: { products: { documentId: { $eq: product.documentId } } },
                  populate: { type_of_offer: true },
                  status: "published",
                });
                strapi.log.debug("Product offer query result:", JSON.stringify(offers));

                const validOffer = offers.find(offer => {
                  if (offer.type_of_offer && offer.type_of_offer.length > 0) {
                    const offerDetails = offer.type_of_offer[0];
                    if (offerDetails.__component === "offers.special-price") {
                      const startDate = new Date(offerDetails.start_date);
                      const expiredDate = new Date(offerDetails.expired_date);
                      const currentDate = new Date();
                      return startDate <= currentDate && expiredDate >= currentDate;
                    }
                  }
                  return false;
                });

                if (validOffer && validOffer.type_of_offer && validOffer.type_of_offer.length > 0) {
                  strapi.log.debug(`Valid offer found: ${JSON.stringify(validOffer)}`);
                  const specialPrice = validOffer.type_of_offer[0];
                  if (specialPrice.__component === "offers.special-price") {
                    if (specialPrice.price_type === "fixed_discount" && specialPrice.amount) {
                      adjustedPrice = Math.max(0, adjustedPrice - specialPrice.amount);
                      strapi.log.debug(
                        `Applied fixed discount: ${specialPrice.amount}, adjusted price: ${adjustedPrice}`
                      );
                    } else if (specialPrice.price_type === "percentage_discount" && specialPrice.amount) {
                      const discount = (adjustedPrice * specialPrice.amount) / 100;
                      adjustedPrice = Math.max(0, adjustedPrice - discount);
                      strapi.log.debug(
                        `Applied percentage discount: ${specialPrice.amount}%, adjusted price: ${adjustedPrice}`
                      );
                    }
                  }
                }
              } catch (error) {
                strapi.log.error(`Error fetching product offer for product ${product.documentId}:`, error.message);
              }

              total_product_price += Math.round(adjustedPrice * quantity);
              total_tax += (productType.total_tax || 0) * quantity;
              strapi.log.debug(
                `Added product price: ${adjustedPrice * quantity}, tax: ${(productType.total_tax || 0) * quantity}`
              );
            } else {
              strapi.log.warn(`Invalid product type component: ${productType.__component}`);
            }
          } else {
            strapi.log.warn(`No product type found for product ${product.documentId}`);
          }
        } else {
          strapi.log.warn(`Product with id or documentId ${item.product} not found`);
        }
      }
    }

    // Set totals (null if no items)
    data.total_product_price = data.item && data.item.length > 0 ? Math.round(total_product_price) : null;
    data.total_tax = data.item && data.item.length > 0 ? total_tax : null;
    strapi.log.debug(`Final totals - product_price: ${data.total_product_price}, tax: ${data.total_tax}`);

    // Update cart
    strapi.log.debug("Updating cart with final data:", JSON.stringify(data));
    const result = await strapi.documents("api::cart.cart").update({
      documentId,
      data,
      status: "published",
    });

    // Fetch populated result
    const populatedResult = await strapi.documents("api::cart.cart").findOne({
      documentId: result.documentId,
      populate: {
        users_permissions_user: true,
        item: { populate: { product: true, varient: true } },
      },
    });

    strapi.log.debug("Populated result:", JSON.stringify(populatedResult));

    return {
      data: populatedResult,
      meta: {},
    };
  },
});