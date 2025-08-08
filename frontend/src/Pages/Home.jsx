// Pages/Home.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Form from '../components/Form';
import About from '../components/About';
import Footer from '../components/Footer';
import HeroSection from '../components/Hero-section';

const Home = ({ onRegister }) => {
  return (
    <>
      <Navbar isRegistered={false} />
      <HeroSection />
      <About />
      <Footer />
    </>
  );
};

export default Home;