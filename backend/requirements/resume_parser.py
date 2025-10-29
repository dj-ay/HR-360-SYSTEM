from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
import fitz
import re
import os

app = Flask(__name__)
CORS(app)

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Skills database
SKILLS_DB = [
    "Python", "Java", "JavaScript", "React", "Node.js", "SQL", "MongoDB",
    "AWS", "Docker", "Kubernetes", "Git", "REST API", "GraphQL",
    "HTML", "CSS", "TypeScript", "Express", "Django", "Flask",
    "Machine Learning", "Data Science", "TensorFlow", "Pandas"
]

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def extract_email(text):
    """Extract email from text"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    return emails[0] if emails else None

def extract_phone(text):
    """Extract phone number from text"""
    phone_pattern = r'\b(?:\+?1[-.\s]?)?$$?([0-9]{3})$$?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b'
    phones = re.findall(phone_pattern, text)
    return phones[0] if phones else None

def extract_skills(text):
    """Extract skills from text"""
    found_skills = []
    for skill in SKILLS_DB:
        if skill.lower() in text.lower():
            found_skills.append(skill)
    return list(set(found_skills))

def extract_experience(text):
    """Extract years of experience"""
    experience_pattern = r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)'
    matches = re.findall(experience_pattern, text, re.IGNORECASE)
    return int(matches[0]) if matches else 0

@app.route('/parse-resume', methods=['POST'])
def parse_resume():
    """Parse resume and extract information"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Save file temporarily
        file_path = f"temp_{file.filename}"
        file.save(file_path)

        # Extract text
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_path)
        else:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()

        # Extract information
        doc = nlp(text)
        
        extracted_data = {
            "email": extract_email(text),
            "phone": extract_phone(text),
            "skills": extract_skills(text),
            "experience_years": extract_experience(text),
            "text_preview": text[:500]
        }

        # Clean up
        os.remove(file_path)

        return jsonify(extracted_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
