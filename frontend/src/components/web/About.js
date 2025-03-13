import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

const AboutUs = () => {
    return (
        <div className="bg-[#F5F5F5] min-h-screen mt-20">
            <div className="max-w-7xl mx-auto py-10">

                <div className="text-center rounded-lg mb-9 bg-white ">
                    <h1 className="text-2xl font-bold" style={{ color: '#1E467A' }}>
                        Welcome to the Pharma Sphere
                    </h1>
                    <p className="text-xl font-semibold mt-4" style={{ color: '#1E467A' }}>
                        where we are dedicated to transforming the way pharmacies operate.
                    </p>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center mb-7">
                            <i className="fas fa-bullseye text-3xl text-blue-500 mr-4"></i>
                            <h2 className="text-xl font-bold" style={{ color: '#1E467A' }}>Our Mission</h2>
                        </div>
                        <p style={{ color: '#1E467A' }}>
                            To empower pharmacy owners, managers, and staff with cutting-edge technology that streamlines operations, enhances customer service, and ensures compliance with regulatory standards.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center mb-4">
                            <i className="fas fa-lightbulb text-3xl text-yellow-500 mr-4"></i>
                            <h2 className="text-xl font-semibold" style={{ color: '#1E467A' }}>Our Vision</h2>
                        </div>
                        <p style={{ color: '#1E467A' }}>
                            To be the leading provider of innovative pharmacy management solutions that revolutionize the healthcare landscape.
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-center mb-6">
                        <i className="fas fa-heart text-3xl text-red-500"></i>
                        <h2 className="text-2xl font-semibold mt-2" style={{ color: '#1E467A' }}>Core Values</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className='p-8'>
                            <h3 className="text-xl font-semibold mb-3 " style={{ color: '#1E467A' }}>Innovation</h3>
                            <p style={{ color: '#1E467A' }}>
                                We embrace creativity and continuously seek to develop cutting-edge solutions that enhance pharmacy management and patient care.
                            </p>
                        </div>
                        <div className='p-8'>
                            <h3 className="text-xl font-semibold mb-3" style={{ color: '#1E467A' }}>Integrity</h3>
                            <p style={{ color: '#1E467A' }}>
                                We uphold the highest standards of honesty and transparency in all our interactions, fostering trust with our clients and partners.
                            </p>
                        </div>
                        <div className='p-8'>
                            <h3 className="text-xl font-semibold mb-3" style={{ color: '#1E467A' }}>Customer Focus</h3>
                            <p style={{ color: '#1E467A' }}>
                                Our priority is to deliver solutions that address our clients' needs, promoting efficiency and convenience for their customers.
                            </p>
                        </div>
                        <div className='p-8'>
                            <h3 className="text-xl font-semibold mb-3" style={{ color: '#1E467A' }}>Collaboration</h3>
                            <p style={{ color: '#1E467A' }}>
                                We believe in the power of teamwork and partnership, working closely with our clients and stakeholders to achieve common goals.
                            </p>
                        </div>
                        <div className='p-8'>
                            <h3 className="text-xl font-semibold mb-3" style={{ color: '#1E467A' }}>Excellence</h3>
                            <p style={{ color: '#1E467A' }}>
                                We are committed to delivering high-quality products and services, continuously improving our processes and performance to exceed expectations.
                            </p>
                        </div>
                        <div className='p-8'>
                            <h3 className="text-xl font-semibold mb-3" style={{ color: '#1E467A' }}>Compliance</h3>
                            <p style={{ color: '#1E467A' }}>
                                We prioritize adherence to regulatory standards, ensuring that our solutions promote safe and responsible pharmacy practices.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
