import os
import config

# flask imports
from flask import Flask, jsonify, request

# import geocoder
import spacy
import en_core_web_sm

import requests

app = Flask(__name__)

GOOGLE_MAPS_ACCESS_TOKEN = config.GOOGLE_MAPS_ACCESS_TOKEN

class Location:
    def __init__(self, text, label, context):
        self.text = text
        self.label = label
        self.context = context
        g = self.get_geocode()
        self.latlong = g['geometry']['location'] if g else None
        self.place_name = g['formatted_address'] if g else None
        self.place_type = g['address_components'][0]['types'] if g else None

    def get_geocode(self):
        r = requests.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            params={
                'address': self.text,
                'key': 'AIzaSyACLuoDomujgtH1FgRDALg_eUDdwqDr1cg'
            }
        )
        print(r.json()['results'][0])
        return r.json()['results'][0]
        
@app.route('/api/locations', methods=['POST'])
def get_locations():
    if request.method == 'POST':
        data = request.get_json()
        raw_text = data['source']
        nlp = en_core_web_sm.load()
        doc = nlp(raw_text)

        locations = []
        
        for ent in doc.ents:
            if (ent.label_) is 'GPE':
                l = Location(ent.text, ent.label_, ent.sent.text)
                locations.append(l)

        return jsonify([ob.__dict__ for ob in locations])

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0',port=int(os.environ.get('PORT', 8080)))