// src/Pages/Dashboard.jsx
import React from 'react';
import Navbar from '../components/Navbar'; // make sure this path is correct
import  HeroDashboard from '../components/hero-dashboard';
import FacultyDashboard from '../components/Faculty-section';
import MoreAbout from '../components/MoreAbout';
import MainFooter from '../components/MainFooter'
function Dashboard() {
  return (
    <>
      <Navbar isRegistered={true} /> {/* Set isRegistered to true if the user is logged in */}
      <HeroDashboard />
      <FacultyDashboard />
      <MoreAbout />
      <MainFooter />
    </>
  );
}

export default Dashboard;
