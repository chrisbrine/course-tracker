import pymongo
import re
from server.config import Config
from server.csvData import CSV

class Database:
    def __init__(self):
        self.config = Config()
        self.connectionString = self.config.dbURI()
        self.client = pymongo.MongoClient(self.connectionString)
        print("Connected to the database...")
        self.dbTable = self.config.dbTable()
        self.dbCollection = self.config.dbCollection()
        self.db = self.client[self.dbTable]
        self.collection = self.db[self.dbCollection]
        self.expireTime = self.config.dbExpire()
        self.collection.create_index("createdAt", expireAfterSeconds=self.expireTime)
        self.checkData()
    def checkData(self):
        # if data in collection has entries, then return
        if self.collection.count_documents({}) > 0:
            print("Data is already in the database...")
            return
        # get csvData
        # data is a pandas dataframe
        print("Data is being inserted into the database...")
        self.csv = CSV()
        # write all entries to mongo database and add a createdAt field to every one
        self.collection.insert_many(self.csv.dict())
        print("Data has been inserted into the database...")
        # print(self.csv)
    def search(self, query: str):
        # The query can search for any field in the database
        # Return the number of pages that match the query
        queryString = {"$text": {"$search": query}}
        return self.collection.count_documents(queryString)
    def search_page(self, query: str, page: int, limit: int, sort_by: str):
        # The query can search for any field in the database
        # Return the page of results that match the query
        queryString = {"$text": {"$search": query}}
        return self.collection.find(queryString).sort(sort_by).skip((page-1)*limit).limit(limit)
    def number_of_pages(self):
        return self.collection.count_documents({})
    def page(self, page: int, limit: int, sort_by: str):
        return self.collection.find().sort(sort_by).skip((page-1)*limit).limit(limit)
    def verify(self, course: dict):
        # Make sure the course has all the required fields
        # Return True if it does, False otherwise
        required_string_fields = ["University", "City", "Country", "CourseName", "CourseDescription", "Currency"]
        required_date_fields = ["StartDate", "EndDate"] # format: "YYYY-MM-DD"
        required_price_fields = ["Price"]
        for field in required_string_fields:
            if field not in course:
                return False
        for field in required_date_fields:
            if field not in course:
                return False
            # check if the date is in the correct format of YYYY-MM-DD
            if len(course[field]) != 10:
                return False
            # do regex check here to make sure it is equal to YYYY-MM-DD
            if not re.match(r"\d{4}-\d{2}-\d{2}", course[field]):
                return False
        for field in required_price_fields:
            if field not in course:
                return False
            # check if the price is a number
            if not isinstance(course[field], (int, float)):
                return False
        return True
    def update(self, course_id: str, course: dict):
        # verify the course
        if not self.verify(course):
            return False
        self.collection.update_one({"course_id": course_id}, {"$set": course})
    def delete(self, course_id: str):
        self.collection.delete_one({"course_id": course_id})
    def add(self, course: dict):
        # add createdAt field with current timestamp
        course["createdAt"] = pymongo.Timestamp.utcnow()
        # verify the course
        if not self.verify(course):
            return False
        self.collection.insert_one(course)
        return True
