import { useRouteError } from "react-router-dom";
import { Button } from "primereact/button";
import NotFound from "./NotFound.jsx";
import styles from "./NotFound.module.scss";
import { useSeo } from "./components/Seo.jsx";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  const status = error?.status ?? error?.statusCode;
  const message = error?.statusText || error?.message || 'Une erreur inattendue est survenue.';

  if (status === 404) {
    return <NotFound />;
  }

  useSeo({
    title: 'Erreur',
    description: message,
    canonicalPath: typeof window !== 'undefined' ? window.location.pathname : '/erreur',
    robots: 'noindex, nofollow'
  });

  return (
    <div className={styles.wrapper}>
      <span className={styles.code}>😵</span>
      <h2 className={styles.message}>Quelque chose s'est mal passé</h2>
      <p className={styles.details}>{message}</p>
      <div className={styles.actions}>
        <Button
          label="Retour à l'accueil"
          icon="pi pi-home"
          style={{ color: "white" }}
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = "/";
            }
          }}
        />
        <Button
          label="Réessayer"
          icon="pi pi-refresh"
          style={{ color: "white" }}
          outlined
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
        />
      </div>
    </div>
  );
}
