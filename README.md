# CourseTracker

This project will track a given set of courses from a provided url.

## Requirements

- Angular 17+
- Python 3.10+
- Node 20

## Setting up

- Download the repository
- run: npm install
- run: npx build
- run: pip install pymongo

## Configuration

Create a .env file in the root directory with these settings:

* CSV_UNIVERSITY_URI=(the url to the CSV file)
* UNIVERSITY_MONGO_DB_EXPIRE_SECONDS=(the amount of time, in seconds, for the data to expire)
* UNIVERSITY_MONGO_DB_URI=(the mongo connection string)
* UNIVERSITY_MONGO_DB_TABLE=(the table to use, not required)
* UNIVERSITY_MONGO_DB_COLLECTION=(the collection to use, not required)
* UNIVERSITY_PAGES=(limits to this number of pages, not required)
* UNIVERSITY_APP_PORT=(the port to set it up on, defaults to 3000 not required)

## Running the server

To run the server you just need to run:
* python main.py

This will start the server and you can browse to the host on port 3000.
