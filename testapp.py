from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import subprocess
import json

app = Flask(__name__)

@app.route('/')
def career():
    return render_template("hometest.html")

@app.route('/predict', methods=['POST', 'GET'])
def result():
    if request.method == 'POST':
        result = request.form
        res = result.to_dict(flat=True)
        arr = [float(value) for value in res.values()]
        data = np.array(arr).reshape(1, -1)

        loaded_model = pickle.load(open("careerlast.pkl", 'rb'))
        predictions = loaded_model.predict(data)
        pred = loaded_model.predict_proba(data) > 0.05

        res, final_res = {}, {}
        for j in range(17):
            if pred[0, j]:
                res[len(res)] = j
        for idx, val in res.items():
            if val != predictions[0]:
                final_res[len(final_res)] = val

        jobs_dict = {
            0: 'AI ML Specialist',
            1: 'API Integration Specialist',
            2: 'Application Support Engineer',
            3: 'Business Analyst',
            4: 'Customer Service Executive',
            5: 'Cyber Security Specialist',
            6: 'Data Scientist',
            7: 'Database Administrator',
            8: 'Graphics Designer',
            9: 'Hardware Engineer',
            10: 'Helpdesk Engineer',
            11: 'Information Security Specialist',
            12: 'Networking Engineer',
            13: 'Project Manager',
            14: 'Software Developer',
            15: 'Software Tester',
            16: 'Technical Writer'
        }

        data1 = predictions[0]
        labels_to_index = {v: k for k, v in jobs_dict.items()}
        index = labels_to_index.get(data1, None)

        if index is None:
            return "Invalid career prediction"

        predicted_career = data1

        return render_template("testafter.html", final_res=final_res,
                               jobs_dict=jobs_dict, job0=index,
                               career_name=predicted_career)

def query_ollama(prompt, career_name):
    system_message = "You are a helpful assistant that gives career-specific guidance."
    full_prompt = f"{system_message}\nCareer: {career_name}\nUser: {prompt}"

    cmd = [
        "ollama",
        "run",
        "gemma:2b",  # or "llama3", "gemma:2b", etc.
        full_prompt
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)

        # DEBUG: Print output from Ollama
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)
        print("Return Code:", result.returncode)

        if result.returncode == 0:
            return result.stdout.strip()
        else:
            print("Ollama error:", result.stderr)
            return "Sorry, I could not process your request."
    except Exception as e:
        print("Exception while calling Ollama:", e)
        return "Sorry, an error occurred."

@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    user_message = data.get("message", "")
    career_name = data.get("career", "")

    reply = query_ollama(user_message, career_name)
    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(debug=True)