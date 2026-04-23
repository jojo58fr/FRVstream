import { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DateTime } from 'luxon';

import styles from './Profile.module.scss';

import { LoginContext, FavoritesContext, EventContext } from './App.jsx';
import { useSeo } from './components/Seo.jsx';
import UniversalLoginSystem from './UniversalLoginSystem/index.js';
import defaultProfil from './assets/default-profil.jpg';

const formatStatus = (value, fallback = 'Non renseigné') => {
    if (typeof value === 'boolean') {
        return value ? 'Actif' : 'Non actif';
    }
    if (typeof value === 'string' && value.trim().length > 0) {
        return value;
    }
    return fallback;
};

function Profile() {
    const [isLogged, setIsLogged] = useContext(LoginContext);
    const favoritesCtx = useContext(FavoritesContext);
    const [lastedEvents, initialEvents] = useContext(EventContext);

    useSeo({
        title: 'Mon profil FRVStream',
        description: 'Retrouve ton identité FRVTubers, l\'état de ta connexion et les raccourcis utiles pour contribuer à FRVStream.',
        canonicalPath: '/profil',
        robots: isLogged ? 'index, follow' : 'noindex, nofollow'
    });

    const displayName = useMemo(
        () =>
            isLogged?.user?.username
            ?? isLogged?.user?.name
            ?? isLogged?.session?.user?.name
            ?? 'Utilisateur FRVStream',
        [isLogged]
    );

    const avatar = useMemo(
        () => isLogged?.session?.user?.image ?? defaultProfil,
        [isLogged]
    );

    const isModerator = useMemo(() => {
        const rawFlag =
            isLogged?.adminRole
            ?? isLogged?.isAdmin
            ?? isLogged?.isModerator
            ?? isLogged?.session?.adminRole
            ?? isLogged?.session?.user?.adminRole;

        if (typeof rawFlag === 'boolean') {
            return rawFlag;
        }
        if (typeof rawFlag === 'string' && rawFlag.trim().length > 0) {
            return true;
        }

        const discordRoles = isLogged?.session?.discordMember?.roles;
        if (Array.isArray(discordRoles)) {
            return discordRoles.some((role) => typeof role === 'string' && /admin|mod[ée]rateur/i.test(role));
        }

        return false;
    }, [isLogged]);

    const favoritesCount = favoritesCtx?.favorites?.length ?? 0;

    const upcomingEventsCount = useMemo(() => {
        const now = DateTime.now();
        const base = [
            ...(Array.isArray(lastedEvents) ? lastedEvents : []),
            ...(Array.isArray(initialEvents) ? initialEvents : [])
        ];
        const seen = new Set();

        return base.reduce((count, entry) => {
            const start = entry?.event?.start ?? entry?.start_ts ?? entry?.start;
            const eventId = entry?.event?.id ?? entry?.id;
            if (!start) {
                return count;
            }
            const startDate = DateTime.fromISO(start);
            if (!startDate.isValid || startDate < now) {
                return count;
            }
            const key = eventId ?? `${entry?.event?.title ?? entry?.title ?? 'event'}-${startDate.toISODate()}`;
            if (seen.has(key)) {
                return count;
            }
            seen.add(key);
            return count + 1;
        }, 0);
    }, [initialEvents, lastedEvents]);

    const vtuberName = isLogged?.vtuber?.display_name ?? isLogged?.vtuber?.name ?? null;

    const handleLogout = async () => {
        const res = await UniversalLoginSystem.request_logout();
        if (res === 1) {
            setIsLogged(null);
        }
    };

    if (!isLogged) {
        return (
            <div className={styles.page}>
                <section className={styles.locked}>
                    <div>
                        <p className={styles.kicker}>Profil FRVStream</p>
                        <h1>Retrouve tes infos FRVTubers</h1>
                        <p className={styles.subtitle}>
                            Connecte-toi avec Discord pour voir tes données FRVStream et accéder aux outils dédiés à la communauté.
                        </p>
                    </div>
                    <div className={styles.lockedActions}>
                        <Link to="/login" className={styles.primaryAction}>Se connecter</Link>
                        <Link to="/events" className={styles.secondaryAction}>Voir l'agenda</Link>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.identity}>
                    <div className={styles.avatar}>
                        <img src={avatar} alt={displayName} />
                    </div>
                    <div>
                        <p className={styles.kicker}>Profil FRVStream</p>
                        <h1>{displayName}</h1>
                        <p className={styles.subtitle}>
                            Tour d'ensemble & actions rapides que tu peux faire sur la plateforme FRVStream.
                        </p>
                        <div className={styles.badges}>
                            {vtuberName && (
                                <span className={`${styles.badge} ${styles.neutral}`}>VTuber : {vtuberName}</span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

<section className={styles.section}>
                <header className={styles.sectionHeader}>
                    <div>
                        <p className={styles.kicker}>Actions rapides</p>
                        <h2>Ce que tu peux faire</h2>
                        <p className={styles.subtitle}>Retrouve les raccourcis liés à ton compte FRVStream.</p>
                    </div>
                </header>
                <div className={styles.cardsGrid}>
                    <Link to="/profil/proposer-evenement" className={styles.card}>
                        <div className={styles.cardIcon}><i className="pi pi-megaphone" aria-hidden="true" /></div>
                        <div className={styles.cardContent}>
                            <h3>Proposer un événement</h3>
                            <p>Envoie tes idées d'évènements à l'équipe de modération ou partage un projet lié à ton contenu.</p>
                            <span className={styles.cardLink}>Préparer ma proposition</span>
                        </div>
                    </Link>
                    {isModerator && (
                        <Link to="/admin" className={styles.card}>
                            <div className={styles.cardIcon}><i className="pi pi-shield" aria-hidden="true" /></div>
                            <div className={styles.cardContent}>
                                <h3>Panel administrateur</h3>
                                <p>Accès modération : créer un évènement ou valider/refuser les propositions communautaires.</p>
                                <span className={styles.cardLink}>Ouvrir le panel</span>
                            </div>
                        </Link>
                    )}
                    {/* <Link to="/stats" className={styles.card}>
                        <div className={styles.cardIcon}><i className="pi pi-chart-line" aria-hidden="true" /></div>
                        <div className={styles.cardContent}>
                            <h3>Voir tes stats persos</h3>
                            <p>Analyse les audiences et tendances FRVStream pour mieux planifier tes lives.</p>
                            <span className={styles.cardLink}>Ouvrir la page stats</span>
                        </div>
                    </Link> */}
                </div>
            </section>

            <section className={styles.section}>
                <header className={styles.sectionHeader}>
                    <div>
                        <p className={styles.kicker}>Synthèse FRVStream</p>
                        <h2>Tes données clés</h2>
                        <p className={styles.subtitle}>Vue rapide des informations synchronisées avec ton identité FRVTubers.</p>
                    </div>
                </header>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Favoris enregistrés</span>
                        <span className={styles.statValue}>{favoritesCount}</span>
                        <span className={styles.statHint}>VTubers que tu suis sur FRVStream</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Évènements que tu as proposé au total</span>
                        <span className={styles.statValue}>/</span>
                        <span className={styles.statHint}>Retrouvables sur la page évènement</span>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <header className={styles.sectionHeader}>
                    <div>
                        <p className={styles.kicker}>Infos de session</p>
                        <h2>Coordonnées FRVTubers</h2>
                        <p className={styles.subtitle}>Détails issus de ta session Discord FRVTubers synchronisée avec FRVStream.</p>
                    </div>
                </header>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Nom affiché</span>
                        <span className={styles.infoValue}>{displayName}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Lié à FRVStream</span>
                        <span className={styles.infoValue}>Synchronisation active</span>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Profile;
