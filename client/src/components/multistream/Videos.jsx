import React, { useState, useEffect } from 'react';

import ReactTwitchEmbedVideo from "react-twitch-embed-video";

let i = 1
const Delayed = ({ children, waitBeforeShow = 250 }) => {

    waitBeforeShow = waitBeforeShow * i;
    i++;

    const [isShown, setIsShown] = useState(false);
  
    useEffect(() => {

      const timer = setTimeout(() => {
        setIsShown(true);
      }, waitBeforeShow);
      return () => clearTimeout(timer);
    }, [waitBeforeShow]);
  
    return isShown ? children : null;
};

const Videos = ({ stream }) => {

  //console.log("VIDEOS");
  //console.log(stream);

  return (
    <div style={{display: "flex", width: "100%", height: "100%", padding: "10px"}}>

        <Delayed waitBeforeShow={`${250}`}>
          <div
          style={{display: "flex", width: "100%", height: "100%"}}
          id={`w-twitch-embed-${stream}`}
          >
              <ReactTwitchEmbedVideo layout="video" channel={stream} width="100%" height="100%" targetClass="layoutTwitch" id={`twitch-embed-${stream}`} targetId={`twitch-embed-${stream}`}/>
          </div>
        </Delayed>

    </div>

  );
}

export default Videos;