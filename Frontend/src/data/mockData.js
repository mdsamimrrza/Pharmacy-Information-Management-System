import { ROLES } from '../constants/roles';

export const roleProfiles = {
  [ROLES.DOCTOR]: {
    name: 'Dr. Smith',
    title: 'Doctor',
    email: 'doctor@pims.com'
  },
  [ROLES.PHARMACIST]: {
    name: 'Lena Brooks',
    title: 'Lead Pharmacist',
    email: 'pharma@pims.com'
  },
  [ROLES.ADMIN]: {
    name: 'System Admin',
    title: 'Administrator',
    email: 'admin@pims.com'
  },
  [ROLES.PATIENT]: {
    name: 'Patient Portal',
    title: 'Patient',
    email: 'patient@pims.com'
  }
};

export const patients = [
  {
    id: 'P-123456',
    name: 'John Doe',
    dob: '1986-02-14',
    gender: 'Male',
    lastVisit: '2026-04-14',
    allergies: ['Penicillin']
  },
  {
    id: 'P-782201',
    name: 'Jane Smith',
    dob: '1990-08-21',
    gender: 'Female',
    lastVisit: '2026-04-18',
    allergies: ['Ibuprofen']
  },
  {
    id: 'P-600197',
    name: 'Robert Henderson',
    dob: '1982-05-14',
    gender: 'Male',
    lastVisit: '2026-04-20',
    allergies: ['NSAIDs', 'Penicillin']
  },
  {
    id: 'P-410900',
    name: 'Emily Davis',
    dob: '1979-11-30',
    gender: 'Female',
    lastVisit: '2026-04-10',
    allergies: []
  }
];

export const prescriptionRecords = [
  {
    id: 'PRX-9012',
    patient: 'John Doe',
    patientId: 'P-123456',
    medicine: 'Amoxicillin 500mg',
    atcCode: 'J01CA04',
    dateIssued: '2026-04-20',
    status: 'Active',
    prescriber: 'Dr. Smith',
    priority: 'Normal',
    notes: 'Continue hydration and review response after 48 hours.',
    instructions: 'Take after meals, twice daily.',
    history: ['Created 09:12 AM', 'Sent to pharmacy 09:15 AM', 'Viewed by pharmacist 09:20 AM']
  },
  {
    id: 'PRX-8843',
    patient: 'Jane Smith',
    patientId: 'P-782201',
    medicine: 'Lisinopril 10mg',
    atcCode: 'C09AA03',
    dateIssued: '2026-04-19',
    status: 'Pending',
    prescriber: 'Dr. Smith',
    priority: 'Review',
    notes: 'Monitor blood pressure daily and check renal panel in one week.',
    instructions: 'Take once each morning.',
    history: ['Created 02:42 PM', 'Validation completed 02:44 PM']
  },
  {
    id: 'PRX-8721',
    patient: 'Robert Brown',
    patientId: 'P-552611',
    medicine: 'Metformin 850mg',
    atcCode: 'A10BA02',
    dateIssued: '2026-04-19',
    status: 'Completed',
    prescriber: 'Dr. Cole',
    priority: 'Normal',
    notes: 'Patient tolerating well. Reinforce dietary compliance.',
    instructions: 'Take with breakfast and dinner.',
    history: ['Created 11:07 AM', 'Dispensed 12:01 PM', 'Completed 04:18 PM']
  },
  {
    id: 'PRX-8655',
    patient: 'Emily Davis',
    patientId: 'P-410900',
    medicine: 'Atorvastatin 20mg',
    atcCode: 'C10AA05',
    dateIssued: '2026-04-18',
    status: 'Active',
    prescriber: 'Dr. Smith',
    priority: 'Normal',
    notes: 'Repeat lipid profile after six weeks.',
    instructions: 'Take nightly.',
    history: ['Created 05:55 PM', 'Sent to pharmacy 05:58 PM']
  },
  {
    id: 'PRX-8501',
    patient: 'Michael Wilson',
    patientId: 'P-230901',
    medicine: 'Ibuprofen 400mg',
    atcCode: 'M01AE01',
    dateIssued: '2026-04-18',
    status: 'Cancelled',
    prescriber: 'Dr. Smith',
    priority: 'Critical',
    notes: 'Cancelled after allergy conflict review.',
    instructions: 'No dispense.',
    history: ['Created 08:10 AM', 'Interaction flagged 08:12 AM', 'Cancelled 08:14 AM']
  }
];

export const incomingPrescriptions = [
  {
    id: 'RX-3201',
    patient: 'Mia Patel',
    items: 3,
    eta: '2 min',
    priority: 'STAT',
    status: 'Ready for review'
  },
  {
    id: 'RX-3194',
    patient: 'Robert Henderson',
    items: 1,
    eta: '5 min',
    priority: 'Standard',
    status: 'Waiting for stock confirmation'
  },
  {
    id: 'RX-3182',
    patient: 'Lori Chen',
    items: 2,
    eta: '8 min',
    priority: 'Refill',
    status: 'Prepared for dispensing'
  }
];

export const inventoryRecords = [
  {
    id: 'INV-2291',
    medicine: 'Metformin HCl',
    manufacturer: 'Glucare Pharma',
    atcCode: 'A10BA02',
    stock: 340,
    threshold: 120,
    batchId: 'B-2291',
    storage: 'Room temperature',
    expiryDate: '2026-11-18',
    expiryStatus: 'Stable'
  },
  {
    id: 'INV-1160',
    medicine: 'Amoxicillin 500mg',
    manufacturer: 'Medilife',
    atcCode: 'J01CA04',
    stock: 18,
    threshold: 60,
    batchId: 'B-1160',
    storage: 'Dry cabinet',
    expiryDate: '2026-06-05',
    expiryStatus: 'Low stock'
  },
  {
    id: 'INV-1092',
    medicine: 'Lisinopril 10mg',
    manufacturer: 'CardioNova',
    atcCode: 'C09AA03',
    stock: 77,
    threshold: 50,
    batchId: 'B-1092',
    storage: 'Controlled shelf',
    expiryDate: '2026-08-11',
    expiryStatus: 'Healthy'
  },
  {
    id: 'INV-3401',
    medicine: 'Insulin Glargine',
    manufacturer: 'NovoCare',
    atcCode: 'A10AE04',
    stock: 24,
    threshold: 20,
    batchId: 'C-3401',
    storage: 'Cold storage',
    expiryDate: '2026-05-12',
    expiryStatus: 'Near expiry'
  },
  {
    id: 'INV-1887',
    medicine: 'Atorvastatin 20mg',
    manufacturer: 'Lipida Labs',
    atcCode: 'C10AA05',
    stock: 128,
    threshold: 70,
    batchId: 'A-1887',
    storage: 'Room temperature',
    expiryDate: '2027-01-28',
    expiryStatus: 'Healthy'
  }
];

export const alertRecords = [
  {
    id: 'ALT-1001',
    section: 'Critical Low Stock',
    item: 'Amoxicillin 500mg',
    detail: '18 units remaining',
    severity: 'critical',
    action: 'Restock',
    acknowledged: false
  },
  {
    id: 'ALT-1002',
    section: 'Critical Low Stock',
    item: 'Morphine 10mg Ampoules',
    detail: '8 units remaining',
    severity: 'critical',
    action: 'Acknowledge',
    acknowledged: false
  },
  {
    id: 'ALT-1003',
    section: 'Expiring Soon',
    item: 'Insulin Glargine',
    detail: '22 days until expiry',
    severity: 'warning',
    action: 'Acknowledge',
    acknowledged: false
  },
  {
    id: 'ALT-1004',
    section: 'Expiring Soon',
    item: 'Nitroglycerin 5mg Spray',
    detail: '41 days until expiry',
    severity: 'warning',
    action: 'Review',
    acknowledged: true
  },
  {
    id: 'ALT-1005',
    section: 'Standard Inventory Warnings',
    item: 'Lisinopril 10mg',
    detail: 'Stock dipped below preferred buffer',
    severity: 'success',
    action: 'Monitor',
    acknowledged: true
  }
];

export const adminUsers = [
  {
    id: 'USR-101',
    name: 'Sarah Jenkins',
    role: 'PHARMACIST',
    email: 's.jenkins@pims.com',
    status: 'Active',
    lastSeen: '2 min ago'
  },
  {
    id: 'USR-102',
    name: 'Michael Chen',
    role: 'PHARMACIST',
    email: 'm.chen@pims.com',
    status: 'Active',
    lastSeen: '16 min ago'
  },
  {
    id: 'USR-103',
    name: 'Robert Wilson',
    role: 'DOCTOR',
    email: 'r.wilson@pims.com',
    status: 'Review',
    lastSeen: 'Today, 09:10 AM'
  },
  {
    id: 'USR-104',
    name: 'Emily Davis',
    role: 'ADMIN',
    email: 'e.davis@pims.com',
    status: 'Active',
    lastSeen: 'Today, 08:45 AM'
  }
];

export const adminActivity = [
  {
    id: 'ACT-8831',
    user: 'Dr. Smith',
    action: 'Issued prescription PRX-9012',
    time: '10:12 AM',
    status: 'Completed'
  },
  {
    id: 'ACT-8822',
    user: 'Lena Brooks',
    action: 'Acknowledged alert ALT-1004',
    time: '09:58 AM',
    status: 'Completed'
  },
  {
    id: 'ACT-8801',
    user: 'System',
    action: 'Nightly expiry check finished',
    time: '06:00 AM',
    status: 'Healthy'
  },
  {
    id: 'ACT-8796',
    user: 'Michael Chen',
    action: 'Requested override for controlled stock',
    time: 'Yesterday',
    status: 'Review'
  }
];

export const systemHealthAlerts = [
  {
    id: 'SYS-1',
    title: 'API Latency Warning',
    detail: 'Average response time increased 6% over baseline.',
    tone: 'warning'
  },
  {
    id: 'SYS-2',
    title: 'Backup Completed',
    detail: 'Nightly backup verified across both environments.',
    tone: 'success'
  },
  {
    id: 'SYS-3',
    title: '2-factor Reminder',
    detail: 'One admin account still needs to complete MFA enrollment.',
    tone: 'critical'
  }
];

export const atcNodes = [
  {
    familyCode: 'A',
    family: 'Alimentary Tract and Metabolism',
    groupCode: 'A10',
    group: 'Drugs Used in Diabetes',
    code: 'A10B',
    title: 'Blood Glucose Lowering Drugs',
    description: 'Pharmacological, therapeutic or chemical subgroup description.',
    products: 24,
    tier: 'General Benefit',
    controlledSubstance: 'No',
    note: 'When prescribing drugs under this classification, monitor renal function periodically as per WHO guidelines for elderly patients.',
    tags: ['Frequently Used', 'Chronic Care', 'Emergency'],
    medicines: [
      { brandName: 'Metformin HCl', generic: 'Metformin', strength: '500mg', dosageForm: 'Tablet' },
      { brandName: 'Glucophage XR', generic: 'Metformin', strength: '1000mg', dosageForm: 'ER Tablet' },
      { brandName: 'Januvia', generic: 'Sitagliptin', strength: '100mg', dosageForm: 'Tablet' },
      { brandName: 'Victoza', generic: 'Liraglutide', strength: '6mg/mL', dosageForm: 'Injection' },
      { brandName: 'Jardiance', generic: 'Empagliflozin', strength: '25mg', dosageForm: 'Tablet' }
    ]
  },
  {
    familyCode: 'A',
    family: 'Alimentary Tract and Metabolism',
    groupCode: 'A10',
    group: 'Drugs Used in Diabetes',
    code: 'A10A',
    title: 'Insulins and Analogues',
    description: 'Insulin formulations used for glycemic control in diabetes mellitus.',
    products: 18,
    tier: 'Special Authority',
    controlledSubstance: 'No',
    note: 'Verify storage requirements and patient self-administration technique before dispensing.',
    tags: ['Frequently Used', 'Cold Chain'],
    medicines: [
      { brandName: 'Lantus', generic: 'Insulin Glargine', strength: '100 IU/mL', dosageForm: 'Injection' },
      { brandName: 'Humalog', generic: 'Insulin Lispro', strength: '100 IU/mL', dosageForm: 'Injection' },
      { brandName: 'Novorapid', generic: 'Insulin Aspart', strength: '100 IU/mL', dosageForm: 'Injection' }
    ]
  },
  {
    familyCode: 'A',
    family: 'Alimentary Tract and Metabolism',
    groupCode: 'A02',
    group: 'Drugs for Acid Related Disorders',
    code: 'A02B',
    title: 'Drugs for Peptic Ulcer and GORD',
    description: 'Agents used for reflux and gastric acid suppression.',
    products: 16,
    tier: 'Open',
    controlledSubstance: 'No',
    note: 'Review long-term use and assess need for ongoing therapy every 8 weeks.',
    tags: ['Gastro', 'Common'],
    medicines: [
      { brandName: 'Nexium', generic: 'Esomeprazole', strength: '40mg', dosageForm: 'Capsule' },
      { brandName: 'Pantoloc', generic: 'Pantoprazole', strength: '40mg', dosageForm: 'Tablet' }
    ]
  },
  {
    familyCode: 'B',
    family: 'Blood and Blood Forming Organs',
    groupCode: 'B01',
    group: 'Antithrombotic Agents',
    code: 'B01A',
    title: 'Antithrombotic Agents',
    description: 'Medicines affecting coagulation, clot formation, or platelet aggregation.',
    products: 19,
    tier: 'Restricted',
    controlledSubstance: 'No',
    note: 'Double-check renal dosing and interaction risk when combined with antibiotics.',
    tags: ['High Risk', 'Frequently Used'],
    medicines: [
      { brandName: 'Eliquis', generic: 'Apixaban', strength: '5mg', dosageForm: 'Tablet' },
      { brandName: 'Xarelto', generic: 'Rivaroxaban', strength: '20mg', dosageForm: 'Tablet' }
    ]
  },
  {
    familyCode: 'N',
    family: 'Nervous System',
    groupCode: 'N02',
    group: 'Analgesics',
    code: 'N02B',
    title: 'Other Analgesics and Antipyretics',
    description: 'Non-opioid analgesics and fever-reducing medications.',
    products: 12,
    tier: 'Open',
    controlledSubstance: 'No',
    note: 'Assess allergy history before prescribing combination analgesics.',
    tags: ['Emergency', 'Pain'],
    medicines: [
      { brandName: 'Tylenol', generic: 'Paracetamol', strength: '500mg', dosageForm: 'Tablet' },
      { brandName: 'Panadol', generic: 'Paracetamol', strength: '120mg/5mL', dosageForm: 'Syrup' }
    ]
  }
];

export const quickSearchTags = ['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'C09AA01'];

export const medicineSearchResults = [
  {
    name: 'Amoxicillin',
    atcCode: 'J01CA04',
    allergyRisk: true,
    defaultDose: '500mg',
    route: 'Oral',
    durationDays: 7
  },
  {
    name: 'Lisinopril',
    atcCode: 'C09AA03',
    allergyRisk: false,
    defaultDose: '10mg',
    route: 'Oral',
    durationDays: 30
  },
  {
    name: 'Metformin',
    atcCode: 'A10BA02',
    allergyRisk: false,
    defaultDose: '850mg',
    route: 'Oral',
    durationDays: 30
  },
  {
    name: 'Atorvastatin',
    atcCode: 'C10AA05',
    allergyRisk: false,
    defaultDose: '20mg',
    route: 'Oral',
    durationDays: 30
  }
];

export const pharmacistPerformance = [
  { id: 'RPT-101', pharmacist: 'Sarah Jenkins', speed: '8.4 min', accuracy: '99.8%', status: 'Optimal' },
  { id: 'RPT-102', pharmacist: 'Michael Chen', speed: '12.1 min', accuracy: '98.5%', status: 'Normal' },
  { id: 'RPT-103', pharmacist: 'Robert Wilson', speed: '9.2 min', accuracy: '99.2%', status: 'Optimal' },
  { id: 'RPT-104', pharmacist: 'Emily Davis', speed: '15.5 min', accuracy: '97.2%', status: 'Review' },
  { id: 'RPT-105', pharmacist: 'David Miller', speed: '10.8 min', accuracy: '98.9%', status: 'Normal' }
];

export const topAtcUsage = [
  { code: 'A10', label: 'Drugs for Diabetes', prescriptions: 1240, delta: '+12%' },
  { code: 'C09', label: 'Agents Acting on Renin-Angiotensin', prescriptions: 980, delta: '+5%' },
  { code: 'N02', label: 'Analgesics', prescriptions: 850, delta: '-2%' },
  { code: 'J01', label: 'Antibacterials for Systemic Use', prescriptions: 720, delta: '+18%' },
  { code: 'R03', label: 'Drugs for Obstructive Airway Diseases', prescriptions: 640, delta: '+1%' }
];

export const reportLineSeries = [
  { label: 'Mon', prescriptions: 4100, revenue: 220 },
  { label: 'Tue', prescriptions: 4700, revenue: 235 },
  { label: 'Wed', prescriptions: 3900, revenue: 210 },
  { label: 'Thu', prescriptions: 5200, revenue: 240 },
  { label: 'Fri', prescriptions: 6100, revenue: 248 },
  { label: 'Sat', prescriptions: 3050, revenue: 195 },
  { label: 'Sun', prescriptions: 2450, revenue: 182 }
];

export const reportBarSeries = [
  { label: 'Jan', inflow: 400, outflow: 380 },
  { label: 'Feb', inflow: 300, outflow: 420 },
  { label: 'Mar', inflow: 550, outflow: 480 },
  { label: 'Apr', inflow: 450, outflow: 460 },
  { label: 'May', inflow: 600, outflow: 520 },
  { label: 'Jun', inflow: 500, outflow: 490 }
];
