import bson
import pymongo
import pandas as pd
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
        # set text index on CourseName, CourseDescription, University, City, Country
        self.collection.create_index([("CourseName", "text"), ("CourseDescription", "text"), ("University", "text"), ("City", "text"), ("Country", "text")])
        self.checkData()
    def checkData(self):
        # if data in collection has entries, then return
        if self.collection.count_documents({}) > 50:
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
    def cursorToList(self, cursor):
        result = []
        # result = [next(cursor, None) for _ in range(len(list(cursor)))]
        while True:
            item = {}
            current = next(cursor, None)
            if current is None:
                break
            item['_id'] = str(current['_id'])
            item['University'] = current['University']
            item['City'] = current['City']
            item['Country'] = current['Country']
            item['CourseName'] = current['CourseName']
            item['CourseDescription'] = current['CourseDescription']
            item['Currency'] = current['Currency']
            item['StartDate'] = current['StartDate']
            item['EndDate'] = current['EndDate']
            item['Price'] = current['Price']
            result.append(item)
        return result
    def autocomplete(self, field: str, query: str, limit: int = 5):
        # Use aggregate to get unique values of a field that match the search query
        # limit number of results to limit value
        self.checkData()
        queryString = {"$match": {field: {"$regex": query, "$options": "i"}}}
        result = self.collection.aggregate([queryString, {"$group": {"_id": "$"+field}}, {"$limit": limit}])
        data = []
        for item in result:
            data.append(item["_id"])
        return data
    def search(self, query: str):
        # The query can search for any field in the database
        # Return the number of pages that match the query
        self.checkData()
        queryString = {"$text": {"$search": query}}
        return self.collection.count_documents(queryString)
    def search_page(self, query: str, page: int, limit: int, sort_by: str):
        # The query can search for any field in the database
        # Return the page of results that match the query
        self.checkData()
        queryString = {"$text": {"$search": query}}
        result = self.collection.find(queryString).sort(sort_by).skip((page-1)*limit).limit(limit)
        return self.cursorToList(result)
    def number_of_pages(self):
        self.checkData()
        return self.collection.count_documents({})
    def page(self, page: int, limit: int, sort_by: str):
        self.checkData()
        result = self.collection.find().sort(sort_by).skip((page-1)*limit).limit(limit)
        return self.cursorToList(result)
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
        self.checkData()
        # verify the course
        if not self.verify(course):
            return False
        # remove CourseName, University, Country and City from course
        # as they are not allowed to be updated
        course.pop("CourseName", None)
        course.pop("University", None)
        course.pop("Country", None)
        course.pop("City", None)
        obj_id = bson.ObjectId(course_id)
        self.collection.update_one({"_id": obj_id}, {"$set": course})
        return True
    def delete(self, course_id: str):
        self.checkData()
        print("Deleting course with id: " + course_id)
        obj_id = bson.ObjectId(course_id)
        self.collection.delete_one({"_id": obj_id})
    def add(self, course: dict):
        self.checkData()
        # add createdAt field with current timestamp
        course["createdAt"] = pd.Timestamp.utcnow()
        # verify the course
        if not self.verify(course):
            return False
        self.collection.insert_one(course)
        return True
