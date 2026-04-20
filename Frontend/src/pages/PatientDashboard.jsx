import { useEffect, useMemo, useState } from 'react';
import AppIcon from '../components/AppIcon';
import {
  downloadPrescriptionPdf,
  getApiMessage,
  getCurrentUser,
  getMyPatientRecord,
  getPatientSummaryReport,
  listPrescriptions
} from '../api/pimsApi';
import useToast from '../hooks/useToast';

function statusClass(status) {
  if (status === 'Filled') {
    return 'status-pill status-success';
  }
  if (status === 'Pending' || status === 'Processing') {
    return 'status-pill status-warning';
  }
  if (status === 'Cancelled') {
    return 'status-pill status-critical';
  }
  return 'status-pill status-neutral';
}

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reportSummary, setReportSummary] = useState(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { notifyError, notifySuccess } = useToast();

  useEffect(() => {
    let isActive = true;

    async function loadPatientPortal() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [userData, patientData, prescriptionData, summaryData] = await Promise.all([
          getCurrentUser(),
          getMyPatientRecord(),
          listPrescriptions({ limit: 12 }),
          getPatientSummaryReport()
        ]);

        if (!isActive) {
          return;
        }

        setPatient(patientData?.patient || userData?.user?.patient || null);
        setPrescriptions(prescriptionData?.prescriptions || []);
        setReportSummary(summaryData || null);
        setSelectedPrescriptionId((prescriptionData?.prescriptions || [])[0]?._id || '');
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(getApiMessage(error, 'Failed to load patient portal'));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadPatientPortal();

    return () => {
      isActive = false;
    };
  }, []);

  const selectedPrescription = useMemo(
    () => prescriptions.find((item) => item._id === selectedPrescriptionId) || prescriptions[0] || null,
    [prescriptions, selectedPrescriptionId]
  );

  const summary = useMemo(() => {
    if (reportSummary?.overview) {
      return {
        total: reportSummary.overview.totalPrescriptions || 0,
        pending: (reportSummary.overview.pending || 0) + (reportSummary.overview.processing || 0),
        urgent: reportSummary.overview.urgent || 0,
        filled: reportSummary.overview.filled || 0
      };
    }

    return {
      total: prescriptions.length,
      pending: prescriptions.filter((item) => item.status === 'Pending' || item.status === 'Processing').length,
      urgent: prescriptions.filter((item) => item.isUrgent).length,
      filled: prescriptions.filter((item) => item.status === 'Filled').length
    };
  }, [prescriptions, reportSummary]);

  const handleDownload = async () => {
    if (!selectedPrescription?._id) {
      return;
    }

    try {
      const response = await downloadPrescriptionPdf(selectedPrescription._id);
      const fileUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${selectedPrescription.rxId || 'prescription'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileUrl);
      notifySuccess('PDF ready', 'Your prescription PDF downloaded successfully.');
    } catch (error) {
      notifyError('Download failed', getApiMessage(error, 'Failed to download prescription PDF'));
    }
  };

  return (
    <section className="page">
      {errorMessage ? (
        <div className="notice-banner" role="alert">
          <div>
            <strong>Patient portal issue</strong>
            <div className="helper-text">{errorMessage}</div>
          </div>
        </div>
      ) : null}

      <div className="stats-grid">
        <section className="panel">
          <strong>Total Prescriptions</strong>
          <h2>{summary.total}</h2>
        </section>
        <section className="panel">
          <strong>Pending Review</strong>
          <h2>{summary.pending}</h2>
        </section>
        <section className="panel">
          <strong>Filled</strong>
          <h2>{summary.filled}</h2>
        </section>
        <section className="panel">
          <strong>Urgent</strong>
          <h2>{summary.urgent}</h2>
        </section>
      </div>

      <div className="content-grid-2">
        <section className="panel">
          <div className="section-title">
            <AppIcon name="users" size={20} />
            <h3>My Record</h3>
          </div>
          {patient ? (
            <div className="stack">
              <div>
                <div className="caption">Identity</div>
                <strong>{patient.name}</strong>
                <div className="helper-text">Patient ID {patient.patientId}</div>
              </div>
              <div>
                <div className="caption">Profile</div>
                <div className="helper-text">
                  DOB {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'} · {patient.gender || 'N/A'}
                </div>
              </div>
              <div>
                <div className="caption">Allergies</div>
                <div className="pill-row">
                  {patient.allergies?.length ? patient.allergies.map((entry) => (
                    <span className="pill" key={`${patient.patientId}-${entry.substance}`}>
                      {entry.substance} ({entry.severity})
                    </span>
                  )) : <span className="pill">No allergies recorded</span>}
                </div>
              </div>
              <div>
                <div className="caption">Medical History</div>
                <div className="helper-text">
                  {patient.medicalHistory?.length ? patient.medicalHistory.join(' · ') : 'No medical history recorded.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="helper-text">{isLoading ? 'Loading your record...' : 'No patient record linked to this account yet.'}</div>
          )}
        </section>

        <section className="panel">
          <div className="section-title">
            <AppIcon name="prescription" size={20} />
            <h3>Recent Prescriptions</h3>
          </div>
          <div className="helper-text">These are the prescriptions linked to your account.</div>

          <div className="table-wrap" style={{ marginTop: '1rem' }}>
            <table aria-busy={isLoading ? 'true' : 'false'} className="data-table">
              <caption className="visually-hidden">Patient prescriptions</caption>
              <thead>
                <tr>
                  <th>Rx ID</th>
                  <th>Drug</th>
                  <th>Issued</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => setSelectedPrescriptionId(item._id)}
                    style={{ cursor: 'pointer', background: selectedPrescriptionId === item._id ? 'rgba(15, 155, 142, 0.05)' : undefined }}
                  >
                    <td>{item.rxId}</td>
                    <td>{item.items?.[0]?.medicineId?.name || item.items?.[0]?.atcCode || 'N/A'}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td><span className={statusClass(item.status)}>{item.status}</span></td>
                  </tr>
                ))}
                {!isLoading && !prescriptions.length ? (
                  <tr>
                    <td className="helper-text" colSpan="4">No prescriptions have been linked to your patient account yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="toolbar">
          <div className="page-title">
            <div className="section-title">
              <AppIcon name="note" size={18} />
              <h3>Prescription Details</h3>
            </div>
            <p className="helper-text">View the latest prescription details and download a PDF copy if needed.</p>
          </div>
          <button className="button-secondary" disabled={!selectedPrescription} onClick={handleDownload} type="button">
            Download PDF
          </button>
        </div>

        {selectedPrescription ? (
          <div className="stack">
            <div className="field-grid two">
              <div>
                <div className="caption">Rx ID</div>
                <strong>{selectedPrescription.rxId}</strong>
              </div>
              <div>
                <div className="caption">Status</div>
                <span className={statusClass(selectedPrescription.status)}>{selectedPrescription.status}</span>
              </div>
            </div>
            <div>
              <div className="caption">Diagnosis</div>
              <div className="helper-text">{selectedPrescription.diagnosis || 'No diagnosis supplied.'}</div>
            </div>
            <div>
              <div className="caption">Medication List</div>
              <div className="mini-list">
                {(selectedPrescription.items || []).map((item) => (
                  <div className="mini-list-item" key={`${selectedPrescription._id}-${item.atcCode}`}>
                    <div>
                      <strong>{item.medicineId?.name || item.atcCode}</strong>
                      <div className="helper-text">
                        {item.dose} · {item.frequency} · {item.route} · {item.durationDays} days
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="helper-text">Select a prescription to see details.</div>
        )}
      </section>
    </section>
  );
}
