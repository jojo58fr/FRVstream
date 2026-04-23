import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import './App.scss';
import styles from './HomePage.module.scss';

import API from './Api.js';
import Channel from './components/Channel.jsx';
import TwitchEmbedVideo from './Twitch.jsx';
import GameDirectory from './components/GameDirectory.jsx';
import NoStreamComponent from './components/NoStreamComponent.jsx';
import { DateTime } from 'luxon';
import { useSeo } from './components/Seo.jsx';

import { Context, EventContext, FavoritesContext, LoginContext } from './App.jsx';
import { Carousel } from 'primereact/carousel';

const LIVE_SHOWCASE_LIMIT = 5;
const TREND_LIMIT = 8;
const TREND_EMBED_LIMIT = 5;
const HERO_TREND_SLIDES = 2;
const HERO_DISCOVERY_SLIDES = 2;
const HERO_DESIRED_SLIDES = HERO_TREND_SLIDES + HERO_DISCOVERY_SLIDES;
const HERO_MIN_LIVE = 5;
const HOME_EVENTS_LIMIT = 3;

const shuffleArray = (source) => {
    const array = [...source];
    for (let index = array.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    }
    return array;
};

const normalizeHomeEvent = (entry) => {
    if (!entry) {
        return null;
    }

    const event = entry.event ? { ...entry.event } : { ...entry };
    const startDate = event?.start ? DateTime.fromISO(event.start) : null;
    const endDate = event?.end ? DateTime.fromISO(event.end) : null;

    return {
        ...entry,
        event,
        startDate: startDate?.isValid ? startDate : null,
        endDate: endDate?.isValid ? endDate : null,
        description: entry?.description ?? event?.description ?? null,
        link: entry?.link ?? event?.link ?? null,
        organizers: Array.isArray(entry?.eventOrganizers) ? entry.eventOrganizers : [],
        thumbnail:
            event?.thumbnail ??
            entry?.thumbnail ??
            event?.image ??
            event?.cover ??
            'https://images.pexels.com/photos/987586/pexels-photo-987586.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };
};

const formatHomeEventDate = (entry) => {
    const startDate = entry?.startDate;
    const endDate = entry?.endDate;
    if (!startDate) {
        return 'Date à confirmer';
    }

    const localizedStart = startDate.setLocale('fr');
    const localizedEnd = endDate?.setLocale('fr');

    if (localizedEnd) {
        return `${localizedStart.toFormat("ccc d LLL '•' HH'h'mm")} — ${localizedEnd.toFormat("HH'h'mm")}`;
    }
    return localizedStart.toFormat("ccc d LLL '•' HH'h'mm");
};

const isHomeEventValidated = (entry) => {
    if (!entry) return false;

    const status = entry?.event?.status ?? entry?.status;
    const normalized = status ? String(status).toLowerCase() : '';

    if (normalized === 'pending' || normalized === 'rejected') {
        return false;
    }

    if (typeof entry?.validated === 'boolean') return entry.validated;
    if (typeof entry?.event?.validated === 'boolean') return entry.event.validated;
    if (normalized) {
        return normalized === 'validated' || normalized === 'approved' || normalized === 'official';
    }

    // Par défaut, on considère les évènements officiels (feed principal) comme validés
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

const HeroCarouselSlide = ({ item, isActive }) => {
    const displayName = item?.streamer?.display_name ?? item?.streamer?.name ?? item?.channel;
    const avatarUrl = item?.streamer?.logo ?? item?.lastStream?.profile_image_url;
    const previewStyle = item?.preview
        ? { backgroundImage: `linear-gradient(120deg, rgba(0,0,0,0.65), rgba(0,0,0,0.2)), url(${item.preview})` }
        : undefined;
    const isDiscovery = item?.type === 'discovery';
    const embedTargetId = useMemo(
        () => {
            const baseId = item?.embedId ?? item?.id ?? item?.channel ?? 'hero-slide';
            return `${baseId}-${Math.random().toString(36).slice(2, 10)}`;
        },
        [item?.embedId, item?.id, item?.channel]
    );

    return (
        <div className={styles['hero-slide']} key={item.id}>
            <div className={styles['embed-card']}>
                <div className={styles['embed-player']} style={previewStyle}>
                    <TwitchEmbedVideo
                        key={`${item.id}-${item.channel}-${isActive ? 'active' : 'idle'}`}
                        targetID={embedTargetId}
                        channel={item.channel}
                        layout="video"
                        width="100%"
                        height="100%"
                        autoplay={isActive}
                        muted
                        playsinline
                    />
                </div>
                <div className={styles['embed-meta']}>
                    <div className={styles['embed-header']}>
                        <span className={`${styles['embed-rank']} ${isDiscovery ? styles['discovery-badge'] : ''}`}>
                            {isDiscovery ? '✨ Découverte' : '🔥 Tendance'}
                        </span>
                        <div className={styles['embed-host']}>
                            {avatarUrl && <img src={avatarUrl} alt={displayName} />}
                            <div>
                                <p className={styles['embed-host-kicker']}>En direct sur Twitch</p>
                                <h3 className={styles['embed-host-name']}>{displayName}</h3>
                            </div>
                        </div>
                    </div>
                    <p className={styles['embed-title']}>{item?.lastStream?.title}</p>
                    <p className={styles['embed-game']}>{item?.lastStream?.game_name}</p>
                    <div className={styles['embed-actions']}>
                        <Link to={`/c/${encodeURIComponent(item.channel)}`} className={styles['action-primary']}>
                            Voir la chaîne
                        </Link>
                        <a
                            href={`https://twitch.tv/${encodeURIComponent(item.channel)}`}
                            className={styles['action-secondary']}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Ouvrir sur Twitch
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

function HomePage() {
    const [gamesOnLive, setGamesOnLive] = useState([]);
    const [trending, setTrending] = useState([]);
    const [frStreamers, qcStreamers, , , onlineStreamers] = useContext(Context);
    const [lastedEvents, initialEventsContext] = useContext(EventContext);
    const favoritesCtx = useContext(FavoritesContext);
    const [isLogged] = useContext(LoginContext);
    const [viewportWidth, setViewportWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200
    );
    const [heroCarouselItems, setHeroCarouselItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingTrends, setLoadingTrends] = useState(true);
    const [heroPage, setHeroPage] = useState(0);
    const [hasHeroAutoAdvanced, setHasHeroAutoAdvanced] = useState(false);
    const [activeHeroId, setActiveHeroId] = useState(null);

    useSeo({
        title: 'Accueil',
        description: 'Retrouve les VTubers francophones en direct, les tendances et le calendrier FRVtubers/VTuberQC sur une seule plateforme.',
        canonicalPath: '/',
        image: '/Banner_Horizon_July2023.webp'
    });

    useEffect(() => {
        const handleResize = () => {
            if (typeof window === 'undefined') {
                return;
            }
            setViewportWidth(window.innerWidth);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadGames = async () => {
            try {
                const games = await API.getGamesOnLive();
                if (isMounted) {
                    setGamesOnLive((games ?? []).slice(0, 10));
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadGames();
        const loadTrends = async () => {
            try {
                const res = await API.getTrends(TREND_LIMIT);
                if (isMounted) {
                    setTrending(res ?? []);
                }
            } finally {
                if (isMounted) {
                    setLoadingTrends(false);
                }
            }
        };

        loadTrends();

        return () => {
            isMounted = false;
        };
    }, []);

    const frLiveStreamers = useMemo(
        () =>
            (frStreamers ?? []).filter(
                (streamer) => streamer?.isStreaming && Array.isArray(streamer?.listLastedStream) && streamer.listLastedStream.length > 0
            ),
        [frStreamers]
    );

    const qcLiveStreamers = useMemo(
        () =>
            (qcStreamers ?? []).filter(
                (streamer) => streamer?.isStreaming && Array.isArray(streamer?.listLastedStream) && streamer.listLastedStream.length > 0
            ),
        [qcStreamers]
    );

    const frLiveShowcase = useMemo(
        () => frLiveStreamers.slice(0, LIVE_SHOWCASE_LIMIT),
        [frLiveStreamers]
    );

    const qcLiveShowcase = useMemo(
        () => qcLiveStreamers.slice(0, LIVE_SHOWCASE_LIMIT),
        [qcLiveStreamers]
    );

    const favorites = favoritesCtx?.favorites ?? [];
    const favoriteStreams = favoritesCtx?.favoriteStreams ?? [];
    const refreshFavorites = favoritesCtx?.refreshFavorites;
    const refreshFavoriteStreams = favoritesCtx?.refreshFavoriteStreams;

    useEffect(() => {
        refreshFavorites?.();
        refreshFavoriteStreams?.();
    }, [refreshFavorites, refreshFavoriteStreams]);

    const favoritesWithStreams = useMemo(() => {
        if (!Array.isArray(favorites)) {
            return [];
        }

        return favorites.map((fav) => {
            const match = favoriteStreams.find((entry) => {
                const vtuber = entry?.vtuber ?? entry?.vtuberData;
                const streams = entry?.streams ?? entry?.listLastedStream ?? [];

                const twitchIdMatch = vtuber?.twitchId && String(vtuber.twitchId) === String(fav.twitchId);
                const idMatch = vtuber?.id === fav.id || entry?.vtuberId === fav.id;

                const loginMatch = streams.some(
                    (stream) =>
                        stream?.user_login &&
                        (stream.user_login === fav.name || stream.user_login === fav.display_name)
                );

                return twitchIdMatch || idMatch || loginMatch;
            });

            const streams = match?.streams ?? match?.listLastedStream ?? [];
            const isStreaming = Array.isArray(streams) && streams.length > 0;
            return {
                ...fav,
                isStreaming,
                listLastedStream: streams
            };
        });
    }, [favorites, favoriteStreams]);

    const liveFavorites = useMemo(
        () => favoritesWithStreams.filter((fav) => fav?.isStreaming && fav?.listLastedStream?.length),
        [favoritesWithStreams]
    );

    const liveFavoritesShowcase = useMemo(
        () => liveFavorites.slice(0, LIVE_SHOWCASE_LIMIT),
        [liveFavorites]
    );

    const communitySize = (frStreamers?.length ?? 0) + (qcStreamers?.length ?? 0);
    const liveCount = onlineStreamers?.filter((streamer) => streamer?.isStreaming).length ?? 0;
    const eventCount = lastedEvents?.length ?? 0;

    const heroStats = [
        { label: 'Lives en cours', value: liveCount },
        { label: 'Vtubers présents sur FRVStream', value: communitySize },
        { label: 'Évènements a venir', value: eventCount }
    ];
    const isMobile = viewportWidth <= 720;
    const trendingVtubers = useMemo(
        () => (trending ?? []).map((entry) => entry?.vtuber ?? entry).filter(Boolean),
        [trending]
    );
    const trendingLiveStreamers = useMemo(
        () => trendingVtubers.filter((vt) => vt?.isStreaming && Array.isArray(vt?.listLastedStream) && vt.listLastedStream.length > 0),
        [trendingVtubers]
    );
    const hasTrends = trendingLiveStreamers.length > 0;
    const hasFrLive = frLiveShowcase.length > 0;
    const hasQcLive = qcLiveShowcase.length > 0;
    const hasFavoriteLive = liveFavoritesShowcase.length > 0;

    const upcomingEventsHome = useMemo(() => {
        const now = DateTime.now();
        const source = Array.isArray(lastedEvents) && lastedEvents.length
            ? lastedEvents
            : Array.isArray(initialEventsContext) ? initialEventsContext : [];

        return source
            .map(normalizeHomeEvent)
            .filter((entry) => entry?.startDate && entry.startDate >= now && isHomeEventValidated(entry))
            .sort((a, b) => (a.startDate?.toMillis?.() ?? 0) - (b.startDate?.toMillis?.() ?? 0))
            .slice(0, HOME_EVENTS_LIMIT);
    }, [lastedEvents, initialEventsContext]);

    useEffect(() => {
        if (isMobile) {
            const introOnly = [{ type: 'intro', id: 'intro', slideIndex: 0 }];
            setHeroCarouselItems(introOnly);
            setHeroPage(0);
            return;
        }

        const introSlide = { type: 'intro', id: 'intro', slideIndex: 0 };
        const trendPool = [...trendingLiveStreamers];
        const selectRandom = (arr, count) => shuffleArray(arr).slice(0, count);

        const pickedTrends = selectRandom(trendPool, HERO_TREND_SLIDES);

        const allLivePool = (onlineStreamers ?? []).filter(
            (vt) => vt?.isStreaming && Array.isArray(vt?.listLastedStream) && vt.listLastedStream.length > 0
        );
        if (allLivePool.length < HERO_MIN_LIVE) {
            setHeroCarouselItems([introSlide]);
            setHeroPage(0);
            return;
        }
        const trendIds = new Set(
            trendPool.map((vt) => vt?.id ?? vt?.name ?? vt?.display_name ?? vt?.slug).filter(Boolean)
        );
        const discoveryPool = allLivePool.filter(
            (vt) => !trendIds.has(vt?.id ?? vt?.name ?? vt?.display_name ?? vt?.slug)
        );
        const pickedDiscoveries = selectRandom(discoveryPool.length > 0 ? discoveryPool : allLivePool, HERO_DISCOVERY_SLIDES);

        const mapToItem = (streamer, index, type) => {
            const lastStream = streamer?.listLastedStream?.[0];
            const channelSlug = lastStream?.user_login ?? streamer?.name ?? streamer?.display_name ?? streamer?.slug;
            if (!channelSlug || !lastStream) {
                return null;
            }
            if (type === 'discovery' && trendIds.has(streamer?.id ?? channelSlug)) {
                return null;
            }
            const preview = lastStream?.thumbnail_url
                ?.replace('{width}', '1600')
                ?.replace('{height}', '900');
            return {
                type,
                id: `${type}-${streamer?.id ?? channelSlug ?? index}`,
                embedId: `${type}-embed-${streamer?.id ?? channelSlug ?? index}`,
                rank: type === 'stream' ? index + 1 : undefined,
                streamer,
                channel: channelSlug,
                lastStream,
                preview
            };
        };

        const slides = [];
        let slideIndex = 1;
        const seenChannels = new Set();

        pickedTrends
            .map((streamer, index) => mapToItem(streamer, index, 'stream'))
            .filter(Boolean)
            .forEach((item) => {
                if (seenChannels.has(item.channel)) {
                    return;
                }
                seenChannels.add(item.channel);
                slides.push({ ...item, slideIndex: slideIndex++ });
            });

        pickedDiscoveries
            .map((streamer, index) => mapToItem(streamer, index, 'discovery'))
            .filter(Boolean)
            .forEach((item) => {
                if (seenChannels.has(item.channel)) {
                    return;
                }
                seenChannels.add(item.channel);
                slides.push({ ...item, slideIndex: slideIndex++ });
            });

        if (slides.length < HERO_DESIRED_SLIDES) {
            const fallbackPool = shuffleArray([...trendPool, ...allLivePool]);
            for (let i = 0; i < fallbackPool.length && slides.length < HERO_DESIRED_SLIDES; i += 1) {
                const candidate = fallbackPool[i];
                const candidateId = candidate?.id ?? candidate?.name ?? candidate?.display_name ?? candidate?.slug;
                if (!candidateId) {
                    continue;
                }
                const candidateType = trendIds.has(candidateId) ? 'stream' : 'discovery';
                const mapped = mapToItem(candidate, slides.length, candidateType);
                if (!mapped || seenChannels.has(mapped.channel)) {
                    continue;
                }
                seenChannels.add(mapped.channel);
                slides.push({ ...mapped, slideIndex: slideIndex++ });
            }
        }

        const nextSlides = [introSlide, ...slides];
        setHeroCarouselItems(nextSlides);
        setHeroPage((previousPage) => {
            const total = nextSlides.length;
            if (total <= 0) {
                return 0;
            }
            return ((previousPage % total) + total) % total;
        });
    }, [isMobile, trendingLiveStreamers, onlineStreamers]);

    useEffect(() => {
        const total = heroCarouselItems.length;
        if (total === 0 && heroPage !== 0) {
            setHeroPage(0);
            return;
        }
        if (total > 0 && heroPage >= total) {
            setHeroPage(((heroPage % total) + total) % total);
        }
    }, [heroCarouselItems.length, heroPage]);

    const hasHeroSlides = heroCarouselItems.length > 1;

    useEffect(() => {
        setActiveHeroId(heroCarouselItems[heroPage]?.id ?? null);
    }, [heroCarouselItems, heroPage]);
    useEffect(() => {
        if (!hasHeroSlides || isMobile || heroPage !== 0 || hasHeroAutoAdvanced) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setHeroPage(1);
            setHasHeroAutoAdvanced(true);
        }, 9000);

        return () => clearTimeout(timer);
    }, [hasHeroSlides, isMobile, heroPage, hasHeroAutoAdvanced]);

    const renderHeroCarouselItem = (item) => {
        const isActiveSlide = item?.id === activeHeroId;

        if (item?.type === 'intro') {
            return (
                <div className={styles['hero-slide']} key={item.id}>
                    <div className={styles.hero}>
                        <div className={styles['hero-content']}>
                            <h1 className={styles['hero-title']}>
                                Tout le streaming VTuberFR réuni en un seul endroit
                            </h1>
                            <p className={styles['hero-subtitle']}>
                                Découvre les lives, le planning d&apos;évènements des VtuberFR présent sur FRVtubers et VtuberQC ! 
                                <br/>FRVtubers est un lieu de rassemblement pour tous les talents francophones, c&apos;est l&apos;endroit parfait pour ne rien louper !
                            </p>
                            <div className={styles['hero-actions']}>
                                <Link to="/events" className={styles['action-primary']}>
                                    Voir les évènements
                                </Link>
                                <Link to="/french-channels" className={styles['action-secondary']}>
                                    Explorer les créateurs
                                </Link>
                            </div>
                        </div>
                        <aside className={styles['hero-stats']}>
                            {heroStats.map((stat) => (
                                <div key={stat.label} className={styles['stat-card']}>
                                    <span className={styles['stat-value']}>{stat.value}</span>
                                    <span className={styles['stat-label']}>{stat.label}</span>
                                </div>
                            ))}
                        </aside>
                    </div>
                </div>
            );
        }

        return <HeroCarouselSlide item={item} isActive={isActiveSlide} />;
    };

    const handleHeroPageChange = (event) => {
        if (typeof event?.page !== 'number') {
            return;
        }

        setHeroPage(event.page);
    };

    return (
        <div className={styles.page}>
            {isMobile ? (
                <section className={styles.hero}>
                    <div className={styles['hero-content']}>
                        <span className={styles['hero-kicker']}>FRVtubers</span>
                        <h1 className={styles['hero-title']}>
                            Tous le streaming VTuber FR réunies en un seul endroit
                        </h1>
                        <p className={styles['hero-subtitle']}>
                            Découvre les lives, le plannings d&apos;évènement des VtuberFR présent sur FRVtubers et VtuberQC ! 
                            <br/>FRVtubers est un lieu de rassemblement pour tous les talents francophones, c&apos;est l&apos;endroit parfait pour rien louper !
                        </p>
                        <div className={styles['hero-actions']}>
                            <Link to="/events" className={styles['action-primary']}>
                                Voir les évènements
                            </Link>
                            <Link to="/french-channels" className={styles['action-secondary']}>
                                Explorer les créateurs
                            </Link>
                        </div>
                    </div>
                    <aside className={styles['hero-stats']}>
                        {heroStats.map((stat) => (
                            <div key={stat.label} className={styles['stat-card']}>
                                <span className={styles['stat-value']}>{stat.value}</span>
                                <span className={styles['stat-label']}>{stat.label}</span>
                            </div>
                        ))}
                    </aside>
                </section>
            ) : (
                <section className={styles['hero-carousel']}>
                    <Carousel
                        value={heroCarouselItems}
                        numVisible={1}
                        numScroll={1}
                        circular
                        showIndicators={hasHeroSlides}
                        showNavigators={hasHeroSlides}
                        page={heroPage}
                        /*onPageChange={handleHeroPageChange}*/
                        itemTemplate={renderHeroCarouselItem}
                    />
                </section>
            )}

            {upcomingEventsHome.length > 0 && (
                <section className={styles.section}>
                    <header className={styles['section-header']}>
                        <div>
                            <h2 className={styles['section-title']}>À ne pas manquer</h2>
                            <p className={styles['section-description']}>
                                Les prochains rendez-vous FRVtubers et les collaborations qui arrivent très bientôt.
                            </p>
                        </div>
                        <Link to="/events" className={styles['section-link']}>
                            Voir tous les évènements
                        </Link>
                    </header>
                    <div className={styles['section-body']}>
                        <div className={styles['events-grid']}>
                            {upcomingEventsHome.map((event) => {
                                const key = event?.event?.id ?? event?.event?.title ?? event?.startDate?.toISO?.();
                                const dateLabel = formatHomeEventDate(event);
                                const relative = event?.startDate?.toRelative({ locale: 'fr' });
                                const badge = buildProximityBadge(event);
                                const description = event?.description;

                                return (
                                    <article key={key} className={styles['event-card']}>
                                        <div
                                            className={styles['event-thumb']}
                                            style={{
                                                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.6)), url(${event.thumbnail})`
                                            }}
                                        >
                                            {badge?.label && (
                                                <span className={`${styles.badge} ${styles[`badge-${badge.tone}`]} ${styles['event-badge']}`}>
                                                    {badge.label.charAt(0).toUpperCase() + badge.label.slice(1)}
                                                </span>
                                            )}
                                        </div>
                                        <div className={styles['event-content']}>
                                            <span className={styles['event-date']}>{dateLabel}</span>
                                            <h3 className={styles['event-title']}>{event?.event?.title}</h3>
                                            {description && (
                                                <p className={styles['event-text']}>
                                                    {description.length > 140 ? `${description.slice(0, 137)}...` : description}
                                                </p>
                                            )}
                                            <div className={styles['event-actions']}>
                                                {event?.link && (
                                                    <a href={event.link} target="_blank" rel="noreferrer" className={styles['event-cta']}>
                                                        Ouvrir le lien
                                                    </a>
                                                )}
                                                <Link to="/events" className={styles['event-secondary']}>
                                                    Voir tout le calendrier
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {hasTrends && (
                <section className={styles.section}>
                    <header className={styles['section-header']}>
                        <div>
                            <h2 className={styles['section-title']}>Tendances en direct</h2>
                            <p className={styles['section-description']}>
                                Les Vtubers qui ont suscité le plus d'engagement ces dernières 24 heures et sont actuellement en live.
                            </p>
                        </div>
                    </header>
                    <div className={styles['section-body']}>
                        <div className={`stream-carousel ${styles['live-carousel']} ${trendingLiveStreamers.length < 5 ? 'flex-carousel' : ''}`}>
                            {trendingLiveStreamers.map((streamer) => (
                                <Channel key={streamer.id ?? streamer.name ?? streamer.display_name} streamer={streamer} />
                            ))}
                        </div>
                    </div>
                </section>
            )}


            {gamesOnLive?.length > 0 && (
                <section className={styles.section}>
                    <header className={styles['section-header']}>
                        <div>
                            <h2 className={styles['section-title']}>Jeux en vedette</h2>
                            <p className={styles['section-description']}>
                                Une selection des jeux qui animent la communaute en ce moment meme.
                            </p>
                        </div>
                        <Link to="/d" className={styles['section-link']}>
                            Parcourir les categories
                        </Link>
                    </header>
                    <div className={styles['section-body']}>
                        <GameDirectory gamesOnLive={gamesOnLive} />
                    </div>
                </section>
            )}


            <section className={styles.section}>
                <header className={styles['section-header']}>
                    <div>
                        <h2 className={styles['section-title']}>Mes Favoris</h2>
                        <p className={styles['section-description']}>
                            Retrouve tes VTubers préférés et leurs lives en cours.
                        </p>
                    </div>
                    <Link to="/favorites" className={styles['section-link']}>
                        Gérer mes favoris
                    </Link>
                </header>
                <div className={styles['section-body']}>
                    {!isLogged && (
                        <div className={styles['section-description']}>
                            Connecte-toi pour voir tes favoris en live.
                        </div>
                    )}
                    {isLogged && hasFavoriteLive && (
                        <div className={`stream-carousel ${styles['live-carousel']} ${liveFavoritesShowcase.length < 5 ? 'flex-carousel' : ''}`}>
                            {liveFavoritesShowcase.map((streamer) => (
                                <Channel key={streamer.id ?? streamer.name ?? streamer.display_name} streamer={streamer} />
                            ))}
                        </div>
                    )}
                    {isLogged && !hasFavoriteLive && <NoStreamComponent />}
                </div>
            </section>

            <section className={styles.section}>
                <header className={styles['section-header']}>
                    <div>
                        <h2 className={styles['section-title']}>VtuberFR en direct</h2>
                    </div>
                    <Link to="/french-channels" className={styles['section-link']}>
                        Voir tous les VtuberFR
                    </Link>
                </header>
                <div className={styles['section-body']}>
                    {hasFrLive ? (
                        <div className={`stream-carousel ${styles['live-carousel']} ${frLiveShowcase.length < 5 ? 'flex-carousel' : ''}`}>
                            {frLiveShowcase.map((streamer) => (
                                <Channel key={streamer.name ?? streamer.display_name} streamer={streamer} />
                            ))}
                        </div>
                    ) : (
                        !loading && <NoStreamComponent />
                    )}
                </div>
            </section>

            <section className={styles.section}>
                <header className={styles['section-header']}>
                    <div>
                        <h2 className={styles['section-title']}>VtuberQC en direct</h2>
                    </div>
                    <Link to="/quebecers-channels" className={styles['section-link']}>
                        Voir tous les VtuberQC
                    </Link>
                </header>
                <div className={styles['section-body']}>
                    {hasQcLive ? (
                        <div className={`stream-carousel ${styles['live-carousel']} ${qcLiveShowcase.length < 5 ? 'flex-carousel' : ''}`}>
                            {qcLiveShowcase.map((streamer) => (
                                <Channel key={streamer.name ?? streamer.display_name} streamer={streamer} />
                            ))}
                        </div>
                    ) : (
                        !loading && <NoStreamComponent />
                    )}
                </div>
            </section>


        </div>
    );
}

export default HomePage;
