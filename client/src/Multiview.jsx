import { useState, useEffect } from 'react'
import './App.scss'

import Navbar from './components/Navbar.jsx';
import Leftbar from './components/Leftbar.jsx';
import Footer from './components/Footer.jsx';

import API from './Api.js';

import { useLocation, useParams, useNavigate } from 'react-router-dom';

import Videos from './components/multistream/Videos.jsx';
import Chat from './components/multistream/Chat.jsx';

import GridLayout from "react-grid-layout";
import ShowcaseLayout from './ShowcaseLayout.jsx';
import generateLayout from './generateLayout.js';

import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

import RGL, { WidthProvider } from "react-grid-layout";
const ResponsiveGridLayout = WidthProvider(RGL);

function Multiview() {

    const navigate = useNavigate();

    // État pour gérer les streams
    const [multistream, setMultiStream] = useState({ stream: [], chat: '' });

    // Récupérer l'URL actuelle
    const location = useLocation();

    // Extraire les segments de l'URL après /multiview/
    let pathSegments = location.pathname.split('/').slice(2);
    
    if(pathSegments.length == 0)
    {
        pathSegments = [""];
    }
    
    const [showOverlay, setShowOverlay] = useState();

    const [layout, setLayout] = useState([{channel: ""}]);
    const [layouts, setLayouts] = useState({});

    const [selectedStreamer, setSelectedStreamer] = useState(null);
    const [streamers, setStreamers] = useState(null);

    const getStreamers = async () => {
        
        let streamersDropdown = [];
        let onlineStreamers = await API.getOnlineStreamers();

        onlineStreamers.map((streamer) => {
            streamersDropdown.push({name: streamer.display_name, realName: streamer.name});
        });
        
        console.log("streamersDropdown", streamersDropdown);

        setStreamers( JSON.parse(JSON.stringify(streamersDropdown)) );
    }

    const refreshLayout = () => {
        // Construire la liste des streams à partir des segments de l'URL
        let streamsList = pathSegments.map(stream => ({ channel: stream }));

        // Définir le premier stream comme chat (par défaut le premier de la liste)
        setMultiStream({ stream: streamsList, chat: pathSegments[0] });

        const newL = generateLayout(streamsList);
        
        setLayouts({ lg: newL });
        setLayout(newL);
    }

    useEffect(() => {
        
        console.log("PATHSEGMENT", pathSegments);

        refreshLayout();


        getStreamers();

    }, [location.pathname]); // Utiliser location.pathname comme dépendance

    const onDragStart = (layout, oldItem, newItem, placeholder, e, element) => {
        setShowOverlay(true);
        element.style.cursor = "grabbing";
    };

    const onDragStop = (layout, oldItem, newItem, placeholder, e, element) => {
        setShowOverlay(false);
        //element.style.cursor = "grab";
        element.style.cursor = "move";
    };

    const onResize = (
        layout,
        oldLayoutItem,
        layoutItem,
        placeholder,
        e,
        element
    ) => {
        element.style.cursor = "se-resize";
    };

    //console.log("LAYOUTS: ", layouts);

    const stringifyLayout = () => {
        return layout.map(function(l) {
          return (
            <div className="layoutItem" key={l.i}>
              <b>{l.i}</b>: [{l.x}, {l.y}, {l.w}, {l.h}]
            </div>
          );
        });
    }

    const onLayoutChange = (layout, layouts) => {
        setLayouts(layouts);
    }

    const addCreator = () => {
        
        console.log("HEY HEYHEY", multistream.stream);

        console.log("selectedStreamer", selectedStreamer);

        if(multistream.stream[0].channel != "")
        {
            let uriToFormat = "";

            //On reforme un url pour naviguer
            multistream.stream.map((stream) => {
                uriToFormat += stream.channel;
                uriToFormat += "/";
            });

            //let uriToFormat = multistream.stream.join('/');
            console.log("uriToFormat", uriToFormat);

            if(selectedStreamer.realName == undefined)
            {
                uriToFormat += `${selectedStreamer}`;
            }
            else {
                uriToFormat += `${selectedStreamer.realName}`;
            }

            console.log("uriToFormat", uriToFormat);

            navigate('/multiview/' + uriToFormat);

            refreshLayout();
        }
        else
        {
            if(selectedStreamer.realName == undefined)
            {
                navigate('/multiview/' + selectedStreamer);
            }
            else {
                navigate('/multiview/' + selectedStreamer.realName);
            }
            

            refreshLayout();
        }

        setSelectedStreamer(null);

    };

    //console.log(randomStreamer);
    return (
    <>
        {/* <div className="layoutJSON">
          Displayed as <code>[x, y, w, h]</code>:
          <div className="columns">{stringifyLayout()}</div>
        </div> */}

        <div className="layoutJSON">

            <Dropdown id="dropdown-selected-streamer" value={selectedStreamer} onChange={(e) => setSelectedStreamer(e.value)} options={streamers} optionLabel="name" 
            editable placeholder="Ajouter un créateur" className="w-full md:w-14rem" />
        
            <Button icon="pi pi-user-plus" aria-label="Ajouter" style={{color: "white"}} onClick={() => {addCreator()}}/>
            {/* TODO: Bouton refresh <Button icon="pi pi-refresh" aria-label="Reset Layout" style={{color: "white"}} onClick={() => {refreshLayout()}}/> */}

        </div>

        <ResponsiveGridLayout
                    margin={[5, 5]}
                    containerPadding={[5, 5]}
                    onResize={onResize}
                    layouts={layouts}
                    onResizeStart={() => setShowOverlay(true)}
                    onResizeStop={() => setShowOverlay(false)}
                    onDrag={onDragStart}
                    onDragStop={onDragStop}
                    isDraggable={true}
                    isResizable={true}
                    rowHeight={10}
                    preventCollision={false}
                    autoSize={true}
                    verticalCompact={true}
                    compactType={"vertical"}
                    /*cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    measureBeforeMount={false}*/
                    isBounded={true}
                >

                    {layout.map((l) => {
                        return (
                        <div
                            key={l.i}
                            data-grid={l}
                        >
                            <Videos stream={l.i}/>
                        </div>
                        );
                    })}

                    
        </ResponsiveGridLayout>
 
        { (layout[0].channel !== "") && <>
            <Chat multistream={multistream}/>
        </>}

    </>
    )
}

export default Multiview
