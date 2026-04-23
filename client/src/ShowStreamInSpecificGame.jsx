import React, { useState, useEffect, useMemo } from 'react';

import './App.scss';
import styles from './ShowStreamInSpecificGame.module.scss';
import API from './Api.js';

import Channel from './components/Channel.jsx';

import Navbar from './components/Navbar.jsx';
import Leftbar from './components/Leftbar.jsx';
import Footer from './components/Footer.jsx';

import ReactTwitchEmbedVideo from "react-twitch-embed-video";

import { useParams } from 'react-router-dom';
import { useSeo } from './components/Seo.jsx';

const formatNumber = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '-';
    }
    return value.toLocaleString('fr-FR');
};

function ShowStreamInSpecificGame() {

    let params = useParams();

    const [categoryGame, setCategoryGame] = useState([]);
    const [onlineStreamers, setOnlineStreamers] = useState([]);
    const [trackerSummary, setTrackerSummary] = useState(null);

    const gameName = categoryGame?.[0]?.game_name;
    const canonicalPath = params?.gameID ? `/d/g/${encodeURIComponent(params.gameID)}` : '/d/g';
    const coverUrl = useMemo(() => {
        const gameEntry = categoryGame?.[0];
        if (gameEntry?.gameBoxArtUrl) {
            return gameEntry.gameBoxArtUrl;
        }
        if (gameEntry?.game_name) {
            return `https://static-cdn.jtvnw.net/ttv-boxart/${encodeURIComponent(gameEntry.game_name)}-600x800.jpg`;
        }
        return undefined;
    }, [categoryGame]);

    useSeo({
        title: gameName ? `Lives ${gameName}` : 'Lives par jeu',
        description: gameName
            ? `Regarde les chaînes VTuber FR et QC en direct sur ${gameName} et consulte les stats de la catégorie.`
            : 'Découvre les chaînes VTuber francophones en live par catégorie de jeu avec les statistiques TwitchTracker.',
        canonicalPath,
        image: coverUrl
    });

    const getGamesOnLive = async () => {
        setOnlineStreamers(await API.getOnlineStreamersInCategory(params.gameID));
        setCategoryGame(await API.getGamesInfoInCategory(params.gameID));
    }

    useEffect(() => {

        //console.log("useEffect()");
        getGamesOnLive();
        const controller = new AbortController();
        const fetchTracker = async () => {
            if (!params?.gameID) return;
            try {
                const res = await fetch(`https://twitchtracker.com/api/games/summary/${encodeURIComponent(params.gameID)}`, {
                    signal: controller.signal
                });
                if (!res.ok) return;
                const data = await res.json();
                setTrackerSummary(data);
            } catch (e) {
                // ignore errors
            }
        };
        fetchTracker();
        return () => controller.abort();
  
    }, [params?.gameID])

    //console.log(categoryGame);

    return (
    <>        
        
        {categoryGame.length > 0 && <div className={styles["game-category-wrapper"]}>
            <div className={styles["game-cover"]}>
                <img src={coverUrl} alt={categoryGame[0].game_name} />
            </div>
            <div className={styles['game-wrapper']}>
                <div className={styles['title-game']}>{categoryGame[0].game_name}</div>
                <div className={styles['title-viewer']}>
                    <span>{Number(categoryGame[0].game_views ?? 0).toLocaleString('fr-FR')} Viewers</span>
                </div>
            </div>
        </div>}

        {trackerSummary && (
            <div className={styles.trackerPanel}>
                <div className={styles.trackerHeader}>
                    <span className={styles.trackerTitle}>TwitchTracker (30 jours - global)</span>
                    {trackerSummary.rank !== undefined && <span className={styles.trackerPill}>#{formatNumber(trackerSummary.rank)}</span>}
                </div>
                <div className={styles.trackerGrid}>
                    {trackerSummary.avg_viewers !== undefined && (
                        <div className={styles.trackerCard}>
                            <span className={styles.trackerLabel}>Avg viewers</span>
                            <span className={styles.trackerValue}>{formatNumber(trackerSummary.avg_viewers)}</span>
                        </div>
                    )}
                    {trackerSummary.avg_channels !== undefined && (
                        <div className={styles.trackerCard}>
                            <span className={styles.trackerLabel}>Canaux moyens</span>
                            <span className={styles.trackerValue}>{formatNumber(trackerSummary.avg_channels)}</span>
                        </div>
                    )}
                    {trackerSummary.hours_watched !== undefined && (
                        <div className={styles.trackerCard}>
                            <span className={styles.trackerLabel}>Heures watchées</span>
                            <span className={styles.trackerValue}>{formatNumber(trackerSummary.hours_watched)} h</span>
                        </div>
                    )}
                </div>
            </div>
        )}

        { onlineStreamers && <>
        
        <h3>Chaînes en <span className={styles["title-highlight"]}>live</span></h3>

        <div className={styles["stream-carousel"]}>
            {onlineStreamers.map((streamer) => { return(<>
                <Channel streamer={streamer} />
            </>)})}
        </div>
        
        </>}
        

    </>
    )
}

export default ShowStreamInSpecificGame
