import React, { useContext } from 'react';

import './App.scss';
import StreamerCard from './components/StreamerCard.jsx';
import { Context } from './App.jsx';
import { useSeo } from './components/Seo.jsx';

import logoQC from './assets/vqc_banner.png';
import logoQCMobile from './assets/vtubersqc-logo.png';

function QuebecersChannels() {

    const [frStreamers, qcStreamers] = useContext(Context);

    useSeo({
        title: 'VTubers québécois',
        description: 'Découvre les créateurs virtuels québécois répertoriés sur FRVStream et rejoins la communauté VtuberQC.',
        canonicalPath: '/quebecers-channels'
    });

    return (
    <>
        <img className="logo-team-qc" src={logoQC} alt="VtuberQC" />
        <img className="logo-team-qc-mobile" src={logoQCMobile} alt="VtuberQC logo" />

        <div>Envie de rejoindre la liste des créateurs virtuels québécois ? <a className="link" href="https://discord.gg/wy8myFCZ8v" target="_blank" rel="noreferrer">Rejoins le serveur VtuberQC</a></div>
        
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
