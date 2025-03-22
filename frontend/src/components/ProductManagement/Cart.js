import React from 'react';

const Cart = ({ cart, onIncrease, onDecrease, onRemove, totalAmount, onOrder, onClose }) => {
  const brandColor = localStorage.getItem('brandColor');

  const calculateDiscountedPrice = (sellingPrice, discountPercentage) => {
    return sellingPrice - (sellingPrice * (discountPercentage / 100));
  };

  const totalDiscount = cart.reduce((total, item) => {
    const discountAmount = (item.sellingPrice * (item.discount / 100)) * item.quantity;
    return total + discountAmount;
  }, 0);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold" style={{ color: brandColor }}>Cart</h2>
        <button 
          onClick={onClose}
          style={{ background: brandColor }} 
          className="text-white font-semibold px-2 py-1 rounded"
        >
          Back
        </button>
      </div>
      {cart.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cart.map((item) => (
            <div key={item._id} className="border rounded-lg p-4 shadow-md flex flex-col">
              <h3 className="font-semibold" style={{ color: brandColor }}>{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p className="text-gray-600">
                Price: 
                <span className="line-through text-gray-400">{item.sellingPrice * item.quantity} Birr</span>
                <span className="text-red-500"> {(calculateDiscountedPrice(item.sellingPrice, item.discount) * item.quantity).toFixed(2)} Birr</span>
                {item.discount && (
                  <span className="text-green-500">
                    {' '}(Discount: {item.discount}%)
                  </span>
                )}
              </p>
              <p className="text-red-500">
                Discount: {item.discount ? `${item.discount}% - ${(item.sellingPrice * item.discount / 100 * item.quantity).toFixed(2)} Birr` : '0.00 Birr'}
              </p>
              <div className="flex items-center mt-auto">
                <button 
                  onClick={() => onDecrease(item._id)} 
                  className="text-white px-2 rounded mx-1"
                  style={{ background: brandColor }}
                >
                  -
                </button>
                <button 
                  onClick={() => onIncrease(item._id)} 
                  className="text-white px-2 rounded mx-1"
                  style={{ background: brandColor }}
                >
                  +
                </button>
                <button 
                  onClick={() => onRemove(item._id)} 
                  className="text-white px-2 rounded"
                  style={{ background: brandColor }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <h3 className="font-semibold col-span-1 md:col-span-2 lg:col-span-3 mt-4" style={{ color: brandColor }}>Total Amount: {totalAmount.toFixed(2)} Birr</h3>
          <h3 className="font-semibold col-span-1 md:col-span-2 lg:col-span-3 mt-2 text-red-500">Total Discount: {totalDiscount.toFixed(2)} Birr</h3>
          <button 
            onClick={onOrder} 
            className="text-white p-2 rounded mt-4 w-full col-span-1 md:col-span-2 lg:col-span-3"
            style={{ background: brandColor }}
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;