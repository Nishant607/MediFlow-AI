import os

def create_styled_pdf(filename, title, clinic_name, patient_info, doctor_info, test_sections, summary_notes, signatory):
    """
    Creates a clean, realistic, professional PDF lab report with headers,
    tables, borders, and structured text.
    """
    commands = []
    
    # Helper to add lines and text
    # Page size: 595 x 842 (A4)
    # Header banner
    commands.append("0.05 0.35 0.55 rg") # Primary blue color
    commands.append("40 760 515 45 re f") # Header bar
    
    # Header text in white
    commands.append("1 1 1 rg") # White
    commands.append("BT /F2 16 Tf 55 785 Td (MEDIFLOW HEALTHCARE SYSTEM) Tj ET")
    commands.append("BT /F1 9 Tf 55 770 Td (24/7 Clinical Excellence & Diagnostic Pathology Laboratories | NABH Accredited) Tj ET")
    
    # Reset text color to dark slate
    commands.append("0.1 0.15 0.2 rg")
    
    # Report Title
    commands.append(f"BT /F2 13 Tf 40 735 Td ({title}) Tj ET")
    
    # Top divider
    commands.append("0.8 0.85 0.9 RG 1 w")
    commands.append("40 725 m 555 725 l S")
    
    # Patient & Doctor Info Box
    commands.append("0.96 0.97 0.99 rg 40 660 515 58 re f")
    commands.append("0.85 0.88 0.92 RG 1 w 40 660 515 58 re S")
    
    # Patient Info text
    y = 702
    commands.append("0.1 0.15 0.2 rg")
    for key, val in patient_info.items():
        commands.append(f"BT /F2 8 Tf 50 {y} Td ({key}:) Tj /F1 8 Tf 100 {y} Td ({val}) Tj ET")
        y -= 13
        
    # Doctor Info text (column 2)
    y = 702
    for key, val in doctor_info.items():
        commands.append(f"BT /F2 8 Tf 310 {y} Td ({key}:) Tj /F1 8 Tf 380 {y} Td ({val}) Tj ET")
        y -= 13
        
    curr_y = 640
    
    # Sections (Tables)
    for sec_title, rows in test_sections:
        if curr_y < 180:
            break
            
        # Section Header
        commands.append("0.05 0.35 0.55 rg")
        commands.append(f"BT /F2 10 Tf 40 {curr_y} Td ({sec_title}) Tj ET")
        curr_y -= 8
        commands.append("0.05 0.35 0.55 RG 1.5 w")
        commands.append(f"40 {curr_y} m 555 {curr_y} l S")
        curr_y -= 14
        
        # Table Header
        commands.append("0.92 0.94 0.97 rg 40 {0} 515 16 re f".format(curr_y - 3))
        commands.append("0.2 0.25 0.3 rg")
        commands.append(f"BT /F2 8 Tf 45 {curr_y} Td (TEST PARAMETER) Tj 240 {curr_y} Td (OBSERVED VALUE) Tj 350 {curr_y} Td (REFERENCE RANGE) Tj 470 {curr_y} Td (STATUS) Tj ET")
        curr_y -= 16
        
        # Table Rows
        for row in rows:
            param, val, ref, status = row
            # Row line
            commands.append("0.93 0.94 0.96 RG 0.5 w")
            commands.append(f"40 {curr_y - 2} m 555 {curr_y - 2} l S")
            
            # Text
            commands.append("0.15 0.2 0.25 rg")
            commands.append(f"BT /F1 8 Tf 45 {curr_y} Td ({param}) Tj ET")
            
            # Value bold
            commands.append(f"BT /F2 8 Tf 240 {curr_y} Td ({val}) Tj ET")
            commands.append(f"BT /F1 8 Tf 350 {curr_y} Td ({ref}) Tj ET")
            
            # Status badge
            if "HIGH" in status or "ELEVATED" in status or "ALERT" in status:
                commands.append("0.8 0.1 0.1 rg")
                commands.append(f"BT /F2 8 Tf 470 {curr_y} Td ({status}) Tj ET")
            else:
                commands.append("0.05 0.55 0.2 rg")
                commands.append(f"BT /F1 8 Tf 470 {curr_y} Td ({status}) Tj ET")
                
            commands.append("0.1 0.15 0.2 rg")
            curr_y -= 15
            
        curr_y -= 10
        
    # Clinical Impressions / Summary Box
    if curr_y > 100:
        commands.append("0.97 0.98 0.99 rg 40 {0} 515 45 re f".format(curr_y - 40))
        commands.append("0.8 0.85 0.9 RG 1 w 40 {0} 515 45 re S".format(curr_y - 40))
        commands.append("0.05 0.35 0.55 rg")
        commands.append(f"BT /F2 9 Tf 50 {curr_y - 6} Td (CLINICAL INTERPRETATION & ADVISORY:) Tj ET")
        commands.append("0.25 0.3 0.35 rg")
        y_note = curr_y - 20
        for note in summary_notes:
            commands.append(f"BT /F1 8 Tf 50 {y_note} Td ({note}) Tj ET")
            y_note -= 11
            
    # Signatures & Footer
    commands.append("0.85 0.88 0.92 RG 1 w 40 60 m 555 60 l S")
    commands.append("0.3 0.35 0.4 rg")
    commands.append(f"BT /F2 8 Tf 40 48 Td (Authorized Signatory: {signatory}) Tj ET")
    commands.append("BT /F1 7.5 Tf 40 38 Td (MediFlow Pathology Center, 100 Clinical Way, New Delhi. Ph: +1-123-556-5523) Tj ET")
    commands.append("BT /F2 7.5 Tf 440 38 Td (Electronic Verified Report) Tj ET")
    
    stream_data = "\n".join(commands).encode("latin1")
    
    # PDF structural objects
    objects = []
    # 1: Catalog
    objects.append(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    # 2: Pages
    objects.append(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    # 3: Page (A4 595 x 842)
    objects.append(b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n")
    # 4: Stream Contents
    objects.append(f"4 0 obj\n<< /Length {len(stream_data)} >>\nstream\n".encode("latin1") + stream_data + b"\nendstream\nendobj\n")
    # 5: Regular Helvetica
    objects.append(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
    # 6: Bold Helvetica
    objects.append(b"6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n")
    
    pdf = [b"%PDF-1.4\n"]
    offsets = []
    pos = len(pdf[0])
    for obj in objects:
        offsets.append(pos)
        pdf.append(obj)
        pos += len(obj)
        
    xref_pos = pos
    pdf.append(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode("latin1"))
    for off in offsets:
        pdf.append(f"{off:010d} 00000 n \n".encode("latin1"))
        
    pdf.append(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode("latin1"))
    
    with open(filename, "wb") as f:
        f.write(b"".join(pdf))
    print(f"Created: {filename}")

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "sample_medical_reports")
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. Complete Blood Count & Lipid Profile Report
    p1_info = {
        "Patient Name": "Rahul Verma",
        "Patient ID": "MF-PAT-1082",
        "Age / Gender": "29 Yrs / Male",
        "Contact": "+91 9876543210"
    }
    d1_info = {
        "Referring Doctor": "Dr. Rajesh Sharma",
        "Department": "Clinical Cardiology",
        "Report Date": "26-Nov-2026",
        "Sample Barcode": "BC-88921-HEM"
    }
    cbc_rows = [
        ("Hemoglobin (Hb)", "14.8 g/dL", "13.0 - 17.0 g/dL", "NORMAL"),
        ("Total Leukocyte Count (WBC)", "7,400 /mcL", "4,000 - 11,000 /mcL", "NORMAL"),
        ("RBC Count", "4.95 mil/mcL", "4.5 - 5.5 mil/mcL", "NORMAL"),
        ("Platelet Count", "240,000 /mcL", "150,000 - 450,000 /mcL", "NORMAL"),
        ("Packed Cell Volume (PCV)", "44.2 %", "40.0 - 50.0 %", "NORMAL"),
    ]
    lipid_rows = [
        ("Serum Total Cholesterol", "218 mg/dL", "< 200 mg/dL", "HIGH"),
        ("Triglycerides", "165 mg/dL", "< 150 mg/dL", "BORDERLINE HIGH"),
        ("HDL Cholesterol (Good)", "44 mg/dL", "> 40 mg/dL", "NORMAL"),
        ("LDL Cholesterol (Bad)", "141 mg/dL", "< 100 mg/dL", "ELEVATED"),
        ("VLDL Cholesterol", "33 mg/dL", "< 30 mg/dL", "SLIGHTLY HIGH"),
    ]
    sugar_rows = [
        ("Fasting Blood Sugar (FBS)", "94 mg/dL", "70 - 100 mg/dL", "NORMAL"),
        ("HbA1c (Glycated Hemoglobin)", "5.4 %", "< 5.7 % (Non-Diabetic)", "NORMAL"),
        ("Serum Creatinine", "0.92 mg/dL", "0.70 - 1.20 mg/dL", "NORMAL"),
    ]
    sections1 = [
        ("1. COMPLETE BLOOD COUNT (CBC) - AUTOMATED", cbc_rows),
        ("2. LIPID PROFILE - SERUM", lipid_rows),
        ("3. DIABETIC & METABOLIC BIOCHEMISTRY", sugar_rows),
    ]
    notes1 = [
        "1. Complete hemogram and glycemic indicators reflect normal physiological status.",
        "2. Serum Total Cholesterol and LDL levels appear moderately above the typical reference range.",
        "3. Recommended dietary counseling, regular aerobic exercise, and consultation with treating cardiologist."
    ]
    f1 = os.path.join(out_dir, "Blood_Test_Report_Rahul_Verma.pdf")
    create_styled_pdf(f1, "COMPREHENSIVE PATHOLOGY & METABOLIC REPORT", "MediFlow Diagnostics", p1_info, d1_info, sections1, notes1, "Dr. S. K. Mehta (MD, Pathologist)")
    
    # 2. Cardiac Evaluation Report
    p2_info = {
        "Patient Name": "Rahul Verma",
        "Patient ID": "MF-PAT-1082",
        "Age / Gender": "29 Yrs / Male",
        "Study": "Resting 12-Lead ECG & Echo"
    }
    d2_info = {
        "Consultant": "Dr. Rajesh Sharma",
        "Department": "Cardiology & Heart Care",
        "Date of Exam": "26-Nov-2026",
        "Device": "Philips Pagewriter TC70"
    }
    ecg_rows = [
        ("Heart Rate (Resting)", "72 bpm", "60 - 100 bpm", "NORMAL"),
        ("Cardiac Rhythm", "Sinus Rhythm", "Regular Sinus", "NORMAL"),
        ("PR Interval", "148 ms", "120 - 200 ms", "NORMAL"),
        ("QRS Duration", "88 ms", "< 100 ms", "NORMAL"),
        ("QTc Interval (Bazett)", "412 ms", "< 440 ms (Male)", "NORMAL"),
    ]
    echo_rows = [
        ("Left Ventricular Ejection Fraction (LVEF)", "62 %", "55 - 70 %", "NORMAL"),
        ("Left Ventricular Internal Dimension (LVIDd)", "46 mm", "35 - 56 mm", "NORMAL"),
        ("Interventricular Septum (IVSd)", "9.5 mm", "6.0 - 11.0 mm", "NORMAL"),
        ("Regional Wall Motion", "No Abnormality", "Concentric Normal", "NORMAL"),
        ("Valvular Assessment", "Mild Trivial MR", "No Significant Stenosis", "STABLE"),
    ]
    sections2 = [
        ("1. 12-LEAD RESTING ELECTROCARDIOGRAM (ECG)", ecg_rows),
        ("2. 2D TRANSTHORACIC ECHOCARDIOGRAM (2D ECHO)", echo_rows),
    ]
    notes2 = [
        "1. Normal sinus rhythm with normal axis and healthy intraventricular conduction.",
        "2. Preserved global left ventricular systolic pump performance with LVEF of 62%.",
        "3. No baseline ischemic changes. Correlate clinically with cardiovascular risk profile."
    ]
    f2 = os.path.join(out_dir, "Cardiac_ECG_Echo_Report_Rahul_Verma.pdf")
    create_styled_pdf(f2, "NON-INVASIVE CARDIOLOGY INVESTIGATION REPORT", "MediFlow Heart Institute", p2_info, d2_info, sections2, notes2, "Dr. Rajesh Sharma (MD, Cardiologist)")
    
    # 3. Chest X-Ray Radiology Report (for Patient 2: Sneha Kapoor)
    p3_info = {
        "Patient Name": "Sneha Kapoor",
        "Patient ID": "MF-PAT-2094",
        "Age / Gender": "27 Yrs / Female",
        "Exam Type": "Chest X-Ray PA View"
    }
    d3_info = {
        "Referring Doctor": "Dr. Priya Patel",
        "Department": "General Medicine & Pulmonology",
        "Date of Exam": "27-Nov-2026",
        "Modality": "Carestream DR Digital"
    }
    rad_rows = [
        ("Lung Parenchyma (Bilateral)", "Clear Fields", "No Consolidation/Infiltrate", "NORMAL"),
        ("Bronchovascular Markings", "Normal Distribution", "Prominence Absent", "NORMAL"),
        ("Cardiothoracic Ratio (CTR)", "0.44", "< 0.50 Normal", "NORMAL"),
        ("Costophrenic Angles", "Sharp Bilaterally", "Clear & Sharp", "NORMAL"),
        ("Trachea & Mediastinum", "Central in Position", "Midline Normal", "NORMAL"),
        ("Bony Thorax & Soft Tissue", "Normal Architecture", "No Fracture / Lesion", "NORMAL"),
    ]
    sections3 = [
        ("DIGITAL RADIOGRAPHY (CHEST PA VIEW) EVALUATION", rad_rows),
    ]
    notes3 = [
        "1. Normal digital chest radiograph without evidence of acute cardiopulmonary disease.",
        "2. No pleural effusion, pneumothorax, or active parenchymal lesions detected.",
        "3. Cardiac silhouette size and vascular pedicle are within expected physiological limits."
    ]
    f3 = os.path.join(out_dir, "Chest_XRay_Report_Sneha_Kapoor.pdf")
    create_styled_pdf(f3, "DEPARTMENT OF RADIOLOGY & DIGITAL IMAGING", "MediFlow Imaging Institute", p3_info, d3_info, sections3, notes3, "Dr. N. Sengupta (MD, DMRD Radiologist)")

    # 4. Also a clean text file for quick testing
    txt_path = os.path.join(out_dir, "Blood_Test_Summary_Sample.txt")
    with open(txt_path, "w", encoding="utf-8") as tf:
        tf.write("""MEDIFLOW AI HEALTHCARE - DIAGNOSTIC REPORT
Patient Name: Rahul Verma
Age / Gender: 29 Yrs / Male
Report Date: 26-Nov-2026
Attending Doctor: Dr. Rajesh Sharma (Cardiology)

TEST PARAMETERS & RESULTS:
---------------------------------------------------------------
1. Hemoglobin: 14.8 g/dL (Reference: 13.0 - 17.0 g/dL) [NORMAL]
2. Total White Blood Cell Count: 7,400 /mcL (Reference: 4,000 - 11,000 /mcL) [NORMAL]
3. Platelet Count: 240,000 /mcL (Reference: 150,000 - 450,000 /mcL) [NORMAL]
4. Fasting Blood Glucose: 94 mg/dL (Reference: 70 - 100 mg/dL) [NORMAL]
5. Total Cholesterol: 218 mg/dL (Reference: < 200 mg/dL) [ELEVATED / HIGH]
6. Triglycerides: 165 mg/dL (Reference: < 150 mg/dL) [BORDERLINE HIGH]
7. LDL Cholesterol: 141 mg/dL (Reference: < 100 mg/dL) [ELEVATED]
8. HDL Cholesterol: 44 mg/dL (Reference: > 40 mg/dL) [NORMAL]
9. Serum Creatinine: 0.92 mg/dL (Reference: 0.70 - 1.20 mg/dL) [NORMAL]

CLINICAL IMPRESSION:
- Lipid profile indicates mild to moderate hypercholesterolemia with elevated LDL and total cholesterol.
- Blood counts, renal function, and glycemic markers are completely normal.
- Recommended consultation with Dr. Rajesh Sharma for lipid management and lifestyle adjustments.
""")
    print(f"Created: {txt_path}")
