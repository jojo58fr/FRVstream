import { Button } from 'primereact/button';
import { Link, useLocation } from 'react-router-dom';
import styles from './NotFound.module.scss';
import { useSeo } from './components/Seo.jsx';

function NotFound({ title, description }) {
    const location = useLocation();

    const pageTitle = title ?? 'Page introuvable';
    const pageDescription = description ?? `Impossible de trouver ${location.pathname}.`;

    useSeo({
        title: pageTitle,
        description: pageDescription,
        canonicalPath: location?.pathname ?? '/404',
        robots: 'noindex, nofollow'
    });

    return (
        <div className={styles.wrapper}>
            <span className={styles.code}>404</span>
            <h2 className={styles.message}>{pageTitle}</h2>
            <p className={styles.details}>{pageDescription}</p>
            <div className={styles.actions}>
                <Link to="/">
                    <Button label="Retour à l'accueil" icon="pi pi-home" style={{ color: 'white' }} />
                </Link>
                <Button
                    label="Recharger la page"
                    icon="pi pi-refresh"
                    style={{ color: 'white' }}
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            window.location.reload();
                        }
                    }}
                    outlined
                />
            </div>
        </div>
    );
}

export default NotFound;
