import spacy
from PyPDF2 import PdfReader

nlp = spacy.load('en_core_web_sm')

def parse_cv(pdf_path):
    reader = PdfReader(pdf_path)
    text = ''.join(page.extract_text() for page in reader.pages)
    doc = nlp(text)
    skills = [ent.text for ent in doc.ents if ent.label_ in ['SKILL', 'ORG']]
    return f"Skills: {', '.join(skills)}"