import os
import random
import requests
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from models.wardrobe import add_item, get_all_items, get_items_by_category, delete_item

wardrobe_bp = Blueprint("wardrobe", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ── Upload clothing image ──────────────────────────────────────────────────────
@wardrobe_bp.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    filename = secure_filename(file.filename)
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    # avoid overwriting: prefix with a random int
    unique_name = f"{random.randint(10000,99999)}_{filename}"
    file.save(os.path.join(upload_folder, unique_name))

    name = request.form.get("name", filename)
    category = request.form.get("category", "Tops")
    color = request.form.get("color", "")
    season = request.form.get("season", "All Season")
    occasion = request.form.get("occasion", "Casual")

    add_item(name, category, color, season, occasion, unique_name)
    return jsonify({"message": "Uploaded successfully", "filename": unique_name}), 201


# ── Serve uploaded images ──────────────────────────────────────────────────────
@wardrobe_bp.route("/uploads/<filename>")
def serve_image(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)


# ── Get entire wardrobe (optionally filter by category) ───────────────────────
@wardrobe_bp.route("/wardrobe", methods=["GET"])
def wardrobe():
    category = request.args.get("category")
    items = get_items_by_category(category) if category else get_all_items()
    return jsonify(items)


# ── Delete an item ─────────────────────────────────────────────────────────────
@wardrobe_bp.route("/wardrobe/<int:item_id>", methods=["DELETE"])
def delete(item_id):
    delete_item(item_id)
    return jsonify({"message": "Deleted"})


# ── Random outfit generator ────────────────────────────────────────────────────
@wardrobe_bp.route("/generate-outfit", methods=["GET"])
def generate_outfit():
    def pick(cat):
        items = get_items_by_category(cat)
        return random.choice(items) if items else None

    outfit = {
        "top": pick("Tops"),
        "bottom": pick("Bottoms"),
        "shoes": pick("Shoes"),
        "jacket": pick("Jackets"),
    }
    return jsonify(outfit)


# ── Virtual Try-On (RapidAPI) ──────────────────────────────────────────────────
@wardrobe_bp.route("/tryon", methods=["POST"])
def virtual_tryon():
    """
    Expects multipart/form-data with:
      - model_image  (file)
      - cloth_image  (file)
    Returns the try-on result image URL or base64 from RapidAPI.
    """
    RAPIDAPI_KEY = os.environ.get("RAPIDAPI_KEY", "YOUR_RAPIDAPI_KEY_HERE")

    if "model_image" not in request.files or "cloth_image" not in request.files:
        return jsonify({"error": "Both model_image and cloth_image are required"}), 400

    model_img = request.files["model_image"]
    cloth_img = request.files["cloth_image"]

    url = "https://virtual-try-on2.p.rapidapi.com/clothes-virtual-tryon"
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "virtual-try-on2.p.rapidapi.com",
    }
    files = {
        "model_image": (model_img.filename, model_img.stream, model_img.content_type),
        "cloth_image": (cloth_img.filename, cloth_img.stream, cloth_img.content_type),
    }

    try:
        response = requests.post(url, headers=headers, files=files, timeout=30)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 502
