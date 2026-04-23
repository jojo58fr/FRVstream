import '../App.scss';
import styles from './Footer.module.scss';

import metadata from '../../metadata-version.json';

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.branding}>
                    <span className={styles.title}>FRVStream</span>
                    <p className={styles.tagline}>
                        Propulsé par <a href="https://www.startingames.org/en/" target="_blank" rel="noreferrer">Startingames</a> pour la communaute FRVtubers.
                    </p>
                </div>
                <div className={styles.meta}>
                    <span className={styles.version}>
                        Version {metadata.buildMajor}.{metadata.buildMinor}.{metadata.buildRevision} {metadata.buildTag}
                    </span>
                    <a
                        className={styles.link}
                        href="https://discord.gg/meyHQYWvjU"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Rejoindre le Discord
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
