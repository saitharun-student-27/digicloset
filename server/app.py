from flask import Flask
from flask_cors import CORS
from routes.wardrobe_routes import wardrobe_bp
import os

app = Flask(__name__)
CORS(app)

app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

app.register_blueprint(wardrobe_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
