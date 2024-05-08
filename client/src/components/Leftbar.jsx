import React, { useState, useEffect, useContext } from 'react';

import '../App.scss';
import API from '../Api.js';
import LeftbarStreamerComponent from './LeftbarStreamerComponent.jsx';
import { Context } from '../App.jsx';
import { Outlet, Link } from "react-router-dom";

import FlagFR from '../assets/fr_flag.png';
import logoFRMobile from '../assets/FRVtubersLogo.png';

let oldNumberOfFRStreamerShown = 5;
let oldNumberOfQCStreamerShown = 5;

function Leftbar() {

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [numberOfFRStreamerShown, setNumberOfFRStreamerShown] = useState(5);
    const [numberOfQCStreamerShown, setNumberOfQCStreamerShown] = useState(5);

    const [frStreamers, qcStreamers] = useContext(Context);

    //console.log("qcStreamers");
    //console.log(qcStreamers);

    useEffect(() => {

        console.log("useEffect()");

        const handleResize = () => {
            // Perform actions on window resize
            if(window.innerWidth < 1305) {
                oldNumberOfFRStreamerShown = numberOfFRStreamerShown;
                oldNumberOfQCStreamerShown = numberOfQCStreamerShown;
                setNumberOfFRStreamerShown(99999999);
                setNumberOfQCStreamerShown(99999999);
            }
            else {
                setNumberOfFRStreamerShown(oldNumberOfFRStreamerShown);
                setNumberOfQCStreamerShown(oldNumberOfQCStreamerShown);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, [])


    //console.log("HEY HEY>");
    //console.log(numberOfQCStreamerShown);
    //console.log(qcStreamers.slice(0, numberOfQCStreamerShown));
    return (
    <>
        <div className="streamer-bar">

            <div className="mobile-title">
                <Link to={`/`}><img className="logo-mobile" src={logoFRMobile}></img></Link>
            </div>

            <div className="streamer-bar-title" style={{display: "none"}}>
                <p className="desktop-title">Chaines Suivis ❤</p>
                <p className="mobile-title">❤</p>
            </div>

            <div className="followed-channels" style={{display: "none"}}>
                <div className="followed-channel">
                    <div className="profile-image">
                        <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/a28eeb53-d80d-4bd2-8d85-d2f65fa8ba1e-profile_image-70x70.png" alt="A_Seagull" />
                    </div>
                    <div className="profile-info">
                        <p className="profile-username">TakuDev</p>
                        <p className="profile-game-title">Mario Kart 8 Deluxe</p>
                    </div>
                    <div className="profile-viewers">
                        <div className="live-icon"></div>
                        <div className="viewer-count">32</div>
                    </div>
                </div>




                <div className="followed-channel">
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/89ccba82-3058-42cd-ac9e-acd1c4b88cdf-profile_image-70x70.png" alt="Fitzyhere" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">Lunahyu</p>
                    <p className="profile-game-title">KinitoPET</p>
                </div>
                <div className="profile-viewers">
                    <div className="live-icon"></div>
                    <div className="viewer-count">28</div>
                </div>
                </div>
                <div className="followed-channel">
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/258204a8-ab11-4488-9566-a0ce3e7a95ec-profile_image-70x70.png" alt="FRAN" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">MissFlamme</p>
                    <p className="profile-game-title">Chaine offline</p>
                </div>
                </div>
                <div className="followed-channel">
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/28b2f409-63f8-4816-8231-d01f338a4d2f-profile_image-70x70.png" alt="MMB" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">MyMikuBot</p>
                    <p className="profile-game-title">1 Nouvelle vidéo</p>
                </div>
                <div className="profile-viewers">
                    {/* <!-- <div className="viewer-count">Online</div> --> */}
                </div>
                </div>
            </div>
        {/* <br />
        <small>Voir plus...</small> 
        <br />*/}

            <div className="streamer-bar-title">
                <p className="desktop-title">Chaines FRVtubers <img width="15px" style={{borderRadius: "2px"}} src={FlagFR} alt="FR Logo" /></p>
                <p className="mobile-title"><img width="20px" style={{borderRadius: "3px"}} src={FlagFR} alt="FR Logo" /></p>
            </div>
            <div className="followed-channels">

                {frStreamers && frStreamers.slice(0, numberOfFRStreamerShown).map((streamer) => {                   
                    // Return the element. Also pass key     
                    return (<LeftbarStreamerComponent streamer={streamer} />);
                })}

            </div>
            {(numberOfFRStreamerShown < frStreamers.length) && <>
                <br />
                <small onClick={() => {setNumberOfFRStreamerShown(numberOfFRStreamerShown+10)}}>Voir plus...</small>
                <br />
                </>
            }

            <div className="streamer-bar-title">
                <p className="desktop-title">Chaines VtuberQC ⚜️</p>
                <p className="mobile-title">⚜️</p>
            </div>
            <div className="followed-channels">
                {qcStreamers && qcStreamers.slice(0, numberOfQCStreamerShown).map((streamer) => {                   
                    // Return the element. Also pass key     
                    return (<LeftbarStreamerComponent streamer={streamer}/>);
                })}
            </div>
            {(numberOfQCStreamerShown < qcStreamers.length) && <>
                <br />
                <small onClick={() => {setNumberOfQCStreamerShown(numberOfQCStreamerShown+10)}}>Voir plus...</small>
                <br />
                </>
            }
            
            <div className="patreon-text">Merci à tous ceux qui soutiennent le projet FRVtubers ❤️</div>
            <a className="patreon-button link-button" data-patreon-widget-type="become-patron-button" href="https://www.patreon.com/TakuDev" rel="noreferrer" target="_blank"><svg id="patreon-logo" viewBox="10 0 2560 356" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M1536.54 72.449v76.933h128.24v61.473h-128.24v74.51h128.24v62.921h-206.64V9.529h206.64v62.92h-128.24M2070.82 178.907c0-55.652-37.76-107.434-99.21-107.434-61.95 0-99.21 51.782-99.21 107.434s37.26 107.435 99.21 107.435c61.45 0 99.21-51.783 99.21-107.435zm-278.77 0c0-92.916 66.79-178.093 179.56-178.093 112.26 0 179.05 85.177 179.05 178.093 0 92.916-66.79 178.093-179.05 178.093-112.77 0-179.56-85.177-179.56-178.093zM186.32 131.97c0-31.46-21.299-58.563-54.206-58.563H78.398v117.109h53.716c32.907 0 54.206-27.086 54.206-58.546zM0 9.529h141.788c75.016 0 123.417 56.628 123.417 122.441s-48.401 122.423-123.417 122.423h-63.39v93.893H0V9.529zM492.17 106.314l-41.621 139.382h82.266L492.17 106.314zm73.081 241.972-13.054-41.134H431.69l-13.072 41.134h-83.73L455.882 9.529h72.105l122.442 338.757h-85.178zM782.055 77.277H705.61V9.529h231.793v67.748h-76.951v271.009h-78.397V77.277M2485.08 230.202V9.529h77.91v338.757h-81.78l-121.97-217.78v217.78h-78.4V9.529h81.78l122.46 220.673M1245.68 131.97c0-31.46-21.3-58.563-54.21-58.563h-53.72v117.109h53.72c32.91 0 54.21-27.086 54.21-58.546zM1059.36 9.529h142.29c75 0 123.4 56.628 123.4 122.441 0 47.425-25.17 89.517-67.28 109.369l67.77 106.947h-90.98l-60.03-93.893h-36.78v93.893h-78.39V9.529z"></path></g></svg></a>
        </div>
    </>
    )
}

export default Leftbar
