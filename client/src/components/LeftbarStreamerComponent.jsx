import { useContext, useMemo } from 'react';
import { NavLink } from 'react-router-dom';

import { Context } from '../App.jsx';
import styles from './LeftBar.module.scss';
import FavoriteButton from './FavoriteButton.jsx';

const formatViewers = (value) => {
    if (typeof value !== 'number') {
        return '0';
    }

    if (value >= 1000) {
        return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }

    return `${value}`;
};

function LeftbarStreamerComponent({ streamer, compact = false }) {
    const [, , , setActualChannel] = useContext(Context);

    const data = streamer ?? {};
    const isLive = Boolean(data.isStreaming);
    const lastStream = isLive ? data.listLastedStream?.[0] : null;
    const slug = data?.name ?? data?.display_name ?? '';
    const target = slug ? `/c/${encodeURIComponent(slug)}` : '/';

    const viewersLabel = useMemo(() => {
        if (!isLive || !lastStream) {
            return null;
        }
        return `${formatViewers(lastStream.viewer_count)} viewers`;
    }, [isLive, lastStream]);

    const subtitle = useMemo(() => {
        if (isLive && lastStream?.game_name) {
            return lastStream.game_name;
        }

        if (data.categories?.length) {
            return data.categories[0];
        }

        return 'Hors ligne';
    }, [data.categories, isLive, lastStream]);

    const baseClass = compact ? `${styles.link}` : styles.link;

    const getClassName = ({ isActive }) => {
        if (isActive) {
            return `${baseClass} ${styles.linkActive}`;
        }
        return baseClass;
    };

    if (compact) {
        return (
            <NavLink
                to={target}
                className={getClassName}
                onClick={() => {
                    if (slug) {
                        setActualChannel?.(data.name);
                    }
                }}
                title={data.display_name}
            >
                <div className={styles.compactItem}>
                    <div className={styles.compactAvatar}>
                        <img src={data.logo} alt={data.display_name} loading="lazy" />
                        {isLive && <span className={styles.compactLive} />}
                    </div>
                    <FavoriteButton
                        vtuber={data}
                        size="sm"
                        variant="ghost"
                        className={styles.compactFavorite}
                    />
                </div>
            </NavLink>
        );
    }

    return (
        <NavLink
            to={target}
            className={getClassName}
            onClick={() => {
                if (slug) {
                    setActualChannel?.(data.name);
                }
            }}
        >
            <div className={styles.item}>
                <div className={styles.avatar}>
                    <img src={data.logo} alt={data.display_name} loading="lazy" />
                    {isLive && <span className={styles.liveBadge}>Live</span>}
                </div>
                <div className={styles.meta}>
                    <span className={styles.name}>{data.display_name}</span>
                    <span className={isLive ? styles.game : styles.offline}>{subtitle}</span>
                </div>
                <div className={styles.status}>
                    {isLive && viewersLabel && <span className={styles.viewers}>{viewersLabel}</span>}
                    <FavoriteButton vtuber={data} variant="ghost" />
                </div>
            </div>
        </NavLink>
    );
}

export default LeftbarStreamerComponent;
