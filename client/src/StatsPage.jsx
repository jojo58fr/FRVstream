import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.scss';
import styles from './StatsPage.module.scss';
import {
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend
} from 'recharts';

import API from './Api.js';
import { useSeo } from './components/Seo.jsx';

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-';
  }
  return value.toLocaleString('fr-FR');
};

const BarList = ({ data = [], valueKey = 'value', labelKey = 'label', suffix = '' }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className={styles.empty}>Aucune donnée</p>;
  }

  const max = Math.max(...data.map((item) => item?.[valueKey] ?? 0), 1);

  return (
    <div className={styles.chartList}>
      {data.map((item) => {
        const value = item?.[valueKey] ?? 0;
        const label = item?.[labelKey] ?? '—';
        const width = Math.max(4, Math.min(100, (value / max) * 100));
        return (
          <div key={label} className={styles.barRow}>
            <span className={styles.barLabel}>{label}</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${width}%` }} />
            </div>
            <span className={styles.barValue}>{formatNumber(value)}{suffix}</span>
          </div>
        );
      })}
    </div>
  );
};

const HourlyLineChart = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className={styles.empty}>Aucune donnée</p>;
  }

  return (
    <div className={styles.lineChartWrapper}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--color-text-secondary)' }} />
          <YAxis tick={{ fill: 'var(--color-text-secondary)' }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const p = payload[0]?.payload;
                return (
                  <div className={styles.tooltip}>
                    <div className={styles.tooltipLabel}>{label}</div>
                    <div className={styles.tooltipDetail}>Moyenne : {formatNumber(p?.average ?? 0)}</div>
                    <div className={styles.tooltipDetail}>Médiane : {formatNumber(p?.median ?? 0)}</div>
                    {p?.samples !== undefined && (
                      <div className={styles.tooltipDetail}>Échantillons : {formatNumber(p.samples)}</div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="average" stroke="#5865f2" strokeWidth={2.2} dot={false} name="Moyenne" />
          <Line type="monotone" dataKey="median" stroke="#ff8a3d" strokeWidth={2.2} dot={false} name="Médiane" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const AvgMedianLine = ({ average, median }) => {
  const parsedAverage = Number.isFinite(average) ? average : 0;
  const parsedMedian = Number.isFinite(median) ? median : 0;
  const data = [
    { label: 'Moyenne', value: parsedAverage },
    { label: 'Médiane', value: parsedMedian }
  ].filter((item) => item.value > 0);

  if (!data.length) {
    return <p className={styles.empty}>Aucune donnée</p>;
  }

  return (
    <div className={styles.lineChartWrapper}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--color-text-secondary)' }} />
          <YAxis tick={{ fill: 'var(--color-text-secondary)' }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const p = payload[0]?.payload;
                return (
                  <div className={styles.tooltip}>
                    <div className={styles.tooltipLabel}>{label}</div>
                    <div className={styles.tooltipValue}>{formatNumber(p?.value ?? 0)}</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line type="monotone" dataKey="value" stroke="#5865f2" strokeWidth={2.2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const HistoryLineChart = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className={styles.empty}>Aucune donnée</p>;
  }

  return (
    <div className={styles.lineChartWrapper}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--color-text-secondary)' }} />
          <YAxis tick={{ fill: 'var(--color-text-secondary)' }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const p = payload[0]?.payload;
                return (
                  <div className={styles.tooltip}>
                    <div className={styles.tooltipLabel}>{label}</div>
                    <div className={styles.tooltipDetail}>Moyenne : {formatNumber(p?.average ?? 0)}</div>
                    <div className={styles.tooltipDetail}>Médiane : {formatNumber(p?.median ?? 0)}</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="average" stroke="#5865f2" strokeWidth={2.2} dot name="Moyenne" />
          <Line type="monotone" dataKey="median" stroke="#ff8a3d" strokeWidth={2.2} dot name="Médiane" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

function StatsPage() {
  const [overview, setOverview] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyDays, setHistoryDays] = useState(30);
  const [historyGroup, setHistoryGroup] = useState('day');
  const [historyFrom, setHistoryFrom] = useState('');
  const [historyTo, setHistoryTo] = useState('');
  const [showForecast, setShowForecast] = useState(true);
  const [vtuberFilter, setVtuberFilter] = useState('all');
  const [activeStatTab, setActiveStatTab] = useState('vtubers');
  const [liveStats, setLiveStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSeo({
    title: 'Statistiques VTuber FR',
    description: 'Données en temps réel et historiques sur les streams VTuber francophones : tendances, audiences et prévisions FRVStream.',
    canonicalPath: '/stats'
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const historyParams = {};
        if (historyFrom && historyTo) {
          historyParams.from = new Date(historyFrom).toISOString();
          historyParams.to = new Date(historyTo).toISOString();
        } else if (historyDays) {
          historyParams.days = historyDays;
        }
        historyParams.group = historyGroup;

        const [overviewRes, liveRes, forecastRes, historyRes] = await Promise.all([
          API.getStatsOverview(),
          API.getStatsLive(),
          showForecast ? API.getStatsForecast(historyDays) : Promise.resolve(null),
          API.getStatsHistory(historyParams)
        ]);
        if (!isMounted) return;
        setOverview(overviewRes);
        setLiveStats(liveRes);
        setForecast(forecastRes);
        setHistory(historyRes);
      } catch (e) {
        if (isMounted) {
          setError("Impossible de charger les statistiques pour le moment.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [historyDays, historyGroup, historyFrom, historyTo, showForecast]);

  const totalsCards = useMemo(() => {
    const totals = overview?.totals ?? {};
    const online = overview?.online ?? {};
    return [
      { label: 'Vtubers suivis', value: totals.tracked },
      { label: 'Équipe FR', value: totals.fr },
      { label: 'Équipe QC', value: totals.qc },
      { label: 'En ligne (total)', value: online.tracked },
      { label: 'En ligne (FR)', value: online.fr },
      { label: 'En ligne (QC)', value: online.qc }
    ].filter((item) => item.value !== undefined);
  }, [overview]);

  const topCategories = useMemo(() => forecast?.topCategories ?? [], [forecast]);
  const topCategoriesRanking = useMemo(
    () =>
      [...topCategories]
        .sort(
          (a, b) =>
            (b?.averageViewers ?? b?.count ?? 0) - (a?.averageViewers ?? a?.count ?? 0)
        )
        .map((cat, idx) => {
          const name = cat?.name ?? '—';
          const viewers = cat?.averageViewers ?? cat?.count ?? 0;
          const median = cat?.medianViewers ?? null;
          const rawArt = cat?.box_art_url ?? cat?.boxArt ?? cat?.boxArtUrl ?? null;
          const boxArt = rawArt
            ? rawArt.replace('{width}', '188').replace('{height}', '250')
            : `https://static-cdn.jtvnw.net/ttv-boxart/${encodeURIComponent(name)}-188x250.jpg`;
          return {
            rank: idx + 1,
            name,
            viewers,
            median,
            boxArt
          };
        }),
    [topCategories]
  );
  const topVtubersRanking = useMemo(() => {
    const vtubers = (forecast?.topVtubers ?? []).map((entry) => {
      const vt = entry?.vtuber ?? {};
      const name = vt?.display_name ?? vt?.name ?? '—';
      const handle = vt?.name ?? vt?.login ?? null;
      const teamRaw = vt?.team ?? vt?.country ?? vt?.lang ?? vt?.region ?? null;
      const inferredTeam =
        vt?.isFR ? 'fr' :
        vt?.isQC ? 'qc' :
        (typeof teamRaw === 'string' ? teamRaw.toLowerCase() : null);
      const avatar =
        vt?.logo ??
        vt?.profile_image_url ??
        (name
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5a67d8&color=fff&size=128`
          : null);
      return {
        name,
        handle,
        average: entry?.averageViewers ?? 0,
        median: entry?.medianViewers ?? 0,
        avatar,
        team: inferredTeam
      };
    });
    return vtubers
      .sort((a, b) => (b?.average ?? 0) - (a?.average ?? 0))
      .map((vt, idx) => ({ ...vt, rank: idx + 1 }));
  }, [forecast]);

  const filteredTopVtubers = useMemo(
    () =>
      topVtubersRanking.filter((vt) =>
        vtuberFilter === 'all' ? true : (vt.team ?? '') === vtuberFilter
      ),
    [topVtubersRanking, vtuberFilter]
  );

  const hourlyBuckets = useMemo(() => forecast?.hourly ?? [], [forecast]);
  const hourlySeries = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, idx) => {
        const entry = hourlyBuckets?.[idx] ?? {};
        const average = entry?.average ?? entry ?? 0;
        const median = entry?.median ?? entry ?? 0;
        const samples = entry?.samples ?? entry?.count ?? undefined;
        return {
          label: `${String(idx).padStart(2, '0')}h`,
          value: average,
          average,
          median,
          samples
        };
      }),
    [hourlyBuckets]
  );

  const historySeries = useMemo(() => {
    const buckets = history?.buckets ?? [];
    return buckets.map((bucket) => ({
      label: bucket?.key ?? bucket?.date ?? bucket?.label ?? '—',
      average: bucket?.viewers?.average ?? bucket?.averageViewers ?? 0,
      median: bucket?.viewers?.median ?? bucket?.medianViewers ?? 0
    }));
  }, [history]);

  const historyWindowLabel = useMemo(() => {
    if (historyFrom && historyTo) {
      return `du ${new Date(historyFrom).toLocaleDateString('fr-FR')} au ${new Date(historyTo).toLocaleDateString('fr-FR')}`;
    }
    if (historyDays) {
      return `les ${historyDays} derniers jours`;
    }
    return 'période sélectionnée';
  }, [historyFrom, historyTo, historyDays]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Statistiques FRVtubers</h1>
        <p className={styles.subtitle}>
          Un coup d’œil sur la communauté : en ligne maintenant, volumes suivis et tendances calculées sur les derniers jours.
        </p>
        {overview?.updatedAt && (
          <span className={styles.pill}>
            Mis à jour : {new Date(overview.updatedAt).toLocaleString('fr-FR')}
          </span>
        )}
      </div>

      <div className={styles.well}>
        <h2 className={styles.wellTitle}>⚠️ Avertissement : santé mentale</h2>
        <p className={styles.wellText}>
          Les statistiques et classements peuvent être anxiogènes. Chaque parcours est unique : compare-toi avec bienveillance,
          fais des pauses si besoin et priorise ton bien-être avant les chiffres.
        </p>
      </div>

      <div className={styles.filtersPanel}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Fenêtre (7j, 30j, 90j)</span>
          <div className={styles.filterBtnRow}>
            {[7, 30, 90].map((day) => (
              <button
                key={day}
                type="button"
                className={`${styles.filterBtn} ${historyDays === day ? styles.filterBtnActive : ''}`}
                onClick={() => {
                  setHistoryDays(day);
                  setHistoryFrom('');
                  setHistoryTo('');
                }}
              >
                {day}j
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Plage personnalisée</span>
          <div className={styles.dateRow}>
            <label className={styles.dateField}>
              <span>Du</span>
              <input
                type="date"
                value={historyFrom}
                onChange={(e) => {
                  setHistoryFrom(e.target.value);
                  setHistoryDays(null);
                }}
              />
            </label>
            <label className={styles.dateField}>
              <span>Au</span>
              <input
                type="date"
                value={historyTo}
                onChange={(e) => {
                  setHistoryTo(e.target.value);
                  setHistoryDays(null);
                }}
              />
            </label>
          </div>
          <small className={styles.filterHint}>Vide = par défaut ou le 7j/30j/90j sélectionnée</small>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Regroupement</span>
          <div className={styles.filterBtnRow}>
            {['day', 'month', 'year'].map((group) => (
              <button
                key={group}
                type="button"
                className={`${styles.filterBtn} ${historyGroup === group ? styles.filterBtnActive : ''}`}
                onClick={() => setHistoryGroup(group)}
              >
                {group === 'day' ? 'Jour' : group === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Prévisions</span>
          <div className={styles.filterBtnRow}>
            <button
              type="button"
              className={`${styles.filterBtn} ${showForecast ? styles.filterBtnActive : ''}`}
              onClick={() => setShowForecast((prev) => !prev)}
            >
              {showForecast ? 'Masquer' : 'Voir'} les prévisions
            </button>
          </div>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && !error && (
        <div className={styles.loadingWrap} role="status" aria-live="polite">
          <div className={styles.loadingOrbit}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.loadingTextRow}>
            <span className={styles.loadingLabel}>Chargement des statistiques</span>
            <span className={styles.loadingDots} aria-hidden="true">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
          <p className={styles.loadingSub}>On récupère les données live et historiques.</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Vue d’ensemble</h2>
                <p className={styles.sectionDescription}>
                  Totaux suivis et snapshots en ligne par équipe.
                </p>
              </div>
            </div>
            <div className={styles.gridCards}>
              {totalsCards.map((card) => (
                <div key={card.label} className={styles.card}>
                  <span className={styles.cardLabel}>{card.label}</span>
                  <span className={styles.cardValue}>{formatNumber(card.value)}</span>
                </div>
              ))}
            </div>
          </section>

          {liveStats && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Live en ce moment</h2>
                  <p className={styles.sectionDescription}>
                    Comptes online et viewers cumulés (total / FR / QC) + top viewers en cours.
                  </p>
                </div>
              </div>
              <div className={styles.cardsRow}>
                <div className={styles.card}>
                  <span className={styles.cardLabel}>Online (total)</span>
                  <span className={styles.cardValue}>{formatNumber(liveStats?.counts?.online)}</span>
                  <span className={styles.cardHint}>Trackés : {formatNumber(liveStats?.counts?.total)}</span>
                </div>
                <div className={styles.card}>
                  <span className={styles.cardLabel}>Online FR / QC</span>
                  <span className={styles.cardValue}>{formatNumber(liveStats?.counts?.fr)} / {formatNumber(liveStats?.counts?.qc)}</span>
                </div>
                <div className={styles.card}>
                  <span className={styles.cardLabel}>Viewers</span>
                  <span className={styles.cardValue}>{formatNumber(liveStats?.viewers?.total)}</span>
                  <span className={styles.cardHint}>FR: {formatNumber(liveStats?.viewers?.fr)} · QC: {formatNumber(liveStats?.viewers?.qc)}</span>
                </div>
              </div>
              {Array.isArray(liveStats?.topViewers) && liveStats.topViewers.length > 0 && (
                <div className={styles.topList}>
                  {liveStats.topViewers.map((entry, idx) => {
                    const vt = entry?.streamer ?? {};
                    const name = vt?.display_name ?? vt?.name ?? '—';
                    const handle = vt?.name ?? vt?.login ?? '';
                    return (
                      <div key={`${handle}-${idx}`} className={styles.topListItem}>
                        <span className={styles.topRank}>#{idx + 1}</span>
                        <div className={styles.topInfo}>
                          <span className={styles.topName}>{name}</span>
                          {handle && <span className={styles.topHandle}>@{handle}</span>}
                        </div>
                        <span className={styles.topValue}>{formatNumber(entry?.viewers)} viewers</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {showForecast && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Prévisions et tendances</h2>
                  <p className={styles.sectionDescription}>
                    Basé sur les {forecast?.windowDays ?? 7} derniers jours : moyennes, tops catégories et meilleures audiences.
                  </p>
                </div>
              </div>
              {forecast?.overall && (
                <>
                  <div className={styles.cardsRow}>
                    <div className={styles.card}>
                      <span className={styles.cardLabel}>Moyenne viewers</span>
                      <span className={styles.cardValue}>{formatNumber(forecast.overall.averageViewers)}</span>
                      <span className={styles.cardHint}>Fenêtre: {forecast.windowDays ?? 7} jours</span>
                    </div>
                    <div className={styles.card}>
                      <span className={styles.cardLabel}>Médiane viewers</span>
                      <span className={styles.cardValue}>{formatNumber(forecast.overall.medianViewers)}</span>
                      <span className={styles.cardHint}>Dernières diffusions</span>
                    </div>
                  </div>
                </>
              )}

              <div className={styles.subNav}>
                {[
                  { key: 'vtubers', label: 'Top VTubers' },
                  { key: 'categories', label: 'Catégories phares' },
                  { key: 'hourly', label: 'Répartition horaire' },
                  { key: 'history', label: 'Évolution moyenne/médiane' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`${styles.subNavBtn} ${activeStatTab === tab.key ? styles.subNavBtnActive : ''}`}
                    onClick={() => setActiveStatTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeStatTab === 'categories' && (
                <div className={styles.panel}>
                  <h3 className={styles.sectionTitle}>Catégories phares</h3>
                  {topCategories?.length > 0 ? (
                    <div className={styles.categoryGrid}>
                      {topCategoriesRanking.map((cat) => (
                        <div key={`${cat.rank}-${cat.name}`} className={styles.categoryCard}>
                          <div className={styles.categoryArtWrapper}>
                            <span className={styles.categoryRank}>#{cat.rank}</span>
                            <img src={cat.boxArt} alt={cat.name} className={styles.categoryArt} loading="lazy" />
                          </div>
                          <div className={styles.categoryInfo}>
                            <span className={styles.categoryName}>{cat.name}</span>
                            <div className={styles.categoryMetrics}>
                              <span className={styles.categoryMetric}>{formatNumber(cat.viewers)} moy.</span>
                              {cat.median !== null && (
                                <>
                                  <span className={styles.categoryMetricMuted}>·</span>
                                  <span className={styles.categoryMetric}>{formatNumber(cat.median)} méd.</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.empty}>Aucune catégorie détectée.</p>
                  )}
                </div>
              )}

              {activeStatTab === 'vtubers' && (
                <div className={styles.panel}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3 className={styles.sectionTitle}>Top VTubers (moyenne & médiane)</h3>
                      <p className={styles.sectionDescription}>
                        Classement sur la période (moyenne et médiane d’audience).
                      </p>
                    </div>
                    <div className={styles.filterBtnRow}>
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'fr', label: 'VtuberFR' },
                        { key: 'qc', label: 'VtuberQC' }
                      ].map((btn) => (
                        <button
                          key={btn.key}
                          type="button"
                          className={`${styles.filterBtn} ${vtuberFilter === btn.key ? styles.filterBtnActive : ''}`}
                          onClick={() => setVtuberFilter(btn.key)}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.vtuberGrid}>
                    {filteredTopVtubers.map((vt) => (
                      <div key={`${vt.rank}-${vt.handle ?? vt.name}`} className={styles.vtuberCard}>
                        <div className={styles.vtuberAvatarWrapper}>
                          <span className={styles.vtuberRank}>#{vt.rank}</span>
                          {vt.avatar ? (
                            <img src={vt.avatar} alt={vt.name} className={styles.vtuberAvatar} loading="lazy" />
                          ) : (
                            <div className={styles.vtuberAvatarFallback}>{vt.name?.[0] ?? '—'}</div>
                          )}
                        </div>
                        <div className={styles.vtuberInfo}>
                          <div className={styles.vtuberNameRow}>
                            {vt.handle ? (
                              <Link to={`/c/${encodeURIComponent(vt.handle)}`} className={styles.vtuberName}>
                                {vt.name}
                              </Link>
                            ) : (
                              <span className={styles.vtuberName}>{vt.name}</span>
                            )}
                            {vt.team && (
                              <span className={styles.vtuberBadge}>{vt.team.toUpperCase()}</span>
                            )}
                          </div>
                          {vt.handle && <span className={styles.vtuberHandle}>@{vt.handle}</span>}
                          <div className={styles.vtuberMetrics}>
                            <span className={styles.vtuberMetric}>
                              {formatNumber(vt.average)} moy.
                            </span>
                            <span className={styles.vtuberMetricMuted}>·</span>
                            <span className={styles.vtuberMetric}>
                              {formatNumber(vt.median)} méd.
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredTopVtubers.length === 0 && (
                      <p className={styles.empty}>Aucun VTuber pour ce filtre.</p>
                    )}
                  </div>
                </div>
              )}

              {activeStatTab === 'hourly' && (
                <div className={styles.panel}>
                  <h3 className={styles.sectionTitle}>Répartition horaire</h3>
                  {hourlySeries?.length > 0 ? (
                    <HourlyLineChart data={hourlySeries} />
                  ) : (
                    <p className={styles.empty}>Pas de données horaires.</p>
                  )}
                </div>
              )}

              {activeStatTab === 'history' && (
                <div className={styles.panel}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3 className={styles.sectionTitle}>Évolution moyenne/médiane</h3>
                      <p className={styles.sectionDescription}>
                        Vue glissante sur {historyWindowLabel} (groupée par {historyGroup === 'day' ? 'jour' : historyGroup === 'month' ? 'mois' : 'année'}).
                      </p>
                    </div>
                  </div>
                  {historySeries?.length > 0 ? (
                    <HistoryLineChart data={historySeries} />
                  ) : (
                    <p className={styles.empty}>Pas de données historiques.</p>
                  )}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default StatsPage;
