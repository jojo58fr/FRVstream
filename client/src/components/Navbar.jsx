import { useContext, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from 'primereact/button';

import '../App.scss';
import styles from './Navbar.module.scss';

import FRVstream from '../assets/FRVtubers_Vstream.png';
import { LoginContext } from '../App.jsx';
import { ThemeContext } from '../ThemeContext.jsx';
import UniversalLoginSystem from '../UniversalLoginSystem/index.js';

import defaultProfil from "../assets/default-profil.jpg";

function Navbar({ onMenuToggle, isMobile, isSidebarCollapsed, isMobileSidebarOpen }) {
    const [isLogged, setIsLogged] = useContext(LoginContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    const logout = async () => {
        const res = await UniversalLoginSystem.request_logout();
        if (res === 1) {
            setIsLogged(null);
        }
    };

    const avatar = useMemo(
        () =>
            isLogged?.session?.user?.image ??
            defaultProfil,
        [isLogged]
    );

    console.log("ALORS ATTENDS, ", isLogged)

    const displayName = useMemo(() => isLogged?.user?.username ?? 'Utilisateur', [isLogged]);
    const menuLabel = isMobile
        ? isMobileSidebarOpen
            ? 'Fermer la navigation'
            : 'Ouvrir la navigation'
        : isSidebarCollapsed
            ? 'Afficher le menu des streamers'
            : 'Replier le menu des streamers';
    const menuIcon = isMobile && isMobileSidebarOpen ? 'pi-times' : 'pi-bars';

    return (
        <header className={styles.navbar}>
            <div className={styles.inner}>
                <button
                    type="button"
                    className={styles.mobileMenu}
                    aria-label={menuLabel}
                    onClick={onMenuToggle}
                >
                    <i className={`pi ${menuIcon}`} />
                </button>

                <Link to="/" className={styles.brand}>
                    <img src={FRVstream} alt="FRVtubers" />
                </Link>

                <div className={styles.actions}>
                    {!isMobile && (
                        <Button
                            className={styles.themeToggle}
                            icon={`pi ${theme === 'dark' ? 'pi-sun' : 'pi-moon'}`}
                            aria-label="Changer de thème"
                            onClick={toggleTheme}
                            text
                        />
                    )}

                    {isLogged ? (
                        <div className={styles.profileGroup}>
                            <NavLink
                                to="/profil"
                                className={({ isActive }) =>
                                    isActive ? `${styles.profileLink} ${styles.active}` : styles.profileLink
                                }
                            >
                                <span className={styles.avatar}>
                                    <img src={avatar} alt={displayName} />
                                </span>
                            <span className={styles.profileName}>{displayName}</span>
                            </NavLink>
                            {!isMobile && (
                                <Button
                                    className={styles.logout}
                                    icon="pi pi-sign-out"
                                    label="Se déconnecter"
                                    onClick={logout}
                                    outlined
                                />
                            )}
                        </div>
                    ) : (
                        <NavLink to="/login" className={styles.loginLink}>
                            <Button
                                className={styles.login}
                                icon="pi pi-sign-in"
                                label="Se connecter"
                                outlined
                            />
                        </NavLink>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
