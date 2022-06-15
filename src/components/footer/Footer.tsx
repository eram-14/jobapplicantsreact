import React from "react";
import './Footer.css'
const Footer = () => {
    return (<>
        <div className="main-footer page-full-width">
            <div className="main-footer-text page-centered">
                <p>
                    <a href="">Render Home Page</a>
                </p><a href="https://lever.co/" className="image-link">
                    <span>Jobs powered by </span>
                    <img alt="Lever logo" src="https://jobs.lever.co/img/lever-logo-full.svg" /></a>
            </div>
        </div>
    </>)
}

export default Footer