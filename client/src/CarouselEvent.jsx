import React, { useEffect, useState } from 'react'

import './FullCalendarStyles.scss';
import styles from './CarouselEvent.module.scss';

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

    const eventsStreamers = props.initialEvents;

    useEffect(() => {
        if (!Array.isArray(eventsStreamers)) {
            setInitialEvents([]);
            return;
        }

        const mapped = eventsStreamers.map((event) => ({
            ...event,
            eventOrganizers: Array.isArray(event?.eventOrganizers) ? event.eventOrganizers : []
        }));

        setInitialEvents(mapped.slice(0, 9));
    }, [eventsStreamers]);

    const eventTemplate = (eventObj) => {
        const ev = eventObj?.event ?? eventObj;
        let dateEventStr = '';

        if(ev?.end)
        {
            dateEventStr += `${luxon.fromISO(ev.start).toFormat("dd LLL yyyy HH:mm", { locale: "fr" })}`;
            dateEventStr += ` - ${luxon.fromISO(ev.end).toFormat("dd LLL yyyy HH:mm", { locale: "fr" })}`
        }
        else
        {
            dateEventStr += `${luxon.fromISO(ev?.start).toFormat("dd LLL yyyy", { locale: "fr" })}`;
        }

        return (
            <div style={{background: "#1f1f23"}} className={`${styles['card-event']} border-round m-2 text-center py-3 px-3`}>
                <div className={`${styles['card-img']} shadow-2`}>
                    <img src={`https://images.pexels.com/photos/987586/pexels-photo-987586.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`} alt={ev?.title} />
                </div>
                <div>
                    <h5>{dateEventStr}</h5>

                    {eventObj.eventOrganizers.map((coPpl, idx) => {
                        const name = coPpl?.name ?? coPpl?.display_name ?? coPpl?.username;
                        const href = coPpl?.link ?? coPpl?.url;
                        return (
                            <div key={`${name}-${idx}`} className={ styles["collab-user"] }>
                                {href ? (
                                    <a target="_blank" rel="nofollow noreferrer noopener" className="external text" href={href}>
                                        <span>{name}</span>
                                    </a>
                                ) : (
                                    <span>{name}</span>
                                )}
                            </div>
                        );
                    })}

                    <h6 style={{textOverflow: "ellipsis"}}>{ev?.title}</h6>

                </div>
            </div>
        );
    };

    return (<>
        <Carousel value={initialEvents} numVisible={2} numScroll={1} responsiveOptions={responsiveOptions} itemTemplate={eventTemplate} circular showIndicators={(initialEvents.length > 2)? true: false} showNavigators={(initialEvents.length > 2)? true: false}/>
    </>)
}
