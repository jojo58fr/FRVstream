import React, { useEffect, useState } from 'react'

import { formatDate } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import allLocales from '@fullcalendar/core/locales-all'

import './FullCalendarStyles.scss';

import bootstrap5Plugin from '@fullcalendar/bootstrap5';

export default function DemoApp(props) {


    const [weekendsVisible, setWeekendsVisible] = useState(true);
    const [currentEvents, setCurrentEvents] = useState([]);
    const [initialEvents, setInitialEvents] = useState([]);

    let eventsStreamers = props.initialEvents;

    useEffect(() => {

        if(currentEvents != null && currentEvents.length == 0)
        {
            let initEvents = [];

            eventsStreamers.map((eventObj) => {
                
                initEvents.push(eventObj.event);

            });

            setInitialEvents(initEvents);
        }

    });


    function handleDateSelect(selectInfo) {
        /*let title = prompt('Please enter a new title for your event')
        let calendarApi = selectInfo.view.calendar

        calendarApi.unselect() // clear date selection

        if (title) {
        calendarApi.addEvent({
            id: createEventId(),
            title,
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: selectInfo.allDay
        })
        }*/
    }

    function handleEventClick(clickInfo) {
        /*if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
        clickInfo.event.remove()
        }*/
    }

    function handleEvents(events) {
        setCurrentEvents(events)
    }

    console.log("initialEvents", initialEvents);

    return (
        <div className='demo-app'>
        <Sidebar
            weekendsVisible={weekendsVisible}
            currentEvents={currentEvents}
        />
        <div className='demo-app-main'>
            <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
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
            select={handleDateSelect}
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
      <i>{eventInfo.event.title}</i>
    </>
  )
}

function Sidebar({ weekendsVisible, handleWeekendsToggle, currentEvents }) {
  return (
    <div className='demo-app-sidebar-section'>
        <h3>Les évènements du moment ({currentEvents.length})</h3>
        <ul>
            {currentEvents.map((event) => (
            <SidebarEvent key={event.id} event={event} />
            ))}
        </ul>
    </div>
  )
}

function SidebarEvent({ event }) {
  return (
    <li key={event.id}>
      <b>{formatDate(event.start, {
            month: 'long',
            year: 'numeric',
            day: 'numeric',
            timeZoneName: 'short',
            timeZone: 'UTC',
            locale: 'fr'
        })}</b>
      <i> {event.title}</i>
    </li>
  )
}