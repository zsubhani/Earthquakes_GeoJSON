// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Define a function that we will output color in hex format based on the magnitude value of the earthquake
//
// 5+ magnitude, will have #990033 which is a dark purple color
// 4-5 magnitude will have #ff3300 which is red color
// 3-4 magnitude will have #cc6600 which is a dark orange color
// 2-3 magnitude will have #ff9900 which is a light orange color
// 1-2 magnitude will have #ffff66 which is a light yellow color
// 0-1 magnitude will have #99ff33 which is a light green color
function getColor(d) {
  console.log("Inside getColor. value of d is: ", d);
  return d > 5 ? '#990033' :
         d > 4  ? '#ff3300' :
         d > 3  ? '#cc6600' :
         d > 2  ? '#ff9900' :
         d > 1   ? '#ffff66' :
                    '#99ff33';
}

// Define a function that will output radius in pixels based on the magnitude of the earthquake
//
// 5+ magnitude will have radius of 40
// 4-5 magnitude will have radius of 30
// 3-4 magnitude will have radius of 20
// 2-3 magnitude will have radius of 15
// 1-2 magnitude will have radius of 10
// 0-1 magnitude will have radius of 5
function getRadius(d) {
return d > 5 ? 40 :
       d > 4  ? 30 :
       d > 3  ? 20 :
       d > 2  ? 15 :
       d > 1   ? 10 :
                  5;
}

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place, magnitude and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>" +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Use the pointToLayer function to create a circleMarker instead of the standard marker
  // radius of each circle marker will be output of the getRadius function passing in the magnitude value
  function pointToLayer(feature, latlng) {
    console.log("Inside pointToLayer", feature);

    var geojsonMarkerOptions = {
      radius: getRadius(feature.properties.mag),
    };
    return L.circleMarker(latlng, geojsonMarkerOptions);
  }

  // Use the style function to style each circle marker
  // the fillcolor will be output of getColor function passing in the magnitude value
  function style(feature) {
    return {
      fillColor: getColor(feature.properties.mag),
      weight: 2,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.8
    };
  }


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  // Run the pointToLayer function once for each piece of data in the array
  // Run the style function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer,
    style: style
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// Set up the legend in the bottom right position
var legend = L.control({position: 'bottomright'});

legend.onAdd = function () {
    // create 'info legend' div element
    var div = L.DomUtil.create('div', 'info legend'),
    // set up the legend intervals by magnitudes (0-1, 1-2, 2-3, 4-5, 5+)
    magnitudes = [0, 1, 2, 3, 4, 5],
    // create array called labels and start with text 'Magnitudes:'
    labels = ['Magnitudes:'];

    // loop through magnitudes intervals and generate a label with a colored square for each interval
    for (var i = 0; i < magnitudes.length; i++) {
        div.innerHTML +=
            labels.push(
              '<li style="background:' + getColor(magnitudes[i] + 1) + '"></li> ' +
            magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+'));
}
    div.innerHTML = labels.join('<br>');
return div;
};
legend.addTo(myMap);





}
