// /**
//  * order-management controller
//  */

// import { factories } from '@strapi/strapi';

// // Define explicit population objects to avoid type errors and improve performance
// const POPULATE_PRODUCT: any = {
//     product_categories: true,
//     product_type: {
//         populate: {
//             varients: { populate: { image_details: { populate: ['main_image', 'gallery_image'] } } },
//             attributes: { populate: 'values' },
//             image_details: { populate: ['main_image', 'gallery_image'] }
//         }
//     }
// };

// const POPULATE_CART: any = {
//     item: {
//         populate: {
//             product: { populate: POPULATE_PRODUCT },
//             varient: { populate: { image_details: { populate: ['main_image', 'gallery_image'] } } },
//         }
//     }
// }

// /**
//  * Hydrates a single order by fetching full details for its components.
//  * @param {any} order - The raw order object from Strapi.
//  * @param {any} strapi - The Strapi instance.
//  * @returns {Promise<any>} The hydrated order object.
//  */
// async function hydrateOrder(order: any, strapi: any): Promise<any> {
//     if (!order || !order.type_of_order) return order;

//     const hydratedComponents = await Promise.all(
//         order.type_of_order.map(async (component: any) => {
//             try {
//                 // Case 1: Order was from a cart
//                 if (component.__component === 'cart-order.cart-order' && component.cart?.id) {
//                     const fullCart = await strapi.entityService.findOne('api::cart.cart', component.cart.id, {
//                         populate: POPULATE_CART,
//                     });
//                     return { ...component, cart: fullCart || component.cart };
//                 }

//                 // Case 2: Order was "Buy Now" (or any direct item list)
//                 if (component.__component === 'details.item-list') {
//                      const hydratedComponent = { ...component };
//                     // Populate product
//                     if (component.product?.id) {
//                         hydratedComponent.product = await strapi.entityService.findOne('api::product.product', component.product.id, {
//                            populate: POPULATE_PRODUCT
//                         });
//                     }
//                     // Populate variant
//                     if (component.varient?.id) {
//                         hydratedComponent.varient = await strapi.entityService.findOne('api::varient.varient', component.varient.id, {
//                             populate: { image_details: { populate: ['main_image', 'gallery_image'] } }
//                         });
//                     }
//                     return hydratedComponent;
//                 }
//             } catch (e: any) {
//                 strapi.log.error(`A component hydration failed for order ${order.id}: ${e.message}`);
//                 return component; // Return original component on error
//             }
//             return component;
//         })
//     );

//     return { ...order, type_of_order: hydratedComponents };
// }


// export default factories.createCoreController('api::order-management.order-management', ({ strapi }) => ({
    
//     /**
//      * Custom controller to get a single, fully detailed order.
//      */
//     async findOneDetailed(ctx) {
//         const { id } = ctx.params as { id: string };
//         const { userId } = ctx.query as { userId: string };

//         if (!userId) {
//             return ctx.badRequest('User ID is required.');
//         }

//         const populateConfig: any = {
//             user_address: { populate: 'address' },
//             type_of_order: {
//                 populate: {
//                     cart: { fields: ['id'] },
//                     product: { fields: ['id'] },
//                     varient: { fields: ['id'] },
//                 }
//             }
//         };

//         const orders = await strapi.entityService.findMany('api::order-management.order-management', {
//             filters: { documentId: id, users_permissions_user: { id: { $eq: Number(userId) } } },
//             populate: populateConfig,
//         });

//         if (!orders || orders.length === 0) {
//             return ctx.notFound('Order not found or you do not have permission to view it.');
//         }

//         const order = orders[0];
//         const hydratedOrder = await hydrateOrder(order, strapi);
        
//         const sanitizedEntity = await this.sanitizeOutput(hydratedOrder, ctx);
//         return this.transformResponse(sanitizedEntity);
//     },

//     /**
//      * Custom controller to get all detailed orders for a user.
//      */
//     async findAllDetailed(ctx) {
//         const { userId } = ctx.query as { userId: string };

//         if (!userId) {
//             return ctx.badRequest('User ID is required.');
//         }
        
//         const populateConfig: any = {
//              user_address: { populate: 'address' },
//              type_of_order: {
//                 populate: {
//                     cart: { fields: ['id'] },
//                     product: { fields: ['id'] },
//                     varient: { fields: ['id'] },
//                 }
//             }
//         };

//         const orders = await strapi.entityService.findMany('api::order-management.order-management', {
//             filters: { users_permissions_user: { id: { $eq: Number(userId) } } },
//             populate: populateConfig,
//             sort: 'createdAt:desc',
//         });

//         if (!orders) {
//             return [];
//         }

//         const hydratedOrders = await Promise.all(orders.map(order => hydrateOrder(order, strapi)));

//         const sanitizedEntities = await this.sanitizeOutput(hydratedOrders, ctx);
//         return this.transformResponse(sanitizedEntities);
//     }
// }));

/**
 * order-management controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::order-management.order-management');