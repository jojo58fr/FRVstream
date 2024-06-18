import React, { useState, useEffect, useContext } from 'react';
import { Outlet, NavLink } from "react-router-dom";

import { Context } from '../App.jsx';

import '../App.scss';

function LeftbarStreamerComponent(streamer) {

    const [frStreamers, qcStreamers, actualChannel, setActualChannel, onlineStreamers] = useContext(Context);

    let streamerObj = streamer.streamer;
    //if(streamerObj.isStreaming) console.log(streamer);
    
    let lastStream = null;
    if(streamerObj.isStreaming)
    {
        lastStream = streamerObj.listLastedStream[0];
    }

    console.log("actualChannel:", actualChannel);

    return (
    <NavLink className={(navData) => (navData.isActive ? 'active' : '')} to={`/c/` + streamerObj.name}>
        <div className="followed-channel" onClick={() => {setActualChannel(streamerObj.name)}}>
            <div className="profile-image">
                <img src={streamerObj.logo} alt={streamerObj.name} />
            </div>
            <div className="profile-info">
                <p className="profile-username">{streamerObj.display_name}</p>
                {streamerObj.isStreaming && <p className="profile-game-title">{lastStream.game_name}</p>}
            </div>
            <div className="profile-viewers">
                {streamerObj.isStreaming && <div className="live-icon"></div>}
                {streamerObj.isStreaming && <div className="viewer-count">{lastStream.viewer_count}</div>}
            </div>
        </div>
    </NavLink>
    )
}

export default LeftbarStreamerComponent
