import { useContext, useMemo, useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { EventContext } from './App.jsx';
import EventCalendarComponent from './EventCalendarComponent.jsx';
import styles from './EventCalendar.module.scss';
import { useSeo } from './components/Seo.jsx';
import API from './Api.js';

const normalizeEvent = (entry) => {
    if (!entry) {
        return null;
    }

    const event = entry.event ? { ...entry.event } : { ...entry };
    const rawStart = event?.start ?? entry?.start_ts ?? entry?.start;
    const rawEnd = event?.end ?? entry?.end_ts ?? entry?.end;
    const startDate = rawStart ? DateTime.fromISO(rawStart) : null;
    const endDate = rawEnd ? DateTime.fromISO(rawEnd) : null;
    if (!event.title && entry?.title) {
        event.title = entry.title;
    }
    if (!event.thumbnail && (entry?.thumbnail || entry?.image_url)) {
        event.thumbnail = entry.thumbnail ?? entry.image_url;
    }

    return {
        ...entry,
        event,
        startDate: startDate?.isValid ? startDate : null,
        endDate: endDate?.isValid ? endDate : null,
        description: entry?.description ?? event?.description ?? null,
        link: entry?.link ?? event?.link ?? null,
        organizers: Array.isArray(entry?.eventOrganizers) ? entry.eventOrganizers : []
    };
};

const formatEventDate = (entry) => {
    const startDate = entry?.startDate;
    const endDate = entry?.endDate;

    if (!startDate) {
        return {
            fullDate: 'Date à confirmer',
            relative: null
        };
    }

    const localizedStart = startDate.setLocale('fr');
    const localizedEnd = endDate?.setLocale('fr');

    const rangeLabel = localizedEnd
        ? `${localizedStart.toFormat("cccc d LLLL yyyy '•' HH'h'mm")} — ${localizedEnd.toFormat("HH'h'mm")}`
        : localizedStart.toFormat("cccc d LLLL yyyy '•' HH'h'mm");

    return {
        fullDate: rangeLabel,
        relative: localizedStart.toRelative({ locale: 'fr' })
    };
};

const isEventValidated = (entry) => {
    if (!entry) return false;

    // Si explicitement rejeté/pending -> non validé
    const status = (entry?.event?.status ?? entry?.status ?? '').toString().toLowerCase();
    if (status === 'pending' || status === 'rejected') {
        return false;
    }

    if (typeof entry?.validated === 'boolean') return entry.validated;
    if (typeof entry?.event?.validated === 'boolean') return entry.event.validated;
    if (status) {
        if (status === 'validated' || status === 'approved' || status === 'official') {
            return true;
        }
    }

    // Par défaut, on considère les évènements officiels comme validés
    return true;
};

const buildProximityBadge = (entry) => {
    const startDate = entry?.startDate;
    if (!startDate) {
        return null;
    }

    const now = DateTime.now();
    if (startDate < now) {
        return { label: 'Terminé', tone: 'past' };
    }

    const diffHours = startDate.diff(now, 'hours').hours;
    const label = startDate.toRelative({ locale: 'fr' }) ?? '';

    if (diffHours <= 24) {
        return { label, tone: 'urgent' };
    }
    if (diffHours <= 72) {
        return { label, tone: 'soon' };
    }
    return { label, tone: 'later' };
};

function EventList({ events, emptyLabel, onSelect }) {
    if (!events || events.length === 0) {
        return (
            <div className={styles.emptyState}>
                {emptyLabel ?? "Aucun événement n'est prévu pour le moment."}
            </div>
        );
    }

    return (
        <div className={styles.upcomingList}>
            {events.map((entry) => (
                <EventCard
                    key={entry.event?.id ?? `${entry.event?.title}-${entry.event?.start}`}
                    eventEntry={entry}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}

function EventCard({ eventEntry, onSelect }) {
    const { fullDate } = formatEventDate(eventEntry);
    const title = eventEntry?.event?.title ?? 'Événement';
    const description = eventEntry?.description;
    const organizers = eventEntry?.organizers ?? [];
    const badge = buildProximityBadge(eventEntry);
    const link = eventEntry?.link;
    const handleClick = () => {
        if (typeof onSelect === 'function') {
            onSelect(eventEntry);
        }
    };

    return (
        <article
            className={styles.upcomingCard}
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            <span className={styles.eventDate}>{fullDate}</span>
            <span className={styles.eventTitle}>{title}</span>
            {description && (
                <p className={styles.eventMeta}>
                    {description.length > 160 ? `${description.slice(0, 157)}...` : description}
                </p>
            )}
            {organizers.length > 0 && (
                <p className={styles.eventMeta}>
                    {organizers.map((org, index) => {
                        const name = org?.name ?? org?.display_name ?? org?.username;
                        const organizerLink = org?.link ?? org?.url;
                        const isLast = index === organizers.length - 1;
                        return (
                            <span key={`${name}-${index}`}>
                                {organizerLink ? (
                                    <a href={organizerLink} target="_blank" rel="noreferrer">{name}</a>
                                ) : (
                                    name
                                )}
                                {!isLast && ', '}
                            </span>
                        );
                    })}
                </p>
            )}
            {link && (
                <a className={styles.eventLink} href={link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                    Voir les détails
                </a>
            )}
            {badge?.label && (
                <span className={`${styles.badge} ${styles[`badge-${badge.tone}`]}`}>
                    {badge.label.charAt(0).toUpperCase() + badge.label.slice(1)}
                </span>
            )}
        </article>
    );
}

function EventCalendar() {
    const [lastedEvents, initialEvents] = useContext(EventContext);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filterMode, setFilterMode] = useState('validated'); // validated | community
    const [communityEvents, setCommunityEvents] = useState([]);
    const [communityLoading, setCommunityLoading] = useState(false);

    const normalizedAllBase = useMemo(() => {
        const list = Array.isArray(initialEvents) ? initialEvents : [];
        return list
            .map(normalizeEvent)
            .filter(Boolean)
            .sort((a, b) => {
                const aDate = a?.startDate?.toMillis?.() ?? 0;
                const bDate = b?.startDate?.toMillis?.() ?? 0;
                return aDate - bDate;
            });
    }, [initialEvents]);

    const normalizedLastedBase = useMemo(() => {
        const list = Array.isArray(lastedEvents) ? lastedEvents : [];
        return list
            .map(normalizeEvent)
            .filter(Boolean)
            .sort((a, b) => {
                const aDate = a?.startDate?.toMillis?.() ?? 0;
                const bDate = b?.startDate?.toMillis?.() ?? 0;
                return aDate - bDate;
            });
    }, [lastedEvents]);

    const normalizedCommunityBase = useMemo(() => {
        const list = Array.isArray(communityEvents) ? communityEvents : [];
        return list
            .map(normalizeEvent)
            .filter(Boolean)
            .sort((a, b) => {
                const aDate = a?.startDate?.toMillis?.() ?? 0;
                const bDate = b?.startDate?.toMillis?.() ?? 0;
                return aDate - bDate;
            });
    }, [communityEvents]);

    const filterMatches = (entry) => {
        const validated = isEventValidated(entry);
        if (filterMode === 'validated') {
            return validated;
        }
        return !validated;
    };

    const normalizedAll = useMemo(
        () => normalizedAllBase.filter(filterMatches),
        [normalizedAllBase, filterMode]
    );

    const normalizedLasted = useMemo(
        () => normalizedLastedBase.filter(filterMatches),
        [normalizedLastedBase, filterMode]
    );

    const normalizedCommunity = useMemo(
        () => normalizedCommunityBase.filter(filterMatches),
        [normalizedCommunityBase, filterMode]
    );

    const upcomingEvents = useMemo(() => {
        const now = DateTime.now();
        const source = filterMode === 'community'
            ? normalizedCommunity
            : (normalizedLasted.length ? normalizedLasted : normalizedAll);
        return source
            .filter((entry) => entry?.startDate && entry.startDate >= now)
            .sort((a, b) => (a.startDate?.toMillis?.() ?? 0) - (b.startDate?.toMillis?.() ?? 0));
    }, [normalizedLasted, normalizedAll, normalizedCommunity, filterMode]);

    const pastEvents = useMemo(() => {
        const now = DateTime.now();
        const source = filterMode === 'community' ? normalizedCommunity : normalizedAll;
        return source
            .filter((entry) => entry?.startDate && entry.startDate < now)
            .sort((a, b) => (b.startDate?.toMillis?.() ?? 0) - (a.startDate?.toMillis?.() ?? 0));
    }, [normalizedAll, normalizedCommunity, filterMode]);

    const handleSelectEvent = (entry) => {
        const normalized = normalizeEvent(entry);
        if (!normalized) return;
        setSelectedEvent(normalized);
    };

    const closeModal = () => setSelectedEvent(null);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    useEffect(() => {
        const loadCommunity = async () => {
            try {
                setCommunityLoading(true);
                const res = await API.getCommunityEvents?.('approved');
                setCommunityEvents(Array.isArray(res) ? res : []);
            } catch (error) {
                console.error('Unable to fetch community events', error);
                setCommunityEvents([]);
            } finally {
                setCommunityLoading(false);
            }
        };

        loadCommunity();
    }, []);

    useSeo({
        title: 'Agenda des évènements VTuber FR',
        description: 'Consulte le calendrier des évènements VTuber francophones, des collaborations officielles et communautaires FRVtubers.',
        canonicalPath: '/events'
    });

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles['hero-content']}>
                    <div className={`${styles['hero-badge']} ${styles['hero-warning']}`}>
                        ⚠️ Feature en développement
                    </div>
                    <h1 className={styles['hero-title']}>Les évènements de la scène VTuber francophone</h1>
                    <p className={styles['hero-description']}>
                        Des collaborations officielles aux initiatives communautaires, FRVtubers rassemble les créateurs et
                        met en lumière leurs temps forts. Explore les prochains rendez-vous, inscris-les à ton agenda et ne
                        manque plus les moments forts de la communauté.
                    </p>
                </div>

                <div className={styles.highlights}>
                    <div className={styles['highlight-card']}>
                        <span className={styles['highlight-title']}>Collaboration officielle</span>
                        <p className={styles['highlight-description']}>
                            Organisée avec le staff FRVtubers pour des événements partenaires, diffusés sur les canaux
                            officiels avec un accompagnement complet.
                        </p>
                    </div>
                    <div className={styles['highlight-card']}>
                        <span className={styles['highlight-title']}>Collaboration communautaire</span>
                        <p className={styles['highlight-description']}>
                            Proposée par les membres du Discord : ouverte à tous les VTubers, avec soutien communication et
                            relais sur nos plateformes.
                        </p>
                    </div>
                    <div className={styles['highlight-card']}>
                        <span className={styles['highlight-title']}>Proposer un événement</span>
                        <p className={styles['highlight-description']}>
                            Contacte l'équipe via le salon support pour présenter ton projet et rejoindre la programmation
                            FRVtubers.
                        </p>
                        <a
                            className={styles['cta-link']}
                            href="https://discord.gg/meyHQYWvjU"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Rejoindre le Discord
                        </a>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
        <header className={styles['section-header']}>
            <h2>Types d'évènements</h2>
            <div className={styles.eventFilters}>
                <button
                    type="button"
                    className={`${styles.filterButton} ${filterMode === 'validated' ? styles['filterButton-active'] : ''}`}
                    onClick={() => setFilterMode('validated')}
                >
                    Évènements FRVtubers
                </button>
                <button
                    type="button"
                    className={`${styles.filterButton} ${filterMode === 'community' ? styles['filterButton-active'] : ''}`}
                    onClick={() => setFilterMode('community')}
                    disabled={communityLoading}
                >
                    Communauté
                </button>
            </div>
            <div>
                <h2 className={styles['section-title']}>Prochains événements</h2>
                <p className={styles['section-subtitle']}>
                    Les rendez-vous à venir au sein de la communauté. 
                    <br/>Clique sur un événement du calendrier pour obtenir tous les détails sur l'event !
                </p>
            </div>
        </header>
        <EventList
            events={upcomingEvents}
            emptyLabel={"Aucun événement à venir pour le moment. Ajoute l'événement via le #support-discord FRVtubers."}
            onSelect={handleSelectEvent}
        />
            </section>

            <section className={`${styles.section} ${styles['calendar-section']}`}>
                <header className={styles['section-header']}>
                    <div>
                        <h2 className={styles['section-title']}>Calendrier complet</h2>
                        <p className={styles['section-subtitle']}>
                            Bascule entre la vue liste et le planning mensuel pour visualiser l’ensemble des annonces FRVtubers.
                        </p>
                    </div>
        </header>
        <div className={styles['calendar-wrapper']}>
            <EventCalendarComponent
                initialEvents={filterMode === 'community' ? normalizedCommunity : normalizedAll}
                onSelectEvent={handleSelectEvent}
            />
        </div>
    </section>

            {pastEvents.length > 0 && (
                <section className={styles.section}>
                    <header className={styles['section-header']}>
                        <h2 className={styles['section-title']}>Événements passés</h2>
                        <p className={styles['section-subtitle']}>
                            Derniers événements récemment terminés.
                        </p>
                    </header>
                    <EventList events={pastEvents} emptyLabel="" onSelect={handleSelectEvent} />
                </section>
            )}
            {selectedEvent && (
                <EventModal eventEntry={selectedEvent} onClose={closeModal} />
            )}
        </div>
    );
}

function EventModal({ eventEntry, onClose }) {
    const { fullDate } = formatEventDate(eventEntry);
    const title = eventEntry?.event?.title ?? 'Événement';
    const description = eventEntry?.description;
    const organizers = eventEntry?.organizers ?? [];
    const link = eventEntry?.link;
    const thumbnail = eventEntry?.event?.thumbnail
        ?? eventEntry?.event?.image
        ?? eventEntry?.event?.cover
        ?? 'https://images.pexels.com/photos/987586/pexels-photo-987586.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
    const badge = buildProximityBadge(eventEntry);

    return (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Fermer">
                    ×
                </button>
                <div className={styles.modalHeader}>
                    <img src={thumbnail} alt={title} className={styles.modalImage} />
                    <div>
                        <span className={styles.eventDate}>{fullDate}</span>
                        <h3 className={styles.eventTitle}>{title}</h3>
                        {badge?.label && (
                            <span className={`${styles.badge} ${styles[`badge-${badge.tone}`]}`}>
                                {badge.label.charAt(0).toUpperCase() + badge.label.slice(1)}
                            </span>
                        )}
                    </div>
                </div>
                {description && <p className={styles.eventMeta}>{description}</p>}
                {organizers.length > 0 && (
                    <p className={styles.eventMeta}>
                        Organisateurs :{' '}
                        {organizers.map((org, index) => {
                            const name = org?.name ?? org?.display_name ?? org?.username;
                            const organizerLink = org?.link ?? org?.url;
                            const isLast = index === organizers.length - 1;
                            return (
                                <span key={`${name}-${index}`}>
                                    {organizerLink ? (
                                        <a href={organizerLink} target="_blank" rel="noreferrer">{name}</a>
                                    ) : (
                                        name
                                    )}
                                    {!isLast && ', '}
                                </span>
                            );
                        })}
                    </p>
                )}
                {link && (
                    <a className={styles.modalLink} href={link} target="_blank" rel="noreferrer">
                        Ouvrir le lien de l'événement
                    </a>
                )}
            </div>
        </div>
    );
}

export default EventCalendar;
