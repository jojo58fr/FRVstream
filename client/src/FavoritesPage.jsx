import { useContext, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import styles from './FavoritesPage.module.scss';
import Channel from './components/Channel.jsx';
import StreamerCard from './components/StreamerCard.jsx';
import NoStreamComponent from './components/NoStreamComponent.jsx';
import { FavoritesContext, LoginContext } from './App.jsx';
import { useSeo } from './components/Seo.jsx';

function FavoritesPage() {
    const favoritesCtx = useContext(FavoritesContext);
    const [isLogged] = useContext(LoginContext);

    useSeo({
        title: 'Mes favoris',
        description: 'Retrouve rapidement tes VTubers francophones favoris et vois qui est en direct sur FRVStream.',
        canonicalPath: '/favorites'
    });

    const favorites = favoritesCtx?.favorites ?? [];
    const favoriteStreams = favoritesCtx?.favoriteStreams ?? [];
    const refreshFavorites = favoritesCtx?.refreshFavorites;
    const refreshFavoriteStreams = favoritesCtx?.refreshFavoriteStreams;

    useEffect(() => {
        refreshFavorites?.(true);
        refreshFavoriteStreams?.(true);
    }, [refreshFavorites, refreshFavoriteStreams]);

    const favoritesWithStreams = useMemo(() => {
        if (!Array.isArray(favorites)) {
            return [];
        }

        return favorites.map((fav) => {
            const match = favoriteStreams.find((entry) => {
                const vtuber = entry?.vtuber ?? entry?.vtuberData;
                const streams = entry?.streams ?? [];
                
                const twitchIdMatch = vtuber?.twitchId && (String(vtuber.twitchId) === String(fav.twitchId));
                const idMatch = vtuber?.id === fav.id || entry?.vtuberId === fav.id;
                
                const loginMatch = streams.some((stream) => stream?.user_login && (
                    stream.user_login === fav.name || stream.user_login === fav.display_name
                ));

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

    const multiviewChannels = useMemo(() => {
        const seen = new Set();
        return liveFavorites
            .map((fav) => {
                const stream = Array.isArray(fav?.listLastedStream) ? fav.listLastedStream[0] : null;
                const login = stream?.user_login ?? fav?.name ?? fav?.display_name;
                if (!login) {
                    return null;
                }
                const slug = String(login).trim();
                if (!slug || seen.has(slug)) {
                    return null;
                }
                seen.add(slug);
                return slug;
            })
            .filter(Boolean);
    }, [liveFavorites]);

    const multiviewHref = useMemo(
        () => (multiviewChannels.length ? `/multiview/${multiviewChannels.map((slug) => encodeURIComponent(slug)).join('/')}` : null),
        [multiviewChannels]
    );

    const offlineFavorites = useMemo(
        () => favoritesWithStreams.filter((fav) => !fav?.isStreaming),
        [favoritesWithStreams]
    );

    if (!isLogged) {
        return (
            <div className={styles.page}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Mes VTubers préférés</h1>
                    <p className={styles.subtitle}>
                        Connecte-toi avec ton compte FRVTubers (Discord) pour retrouver tes favoris et suivre qui est en live.
                    </p>
                </div>
                <div className={styles.loginPrompt}>
                    <p>Tu dois être connecté(e) pour gérer tes favoris.</p>
                    <Link to="/login" className={styles.loginLink}>Se connecter</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Mes VTubers préférés</h1>
                <p className={styles.subtitle}>
                    Ta liste personnalisée de créateurs FR et QC. Ajoute des favoris via le menu latéral ou les cartes, et retrouve-les ici.
                </p>
                {isLogged && (
                    <div className={styles.actions}>
                        {multiviewHref ? (
                            <Link to={multiviewHref} className={styles.multiViewButton}>
                                <i className="pi pi-th-large" aria-hidden="true" />
                                Mettre en vue multiple
                            </Link>
                        ) : (
                            <button type="button" className={`${styles.multiViewButton} ${styles.disabled}`} disabled>
                                <i className="pi pi-th-large" aria-hidden="true" />
                                Mettre en vue multiple
                            </button>
                        )}
                        {!multiviewHref && (
                            <span className={styles.helper}>Aucun favori en live pour le moment.</span>
                        )}
                    </div>
                )}
            </div>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>En direct</h2>
                {liveFavorites.length > 0 ? (
                    <div className={`${styles.liveGrid} ${liveFavorites.length < 5 ? styles.liveGridFlex : ''}`}>
                        {liveFavorites.map((streamer) => (
                            <Channel key={streamer.id ?? streamer.name} streamer={streamer} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <NoStreamComponent />
                    </div>
                )}
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Hors ligne</h2>
                {offlineFavorites.length > 0 ? (
                    <div className={styles.offlineGrid}>
                        {offlineFavorites.map((streamer) => {
                            return(<StreamerCard key={streamer.id ?? streamer.name} streamer={streamer} />)
                        })}
                    </div>
                ) : (
                    <div className={styles.empty}>Aucun favori hors ligne pour le moment.</div>
                )}
            </section>
        </div>
    );
}

export default FavoritesPage;
