import React from 'react';
import { Link } from "react-router-dom";
//import '../App.scss';

import styles from './Channel.module.scss';
import FavoriteButton from './FavoriteButton.jsx';

function Channel(streamer) {
    const streamerObj = streamer?.streamer;
    const lastStream = streamerObj?.listLastedStream?.[0];
    const slug = streamerObj?.name ?? streamerObj?.display_name ?? lastStream?.user_login ?? streamerObj?.slug;
    const displayName = streamerObj?.display_name ?? lastStream?.user_login ?? slug;

    if (!lastStream) {
        return null;
    }

    let lastStreamThumbnail = lastStream.thumbnail_url
        ?.replace("{width}", "1920")
        ?.replace("{height}", "1080");

    return (
        <div className={styles['stream']}>
            <Link to={`/c/${encodeURIComponent(slug)}`}>
                <div className={styles['thumbnail']}>
                    <span className={`${styles['live']} ${styles['stream-thumbnail-span']}`}>LIVE</span>
                    <img className={styles['stream-thumbnail-img']} src={lastStreamThumbnail} alt={lastStream.title ?? 'Live'} />
                    <span className={`${styles['viewers']} ${styles['stream-thumbnail-span']}`}>{lastStream.viewer_count} Vues</span>
                </div>
            </Link>
            <div className={styles['stream-info']}>
                <div className={styles['stream-profile-avatar']}>
                    <Link to={`/c/${encodeURIComponent(slug)}`}><img className={styles['stream-profile-avatar-img']} src={streamerObj.logo} alt={displayName} /></Link>
                </div>
                <div className={styles['stream-text']}>
                    <Link to={`/c/${encodeURIComponent(slug)}`}><p className={styles['stream-title']}>
                        {lastStream.title}
                    </p></Link>
                    <Link to={`/c/${encodeURIComponent(slug)}`}><p className={styles['stream-host']}>{displayName}</p></Link>
                    <Link to={`/d/g/${encodeURIComponent(lastStream.game_name)}`}><p className={styles['stream-game']}>{lastStream.game_name}</p></Link>
                </div>
                <div className={styles['favorite-wrapper']}>
                    <FavoriteButton vtuber={streamerObj} size="sm" variant="ghost" />
                </div>
            </div>
        </div>
    )
}

export default Channel
