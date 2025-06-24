// /**
//  * order-management router
//  */

// import { factories } from '@strapi/strapi';

// // This is a helper function to safely extend a router with new routes
// const customRouter = (innerRouter, extraRoutes = []) => {
//   let routes;

//   return {
//     get prefix() {
//       return innerRouter.prefix;
//     },
//     get routes() {
//       if (!routes) {
//         routes = innerRouter.routes.concat(extraRoutes);
//       }
//       return routes;
//     },
//   };
// };

// const myExtraRoutes = [
//   {
//     method: 'GET',
//     path: '/order-managements/detailed',
//     handler: 'order-management.findAllDetailed',
//     config: {
//         // You can add policies here if needed
//     }
//   },
//   {
//     method: 'GET',
//     path: '/order-managements/:id/detailed',
//     handler: 'order-management.findOneDetailed',
//     config: {
//         // You can add policies here if needed
//     }
//   },
// ];

// const defaultRouter = factories.createCoreRouter('api::order-management.order-management');
// export default customRouter(defaultRouter, myExtraRoutes);

/**
 * order-management router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::order-management.order-management');