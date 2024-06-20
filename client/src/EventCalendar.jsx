import { useState, useEffect, useContext } from 'react'
import API from './Api.js';
import { EventContext } from './App.jsx';

import styles from './EventCalendar.module.scss';

import { Calendar, luxonLocalizer, Views } from 'react-big-calendar'
import { DateTime, Settings } from 'luxon'
import EventCalendarComponent from './EventCalendarComponent.jsx';

function EventCalendar() {

    const [initialEvents] = useContext(EventContext);

    return (
    <>
        <h2>Calendrier des évènements</h2>
        <EventCalendarComponent initialEvents={initialEvents}/>

    </>
    )
}

export default EventCalendar
