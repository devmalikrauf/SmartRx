import os
import re
import numpy as np
from sklearn.linear_model import LogisticRegression

# Set NLTK download directory to a local path to avoid permission issues
os.environ['NLTK_DATA'] = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'nltk_data')

def tokenize_text(text: str) -> list[str]:
    """
    Tokenizes text using NLTK word_tokenize with a graceful regex fallback if NLTK data is unavailable.
    """
    try:
        import nltk
        nltk_data_dir = os.environ['NLTK_DATA']
        if not os.path.exists(nltk_data_dir):
            os.makedirs(nltk_data_dir, exist_ok=True)
        
        # Download punkt quietly if not found
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt', download_dir=nltk_data_dir, quiet=True)
            
        from nltk.tokenize import word_tokenize
        return word_tokenize(text)
    except Exception as e:
        print(f"NLTK tokenization error, falling back to regex: {e}")
        # Standard alphanumeric word extraction as fallback
        return re.findall(r'\b\w+\b', text)

# Common suffixes for medicine names
MEDICINE_SUFFIXES = [
    'ol', 'in', 'cin', 'pam', 'pril', 'sone', 'mab', 'phine', 'ine', 'dipine', 
    'olol', 'tan', 'mycin', 'vir', 'afil', 'ide', 'azole', 'asone', 'onide'
]

def validate_medicine_name(name: str) -> bool:
    """
    Validates if a name looks like a medicine name using suffix checks.
    """
    if not name or len(name) < 3:
        return False
        
    name_lower = name.lower().strip()
    # Check if the name ends with common pharmaceutical suffixes
    for suffix in MEDICINE_SUFFIXES:
        if name_lower.endswith(suffix):
            return True
            
    # Check if name contains numbers (e.g. "Panadol 500mg" or "Co-Amoxiclav")
    if any(char.isdigit() for char in name_lower) or '-' in name_lower:
        return True
        
    return False

# Initialize the Scikit-learn Confidence Classifier
# Features: 
# 1. Image Sharpness Score: min(variance / 500.0, 1.0)
# 2. OCR Match Ratio: proportion of extracted medicine names found in the OCR text
# 3. Field Completeness: proportion of filled fields out of total expected fields in extracted medicines
# Training data for LogisticRegression to score confidence level
X_train = np.array([
    [0.1, 0.0, 0.1],  # Very blurry, 0 OCR match, empty fields -> Low
    [0.9, 0.9, 0.9],  # Sharp image, high OCR match, complete fields -> High
    [0.4, 0.5, 0.5],  # Medium quality, moderate match, moderate fields -> Medium
    [0.8, 0.2, 0.7],  # Sharp image, low OCR match (handwritten), decent fields -> Medium
    [0.2, 0.8, 0.4],  # Blurry image, high OCR match, low fields -> Medium
])
y_train = np.array([0, 2, 1, 1, 1])  # 0: Low, 1: Medium, 2: High

confidence_model = LogisticRegression()
confidence_model.fit(X_train, y_train)

def calculate_confidence_score(blur_variance: float, ocr_text: str, medicines: list[dict]) -> float:
    """
    Calculates a confidence score (0 to 100) using a LogisticRegression classifier.
    """
    try:
        # Feature 1: Sharpness (0 to 1)
        sharpness_score = min(blur_variance / 500.0, 1.0)
        
        # Feature 2: OCR Match Ratio (0 to 1)
        ocr_tokens = [tok.lower() for tok in tokenize_text(ocr_text)]
        ocr_set = set(ocr_tokens)
        
        match_count = 0
        total_med_words = 0
        
        for med in medicines:
            med_name = med.get('name', '')
            if med_name:
                med_words = [w.lower() for w in tokenize_text(med_name)]
                total_med_words += len(med_words)
                for w in med_words:
                    if w in ocr_set:
                        match_count += 1
                        
        ocr_match_ratio = 1.0
        if total_med_words > 0:
            ocr_match_ratio = match_count / total_med_words

        # Feature 3: Field Completeness (0 to 1)
        filled_fields = 0
        total_fields = 0
        
        for med in medicines:
            # We check fields: name, dosage, frequency, duration
            for field in ['name', 'dosage', 'frequency', 'duration']:
                total_fields += 1
                if med.get(field):
                    filled_fields += 1
                    
        field_completeness = 1.0
        if total_fields > 0:
            field_completeness = filled_fields / total_fields

        # Predict probability classes
        features = np.array([[sharpness_score, ocr_match_ratio, field_completeness]])
        probabilities = confidence_model.predict_proba(features)[0]
        
        # Weight the classes: Low (0.2), Medium (0.6), High (1.0)
        weighted_score = (probabilities[0] * 20.0) + (probabilities[1] * 65.0) + (probabilities[2] * 100.0)
        
        return round(float(weighted_score), 1)
    except Exception as e:
        print(f"Error calculating confidence score: {e}")
        return 85.0  # Fallback confidence
