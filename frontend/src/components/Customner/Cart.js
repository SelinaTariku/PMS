import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faTimes } from '@fortawesome/free-solid-svg-icons';

const Cart = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  onQuantityChange, 
  onCheckout,
  brandColor 
}) => {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        ></div>
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Shopping cart</h2>
                  <button
                    type="button"
                    className="-mr-2 p-2 text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <div className="mt-8">
                  <div className="flow-root">
                    {cartItems.length === 0 ? (
                      <div className="text-center py-12">
                        <FontAwesomeIcon 
                          icon={faShoppingCart} 
                          className="mx-auto text-gray-400 text-4xl mb-4" 
                        />
                        <p className="text-gray-500">Your cart is empty</p>
                      </div>
                    ) : (
                      <ul className="-my-6 divide-y divide-gray-200">
                        {cartItems.map((item) => (
                          <li key={item.productId} className="py-6 flex">
                            <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                              <img
                                src={item.image || '/placeholder-product.png'}
                                alt={item.name}
                                className="w-full h-full object-center object-cover"
                              />
                            </div>

                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{item.name}</h3>
                                  <p className="ml-4">${item.price.toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">{item.brand || 'Generic'}</p>
                              </div>

                              <div className="flex-1 flex items-end justify-between text-sm">
                                <div className="flex items-center">
                                  <button
                                    onClick={() => onQuantityChange(item.productId, -1)}
                                    className="px-2 py-1 border rounded-l-md bg-gray-100"
                                  >
                                    -
                                  </button>
                                  <span className="px-3 py-1 border-t border-b">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => onQuantityChange(item.productId, 1)}
                                    className="px-2 py-1 border rounded-r-md bg-gray-100"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => onRemoveItem(item.productId)}
                                  className="font-medium text-red-600 hover:text-red-500"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>${totalAmount.toFixed(2)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={onCheckout}
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


export default Cart;