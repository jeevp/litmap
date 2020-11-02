mapboxgl.accessToken = 'pk.eyJ1IjoiamVldiIsImEiOiJjazl4Z3ZzdngwazRvM25tcjZ6a3RzMDd0In0.w2ebSrTswzuf-tbgQ7oxfQ'

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [0, 25],
  zoom: 1
});

var app = new Vue({
  el: '#app',
  delimiters: ['[[', ']]'],
  data: {
    session: false,
    uploadType: '',
    file: null,
    source: null,
    url: '',
    locations: [],
    markers: [],
    locationsData: []
  },

  methods: {
    handleFileUpload(evt) {
      var files = evt.target.files; // FileList object
      for (var i = 0, f; f = files[i]; i++) {
        if (!f.type.match('text.*')) {
          continue;
        }
        var reader = new FileReader();
        reader.onload = (function(theFile) {
          return function(e) {
            app.source = e.target.result;
          };
        })(f);
        reader.onloadend = function () {
          console.log("file is uploaded");
        };
        reader.readAsText(f);
      }
    },
    submitInput() {
      this.session = true
      if (this.uploadType == 'text') {
        this.source = this.$refs.sourceInput.value
        this.getLocations()
      }
      else if (this.uploadType == 'url') {
        this.url = this.$refs.sourceInput.value
        fetch(this.url)
          .then(function(response) {
            response.text().then(function(text) {
              this.session = true
              this.source = text;
              this.getLocations()
            });
          });
      }
      else if (this.uploadType == 'file') {
        this.getLocations()
      }
      else {
        console.log("no valid input");
      }
    },
    submitUrl() {
      fetch(this.url)
        .then(function(response) {
          response.text().then(function(text) {
            this.session = true
            this.source = text;
            this.getLocations()
          });
        });
    },
    clearMap() {
      if (this.markers != null) {
        for (let i = 0; i < this.markers.length; i++) {
          this.markers[i].remove()
        }
      }
      this.locationsData = null
      this.locations = []
    },
    restart() {
      this.session = false
      this.uploadType = ''
      this.clearMap()
    },
    getLocations() {
      console.log("getting locations")
      if (this.source != "") {
        axios({
          method: 'post',
          url: '/api/locations',
          data: { "source": this.source },
        })
        .then(response => {
          console.log(response.data);
          this.locationsData = response.data;

          for (let i = 0; i < this.locationsData.length; i++) {
            var currentLocation = this.locationsData[i]
            this.locations.push(currentLocation)

            var popup = new mapboxgl.Popup({ closeOnClick: false })
              .setLngLat(currentLocation.latlong)
              .setHTML(
                '<h4>' + currentLocation.context + '</h4>' +
                '<p>"...' + 'currentLocation.all_contexts.join("...\"<br>\"...")' + '..."</p>'
              )

            var marker = new mapboxgl.Marker()
              .setLngLat(currentLocation.latlong)
              .setPopup(popup)
              .addTo(map)

            if (currentLocation.place_type == 'country') {
              console.log(currentLocation.text + " is a country");
            }
            this.markers.push(marker)
          }

          console.log("done");
        })
        .catch((error) => {
          console.log('error: ' + error)
        });
      }
      else {
        alert("Input is empty!");
      }
    },
    flyToLocation(location) {
      map.flyTo({
        center: location.latlong,
        essential: true,
        zoom: 4
      });
    }
  }
})
