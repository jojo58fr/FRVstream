import React, { useState, useEffect, useRef, useContext } from 'react';

import './tooltip.css';
import './App.scss';
import styles from './InfoChannelPanel.module.scss';
import API from './Api.js';

import { useParams } from 'react-router-dom';
import { Outlet, Link } from "react-router-dom";

import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
//import 'primeicons/primeicons.css';

import { DateTime as luxon } from 'luxon';

function InfoChannelPanel(streamer) {

    let [collabPeople, setCollabPeople] = useState(null);

    let streamerObj = streamer.streamer;
    
    let lastStream = null;
    let usernames = null;

    console.log("collabPeople", collabPeople);

    const getCollabPeople = async () => {

        const tmpCollabPeople = [];
        
        for (let i = 0; i < usernames.length; i++) {
            let cleanedUsername = usernames[i].slice(1);

            let ppl = await API.getStreamer(cleanedUsername);

            if (ppl != null)
                tmpCollabPeople.push(ppl);
        }

        console.log("tmpCollabPeople", tmpCollabPeople);

        if(collabPeople == null)
        {
            setCollabPeople( JSON.parse(JSON.stringify(tmpCollabPeople)) );
        }
        else
        {
            if(JSON.stringify(collabPeople) !== JSON.stringify(tmpCollabPeople))
            {
                setCollabPeople( JSON.parse(JSON.stringify(tmpCollabPeople)) );
            }
        }
    }

    let linkToMultiview = null;
    if(streamerObj.isStreaming)
    {
        lastStream = streamerObj.listLastedStream[0];

        // Expression régulière pour capturer les mentions @pseudo
        let pattern = /@\w+/g;
    
        // Utilisation de match pour récupérer toutes les correspondances
        
        usernames = lastStream.title.match(pattern);

        if(usernames != null)
        {
            let cleanedUsernames = usernames.map(username => username.slice(1));
            linkToMultiview = cleanedUsernames.join("/");
    
            getCollabPeople();
        }
        else
        {
            if(collabPeople != null)
                setCollabPeople(null);
        }
    }


    // Affichage des résultats
    console.log("username", usernames);

    const toast = useRef(null);
    
    function copyToClipboard(text) {
        // Vérifier si l'API Clipboard est disponible
        if (navigator.clipboard && navigator.clipboard.writeText) {
            
            // Utiliser l'API Clipboard pour écrire le texte dans le presse-papiers
            navigator.clipboard.writeText(text).then(() => {
                toast.current.show({ severity: 'info', summary: 'Info', detail: 'Commande de raid copiée' });
            }).catch(err => {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Erreur lors de la copie de texte' });
            });

        } else {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'L\'API Clipboard n\'est pas supportée dans ce navigateur.' });
        }
    }

    const show = () => {
        copyToClipboard(`/raid ${streamerObj.name}`);
    };

    return (
    <>
        <Toast ref={toast} />
        
        
        <div className={ styles['channel-profil-wrapper'] }>
            {usernames && <div className={ styles['channel-profil-collabs'] }>
                <div className={ styles['cp-text-collab-wrapper'] }>
                    {collabPeople && <span className={ styles['cp-text-collab-colored'] }>Avec:</span>}
                    {collabPeople && collabPeople.map((coPpl) => {                   
                        // Return the element. Also pass key     
                        return (<div className={ styles["collab-user"] }>
                            <a target="_blank" rel="nofollow noreferrer noopener" class="external text" href={`https://www.twitch.tv/${coPpl.name}`}>
                                <div className={ styles["profile-image-small"] }>
                                    <img src={coPpl.logo} alt={coPpl.name} />
                                </div>
                                <span>{coPpl.name}</span>
                            </a>
                        </div>);
                    })}
                </div>
            </div>}
            <div className={ styles['channel-profil-infos'] }>
                <div className={ styles["profile-image"] }>
                    <img src={streamerObj.logo} alt={streamerObj.name} />
                </div>
                <div className={ styles['cp-left'] }>
                    <div className={ styles['cp-channelName'] }>
                        <a target="_blank" rel="nofollow noreferrer noopener" class="external text" href={`https://www.twitch.tv/${streamerObj.name}`}>
                            <h3>{streamerObj.display_name}</h3>
                        </a>
                        <div className="tooltip-right" data-tooltip={`Chaîne crée le ${luxon.fromISO(streamerObj.created_at).toFormat("dd LLL yyyy", { locale: "fr" })}`} ><i className="pi pi-info-circle"></i></div>
                    </div>
                    {lastStream && <span>{lastStream.title}</span>}
                </div>
                <div className={ styles['cp-right'] }>
                    <Button label="Copier la commande de Raid" onClick={show} style={{gap: "10px", color: "white"}} icon="pi pi-twitch" />
                    {usernames && <Link to={`/multiview/${streamerObj.name}/${linkToMultiview}`}><Button label="Voir les autres créateurs (Vue multiples)" onClick={show} style={{gap: "10px", color: "white", width: "100%"}} icon="pi pi-table" /></Link>}
                </div>
            </div>
        </div>
    </>
    )
}

export default InfoChannelPanel
