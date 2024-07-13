import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../App.jsx';

import { Outlet, Link } from "react-router-dom";

import '../App.scss';

function StreamerCard(streamer) {

    let streamerObj = streamer.streamer;
    //if(streamerObj.isStreaming) console.log(streamer);
    
    let lastStream = null;
    let lastStreamThumbnail = null;
    if(streamerObj.isStreaming)
    {
        
        lastStream = streamerObj.listLastedStream[0];
    
        //https://static-cdn.jtvnw.net/previews-ttv/live_user_charlotteadventures-{width}x{height}.jpg
        lastStreamThumbnail = lastStream.thumbnail_url.replace("{width}", "1920");
        lastStreamThumbnail = lastStreamThumbnail.replace("{height}", "1080");
    }

    

    return (
        <div className={streamerObj.isStreaming ? "card onLive": "card"}>
            { lastStreamThumbnail && <div style={{background: `url(${lastStreamThumbnail})`, backgroundSize: 'cover'}} className="bg"></div>}
            { lastStreamThumbnail && <div className="bg2"></div>}
            <div className="card-container">
                <Link to={`/c/` + streamerObj.name}>
                <img className="card-img" src={streamerObj.logo} alt="Avatar"/>
                <div className="name">
                    <h4><b>{streamerObj.display_name}</b></h4>
                </div>
                </Link>
                {streamerObj.isStreaming && <>
                    <Link to={`/c/` + streamerObj.name}>
                        <div className="profile-viewers">
                                <div className="live-icon"></div>
                                <div className="viewer-count">{lastStream.viewer_count}</div>
                        </div>
                        <div className="title-stream">{lastStream.title}</div>
                    </Link>
                    <Link to={`/d/g/${encodeURIComponent(lastStream.game_name)}`}>
                        <div className="game-stream">🎮 {lastStream.game_name}</div>
                    </Link>
                </>}
                <div>
                    
                </div>
            </div>
        </div> 
    
    )
}

export default StreamerCard
