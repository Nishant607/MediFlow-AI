import os
import zipfile
import re
from xml.sax.saxutils import escape

ROOT_DIR = r"C:\Users\sam\Desktop\MediFlow-AI"
REPORT_MD = os.path.join(ROOT_DIR, "docs", "TECHNICAL_REPORT.md")
OUTPUT_DOCX = os.path.join(ROOT_DIR, "docs", "MediFlow_AI_Technical_Report.docx")
OUTPUT_RTF = os.path.join(ROOT_DIR, "docs", "MediFlow_AI_Technical_Report.rtf")
OUTPUT_DOC = os.path.join(ROOT_DIR, "docs", "MediFlow_AI_Technical_Report.doc")

CONTENT_TYPES_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>"""

RELS_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""

DOC_RELS_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
</Relationships>"""

CORE_PROPS_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" 
    xmlns:dc="http://purl.org/dc/elements/1.1/" 
    xmlns:dcterms="http://purl.org/dc/terms/" 
    xmlns:dcmitype="http://purl.org/dc/dcmitype/" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>MediFlow-AI Technical Report</dc:title>
  <dc:subject>DevOps and Automation Lab Capstone Report</dc:subject>
  <dc:creator>MediFlow-AI Project Team</dc:creator>
  <cp:keywords>DevOps, Kubernetes, CI/CD, Terraform, Prometheus</cp:keywords>
  <dc:description>Academic Capstone Project Technical Report for MediFlow-AI</dc:description>
  <cp:lastModifiedBy>MediFlow-AI Project Team</cp:lastModifiedBy>
  <cp:revision>2</cp:revision>
</cp:coreProperties>"""

APP_PROPS_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" 
    xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Template>Normal.dotm</Template>
  <TotalTime>15</TotalTime>
  <Pages>18</Pages>
  <Words>3600</Words>
  <Characters>23000</Characters>
  <Application>Microsoft Office Word</Application>
  <DocSecurity>0</DocSecurity>
  <Lines>380</Lines>
  <Paragraphs>200</Paragraphs>
  <ScaleCrop>false</ScaleCrop>
  <Company>Academic Engineering Laboratory</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <CharactersWithSpaces>26500</CharactersWithSpaces>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>"""

SETTINGS_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:zoom w:percent="100"/>
  <w:defaultTabStop w:val="720"/>
  <w:characterSpacingControl w:val="doNotCompress"/>
</w:settings>"""

FONT_TABLE_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:font w:name="Calibri"><w:panose1 w:val="020F0502020204030204"/><w:family w:val="swiss"/><w:pitch w:val="variable"/></w:font>
  <w:font w:name="Arial"><w:panose1 w:val="020B0604020202020204"/><w:family w:val="swiss"/><w:pitch w:val="variable"/></w:font>
  <w:font w:name="Consolas"><w:panose1 w:val="02070309020205020404"/><w:family w:val="modern"/><w:pitch w:val="fixed"/></w:font>
</w:fonts>"""

# Strictly formatted styles according to ECMA-376 schema sequence:
# pPr sequence: pStyle, keepNext, spacing, ind, jc
# rPr sequence: rFonts, b, bCs, i, iCs, color, sz, szCs, lang
STYLES_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:color w:val="262626"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>

  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="360" w:after="200"/>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
      <w:b/>
      <w:bCs/>
      <w:color w:val="005A9C"/>
      <w:sz w:val="48"/>
      <w:szCs w:val="48"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="360" w:after="140"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
      <w:b/>
      <w:bCs/>
      <w:color w:val="005A9C"/>
      <w:sz w:val="34"/>
      <w:szCs w:val="34"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="260" w:after="100"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
      <w:b/>
      <w:bCs/>
      <w:color w:val="0EA5C9"/>
      <w:sz w:val="28"/>
      <w:szCs w:val="28"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="200" w:after="80"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
      <w:b/>
      <w:bCs/>
      <w:color w:val="1E293B"/>
      <w:sz w:val="24"/>
      <w:szCs w:val="24"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="ListBullet">
    <w:name w:val="List Bullet"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:spacing w:after="100" w:line="260" w:lineRule="auto"/>
      <w:ind w:left="480" w:hanging="240"/>
    </w:pPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="CodeBlock">
    <w:name w:val="Code Block"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>
      <w:spacing w:before="80" w:after="80" w:line="240" w:lineRule="auto"/>
      <w:ind w:left="360" w:right="360"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
      <w:color w:val="0F172A"/>
      <w:sz w:val="18"/>
      <w:szCs w:val="18"/>
    </w:rPr>
  </w:style>
</w:styles>"""

def parse_runs(text):
    """Clean inline markdown token parser strictly producing valid w:r elements."""
    tokens = re.split(r'(\*\*.*?\*\*|`.*?`|\*.*?\*)', text)
    runs = []
    for token in tokens:
        if not token:
            continue
        if token.startswith('**') and token.endswith('**') and len(token) >= 4:
            clean = escape(token[2:-2])
            runs.append(f'<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">{clean}</w:t></w:r>')
        elif token.startswith('`') and token.endswith('`') and len(token) >= 2:
            clean = escape(token[1:-1])
            runs.append(f'<w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:color w:val="0B7EA0"/></w:rPr><w:t xml:space="preserve">{clean}</w:t></w:r>')
        elif token.startswith('*') and token.endswith('*') and len(token) >= 2:
            clean = escape(token[1:-1])
            runs.append(f'<w:r><w:rPr><w:i/><w:iCs/></w:rPr><w:t xml:space="preserve">{clean}</w:t></w:r>')
        else:
            clean = escape(token)
            runs.append(f'<w:r><w:t xml:space="preserve">{clean}</w:t></w:r>')
    return "".join(runs)

def build_p(text, style="Normal", align=None):
    pPr = [f'<w:pStyle w:val="{style}"/>']
    if align:
        pPr.append(f'<w:jc w:val="{align}"/>')
    pPr_str = f"<w:pPr>{''.join(pPr)}</w:pPr>"
    return f"<w:p>{pPr_str}{parse_runs(text)}</w:p>"

def build_table_xml(table_lines):
    rows_data = []
    for line in table_lines:
        line = line.strip()
        if not line.startswith('|') or not line.endswith('|'):
            continue
        if re.match(r'^\|[\s\-:|]+\|$', line):
            continue
        cells = [c.strip() for c in line[1:-1].split('|')]
        rows_data.append(cells)

    if not rows_data:
        return ""

    num_cols = max(len(r) for r in rows_data)
    total_width = 9360  # total table width in dxa (6.5 inches)
    col_width = total_width // num_cols

    tbl_xml = [
        '<w:tbl>',
        '<w:tblPr>',
        f'  <w:tblW w:w="{total_width}" w:type="dxa"/>',
        '  <w:jc w:val="center"/>',
        '  <w:tblBorders>',
        '    <w:top w:val="single" w:sz="8" w:space="0" w:color="005A9C"/>',
        '    <w:left w:val="none"/>',
        '    <w:bottom w:val="single" w:sz="12" w:space="0" w:color="005A9C"/>',
        '    <w:right w:val="none"/>',
        '    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>',
        '    <w:insideV w:val="none"/>',
        '  </w:tblBorders>',
        '  <w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="160" w:type="dxa"/><w:right w:w="160" w:type="dxa"/></w:tblCellMar>',
        '</w:tblPr>',
        '<w:tblGrid>'
    ]
    for _ in range(num_cols):
        tbl_xml.append(f'  <w:gridCol w:w="{col_width}"/>')
    tbl_xml.append('</w:tblGrid>')

    for row_idx, row in enumerate(rows_data):
        tbl_xml.append('<w:tr>')
        is_header = (row_idx == 0)
        while len(row) < num_cols:
            row.append("")
        for cell_text in row:
            bg_color = 'E0F2FE' if is_header else ('F8FAFC' if row_idx % 2 == 1 else 'FFFFFF')
            if is_header:
                rPr_content = '<w:b/><w:bCs/><w:color w:val="005A9C"/>'
            else:
                rPr_content = ''
            rPr_tag = f'<w:rPr>{rPr_content}</w:rPr>' if rPr_content else ''
            tc = [
                '<w:tc>',
                f'<w:tcPr><w:tcW w:w="{col_width}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="{bg_color}"/></w:tcPr>',
                f'<w:p><w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr>',
                f'<w:r>{rPr_tag}<w:t xml:space="preserve">{escape(cell_text)}</w:t></w:r></w:p>',
                '</w:tc>'
            ]
            tbl_xml.extend(tc)
        tbl_xml.append('</w:tr>')

    tbl_xml.append('</w:tbl>')
    return "\n".join(tbl_xml)

def generate_docx():
    with open(REPORT_MD, 'r', encoding='utf-8') as f:
        md_text = f.read()

    body = []
    lines = md_text.splitlines()
    in_code = False
    code_lines = []
    in_table = False
    table_lines = []

    for line in lines:
        stripped = line.strip()

        if stripped.startswith('```'):
            if in_code:
                in_code = False
                for c in code_lines:
                    safe_c = escape(c)
                    body.append(
                        f'<w:p><w:pPr><w:pStyle w:val="CodeBlock"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:color w:val="0F172A"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">{safe_c}</w:t></w:r></w:p>'
                    )
                code_lines = []
            else:
                if in_table:
                    body.append(build_table_xml(table_lines))
                    table_lines = []
                    in_table = False
                in_code = True
                code_lines = []
            continue

        if in_code:
            code_lines.append(line)
            continue

        if stripped.startswith('|') and stripped.endswith('|'):
            in_table = True
            table_lines.append(stripped)
            continue
        else:
            if in_table:
                body.append(build_table_xml(table_lines))
                table_lines = []
                in_table = False

        if not stripped:
            continue

        if stripped in ('---', '***', '___'):
            body.append(
                '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="1" w:color="005A9C"/></w:pBdr><w:spacing w:before="160" w:after="160"/></w:pPr><w:r><w:t></w:t></w:r></w:p>'
            )
            continue

        if stripped.startswith('# '):
            body.append(build_p(stripped[2:], style="Title"))
        elif stripped.startswith('## '):
            body.append(build_p(stripped[3:], style="Heading1"))
        elif stripped.startswith('### '):
            body.append(build_p(stripped[4:], style="Heading2"))
        elif stripped.startswith('#### '):
            body.append(build_p(stripped[5:], style="Heading3"))
        elif stripped.startswith('- ') or stripped.startswith('* '):
            item_text = stripped[2:]
            bullet_xml = f'<w:p><w:pPr><w:pStyle w:val="ListBullet"/></w:pPr><w:r><w:rPr><w:color w:val="005A9C"/></w:rPr><w:t xml:space="preserve">▪  </w:t></w:r>{parse_runs(item_text)}</w:p>'
            body.append(bullet_xml)
        elif re.match(r'^\d+\.\s+', stripped):
            num_match = re.match(r'^(\d+\.)\s+(.*)', stripped)
            prefix = num_match.group(1)
            item_text = num_match.group(2)
            num_xml = f'<w:p><w:pPr><w:pStyle w:val="ListBullet"/></w:pPr><w:r><w:rPr><w:b/><w:bCs/><w:color w:val="005A9C"/></w:rPr><w:t xml:space="preserve">{prefix} </w:t></w:r>{parse_runs(item_text)}</w:p>'
            body.append(num_xml)
        else:
            body.append(build_p(stripped))

    if in_table and table_lines:
        body.append(build_table_xml(table_lines))

    sectPr = """<w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>"""

    body_xml = "\n".join(body)
    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>
    {body_xml}
    {sectPr}
  </w:body>
</w:document>"""

    with zipfile.ZipFile(OUTPUT_DOCX, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('[Content_Types].xml', CONTENT_TYPES_XML)
        zf.writestr('_rels/.rels', RELS_XML)
        zf.writestr('docProps/core.xml', CORE_PROPS_XML)
        zf.writestr('docProps/app.xml', APP_PROPS_XML)
        zf.writestr('word/_rels/document.xml.rels', DOC_RELS_XML)
        zf.writestr('word/settings.xml', SETTINGS_XML)
        zf.writestr('word/fontTable.xml', FONT_TABLE_XML)
        zf.writestr('word/styles.xml', STYLES_XML)
        zf.writestr('word/document.xml', document_xml)

    print(f"[DOCX OK] Generated {OUTPUT_DOCX} ({os.path.getsize(OUTPUT_DOCX)/1024:.1f} KB)")

def generate_rtf():
    """Generates an RTF format document which Word opens 100% natively without schema restrictions."""
    with open(REPORT_MD, 'r', encoding='utf-8') as f:
        md = f.read()

    rtf_lines = [
        r"{\rtf1\ansi\deff0",
        r"{\fonttbl{\f0 Calibri;}{\f1 Arial;}{\f2 Consolas;}}",
        r"{\colortbl;\red0\green90\blue156;\red14\green165\blue201;\red30\green41\blue59;\red240\green245\blue250;\red241\green245\blue249;}",
        r"\viewkind4\uc1\pard\sl276\slmult1\f0\fs22 "
    ]

    in_code = False
    for line in md.splitlines():
        s = line.strip()
        if s.startswith('```'):
            in_code = not in_code
            continue
        if in_code:
            clean = line.replace('\\', '\\\\').replace('{', '\\{').replace('}', '\\}')
            rtf_lines.append(r"\pard\li360\ri360\sb60\sa60\f2\fs18 " + clean + r"\par\pard\sl276\slmult1\f0 ")
            continue
        if not s:
            rtf_lines.append(r"\par ")
            continue
        if s.startswith('# '):
            clean = s[2:].replace('\\', '\\\\').replace('{', '\\{').replace('}', '\\}')
            rtf_lines.append(r"\pard\qc\sa240\sb240\b\f1\fs48\cf1 " + clean + r"\b0\fs22\cf0\par\pard\sl276\slmult1\f0 ")
        elif s.startswith('## '):
            clean = s[3:].replace('\\', '\\\\').replace('{', '\\{').replace('}', '\\}')
            rtf_lines.append(r"\pard\sa160\sb280\b\f1\fs34\cf1 " + clean + r"\b0\fs22\cf0\par\pard\sl276\slmult1\f0 ")
        elif s.startswith('### '):
            clean = s[4:].replace('\\', '\\\\').replace('{', '\\{').replace('}', '\\}')
            rtf_lines.append(r"\pard\sa120\sb200\b\f1\fs28\cf2 " + clean + r"\b0\fs22\cf0\par\pard\sl276\slmult1\f0 ")
        elif s.startswith('- ') or s.startswith('* '):
            clean = s[2:].replace('**', '').replace('`', '').replace('\\', '\\\\').replace('{', '\\{').replace('}', '\\}')
            rtf_lines.append(r"\pard\li480\sa80\bullet  " + clean + r"\par\pard\sl276\slmult1 ")
        elif re.match(r'^\d+\.\s+', s):
            clean = s.replace('**', '').replace('`', '').replace('\\', '\\\\').replace('{', '\\{').replace('}', '\\}')
            rtf_lines.append(r"\pard\li480\sa80 " + clean + r"\par\pard\sl276\slmult1 ")
        elif s.startswith('|') and s.endswith('|'):
            if re.match(r'^\|[\s\-:|]+\|$', s):
                continue
            cells = [c.strip().replace('**', '').replace('`', '').replace('\\', '\\\\').replace('{', '\\{').replace('}', '\\}') for c in s[1:-1].split('|')]
            rtf_lines.append(r"\pard\li240\sa60\b " + "  |  ".join(cells) + r"\b0\par\pard\sl276\slmult1 ")
        else:
            clean = s.replace('**', '').replace('`', '').replace('\\', '\\\\').replace('{', '\\{').replace('}', '\\}')
            rtf_lines.append(clean + r"\par ")

    rtf_lines.append(r"}")
    with open(OUTPUT_RTF, 'w', encoding='utf-8') as f:
        f.write("\n".join(rtf_lines))

    print(f"[RTF OK] Generated {OUTPUT_RTF} ({os.path.getsize(OUTPUT_RTF)/1024:.1f} KB)")

def generate_word_html_doc():
    """Generates an HTML-based .doc file that Word opens natively with full styling and tables."""
    with open(REPORT_MD, 'r', encoding='utf-8') as f:
        md = f.read()

    html_parts = [
        '<html xmlns:o="urn:schemas-microsoft.com:office:office" xmlns:w="urn:schemas-microsoft.com:office:word" xmlns="http://www.w3.org/TR/REC-html40">',
        '<head><meta charset="utf-8"><title>MediFlow-AI Technical Report</title>',
        '<style>',
        'body { font-family: "Calibri", "Segoe UI", sans-serif; font-size: 11pt; line-height: 1.5; color: #262626; margin: 40px; }',
        'h1 { font-family: "Arial", sans-serif; font-size: 24pt; color: #005A9C; text-align: center; margin-top: 20px; margin-bottom: 20px; }',
        'h2 { font-family: "Arial", sans-serif; font-size: 16pt; color: #005A9C; border-bottom: 2px solid #005A9C; padding-bottom: 4px; margin-top: 25px; }',
        'h3 { font-family: "Arial", sans-serif; font-size: 13pt; color: #0EA5C9; margin-top: 18px; }',
        'table { border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 10pt; }',
        'th { background-color: #005A9C; color: #ffffff; padding: 8px 12px; text-align: left; border: 1px solid #cbd5e1; }',
        'td { padding: 8px 12px; border: 1px solid #cbd5e1; }',
        'tr:nth-child(even) { background-color: #f8fafc; }',
        'pre { background-color: #f1f5f9; padding: 12px; border-radius: 4px; font-family: "Consolas", monospace; font-size: 9.5pt; color: #0f172a; overflow-x: auto; border-left: 4px solid #005A9C; }',
        'code { font-family: "Consolas", monospace; background-color: #f1f5f9; padding: 2px 5px; color: #0b7ea0; border-radius: 3px; font-size: 10pt; }',
        'ul, ol { margin-top: 6px; margin-bottom: 10px; padding-left: 24px; }',
        'li { margin-bottom: 4px; }',
        'hr { border: 0; height: 1px; background: #005A9C; margin: 25px 0; }',
        '</style></head><body>'
    ]

    lines = md.splitlines()
    in_code = False
    in_table = False
    table_lines = []

    def format_inline(text):
        text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
        text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
        text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
        return text

    for line in lines:
        s = line.strip()
        if s.startswith('```'):
            if in_code:
                html_parts.append('</pre>')
                in_code = False
            else:
                if in_table:
                    html_parts.append(render_html_table(table_lines))
                    table_lines = []
                    in_table = False
                html_parts.append('<pre>')
                in_code = True
            continue

        if in_code:
            html_parts.append(escape(line))
            continue

        if s.startswith('|') and s.endswith('|'):
            in_table = True
            table_lines.append(s)
            continue
        else:
            if in_table:
                html_parts.append(render_html_table(table_lines))
                table_lines = []
                in_table = False

        if not s:
            continue

        if s in ('---', '***', '___'):
            html_parts.append('<hr/>')
        elif s.startswith('# '):
            html_parts.append(f'<h1>{format_inline(escape(s[2:]))}</h1>')
        elif s.startswith('## '):
            html_parts.append(f'<h2>{format_inline(escape(s[3:]))}</h2>')
        elif s.startswith('### '):
            html_parts.append(f'<h3>{format_inline(escape(s[4:]))}</h3>')
        elif s.startswith('- ') or s.startswith('* '):
            html_parts.append(f'<ul><li>{format_inline(escape(s[2:]))}</li></ul>')
        elif re.match(r'^\d+\.\s+', s):
            num_match = re.match(r'^\d+\.\s+(.*)', s)
            html_parts.append(f'<ol><li>{format_inline(escape(num_match.group(1)))}</li></ol>')
        else:
            html_parts.append(f'<p>{format_inline(escape(s))}</p>')

    if in_table and table_lines:
        html_parts.append(render_html_table(table_lines))

    html_parts.append('</body></html>')
    with open(OUTPUT_DOC, 'w', encoding='utf-8') as f:
        f.write("\n".join(html_parts))

    print(f"[DOC OK] Generated {OUTPUT_DOC} ({os.path.getsize(OUTPUT_DOC)/1024:.1f} KB)")

def render_html_table(lines):
    rows = []
    for l in lines:
        l = l.strip()
        if re.match(r'^\|[\s\-:|]+\|$', l):
            continue
        cells = [c.strip() for c in l[1:-1].split('|')]
        rows.append(cells)
    if not rows:
        return ""
    out = ['<table>']
    for idx, r in enumerate(rows):
        tag = 'th' if idx == 0 else 'td'
        cells_html = "".join(f'<{tag}>{escape(c)}</{tag}>' for c in r)
        out.append(f'<tr>{cells_html}</tr>')
    out.append('</table>')
    return "\n".join(out)

if __name__ == '__main__':
    generate_docx()
    generate_rtf()
    generate_word_html_doc()
