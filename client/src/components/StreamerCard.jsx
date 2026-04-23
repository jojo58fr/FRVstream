import React from 'react';
import { Outlet, Link } from "react-router-dom";

import '../App.scss';
import styles from './StreamerCard.module.scss';
import FavoriteButton from './FavoriteButton.jsx';


function StreamerCard(streamer) {

    let streamerObj = streamer.streamer;
    //if(streamerObj.isStreaming) console.log(streamer);
    
    const twitchUrl = `https://www.twitch.tv/${streamerObj.name}`;
    const raidCommand = `/raid ${streamerObj.name}`;

    let lastStream = null;
    let lastStreamThumbnail = null;
    if(streamerObj.isStreaming)
    {
        
        lastStream = streamerObj.listLastedStream[0];
    
        //https://static-cdn.jtvnw.net/previews-ttv/live_user_charlotteadventures-{width}x{height}.jpg
        lastStreamThumbnail = lastStream.thumbnail_url.replace("{width}", "1920");
        lastStreamThumbnail = lastStreamThumbnail.replace("{height}", "1080");
    }

    const handleRaidCopy = (event) => {
        event?.stopPropagation?.();
        event?.preventDefault?.();
        try {
            if (navigator?.clipboard?.writeText) {
                navigator.clipboard.writeText(raidCommand);
                return;
            }
            const textarea = document.createElement('textarea');
            textarea.value = raidCommand;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        } catch (err) {
            console.error('Impossible de copier la commande de raid', err);
        }
    };

    return (
        <div className={streamerObj.isStreaming ? "card onLive": "card"}>
            { lastStreamThumbnail && <div style={{background: `url(${lastStreamThumbnail})`, backgroundSize: 'cover'}} className="bg"></div>}
            { lastStreamThumbnail && <div className="bg2"></div>}
            <div className="card-container">
                <Link to={`/c/` + streamerObj.name} className="card-info">
                <img className="card-img" src={streamerObj.logo} alt="Avatar"/>
                <div className="name">
                    <h4><b>{streamerObj.display_name}</b></h4>
                </div>
                </Link>
                {streamerObj.isStreaming && <>
                    <Link to={`/c/` + streamerObj.name}>
                        <div className={styles.profileViewers}>
                                <div className="live-icon">🔴</div>
                                <div className="viewer-count"> {lastStream.viewer_count}</div>
                        </div>
                        <div className="title-stream">{lastStream.title}</div>
                    </Link>
                    <Link to={`/d/g/${encodeURIComponent(lastStream.game_name)}`}>
                        <div className="game-stream">🎮 {lastStream.game_name}</div>
                    </Link>
                </>}
                <div className={styles.actions}>
                    <FavoriteButton vtuber={streamerObj} size="sm" variant="ghost" />
                    <Link
                        to={`/c/` + streamerObj.name}
                        className={styles.actionButton}
                        onClick={(event) => event?.stopPropagation?.()}
                    >
                        Voir la chaîne
                    </Link>
                    <a
                        href={twitchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${styles.actionButton} ${styles.iconOnly}`}
                        onClick={(event) => event?.stopPropagation?.()}
                        aria-label="Ouvrir sur Twitch"
                        title="Ouvrir sur Twitch"
                    >
                        <i className="pi pi-external-link" aria-hidden="true" />
                    </a>
                    <button
                        type="button"
                        className={`${styles.actionButton} ${styles.raidText}`}
                        onClick={handleRaidCopy}
                        aria-label="Copier /raid"
                        title="Copier la commande /raid"
                    >
                        /raid
                    </button>
                </div>
            </div>
        </div> 
    
    )
}

export default StreamerCard
