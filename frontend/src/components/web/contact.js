import React, { useState } from 'react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle form submission,
    // e.g., send the data to an API or email service.
    console.log('Form submitted:', formData);
    setSubmitted(true); // Show success message
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white border rounded shadow mt-40 py-10">
      <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
      {submitted ? (
        <div className="text-green-500 mb-4">Thank you for your message!</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              className="w-full p-2 border border-gray-300 rounded"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#1E467A] text-white rounded hover:bg-[#1E467A]/80"
          >
            Send Message
          </button>
        </form>
      )}
      <div className="mt-6">
        <h3 className="font-semibold">Contact Information</h3>
        <p>Email: pharmasphere@gmail.com</p>
        <p>Phone: +25194348192</p>
        <p>Address: Arat Kilo</p>
      </div>
    </div>
  );
};

export default ContactUs;