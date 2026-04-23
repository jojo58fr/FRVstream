import { useContext, useMemo, useState } from 'react';
import { FavoritesContext } from '../App.jsx';
import styles from './FavoriteButton.module.scss';

function FavoriteButton({ vtuber, size = 'md', variant = 'default', className }) {
    const favoritesCtx = useContext(FavoritesContext);
    const [busy, setBusy] = useState(false);

    const isFav = favoritesCtx?.isFavorite?.(vtuber) ?? false;
    const icon = isFav ? 'pi-heart-fill' : 'pi-heart';

    const classes = useMemo(() => {
        const list = [styles.button];
        if (variant === 'ghost') {
            list.push(styles.ghost);
        }
        if (isFav) {
            list.push(styles.buttonActive);
        }
        if (size === 'sm') {
            list.push(styles.small);
        }
        if (className) {
            list.push(className);
        }
        return list.join(' ');
    }, [className, isFav, size, variant]);

    const handleToggle = async (event) => {
        event?.preventDefault?.();
        event?.stopPropagation?.();
        if (!favoritesCtx?.toggleFavorite) {
            return;
        }
        setBusy(true);
        await favoritesCtx.toggleFavorite(vtuber);
        setBusy(false);
    };

    return (
        <button
            type="button"
            className={classes}
            aria-pressed={isFav}
            aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            onClick={handleToggle}
            disabled={busy}
        >
            <i className={`pi ${icon}`} aria-hidden="true" />
            <span className={styles.label}>{isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
        </button>
    );
}

export default FavoriteButton;
