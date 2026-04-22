import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import usePatientPortalData from '../hooks/usePatientPortalData';
import {
  buildProgressWidth,
  formatDate,
  getAgeFromDob,
  getDoctorName,
  getMedicationName,
  getStatusNarrative,
  statusClass
} from '../utils/patientPortal';

export default function PatientDashboard() {
  const profileSnapshotRef = useRef(null);
  const careStatusRef = useRef(null);
  const recentPrescriptionsRef = useRef(null);
  const highlightTimerRef = useRef(null);
  const [highlightedSection, setHighlightedSection] = useState('');
  const [visibleSections, setVisibleSections] = useState({});
  const {
    patient,
    prescriptions,
    summary,
    latestPrescription,
    allergyCount,
    historyCount,
    lastUpdateDate,
    isLoading,
    errorMessage
  } = usePatientPortalData({ prescriptionLimit: 8 });

  const summaryCards = [
    {
      icon: 'prescription',
      label: 'Total prescriptions',
      value: summary.total,
      note: 'Across your linked care history',
      sectionRef: recentPrescriptionsRef,
      sectionKey: 'recent-prescriptions'
    },
    {
      icon: 'clock',
      label: 'Awaiting progress',
      value: summary.pending,
      note: 'Pending review or in active processing',
      sectionRef: careStatusRef,
      sectionKey: 'care-status'
    },
    {
      icon: 'checkCircle',
      label: 'Completed fills',
      value: summary.filled,
      note: 'Successfully dispensed prescriptions',
      sectionRef: recentPrescriptionsRef,
      sectionKey: 'recent-prescriptions'
    },
    {
      icon: 'alert',
      label: 'Allergy alerts',
      value: allergyCount,
      note: allergyCount ? 'Important sensitivities are recorded' : 'No allergies recorded right now',
      sectionRef: profileSnapshotRef,
      sectionKey: 'profile-snapshot'
    }
  ];

  const statusBreakdown = [
    { label: 'Pending review', value: summary.pending - summary.processing },
    { label: 'In processing', value: summary.processing },
    { label: 'Filled', value: summary.filled },
    { label: 'Cancelled', value: summary.cancelled }
  ];

  const recordFacts = [
    { label: 'Patient ID', value: patient?.patientId || 'Not linked' },
    { label: 'Date of birth', value: formatDate(patient?.dob) },
    { label: 'Age', value: getAgeFromDob(patient?.dob) },
    { label: 'Latest update', value: formatDate(lastUpdateDate) }
  ];

  const portalShortcuts = [
    {
      to: '/patient/profile',
      icon: 'users',
      label: 'Open Health Record',
      note: 'Review profile, allergies, and medical history.'
    },
    {
      to: '/patient/prescriptions',
      icon: 'prescription',
      label: 'Go To Prescriptions',
      note: 'Browse every prescription with a focused detail panel.'
    },
    {
      to: '/patient/change-password',
      icon: 'shield',
      label: 'Security Settings',
      note: 'Update your password and keep portal access protected.'
    }
  ];

  const recentPrescriptions = prescriptions.slice(0, 3);

  useEffect(() => () => {
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll('[data-scroll-reveal]'));
    if (!revealElements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const sectionKey = entry.target.getAttribute('data-scroll-reveal');
          if (!sectionKey) {
            return;
          }

          setVisibleSections((current) => {
            if (current[sectionKey]) {
              return current;
            }

            return { ...current, [sectionKey]: true };
          });

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionRef, sectionKey) => {
    const sectionElement = sectionRef?.current;
    if (!sectionElement) {
      return;
    }

    const stickyOffset = 108;
    const nextTop = sectionElement.getBoundingClientRect().top + window.scrollY - stickyOffset;

    window.scrollTo({
      top: Math.max(nextTop, 0),
      behavior: 'smooth'
    });

    setHighlightedSection(sectionKey);

    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current);
    }

    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedSection('');
    }, 1400);
  };

  const revealClassName = (sectionKey) => `scroll-reveal ${visibleSections[sectionKey] ? 'is-visible' : ''}`.trim();

  return (
    <section className="page patient-dashboard-shell">
      {errorMessage ? (
        <div className="notice-banner patient-dashboard-notice" role="alert">
          <div>
            <strong>Patient portal issue</strong>
            <div className="helper-text">{errorMessage}</div>
          </div>
        </div>
      ) : null}

      <section className={`patient-dashboard-hero ${revealClassName('hero')}`.trim()} data-scroll-reveal="hero">
        <div className="patient-dashboard-hero-copy">
          <span className="patient-dashboard-kicker">Patient Dashboard</span>
          <h2>
            {patient?.name
              ? `${patient.name}, your portal is now organized into clear pages for overview, records, and prescriptions.`
              : 'Your patient portal is organized into clear pages for overview, records, and prescriptions.'}
          </h2>
          <p>
            Start from this dashboard to see your current care status, then move into dedicated pages for your
            medical record and prescription history whenever you need more detail.
          </p>

          <div className="patient-dashboard-meta">
            <span className="patient-dashboard-chip">
              <AppIcon name="shield" size={16} />
              {patient?.patientId ? `Patient ID ${patient.patientId}` : 'Waiting for record linkage'}
            </span>
            <span className="patient-dashboard-chip">
              <AppIcon name="calendar" size={16} />
              Latest update {formatDate(lastUpdateDate)}
            </span>
            <span className="patient-dashboard-chip">
              <AppIcon name="clock" size={16} />
              {summary.pending ? `${summary.pending} item(s) still in progress` : 'No prescriptions waiting on action'}
            </span>
          </div>

          <div className="toolbar-group patient-layout-actions">
            <Link className="button-primary" to="/patient/prescriptions">
              <AppIcon name="prescription" size={16} />
              Open Prescriptions
            </Link>
            <Link className="button-secondary" to="/patient/profile">
              <AppIcon name="users" size={16} />
              View Health Record
            </Link>
          </div>
        </div>

        <aside className="patient-hero-spotlight">
          <div className="patient-spotlight-card patient-spotlight-primary">
            <div className="caption">Latest prescription</div>
            {latestPrescription ? (
              <>
                <div className="patient-spotlight-head">
                  <strong>{latestPrescription.rxId}</strong>
                  <span className={statusClass(latestPrescription.status)}>{latestPrescription.status}</span>
                </div>
                <p className="helper-text">
                  Issued {formatDate(latestPrescription.createdAt)} by {getDoctorName(latestPrescription)}
                </p>
                <div className="pill-row">
                  {latestPrescription.items?.slice(0, 3).map((item, index) => (
                    <span className="pill" key={`${latestPrescription._id}-${item.atcCode || index}`}>
                      {getMedicationName(item)}
                    </span>
                  ))}
                  {latestPrescription.items?.length > 3 ? (
                    <span className="pill">+{latestPrescription.items.length - 3} more</span>
                  ) : null}
                </div>
                <div className="patient-dashboard-inline-note">
                  {getStatusNarrative(latestPrescription.status)}
                </div>
              </>
            ) : (
              <div className="helper-text">
                {isLoading ? 'Loading your latest prescription...' : 'No prescriptions are linked to your portal yet.'}
              </div>
            )}
          </div>

          <div className="patient-spotlight-grid">
            <article className="patient-spotlight-stat">
              <AppIcon name="alert" size={18} />
              <strong>{allergyCount}</strong>
              <span>Allergy markers</span>
            </article>
            <article className="patient-spotlight-stat">
              <AppIcon name="note" size={18} />
              <strong>{historyCount}</strong>
              <span>History notes</span>
            </article>
            <article className="patient-spotlight-stat">
              <AppIcon name="pill" size={18} />
              <strong>{latestPrescription?.items?.length || 0}</strong>
              <span>Latest medication lines</span>
            </article>
            <article className="patient-spotlight-stat">
              <AppIcon name="checkCircle" size={18} />
              <strong>{summary.filled}</strong>
              <span>Completed fills</span>
            </article>
          </div>
        </aside>
      </section>

      <div className={`patient-summary-grid ${revealClassName('summary-grid')}`.trim()} data-scroll-reveal="summary-grid">
        {summaryCards.map((card) => (
          <button
            className="patient-summary-card patient-summary-card-button"
            key={card.label}
            onClick={() => scrollToSection(card.sectionRef, card.sectionKey)}
            type="button"
          >
            <span className="patient-summary-icon">
              <AppIcon name={card.icon} size={18} />
            </span>
            <div className="patient-summary-copy">
              <div className="caption">{card.label}</div>
              <strong>{card.value}</strong>
              <span className="helper-text">{card.note}</span>
            </div>
          </button>
        ))}
      </div>

      <div className={`patient-overview-grid ${revealClassName('overview-grid')}`.trim()} data-scroll-reveal="overview-grid">
        <section
          className={`patient-record-card ${highlightedSection === 'profile-snapshot' ? 'is-scroll-targeted' : ''}`.trim()}
          ref={profileSnapshotRef}
        >
          <div className="panel-head">
            <div className="page-title">
              <div className="section-title">
                <AppIcon name="users" size={18} />
                <h3>Profile Snapshot</h3>
              </div>
              <p className="helper-text">A concise health-record summary before you open the full record page.</p>
            </div>
            <Link className="button-secondary" to="/patient/profile">
              <AppIcon name="chevronRight" size={16} />
              Open Profile
            </Link>
          </div>

          <div className="patient-record-grid">
            {recordFacts.map((fact) => (
              <article className="patient-record-tile" key={fact.label}>
                <span className="caption">{fact.label}</span>
                <strong>{fact.value}</strong>
              </article>
            ))}
          </div>

          <div className="patient-record-section">
            <div className="caption">Allergy profile</div>
            <div className="pill-row">
              {patient?.allergies?.length ? patient.allergies.slice(0, 4).map((entry) => (
                <span className="pill" key={`${patient.patientId}-${entry.substance}`}>
                  {entry.substance} ({entry.severity})
                </span>
              )) : <span className="pill">No allergies recorded</span>}
            </div>
          </div>

          <div className="patient-record-section">
            <div className="caption">Medical history</div>
            {patient?.medicalHistory?.length ? (
              <div className="patient-history-grid">
                {patient.medicalHistory.slice(0, 4).map((entry) => (
                  <div className="patient-history-item" key={`${patient.patientId}-${entry}`}>
                    <AppIcon name="note" size={16} />
                    <span>{entry}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="helper-text">No medical history notes have been added for this account yet.</div>
            )}
          </div>
        </section>

        <section
          className={`patient-status-card ${highlightedSection === 'care-status' ? 'is-scroll-targeted' : ''}`.trim()}
          ref={careStatusRef}
        >
          <div className="panel-head">
            <div className="page-title">
              <div className="section-title">
                <AppIcon name="reports" size={18} />
                <h3>Care Status</h3>
              </div>
              <p className="helper-text">A dashboard view of where your prescription activity is currently sitting.</p>
            </div>
            {latestPrescription ? (
              <span className={statusClass(latestPrescription.status)}>{latestPrescription.status}</span>
            ) : null}
          </div>

          <div className="patient-status-list">
            {statusBreakdown.map((item) => (
              <div className="patient-status-row" key={item.label}>
                <div className="patient-status-row-copy">
                  <span>{item.label}</span>
                  <strong>{Math.max(item.value, 0)}</strong>
                </div>
                <div className="patient-status-track">
                  <span style={{ width: buildProgressWidth(Math.max(item.value, 0), Math.max(summary.total, 1)) }} />
                </div>
              </div>
            ))}
          </div>

          <div className="patient-status-note">
            <div className="caption">Current care note</div>
            <strong>{latestPrescription ? latestPrescription.rxId : 'No prescription selected'}</strong>
            <p className="helper-text">
              {latestPrescription
                ? getStatusNarrative(latestPrescription.status)
                : 'Once a prescription is linked to your account, its treatment details will appear here.'}
            </p>
          </div>
        </section>
      </div>

      <div className={`patient-page-grid ${revealClassName('page-grid')}`.trim()} data-scroll-reveal="page-grid">
        <section
          className={`patient-record-card ${highlightedSection === 'recent-prescriptions' ? 'is-scroll-targeted' : ''}`.trim()}
          ref={recentPrescriptionsRef}
        >
          <div className="panel-head">
            <div className="page-title">
              <div className="section-title">
                <AppIcon name="clock" size={18} />
                <h3>Recent Prescriptions</h3>
              </div>
              <p className="helper-text">A short list here, with the full prescription center available on its own page.</p>
            </div>
            <Link className="button-secondary" to="/patient/prescriptions">
              <AppIcon name="prescription" size={16} />
              Full History
            </Link>
          </div>

          {isLoading ? (
            <div className="empty-state">
              <AppIcon name="clock" size={22} />
              <strong>Loading prescriptions</strong>
              <div className="helper-text">Preparing the latest prescriptions linked to your account.</div>
            </div>
          ) : recentPrescriptions.length ? (
            <div className="patient-compact-list">
              {recentPrescriptions.map((item) => (
                <article className="patient-compact-item" key={item._id}>
                  <div className="patient-compact-item-copy">
                    <div className="patient-compact-item-head">
                      <strong>{item.rxId}</strong>
                      <span className={statusClass(item.status)}>{item.status}</span>
                    </div>
                    <div className="helper-text">{formatDate(item.createdAt)}</div>
                    <div className="patient-prescription-item-meta">
                      <span>
                        <AppIcon name="users" size={15} />
                        {getDoctorName(item)}
                      </span>
                      <span>
                        <AppIcon name="pill" size={15} />
                        {item.items?.length || 0} medication line(s)
                      </span>
                    </div>
                  </div>
                  <Link className="patient-prescription-item-arrow" to={`/patient/prescriptions?rx=${item._id}`}>
                    <span>Open</span>
                    <AppIcon name="chevronRight" size={18} />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <AppIcon name="prescription" size={22} />
              <strong>No prescriptions linked yet</strong>
              <div className="helper-text">Your care team can link prescriptions to this portal as soon as they are issued.</div>
            </div>
          )}
        </section>

        <section className="patient-status-card">
          <div className="panel-head">
            <div className="page-title">
              <div className="section-title">
                <AppIcon name="dashboard" size={18} />
                <h3>Portal Shortcuts</h3>
              </div>
              <p className="helper-text">Move through the portal the way a patient would in a dedicated multi-page experience.</p>
            </div>
          </div>

          <div className="patient-shortcut-grid">
            {portalShortcuts.map((item) => (
              <Link className="patient-shortcut-card" key={item.to} to={item.to}>
                <span className="patient-summary-icon">
                  <AppIcon name={item.icon} size={18} />
                </span>
                <strong>{item.label}</strong>
                <span className="helper-text">{item.note}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
