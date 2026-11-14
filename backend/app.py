from flask import Flask, jsonify, render_template

# Import Member 4 Route Planning API
from modules.route_api import route_api

app = Flask(__name__)

# Register Route Planning API
app.register_blueprint(route_api)


# Main project endpoint
@app.route("/")
def home():
    return jsonify({
        "project": "MARS-X",
        "message": "Mars Geological Mapping Backend",
        "status": "Running"
    })


# Backend status endpoint
@app.route("/api/status")
def status():
    return jsonify({
        "backend": "Connected",
        "project": "MARS-X"
    })


# Member 4 - Route Planner Page
@app.route("/route-planner")
def route_planner_page():
    return render_template("route_planner.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
