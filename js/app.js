/* ======= Model ======= */
var locations = [
  {title: 'Newtown Hotel', coordinates: {lat: -33.894295, lng: 151.182851}, type: "Social"},
  {title: 'Bondi Beach', coordinates: {lat: -33.891071, lng: 151.276666}, type: "Rest"},
  {title: 'Ippudo', coordinates: {lat: -33.869757, lng: 151.208893}, type: "Food"},
  {title: 'Opera house', coordinates: {lat: -33.856775, lng: 151.215307}, type: "Events"},
  {title: 'BridgeClimb Sydney', coordinates: {lat: -33.857491, lng: 151.207839}, type: "Action"},
  {title: 'The Lobo Plantation', coordinates: {lat: -33.869964, lng: 151.205168}, type: "Social"}
];

/* ======= ModelView ======= */
var map;
var markers = [];

function place(title, position, type) {
    var self = this;
    self.title = title;
    self.type = type;
    self.position = position;
};

var places = ko.observableArray();

for (var i = 0; i < locations.length; i++) {
  var position = locations[i].coordinates;
  var title = locations[i].title;
  var type = locations[i].type;
  places.push(new place(title, position, type));
}


/* ======= View ======= */
function MapViewModel() {
    var self = this;
    self.filter = ko.observable("All");
    self.Activities = ["All", "Action", "Food", "Rest", "Social", "Events"];
    self.places = places;
    self.bouncePlace = function(place) {
       place.marker.setAnimation(4);
       populateInfoWindow(place.marker, self.infoWindow);
       self.map.panTo(place.marker.getPosition());
   }
    self.moreInfo = function(place) {
       // get info from foursquare
   }
}

var mapViewModel = new MapViewModel()
ko.applyBindings(mapViewModel);

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.882600, lng: 151.204825},
    zoom: 13,
    mapTypeControl: false
  });

  // These are the real estate listings that will be shown to the user.
  // Normally we'd have these in a database instead.

  var largeInfowindow = new google.maps.InfoWindow();
  mapViewModel.map = map
  mapViewModel.infoWindow = largeInfowindow;

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].coordinates;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    mapViewModel.places()[i].marker = marker;
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
  }
  showplaces();
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>' +
        '<div><input type=\"button\" value=\"More Info\" onclick =' +
        '\"displayInfo(&quot;'+'&quot;);\"></input></div>'
      );
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
  }
}

// Display info from four
function displayInfo(place) {
  var ll_str = str(place.position.lat) + ',' + str(place.position.lng);
  var id_str = "K4YEDORKJIH5FLLSADFTLBO5V43S0WJ1M3KGCGOL01QQPRTG";
  var secret_str = "FGFSEHNPR340ONMRYJFV04MF01VCAD5G1CEDVILQKEVP42D5";
  var version = "20170701";
  // var fourSquURL = https:"https://api.foursquare.com/v2/venues/search?ll=" +
  //   ll_str + "&limit=1&client_id=" + id_str + " &client_secret=" + secret_str +
  //   "&v=" + version;
}

// This function will loop through the markers array and display them all.
function showplaces() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// This function will loop through the markers array and display them all.
function bounceMarker(marker) {
  marker.setAnimation(google.maps.Animation.BOUNCE);
}


// This function will loop through the listings and hide them all.
function hideplaces() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}