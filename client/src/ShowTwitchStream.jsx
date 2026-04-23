import { useState, createContext, useEffect } from 'react'
import './App.scss'
import trackerStyles from './ShowTwitchStream.module.scss';

import Navbar from './components/Navbar.jsx';
import Leftbar from './components/Leftbar.jsx';
import Footer from './components/Footer.jsx';

import API from './Api.js';

import ReactTwitchEmbedVideo from "react-twitch-embed-video";

import { useParams } from 'react-router-dom';
import InfoChannelPanel from './InfoChannelPanel.jsx';
import { useSeo } from './components/Seo.jsx';

const formatNumber = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '-';
    }
    return value.toLocaleString('fr-FR');
};

const formatHoursFromMinutes = (minutes) => {
    if (!Number.isFinite(minutes)) return null;
    const hours = minutes / 60;
    return `${hours.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} h streamées`;
};

function ShowTwitchStream() {

    let params = useParams();

    const [userInfo, setUserInfo] = useState([]);
    const [trackerSummary, setTrackerSummary] = useState(null);

    const displayName = userInfo?.display_name ?? userInfo?.name ?? params?.streamerName;
    const lastStream = userInfo?.listLastedStream?.[0];
    const streamTitle = lastStream?.title;
    const gameName = lastStream?.game_name;
    const previewImage = lastStream?.thumbnail_url
        ? lastStream.thumbnail_url.replace('{width}', '1200').replace('{height}', '675')
        : userInfo?.profile_image_url;

    useSeo({
        title: displayName ? `${displayName} en live` : 'Stream VTuber francophone',
        description: displayName
            ? `${displayName} est en direct${gameName ? ` sur ${gameName}` : ''} sur FRVStream. ${streamTitle ?? 'Découvre le stream et le profil VTuber.'}`
            : 'Regarde un stream VTuber francophone en direct sur FRVStream.',
        canonicalPath: params?.streamerName ? `/c/${encodeURIComponent(params.streamerName)}` : '/c',
        image: previewImage,
        type: 'video.other'
    });

    const getUserInfo = async () => {

        setUserInfo( JSON.parse(JSON.stringify(await API.getStreamer(params.streamerName) )) );
    
    }

    useEffect(() => {
        getUserInfo();
  
    }, [params.streamerName])

    useEffect(() => {
        if (!userInfo?.id) {
            return;
        }
        const lastStream = userInfo?.listLastedStream?.[0];
        API.trackClick({
            vtuberId: userInfo.id,
            streamId: lastStream?.id ?? lastStream?.stream_id
        });
    }, [userInfo]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchTracker = async () => {
            if (!params?.streamerName) return;
            try {
                const res = await fetch(`https://twitchtracker.com/api/channels/summary/${encodeURIComponent(params.streamerName)}`, {
                    signal: controller.signal
                });
                if (!res.ok) return;
                const data = await res.json();
                setTrackerSummary(data);
            } catch (e) {
                // ignore errors (possible CORS or rate limit)
            }
        };
        fetchTracker();
        return () => controller.abort();
    }, [params?.streamerName]);

    return (
    <>        
        {params.streamerName && <>
            <ReactTwitchEmbedVideo channel={params.streamerName} width="480" height="650" targetClass="layoutTwitch"/>
        </>}

        {userInfo && <InfoChannelPanel streamer={userInfo}/>}
        {trackerSummary && (
            <div className={trackerStyles.trackerWrapper}>
                <div className={trackerStyles.trackerHeader}>
                    <h4>TwitchTracker (30 jours)</h4>
                    {trackerSummary.rank !== undefined && <span className={trackerStyles.trackerPill}>#{formatNumber(trackerSummary.rank)}</span>}
                </div>
                <div className={trackerStyles.trackerGrid}>
                    {trackerSummary.avg_viewers !== undefined && (
                        <div className={trackerStyles.trackerCard}>
                            <span className={trackerStyles.trackerLabel}>Avg viewers</span>
                            <span className={trackerStyles.trackerValue}>{formatNumber(trackerSummary.avg_viewers)}</span>
                        </div>
                    )}
                    {trackerSummary.max_viewers !== undefined && (
                        <div className={trackerStyles.trackerCard}>
                            <span className={trackerStyles.trackerLabel}>Pic viewers</span>
                            <span className={trackerStyles.trackerValue}>{formatNumber(trackerSummary.max_viewers)}</span>
                        </div>
                    )}
                    {trackerSummary.minutes_streamed !== undefined && (
                        <div className={trackerStyles.trackerCard}>
                            <span className={trackerStyles.trackerLabel}>Temps stream</span>
                            <span className={trackerStyles.trackerValue}>{formatHoursFromMinutes(trackerSummary.minutes_streamed)}</span>
                        </div>
                    )}
                    {trackerSummary.hours_watched !== undefined && (
                        <div className={trackerStyles.trackerCard}>
                            <span className={trackerStyles.trackerLabel}>Heures watchées</span>
                            <span className={trackerStyles.trackerValue}>{formatNumber(trackerSummary.hours_watched)} h</span>
                        </div>
                    )}
                    {trackerSummary.followers !== undefined && (
                        <div className={trackerStyles.trackerCard}>
                            <span className={trackerStyles.trackerLabel}>Delta followers</span>
                            <span className={trackerStyles.trackerValue}>{formatNumber(trackerSummary.followers)}</span>
                        </div>
                    )}
                </div>
            </div>
        )}

    </>
    )
}

export default ShowTwitchStream
