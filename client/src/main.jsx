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
import RandomChannel from "./RandomChannel.jsx";

import ShowTwitchGames from './ShowTwitchGames.jsx';
import ShowStreamInSpecificGame from './ShowStreamInSpecificGame.jsx';

import Root from "./routes/root.jsx";
import ErrorPage from "./error-page.jsx";
import Multiview from './Multiview.jsx';
import EventCalendar from './EventCalendar.jsx';



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
        path: "random-channel",
        element: <RandomChannel/>
      },
      {
        path: "multiview/*", // Capturer tout ce qui vient après /multiview/
        element: <Multiview/>

      },
      {
        path: "events/*",
        element: <EventCalendar/>
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    <HttpsRedirect>
      <RouterProvider router={router} />
    </HttpsRedirect>
  </React.StrictMode>,
)
