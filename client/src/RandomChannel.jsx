import { useState, useEffect, useCallback } from 'react'
import './App.scss'

import API from './Api.js';

import ReactTwitchEmbedVideo from "react-twitch-embed-video";
import { useSeo } from './components/Seo.jsx';


function RandomChannel() {

    const [randomStreamer, setRandomStreamer] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useSeo({
        title: 'Découverte aléatoire',
        description: 'Lance une découverte aléatoire et trouve de nouveaux VTubers francophones à suivre sur FRVStream.',
        canonicalPath: '/random-channel'
    });

    const getRandomStreamer = useCallback(async() => {
        setIsLoading(true);
        try {
            setRandomStreamer(await API.getRandomStreamer());
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
    
        getRandomStreamer();
    
    }, [getRandomStreamer])

    //console.log(randomStreamer);
    return (
    <div className="random-discover">
        <div className="random-discover__actions">
            <button
                type="button"
                className="random-discover__button"
                onClick={getRandomStreamer}
                disabled={isLoading}
            >
                {isLoading ? 'Recherche en cours...' : 'Découvrir une nouvelle chaîne'}
            </button>
        </div>
        {randomStreamer
            ? <ReactTwitchEmbedVideo channel={randomStreamer.name} width="480" height="650" targetClass="layoutTwitch"/>
            : <p className="random-discover__placeholder">Chargement de la chaîne...</p>
        }
    </div>
    )
}

export default RandomChannel
