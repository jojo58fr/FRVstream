import { useState } from 'react'
import './NavbarMobile.scss'
import { Outlet, NavLink } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faDice } from '@fortawesome/free-solid-svg-icons';

import FlagFR from '../assets/fr_flag.png';
import FleurLysQuebec from '../assets/Fleur_de_lys_du_québec.svg.png';

function NavbarMobile() {
    
    return (
    <>
        <nav>
            <NavLink className={(navData) => (navData.isActive ? 'nav-item active' : 'nav-item')} to={`/`}>
                <FontAwesomeIcon icon={faHouse} /><span>Accueil</span>
            </NavLink>

            <NavLink className={(navData) => (navData.isActive ? 'nav-item active' : 'nav-item')} to={`/french-channels`}>
                <img width="20px" style={{borderRadius: "3px"}} src={FlagFR} alt="FR Logo" />
                <span> Chaînes FR</span>
            </NavLink>
            
            <NavLink className={(navData) => (navData.isActive ? 'nav-item active' : 'nav-item')} to={`/quebecers-channels`}>
                <img width="20px" src={FleurLysQuebec} alt="QC Logo" /><span>Chaînes QC</span>
            </NavLink>
            
            <NavLink className={(navData) => (navData.isActive ? 'nav-item active' : 'nav-item')} to={`/random-channel`} reloadDocument>
                <FontAwesomeIcon icon={faDice} /><span>Chaîne aléatoire</span>
            </NavLink>
        </nav>
    </>
    )
}

export default NavbarMobile
