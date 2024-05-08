import { useState, createContext } from 'react'
import './App.scss'

import Navbar from './components/Navbar.jsx';
import Leftbar from './components/Leftbar.jsx';
import Footer from './components/Footer.jsx';

import ReactTwitchEmbedVideo from "react-twitch-embed-video";

import { useParams } from 'react-router-dom';

function ShowTwitchStream() {

    let params = useParams();

    return (
    <>        
        {params.streamerName && <ReactTwitchEmbedVideo channel={params.streamerName} targetClass="layoutTwitch"/>}
    </>
    )
}

export default ShowTwitchStream
