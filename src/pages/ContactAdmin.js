import React, { useState } from 'react';
import '../styles/ContactAdmin.css';

const ContactAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSuccessMessage("Message sent successfully!");
      setErrorMessage("");
      setFormData({ name: '', email: '', message: '' });
    } else {
      setErrorMessage("Please fill in all fields.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="contact-admin-container">
      <form className="contact-form" onSubmit={handleSubmit}>
        <h2>Contact Administrator</h2>
        <label>Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} />

        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />

        <label>Message:</label>
        <textarea name="message" rows="5" value={formData.message} onChange={handleChange} />

        <button type="submit">Send Message</button>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </form>
    </div>
  );
};

export default ContactAdmin;
