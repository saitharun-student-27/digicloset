import json
from app.core.config import settings


def get_gemini_client():
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in environment.")

    try:
        from google import genai
    except ImportError as error:
        raise RuntimeError(
            "google-genai is not installed. Add it to the backend environment to use AI scan.",
        ) from error

    return genai.Client(api_key=api_key)


async def scan_clothing_image(file_bytes: bytes, mime_type: str) -> dict:
    """
    Sends an image to Gemini and asks it to identify the clothing item.
    Returns a dictionary matching the ClothingItemCreate schema.
    """
    client = get_gemini_client()
    from google.genai import types
    
    prompt = """
    Analyze this clothing item. Return ONLY a JSON object with the following fields:
    - name (string): A short, descriptive name (e.g. "Vintage Denim Jacket")
    - category (string): Must be one of: shirt, t_shirt, pant, jeans, shorts, jacket, hoodie, shoes, accessory, dress
    - color (string): The dominant color
    - season (string): Must be one of: summer, winter, rainy, all
    - occasion (string): Must be one of: casual, formal, college, party, sports, travel, traditional
    - style (string): An optional aesthetic tag (e.g. "streetwear", "minimalist", "vintage")
    - formality_level (integer): 1 (very casual) to 5 (very formal)
    
    Ensure the output is raw JSON, do not wrap in markdown tags like ```json.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "name": "Unknown Item",
            "category": "shirt",
            "color": "unknown",
            "season": "all",
            "occasion": "casual",
            "style": "",
            "formality_level": 3
        }

async def get_stylist_recommendation(message: str, current_wardrobe_summary: str) -> str:
    """
    Sends a user message and their wardrobe state to Gemini to get a stylistic recommendation.
    """
    client = get_gemini_client()
    
    prompt = f"""
    You are a high-end, extremely concise personal fashion stylist.
    The user is asking for outfit advice.
    
    Here is a summary of the user's current wardrobe:
    {current_wardrobe_summary}
    
    User message: "{message}"
    
    Respond directly to the user. Do not use markdown headers, just return a conversational, stylish paragraph.
    If you recommend specific items, reference pieces that actually exist in their wardrobe.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "I'm having trouble connecting to the styling engine right now. Let's try again later!"
