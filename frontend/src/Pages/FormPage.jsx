import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Form from '../components/Form';

const FormPage = ({ onRegister }) => {
  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
        <Form onRegister={onRegister} />
      </main>
      <Footer />
    </>
  );
};

export default FormPage;
