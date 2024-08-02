# an object class that takes ../assets/currency.json and turns it into a dictionary
# Allows for getting all country codes, or get the currency for a given country code

import json

class CountryCodes:
    def __init__(self):
        with open('assets/currency.json') as f:
            self.data = json.load(f)
    
    def all(self):
        # return the keys only
        return list(self.data.keys())
    
    def get(self, code):
        return self.data[code] if code in self.data else None
