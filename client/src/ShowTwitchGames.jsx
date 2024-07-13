import React, { useState, useEffect } from 'react';
//import '@ptkdev/webcomponent-patreon-box';
import './App.scss';

import API from './Api.js';
import Channel from './components/Channel.jsx';
import GameDirectory from './components/GameDirectory.jsx';

function ShowTwitchGames() {

    const [gamesOnLive, setGamesOnLive] = useState([]);

    const getGamesOnLive = async () => {
        setGamesOnLive(await API.getGamesOnLive());
    }

    useEffect(() => {

        //console.log("useEffect()");
        getGamesOnLive();
  
    }, [])

    return (
    <>

        <h3>Jeux en lignes</h3>

        {gamesOnLive.length > 0 && <GameDirectory gamesOnLive={gamesOnLive}/>}

    </>
    )
}

export default ShowTwitchGames
