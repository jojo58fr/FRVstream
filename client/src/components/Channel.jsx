import React, { useContext } from 'react';
import { Outlet, Link } from "react-router-dom";
//import '../App.scss';

import styles from './Channel.module.scss';

function Channel(streamer) {

    let streamerObj = streamer.streamer;
    
    let lastStream = null;
    let lastStreamThumbnail = null;
    lastStream = streamerObj.listLastedStream[0];
    //console.log(lastStream);

    //https://static-cdn.jtvnw.net/previews-ttv/live_user_charlotteadventures-{width}x{height}.jpg
    lastStreamThumbnail = lastStream.thumbnail_url.replace("{width}", "1920");
    lastStreamThumbnail = lastStreamThumbnail.replace("{height}", "1080");
    //console.log(lastStreamThumbnail);

    return (
    <>
            <div className={styles['stream']}>
                <Link to={`/c/` + streamerObj.name}>
                    <div className={styles['thumbnail']}>
                        <span className={`${styles['live']} ${styles['stream-thumbnail-span']}`}>LIVE</span>
                        <img className={styles['stream-thumbnail-img']} src={lastStreamThumbnail} alt="Overwatch" />
                        <span className={`${styles['viewers']} ${styles['stream-thumbnail-span']}`}>{lastStream.viewer_count} Vues</span>
                    </div>
                </Link>
                <div className={styles['stream-info']}>
                    <div className={styles['stream-profile-avatar']}>
                        <Link to={`/c/` + streamerObj.name}><img className={styles['stream-profile-avatar-img']} src={streamerObj.logo} alt={streamerObj.display_name} /></Link>
                    </div>
                    <div className={styles['stream-text']}>
                        <Link to={`/c/` + streamerObj.name}><p className={styles['stream-title']}>
                            {lastStream.title}
                        </p></Link>
                        <Link to={`/c/` + streamerObj.name}><p className={styles['stream-host']}>{streamerObj.display_name}</p></Link>
                        <Link to={`/d/g/${encodeURIComponent(lastStream.game_name)}`}><p className={styles['stream-game']}>{lastStream.game_name}</p></Link>
                        {/* <div class="game-categories">
                        <span>LGBTQIA+</span>
                        <span>English</span>
                        <span>AMA</span>
                        </div> */}
                    </div>
                </div>
            </div>
    </>
    )
}

export default Channel
