import React from "react";

import { Link } from "react-router-dom";

const Header = () => (
  <header>
    <nav className="navbar__flex">
      <div className="navbar__left">
        <a href="/">
          <span className="navbar__hamburger" />
        </a>
      </div>
      <div className="navbar__right">
        <label for="navbarToggler" className="navbar__toggler__label">
          <span className="navbar__hamberger" />
          <span>Menu</span>
        </label>
        <input
          type="checkbox"
          name=""
          className="navbar__toggler__input"
          id="navbarToggler"
        />
        <ul className="navbar__links">
          <li>
            <a href="/">Build</a>
          </li>
          <li>
            <a href="/mytemplates">My Templates</a>
          </li>
          <li>
            <a>Log Out</a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
);

export default Header;
