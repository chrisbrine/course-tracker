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

from flask import Flask, request, jsonify, app
from server.database import Database
from server.config import Config

class Server:
    def __init__(self):
        self.db = Database()
        self.sort_by = "_id"
        self.config = Config()
        self.app = Flask(__name__)
        # self.app.add_url_rule('/courses', 'courses', self.pages, methods=['GET'])
        # self.app.add_url_rule('/courses/<page_number>', 'course', self.page, methods=['GET'])
        # self.app.add_url_rule('/search/<query>', 'search', self.search, methods=['GET'])
        # self.app.add_url_rule('/search/<query>/<page_number>', 'search_page', self.search_page, methods=['GET'])
        # self.app.add_url_rule('/courses', 'add_course', self.add, methods=['POST'])
        # self.app.add_url_rule('/courses/<course_id>', 'update', self.update, methods=['POST'])
        # self.app.add_url_rule('/courses/<course_id>', 'delete', self.delete, methods=['DELETE'])

    def count_json(self, count):
        per_page = self.config.pages()
        pages = count // per_page
        if count % per_page != 0:
            pages += 1
        return {"count": count, "per_page": per_page, "pages": pages}

    @app.route('/page', methods=['GET'])
    def pages(self):
        count = self.db.number_of_pages()
        json_data = self.count_json(count)
        return jsonify(json_data)

    @app.route('/page/<page_number>', methods=['GET'])
    def page(self, page_number):
        data = self.db.page(page_number, self.config.pages(), self.sort_by)
        return jsonify(data)

    @app.route('/search/<query>', methods=['GET'])
    def search(self, query):
        count = self.db.search(query)
        json_data = self.count_json(count)
        return jsonify(json_data)

    @app.route('/search/<query>/<page_number>', methods=['GET'])
    def search_page(self, query, page_number):
        data = self.db.search_page(query, page_number, self.config.pages(), self.sort_by)
        return jsonify(data)

    @app.route('/item', methods=['POST'])
    def add(self):
        data = request.json
        success = self.db.add(data)
        return jsonify({"success": success})

    @app.route('/item/<id>', methods=['POST'])
    def update(self, id):
        data = request.json
        success = self.db.update(id, data)
        return jsonify({"success": success})

    @app.route('/item/<id>', methods=['DELETE'])
    def delete(self, id):
        self.db.delete(id)
        return jsonify({"success": True})
