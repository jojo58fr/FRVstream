import React, { useContext } from 'react';
import { Outlet, Link } from "react-router-dom";
import '../App.scss';

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
            <div class="stream">
                <Link to={`/c/` + streamerObj.name}>
                    <div class="stream-thumbnail">
                        <span class="live">LIVE</span>
                        <img src={lastStreamThumbnail} alt="Overwatch" />
                        <span class="viewers">{lastStream.viewer_count} Vues</span>
                    </div>
                </Link>
                <div class="stream-info">
                    <div class="stream-profile-avatar">
                        <Link to={`/c/` + streamerObj.name}><img src={streamerObj.logo} alt={streamerObj.display_name} /></Link>
                    </div>
                    <div class="stream-text">
                        <Link to={`/c/` + streamerObj.name}><p class="stream-title">
                            {lastStream.title}
                        </p></Link>
                        <Link to={`/c/` + streamerObj.name}><p class="stream-host">{streamerObj.display_name}</p></Link>
                        <Link to={`/d/g/${encodeURIComponent(lastStream.game_name)}`}><p class="stream-game">{lastStream.game_name}</p></Link>
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
