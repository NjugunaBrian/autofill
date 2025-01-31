from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import pdfplumber
from docx import Document
import re

def extract_resume_data(file_path):
    if file_path.endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx'):
        text = extract_text_from_docx(file_path)
    else:
        raise ValueError('Unsupported file format. Only PDF and DOCX files are supported.')

    return parse_resume_text(text)

def extract_text_from_pdf(file_path):
    with pdfplumber.open(file_path) as pdf:
        text = ''
        for page in pdf.pages:
            text += page.extract_text()
    return text

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    return '\n'.join([paragraph.text for paragraph in doc.paragraphs])

def parse_resume_text(text):
    resume_data = {}
    
    resume-data['name'] = text.split('\n')[0].strip()

    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    email_match = re.search(email_pattern, text)
    resume_data['email'] = email_match.group() if email_match else None

    phone_pattern = r'(\+?\d{1,2}\s?)?(\(\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}'
    phone_match = re.search(phone_pattern, text)
    resume_data['phone'] = phone_match.group() if phone_match else None

    experience_pattern = r'Experience\s*([\s\S]*?)(?:\n\s*\n|Skills|Education|$)'
    experience_match = re.search(experience_pattern, text, re.IGNORECASE)
    resume_data['experience'] = experience_match.group(1).strip() if experience_match else None


    skills_pattern = r'Skills\s*([\s\S]*?)(?:\n\s*\n|Experience|Education|$)'
    skills_match = re.search(skills_pattern, text, re.IGNORECASE)
    resume_data['skills'] = skills_match.group(1).strip() if skills_match else None

    return resume_data

def upload_resume(request):

    if request.method != 'POST' or not request.FILES.get('resume'):
        return JsonResponse({'error': 'Invalid request'}, status=400)

    file = request.FILES['resume']

    if not file.name.endswith(('.pdf', '.docx')):
        return JsonResponse({'error':'Invalid file type. Only PDF and DOCX files are allowed.'}, status=400)
    
    max_file_size = 5 * 1024 * 1024
    if file.size > max_file_size:
        return JsonResponse({'error': 'File size exceeds the limit of 5MB',}, status=400)
    
    try: 
        filename = default_storage.save(file.name, ContentFile(file.read()))
        file_path = os.path.join(settings.MEDIA_ROOT, filename)

        extracted_data = extract_resume_data(file_path)

        if os.path.exists(file_path):
            os.remove(file_path)

        return JsonResponse(extracted_data)

    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)    
