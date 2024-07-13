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

          {currentEvents?.length > 0 && <div className={styles['w-lasted-event']}>

              {currentEvents.slice(0,5).map((eventObj) => (
                <SidebarEvent key={eventObj.event.id} event={eventObj.event} />
              ))}
          </div>}

          {currentEvents?.length === 0 && <div className={styles['w-lasted-event']}> Aucun évènement de prévu.</div>}

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
        <h2>Les évènements FRVtubers & des créateurs</h2>

        <div>FRVtubers est une communauté dynamique de créateurs virtuels francophones (Vtubers) qui organise divers évènements pour rassembler et engager la communauté.</div>
        <p>
            Nous prévoyons en plus <b>deux types de collaborations dit "officiels":</b><br/>
            <br/><b>COLLABORATION OFFICIELLE:</b><br/>
            <i>Entièrement gérée par le staff de FRVtubers, l'évènement permet de travailler étroitement avec d'autres groupes/organismes. La gestion de l'invitation est gérée par le staff sous invitation ou dépendant de l'évènement mis en place.</i><br/> 
            <br/><b>COLLABORATION COMMUNAUTAIRE:</b><br/>
            <i>Proposé par un membre du staff, ces évènements sont ouvert à tous les vtubers du discord. Il est à noter que des membres peuvent proposer des évènement et bénificier de la communication officiel de la communauté en proposant le projet en MP à un membre du staff ou via le ⁠🎫 support.</i><br/><br/> 
        </p>

        <div>Envie de proposer un évènement en tant que Vtuber ou d'initier des évènements avec FRVtubers ? <a className="link" href="https://discord.gg/meyHQYWvjU" target="_blank">Contactez-nous dans le support Discord</a></div>

        <h3 style={{paddingTop: "50px"}}>Les prochains évènements à découvrir !</h3>

        <LastedCalendarEventComponent
            weekendsVisible={true}
            currentEvents={lastedEvents}
        />

        <h3 style={{paddingTop: "50px"}}>Calendrier des évènements</h3>

        <EventCalendarComponent initialEvents={initialEvents}/>

    </>
    )
}

export default EventCalendar
