import { useState } from 'react'
import './App.scss'

function Navbar() {

  return (
    <>
        <div className="bar">
          <div className="nav">
            <div className="logo">
              <img src="https://frvtubers.com/src/assets/FRVtubers_logo_without_subtitle.png" />
            </div>
            <div className="item" id="selected">Accueil</div>
            <div className="item">🇫🇷 Chaines Françaises</div>
            <div className="item">⚜️ Chaines Québécoises</div>
            {/* <div className="item">Chaines</div>
            <div className="item">Browse</div>
            <div className="item">Try Prime</div> */}
          </div>
        </div>
    </>
  )
}

export default Navbar
