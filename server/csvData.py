import pandas as pd
from server.config import Config

class CSV:
    def __init__(self):
        self.config = Config()
        self.csvURI = self.config.csvURI()
        self.get()
    def get(self):
        print("Getting CSV data...")
        self.data = pd.read_csv(self.csvURI)
        # add a createdAt timestamp to every entry
        self.data['createdAt'] = pd.Timestamp.utcnow()
        print("CSV data has been retrieved...")
        return self.data
    def __str__(self): 
        # only show the first 5 rows and column names as it is just for testing
        return self.data.head(5).to_string()
    def dict(self):
        return self.data.to_dict('records')
