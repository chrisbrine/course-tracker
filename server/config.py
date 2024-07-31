import os, dotenv

class Config:
    def __init__(self):
        dotenv.load_dotenv()
    def pages(self):
        # if not set, default to 10
        pages = os.getenv('UNIVERSITY_PAGES')
        if pages == None:
            return 10
        return int(pages)
    def csvURI(self):
        return os.getenv('CSV_UNIVERSITY_URI')
    def dbURI(self):
        return os.getenv('UNIVERSITY_MONGO_DB_URI')
    def dbExpire(self):
        # if expire is not set, default to 600 seconds otherwise convert to int
        expire = os.getenv('UNIVERSITY_MONGO_DB_EXPIRE_SECONDS')
        if expire == None:
            return 600
        return int(expire)
    def dbTable(self):
        # if not set, default to university
        table = os.getenv('UNIVERSITY_MONGO_DB_TABLE')
        if table == None:
            return 'university'
        return table
    def dbCollection(self):
        # if not set, default to courses
        collection = os.getenv('UNIVERSITY_MONGO_DB_COLLECTION')
        if collection == None:
            return 'courses'
        return collection
