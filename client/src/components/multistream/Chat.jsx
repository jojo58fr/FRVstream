import React, { useEffect, useState } from 'react';

const Chat = ({multistream} ) => {
    
    const [chatIframe, setChatIframe] = useState(multistream.stream[0].channel);

    return (
    <div style={{padding: "15px"}}>
            <div >
            {
                chatIframe !== '' && multistream.stream.map(c => (
                <button
                    className={`btn btn-primary ${c.channel == chatIframe ? 'active' : ""}`}
                    onClick={() => setChatIframe(c.channel)}
                    style={{margin: "5px"}}
                >
                    {c.channel}
                </button>
                ))
            }
            </div>
            {
                chatIframe !== '' && (
                    <iframe
                    title="chat twitch"
                    id="chat_embed"
                    src={`https://www.twitch.tv/embed/${chatIframe}/chat?darkpopout&parent=stream.frvtubers.com`}
                    height="500"
                    width="100%"
                    className="h-100 border-0"
                    />
                )
            }
    </div>
    )
    }

export default Chat;