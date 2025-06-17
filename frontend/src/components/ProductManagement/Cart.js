// import React from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
//   faTimes, 
//   faPlus, 
//   faMinus, 
//   faShoppingBag,
//   faArrowLeft,
//   faPercentage
// } from '@fortawesome/free-solid-svg-icons';
// import { motion } from 'framer-motion';

// const Cart = ({ 
//   cart, 
//   onIncrease, 
//   onDecrease, 
//   onRemove, 
//   totalAmount, 
//   onOrder, 
//   onClose 
// }) => {
//   const brandColor = localStorage.getItem('brandColor') || '#4f46e5';

//   const getPriceInfo = (item) => {
//     const hasDiscount = item.discount > 0;
//     const originalPrice = item.sellingPrice;
//     const discountedPrice = hasDiscount 
//       ? originalPrice - (originalPrice * item.discount / 100)
//       : originalPrice;
//     const itemTotal = discountedPrice * item.quantity;
//     const originalTotal = originalPrice * item.quantity;
//     const savings = originalTotal - itemTotal;

//     return {
//       hasDiscount,
//       originalPrice,
//       discountedPrice,
//       itemTotal,
//       originalTotal,
//       savings
//     };
//   };

//   const cartTotals = cart.reduce((totals, item) => {
//     const { originalTotal, itemTotal, savings } = getPriceInfo(item);
//     return {
//       subtotal: totals.subtotal + originalTotal,
//       total: totals.total + itemTotal,
//       totalSavings: totals.totalSavings + savings
//     };
//   }, { subtotal: 0, total: 0, totalSavings: 0 });

//   // Animation variants
//   const cardVariants = {
//     initial: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
//     hover: { 
//       scale: 1.02, 
//       boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
//       transition: { duration: 0.3 }
//     }
//   };

//   const buttonVariants = {
//     hover: { scale: 1.1 },
//     tap: { scale: 0.95 }
//   };

//   const orderButtonVariants = {
//     hover: { 
//       scale: 1.02,
//       boxShadow: `0 5px 15px ${brandColor}33` // Adds glow effect
//     },
//     tap: { scale: 0.98 }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
//       {/* Cart Header */}
//       <motion.div 
//         className="flex justify-between items-center p-4 text-white"
//         style={{ backgroundColor: brandColor }}
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//       >
//         <h2 className="text-xl font-bold flex items-center gap-3">
//           <FontAwesomeIcon icon={faShoppingBag} />
//           Your Shopping Cart
//         </h2>
//         <motion.button 
//           onClick={onClose}
//           className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
//           aria-label="Close cart"
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//         >
//           <FontAwesomeIcon icon={faArrowLeft} />
//         </motion.button>
//       </motion.div>

//       {/* Cart Content */}
//       <div className="divide-y divide-gray-100">
//         {cart.length === 0 ? (
//           <motion.div 
//             className="p-8 text-center"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//           >
//             <div className="text-gray-300 mb-4">
//               <FontAwesomeIcon icon={faShoppingBag} size="3x" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-700 mb-2">Your cart is empty</h3>
//             <p className="text-gray-500">Add some products to get started!</p>
//           </motion.div>
//         ) : (
//           <>
//             {/* Cart Items */}
//             {cart.map((item) => {
//               const { 
//                 hasDiscount, 
//                 originalPrice, 
//                 discountedPrice, 
//                 itemTotal 
//               } = getPriceInfo(item);

//               return (
//                 <motion.div 
//                   key={`${item._id}-${item.quantity}`}
//                   className="p-4"
//                   variants={cardVariants}
//                   initial="initial"
//                   whileHover="hover"
//                 >
//                   <div className="flex justify-between gap-4">
//                     <div className="flex-1">
//                       <h3 className="font-semibold" style={{ color: brandColor }}>
//                         {item.name}
//                       </h3>
                      
//                       {/* Price Display */}
//                       <div className="mt-1">
//                         {hasDiscount ? (
//                           <div className="flex flex-wrap items-baseline gap-2">
//                             <span className="text-gray-500 line-through">
//                               {originalPrice.toFixed(2)} Birr
//                             </span>
//                             <span className="font-medium text-red-500">
//                               {discountedPrice.toFixed(2)} Birr
//                             </span>
//                             <motion.span 
//                               className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1"
//                               whileHover={{ scale: 1.05 }}
//                             >
//                               <FontAwesomeIcon icon={faPercentage} size="xs" />
//                               {item.discount}% off
//                             </motion.span>
//                           </div>
//                         ) : (
//                           <span className="font-medium">
//                             {originalPrice.toFixed(2)} Birr
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     {/* Quantity Controls */}
//                     <div className="flex items-center gap-2">
//                       <motion.button
//                         onClick={() => onDecrease(item._id)}
//                         className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
//                         aria-label="Decrease quantity"
//                         variants={buttonVariants}
//                         whileHover="hover"
//                         whileTap="tap"
//                       >
//                         <FontAwesomeIcon icon={faMinus} className="text-gray-600" />
//                       </motion.button>
//                       <span className="w-6 text-center font-medium">{item.quantity}</span>
//                       <motion.button
//                         onClick={() => onIncrease(item._id)}
//                         className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
//                         aria-label="Increase quantity"
//                         variants={buttonVariants}
//                         whileHover="hover"
//                         whileTap="tap"
//                       >
//                         <FontAwesomeIcon icon={faPlus} className="text-gray-600" />
//                       </motion.button>
//                     </div>
//                   </div>

//                   {/* Item Total and Remove */}
//                   <div className="flex justify-between items-center mt-3">
//                     <div className="font-medium">
//                       Total: <span style={{ color: brandColor }}>{itemTotal.toFixed(2)} Birr</span>
//                     </div>
//                     <motion.button
//                       onClick={() => onRemove(item._id)}
//                       className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                     >
//                       <FontAwesomeIcon icon={faTimes} />
//                       Remove
//                     </motion.button>
//                   </div>
//                 </motion.div>
//               );
//             })}

//             {/* Order Summary */}
//             <div className="p-4 bg-gray-50">
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Subtotal:</span>
//                   <span>{cartTotals.subtotal.toFixed(2)} Birr</span>
//                 </div>
                
//                 {cartTotals.totalSavings > 0 && (
//                   <motion.div 
//                     className="flex justify-between text-green-600"
//                     initial={{ opacity: 0, x: -10 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.3 }}
//                   >
//                     <span>Total Savings:</span>
//                     <span>-{cartTotals.totalSavings.toFixed(2)} Birr</span>
//                   </motion.div>
//                 )}
                
//                 <div className="border-t border-gray-200 my-2"></div>
                
//                 <div className="flex justify-between font-bold text-lg">
//                   <span>Total:</span>
//                   <span style={{ color: brandColor }}>{cartTotals.total.toFixed(2)} Birr</span>
//                 </div>
//               </div>

//               <motion.button
//                 onClick={onOrder}
//                 className="w-full py-3 px-4 mt-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors"
//                 style={{ backgroundColor: brandColor }}
//                 variants={orderButtonVariants}
//                 whileHover="hover"
//                 whileTap="tap"
//               >
//                 <FontAwesomeIcon icon={faShoppingBag} />
//                 Place Order
//               </motion.button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Cart;