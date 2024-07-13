import { useState, useEffect, useContext } from 'react'
import API from './Api.js';
import { EventContext } from './App.jsx';

import styles from './EventCalendar.module.scss';

import { Calendar, luxonLocalizer, Views } from 'react-big-calendar'
import { DateTime, Settings } from 'luxon'
import { formatDate } from '@fullcalendar/core'

import EventCalendarComponent from './EventCalendarComponent.jsx';

function LastedCalendarEventComponent({ weekendsVisible, handleWeekendsToggle, currentEvents }) {
    
    return (
      <div>
          <h3>Les prochains évènements à découvrir !</h3>
          
          {currentEvents?.length > 0 && <div className={styles['w-lasted-event']}>

              {currentEvents.slice(0,5).map((eventObj) => (
                <SidebarEvent key={eventObj.event.id} event={eventObj.event} />
              ))}
          </div>}

      </div>
    )
  }
  
  function SidebarEvent({ event }) {
    return (
      <div className={styles['lasted-event']} key={event.id}>
        <b>
            {formatDate(event.start, {
                month: 'long',
                year: 'numeric',
                day: 'numeric',
                timeZoneName: 'short',
                timeZone: 'UTC',
                locale: 'fr'
            })}
        </b>
        <i className={styles['lasted-event-title']}>{event.title}</i>
      </div>
    )
  }

function EventCalendar() {

    const [lastedEvents, initialEvents] = useContext(EventContext);

    return (
    <>
        <h2>Calendrier des évènements</h2>

        <LastedCalendarEventComponent
            weekendsVisible={true}
            currentEvents={lastedEvents}
        />

        <EventCalendarComponent initialEvents={initialEvents}/>

    </>
    )
}

export default EventCalendar
