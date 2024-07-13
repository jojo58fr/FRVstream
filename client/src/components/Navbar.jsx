import { useState, useContext } from 'react'
import '../App.scss'
import styles from './Navbar.module.scss';
import { Outlet, Link, NavLink } from "react-router-dom";
import FRVstream from "../assets/FRVtubers_Vstream.png";
import { LoginContext } from '../App.jsx';
import FlagFR from '../assets/fr_flag.png';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'primereact/button';

import UniversalLoginSystem from '../UniversalLoginSystem/index.js';

function Navbar() {

  const [isLogged, setIsLogged] = useContext(LoginContext);

  const logout = async () => {
    
    let res = await UniversalLoginSystem.request_logout();
    
    if(res)
    {
      setIsLogged(null);
    }

  }

  return (
    <>
        <div className={`${styles['navbar']} ${styles['bar']}`}>
          <div className={`${styles['nav']}`}>
            <Link className={(navData) => (navData.isActive ? 'active' : '')} to={`/`}><div className="logo">
              <img src={FRVstream} />
            </div></Link>
            <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to={`/`}><div className={`${styles['item']}`} id="selected">Accueil</div></NavLink>
            <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to={`/events`}><div className={`${styles['item']}`}>📅 Évènements</div></NavLink>
            <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to={`/french-channels`}><div className={`${styles['item']}`}><div className='item-img-container'><img width="20px" style={{borderRadius: "5px", paddingRight: "5px"}} src={FlagFR} alt="FR Logo" /> Chaines Françaises</div></div></NavLink>
            <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to={`/quebecers-channels`}><div className={`${styles['item']}`}>⚜️ Chaines Québécoises</div></NavLink>
            <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to={`/random-channel`} reloadDocument><div className={`${styles['item']}`}>🎲 Fais-moi découvrir une chaine</div></NavLink>
          
            {isLogged && <div className={`${styles['wrapper-right']}`}>
              <NavLink className={(navData) => (navData.isActive ? `${styles['w-btn-login']} active` : `${styles['w-btn-login']}`)} to={`/profil`}>
                <Button className={`${styles['btn-profil']}`} aria-label="[PERSONNE CONNECTÉ]"style={{color: "white"}}>
                  <img className={`${styles['logo-profil']}`} src="https://static-cdn.jtvnw.net/jtv_user_pictures/6e11636b-4914-45d1-aae5-2d3126eee76b-profile_image-300x300.jpeg"></img>
                  <div className={`${styles['text-profil']}`}> {isLogged.username}</div>
                </Button>
              </NavLink>
              <Button className={`${styles['btn-logout']}`} icon="pi pi-sign-out" aria-label="Se déconnecter" label="Se déconnecter" style={{color: "white"}} onClick={() => { logout() }}/>
            </div>}

            {!isLogged && <div className={`${styles['wrapper-right']}`}>
              <NavLink className={(navData) => (navData.isActive ? `${styles['w-btn-login']} active` : `${styles['w-btn-login']}`)} to={`/login`}> <Button className={`${styles['btn-login']}`} icon="pi pi-sign-in" aria-label="Se connecter" label="Se connecter" style={{color: "white"}}/> </NavLink>
            </div>}
          </div>
        </div>
    </>
  )
}

export default Navbar
