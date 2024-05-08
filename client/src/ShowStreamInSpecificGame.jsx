import React, { useState, useEffect } from 'react';

import './App.scss';
import './ShowStreamInSpecificGame.scss';
import API from './Api.js';

import Channel from './components/Channel.jsx';

import Navbar from './components/Navbar.jsx';
import Leftbar from './components/Leftbar.jsx';
import Footer from './components/Footer.jsx';

import ReactTwitchEmbedVideo from "react-twitch-embed-video";

import { useParams } from 'react-router-dom';

function ShowStreamInSpecificGame() {

    let params = useParams();

    const [categoryGame, setCategoryGame] = useState([]);
    const [onlineStreamers, setOnlineStreamers] = useState([]);

    const getGamesOnLive = async () => {
        setOnlineStreamers(await API.getOnlineStreamersInCategory(params.gameID));
        setCategoryGame(await API.getGamesInfoInCategory(params.gameID));
    }

    useEffect(() => {

        console.log("useEffect()");
        getGamesOnLive();
  
    }, [])

    //console.log(categoryGame);

    return (
    <>        
        
        {categoryGame.length > 0 && <div className="game-category-wrapper">
            <div className="game-cover">
                <img src={`https://static-cdn.jtvnw.net/ttv-boxart/${categoryGame[0].game_name}-285x380.jpg`} alt={categoryGame[0].game_name} />
            </div>
            <div className='game-wrapper'>
                <div className='title-game'>{categoryGame[0].game_name}</div>
                <div className='title-viewer'><span>{categoryGame[0].game_views} Viewers</span></div>
            </div>
        </div>}

        { onlineStreamers && <>
        
        <h3>Chaînes en <span class="title-highlight">live</span></h3>

        <div class="stream-carousel">
            {onlineStreamers.map((streamer) => { return(<>
                <Channel streamer={streamer} />
            </>)})}
        </div>
        
        </>}
        

    </>
    )
}

export default ShowStreamInSpecificGame
