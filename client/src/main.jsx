import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import HttpsRedirect from "react-https-redirect";

import HomePage from "./HomePage.jsx";
import ShowTwitchStream from "./ShowTwitchStream.jsx";
import FrenchChannels from "./FrenchChannels.jsx";
import QuebecersChannels from "./QuebecersChannels.jsx";
import FrvmonEventChannels from "./FrvmonEventChannels.jsx";
import RandomChannel from "./RandomChannel.jsx";
import FavoritesPage from "./FavoritesPage.jsx";

import ShowTwitchGames from './ShowTwitchGames.jsx';
import ShowStreamInSpecificGame from './ShowStreamInSpecificGame.jsx';

import Root from "./routes/root.jsx";
import ErrorPage from "./error-page.jsx";
import Multiview from './Multiview.jsx';
import EventCalendar from './EventCalendar.jsx';
import Login from './Login.jsx';
import NotFound from './NotFound.jsx';
import { ThemeProvider } from './ThemeContext.jsx';
import StatsPage from './StatsPage.jsx';
import Profile from './Profile.jsx';
import ProfileEvents from './ProfileEvents.jsx';
import AdminPanel from './AdminPanel.jsx';



const router = createBrowserRouter([
  {
    path: "/",
    element: <Root/>,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <HomePage/>
      },
      {
        path: "c/:streamerName?",
        element: <ShowTwitchStream />,
      },
      {
        path: "d/",
        element: <ShowTwitchGames />,
      },
      {
        path: "d/g/:gameID?",
        element: <ShowStreamInSpecificGame />,
      },
      {
        path: "french-channels",
        element: <FrenchChannels/>
      },
      {
        path: "quebecers-channels",
        element: <QuebecersChannels/>
      },
      {
        path: "frvmon-event-channels",
        element: <FrvmonEventChannels/>
      },
      {
        path: "random-channel",
        element: <RandomChannel/>
      },
      {
        path: "favorites",
        element: <FavoritesPage/>
      },
      {
        path: "stats",
        element: <StatsPage/>
      },
      {
        path: "multiview/*", // Capturer tout ce qui vient après /multiview/
        element: <Multiview/>

      },
      {
        path: "events/*",
        element: <EventCalendar/>
      },
      {
        path: "login",
        element: <Login/>
      },
      {
        path: "profil",
        element: <Profile/>
      },
      {
        path: "profil/proposer-evenement",
        element: <ProfileEvents/>
      },
      {
        path: "admin",
        element: <AdminPanel/>
      },
      {
        path: "*",
        element: <NotFound />
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    <HttpsRedirect>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </HttpsRedirect>
  </React.StrictMode>,
)
