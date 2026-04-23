import React, { useState, useEffect, createContext, useRef, useCallback, useMemo } from 'react';
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
export const FavoritesContext = createContext(null);

function App() {

  const [actualChannel, setActualChannel] = useState();

  const [qcStreamers, setQcStreamers] = useState([]);
  const [frStreamers, setFrStreamers] = useState([]);

  const [onlineStreamers, setOnlineStreamers] = useState([]);
  
  const [initialEvents, setInitialEvents] = useState([]);

  const [lastedEvents, setLastedEvents] = useState([]);

  const [isLogged, setIsLogged] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const authRedirectedRef = useRef(false);
  const [favorites, setFavorites] = useState([]);
  const favoritesLoadingRef = useRef(false);
  const [favoriteStreams, setFavoriteStreams] = useState([]);
  const favoriteStreamsLoadingRef = useRef(false);

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
    try {
      const events = await API.getEventsStreamers();
      setInitialEvents(Array.isArray(events) ? events : []);
    } catch (error) {
      console.error('Unable to fetch events', error);
      setInitialEvents([]);
    }
  }

  const getLastedEventsStreamers = async () => {
    try {
      const events = await API.getLastedEventsStreamers();
      setLastedEvents(Array.isArray(events) ? events : []);
    } catch (error) {
      console.error('Unable to fetch upcoming events', error);
      setLastedEvents([]);
    }
  }

  const getStatusOnline = useCallback(async () => {
    try {
      const session = await UniversalLoginSystem.fetchSession();

      if (!session) {
        setIsLogged(null);
        authRedirectedRef.current = false;
        return;
      }

      const syncedProfile = await API.syncAuthSession();

      if (syncedProfile?.unauthorized) {
        setIsLogged(null);
        if (!authRedirectedRef.current) {
          authRedirectedRef.current = true;
          const callbackUrl = typeof window !== 'undefined' ? window.location.href : undefined;
          UniversalLoginSystem.startLogin(callbackUrl);
        }
        return;
      }

      if (syncedProfile) {
        const mergedProfile = { ...syncedProfile };
        if (!mergedProfile.user && session?.user) {
          mergedProfile.user = session.user;
        }
        setIsLogged(mergedProfile);
        authRedirectedRef.current = false;
        return;
      }

      // Si la synchro échoue, on considère l'utilisateur déconnecté
      setIsLogged(null);
      authRedirectedRef.current = false;
    } catch (error) {
      console.error('Unable to retrieve auth session', error);
      setIsLogged(null);
    }
  }, []);

  useEffect(() => {
    getEventsStreamers();
    getLastedEventsStreamers();
  }, []);

  const refreshFavorites = useCallback(async (force = false) => {
    if (!isLogged) {
      setFavorites([]);
      return;
    }

    if (favoritesLoadingRef.current) {
      return;
    }

    favoritesLoadingRef.current = true;

    const favs = await API.getFavorites(force);
    if (Array.isArray(favs)) {
      setFavorites(favs);
    }
    favoritesLoadingRef.current = false;
  }, [isLogged]);

  const refreshFavoriteStreams = useCallback(async (force = false) => {
    if (!isLogged) {
      setFavoriteStreams([]);
      return;
    }

    if (favoriteStreamsLoadingRef.current) {
      return;
    }

    favoriteStreamsLoadingRef.current = true;

    const favStreams = await API.getFavoriteStreams(force);
    if (Array.isArray(favStreams)) {
      setFavoriteStreams(favStreams);
    }

    favoriteStreamsLoadingRef.current = false;
  }, [isLogged]);

  const isFavorite = useCallback((vtuberLike) => {
    if (!vtuberLike || !Array.isArray(favorites)) {
      return false;
    }

    //console.error("vtuberID", vtuberLike);

    const vtuberId = typeof vtuberLike === 'object'
      ? vtuberLike.id ?? vtuberLike.vtuberId ?? vtuberLike?.vtuber?.id
      : vtuberLike;
    const slug = typeof vtuberLike === 'string'
      ? vtuberLike
      : vtuberLike?.name ?? vtuberLike?.display_name ?? vtuberLike?.vtuber?.name;

    return favorites.some((fav) => {
      if (!fav) {
        return false;
      }
      if (vtuberId && fav.id === vtuberId) {
        return true;
      }
      if (slug && (fav.name === slug || fav.display_name === slug)) {
        return true;
      }
      return false;
    });
  }, [favorites]);

  const toggleFavorite = useCallback(async (vtuberLike) => {
    if (!vtuberLike) {
      return;
    }

    const vtuberId = vtuberLike.id ?? vtuberLike.vtuberId ?? vtuberLike?.vtuber?.id;
    if (!vtuberId) {
      console.warn('toggleFavorite: vtuberId manquant (ID interne requis)');
      return;
    }

    if (!isLogged) {
      const callbackUrl = typeof window !== 'undefined' ? window.location.href : undefined;
      UniversalLoginSystem.startLogin(callbackUrl);
      return;
    }

    if (!vtuberId) {
      return;
    }

    const currentlyFavorite = isFavorite(vtuberLike);

    if (currentlyFavorite) {
      await API.removeFavorite(vtuberId);
      setFavorites((prev) => Array.isArray(prev) ? prev.filter((fav) => fav?.id !== vtuberId) : []);
      return;
    }

    const response = await API.addFavorite(vtuberId);
    const vtuber = response?.vtuber ?? vtuberLike;

    setFavorites((prev) => {
      const base = Array.isArray(prev) ? prev.filter((fav) => fav?.id !== vtuberId) : [];
      return vtuber ? [vtuber, ...base] : base;
    });
  }, [isFavorite, isLogged]);

  API.onUpdate = function () {
    getQCStreamers();
    getFRStreamers();
    getOnlineStreamers();

    getLastedEventsStreamers();
    getEventsStreamers();

    getStatusOnline();
    if (isLogged) {
      refreshFavorites();
      refreshFavoriteStreams();
    }
  }

  useEffect(() => {

      getQCStreamers();
      getFRStreamers();
      getOnlineStreamers();

      getLastedEventsStreamers();
      getEventsStreamers();

      getStatusOnline();

  }, [getStatusOnline])

  useEffect(() => {
    refreshFavorites(true);
    refreshFavoriteStreams(true);
  }, [isLogged, refreshFavorites, refreshFavoriteStreams]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      if (width > 720) {
        setIsMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleRefetchAuth = () => {
      getStatusOnline();
    };

    window.addEventListener('focus', handleRefetchAuth);
    document.addEventListener('visibilitychange', handleRefetchAuth);

    return () => {
      window.removeEventListener('focus', handleRefetchAuth);
      document.removeEventListener('visibilitychange', handleRefetchAuth);
    };
  }, [getStatusOnline]);

  const isMobile = viewportWidth <= 720;
  const forceCollapsed = isMobile;

  const handleMenuToggle = () => {
    if (isMobile) {
      setIsMobileSidebarOpen((value) => !value);
      return;
    }
    setIsSidebarCollapsed((value) => !value);
  };

  const favoritesContextValue = useMemo(() => ({
    favorites,
    favoriteStreams,
    refreshFavorites,
    refreshFavoriteStreams,
    toggleFavorite,
    isFavorite
  }), [favorites, favoriteStreams, refreshFavorites, refreshFavoriteStreams, toggleFavorite, isFavorite]);

  return (
    <Context.Provider value={[frStreamers, qcStreamers, actualChannel, setActualChannel, onlineStreamers]}>
      <LoginContext.Provider value={[isLogged, setIsLogged]}>
        <FavoritesContext.Provider value={favoritesContextValue}>
          <EventContext.Provider value={[lastedEvents, initialEvents]}>
            <div className="container">
              <Navbar
                onMenuToggle={handleMenuToggle}
                isMobile={isMobile}
                isSidebarCollapsed={isSidebarCollapsed}
                isMobileSidebarOpen={isMobileSidebarOpen}
              />
              <div className="main">
                {(!isMobile || isMobileSidebarOpen) && (
                  <Leftbar
                    collapsed={isSidebarCollapsed}
                    onToggle={setIsSidebarCollapsed}
                    forceCollapsed={forceCollapsed}
                    isOverlay={isMobile}
                    onCloseOverlay={() => setIsMobileSidebarOpen(false)}
                  />
                )}

                <div className="stream-content">
                  <Outlet />
                </div>
              </div>
              <Footer/>
            </div>
          </EventContext.Provider>
        </FavoritesContext.Provider>
      </LoginContext.Provider>
    </Context.Provider>
  )
}

export default App
