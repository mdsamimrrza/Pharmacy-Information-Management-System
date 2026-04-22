import { useEffect, useMemo, useState } from 'react';
import {
  getApiMessage,
  getCurrentUser,
  getMyPatientRecord,
  getPatientSummaryReport,
  listPrescriptions
} from '../api/pimsApi';

export default function usePatientPortalData({ prescriptionLimit = 12 } = {}) {
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reportSummary, setReportSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadPatientPortal() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [userData, patientData, prescriptionData, summaryData] = await Promise.all([
          getCurrentUser(),
          getMyPatientRecord(),
          listPrescriptions({ limit: prescriptionLimit }),
          getPatientSummaryReport()
        ]);

        if (!isActive) {
          return;
        }

        setPatient(patientData?.patient || userData?.user?.patient || null);
        setPrescriptions(prescriptionData?.prescriptions || []);
        setReportSummary(summaryData || null);
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
  }, [prescriptionLimit]);

  const latestPrescription = prescriptions[0] || null;

  const summary = useMemo(() => {
    const overview = reportSummary?.overview || {};

    return {
      total: overview.totalPrescriptions ?? prescriptions.length,
      pending: (overview.pending ?? 0) + (overview.processing ?? 0),
      processing: overview.processing ?? prescriptions.filter((item) => item.status === 'Processing').length,
      filled: overview.filled ?? prescriptions.filter((item) => item.status === 'Filled').length,
      cancelled: overview.cancelled ?? prescriptions.filter((item) => item.status === 'Cancelled').length,
      urgent: prescriptions.filter((item) => item.isUrgent).length
    };
  }, [prescriptions, reportSummary]);

  const allergyCount = patient?.allergies?.length || 0;
  const historyCount = patient?.medicalHistory?.length || 0;
  const lastUpdateDate = reportSummary?.overview?.latestPrescriptionDate || latestPrescription?.createdAt || null;

  return {
    patient,
    prescriptions,
    reportSummary,
    summary,
    latestPrescription,
    allergyCount,
    historyCount,
    lastUpdateDate,
    isLoading,
    errorMessage
  };
}
