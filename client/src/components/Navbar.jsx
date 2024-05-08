import { useState } from 'react'
import '../App.scss'
import { Outlet, Link, NavLink } from "react-router-dom";
import FRVstream from "../assets/FRVtubers_Vstream.png";

import FlagFR from '../assets/fr_flag.png';

function Navbar() {

  return (
    <>
        <div className="navbar bar">
          <div className="nav">
            <Link className={(navData) => (navData.isActive ? 'active' : '')} to={`/`}><div className="logo">
              <img src={FRVstream} />
            </div></Link>
            <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to={`/`}><div className="item" id="selected">Accueil</div></NavLink>
            <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to={`/french-channels`}><div className="item"><div className='item-img-container'><img width="20px" style={{borderRadius: "5px", paddingRight: "5px"}} src={FlagFR} alt="FR Logo" /> Chaines Françaises</div></div></NavLink>
            <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to={`/quebecers-channels`}><div className="item">⚜️ Chaines Québécoises</div></NavLink>
            <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to={`/random-channel`} reloadDocument><div className="item">🎲 Fais-moi découvrir une chaine</div></NavLink>
          </div>
        </div>
    </>
  )
}

export default Navbar
