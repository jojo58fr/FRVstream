import React, { useState, useEffect, createContext } from 'react';
import './App.scss'


import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css';
import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css'; // flex

import Navbar from './components/Navbar.jsx';
import NavbarMobile from './components/NavbarMobile.jsx';
import Leftbar from './components/Leftbar.jsx';
import Footer from './components/Footer.jsx';

import API from './Api.js';
import UniversalLoginSystem from './UniversalLoginSystem/index.js';

import { Outlet } from "react-router-dom";

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import './ShowcaseLayout.scss';

export const Context = createContext('');
export const LoginContext = createContext('');
export const EventContext = createContext('');

function App() {

  const [actualChannel, setActualChannel] = useState();

  const [qcStreamers, setQcStreamers] = useState([]);
  const [frStreamers, setFrStreamers] = useState([]);

  const [onlineStreamers, setOnlineStreamers] = useState([]);
  
  const [initialEvents, setInitialEvents] = useState([]);

  const [lastedEvents, setLastedEvents] = useState([]);

  const [isLogged, setIsLogged] = useState(null);

  const getQCStreamers = async () => {
    setQcStreamers( JSON.parse(JSON.stringify(await API.getQCStreamers())) );
  }

  const getFRStreamers = async () => {
    setFrStreamers( JSON.parse(JSON.stringify(await API.getFrenchStreamers())) );
  }

  const getOnlineStreamers = async () => {
    setOnlineStreamers( JSON.parse(JSON.stringify(await API.getOnlineStreamers())) );
  }

  const getEventsStreamers = async () => {
    setInitialEvents(await API.getEventsStreamers());
  }

  const getLastedEventsStreamers = async () => {
    setLastedEvents(await API.getLastedEventsStreamers());
  }

  const getStatusOnline = async () => {

    //alert("checkLogged");
    console.log("checkLogged", UniversalLoginSystem.isLogged() );
    if(UniversalLoginSystem.isLogged() !== false)
    {
      //alert();
      let rStatus = await UniversalLoginSystem.request_status();

      
      setIsLogged( JSON.parse(JSON.stringify(rStatus)) );

    }
    else
    {
      if(isLogged !== null)
        setIsLogged(null);
    }

  }

  API.onUpdate = function () {
    /*getQCStreamers();
    getFRStreamers();
    getOnlineStreamers();

    getLastedEventsStreamers();
    getEventsStreamers();*/

    getStatusOnline();
  }

  useEffect(() => {

      /*getQCStreamers();
      getFRStreamers();
      getOnlineStreamers();

      getLastedEventsStreamers();
      getEventsStreamers();*/

      getStatusOnline();

  }, [])

  return (
    <Context.Provider value={[frStreamers, qcStreamers, actualChannel, setActualChannel, onlineStreamers]}>
      <LoginContext.Provider value={[isLogged, setIsLogged]}>
        <EventContext.Provider value={[lastedEvents, initialEvents]}>
          <div className="container">
            <Navbar/>
            <div className="main">
              <Leftbar/>

              <div className="stream-content">
                {/* <!-- <div className="home-header">
                <h1 className="home-title">Home</h1>
              </div> --> */}
                {/*<div className="games">
                  <h3>Popular <span className="title-highlight">Games</span></h3>
                  <div className="games-carousel">
                    <div className="game">
                      <div className="game-cover">
                        <img src="https://static-cdn.jtvnw.net/ttv-boxart/./Animal%20Crossing:%20New%20Horizons-285x380.jpg" alt="Animal Crossing" />
                      </div>
                      <div className="game-info">
                        <p className="game-title">Animal Crossing: New Horizons</p>
                        <p className="game-viewership">61.1K Views</p>
                      </div>
                      <div className="game-categories">
                        <span>Simulation</span>
                      </div>
                    </div>
                    <div className="game">
                      <div className="game-cover">
                        <img src="https://static-cdn.jtvnw.net/ttv-boxart/League%20of%20Legends-285x380.jpg" alt="League of Legends" />
                      </div>
                      <div className="game-info">
                        <p className="game-title">League of Legends</p>
                        <p className="game-viewership">186K Views</p>
                      </div>
                      <div className="game-categories">
                        <span>MOBA</span>
                      </div>
                    </div>
                    <div className="game">
                      <div className="game-cover">
                        <img src="https://static-cdn.jtvnw.net/ttv-boxart/World%20of%20Warcraft-285x380.jpg" alt="World of Warcraft" />
                      </div>
                      <div className="game-info">
                        <p className="game-title">World of Warcraft</p>
                        <p className="game-viewership">5.4K Views</p>
                      </div>
                      <div className="game-categories">
                        <span>MMORPG</span>
                        <span>RPG</span>
                      </div>
                    </div>
                    <div className="game">
                      <div className="game-cover">
                        <img src="https://static-cdn.jtvnw.net/ttv-boxart/Overwatch-285x380.jpg" alt="Overwatch" />
                      </div>
                      <div className="game-info">
                        <p className="game-title">Overwatch</p>
                        <p className="game-viewership">18.6K Views</p>
                      </div>
                      <div className="game-categories">
                        <span>FPS</span>
                        <span>MOBA</span>
                      </div>
                    </div>
                    <div className="game">
                      <div className="game-cover">
                        <img src="https://static-cdn.jtvnw.net/ttv-boxart/Mario%20Kart%208-285x380.jpg" alt="Mario Kart 8" />
                      </div>
                      <div className="game-info">
                        <p className="game-title">Mario Kart 8</p>
                        <p className="game-viewership">201K Views</p>
                      </div>
                      <div className="game-categories">
                        <span>Driving/Racing</span>
                      </div>
                    </div>
                    <div className="game">
                      <div className="game-cover">
                        <img src="https://static-cdn.jtvnw.net/ttv-boxart/VALORANT-285x380.jpg" alt="Valorant" />
                      </div>
                      <div className="game-info">
                        <p className="game-title">VALORANT</p>
                        <p className="game-viewership">6.1K Views</p>
                      </div>
                      <div className="game-categories">
                        <span>FPS</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="divider">
                  <div className="bar"></div>
                  <div className="show-more">
                    Show more <i className="fa fa-chevron-down"></i>
                  </div>
                  <div className="bar"></div>
                </div>
                <div className="streams">
                  <h3>
                    <span className="title-highlight">Live Streams</span> We Think You'll
                    Like
                  </h3>
                  <div className="stream-carousel">
                    <div className="stream">
                      <div className="stream-thumbnail">
                        <span className="live">LIVE</span>
                        <img src="https://raw.githubusercontent.com/acupoftee/100-Projects-for-100-Days/master/day3_stream_site/assets/eeveea.jpg" alt="Overwatch" />
                        <span className="viewers">230 viewers</span>
                      </div>
                      <div className="stream-info">
                        <div className="stream-profile-avatar">
                          <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/f8964551-4fe4-4db9-adaf-5735ed378521-profile_image-50x50.png" alt="eeveea_" />
                        </div>
                        <div className="stream-text">
                          <p className="stream-title">
                            When comp gives you no mercy ....
                          </p>
                          <p className="stream-host">EeveeA_</p>
                          <p className="stream-game">Overwatch</p>
                          <div className="game-categories">
                            <span>LGBTQIA+</span>
                            <span>English</span>
                            <span>AMA</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="stream">
                      <div className="stream-thumbnail">
                        <span className="live">LIVE</span>
                        <img src="https://raw.githubusercontent.com/acupoftee/100-Projects-for-100-Days/master/day3_stream_site/assets/emongg.jpg" alt="Overwatch" />
                        <span className="viewers">9.2K viewers</span>
                      </div>
                      <div className="stream-info">
                        <div className="stream-profile-avatar">
                          <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/10c36ad0a4756df8-profile_image-50x50.png" alt="Emongg" />
                        </div>
                        <div className="stream-text">
                          <p className="stream-title">
                            OW then Valorant Beta !Drops at 1 PM EST :) - Every day in
                            April is what I said :)
                          </p>
                          <p className="stream-host">Emongg</p>
                          <p className="stream-game">VALORANT</p>
                          <div className="game-categories">
                            <span>English</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="stream">
                      <div className="stream-thumbnail">
                        <span className="live">LIVE</span>
                        <img src="https://raw.githubusercontent.com/acupoftee/100-Projects-for-100-Days/master/day3_stream_site/assets/fareeha.jpg" alt="Animal Crossing" />
                        <span className="viewers">1K viewers</span>
                      </div>
                      <div className="stream-info">
                        <div className="stream-profile-avatar">
                          <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/525d89ba-6310-4eeb-a522-a34ba67e0c36-profile_image-50x50.png" alt="fareeha" />
                        </div>
                        <div className="stream-text">
                          <p className="stream-title">
                            gone mad with power
                          </p>
                          <p className="stream-host">Fareeha</p>
                          <p className="stream-game">Animal Crossing: New Horizons</p>
                          <div className="game-categories">
                            <span>English</span>
                            <span>LGBTQIA+</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="divider">
                  <div className="bar"></div>
                  <div className="show-more">
                    Show more <i className="fa fa-chevron-down"></i>
                  </div>
                  <div className="bar"></div>
                </div>
                <div className="videos">
                  <h3>
                    <span className="title-highlight">Recent Uploads</span> We Think
                    You'll Watch Over and Over Again
                  </h3>
                  <div className="video-carousel">
                    <div className="video">
                      <div className="video-thumbnail">
                        <img src="https://raw.githubusercontent.com/acupoftee/100-Projects-for-100-Days/master/day3_stream_site/assets/cobi.jpg" alt="Donkey Kong Country" />
                        <span className="viewers">41:39</span>
                      </div>
                      <div className="video-info">
                        <div className="video-profile-avatar">
                          <img src="https://yt3.ggpht.com/a/AATXAJxQ0oK0Dd-3wF9cNtljrjLWV1wlyAw6IwOTIA=s176-c-k-c0xffffffff-no-rj-mo" alt="cobanermani456" />
                        </div>
                        <div className="video-text">
                          <p className="video-title">
                            Donkey Kong Country Tropical Freeze - Part 2 World 2
                            SPEEDRUN 100% (Nintendo Switch)
                          </p>
                          <p className="video-host">cobanermani456</p>
                          <p className="video-game">Donkey Kong Country</p>
                          <p className="video-game">291K views · 1 day ago</p>
                          <div className="game-categories">
                            <span>Lets Play</span>
                            <span>English</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="video">
                      <div className="video-thumbnail">
                        <div className="hover-accent left"></div>
                        <img src="https://raw.githubusercontent.com/acupoftee/100-Projects-for-100-Days/master/day3_stream_site/assets/markiplier.jpg" alt="Resident Evil" />
                        <span className="viewers">1:24:32</span>
                      </div>
                      <div className="video-info">
                        <div className="video-profile-avatar">
                          <img src="https://yt3.ggpht.com/a/AATXAJxtnapaV8SMHgAVrw9Ldq_yAYJOHuwV9d7Ang=s288-c-k-c0xffffffff-no-rj-mo" alt="Markiplier" />
                        </div>
                        <div className="video-text">
                          <p className="video-title">
                            THE NEMESIS RETURNS | Resident Evil 3 - Part 1
                          </p>
                          <p className="video-host">Markiplier</p>
                          <p className="video-game">Resident Evil 3</p>
                          <p className="video-game">560K views · 10 hours ago</p>
                          <div className="game-categories">
                            <span>Lets Play</span>
                            <span>English</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="video">
                      <div className="video-thumbnail">
                        <img id="current" src="https://raw.githubusercontent.com/acupoftee/100-Projects-for-100-Days/master/day3_stream_site/assets/letsplay.jpg" alt="Animal Crossing" />
                        <span className="viewers">46:52</span>
                      </div>
                      <div className="video-info">
                        <div className="video-profile-avatar">
                          <img src="https://yt3.ggpht.com/a/AATXAJzxew4STpgm_v3PdElrQyDG8ZDNuJ6uzkrM7Q=s288-c-k-c0xffffffff-no-rj-mo" alt="LetsPlay" />
                        </div>
                        <div className="video-text">
                          <p className="video-title">
                            Animal Crossing New Horizons - We Join The Cult of Nook
                          </p>
                          <p className="video-host">LetsPlay</p>
                          <p className="video-game">Animal Crossing: New Horizons</p>
                          <p className="video-game">160K views · 1 day ago</p>
                          <div className="game-categories">
                            <span>Lets Play</span>
                            <span>English</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>*/}

                <Outlet />
                

              </div>
            </div>
            <Footer/>
            <NavbarMobile/>
          </div>
        </EventContext.Provider>
      </LoginContext.Provider>
    </Context.Provider>
  )
}

export default App
