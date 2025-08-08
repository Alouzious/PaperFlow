// src/Pages/Dashboard.jsx
import React from 'react';
import Navbar from '../components/Navbar'; // make sure this path is correct

function Dashboard() {
  return (
    <>
      <Navbar isRegistered={true} /> {/* Set isRegistered to true if the user is logged in */}
      <div style={{ padding: '20px' }}>
        <h1>Welcome to your Dashboard</h1>
        {/* You can add more components or content here */}
      </div>
    </>
  );
}

export default Dashboard;
