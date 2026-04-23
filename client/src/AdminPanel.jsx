import { useContext, useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DateTime } from 'luxon';

import styles from './AdminPanel.module.scss';

import { Context, LoginContext } from './App.jsx';
import { useSeo } from './components/Seo.jsx';
import API from './Api.js';
import defaultProfil from './assets/default-profil.jpg';

const hasModeratorRole = (session) => {
    const rawFlag =
        session?.adminRole
        ?? session?.isAdmin
        ?? session?.isModerator
        ?? session?.session?.adminRole
        ?? session?.session?.user?.adminRole;

    if (typeof rawFlag === 'boolean') {
        return rawFlag;
    }
    if (typeof rawFlag === 'string' && rawFlag.trim().length > 0) {
        return true;
    }

    const discordRoles = session?.session?.discordMember?.roles;
    if (Array.isArray(discordRoles)) {
        return discordRoles.some((role) => typeof role === 'string' && /admin|mod[ée]rateur/i.test(role));
    }

    return false;
};

function AdminPanel() {
    const [frStreamers = [], qcStreamers = []] = useContext(Context);
    const [isLogged] = useContext(LoginContext);
    const [formValues, setFormValues] = useState({
        title: '',
        description: '',
        startTsLocal: '',
        endTsLocal: '',
        image: '',
        url: ''
    });
    const [vtuberSearch, setVtuberSearch] = useState('');
    const [selectedVtubers, setSelectedVtubers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(null);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [actionMessage, setActionMessage] = useState(null);
    const partnerships = useMemo(() => ([
        { name: 'Partenaire 1', logo: defaultProfil },
        { name: 'Partenaire 2', logo: defaultProfil },
        { name: 'Partenaire 3', logo: defaultProfil }
    ]), []);

    const isModerator = useMemo(() => hasModeratorRole(isLogged), [isLogged]);

    useSeo({
        title: 'Panel administrateur',
        description: 'Espace réservé à la modération FRVStream : gestion des évènements officiels et communautaires.',
        canonicalPath: '/admin',
        robots: 'noindex, nofollow'
    });

    const organizerId = useMemo(() => {
        const user = isLogged?.user ?? isLogged?.session?.user;
        return user?.id ?? user?.discordId ?? user?.discord_id ?? user?.email ?? null;
    }, [isLogged]);

    const organizerName = useMemo(() => {
        const user = isLogged?.user ?? isLogged?.session?.user;
        return user?.username ?? user?.name ?? user?.email ?? 'frvstream-user';
    }, [isLogged]);

    const organizerAvatar = useMemo(() => {
        const user = isLogged?.user ?? isLogged?.session?.user;
        return user?.image ?? defaultProfil;
    }, [isLogged]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const getVtuberId = (vtuber) => vtuber?.id ?? vtuber?.vtuberId ?? vtuber?.twitchId ?? vtuber?.twitch_id;

    const availableVtubers = useMemo(() => {
        const map = new Map();
        [...frStreamers, ...qcStreamers].forEach((vtuber) => {
            const id = getVtuberId(vtuber);
            const name = vtuber?.display_name ?? vtuber?.name;
            if (!id || !name) {
                return;
            }
            const key = String(id);
            if (!map.has(key)) {
                map.set(key, vtuber);
            }
        });
        return Array.from(map.values());
    }, [frStreamers, qcStreamers]);

    const filteredVtubers = useMemo(() => {
        const needle = vtuberSearch.trim().toLowerCase();
        if (!needle) return availableVtubers;
        return availableVtubers.filter((vtuber) => {
            const name = (vtuber?.display_name ?? vtuber?.name ?? '').toLowerCase();
            return name.includes(needle);
        });
    }, [availableVtubers, vtuberSearch]);

    const addVtuber = (vtuber) => {
        const id = getVtuberId(vtuber);
        if (!id) return;
        setSelectedVtubers((prev) => {
            if (prev.some((entry) => getVtuberId(entry) === id)) {
                return prev;
            }
            return [...prev, vtuber];
        });
    };

    const removeVtuber = (id) => {
        setSelectedVtubers((prev) => prev.filter((entry) => getVtuberId(entry) !== id));
    };

    const formatDateTime = (value) => {
        if (!value) return 'Date ?';
        const dt = DateTime.fromISO(value);
        if (!dt.isValid) return value;
        return dt.setLocale('fr').toFormat("dd LLL yyyy • HH'h'mm");
    };

    const parseVtuberIds = (raw) => {
        if (!raw) return [];
        return raw
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitMessage(null);
        setSubmitting(true);

        const toIsoOrNull = (value) => {
            if (!value) return undefined;
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) {
                return undefined;
            }
            return date.toISOString();
        };

        if (!organizerId) {
            setSubmitMessage('Impossible de créer : organisateur non déterminé (reconnecte-toi).');
            setSubmitting(false);
            return;
        }
        if (!formValues.title || !formValues.description || !formValues.startTsLocal) {
            setSubmitMessage('Champs requis manquants (titre, description, date de début).');
            setSubmitting(false);
            return;
        }

        const payload = {
            discordOrga: organizerId,
            discordOrgaName: organizerName,
            title: formValues.title || undefined,
            description: formValues.description || undefined,
            startTs: toIsoOrNull(formValues.startTsLocal),
            endTs: toIsoOrNull(formValues.endTsLocal),
            vtuberIds: selectedVtubers.map((vt) => getVtuberId(vt)).filter(Boolean),
            image: formValues.image || undefined,
            url: formValues.url || undefined
        };

        console.log("payload", payload);
        const res = await API.createCommunityEvent(payload);

        if (res) {
            setSubmitMessage('Evenement crée (statut pending).');
            setFormValues({
                title: '',
                description: '',
                startTsLocal: '',
                endTsLocal: '',
                image: '',
                url: ''
            });
            setSelectedVtubers([]);
            loadPending();
        } else {
            setSubmitMessage('Impossible de créer l\'évènement.');
        }

        setSubmitting(false);
    };

    const loadPending = async () => {
        setLoadingPending(true);
        setActionMessage(null);
        const list = await API.getCommunityEvents('pending');
        setPendingEvents(Array.isArray(list) ? list : []);
        setLoadingPending(false);
    };

    const handleAction = async (id, action) => {
        if (!id) return;
        setActionMessage(null);
        let res = null;
        if (action === 'approve') {
            res = await API.approveCommunityEvent(id);
        } else {
            res = await API.rejectCommunityEvent(id);
        }

        if (res) {
            setActionMessage(`Evenement ${action === 'approve' ? 'valide' : 'refuse'}.`);
            loadPending();
        } else {
            setActionMessage('Action impossible (droits ou API).');
        }
    };

    useEffect(() => {
        if (isModerator) {
            loadPending();
        }
    }, [isModerator]);

    if (!isLogged) {
        return (
            <div className={styles.page}>
                <section className={styles.locked}>
                    <div>
                        <p className={styles.kicker}>Panel administrateur</p>
                        <h1>Connexion requise</h1>
                        <p className={styles.subtitle}>
                            Connecte-toi avec Discord pour accéder aux outils de modération FRVStream.
                        </p>
                    </div>
                    <div className={styles.actions}>
                        <Link to="/login" className={styles.primaryAction}>Se connecter</Link>
                        <Link to="/profil" className={styles.secondaryAction}>Retour au profil</Link>
                    </div>
                </section>
            </div>
        );
    }

    if (!isModerator) {
        return (
            <div className={styles.page}>
                <section className={styles.locked}>
                    <div>
                        <p className={styles.kicker}>Panel administrateur</p>
                        <h1>Accès réservé aux modérateurs</h1>
                        <p className={styles.subtitle}>
                            Ton compte n'a pas le rôle requis pour modérer les évènements. Contacte un admin si tu
                            penses qu'il s'agit d'une erreur.
                        </p>
                    </div>
                    <div className={styles.actions}>
                        <Link to="/profil" className={styles.secondaryAction}>Retour au profil</Link>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div>
                    <p className={styles.kicker}>Panel modération</p>
                    <h1>Gestion des évènements FRVStream</h1>
                    <p className={styles.subtitle}>
                        Ajoute un nouvel évènement ou parcours les propositions de la communauté pour les valider ou les refuser.
                        Les actions s'appuient sur les endpoints `/calendar/community` de l'API.
                    </p>
                </div>
                <div className={styles.actions}>
                    <Link to="/profil/proposer-evenement" className={styles.primaryAction}>
                        <i className="pi pi-plus-circle" aria-hidden="true" />
                        <span>Ajouter un évènement</span>
                    </Link>
                    <Link to="/events" className={styles.secondaryAction}>
                        <i className="pi pi-calendar" aria-hidden="true" />
                        <span>Voir le calendrier</span>
                    </Link>
                </div>
            </section>

            <section className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardIcon}><i className="pi pi-plus" aria-hidden="true" /></div>
                    <div className={styles.cardContent}>
                        <h3>Créer ou publier un évènement</h3>
                        <p>
                            Utilise le modèle de la page &quot;Proposer un événement&quot; ou ton outil interne pour poster un
                            évènement via l'endpoint `/api/v1/calendar/community` (statut `pending`).
                        </p>
                        <Link to="/profil/proposer-evenement" className={styles.cardLink}>Ouvrir le modèle</Link>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon}><i className="pi pi-check-circle" aria-hidden="true" /></div>
                    <div className={styles.cardContent}>
                        <h3>Valider ou refuser</h3>
                        <p>
                            Récupère la liste des évènements en attente (`status=pending`) puis applique les actions
                            d'approbation ou de rejet via `/api/v1/calendar/community/:id/approve` ou `/reject`.
                        </p>
                        <a
                            className={styles.cardLink}
                            href="/api/v1/calendar/community?status=pending"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Voir les demandes en attente
                        </a>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <header className={styles.sectionHeader}>
                    <div>
                        <p className={styles.kicker}>Partenariats</p>
                        <h2>Logos partenaires</h2>
                        <p className={styles.subtitle}>Affichage en ligne avec logos (placeholders pour l'instant).</p>
                    </div>
                </header>
                <div className={styles.partnerRow}>
                    {partnerships.map((partner) => (
                        <div key={partner.name} className={styles.partnerCard}>
                            <div className={styles.partnerLogo}>
                                <img src={partner.logo} alt={partner.name} />
                            </div>
                            <span className={styles.partnerName}>{partner.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.section}>
                <header className={styles.sectionHeader}>
                    <div>
                        <p className={styles.kicker}>Formulaire API</p>
                        <h2>Créer un évènement communautaire</h2>
                        <p className={styles.subtitle}>Envoi direct sur l'endpoint `/calendar/community` (statut pending). Le compte connecté est utilisé comme auteur.</p>
                        <div className={styles.organizer}>
                            <img src={organizerAvatar} alt={organizerName} />
                            <div>
                                <p className={styles.subtitle}><strong>Orga (auto)</strong> : {organizerName}</p>
                                <p className={styles.muted}>ID transmis : {organizerId ?? 'non disponible'}</p>
                            </div>
                        </div>
                    </div>
                    {submitMessage && <span className={styles.flash}>{submitMessage}</span>}
                </header>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                        <label>
                            Titre (obligatoire)
                            <input
                                name="title"
                                value={formValues.title}
                                onChange={handleInputChange}
                                placeholder="Nom de l'évènement"
                                required
                            />
                        </label>
                    </div>
                    <div className={styles.formRow}>
                        <label>
                            Description
                            <textarea
                                name="description"
                                value={formValues.description}
                                onChange={handleInputChange}
                                placeholder="Contexte, invités, déroulé..."
                                rows={3}
                                required
                            />
                        </label>
                    </div>
                    <div className={styles.formRow}>
                        <label>
                            Début (date/heure locale)
                            <input
                                type="datetime-local"
                                name="startTsLocal"
                                value={formValues.startTsLocal}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Fin (optionnel)
                            <input
                                type="datetime-local"
                                name="endTsLocal"
                                value={formValues.endTsLocal}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>
                    <div className={styles.formRow}>
                        <label>
                            Image (URL)
                            <input
                                name="image"
                                value={formValues.image}
                                onChange={handleInputChange}
                                placeholder="https://example.com/banner.png"
                            />
                        </label>
                        <label>
                            Lien externe (URL)
                            <input
                                name="url"
                                value={formValues.url}
                                onChange={handleInputChange}
                                placeholder="https://twitch.tv/..."
                            />
                        </label>
                    </div>
                    <div className={styles.formRow}>
                        <label className={styles.vtuberSelector}>
                            Associer des VTubers
                            <input
                                type="text"
                                placeholder="Rechercher un VTuber..."
                                value={vtuberSearch}
                                onChange={(e) => setVtuberSearch(e.target.value)}
                            />
                            <div className={styles.vtuberList}>
                                {filteredVtubers.map((vtuber) => {
                                    const id = getVtuberId(vtuber);
                                    const name = vtuber?.display_name ?? vtuber?.name;
                                    const avatar = vtuber?.logo ?? vtuber?.profile_image_url ?? defaultProfil;
                                    const already = selectedVtubers.some((sel) => getVtuberId(sel) === id);
                                    return (
                                        <button
                                            type="button"
                                            key={id ?? name}
                                            className={`${styles.vtuberItem} ${already ? styles.vtuberItemDisabled : ''}`}
                                            onClick={() => addVtuber(vtuber)}
                                            disabled={already}
                                        >
                                            <img src={avatar} alt={name} />
                                            <span>{name}</span>
                                        </button>
                                    );
                                })}
                                {filteredVtubers.length === 0 && (
                                    <div className={styles.empty}>Aucun résultat.</div>
                                )}
                            </div>
                        </label>
                        <div className={styles.selectedBox}>
                            <span className={styles.selectedTitle}>Sélection</span>
                            <div className={styles.selectedList}>
                                {selectedVtubers.length === 0 && (
                                    <span className={styles.empty}>Pas encore de VTuber associé.</span>
                                )}
                                {selectedVtubers.map((vtuber) => {
                                    const id = getVtuberId(vtuber);
                                    const name = vtuber?.display_name ?? vtuber?.name;
                                    const avatar = vtuber?.logo ?? vtuber?.profile_image_url ?? defaultProfil;
                                    return (
                                        <span key={id ?? name} className={styles.selectedChip}>
                                            <img src={avatar} alt={name} />
                                            <span>{name}</span>
                                            <button type="button" onClick={() => removeVtuber(id)}>×</button>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        <Button
                            type="submit"
                            label={submitting ? 'Envoi...' : 'Creer l\'evenement'}
                            icon="pi pi-send"
                            disabled={submitting}
                        />
                    </div>
                </form>
            </section>

            <section className={styles.section}>
                <header className={styles.sectionHeader}>
                    <div>
                        <p className={styles.kicker}>Modération</p>
                        <h2>Evenements en attente</h2>
                        <p className={styles.subtitle}>Liste des demandes pending a valider ou refuser.</p>
                    </div>
                    {actionMessage && <span className={styles.flash}>{actionMessage}</span>}
                </header>
                {loadingPending ? (
                    <div className={styles.empty}>Chargement...</div>
                ) : pendingEvents.length === 0 ? (
                    <div className={styles.empty}>Aucune demande en attente.</div>
                ) : (
                    <div className={styles.pendingList}>
                        {pendingEvents.map((event) => (
                            <div key={event.id ?? event.title} className={styles.pendingItem}>
                                <div className={styles.pendingMeta}>
                                    <span className={styles.pendingTitle}>{event.title ?? 'Evenement'}</span>
                                    <span className={styles.pendingInfo}>
                                        Début : {formatDateTime(event.start_ts ?? event.start ?? event.startTs)}
                                    </span>
                                    {event.end_ts || event.end || event.endTs ? (
                                        <span className={styles.pendingInfo}>
                                            Fin : {formatDateTime(event.end_ts ?? event.end ?? event.endTs)}
                                        </span>
                                    ) : null}
                                    <span className={styles.pendingInfo}>
                                        Orga : {event.discord_orga_name ?? event.discordOrgaName ?? event.discord_username ?? event.discord_name ?? event.discord_orga ?? event.discordOrga ?? 'N/A'}
                                    </span>
                                </div>
                                <div className={styles.pendingActions}>
                                    <Button
                                        label="Valider"
                                        icon="pi pi-check"
                                        severity="success"
                                        outlined
                                        onClick={() => handleAction(event.id, 'approve')}
                                    />
                                    <Button
                                        label="Refuser"
                                        icon="pi pi-times"
                                        severity="danger"
                                        outlined
                                        onClick={() => handleAction(event.id, 'reject')}
                                    />
                                    {event.url && (
                                        <a className={styles.link} href={event.url} target="_blank" rel="noreferrer">Lien</a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className={styles.note}>
                <p>
                    Note : ce panneau est réservé aux modérateurs reconnus par l'API. Vérifie que ton rôle Discord correspond
                    aux `ADMIN_ROLES` configurés côté backend pour que les endpoints d'approbation fonctionnent.
                </p>
                <Button
                    icon="pi pi-sign-in"
                    label="Resynchroniser ma session"
                    onClick={() => window?.location?.reload()}
                    className={styles.ghostButton}
                />
            </section>
        </div>
    );
}

export default AdminPanel;
