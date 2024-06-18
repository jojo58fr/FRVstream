import { useState, useEffect } from 'react'
import './App.scss'

import Navbar from './components/Navbar.jsx';
import Leftbar from './components/Leftbar.jsx';
import Footer from './components/Footer.jsx';

import API from './Api.js';

import ReactTwitchEmbedVideo from "react-twitch-embed-video";

import { useParams } from 'react-router-dom';


function RandomChannel() {

    const [randomStreamer, setRandomStreamer] = useState("");

    const getRandomStreamer = async() => {
        setRandomStreamer(await API.getRandomStreamer());
    }
    
    useEffect(() => {
    
        getRandomStreamer();
    
    }, [])

    //console.log(randomStreamer);
    return (
    <>        
        {randomStreamer && <ReactTwitchEmbedVideo channel={randomStreamer.name} width="480" height="650" targetClass="layoutTwitch"/>}
    </>
    )
}

export default RandomChannel
