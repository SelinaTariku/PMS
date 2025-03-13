import React from 'react';
import Pharmacies from '../../assets/Image/Pharmacies.png'; 
import inventoryIcon from '../../assets/Image/Inventory.png';
import orderIcon from '../../assets/Image/order1.png';
import paymentIcon from '../../assets/Image/pay.png';
import deliveryIcon from '../../assets/Image/delivery.png';

const Home = () => {
    return (
        <div className="w-full bg-[#F5F5F5] px-4 py-10  min-h-screen mt-20">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between w-full md:w-[60%] h-[300px]">
                <h1 className="text-2xl text-[#1E467A] font-bold mb-4">Welcome To Pharma Sphere</h1>
                <p className="text-lg text-[#1E467A] mb-4">
                    In a significant move to enhance the operational capabilities and service quality of pharmacies across the nation, we are proud to announce the official launch of the Pharma Sphere. This innovative system is designed to modernize pharmacy operations, ensuring improved efficiency, compliance, and customer engagement.
                </p>
                <a className="font-semibold text-[#1E467A] text-lg mt-4 inline-block" href="#">
                    Read More <i className="fas fa-arrow-right"></i>
                </a>
            </div>
            <div className="w-full md:w-[40%] h-[300px] mt-4 md:mt-0 md:ml-6 flex items-center justify-center">
                <img
                    src={Pharmacies}
                    alt="Pharmacy display"
                    className="rounded-lg shadow-md w-full h-full object-cover"
                />
            </div>
        </div>

            <div className="mt-10">
                <h2 className="text-center text-2xl font-bold mb-10 text-[#1E467A]">Key Features of Pharma Sphere</h2>
                <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
                    <div className="bg-[#1E467A] text-white p-6 rounded-lg shadow-md relative flex-1 min-h-[450px]">
                        <div className="flex justify-center mb-4">
                            <div className="bg-transparent shadow-lg rounded-lg p-4 absolute -top-12">
                                <img src={inventoryIcon} alt="Icon representing inventory management" className="h-20 w-20" /> 
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-8 mt-10">Inventory Management</h3>
                        <p className="text-lg">
                            Efficiently tracks stock levels, manages expiration dates, and automates reorder notifications. Enables categorization and streamlined audits for both current and expired inventory.
                        </p>
                    </div>

                
                    <div className="bg-[#1E467A] text-white p-6 rounded-lg shadow-md relative flex-1">
                        <div className="flex justify-center mb-4">
                            <div className="bg-transparent shadow-lg rounded-lg p-4 absolute -top-12">
                                <img src={orderIcon} alt="Icon representing online drug orders"className="h-20 w-20" /> 
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-8 mt-10">Online Drug Orders</h3>
                        <p className="text-lg">
                            Facilitates a seamless ordering process for customers, allowing them to place orders online, check item availability, and receive order confirmations. Includes features for tracking order history and status updates.
                        </p>
                    </div>

                    {/* Payment Processing */}
                    <div className="bg-[#1E467A] text-white p-6 rounded-lg shadow-md relative flex-1">
                        <div className="flex justify-center mb-4">
                            <div className="bg-transparent shadow-lg rounded-lg p-4 absolute -top-12">
                                <img src={paymentIcon} alt="Icon representing payment processing" className="h-20 w-20" /> 
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-8 mt-10">Payment Processing</h3>
                        <p className="text-lg">
                            Supports cash and Chapa payments, allowing customers to complete transactions efficiently. It ensures secure handling of payment information, maintaining compliance with relevant security standards.
                        </p>
                    </div>

                    {/* Delivery Coordination */}
                    <div className="bg-[#1E467A] text-white p-6 rounded-lg shadow-md relative flex-1">
                        <div className="flex justify-center mb-4">
                            <div className="bg-transparent shadow-lg rounded-lg p-4 absolute -top-12">
                                <img src={deliveryIcon} alt="Icon representing delivery coordination" className="h-20 w-20" /> 
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-8 mt-10">Delivery Coordination</h3>
                        <p className="text-lg">
                            Manages the logistics of delivering medications to customers, including real-time tracking of deliveries, automated notifications for order dispatch and completion, and capturing delivery confirmations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
