import os

# flask imports
from flask import Flask, request, render_template, make_response, jsonify
from flask_restful import Resource, Api
# from flask_cors import CORS

import geocoder

import spacy

MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiamVldiIsImEiOiJjazl4Z3ZzdngwazRvM25tcjZ6a3RzMDd0In0.w2ebSrTswzuf-tbgQ7oxfQ'

app = Flask(__name__)
# CORS(app)
api = Api(app)

class Location:
    def __init__(self, text, label):
        self.text = text
        self.label = label
        l = geocoder.mapbox(self.text, key=MAPBOX_ACCESS_TOKEN)
        self.latlong = l.latlng if l.json else []
        self.place_type = l.json["raw"]["place_type"] if l.json else ''
        
class LocationMap(Resource):
    def post(self):
        data = request.get_json()
        raw_text = data['source']
        nlp = spacy.load("en_core_web_sm")
        doc = nlp(raw_text)

        print(raw_text)

        locations = []
        
        for ent in doc.ents:
            if (ent.label_) is 'GPE':
                l = Location(ent.text, ent.label_)
                locations.append(l)

        # location_map = LocationMap(locations)
        # location_map.hello()
        # # coded_locations = get_locations(data['source'])

        return jsonify([ob.__dict__ for ob in locations])
        
api.add_resource(LocationMap, '/api/locations')

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0',port=int(os.environ.get('PORT', 8080)))