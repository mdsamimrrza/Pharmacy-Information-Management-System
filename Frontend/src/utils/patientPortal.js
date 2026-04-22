export function statusClass(status) {
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

export function formatDate(value, options = {}) {
  if (!value) {
    return 'Not available';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Not available';
  }

  return parsed.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  });
}

export function getAgeFromDob(value) {
  if (!value) {
    return 'Not available';
  }

  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) {
    return 'Not available';
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthOffset = today.getMonth() - dob.getMonth();

  if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return `${age} years`;
}

export function getMedicationName(item) {
  return item?.medicineId?.name
    || item?.medicineId?.genericName
    || item?.atcCode
    || 'Medication';
}

export function getDoctorName(prescription) {
  const doctor = prescription?.doctorId;
  const name = [doctor?.firstName, doctor?.lastName].filter(Boolean).join(' ').trim();
  return name || 'Assigned clinician';
}

export function getStatusNarrative(status) {
  if (status === 'Filled') {
    return 'This prescription has been completed and is ready in your history.';
  }

  if (status === 'Processing') {
    return 'The pharmacy team is actively preparing this prescription.';
  }

  if (status === 'Pending') {
    return 'This prescription is waiting for the next dispensing step.';
  }

  if (status === 'Cancelled') {
    return 'This prescription was cancelled and is kept for your records.';
  }

  return 'Review the latest prescription details and medication plan.';
}

export function buildProgressWidth(value, total) {
  if (!value || !total) {
    return '0%';
  }

  return `${Math.max((value / total) * 100, 12)}%`;
}
