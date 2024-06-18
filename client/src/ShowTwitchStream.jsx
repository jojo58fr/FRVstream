import { useState, createContext, useEffect } from 'react'
import './App.scss'

import Navbar from './components/Navbar.jsx';
import Leftbar from './components/Leftbar.jsx';
import Footer from './components/Footer.jsx';

import API from './Api.js';

import ReactTwitchEmbedVideo from "react-twitch-embed-video";

import { useParams } from 'react-router-dom';
import InfoChannelPanel from './InfoChannelPanel.jsx';

function ShowTwitchStream() {

    let params = useParams();

    const [userInfo, setUserInfo] = useState([]);

    const getUserInfo = async () => {

        setUserInfo( JSON.parse(JSON.stringify(await API.getStreamer(params.streamerName) )) );
    
    }

    if(userInfo.name !== params.streamerName)
    {
        getUserInfo();
    }

    useEffect(() => {
        
        getUserInfo();
  
    }, [])

    console.log("userInfo", userInfo);

    return (
    <>        
        {params.streamerName && <>
            <ReactTwitchEmbedVideo channel={params.streamerName} width="480" height="650" targetClass="layoutTwitch"/>
        </>}

        {userInfo && <InfoChannelPanel streamer={userInfo}/>}

    </>
    )
}

export default ShowTwitchStream
