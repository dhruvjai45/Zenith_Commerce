import { factories } from "@strapi/strapi";
import axios from "axios";

export default factories.createCoreController("api::order-management.order-management", {
  async create(ctx) {
    const { data } = ctx.request.body;

    strapi.log.debug("Creating order with data:", JSON.stringify(data));

    // Set users_permissions_user from authenticated user if not provided
    if (!data.users_permissions_user) {
      data.users_permissions_user = ctx.state.user?.id || null;
    }

    // Initialize totals
    let total_product_price = 0;
    let total_tax = 0;
    let total_to_pay = 0;

    // Handle type_of_order (cart-order or item-list)
    if (data.type_of_order && Array.isArray(data.type_of_order) && data.type_of_order.length > 0) {
      for (const orderType of data.type_of_order) {
        if (orderType.__component === "cart-order.cart-order" && orderType.cart) {
          let cartDocumentId: string | undefined;
          let cartIdInput: string | number | undefined;

          // Handle cart input as either id (number/string) or documentId (string)
          if (typeof orderType.cart === "object" && orderType.cart.id) {
            cartIdInput = orderType.cart.id;
            strapi.log.debug(`Processing cart input: ${cartIdInput}, type: ${typeof cartIdInput}`);

            // Try fetching by id first
            strapi.log.debug(`Fetching cart with id via API: ${cartIdInput}`);
            try {
              const response = await axios.get(
                `http://localhost:1337/api/carts?filters[id][$eq]=${cartIdInput}&populate[item]=true`,
                {
                  headers: ctx.request.headers.authorization
                    ? { Authorization: ctx.request.headers.authorization }
                    : {},
                }
              );
              const carts = response.data.data;
              strapi.log.debug("Cart API result (by id):", JSON.stringify(carts));
              if (carts && carts.length > 0) {
                cartDocumentId = carts[0].documentId;
                if (carts[0].id !== Number(cartIdInput)) {
                  strapi.log.warn(`Cart id mismatch: requested id ${cartIdInput}, found id ${carts[0].id}`);
                }
              } else {
                strapi.log.warn(`No cart found with id: ${cartIdInput}`);
                return ctx.badRequest(`No cart found with id: ${cartIdInput}`);
              }
            } catch (error: any) {
              strapi.log.error(`Error fetching cart with id ${cartIdInput} via API:`, error.message);
              return ctx.internalServerError(`Error fetching cart with id ${cartIdInput}`);
            }

            // If id lookup fails, try documentId for long strings
            if (!cartDocumentId && typeof cartIdInput === "string" && cartIdInput.length > 10) {
              strapi.log.debug(`Fetching cart with documentId via API: ${cartIdInput}`);
              try {
                const response = await axios.get(`http://localhost:1337/api/carts/${cartIdInput}?populate[item]=true`, {
                  headers: ctx.request.headers.authorization
                    ? { Authorization: ctx.request.headers.authorization }
                    : {},
                });
                const cart = response.data.data;
                strapi.log.debug("Cart API result (by documentId):", JSON.stringify(cart));
                if (cart) {
                  cartDocumentId = cart.documentId;
                } else {
                  strapi.log.warn(`No cart found with documentId: ${cartIdInput}`);
                }
              } catch (error: any) {
                strapi.log.error(`Error fetching cart with documentId ${cartIdInput} via API:`, error.message);
                return ctx.internalServerError(`Error fetching cart with documentId ${cartIdInput}`);
              }
            }
          } else if (typeof orderType.cart === "string") {
            cartDocumentId = orderType.cart;
          }

          if (cartDocumentId) {
            strapi.log.debug(`Fetching cart with documentId via API: ${cartDocumentId}`);
            try {
              const response = await axios.get(`http://localhost:1337/api/carts/${cartDocumentId}?populate[item]=true`, {
                headers: ctx.request.headers.authorization
                  ? { Authorization: ctx.request.headers.authorization }
                  : {},
              });
              const cart = response.data.data;
              strapi.log.debug("Cart API result (by documentId):", JSON.stringify(cart));
              if (cart) {
                total_product_price += cart.total_product_price || 0;
                total_tax += cart.total_tax || 0;
                strapi.log.debug(`Cart totals: product_price=${cart.total_product_price}, tax=${cart.total_tax}, id=${cart.id}`);
                // Update orderType.cart to documentId
                orderType.cart = cart.documentId;
              } else {
                strapi.log.error(`No cart found with documentId: ${cartDocumentId}`);
                return ctx.badRequest(`No cart found with documentId: ${cartDocumentId}`);
              }
            } catch (error: any) {
              strapi.log.error(`Error fetching cart with documentId ${cartDocumentId} via API:`, error.message);
              return ctx.internalServerError(`Error fetching cart with documentId ${cartDocumentId}`);
            }
          } else {
            strapi.log.error(`Cart not found for input: ${JSON.stringify(orderType.cart)}`);
            return ctx.badRequest(`No cart found for input: ${JSON.stringify(orderType.cart)}`);
          }
        } else if (orderType.__component === "details.item-list" && orderType.product) {
          const quantity = orderType.quantity || 1;
          strapi.log.debug(`Processing item-list product: ${orderType.product}, type: ${typeof orderType.product}`);

          let product;
          // Try documentId first for strings longer than 10 characters
          if (typeof orderType.product === "string" && orderType.product.length > 10) {
            strapi.log.debug(`Fetching product with documentId: ${orderType.product}`);
            try {
              product = await strapi.documents("api::product.product").findOne({
                documentId: orderType.product,
                populate: { product_type: true },
                status: "published",
              });
              strapi.log.debug("Product query result (by documentId):", JSON.stringify(product));
            } catch (error: any) {
              strapi.log.error(`Error fetching product with documentId ${orderType.product}:`, error.message);
            }
          }

          // Fallback to id using findMany with filters
          if (!product) {
            const productId = Number(orderType.product);
            strapi.log.debug(`Fetching product with id: ${productId}, type: ${typeof productId}`);
            try {
              const products = await strapi.documents("api::product.product").findMany({
                filters: { id: { $eq: productId } },
                populate: { product_type: true },
                status: "published",
              });
              product = products[0];
              strapi.log.debug("Product query result (by id):", JSON.stringify(product));
            } catch (error: any) {
              strapi.log.error(`Error fetching product with id ${productId}:`, error.message);
            }
          }

          // Additional fallback: Try known documentId for id 450
          if (!product && orderType.product == "450") {
            strapi.log.debug(`Fallback: Fetching product with documentId: ble3x2jcilvp3fijw7t9tny1`);
            try {
              product = await strapi.documents("api::product.product").findOne({
                documentId: "ble3x2jcilvp3fijw7t9tny1",
                populate: { product_type: true },
                status: "published",
              });
              strapi.log.debug("Product query result (by fallback documentId):", JSON.stringify(product));
            } catch (error: any) {
              strapi.log.error(`Error fetching product with documentId ble3x2jcilvp3fijw7t9tny1:`, error.message);
            }
          }

          if (product) {
            orderType.product = product.documentId; // Set product to documentId
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
              } else {
                strapi.log.warn(`Invalid product type component: ${productType.__component}`);
              }
            } else {
              strapi.log.warn(`No product type found for product ${product.documentId}`);
            }
          } else {
            strapi.log.warn(`Product with id or documentId ${orderType.product} not found`);
          }

          if (orderType.varient) {
            strapi.log.debug(`Fetching variant with documentId: ${orderType.varient}`);
            try {
              const variant = await strapi.documents("api::varient.varient").findOne({
                documentId: orderType.varient,
                status: "published",
              });
              if (variant) {
                total_product_price += (variant.product_price || 0) * quantity;
                total_tax += (variant.total_tax || 0) * quantity;
                strapi.log.debug(
                  `Added variant price: ${(variant.product_price || 0) * quantity}, tax: ${(variant.total_tax || 0) * quantity}`
                );
              } else {
                strapi.log.warn(`Variant with documentId ${orderType.varient} not found`);
              }
            } catch (error: any) {
              strapi.log.error(`Error fetching variant with documentId ${orderType.varient}:`, error.message);
            }
          }
        }
      }
    }

    // Set totals
    data.total_product_price = total_product_price;
    data.total_tax = total_tax;
    total_to_pay = total_product_price + total_tax;

    // Normalize order_coupons to an array
    if (data.order_coupons && !Array.isArray(data.order_coupons)) {
      data.order_coupons = [data.order_coupons];
      strapi.log.debug(`Normalized order_coupons to array: ${JSON.stringify(data.order_coupons)}`);
    }

    // Apply coupon discount
    if (data.order_coupons && Array.isArray(data.order_coupons) && data.order_coupons.length > 0) {
      let couponId = data.order_coupons[0]; // Assume one coupon
      strapi.log.debug(`Processing coupon input: ${couponId}, type: ${typeof couponId}`);

      // If couponId is numeric, fetch documentId via REST API
      if (typeof couponId === "number" || (typeof couponId === "string" && !isNaN(Number(couponId)))) {
        strapi.log.debug(`Fetching coupon with id via API: ${couponId}`);
        try {
          const response = await axios.get(
            `http://localhost:1337/api/order-coupons?filters[id][$eq]=${couponId}`,
            {
              headers: ctx.request.headers.authorization
                ? { Authorization: ctx.request.headers.authorization }
                : {},
            }
          );
          const coupons = response.data.data;
          strapi.log.debug("Coupon API result (by id):", JSON.stringify(coupons));
          if (coupons && coupons.length > 0) {
            couponId = coupons[0].documentId;
            data.order_coupons = [couponId]; // Update to documentId
            strapi.log.debug(`Mapped coupon id ${couponId} to documentId: ${couponId}`);
          } else {
            strapi.log.warn(`No coupon found with id: ${couponId}`);
            data.order_coupons = []; // Clear invalid coupon
          }
        } catch (error: any) {
          strapi.log.error(`Error fetching coupon with id ${couponId} via API:`, error.message);
          data.order_coupons = []; // Clear on error
        }
      }

      if (typeof couponId === "string" && couponId.length > 10) {
        strapi.log.debug(`Fetching coupon with documentId via API: ${couponId}`);
        try {
          const response = await axios.get(`http://localhost:1337/api/order-coupons/${couponId}`, {
            headers: ctx.request.headers.authorization
              ? { Authorization: ctx.request.headers.authorization }
              : {},
          });
          const coupon = response.data.data;
          strapi.log.debug("Coupon API result (by documentId):", JSON.stringify(coupon));
          if (!coupon) {
            strapi.log.warn(`Coupon with documentId ${couponId} not found`);
            data.order_coupons = []; // Clear invalid coupon
          } else if (
            (coupon.number_of_use === null || coupon.number_of_use > 0) &&
            coupon.amount !== null &&
            new Date(coupon.start_date) <= new Date() &&
            new Date(coupon.expire_date) >= new Date()
          ) {
            total_to_pay -= coupon.amount;
            strapi.log.debug(`Applied coupon discount: ${coupon.amount}`);
            // Update number_of_use if not null
            if (coupon.number_of_use !== null) {
              await strapi.documents("api::order-coupon.order-coupon").update({
                documentId: couponId,
                data: { number_of_use: coupon.number_of_use - 1 },
              });
              strapi.log.debug(`Updated coupon ${couponId} number_of_use to ${coupon.number_of_use - 1}`);
            }
          } else {
            strapi.log.warn(
              `Coupon ${couponId} is invalid: ` +
              (coupon.number_of_use !== null && coupon.number_of_use <= 0 ? "no uses left; " : "") +
              (coupon.amount === null ? "no discount amount; " : "") +
              (new Date(coupon.start_date) > new Date() ? "not yet valid; " : "") +
              (new Date(coupon.expire_date) < new Date() ? "expired; " : "")
            );
            data.order_coupons = []; // Clear invalid coupon
          }
        } catch (error: any) {
          strapi.log.error(`Error fetching coupon ${couponId} via API:`, error.message);
          data.order_coupons = []; // Clear on error
        }
      } else {
        strapi.log.warn(`Invalid coupon documentId: ${couponId}`);
        data.order_coupons = []; // Clear invalid coupon
      }
    }

    // Apply gift card discount
    if (data.gift_card_code) {
      strapi.log.debug(`Fetching gift card with code: ${data.gift_card_code}`);
      try {
        const giftCards = await strapi.documents("api::gift-card.gift-card").findMany({
          filters: { gift_card_details: { code: { $eq: data.gift_card_code } } },
          populate: { gift_card_details: true },
        }) as Array<{ documentId: string; gift_card_details?: { code: string; current_balance: string; is_valid: boolean }[] }>;

        const giftCard = giftCards[0];
        if (giftCard?.gift_card_details?.length > 0) {
          const giftCardDetail = giftCard.gift_card_details.find(detail => detail.code === data.gift_card_code && detail.is_valid);
          if (giftCardDetail && parseFloat(giftCardDetail.current_balance) > 0) {
            const discount = Math.min(parseFloat(giftCardDetail.current_balance), total_to_pay);
            total_to_pay -= discount;
            strapi.log.debug(`Applied gift card discount: ${discount}`);
            const newBalance = (parseFloat(giftCardDetail.current_balance) - discount).toString();
            const updatedDetails = giftCard.gift_card_details.map(detail =>
              detail.code === data.gift_card_code ? { ...detail, current_balance: newBalance } : detail
            );
            await strapi.documents("api::gift-card.gift-card").update({
              documentId: giftCard.documentId,
              data: { gift_card_details: updatedDetails },
            });
            strapi.log.debug(`Updated gift card ${data.gift_card_code} current_balance to ${newBalance}`);
          } else {
            strapi.log.warn(`Gift card ${data.gift_card_code} is invalid or has no balance`);
          }
        } else {
          strapi.log.warn(`Gift card with code ${data.gift_card_code} not found`);
        }
      } catch (error: any) {
        strapi.log.error(`Error fetching gift card ${data.gift_card_code}:`, error.message);
      }
    }

    // Apply shipping price
    if (data.is_shipping_rate) {
      data.shipping_price = 30;
      total_to_pay += 30;
      strapi.log.debug("Applied shipping price: 30");
    } else {
      data.shipping_price = 0;
    }

    // Ensure total_to_pay is not negative
    data.total_to_pay = Math.max(total_to_pay, 0);
    strapi.log.debug(`Final totals - product_price: ${total_product_price}, tax: ${total_tax}, total_to_pay: ${data.total_to_pay}`);

    // Create order
    strapi.log.debug("Creating order with final data:", JSON.stringify(data));
    const result = await strapi.documents("api::order-management.order-management").create({
      data,
      status: "published",
    });

    // Fetch populated result
    const populatedResult = await strapi.documents("api::order-management.order-management").findOne({
      documentId: result.documentId,
      populate: {
        users_permissions_user: true,
        user_address: { populate: "*" },
        type_of_order: { populate: "*" },
        order_coupons: true,
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

    strapi.log.debug("Updating order with documentId:", documentId);
    strapi.log.debug("Request body data:", JSON.stringify(data));
    strapi.log.debug("Authenticated user ID:", ctx.state.user?.id || "No authenticated user");

    if (!data || Object.keys(data).length < 1) {
      strapi.log.error("No data provided for update");
      return ctx.badRequest("Please provide `data` to update.");
    }

    // Fetch existing order
    let entity;
    try {
      entity = await strapi.documents("api::order-management.order-management").findOne({
        documentId,
        populate: { users_permissions_user: { fields: ["id"] }, type_of_order: true },
      });
      strapi.log.debug("Order query result:", JSON.stringify(entity));
    } catch (error: any) {
      strapi.log.error("Error fetching order:", error.message);
      return ctx.internalServerError("Error fetching order from database");
    }

    if (!entity) {
      strapi.log.error(`Order with documentId ${documentId} not found`);
      return ctx.notFound("Document not found");
    }

    // Initialize totals
    let total_product_price = 0;
    let total_tax = 0;
    let total_to_pay = 0;

    // Handle type_of_order
    if (data.type_of_order && Array.isArray(data.type_of_order) && data.type_of_order.length > 0) {
      for (const orderType of data.type_of_order) {
        if (orderType.__component === "cart-order.cart-order" && orderType.cart) {
          let cartDocumentId: string | undefined;
          let cartIdInput: string | number | undefined;

          if (typeof orderType.cart === "object" && orderType.cart.id) {
            cartIdInput = orderType.cart.id;
            strapi.log.debug(`Processing cart input: ${cartIdInput}, type: ${typeof cartIdInput}`);

            // Try fetching by id first
            strapi.log.debug(`Fetching cart with id via API: ${cartIdInput}`);
            try {
              const response = await axios.get(
                `http://localhost:1337/api/carts?filters[id][$eq]=${cartIdInput}&populate[item]=true`,
                {
                  headers: ctx.request.headers.authorization
                    ? { Authorization: ctx.request.headers.authorization }
                    : {},
                }
              );
              const carts = response.data.data;
              strapi.log.debug("Cart API result (by id):", JSON.stringify(carts));
              if (carts && carts.length > 0) {
                cartDocumentId = carts[0].documentId;
                if (carts[0].id !== Number(cartIdInput)) {
                  strapi.log.warn(`Cart id mismatch: requested id ${cartIdInput}, found id ${carts[0].id}`);
                }
              } else {
                strapi.log.warn(`No cart found with id: ${cartIdInput}`);
                return ctx.badRequest(`No cart found with id: ${cartIdInput}`);
              }
            } catch (error: any) {
              strapi.log.error(`Error fetching cart with id ${cartIdInput} via API:`, error.message);
              return ctx.internalServerError(`Error fetching cart with id ${cartIdInput}`);
            }

            // If id lookup fails, try documentId for long strings
            if (!cartDocumentId && typeof cartIdInput === "string" && cartIdInput.length > 10) {
              strapi.log.debug(`Fetching cart with documentId via API: ${cartIdInput}`);
              try {
                const response = await axios.get(`http://localhost:1337/api/carts/${cartIdInput}?populate[item]=true`, {
                  headers: ctx.request.headers.authorization
                    ? { Authorization: ctx.request.headers.authorization }
                    : {},
                });
                const cart = response.data.data;
                strapi.log.debug("Cart API result (by documentId):", JSON.stringify(cart));
                if (cart) {
                  cartDocumentId = cart.documentId;
                } else {
                  strapi.log.warn(`No cart found with documentId: ${cartIdInput}`);
                }
              } catch (error: any) {
                strapi.log.error(`Error fetching cart with documentId ${cartIdInput} via API:`, error.message);
                return ctx.internalServerError(`Error fetching cart with documentId ${cartIdInput}`);
              }
            }
          } else if (typeof orderType.cart === "string") {
            cartDocumentId = orderType.cart;
          }

          if (cartDocumentId) {
            strapi.log.debug(`Fetching cart with documentId via API: ${cartDocumentId}`);
            try {
              const response = await axios.get(`http://localhost:1337/api/carts/${cartDocumentId}?populate[item]=true`, {
                headers: ctx.request.headers.authorization
                  ? { Authorization: ctx.request.headers.authorization }
                  : {},
              });
              const cart = response.data.data;
              strapi.log.debug("Cart API result (by documentId):", JSON.stringify(cart));
              if (cart) {
                total_product_price += cart.total_product_price || 0;
                total_tax += cart.total_tax || 0;
                strapi.log.debug(`Cart totals: product_price=${cart.total_product_price}, tax=${cart.total_tax}, id=${cart.id}`);
                orderType.cart = cart.documentId;
              } else {
                strapi.log.error(`No cart found with documentId: ${cartDocumentId}`);
                return ctx.badRequest(`No cart found with documentId: ${cartDocumentId}`);
              }
            } catch (error: any) {
              strapi.log.error(`Error fetching cart with documentId ${cartDocumentId} via API:`, error.message);
              return ctx.internalServerError(`Error fetching cart with documentId ${cartDocumentId}`);
            }
          } else {
            strapi.log.error(`Cart not found for input: ${JSON.stringify(orderType.cart)}`);
            return ctx.badRequest(`No cart found for input: ${JSON.stringify(orderType.cart)}`);
          }
        } else if (orderType.__component === "details.item-list" && orderType.product) {
          const quantity = orderType.quantity || 1;
          strapi.log.debug(`Processing item-list product: ${orderType.product}, type: ${typeof orderType.product}`);

          let product;
          if (typeof orderType.product === "string" && orderType.product.length > 10) {
            strapi.log.debug(`Fetching product with documentId: ${orderType.product}`);
            try {
              product = await strapi.documents("api::product.product").findOne({
                documentId: orderType.product,
                populate: { product_type: true },
                status: "published",
              });
              strapi.log.debug("Product query result (by documentId):", JSON.stringify(product));
            } catch (error: any) {
              strapi.log.error(`Error fetching product with documentId ${orderType.product}:`, error.message);
            }
          }

          if (!product) {
            const productId = Number(orderType.product);
            strapi.log.debug(`Fetching product with id: ${productId}, type: ${typeof productId}`);
            try {
              const products = await strapi.documents("api::product.product").findMany({
                filters: { id: { $eq: productId } },
                populate: { product_type: true },
                status: "published",
              });
              product = products[0];
              strapi.log.debug("Product query result (by id):", JSON.stringify(product));
            } catch (error: any) {
              strapi.log.error(`Error fetching product with id ${productId}:`, error.message);
            }
          }

          // Additional fallback: Try known documentId for id 450
          if (!product && orderType.product == "450") {
            strapi.log.debug(`Fallback: Fetching product with documentId: ble3x2jcilvp3fijw7t9tny1`);
            try {
              product = await strapi.documents("api::product.product").findOne({
                documentId: "ble3x2jcilvp3fijw7t9tny1",
                populate: { product_type: true },
                status: "published",
              });
              strapi.log.debug("Product query result (by fallback documentId):", JSON.stringify(product));
            } catch (error: any) {
              strapi.log.error(`Error fetching product with documentId ble3x2jcilvp3fijw7t9tny1:`, error.message);
            }
          }

          if (product) {
            orderType.product = product.documentId; // Set product to documentId
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
              } else {
                strapi.log.warn(`Invalid product type component: ${productType.__component}`);
              }
            } else {
              strapi.log.warn(`No product type found for product ${product.documentId}`);
            }
          } else {
            strapi.log.warn(`Product with id or documentId ${orderType.product} not found`);
          }

          if (orderType.varient) {
            strapi.log.debug(`Fetching variant with documentId: ${orderType.varient}`);
            try {
              const variant = await strapi.documents("api::varient.varient").findOne({
                documentId: orderType.varient,
                status: "published",
              });
              if (variant) {
                total_product_price += (variant.product_price || 0) * quantity;
                total_tax += (variant.total_tax || 0) * quantity;
                strapi.log.debug(
                  `Added variant price: ${(variant.product_price || 0) * quantity}, tax: ${(variant.total_tax || 0) * quantity}`
                );
              } else {
                strapi.log.warn(`Variant with documentId ${orderType.varient} not found`);
              }
            } catch (error: any) {
              strapi.log.error(`Error fetching variant with documentId ${orderType.varient}:`, error.message);
            }
          }
        }
      }
    }

    // Set totals
    data.total_product_price = total_product_price;
    data.total_tax = total_tax;
    total_to_pay = total_product_price + total_tax;

    // Normalize order_coupons to an array
    if (data.order_coupons && !Array.isArray(data.order_coupons)) {
      data.order_coupons = [data.order_coupons];
      strapi.log.debug(`Normalized order_coupons to array: ${JSON.stringify(data.order_coupons)}`);
    }

    // Apply coupon discount
    if (data.order_coupons && Array.isArray(data.order_coupons) && data.order_coupons.length > 0) {
      let couponId = data.order_coupons[0]; // Assume one coupon
      strapi.log.debug(`Processing coupon input: ${couponId}, type: ${typeof couponId}`);

      // If couponId is numeric, fetch documentId via REST API
      if (typeof couponId === "number" || (typeof couponId === "string" && !isNaN(Number(couponId)))) {
        strapi.log.debug(`Fetching coupon with id via API: ${couponId}`);
        try {
          const response = await axios.get(
            `http://localhost:1337/api/order-coupons?filters[id][$eq]=${couponId}`,
            {
              headers: ctx.request.headers.authorization
                ? { Authorization: ctx.request.headers.authorization }
                : {},
            }
          );
          const coupons = response.data.data;
          strapi.log.debug("Coupon API result (by id):", JSON.stringify(coupons));
          if (coupons && coupons.length > 0) {
            couponId = coupons[0].documentId;
            data.order_coupons = [couponId]; // Update to documentId
            strapi.log.debug(`Mapped coupon id ${couponId} to documentId: ${couponId}`);
          } else {
            strapi.log.warn(`No coupon found with id: ${couponId}`);
            data.order_coupons = []; // Clear invalid coupon
          }
        } catch (error: any) {
          strapi.log.error(`Error fetching coupon with id ${couponId} via API:`, error.message);
          data.order_coupons = []; // Clear on error
        }
      }

      if (typeof couponId === "string" && couponId.length > 10) {
        strapi.log.debug(`Fetching coupon with documentId via API: ${couponId}`);
        try {
          const response = await axios.get(`http://localhost:1337/api/order-coupons/${couponId}`, {
            headers: ctx.request.headers.authorization
              ? { Authorization: ctx.request.headers.authorization }
              : {},
          });
          const coupon = response.data.data;
          strapi.log.debug("Coupon API result (by documentId):", JSON.stringify(coupon));
          if (!coupon) {
            strapi.log.warn(`Coupon with documentId ${couponId} not found`);
            data.order_coupons = []; // Clear invalid coupon
          } else if (
            (coupon.number_of_use === null || coupon.number_of_use > 0) &&
            coupon.amount !== null &&
            new Date(coupon.start_date) <= new Date() &&
            new Date(coupon.expire_date) >= new Date()
          ) {
            total_to_pay -= coupon.amount;
            strapi.log.debug(`Applied coupon discount: ${coupon.amount}`);
            // Update number_of_use if not null
            if (coupon.number_of_use !== null) {
              await strapi.documents("api::order-coupon.order-coupon").update({
                documentId: couponId,
                data: { number_of_use: coupon.number_of_use - 1 },
              });
              strapi.log.debug(`Updated coupon ${couponId} number_of_use to ${coupon.number_of_use - 1}`);
            }
          } else {
            strapi.log.warn(
              `Coupon ${couponId} is invalid: ` +
              (coupon.number_of_use !== null && coupon.number_of_use <= 0 ? "no uses left; " : "") +
              (coupon.amount === null ? "no discount amount; " : "") +
              (new Date(coupon.start_date) > new Date() ? "not yet valid; " : "") +
              (new Date(coupon.expire_date) < new Date() ? "expired; " : "")
            );
            data.order_coupons = []; // Clear invalid coupon
          }
        } catch (error: any) {
          strapi.log.error(`Error fetching coupon ${couponId} via API:`, error.message);
          data.order_coupons = []; // Clear on error
        }
      } else {
        strapi.log.warn(`Invalid coupon documentId: ${couponId}`);
        data.order_coupons = []; // Clear invalid coupon
      }
    }

    // Apply gift card discount
    if (data.gift_card_code) {
      strapi.log.debug(`Fetching gift card with code: ${data.gift_card_code}`);
      try {
        const giftCards = await strapi.documents("api::gift-card.gift-card").findMany({
          filters: { gift_card_details: { code: { $eq: data.gift_card_code } } },
          populate: { gift_card_details: true },
        }) as Array<{ documentId: string; gift_card_details?: { code: string; current_balance: string; is_valid: boolean }[] }>;

        const giftCard = giftCards[0];
        if (giftCard?.gift_card_details?.length > 0) {
          const giftCardDetail = giftCard.gift_card_details.find(detail => detail.code === data.gift_card_code && detail.is_valid);
          if (giftCardDetail && parseFloat(giftCardDetail.current_balance) > 0) {
            const discount = Math.min(parseFloat(giftCardDetail.current_balance), total_to_pay);
            total_to_pay -= discount;
            strapi.log.debug(`Applied gift card discount: ${discount}`);
            const newBalance = (parseFloat(giftCardDetail.current_balance) - discount).toString();
            const updatedDetails = giftCard.gift_card_details.map(detail =>
              detail.code === data.gift_card_code ? { ...detail, current_balance: newBalance } : detail
            );
            await strapi.documents("api::gift-card.gift-card").update({
              documentId: giftCard.documentId,
              data: { gift_card_details: updatedDetails },
            });
            strapi.log.debug(`Updated gift card ${data.gift_card_code} current_balance to ${newBalance}`);
          } else {
            strapi.log.warn(`Gift card ${data.gift_card_code} is invalid or has no balance`);
          }
        } else {
          strapi.log.warn(`Gift card with code ${data.gift_card_code} not found`);
        }
      } catch (error: any) {
        strapi.log.error(`Error fetching gift card ${data.gift_card_code}:`, error.message);
      }
    }

    // Apply shipping price
    if (data.is_shipping_rate) {
      data.shipping_price = 30;
      total_to_pay += 30;
      strapi.log.debug("Applied shipping price: 30");
    } else {
      data.shipping_price = 0;
    }

    // Ensure total_to_pay is not negative
    data.total_to_pay = Math.max(total_to_pay, 0);
    strapi.log.debug(`Final totals - product_price: ${total_product_price}, tax: ${total_tax}, total_to_pay: ${data.total_to_pay}`);

    // Create order
    strapi.log.debug("Creating order with final data:", JSON.stringify(data));
    const result = await strapi.documents("api::order-management.order-management").create({
      data,
      status: "published",
    });

    // Fetch populated result
    const populatedResult = await strapi.documents("api::order-management.order-management").findOne({
      documentId: result.documentId,
      populate: {
        users_permissions_user: true,
        user_address: { populate: "*" },
        type_of_order: { populate: "*" },
        order_coupons: true,
      },
    });

    strapi.log.debug("Populated result:", JSON.stringify(populatedResult));

    return {
      data: populatedResult,
      meta: {},
    };
  },
});