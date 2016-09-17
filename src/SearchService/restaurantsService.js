var GooglePlacesAPI = require('google-places');
var _ = require('lodash');

var RestaurantsService = {};

var sortRestaurants = function (restaurant1, restaurant2) {

  var rating1 = restaurant1.rating;
  var rating2 = restaurant2.rating;

  if (rating1 < rating2) {
    return 1;
  } else if (rating1 == rating2) {
    return 0;
  } else if (rating1 > rating2) {
    return -1;
  }

};

function getPlaces(api, searchCriteria) {
  
  return new Promise(function (resolve) {

    api.search(searchCriteria, function(err, res) {

      if (err || res.status != "OK") {

        // Resolve with no places
        resolve([]);

      } else {

        // Resolve with the places
        resolve(res.results)
      }

    });

  });

};

function getDetails(api, placeId){
  
  return new Promise(function (resolve) {

    api.details({placeid: placeId}, function (err, res) {

      if (err) {
        
        resolve(null);
        return;

      } else if (res.status != "OK") {
        
        resolve(null);
        return;

      } else {
        
        resolve({
          "name" : res.result.name,
          "rating" : res.result.rating,
          "website" : res.result.website || null,
          "googleUrl" : res.result.url || null
        });

      }

    });

  });

};

/**
 * Return a set of restraunts
 */
RestaurantsService.find = function (request) {

  return new Promise(function (resolve) {
    
    // Create a new instance of the Google Places API
    var api = new GooglePlacesAPI('AIzaSyDJxv_zb4nnlWEaOeVXZC5iXUQRKSKN5uI');

    // Build the search criteria for Google Places API
    var searchCriteria = {
      "radius" : 11265.4, // Look within 10 mile radius of location?
      "type" : "restaurant", // We only want restaurants
      "keyword" : request.entities.foodType[0],
      "location" : request.location || request.defaultLocation,
      "maxprice" : 2,
      "minprice" : 0
    };

    // Get the places given search criteria
    getPlaces(api, searchCriteria).then(function (places) {

      if (places.length == 0) {
        // If there are no places, resolve the request
        resolve(request);
      }

      // Build an array of details promises
      var detailsPromises = [];

      // Go through each place
      places.forEach(function (place) {
        // Create an array of promises to get restaurant details
        detailsPromises.push(getDetails(api, place.place_id));
      });

      // Wait for all place details to be fetched
      Promise.all(detailsPromises).then(function (placeDetails) {

        // Filter out the null values
        var restaurants = _.filter(placeDetails, _.isObject);

        // Sort the restaurants
        restaurants.sort(sortRestaurants);

        // Add the top three restaurants to the request
        request.restaurants = restaurants.slice(0, 3);

        // Resolve the request
        resolve(request);

      });

    });

  });

};

module.exports = RestaurantsService;