import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from 'primereact/button';

import LeftbarStreamerComponent from './LeftbarStreamerComponent.jsx';
import { Context, LoginContext } from '../App.jsx';
import { ThemeContext } from '../ThemeContext.jsx';
import UniversalLoginSystem from '../UniversalLoginSystem/index.js';

import styles from './LeftBar.module.scss';
import frFlag from '../assets/fr_flag.png';
import qcFlag from '../assets/LysQuebec.svg';
import frvmonFlag from '../assets/pokemon.svg';

const DESKTOP_INCREMENT = 6;
const INITIAL_FR_LIMIT = 8;
const INITIAL_QC_LIMIT = 6;
const COMPACT_BREAKPOINT = 960;

const navItems = [
    { to: '/', label: 'Accueil', icon: 'pi-home' },
    { to: '/events', label: 'Évènements', icon: 'pi-calendar' },
    {to: '/frvmon-event-channels', label: 'FRVMon', iconImage: frvmonFlag, iconAlt: 'Logo FRVMon' },
    { to: '/french-channels', label: 'Chaines FR', iconImage: frFlag, iconAlt: 'Drapeau français' },
    { to: '/quebecers-channels', label: 'Chaines QC', iconImage: qcFlag, iconAlt: 'Drapeau du Québec', isTall: true },
    { to: '/random-channel', label: 'Découvrir', icon: 'pi-compass' },
    { to: '/favorites', label: 'Mes favoris', icon: 'pi-heart' },
    { to: '/stats', label: 'Statistiques', icon: 'pi-chart-bar' }
];

const formatLiveSummary = (count) => {
    if (!count || count <= 0) {
        return "Personne n'est en live pour le moment.";
    }

    if (count === 1) {
        return '1 live est en cours en ce moment.';
    }

    return `${count} lives sont en cours en ce moment.`;
};

function Leftbar({ collapsed = false, onToggle, forceCollapsed = false, isOverlay = false, onCloseOverlay }) {
    const [frStreamers = [], qcStreamers = [], frvmonStreamers = [], , , onlineStreamers = []] = useContext(Context);
    const [isLogged, setIsLogged] = useContext(LoginContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    const [frLimit, setFrLimit] = useState(INITIAL_FR_LIMIT);
    const [qcLimit, setQcLimit] = useState(INITIAL_QC_LIMIT);
    const [isCompactWidth, setIsCompactWidth] = useState(false);

    useEffect(() => {
        const updateMode = () => {
            if (typeof window === 'undefined') {
                return;
            }
            setIsCompactWidth(window.innerWidth <= COMPACT_BREAKPOINT);
        };

        updateMode();
        window.addEventListener('resize', updateMode);
        return () => window.removeEventListener('resize', updateMode);
    }, []);

    const effectiveFrLimit = isCompactWidth ? Math.max(INITIAL_FR_LIMIT, 10) : frLimit;
    const effectiveQcLimit = isCompactWidth ? Math.max(INITIAL_QC_LIMIT, 8) : qcLimit;
    const effectiveFRVMONLimit = isCompactWidth ? Math.max(INITIAL_FR_LIMIT, 10) : frLimit;

    const displayedFrStreamers = useMemo(
        () => frStreamers.slice(0, effectiveFrLimit),
        [frStreamers, effectiveFrLimit]
    );
    const displayedFRVMONStreamers = useMemo(
        () => frvmonStreamers.slice(0, effectiveFRVMONLimit),
        [frvmonStreamers, effectiveFRVMONLimit]
    );
    const displayedQcStreamers = useMemo(
        () => qcStreamers.slice(0, effectiveQcLimit),
        [qcStreamers, effectiveQcLimit]
    );

    const liveCount = useMemo(
        () => onlineStreamers.filter((streamer) => streamer?.isStreaming).length,
        [onlineStreamers]
    );

    const compactStreamers = useMemo(() => {
        const combined = [];
        const seen = new Set();

        [...frStreamers, ...qcStreamers, ...frvmonStreamers].forEach((streamer) => {
            if (!streamer) {
                return;
            }
            const identifier = streamer.name ?? streamer.display_name;
            if (!identifier || seen.has(identifier)) {
                return;
            }
            seen.add(identifier);
            combined.push(streamer);
        });

        return combined.slice(0, 18);
    }, [frStreamers, qcStreamers, frvmonStreamers]);

    const canShowMoreFr = !isCompactWidth && frStreamers.length > effectiveFrLimit;
    const canShowMoreFRVMON = !isCompactWidth && frvmonStreamers.length > effectiveFrLimit;
    const canShowMoreQc = !isCompactWidth && qcStreamers.length > effectiveQcLimit;

    const effectiveCollapsed = forceCollapsed ? true : collapsed;

    const logout = async () => {
        const res = await UniversalLoginSystem.request_logout();
        if (res === 1) {
            setIsLogged(null);
        }
    };

    const sidebarClasses = [styles.sidebar, 'streamer-bar'];
    if (isOverlay) {
        sidebarClasses.push(styles.overlay);
    }
    if (effectiveCollapsed) {
        sidebarClasses.push(styles.collapsed);
    } else if (isCompactWidth) {
        sidebarClasses.push(styles.autoCompact);
    }

    const handleToggle = () => {
        if (forceCollapsed) {
            return;
        }
        if (typeof onToggle === 'function') {
            onToggle(!collapsed);
        }
    };

    const renderIcon = (item, isCompact = false) => {
        if (item.iconImage) {
            const iconClasses = [
                isCompact ? styles.flagIconCompact : styles.flagIcon
            ];

            if (item.isTall) {
                iconClasses.push(styles.flagIconTall);
            }

            return (
                <img
                    src={item.iconImage}
                    alt={item.iconAlt ?? item.label}
                    className={iconClasses.join(' ')}
                />
            );
        }

        return <i className={`pi ${item.icon}`} aria-hidden="true" />;
    };

    const renderNavLinks = () => (
        <nav className={styles.navMenu} aria-label="Navigation principale">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
                    }
                >
                    <span className={styles.navIcon}>
                        {renderIcon(item)}
                    </span>
                    <span className={styles.navLabel}>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );

    const renderCompactNavLinks = () => (
        <nav className={styles.compactNav} aria-label="Navigation principale">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    className={({ isActive }) =>
                        isActive ? `${styles.compactNavItem} ${styles.navItemActive}` : styles.compactNavItem
                    }
                >
                    <span className={styles.compactIcon}>{renderIcon(item, true)}</span>
                    <span className={styles.compactLabel}>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );

    return (
        <aside className={sidebarClasses.join(' ')} aria-label="Navigation des streamers">
            <div className={styles.panel}>
                {isOverlay && (<>
                    <div className={styles.overlayActions}>
                        <Button
                            className={styles.themeToggle}
                            icon={`pi ${theme === 'dark' ? 'pi-sun' : 'pi-moon'}`}
                            aria-label="Changer de thème"
                            onClick={toggleTheme}
                            text
                        />
                        <button
                            type="button"
                            className={styles.closeOverlay}
                            onClick={onCloseOverlay}
                            aria-label="Fermer la navigation"
                        >
                            <i className="pi pi-times" />
                        </button>
                    </div>
                    <div className={styles.overlayActions}>
                        <div className={styles.mobileQuickActions}>
                            {isLogged ? (
                                <Button
                                    className={styles.logout}
                                    icon="pi pi-sign-out"
                                    label="Se déconnecter"
                                    onClick={logout}
                                    outlined
                                />
                            ) : (
                                <Link to="/login" className={styles.loginLink}>
                                    <Button
                                        className={styles.login}
                                        icon="pi pi-sign-in"
                                        label="Se connecter"
                                        outlined
                                    />
                                </Link>
                            )}
                        </div>
                    </div>
                </>)}

                {effectiveCollapsed ? (
                    <>
                        {renderCompactNavLinks()}
                        <div className={styles.compactActions}>
                            <Link to="/multiview/" className={styles.compactActionButton} title="Vue multiple">
                                <i className="pi pi-table" />
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        {renderNavLinks()}
                        <div className={styles.summary}>
                            <nav className={styles.navMenu} aria-label="Actions supplémentaires">
                                <Link to="/multiview/" className={styles.navItem}>
                                    <span className={styles.navIcon} aria-hidden="true">
                                        <i className={`pi pi-table`} />
                                    </span>
                                    <span className={styles.navLabel}>Vue multiple</span>
                                </Link>
                            </nav>
                        </div>
                        {displayedFRVMONStreamers.length > 0 && (
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionTitle}>FRVMon 2</span>
                                    <span className={styles.badge}>{frvmonStreamers.length} VTUBERS</span>
                                </div>
                                <div className={styles.list}>
                                    {displayedFrStreamers.map((streamer) => (
                                        <LeftbarStreamerComponent
                                            key={streamer.name ?? streamer.display_name}
                                            streamer={streamer}
                                        />
                                    ))}
                                </div>
                                {canShowMoreFr && (
                                    <button
                                        type="button"
                                        className={styles.seeMore}
                                        onClick={() => setFrLimit((value) => value + DESKTOP_INCREMENT)}
                                    >
                                        Voir plus
                                    </button>
                                )}
                            </section>
                        )}
                        {displayedFrStreamers.length > 0 && (
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionTitle}>FRVtubers</span>
                                    <span className={styles.badge}>{frStreamers.length} VTUBERS</span>
                                </div>
                                <div className={styles.list}>
                                    {displayedFrStreamers.map((streamer) => (
                                        <LeftbarStreamerComponent
                                            key={streamer.name ?? streamer.display_name}
                                            streamer={streamer}
                                        />
                                    ))}
                                </div>
                                {canShowMoreFRVMON && (
                                    <button
                                        type="button"
                                        className={styles.seeMore}
                                        onClick={() => setFrLimit((value) => value + DESKTOP_INCREMENT)}
                                    >
                                        Voir plus
                                    </button>
                                )}
                            </section>
                        )}
                        {displayedQcStreamers.length > 0 && (
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionTitle}>Vtuber QC</span>
                                    <span className={styles.badge}>{qcStreamers.length} VTUBERS</span>
                                </div>
                                <div className={styles.list}>
                                    {displayedQcStreamers.map((streamer) => (
                                        <LeftbarStreamerComponent
                                            key={streamer.name ?? streamer.display_name}
                                            streamer={streamer}
                                        />
                                    ))}
                                </div>
                                {canShowMoreQc && (
                                    <button
                                        type="button"
                                        className={styles.seeMore}
                                        onClick={() => setQcLimit((value) => value + DESKTOP_INCREMENT)}
                                    >
                                        Voir plus
                                    </button>
                                )}
                            </section>
                        )}

                        <div className={styles.support}>
                            Merci a toutes celles et ceux qui soutiennent le projet FRVtubers.
                            {' '}
                            <a href="https://opencollective.com/frvtubers" target="_blank" rel="noreferrer">
                                Devenir soutien
                            </a>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}

export default Leftbar;
