import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';

import styles from './ProfileEvents.module.scss';

import { LoginContext } from './App.jsx';
import { useSeo } from './components/Seo.jsx';

const DEFAULT_TEMPLATE = [
    'Titre de l\'évènement :',
    'Date & horaire (UTC+1/Paris) :',
    'Participants :',
    'Lien(s) de référence :',
    'Ce que tu attends de la modération FRVStream :',
    'Visuels ou overlay à fournir :'
].join('\n');

function ProfileEvents() {
    const [isLogged] = useContext(LoginContext);
    const [copied, setCopied] = useState(false);

    useSeo({
        title: 'Proposer un évènement',
        description: 'Depuis ton profil FRVStream, prépare ta proposition d\'évènement et envoie-la à la modération FRVtubers.',
        canonicalPath: '/profil/proposer-evenement',
        robots: 'noindex, nofollow'
    });

    const moderationDiscordLink = useMemo(
        () => 'https://discord.gg/meyHQYWvjU',
        []
    );

    const handleCopy = async () => {
        if (typeof navigator === 'undefined' || !navigator?.clipboard?.writeText) {
            console.warn('Clipboard API not available');
            return;
        }
        try {
            await navigator.clipboard.writeText(DEFAULT_TEMPLATE);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        } catch (error) {
            console.error('Unable to copy template', error);
        }
    };

    if (!isLogged) {
        return (
            <div className={styles.page}>
                <section className={styles.locked}>
                    <div>
                        <p className={styles.kicker}>Proposer un évènement</p>
                        <h1>Connecte-toi pour préparer ta demande</h1>
                        <p className={styles.subtitle}>
                            La section évènements fait partie des outils compte FRVStream. Connecte-toi pour partager tes projets à la modération.
                        </p>
                    </div>
                    <div className={styles.lockedActions}>
                        <Link to="/login" className={styles.primaryAction}>Se connecter</Link>
                        <Link to="/events" className={styles.secondaryAction}>Consulter l'agenda</Link>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div>
                    <p className={styles.kicker}>Espace évènements</p>
                    <h1>Prépare ta proposition</h1>
                    <p className={styles.subtitle}>
                        Explique ton idée, partage les infos clés puis envoie le tout au staff pour validation. Que ce soit un event officiel FRVStream
                        ou un projet sur ta chaîne, nous centralisons les demandes ici.
                    </p>
                    <div className={styles.heroActions}>
                        <Link to="/events" className={styles.secondaryAction}>
                            <i className="pi pi-calendar" aria-hidden="true" />
                            <span>Voir l'agenda</span>
                        </Link>
                        <a
                            className={styles.primaryAction}
                            href={moderationDiscordLink}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <i className="pi pi-discord" aria-hidden="true" />
                            <span>Ouvrir le support Discord</span>
                        </a>
                    </div>
                </div>
            </section>

            <section className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardIcon}><i className="pi pi-verified" aria-hidden="true" /></div>
                    <div>
                        <h3>Évènement à valider par la modération</h3>
                        <p>
                            Propose un concept à mettre en avant sur les canaux FRVStream : partenariat, soirée spéciale ou collaboration officielle.
                            Donne un maximum de contexte pour accélérer la validation (dates, besoins overlay, participants).
                        </p>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon}><i className="pi pi-bullhorn" aria-hidden="true" /></div>
                    <div>
                        <h3>Évènement lié à ton contenu</h3>
                        <p>
                            Tu organises quelque chose sur ta chaîne ? Partage-le ici pour le relayer dans le calendrier communautaire et
                            informer les autres créateurs FRVTubers.
                        </p>
                    </div>
                </div>
            </section>

            <section className={styles.template}>
                <div>
                    <p className={styles.kicker}>Modèle prêt à envoyer</p>
                    <h2>Copie ce message et colle-le sur Discord</h2>
                    <p className={styles.subtitle}>
                        Utilise ce canevas pour que la modération dispose des informations essentielles dès ta première prise de contact.
                    </p>
                </div>
                <div className={styles.templateBox}>
                    <pre aria-label="Modèle de message">{DEFAULT_TEMPLATE}</pre>
                    <div className={styles.templateActions}>
                        <Button
                            icon={copied ? 'pi pi-check' : 'pi pi-copy'}
                            label={copied ? 'Copié !' : 'Copier le modèle'}
                            onClick={handleCopy}
                        />
                        <a
                            className={styles.secondaryAction}
                            href={moderationDiscordLink}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <i className="pi pi-discord" aria-hidden="true" />
                            <span>Aller au salon support</span>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ProfileEvents;
