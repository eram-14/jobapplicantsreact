import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import Heading from './components/heading/Heading';
import Body from './components/body/Body';

function App() {
  return (
    <div className="App ">
        <Navbar/>
        <Heading/>
        <Body/>
        <Footer/>
    </div>
  );
}

export default App;
