import { useState } from 'react'
import '../App.scss'
import styles from './Footer.module.scss';

import metadata from '../../metadata-version.json'

function Footer() {

  return (
    <>
        <div className={`${styles['footer']} ${styles['bar']}`}>
          <div className={`${styles['nav']}`}>
            <div className={`${styles['footer-tagline']}`} id="footer-tagline">Fièrement propulsé par <a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://www.startingames.org/en/">Startingames</a>™ pour la communauté ❤</div>
            <div className={`${styles['footer-tagline-right']}`} id="footer-tagline-right">Version {`${metadata.buildMajor}.${metadata.buildMinor}.${metadata.buildRevision} ${metadata.buildTag}`}. <a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://discord.gg/meyHQYWvjU">Donnez vos Feedbacks sur Discord</a></div>
          </div>
        </div>
    </>
  )
}

export default Footer
