import React, { useEffect, useState } from 'react'

import { formatDate } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import allLocales from '@fullcalendar/core/locales-all'

import API from './Api.js';

import './FullCalendarStyles.scss';
import styles from './CarouselEvent.module.scss';

import bootstrap5Plugin from '@fullcalendar/bootstrap5';

import { Carousel } from 'primereact/carousel';
import { DateTime as luxon } from 'luxon';

export default function CarouselEvent(props) {

    const [initialEvents, setInitialEvents] = useState([]);

    const responsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '1199px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    let eventsStreamers = props.initialEvents;

    const getMoreInfosEventsStreamers = async () => {

        let initEvents = [];

        for (let i = 0; i < eventsStreamers.length; i++) {
            
            let event = eventsStreamers[i];

            let eOrganizers = [];

            for (let j = 0; j < event.eventOrganizers.length; j++) {
                
                let username = event.eventOrganizers[j];
    
                let ppl = await API.getStreamer(username);
    
                if (ppl != null) {
                    eOrganizers.push(ppl);
                }

            }

            event.eventOrganizers = eOrganizers;

            initEvents.push(event);

        }

        setInitialEvents(initEvents.slice(0,9));

    }

    useEffect(() => {

        if(initialEvents != null && initialEvents.length == 0)
        {
            getMoreInfosEventsStreamers();
        }

    });

    const eventTemplate = (eventObj) => {

        let dateEventStr = '';

        if(eventObj.event.end)
        {
            dateEventStr += `${luxon.fromISO(eventObj.event.start).toFormat("dd LLL yyyy HH:mm:ss", { locale: "fr" })}`;
            dateEventStr += ` - ${luxon.fromISO(eventObj.event.end).toFormat("dd LLL yyyy HH:mm:ss", { locale: "fr" })}`
        }
        else
        {
            dateEventStr += `${luxon.fromISO(eventObj.event.start).toFormat("dd LLL yyyy", { locale: "fr" })}`;
        }

        return (
            <div style={{background: "#1f1f23"}} className={`${styles['card-event']} border-round m-2 text-center py-3 px-3`}>
                <div className={`${styles['card-img']} shadow-2`}>
                    <img src={`https://images.pexels.com/photos/987586/pexels-photo-987586.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`} alt={eventObj.event.title} />
                </div>
                <div>
                    <h5>{dateEventStr}</h5>

                    {eventObj.eventOrganizers.map((coPpl) => { return(<>

                        <div className={ styles["collab-user"] }>
                            <a target="_blank" rel="nofollow noreferrer noopener" class="external text" href={`https://www.twitch.tv/${coPpl.name}`}>
                                <div className={ styles["profile-image-small"] }>
                                    <img src={coPpl.logo} alt={coPpl.name} />
                                </div>
                                <span>{coPpl.name}</span>
                            </a>
                        </div>

                    </>)})}

                    <h6 style={{textOverflow: "ellipsis"}}>{eventObj.event.title}</h6>

                </div>
            </div>
        );
    };

    return (<>
        <Carousel value={initialEvents} numVisible={2} numScroll={1} responsiveOptions={responsiveOptions} itemTemplate={eventTemplate} circular showIndicators={(initialEvents.length > 2)? true: false} showNavigators={(initialEvents.length > 2)? true: false}/>
    </>)
}