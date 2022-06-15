import "./Navbar.css";

const Navbar = () => {
  const logo =
    "https://lever-client-logos.s3.us-west-2.amazonaws.com/932ff883-77c1-4d50-af81-5253e940b6b7-1625854088356.png";

  return (
    <nav className='logo-header'>
      <div className='section'>
        <div className='wrapper'>
          <img src={logo} alt='' />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;