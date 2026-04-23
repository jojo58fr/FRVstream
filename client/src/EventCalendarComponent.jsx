import React, { useEffect, useState } from 'react'

import { formatDate } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list';

import allLocales from '@fullcalendar/core/locales-all'

import './FullCalendarStyles.scss';

import bootstrap5Plugin from '@fullcalendar/bootstrap5';

import styles from './EventCalendar.module.scss';

export default function EventCalendarComponent(props) {


    const [weekendsVisible, setWeekendsVisible] = useState(true);
    const [currentEvents, setCurrentEvents] = useState([]);
    const [initialEvents, setInitialEvents] = useState([]);

    let eventsStreamers = props.initialEvents;

    useEffect(() => {
        if (!Array.isArray(eventsStreamers)) {
            setInitialEvents([]);
            return;
        }

        const mapped = eventsStreamers.map((eventObj) => {
            const baseEvent = eventObj?.event ?? eventObj;
            const extendedProps = {
                ...(baseEvent?.extendedProps || {}),
                description: eventObj?.description ?? baseEvent?.description,
                link: eventObj?.link ?? baseEvent?.link,
                organizers: eventObj?.organizers ?? eventObj?.eventOrganizers ?? [],
                thumbnail: baseEvent?.thumbnail ?? eventObj?.thumbnail ?? baseEvent?.image ?? baseEvent?.cover
            };

            return {
                ...baseEvent,
                extendedProps
            };
        });

        setInitialEvents(mapped);
    }, [eventsStreamers]);




    function handleEventClick(clickInfo) {
        const ev = clickInfo?.event;
        clickInfo?.jsEvent?.preventDefault?.();
        if (!ev) {
            return;
        }

        const ext = ev.extendedProps ?? {};
        const mapped = {
            event: {
                id: ev.id,
                title: ev.title,
                start: ev.start ? ev.start.toISOString() : null,
                end: ev.end ? ev.end.toISOString() : null,
                thumbnail: ext.thumbnail ?? ext.image ?? ext.cover
            },
            description: ext.description,
            link: ext.link ?? ext.url,
            eventOrganizers: ext.organizers ?? ext.eventOrganizers ?? []
        };

        if (typeof props?.onSelectEvent === 'function') {
            props.onSelectEvent(mapped);
        }
    }

    function handleEvents(events) {
        setCurrentEvents(events)
    }

    return (
        <div className='demo-app'>
          <div className={`${styles['calendar']} ${styles['calendar-mobile']}`}>
            <FullCalendar
              plugins={[dayGridPlugin, listPlugin, timeGridPlugin, bootstrap5Plugin]}
              headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'listMonth listWeek listDay'
              }}
              buttonText={{
                "listMonth": "Mois",
                "listWeek": "Semaine",
                "listDay": "Jour"
              }}
              initialView='listMonth'
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={weekendsVisible}
              events={initialEvents}
              eventContent={renderEventContent} // custom render function
              eventClick={handleEventClick}
              eventsSet={handleEvents} // called after events are initialized/added/changed/removed
              locales={allLocales}
              locale={'fr'}
              /* you can update a remote database when these fire:
              eventAdd={function(){}}
              eventChange={function(){}}
              eventRemove={function(){}}
              */
            />
          </div>
          <div className={`${styles['calendar']} ${styles['calendar-desktop']}`}>
              <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, bootstrap5Plugin]}
              headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView='dayGridMonth'
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={weekendsVisible}
              events={initialEvents}
              eventContent={renderEventContent} // custom render function
              eventClick={handleEventClick}
              eventsSet={handleEvents} // called after events are initialized/added/changed/removed
              locales={allLocales}
              locale={'fr'}
              /* you can update a remote database when these fire:
              eventAdd={function(){}}
              eventChange={function(){}}
              eventRemove={function(){}}
              */
              />
          </div>
        </div>
    )
}

function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{(eventInfo.event.title.length > 15) ? (eventInfo.event.title.substring(0, 15) + "...") : eventInfo.event.title}</i>
    </>
  )
}

