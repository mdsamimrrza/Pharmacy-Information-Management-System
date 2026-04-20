import AppIcon from './AppIcon';

export default function StatCard({ title, value, hint, trend, icon = 'note', tone = 'default' }) {
  const trendTone = trend?.startsWith('-') ? 'down' : 'up';

  return (
    <section className="stat-card">
      <div className="stat-card-top">
        <div className="stat-label">{title}</div>
        <span className={`badge ${tone === 'accent' ? 'badge-accent' : ''}`.trim()}>
          <AppIcon name={icon} size={16} />
        </span>
      </div>
      <div>
        <h3>{value}</h3>
        {hint ? <div className="helper-text">{hint}</div> : null}
      </div>
      {trend ? <div className={`trend ${trendTone}`}>{trend}</div> : <span />}
    </section>
  );
}
