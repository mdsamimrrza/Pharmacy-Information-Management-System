const medicineSeedDocs = [
  // ── A02B – Drugs for Peptic Ulcer and GORD (Proton Pump Inhibitors) ──
  { name: 'Pantoprazole 40', genericName: 'Pantoprazole', brand: 'Pantocid', atcCode: 'A02BC02', strength: '40mg', dosageForm: 'Tablet', manufacturer: 'Sun Pharma', mrp: 12 },
  { name: 'Omeprazole 20', genericName: 'Omeprazole', brand: 'Omez', atcCode: 'A02BC01', strength: '20mg', dosageForm: 'Capsule', manufacturer: 'Dr Reddys', mrp: 8 },
  { name: 'Esomeprazole 40', genericName: 'Esomeprazole', brand: 'Nexium', atcCode: 'A02BC05', strength: '40mg', dosageForm: 'Capsule', manufacturer: 'AstraZeneca', mrp: 98 },
  { name: 'Rabeprazole 20', genericName: 'Rabeprazole', brand: 'Rablet', atcCode: 'A02BC04', strength: '20mg', dosageForm: 'Tablet', manufacturer: 'Lupin', mrp: 22 },
  { name: 'Lansoprazole 30', genericName: 'Lansoprazole', brand: 'Lanzol', atcCode: 'A02BC03', strength: '30mg', dosageForm: 'Capsule', manufacturer: 'Cipla', mrp: 35 },

  // ── A10 – Drugs Used in Diabetes ──
  { name: 'Metformin 500', genericName: 'Metformin', brand: 'Glucophage', atcCode: 'A10BA02', strength: '500mg', dosageForm: 'Tablet', manufacturer: 'Merck', mrp: 42 },
  { name: 'Metformin 1000', genericName: 'Metformin', brand: 'Glycomet', atcCode: 'A10BA02', strength: '1000mg', dosageForm: 'Tablet', manufacturer: 'USV', mrp: 56 },
  { name: 'Glibenclamide 5', genericName: 'Glibenclamide', brand: 'Daonil', atcCode: 'A10BB01', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Sanofi', mrp: 18 },
  { name: 'Glipizide 5', genericName: 'Glipizide', brand: 'Glynase', atcCode: 'A10BB07', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Pfizer', mrp: 24 },
  { name: 'Sitagliptin 100', genericName: 'Sitagliptin', brand: 'Januvia', atcCode: 'A10BH01', strength: '100mg', dosageForm: 'Tablet', manufacturer: 'MSD', mrp: 220 },
  { name: 'Empagliflozin 10', genericName: 'Empagliflozin', brand: 'Jardiance', atcCode: 'A10BK03', strength: '10mg', dosageForm: 'Tablet', manufacturer: 'Boehringer', mrp: 310 },
  { name: 'Dapagliflozin 10', genericName: 'Dapagliflozin', brand: 'Farxiga', atcCode: 'A10BK01', strength: '10mg', dosageForm: 'Tablet', manufacturer: 'AstraZeneca', mrp: 295 },
  { name: 'Insulin Glargine 100IU', genericName: 'Insulin Glargine', brand: 'Lantus', atcCode: 'A10AE04', strength: '100 IU/mL', dosageForm: 'Injection', manufacturer: 'Sanofi', mrp: 820 },
  { name: 'Insulin Regular', genericName: 'Insulin Human', brand: 'Actrapid', atcCode: 'A10AB01', strength: '100 IU/mL', dosageForm: 'Injection', manufacturer: 'Novo Nordisk', mrp: 280 },
  { name: 'Pioglitazone 15', genericName: 'Pioglitazone', brand: 'Actos', atcCode: 'A10BG03', strength: '15mg', dosageForm: 'Tablet', manufacturer: 'Takeda', mrp: 88 },

  // ── B01 – Antithrombotic Agents ──
  { name: 'Apixaban 5', genericName: 'Apixaban', brand: 'Eliquis', atcCode: 'B01AF02', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Bristol-Myers Squibb', mrp: 315 },
  { name: 'Rivaroxaban 20', genericName: 'Rivaroxaban', brand: 'Xarelto', atcCode: 'B01AF01', strength: '20mg', dosageForm: 'Tablet', manufacturer: 'Bayer', mrp: 290 },
  { name: 'Aspirin 75', genericName: 'Acetylsalicylic Acid', brand: 'Ecosprin', atcCode: 'B01AC06', strength: '75mg', dosageForm: 'Tablet', manufacturer: 'USV', mrp: 12 },
  { name: 'Clopidogrel 75', genericName: 'Clopidogrel', brand: 'Plavix', atcCode: 'B01AC04', strength: '75mg', dosageForm: 'Tablet', manufacturer: 'Sanofi', mrp: 68 },
  { name: 'Warfarin 5', genericName: 'Warfarin', brand: 'Coumadin', atcCode: 'B01AA03', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Bristol-Myers Squibb', mrp: 45 },
  { name: 'Heparin Sodium 25000', genericName: 'Heparin', brand: 'Heparin Sodium', atcCode: 'B01AB01', strength: '25000 IU/5mL', dosageForm: 'Injection', manufacturer: 'Pfizer', mrp: 120 },

  // ── C01 – Cardiac Therapy ──
  { name: 'Digoxin 0.25', genericName: 'Digoxin', brand: 'Lanoxin', atcCode: 'C01AA05', strength: '0.25mg', dosageForm: 'Tablet', manufacturer: 'GSK', mrp: 24 },
  { name: 'Amiodarone 200', genericName: 'Amiodarone', brand: 'Cordarone', atcCode: 'C01BD01', strength: '200mg', dosageForm: 'Tablet', manufacturer: 'Sanofi', mrp: 68 },

  // ── C07 – Beta Blockers ──
  { name: 'Atenolol 50', genericName: 'Atenolol', brand: 'Tenormin', atcCode: 'C07AB03', strength: '50mg', dosageForm: 'Tablet', manufacturer: 'AstraZeneca', mrp: 22 },
  { name: 'Metoprolol 25', genericName: 'Metoprolol', brand: 'Betaloc', atcCode: 'C07AB02', strength: '25mg', dosageForm: 'Tablet', manufacturer: 'AstraZeneca', mrp: 38 },
  { name: 'Carvedilol 6.25', genericName: 'Carvedilol', brand: 'Coreg', atcCode: 'C07AG02', strength: '6.25mg', dosageForm: 'Tablet', manufacturer: 'GSK', mrp: 52 },
  { name: 'Bisoprolol 5', genericName: 'Bisoprolol', brand: 'Concor', atcCode: 'C07AB07', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Merck', mrp: 44 },

  // ── C08 – Calcium Channel Blockers ──
  { name: 'Amlodipine 5', genericName: 'Amlodipine', brand: 'Norvasc', atcCode: 'C08CA01', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Pfizer', mrp: 18 },
  { name: 'Amlodipine 10', genericName: 'Amlodipine', brand: 'Stamlo', atcCode: 'C08CA01', strength: '10mg', dosageForm: 'Tablet', manufacturer: 'Dr Reddys', mrp: 28 },
  { name: 'Nifedipine 10', genericName: 'Nifedipine', brand: 'Adalat', atcCode: 'C08CA05', strength: '10mg', dosageForm: 'Capsule', manufacturer: 'Bayer', mrp: 14 },
  { name: 'Diltiazem 60', genericName: 'Diltiazem', brand: 'Dilzem', atcCode: 'C08DB01', strength: '60mg', dosageForm: 'Tablet', manufacturer: 'Torrent', mrp: 32 },

  // ── C09 – ACE Inhibitors / ARBs ──
  { name: 'Lisinopril 10', genericName: 'Lisinopril', brand: 'Zestril', atcCode: 'C09AA03', strength: '10mg', dosageForm: 'Tablet', manufacturer: 'AstraZeneca', mrp: 64 },
  { name: 'Captopril 25', genericName: 'Captopril', brand: 'Capoten', atcCode: 'C09AA01', strength: '25mg', dosageForm: 'Tablet', manufacturer: 'Bristol-Myers Squibb', mrp: 58 },
  { name: 'Enalapril 5', genericName: 'Enalapril', brand: 'Vasotec', atcCode: 'C09AA02', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Merck', mrp: 36 },
  { name: 'Ramipril 5', genericName: 'Ramipril', brand: 'Altace', atcCode: 'C09AA05', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Sanofi', mrp: 48 },
  { name: 'Losartan 50', genericName: 'Losartan', brand: 'Cozaar', atcCode: 'C09CA01', strength: '50mg', dosageForm: 'Tablet', manufacturer: 'MSD', mrp: 82 },
  { name: 'Valsartan 80', genericName: 'Valsartan', brand: 'Diovan', atcCode: 'C09CA03', strength: '80mg', dosageForm: 'Tablet', manufacturer: 'Novartis', mrp: 94 },
  { name: 'Telmisartan 40', genericName: 'Telmisartan', brand: 'Micardis', atcCode: 'C09CA07', strength: '40mg', dosageForm: 'Tablet', manufacturer: 'Boehringer', mrp: 76 },

  // ── C10 – Lipid Modifying Agents / Statins ──
  { name: 'Atorvastatin 10', genericName: 'Atorvastatin', brand: 'Lipitor', atcCode: 'C10AA05', strength: '10mg', dosageForm: 'Tablet', manufacturer: 'Pfizer', mrp: 45 },
  { name: 'Atorvastatin 20', genericName: 'Atorvastatin', brand: 'Storvas', atcCode: 'C10AA05', strength: '20mg', dosageForm: 'Tablet', manufacturer: 'Sun Pharma', mrp: 68 },
  { name: 'Rosuvastatin 10', genericName: 'Rosuvastatin', brand: 'Crestor', atcCode: 'C10AA07', strength: '10mg', dosageForm: 'Tablet', manufacturer: 'AstraZeneca', mrp: 88 },
  { name: 'Simvastatin 20', genericName: 'Simvastatin', brand: 'Zocor', atcCode: 'C10AA01', strength: '20mg', dosageForm: 'Tablet', manufacturer: 'MSD', mrp: 52 },

  // ── J01 – Antibacterials ──
  { name: 'Amoxicillin 500', genericName: 'Amoxicillin', brand: 'Amoxil', atcCode: 'J01CA04', strength: '500mg', dosageForm: 'Capsule', manufacturer: 'GSK', mrp: 55 },
  { name: 'Amoxicillin 250 Syrup', genericName: 'Amoxicillin', brand: 'Wymox', atcCode: 'J01CA04', strength: '250mg/5mL', dosageForm: 'Syrup', manufacturer: 'Pfizer', mrp: 48 },
  { name: 'Azithromycin 500', genericName: 'Azithromycin', brand: 'Zithromax', atcCode: 'J01FA10', strength: '500mg', dosageForm: 'Tablet', manufacturer: 'Pfizer', mrp: 95 },
  { name: 'Clarithromycin 500', genericName: 'Clarithromycin', brand: 'Klaricid', atcCode: 'J01FA09', strength: '500mg', dosageForm: 'Tablet', manufacturer: 'Abbott', mrp: 145 },
  { name: 'Ciprofloxacin 500', genericName: 'Ciprofloxacin', brand: 'Cipro', atcCode: 'J01MA02', strength: '500mg', dosageForm: 'Tablet', manufacturer: 'Bayer', mrp: 72 },
  { name: 'Doxycycline 100', genericName: 'Doxycycline', brand: 'Vibramycin', atcCode: 'J01AA02', strength: '100mg', dosageForm: 'Capsule', manufacturer: 'Pfizer', mrp: 38 },
  { name: 'Metronidazole 400', genericName: 'Metronidazole', brand: 'Flagyl', atcCode: 'J01XD01', strength: '400mg', dosageForm: 'Tablet', manufacturer: 'Sanofi', mrp: 22 },
  { name: 'Ceftriaxone 1g', genericName: 'Ceftriaxone', brand: 'Rocephin', atcCode: 'J01DD04', strength: '1g', dosageForm: 'Injection', manufacturer: 'Roche', mrp: 185 },

  // ── M01 – Anti-inflammatory ──
  { name: 'Ibuprofen 400', genericName: 'Ibuprofen', brand: 'Brufen', atcCode: 'M01AE01', strength: '400mg', dosageForm: 'Tablet', manufacturer: 'Abbott', mrp: 36 },
  { name: 'Diclofenac 50', genericName: 'Diclofenac', brand: 'Voltaren', atcCode: 'M01AB05', strength: '50mg', dosageForm: 'Tablet', manufacturer: 'Novartis', mrp: 28 },
  { name: 'Naproxen 250', genericName: 'Naproxen', brand: 'Naprosyn', atcCode: 'M01AE02', strength: '250mg', dosageForm: 'Tablet', manufacturer: 'Roche', mrp: 42 },
  { name: 'Celecoxib 200', genericName: 'Celecoxib', brand: 'Celebrex', atcCode: 'M01AH01', strength: '200mg', dosageForm: 'Capsule', manufacturer: 'Pfizer', mrp: 115 },
  { name: 'Etoricoxib 90', genericName: 'Etoricoxib', brand: 'Arcoxia', atcCode: 'M01AH05', strength: '90mg', dosageForm: 'Tablet', manufacturer: 'MSD', mrp: 148 },

  // ── N02 – Analgesics ──
  { name: 'Paracetamol 500', genericName: 'Paracetamol', brand: 'Panadol', atcCode: 'N02BE01', strength: '500mg', dosageForm: 'Tablet', manufacturer: 'GSK', mrp: 22 },
  { name: 'Paracetamol 650', genericName: 'Paracetamol', brand: 'Crocin', atcCode: 'N02BE01', strength: '650mg', dosageForm: 'Tablet', manufacturer: 'GSK', mrp: 28 },
  { name: 'Tramadol 50', genericName: 'Tramadol', brand: 'Ultram', atcCode: 'N02AX02', strength: '50mg', dosageForm: 'Capsule', manufacturer: 'Janssen', mrp: 68 },

  // ── N05 – Psycholeptics ──
  { name: 'Alprazolam 0.25', genericName: 'Alprazolam', brand: 'Xanax', atcCode: 'N05BA12', strength: '0.25mg', dosageForm: 'Tablet', manufacturer: 'Pfizer', mrp: 35 },
  { name: 'Diazepam 5', genericName: 'Diazepam', brand: 'Valium', atcCode: 'N05BA01', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Roche', mrp: 18 },
  { name: 'Olanzapine 5', genericName: 'Olanzapine', brand: 'Zyprexa', atcCode: 'N05AH03', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Eli Lilly', mrp: 125 },

  // ── N06 – Psychoanaleptics / Antidepressants ──
  { name: 'Sertraline 50', genericName: 'Sertraline', brand: 'Zoloft', atcCode: 'N06AB06', strength: '50mg', dosageForm: 'Tablet', manufacturer: 'Pfizer', mrp: 88 },
  { name: 'Fluoxetine 20', genericName: 'Fluoxetine', brand: 'Prozac', atcCode: 'N06AB03', strength: '20mg', dosageForm: 'Capsule', manufacturer: 'Eli Lilly', mrp: 72 },
  { name: 'Escitalopram 10', genericName: 'Escitalopram', brand: 'Lexapro', atcCode: 'N06AB10', strength: '10mg', dosageForm: 'Tablet', manufacturer: 'Lundbeck', mrp: 95 },

  // ── R03 – Antiasthmatics ──
  { name: 'Salbutamol 100mcg', genericName: 'Salbutamol', brand: 'Ventolin', atcCode: 'R03AC02', strength: '100mcg/dose', dosageForm: 'Inhaler', manufacturer: 'GSK', mrp: 185 },
  { name: 'Budesonide 200mcg', genericName: 'Budesonide', brand: 'Pulmicort', atcCode: 'R03BA02', strength: '200mcg/dose', dosageForm: 'Inhaler', manufacturer: 'AstraZeneca', mrp: 320 },
  { name: 'Montelukast 10', genericName: 'Montelukast', brand: 'Singulair', atcCode: 'R03DC03', strength: '10mg', dosageForm: 'Tablet', manufacturer: 'MSD', mrp: 145 },
  { name: 'Formoterol 12mcg', genericName: 'Formoterol', brand: 'Foradil', atcCode: 'R03AC13', strength: '12mcg/dose', dosageForm: 'Inhaler', manufacturer: 'Novartis', mrp: 280 },

  // ── H02 – Corticosteroids ──
  { name: 'Prednisolone 5', genericName: 'Prednisolone', brand: 'Wysolone', atcCode: 'H02AB06', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Pfizer', mrp: 18 },
  { name: 'Dexamethasone 4', genericName: 'Dexamethasone', brand: 'Decadron', atcCode: 'H02AB02', strength: '4mg', dosageForm: 'Tablet', manufacturer: 'MSD', mrp: 24 },
  { name: 'Methylprednisolone 16', genericName: 'Methylprednisolone', brand: 'Medrol', atcCode: 'H02AB04', strength: '16mg', dosageForm: 'Tablet', manufacturer: 'Pfizer', mrp: 65 },

  // ── L01 – Antineoplastic Agents ──
  { name: 'Tamoxifen 20', genericName: 'Tamoxifen', brand: 'Nolvadex', atcCode: 'L02BA01', strength: '20mg', dosageForm: 'Tablet', manufacturer: 'AstraZeneca', mrp: 280 },
  { name: 'Imatinib 400', genericName: 'Imatinib', brand: 'Gleevec', atcCode: 'L01XE01', strength: '400mg', dosageForm: 'Tablet', manufacturer: 'Novartis', mrp: 4200 },

  // ── Vitamins & Supplements ──
  { name: 'Folic Acid 5', genericName: 'Folic Acid', brand: 'Folvite', atcCode: 'B03BB01', strength: '5mg', dosageForm: 'Tablet', manufacturer: 'Pfizer', mrp: 12 },
  { name: 'Ferrous Sulfate 200', genericName: 'Ferrous Sulfate', brand: 'Fefol', atcCode: 'B03AA07', strength: '200mg', dosageForm: 'Tablet', manufacturer: 'USV', mrp: 18 },
  { name: 'Calcium Carbonate 500', genericName: 'Calcium Carbonate', brand: 'Shelcal', atcCode: 'A12AA04', strength: '500mg', dosageForm: 'Tablet', manufacturer: 'Elder', mrp: 32 },
]

export default medicineSeedDocs
