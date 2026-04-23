import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import './App.scss';
import styles from './HomePage.module.scss';

import API from './Api.js';
import Channel from './components/Channel.jsx';
import TwitchEmbedVideo from './Twitch.jsx';
import GameDirectory from './components/GameDirectory.jsx';
import NoStreamComponent from './components/NoStreamComponent.jsx';
import CarouselEvent from './CarouselEvent.jsx';

import { Context, EventContext } from './App.jsx';
import { Carousel } from 'primereact/carousel';

const LIVE_SHOWCASE_LIMIT = 5;
const TREND_LIMIT = 8;
const TREND_EMBED_LIMIT = 5;
const HERO_TREND_SLIDES = 2;
const HERO_DISCOVERY_SLIDES = 2;
const HERO_DESIRED_SLIDES = HERO_TREND_SLIDES + HERO_DISCOVERY_SLIDES;
const HERO_MIN_LIVE = 5;

const shuffleArray = (source) => {
    const array = [...source];
    for (let index = array.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    }
    return array;
};

function HomePage() {
    const [gamesOnLive, setGamesOnLive] = useState([]);
    const [trending, setTrending] = useState([]);
    const [frStreamers, qcStreamers, , , onlineStreamers] = useContext(Context);
    const [lastedEvents] = useContext(EventContext);
    const [viewportWidth, setViewportWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200
    );
    const [heroCarouselItems, setHeroCarouselItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingTrends, setLoadingTrends] = useState(true);
    const [heroPage, setHeroPage] = useState(0);
    const [hasHeroAutoAdvanced, setHasHeroAutoAdvanced] = useState(false);

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
                    setGamesOnLive(games ?? []);
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

    const liveStreamers = useMemo(() => {
        if (!onlineStreamers) {
            return [];
        }
        return shuffleArray(onlineStreamers).slice(0, LIVE_SHOWCASE_LIMIT);
    }, [onlineStreamers]);

    const communitySize = (frStreamers?.length ?? 0) + (qcStreamers?.length ?? 0);
    const liveCount = onlineStreamers?.filter((streamer) => streamer?.isStreaming).length ?? 0;
    const eventCount = lastedEvents?.length ?? 0;

    const heroStats = [
        { label: 'Lives en cours', value: liveCount },
        { label: 'Vtuber présent sur FRVStream', value: communitySize },
        { label: 'Évènements a venir', value: eventCount }
    ];
    const isMobile = viewportWidth <= 720;

    const hasLiveContent = liveStreamers.length > 0;
    const trendingVtubers = useMemo(
        () => (trending ?? []).map((entry) => entry?.vtuber ?? entry).filter(Boolean),
        [trending]
    );
    const trendingLiveStreamers = useMemo(
        () => trendingVtubers.filter((vt) => vt?.isStreaming && Array.isArray(vt?.listLastedStream) && vt.listLastedStream.length > 0),
        [trendingVtubers]
    );
    const hasTrends = trendingLiveStreamers.length > 0;

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
            const maxIndex = nextSlides.length - 1;
            if (maxIndex < 0) {
                return 0;
            }
            return previousPage > maxIndex ? maxIndex : previousPage;
        });
    }, [isMobile, trendingLiveStreamers, onlineStreamers]);

    useEffect(() => {
        const maxIndex = heroCarouselItems.length - 1;
        if (maxIndex >= 0 && heroPage > maxIndex) {
            setHeroPage(maxIndex);
        }
    }, [heroCarouselItems.length, heroPage]);

    const hasHeroSlides = heroCarouselItems.length > 1;
    const activeHeroId = heroCarouselItems[heroPage]?.id;
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
        const isActiveSlide = item?.id === activeHeroId && item?.slideIndex === heroPage;

        if (item?.type === 'intro') {
            return (
                <div className={styles['hero-slide']} key={item.id}>
                    <div className={styles.hero}>
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
                    </div>
                </div>
            );
        }

        const displayName = item?.streamer?.display_name ?? item?.streamer?.name ?? item?.channel;
        const avatarUrl = item?.streamer?.logo ?? item?.lastStream?.profile_image_url;
        const previewStyle = item?.preview
            ? { backgroundImage: `linear-gradient(120deg, rgba(0,0,0,0.65), rgba(0,0,0,0.2)), url(${item.preview})` }
            : undefined;
        const isDiscovery = item?.type === 'discovery';
        const placeholderStyle = isDiscovery
            ? { backgroundImage: 'linear-gradient(135deg, #0ea15f, #22c55e)' }
            : previewStyle;

        return (
            <div className={styles['hero-slide']} key={item.id}>
                <div className={styles['embed-card']}>
                    <div className={styles['embed-player']}>
                        {isActiveSlide ? (
                            <TwitchEmbedVideo
                                targetID={item.embedId}
                                channel={item.channel}
                                layout="video"
                                width="100%"
                                height="100%"
                                autoplay
                                muted
                                playsinline
                            />
                        ) : (
                            <div className={`${styles['embed-placeholder']} ${isDiscovery ? styles['embed-placeholder-discovery'] : ''}`} style={placeholderStyle}>
                                {isDiscovery && <span>✨ Découverte</span>}
                            </div>
                        )}
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
                            <a href={`https://twitch.tv/${encodeURIComponent(item.channel)}`} className={styles['action-secondary']} target="_blank" rel="noreferrer">
                                Ouvrir sur Twitch
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                        circular={false}
                        showIndicators={hasHeroSlides}
                        showNavigators={hasHeroSlides}
                        page={heroPage}
                        onPageChange={(event) => setHeroPage(event.page)}
                        itemTemplate={renderHeroCarouselItem}
                    />
                </section>
            )}

            {lastedEvents?.length > 0 && (
                <section className={styles.section}>
                    <header className={styles['section-header']}>
                        <div>
                            <h2 className={styles['section-title']}>A ne pas manquer</h2>
                            <p className={styles['section-description']}>
                                Les prochains rendez-vous FRVtubers et les collaborations qui arrivent tres bientot.
                            </p>
                        </div>
                        <Link to="/events" className={styles['section-link']}>
                            Tout voir
                        </Link>
                    </header>
                    <div className={styles['section-body']}>
                        <CarouselEvent initialEvents={lastedEvents} />
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

            {(hasTrends || !loadingTrends) && (
                <section className={styles.section}>
                    <header className={styles['section-header']}>
                        <div>
                            <h2 className={styles['section-title']}>Tendances en direct</h2>
                            <p className={styles['section-description']}>
                                Les Vtubers qui ont suscité le plus d'engagement ces dernières 24 heures et sont actuellement en live.
                            </p>
                        </div>
                        <Link to="/favorites" className={styles['section-link']}>
                            Gérer mes favoris
                        </Link>
                    </header>
                    <div className={styles['section-body']}>
                        {hasTrends ? (
                            <div className={`stream-carousel ${styles['live-carousel']} ${trendingLiveStreamers.length < 5 ? 'flex-carousel' : ''}`}>
                                {trendingLiveStreamers.map((streamer) => (
                                    <Channel key={streamer.id ?? streamer.name ?? streamer.display_name} streamer={streamer} />
                                ))}
                            </div>
                        ) : (
                            !loadingTrends && <div className={styles['section-description']}>Aucune tendance détectée pour le moment.</div>
                        )}
                    </div>
                </section>
            )}

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
                    {hasLiveContent ? (
                        <div className={`stream-carousel ${styles['live-carousel']} ${liveStreamers.length < 5 ? 'flex-carousel' : ''}`}>
                            {liveStreamers.map((streamer) => (
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
