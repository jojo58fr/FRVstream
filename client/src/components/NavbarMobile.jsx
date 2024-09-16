import { useState, useContext } from 'react'
import './NavbarMobile.scss'
import { Outlet, NavLink } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faDice, faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';

import { LoginContext } from '../App.jsx';

import FlagFR from '../assets/fr_flag.png';
import FleurLysQuebec from '../assets/Fleur_de_lys_du_québec.svg.png';

function NavbarMobile() {
    
    const [isLogged, setIsLogged] = useContext(LoginContext);

    return (
    <>
        <nav>
            <NavLink className={(navData) => (navData.isActive ? 'nav-item active' : 'nav-item')} to={`/`}>
                <FontAwesomeIcon icon={faHouse} /><span>Accueil</span>
            </NavLink>

            <NavLink className={(navData) => (navData.isActive ? 'nav-item active' : 'nav-item')} to={`/events`}>
                <FontAwesomeIcon icon={faCalendar} />
                <span> Évènements</span>
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
            
            {!isLogged && <NavLink className={(navData) => (navData.isActive ? 'nav-item active' : 'nav-item')} to={`/login`}>
                <FontAwesomeIcon icon={faUser} /><span>Se connecter</span>
            </NavLink>}

            {isLogged && <NavLink className={(navData) => (navData.isActive ? 'nav-item active' : 'nav-item')} to={`/profil`}>
                <FontAwesomeIcon icon={faUser} /><span>Mon Profil</span>
            </NavLink>}
        </nav>
    </>
    )
}

export default NavbarMobile
