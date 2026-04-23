import React, { useContext } from 'react';

import './App.scss';
import StreamerCard from './components/StreamerCard.jsx';
import { Context } from './App.jsx';
import { useSeo } from './components/Seo.jsx';

import logoFRVMON from './assets/logo_frv_pixel.png';

function FrvmonEventChannels() {

    const [, , frvmonStreamers, , , ] = useContext(Context);

    useSeo({
        title: 'VTubers Participants',
        description: 'Parcours la liste des créateurs virtuels FR & QC référencés sur FRVStream et rejoins la communauté FRVtubers qui participent à l\'évenement FrvMon.',
        canonicalPath: '/frvmon-event-channels'
    });

    return (
    <>        
        <img className="logo-team-fr" src={logoFRVMON} alt="FRVtubers" />
        <div>Envie de rejoindre les participants ? <a className="link" href="https://discord.gg/meyHQYWvjU" target="_blank">Rejoins le serveur FRVtubers</a></div>
        
        <div className="card-wrapper">
            {frvmonStreamers && frvmonStreamers.map((streamer) => {
                // Return the element. Also pass key     
                return (<StreamerCard streamer={streamer} />);
            })}
        </div>
    </>
    )
}

export default FrvmonEventChannels
