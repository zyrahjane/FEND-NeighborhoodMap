/* ======= Model ======= */
var locations = [
  {title: 'Park Ave Penthouse', coordinates: {lat: 40.7713024, lng: -73.9632393}, type: "Action"},
  {title: 'Chelsea Loft', coordinates: {lat: 40.7444883, lng: -73.9949465}, type: "Food"},
  {title: 'Union Square Open Floor Plan', coordinates: {lat: 40.7347062, lng: -73.9895759}, type: "Action"},
  {title: 'East Village Hip Studio', coordinates: {lat: 40.7281777, lng: -73.984377}, type: "Rest"},
  {title: 'TriBeCa Artsy Bachelor Pad', coordinates: {lat: 40.7195264, lng: -74.0089934}, type: "Action"},
  {title: 'Chinatown Homey Space', coordinates: {lat: 40.7180628, lng: -73.9961237}, type: "Rest"}
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

}

var mapViewModel = new MapViewModel()
ko.applyBindings(mapViewModel);

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
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
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
  }
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