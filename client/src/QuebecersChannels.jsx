import React, { useContext } from 'react';

import './App.scss';
import StreamerCard from './components/StreamerCard.jsx';
import { Context } from './App.jsx';

import logoQC from './assets/vtubersqc-teams.jpeg';
import logoQCMobile from './assets/vtubersqc-logo.png';

function QuebecersChannels() {

    const [frStreamers, qcStreamers] = useContext(Context);

    console.log(qcStreamers);

    return (
    <>
        <img className="logo-team-qc" src={logoQC}></img>
        <img className="logo-team-qc-mobile" src={logoQCMobile}></img>

        <div>Envie de rejoindre la liste des créateurs virtuels québécois ? <a className="link" href="https://discord.gg/wy8myFCZ8v" target="_blank">Rejoins le serveur VtuberQC</a></div>
        
        <div className="card-wrapper">
            {qcStreamers && qcStreamers.map((streamer) => {                   
                // Return the element. Also pass key     
                return (<StreamerCard streamer={streamer} />);
            })}
        </div>
    </>
    )
}

export default QuebecersChannels
