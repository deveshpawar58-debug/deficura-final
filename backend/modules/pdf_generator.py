import io
import datetime
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_pdf_report(assessment_data: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#64748B'),
        fontName='Helvetica'
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#1E293B'),
        fontName='Helvetica-Bold',
        spaceBefore=10,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155'),
        fontName='Helvetica'
    )
    
    bold_body = ParagraphStyle(
        'BoldBody',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold'
    )
    
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#64748B'),
        fontName='Helvetica-Oblique'
    )
    
    story = []
    
    # Header Banner
    story.append(Paragraph("DefiCura Micronutrient Risk & Clinical Diet Report", title_style))
    story.append(Paragraph("Evidence-Based, Deterministic Nutritional Deficiency Assessment for Indian Dietary Profiles", subtitle_style))
    
    now_str = datetime.datetime.now().strftime('%B %d, %Y at %I:%M %p')
    meta_text = f"<b>Assessment Date:</b> {now_str} | <b>Engine:</b> Rule-Based Scoring | <b>Target Population:</b> India"
    story.append(Spacer(1, 4))
    story.append(Paragraph(meta_text, body_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#3B82F6'), spaceBefore=2, spaceAfter=8))
    
    scoring = assessment_data.get('scoring', {})
    summary = scoring.get('summary', {})
    nutrients = scoring.get('nutrients', [])
    
    status_text = summary.get('overall_status', 'Assessment Completed.')
    story.append(Paragraph(f"<b>Clinical Summary:</b> {status_text}", bold_body))
    story.append(Spacer(1, 6))
    
    # Section 1: Risk Matrix Table
    story.append(Paragraph("1. Micronutrient Risk Assessment Matrix (7 Indian Priority Nutrients)", section_heading))
    
    table_data = [
        [
            Paragraph("<b>Micronutrient</b>", bold_body),
            Paragraph("<b>Score (Raw / Max)</b>", bold_body),
            Paragraph("<b>Normalized S(N)</b>", bold_body),
            Paragraph("<b>Risk Tier</b>", bold_body),
            Paragraph("<b>Clinical Guidance</b>", bold_body)
        ]
    ]
    
    for n in nutrients:
        tier = n.get('risk_tier', 'Healthy')
        badge_p = Paragraph(f"<font color='{n.get('hex_color', '#333')}'><b>{tier}</b></font>", bold_body)
        table_data.append([
            Paragraph(f"<b>{n['name']}</b><br/><font size=7 color='#64748B'>{n.get('subtitle', '')}</font>", body_style),
            Paragraph(f"{n['raw_score']} / {n['max_score']}", body_style),
            Paragraph(f"{n['score_pct']}%", bold_body),
            badge_p,
            Paragraph(n.get('action_summary', ''), body_style)
        ])
        
    matrix_table = Table(table_data, colWidths=[1.5*inch, 1.1*inch, 1.0*inch, 1.0*inch, 2.6*inch])
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(matrix_table)
    story.append(Spacer(1, 10))
    
    # Section 2: Mathematical Explainability Breakdown
    story.append(Paragraph("2. Deterministic Symptom Explainability Breakdown", section_heading))
    
    exp_table_data = [
        [
            Paragraph("<b>Nutrient</b>", bold_body),
            Paragraph("<b>Reported Symptoms & Weight Contribution</b>", bold_body),
            Paragraph("<b>Mathematical Calculation S(N)</b>", bold_body)
        ]
    ]
    
    for n in nutrients:
        contrib = n.get('contributing_symptoms', [])
        if contrib:
            sym_lines = "<br/>".join([f"• <b>{c['name']}</b> [weight={c['weight']}] (+{c['contribution_pct']}% of max)" for c in contrib])
        else:
            sym_lines = "<font color='#10B981'>No symptoms reported (0% score)</font>"
            
        exp_table_data.append([
            Paragraph(f"<b>{n['name']}</b>", bold_body),
            Paragraph(sym_lines, body_style),
            Paragraph(f"<font size=7.5>{n['math_formula']}</font>", body_style)
        ])
        
    exp_table = Table(exp_table_data, colWidths=[1.3*inch, 3.4*inch, 2.5*inch])
    exp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F8FAFC')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(exp_table)
    story.append(Spacer(1, 10))
    
    # Page Break for Meal Plan and Food Recommendations
    story.append(PageBreak())
    
    # Section 3: Targeted Indian Food Recommendations
    story.append(Paragraph("3. Targeted Indian Dietary Recommendations", section_heading))
    
    meal_plan = assessment_data.get('meal_plan', {})
    rules = meal_plan.get('bioavailability_rules', [])
    if rules:
        story.append(Paragraph("<b>Key Bioavailability Guidelines:</b>", bold_body))
        for r in rules[:4]:
            story.append(Paragraph(f"• {r}", body_style))
        story.append(Spacer(1, 6))
        
    foods_by_nutrient = assessment_data.get('food_recommendations', {})
    if foods_by_nutrient:
        food_table_data = [
            [Paragraph("<b>Nutrient</b>", bold_body), Paragraph("<b>High-Density Indian Foods</b>", bold_body)]
        ]
        for n_id, f_info in foods_by_nutrient.items():
            food_list = f_info.get('key_foods', [])
            food_str = ", ".join([f"{f['name']} ({f.get('highlight', '')})" for f in food_list[:3]])
            food_table_data.append([
                Paragraph(f"<b>{f_info.get('nutrient_name', n_id.title())}</b>", bold_body),
                Paragraph(food_str, body_style)
            ])
        food_table = Table(food_table_data, colWidths=[1.5*inch, 5.7*inch])
        food_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(food_table)
        story.append(Spacer(1, 10))
        
    # Section 4: 7-Day Indian Meal Plan
    story.append(Paragraph("4. Personalized 7-Day Indian Meal Plan", section_heading))
    
    schedule = meal_plan.get('weekly_schedule', [])
    meal_table_data = [
        [
            Paragraph("<b>Day / Theme</b>", bold_body),
            Paragraph("<b>Breakfast</b>", bold_body),
            Paragraph("<b>Lunch</b>", bold_body),
            Paragraph("<b>Snack & Dinner</b>", bold_body)
        ]
    ]
    
    for day in schedule:
        b_text = f"<b>{day['breakfast']['title']}</b><br/><font size=7 color='#475569'>{day['breakfast']['description']}</font>"
        l_text = f"<b>{day['lunch']['title']}</b><br/><font size=7 color='#475569'>{day['lunch']['description']}</font>"
        sd_text = f"<b>Snack:</b> {day['evening_snack']['title']}<br/><b>Dinner:</b> {day['dinner']['title']}"
        
        custom_swaps = day.get('customized_additions', [])
        if custom_swaps:
            swap_notes = "<br/><font color='#D97706'><b>Swap:</b> " + "; ".join([s['recommendation'] for s in custom_swaps[:1]]) + "</font>"
            l_text += swap_notes
            
        meal_table_data.append([
            Paragraph(f"<b>{day['day']}</b><br/><font size=7 color='#2563EB'>{day.get('theme', '')}</font>", body_style),
            Paragraph(b_text, body_style),
            Paragraph(l_text, body_style),
            Paragraph(sd_text, body_style)
        ])
        
    meal_table = Table(meal_table_data, colWidths=[1.3*inch, 2.0*inch, 2.1*inch, 1.8*inch])
    meal_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F8FAFC')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(meal_table)
    story.append(Spacer(1, 10))
    
    # Disclaimer
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#94A3B8'), spaceBefore=6, spaceAfter=6))
    disclaimer_text = (
        "<b>Clinical & Legal Disclaimer:</b> DefiCura is an educational, deterministic risk-stratification system "
        "designed to identify potential micronutrient vulnerabilities based on validated symptom correlations in the Indian population. "
        "This report does NOT constitute a definitive medical diagnosis. Users with moderate to high risk scores are strongly advised to "
        "consult a qualified physician or clinical dietitian for diagnostic serum blood assays (e.g., Serum Ferritin, Total 25-OH Vitamin D, Serum B12, Serum Zinc)."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
