# This should be a flash server that initiates with a database class object
#
# /
# GET /courses will get the number of courses and the number of courses per page
# GET /courses/1 will get the first 10 courses
# GET /courses/2 will get the next 10 courses (and so on)
# GET /search/<query> will return the number of courses and number of courses per page using that query
# GET /search/<query>/1 will return the first 10 courses using that query
# GET /search/<query>/2 will return the next 10 courses using that query (and so on)
# POST /courses/<id> will update the course with the given id
# POST /courses will add a course
# DELETE /courses/<id> will delete the course with the given id

import os
from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS
from server.database import Database
from server.config import Config
from server.countryCodes import CountryCodes

db = None
config = None
sort_by = None
countryCodes = None
app = Flask(__name__)

# get main directory
directory = __file__.split("/")
directory.pop()
directory.pop()
directory = "/".join(directory)
web_directory = directory + "/dist/course-tracker/browser"

# CORS(app)

def count_json(count):
    per_page = config.pages()
    pages = count // per_page
    if count % per_page != 0:
        pages += 1
    return {"count": count, "limit": per_page, "pages": pages}

def handle_data(data):
    json_data = jsonify(data)
    json_data.headers.add('Access-Control-Allow-Origin', '*')
    # json_data.headers.add('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT')
    return json_data

@app.route('/page', methods=['GET'])
def pages():
    print("Getting pages...")
    count = db.number_of_pages()
    json_data = count_json(count)
    return handle_data(json_data)

@app.route('/page/<page_number>', methods=['GET'])
def page(page_number):
    print("Getting page " + page_number + "...")
    data = db.page(int(page_number), config.pages(), sort_by)
    return handle_data(data)

@app.route('/search/<query>', methods=['GET'])
def search(query):
    count = db.search(query)
    json_data = count_json(count)
    return handle_data(json_data)

@app.route('/search/<query>/<page_number>', methods=['GET'])
def search_page(query, page_number):
    data = db.search_page(query, int(page_number), config.pages(), sort_by)
    return handle_data(data)

@app.route('/add', methods=['POST'])
def add():
    data = request.json
    success = db.add(data)
    return handle_data({"success": success})

@app.route('/update/<id>', methods=['POST'])
def update(id):
    data = request.json
    success = db.update(id, data)
    print("Updated: " + str(success))
    print(data)
    print(id)
    return handle_data({"success": success})

@app.route('/delete/<id>', methods=['POST'])
def delete(id):
    print("Deleting: " + id)
    db.delete(id)
    return handle_data({"success": True})

@app.route('/countryCodes', methods=['GET'])
def country_codes():
    data = countryCodes.all()
    return handle_data({"success": data != None, "data": data})

@app.route('/countryCodes/<code>', methods=['GET'])
def country_code(code):
    data = countryCodes.get(code)
    return handle_data({"success": data != None, "data": data})

@app.route('/autocomplete/<field>/<query>', methods=['GET'])
def autocomplete(field, query):
    data = db.autocomplete(field, query)
    return handle_data({"success": data != None, "data": data})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def home(path):
    if path == "":
        path = "index.html"
    print("Sending static file: " + path)
    return send_from_directory(web_directory, path)

class Server:
    def __init__(self):
        print("Server is setting up...")
        global db, config, sort_by, countryCodes
        db = Database()
        sort_by = "_id"
        config = Config()
        countryCodes = CountryCodes()
        self.port = config.port()

    def run(self):
        app.run(port=self.port, host='0.0.0.0')
        print("Server has started...")
