from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    pwd = db.Column(db.String(128), nullable=False)

    def __init__(self, username, pwd):
        self.username = username
        self.pwd = generate_password_hash(pwd)

class Questions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.String(256), nullable=False)
    answer = db.Column(db.String(256), nullable=False)
    lvl = db.Column(db.Integer, nullable=False)

    def __init__(self, question_text, answer):
        self.question_text = question_text
        self.answer = answer
        self.lvl = lvl

# Rotas

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    if data is None:
        return jsonify({"message": "Dados não fornecidos!"}), 200

    username = data.get('username')
    pwd = data.get('pwd')

    if not username or not pwd:
        return jsonify({"message": "Usuário e senha são obrigatórios!"}), 200

    if Users.query.filter_by(username=username).first():
        return jsonify({"message": "Usuário já existe!"}), 200

    new_user = Users(username, pwd)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Usuário registrado com sucesso!"}), 200

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    pwd = data.get('pwd')

    user = Users.query.filter_by(username=username).first()
    if user and check_password_hash(user.pwd, pwd):
        return jsonify({"message": "Login bem-sucedido!"}), 200
    return jsonify({"message": "Credenciais inválidas!"}), 200

@app.route('/api/prova', methods=['GET'])
def get_prova():
    lvl1 = Questions.query.filter_by(lvl=1).first()
    lvl2 = Questions.query.filter_by(lvl=2).first() 
    lvl3 = Questions.query.filter_by(lvl=3).first()

    #TODO: calcular o numero de questões a partir do for, ou usar alguma função do sqlalchemy para contar n de linhas
    #TODO: adicionar questões do banco de dados, separar em proporções/parâmetros de entrada definidos previamente.
    #TODO: a partir dois passos acima, separar cada level em proporções iguais, caso não sejam iguais, sacrificar questoes da ultima prova. Ex:
    '''
    sim1 = (lvl1)/3 + (lvl2)/3 + (lvl3)/3
    sim2 - (lvl2)/3 + ...
    '''
    pass

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port='5000')
