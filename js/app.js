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
var places = ko.observableArray();
var mapViewModel = new MapViewModel()
ko.applyBindings(mapViewModel);

// place constructor
function place(title, position, type) {
    var self = this;
    self.title = title;
    self.type = type;
    self.position = position;
};

// create places and pusth to array
for (var i = 0; i < locations.length; i++) {
  var position = locations[i].coordinates;
  var title = locations[i].title;
  var type = locations[i].type;
  places.push(new place(title, position, type));
}

// initialising places
function MapViewModel() {
    var self = this;
    self.filter = ko.observable("All");
    self.Activities = ["All", "Action", "Food", "Rest", "Social", "Events"];
    self.places = places;
    self.selectPlace = function(place) {
       place.marker.setAnimation(4);
       populateInfoWindow(place.marker, self.infoWindow);
       self.map.panTo(place.marker.getPosition());
   };
   // will run function if filter value changes exculding the initialising
    self.filter.subscribe (function() {
      // console.log(self.filter())
      hideplaces(self.places);
      showplaces(self.places, self.filter());
    });
}

// initialising map
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.882600, lng: 151.204825},
    zoom: 13,
    mapTypeControl: false
  });


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
    mapViewModel.places()[i].marker = marker;
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
  }
  showplaces(mapViewModel.places, "All");
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    var ll_str = marker.position.lat() + ',' + marker.position.lng();
    var id_str = "K4YEDORKJIH5FLLSADFTLBO5V43S0WJ1M3KGCGOL01QQPRTG";
    var secret_str = "FGFSEHNPR340ONMRYJFV04MF01VCAD5G1CEDVILQKEVP42D5";
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/search',
        dataType: 'json',
        data: {
            client_id: id_str,
            client_secret: secret_str,
            limit: 1,
            ll: ll_str,
            query: marker.title,
            v: 20170718,
            async: true
        }
    }).done(function (response) {
        fsquResponse = response.response.venues[0];
        // console.log(fsquResponse)
        infowindow.setContent('<h3>' + marker.title + '</h3>' +
        '<ul>' + (fsquResponse.location.address===undefined?'':fsquResponse.location.address) + '</ul>' +
        '<ul>' + (fsquResponse.contact.phone===undefined?'':fsquResponse.contact.phone) + '</ul>' +
        '<a href="' + fsquResponse.url + '">' + (fsquResponse.url===undefined?'':fsquResponse.url) + '</a>'
        );
    }).fail(function (response, status, error) {
        infowindow.setContent('<div>' + 'Unable to find information' + '</div>'
        );
    });

    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
  }
}


// This function will loop through the markers array and display them all.
function showplaces(places, type) {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < places().length; i++) {
    p = places()[i]
    if (p.type == type || type == 'All'){
      p.marker.setMap(map);
    }
    bounds.extend(p.marker.position);
  }
  map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.
function hideplaces(places) {
  for (var i = 0; i < places().length; i++) {
    places()[i].marker.setMap(null);
  }
}