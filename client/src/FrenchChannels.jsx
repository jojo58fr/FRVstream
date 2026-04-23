import React, { useContext } from 'react';

import './App.scss';
import StreamerCard from './components/StreamerCard.jsx';
import { Context } from './App.jsx';
import { useSeo } from './components/Seo.jsx';

import logoFR from './assets/FRVtubers_long.png';

function FrenchChannels() {

    const [frStreamers] = useContext(Context);

    useSeo({
        title: 'VTubers francophones',
        description: 'Parcours la liste des créateurs virtuels francophones référencés sur FRVStream et rejoins la communauté FRVtubers.',
        canonicalPath: '/french-channels'
    });

    return (
    <>        
        <img className="logo-team-fr" src={logoFR} alt="FRVtubers" />
        <div>Envie de rejoindre la liste des créateurs virtuels francophones ? <a className="link" href="https://discord.gg/meyHQYWvjU" target="_blank">Rejoins le serveur FRVtubers</a></div>
        
        <div className="card-wrapper">
            {frStreamers && frStreamers.map((streamer) => {                   
                // Return the element. Also pass key     
                return (<StreamerCard streamer={streamer} />);
            })}
        </div>
    </>
    )
}

export default FrenchChannels
