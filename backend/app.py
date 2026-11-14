from flask import Flask, jsonify

app = Flask(_name_)

@app.route("/")
def home():
    return jsonify({
        "project": "MARS-X",
        "message": "Mars Geological Mapping Backend",
        "status": "Running"
    })

@app.route("/api/status")
def status():
    return jsonify({
        "backend": "Connected",
        "project": "MARS-X"
    })

if _name_ == "_main_":
    app.run(debug=True)
