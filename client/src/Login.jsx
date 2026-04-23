import { useEffect, useContext, useCallback } from 'react';
import { LoginContext } from './App.jsx';

import { useNavigate } from 'react-router-dom';

import { Button } from 'primereact/button';

import './LoginBG.scss';
import styles from './Login.module.scss';

import UniversalLoginSystem from './UniversalLoginSystem/index.js';
import { useSeo } from './components/Seo.jsx';

function Login() {

    const navigate = useNavigate();

    const [isLogged, setIsLogged] = useContext(LoginContext);

    useSeo({
        title: 'Connexion',
        description: 'Connecte ton compte Discord FRVTubers pour synchroniser tes favoris et accéder aux fonctionnalités FRVStream.',
        canonicalPath: '/login',
        robots: 'noindex, nofollow'
    });

    useEffect(() => {
        const streamContent = document.querySelector('.stream-content');
        streamContent?.classList.add('bg-horizon');

        return () => {
            streamContent?.classList.remove('bg-horizon');
        };
    }, []);

    useEffect(() => {
        const ensureSession = async () => {
            if (!isLogged) {
                const session = await UniversalLoginSystem.fetchSession();
                if (session) {
                    setIsLogged(session);
                }
            }
        };

        ensureSession();
    }, [isLogged, setIsLogged]);

    useEffect(() => {
        if (isLogged) {
            navigate('/');
        }
    }, [isLogged, navigate]);

    const handleDiscordLogin = useCallback(() => {
        const callbackUrl = typeof window !== 'undefined' ? window.location.href : undefined;
        UniversalLoginSystem.startLogin(callbackUrl);
    }, []);

    return (
        <>
            <div className={`${styles['wrapper-form']}`}>
                <h2>Bienvenue/Rebienvenue dans le rabbit-hole du Vtubing !</h2>
                <h3>Utilise ton compte Discord via l'identité FRVTubers.</h3>

                <div className={`${styles['w-btns-login']}`}>
                    <Button icon="pi pi-discord" style={{ color: 'white' }} label="Se connecter avec Discord" rounded onClick={handleDiscordLogin} />
                </div>

                {isLogged && (
                    <div className={`${styles['session-preview']}`}>
                        <p>Connecté(e) en tant que <strong>{isLogged.user?.name ?? isLogged.user?.email}</strong>.</p>
                        {typeof isLogged.hasVtuberRole === 'boolean' && (
                            <p>Rôle VTuber : {isLogged.hasVtuberRole ? 'oui' : 'non'}</p>
                        )}
                        {typeof isLogged.isGuildMember === 'boolean' && (
                            <p>Membre du serveur Discord FRVTubers : {isLogged.isGuildMember ? 'oui' : 'non'}</p>
                        )}
                    </div>
                )}

                <p className={`${styles['helper-text']}`}>
                    Tu seras redirigé(e) vers Discord, puis de retour ici avec ta session FRVTubers ouverte.
                </p>

                <div className="w-credit-photo-bg">
                    <span className="credit-photo-bg">Crédit photo &copy; <a href="https://x.com/Horizon_vtFR" target="_blank" rel="noreferrer">Horizon Officiel</a></span>
                </div>
            </div>
        </>
    );
}

export default Login;
