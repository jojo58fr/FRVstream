import { useState } from 'react'
import '../App.scss'

function Footer() {

  return (
    <>
        <div className="footer bar">
          <div className="nav">
            <div id="footer-tagline">Fièrement propulsé par <a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://www.startingames.org/en/">Startingames</a>™ pour la communauté ❤</div>
            <div id="footer-tagline-right">Version Alpha. <a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://discord.gg/meyHQYWvjU">Donnez vos Feedbacks sur Discord</a></div>
          </div>
        </div>
    </>
  )
}

export default Footer
