import React, { useState, useEffect, useContext } from 'react';
//import '@ptkdev/webcomponent-patreon-box';
import './App.scss';

import API from './Api.js';
import Channel from './components/Channel.jsx';
import GameDirectory from './components/GameDirectory.jsx';

import { Context } from './App.jsx';
import { EventContext } from './App.jsx';
import { LoginContext } from './App.jsx';

import { Outlet, Link } from "react-router-dom";

import logoFRMobile from './assets/FRVtubers_Vstream.png';
import CarouselEvent from './CarouselEvent.jsx';

function HomePage() {

    const [gamesOnLive, setGamesOnLive] = useState([]);
    const [frStreamers, qcStreamers, actualChannel, setActualChannel, onlineStreamers] = useContext(Context);
    
    const [lastedEvents, initialEvents] = useContext(EventContext);

    const [loading, setLoading] = useState(true);
    
    const getGamesOnLive = async () => {
        setGamesOnLive(await API.getGamesOnLive());

        setLoading(false);
    }

    useEffect(() => {

        getGamesOnLive();

        testLogin();
  
    }, [])

    function shuffledArray(array) {
        // Créer une copie du tableau pour ne pas modifier l'original
        const newArray = [...array];
        
        // Fonction de tri aléatoire
        newArray.sort(() => Math.random() - 0.5);
        
        return newArray;
    }

    const testLogin = async () => {
        /*let reg = await UniversalLoginSystem.request_register("HenryLP", "123soleil", "henryLP@gmail.com");
        console.log("reg:", reg);

        let login = await UniversalLoginSystem.request_login("HenryP", "123soleil");
        console.log("login:", login);

        let iL = await UniversalLoginSystem.request_status();
        console.log("iL:", iL);
        setIsLogged(iL);*/
        
    }

    return (
    <>

        <div className="mobile-title">
            <Link to={`/`}><img className="logo-mobile" src={logoFRMobile}></img></Link>
        </div>

        {lastedEvents?.length > 0 && <>
            <h3>Les évènements qui pourraient <Link to={`./events`}><span class="title-highlight">vous intéresser</span></Link></h3>
            <CarouselEvent initialEvents={lastedEvents}></CarouselEvent>
        </>}
        
        {gamesOnLive?.length > 0 && <>
            <h3>Jeux qui pourraient <Link to={`./d`}><span class="title-highlight">vous plaire</span></Link></h3>
            <GameDirectory gamesOnLive={gamesOnLive}/>
        </>}

        {onlineStreamers?.length > 0 && <>
            <h3>Quelques créateurs <Link to={`./french-channels`}><span class="title-highlight">francophones</span></Link></h3>
            <div class="stream-carousel">
                {shuffledArray(onlineStreamers).slice(0,5).map((streamer) => { return(<>
                    <Channel streamer={streamer} />
                </>)})}
            </div>
        </>}

        {!loading && onlineStreamers?.length == 0 && <>Pas de stream disponible.</>}

    </>
    )
}

export default HomePage
