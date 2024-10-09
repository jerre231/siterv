from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import random
import pandas as pd
import sqlite3
import os

app = Flask(__name__)
CORS(app)

csv_file_path = 'answers.csv'

def load_answers():
    if os.path.exists(csv_file_path):
        return pd.read_csv(csv_file_path)
    else:
        return pd.DataFrame(columns=['usuario', 'id_prova', 'id_questao', 'correto'])

def save_answers():
    answers_df.to_csv(csv_file_path, index=False)

answers_df = load_answers()

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    with get_db_connection() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                pwd TEXT NOT NULL
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS Questions (
                id INTEGER PRIMARY KEY,
                question_text TEXT NOT NULL,
                answer TEXT NOT NULL,
                lvl INTEGER NOT NULL,
                subject TEXT NOT NULL,
                a TEXT NOT NULL,
                b TEXT NOT NULL,
                c TEXT NOT NULL,
                d TEXT NOT NULL,
                e TEXT NOT NULL
            )
        ''')
        conn.commit()

def create_provas(medium_lvl, selected_subjects):
    prova = []
    for subject, per_subject in selected_subjects.items():
        conn = get_db_connection()
        questions = conn.execute('SELECT * FROM Questions WHERE subject = ?', (subject,)).fetchall()
        conn.close()
        filtered_questions = [q for q in questions if medium_lvl - 1 <= q['lvl'] <= medium_lvl + 1]
        if not filtered_questions:
            filtered_questions = questions
        num_to_select = min(per_subject, len(filtered_questions))
        if num_to_select == 0:
            raise ValueError(f"No questions available for subject: {subject}")
        selected_questions = random.sample(filtered_questions, num_to_select)
        prova.extend(q['id'] for q in selected_questions)
    return prova

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if data is None:
        return jsonify({"message": "Dados não fornecidos!"}), 400
    username = data.get('username')
    pwd = data.get('pwd')
    if not username or not pwd:
        return jsonify({"message": "Usuário e senha são obrigatórios!"}), 400
    conn = get_db_connection()
    if conn.execute('SELECT * FROM Users WHERE username = ?', (username,)).fetchone():
        conn.close()
        return jsonify({"message": "Usuário já existe!"}), 400
    conn.execute('INSERT INTO Users (username, pwd) VALUES (?, ?)', (username, generate_password_hash(pwd)))
    conn.commit()
    conn.close()
    return jsonify({"message": "Usuário registrado com sucesso!"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    pwd = data.get('pwd')
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM Users WHERE username = ?', (username,)).fetchone()
    conn.close()
    if user and check_password_hash(user['pwd'], pwd):
        return jsonify({"message": "Login bem-sucedido!"}), 200
    return jsonify({"message": "Credenciais inválidas!"}), 401

@app.route('/api/prova', methods=['GET', 'POST'])
def get_prova():
    selected_subjects = {
        "Geografia": 2,
        "Ciências": 1,
        "Português": 1,
        "Matemática": 1,
    }
    id_questions = create_provas(medium_lvl=2, selected_subjects=selected_subjects)
    questions_with_alternatives = []
    conn = get_db_connection()
    for question_id in id_questions:
        question = conn.execute('SELECT * FROM Questions WHERE id = ?', (question_id,)).fetchone()
        if question:
            questions_with_alternatives.append({
                'id': question['id'],
                'question_text': question['question_text'],
                'alternatives': {
                    'a': question['a'],
                    'b': question['b'],
                    'c': question['c'],
                    'd': question['d'],
                    'e': question['e'],
                },
                'answer': question['answer']
            })
    conn.close()
    return jsonify(questions_with_alternatives)

@app.route('/api/save_answers', methods=['POST'])
def save_answers_api():
    global answers_df
    data = request.get_json()
    if not isinstance(data, list):
        return jsonify({'error': 'Invalid data format. Expected a list of answers.'}), 400
    for entry in data:
        if not all(key in entry for key in ('usuario', 'id_prova', 'id_questao', 'correto')):
            return jsonify({'error': 'Missing fields in entry.'}), 400
        answers_df = pd.concat([answers_df, pd.DataFrame([entry])], ignore_index=True)
    save_answers()
    return jsonify({'message': 'Respostas salvas com sucesso!'}), 200

@app.route('/api/get_answers', methods=['GET'])
def get_answers():
    return jsonify(answers_df.to_dict(orient='records'))

def insert_sample_questions():
    sample_questions = [
        ('Qual é a capital da França?', 'a', 1, 'Geografia', 'Paris', 'Londres', 'Berlim', 'Madrid', 'Roma'),
        ('Qual é a fórmula da água?', 'a', 2, 'Ciências', 'H2O', 'CO2', 'O2', 'N2', 'C6H12O6'),
        ('Quem escreveu "Dom Casmurro"?', 'a', 3, 'Português', 'Machado de Assis', 'José de Alencar', 'Clarice Lispector', 'Graciliano Ramos', 'Joaquim Manuel de Macedo'),
        ('Qual é a raiz quadrada de 16?', 'a', 2, 'Matemática', '4', '8', '16', '2', '6'),
        ('Qual é o continente mais populoso?', 'a', 1, 'Geografia', 'Ásia', 'África', 'Europa', 'América', 'Oceania')
    ]
    with get_db_connection() as conn:
        conn.executemany('INSERT INTO Questions (question_text, answer, lvl, subject, a, b, c, d, e) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', sample_questions)
        conn.commit()

if __name__ == '__main__':
    create_tables()
    insert_sample_questions()
    app.run(debug=True, port=5000)