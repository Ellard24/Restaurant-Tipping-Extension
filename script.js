
var markersArray = [];
var server_address = "http://52.34.117.11:3211/";
var currentWindow;
var currentMarker;

function createColoredMarker(place, color, rmap){
  result = new google.maps.Marker({
    map: rmap,
    position: place.geometry.location,
    title: place.name,
    icon: {
      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      scale: 4,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 0.8,
    }
  });

  console.log(place.id);

  result.info = function(x){ 
    return new google.maps.InfoWindow({
      content: '<b>'+x.name + 
      '</b><br>' + x.vicinity + 
      '<br><br><div id="tip_info"></div>' +
      '<input id="notips" type="button" value="No Tipping" onclick="">     '+
      '<input id="tips" type="button" value="Tipping Allowed">' +
      '<input id="placeId" type="hidden" value="'+x.id+'">'
    });
  }(place);

  return result;
}

function bindWindowNoData(){
  console.log("Loaded");
  var tipButton = document.getElementById("tips");
  var noTipButton = document.getElementById("notips");
  var placeID = document.getElementById("placeId").value;
  if(tipButton){
    tipButton.addEventListener("click", function(){
      var tippingData = {
        location_id: placeID,
        tipping: 1
      }
      console.log("YES");
      console.log(placeID);
      var req = new XMLHttpRequest();
      req.open('POST', server_address + "add", true);
      req.setRequestHeader('Content-Type', 'application/json');
              
      req.send(JSON.stringify(tippingData));

      currentMarker.setIcon(null);

      currentMarker.setIcon({
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 4,
        strokeWeight: 1,
        fillColor: 'red',
        fillOpacity: 0.8,
      });
      tipButton.remove();
      noTipButton.remove();
      document.getElementById("tip_info").innerHTML = "Please inform establishment of the ethical<br>implications of tipping.";
    });
  }

  if(noTipButton){
    noTipButton.addEventListener("click", function(){
      var tippingData = {
        'location_id': placeID,
        'tipping': 0
      }
      console.log("NO");
      console.log(placeID);
      var req = new XMLHttpRequest();
      req.open('POST', server_address + "add", true);
      req.setRequestHeader('Content-Type', 'application/json');
      console.log(tippingData);
      req.send(JSON.stringify(tippingData));


      currentMarker.setIcon(null);

      currentMarker.setIcon({
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 4,
        strokeWeight: 1,
        fillColor: 'green',
        fillOpacity: 0.8,
      });

      tipButton.remove();
      noTipButton.remove();
      document.getElementById("tip_info").innerHTML = "This establishment has eliminated the<br>unethical practice of tipping.<br>"+
        "<br>Congratulate them with your buisness!<br>";
    });
  }
}

function assessMarker(place, map){
  /************************************************************
    QUERY FOR PLACE HERE
  *************************************************************/
  var placeID = place.id;
  var tippingSearch = {
    location_id: placeID
  }

  var req = new XMLHttpRequest();
  req.open('POST', server_address + "show_tip", true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.send(JSON.stringify(tippingSearch));

  var queryResult;

  req.addEventListener('load',function(){
    if(req.status >= 200 && req.status < 400){
        var response = JSON.parse(req.responseText);
        if(typeof(response) != undefined){
            queryResult = response.value;
            console.log(queryResult);
            markerHelper(place, map, queryResult);
        } else{
            context = "ERROR";
        }
    } else {
        console.log("Error in network request: " + request.statusText);
  }});
}

function markerHelper(place, map, queryResult){

  if(queryResult == null){
            var marker = createColoredMarker(place, 'gray', map);

            google.maps.event.addListener(marker, 'click', function(){
              currentMarker = this;
              if(typeof currentWindow !== "undefined"){
                currentWindow.close();
              }
              var marker_map = this.getMap();
              this.info.open(marker_map, this);
              google.maps.event.addListener(marker.info, 'domready', bindWindowNoData());
              currentWindow = this.info;
            });

            markersArray.push(marker);
          }else if(queryResult){      
            var marker = createColoredMarker(place, 'red', map);

            marker.info = function(x){ 
              return new google.maps.InfoWindow({
                content: '<b>'+x.name + 
                  '</b><br>' + x.vicinity + 
                  '<br><br><div id="tip_info">Please inform establishment of the ethical<br>implications of tipping.</div>' +
                  '<br><input id="dispute" type="button" value="Dispute">     '+
                  '<input id="placeId" type="hidden" value="'+x.id+'">'
              });
            }(place);

            google.maps.event.addListener(marker, 'click', function(){
              currentMarker = this;
              if(typeof currentWindow !== "undefined"){
                currentWindow.close();
              }
              var marker_map = this.getMap();
              this.info.open(marker_map, this);
              currentWindow = this.info;
            });

            google.maps.event.addListener(marker.info, 'domready', function(){
              console.log("Loaded");
              var disputeButton = document.getElementById("dispute");
              var placeID = document.getElementById("placeId").value;
              if(disputeButton){
                disputeButton.addEventListener("click", bindWindowWithData());
              }
            });

            markersArray.push(marker);
          }else if(!queryResult){
            var marker = createColoredMarker(place, 'green', map);

            marker.info = function(x){ 
              return new google.maps.InfoWindow({
                content: '<b>'+x.name + 
                  '</b><br>' + x.vicinity + 
                  '<br><br><div id="tip_info">This establishment has eliminated the<br>unethical practice of tipping.<br>'+
                  '<br>Congratulate them with your buisness!</div>' +
                  '<input id="dispute" type="button" value="Dispute">     '+
                  '<input id="placeId" type="hidden" value="'+x.id+'">'
              });
            }(place);

          google.maps.event.addListener(marker, 'click', function(){
              currentMarker = this;
            if(typeof currentWindow !== "undefined"){
              currentWindow.close();
            }
            var marker_map = this.getMap();
            this.info.open(marker_map, this);
            currentWindow = this.info;
          });

          google.maps.event.addListener(marker.info, 'domready', function(){
            console.log("Loaded");
            var disputeButton = document.getElementById("dispute");
            var placeID = document.getElementById("placeId").value;
            if(disputeButton){
              disputeButton.addEventListener("click", bindWindowWithData());
            }
          });
          markersArray.push(marker);
        }


}



function bindWindowWithData(){
  console.log("Loaded");
  var disputeButton = document.getElementById("dispute");
  var placeID = document.getElementById("placeId").value;
  if(disputeButton){
    disputeButton.addEventListener("click", function(){
      var tippingData = {
        location_id: placeID,
      }
      console.log("YES");
      console.log(placeID);
      var req = new XMLHttpRequest();

      req.open('POST', server_address + "remove", true);
      req.setRequestHeader('Content-Type', 'application/json');

      req.send(JSON.stringify(tippingData));

      currentMarker.setIcon(null);

      currentMarker.setIcon({
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 4,
        strokeWeight: 1,
        fillColor: 'gray',
        fillOpacity: 0.8
      });

      disputeButton.remove();

      document.getElementById("tip_info").innerHTML = "Logged discrepency. Thank you!";
    });
  }
}

function clearMarkers(){
  for(i = 0; i < markersArray.length; i++){
    markersArray[i].setMap(null);
  }
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3,
    center: {lat: 41.8781, lng: -87.6298} 
  });

  var geocoder = new google.maps.Geocoder();

  map.setMapTypeId(google.maps.MapTypeId.TERRAIN);

  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
  });
}

function geocodeAddress(geocoder, resultsMap) {
  clearMarkers();
  var address = document.getElementById('address').value;
  var searchLocation;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {

      resultsMap.panTo(results[0].geometry.location);
      resultsMap.setZoom(15);
      searchLocation = results[0].geometry.location;
      var marker = new google.maps.Marker({
      map: resultsMap,
      position: results[0].geometry.location,
      title: "Your Location",
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        fillColor: 'gold',
        fillOpacity: 0.8,
        scale: 4,
        strokeWeight: 1,
      }
      });

    markersArray.push(marker);
  }
  var request = {
    location: searchLocation,
    radius: '700',
    types: ['restaurant', 'bar']
  };

  var service = new google.maps.places.PlacesService(resultsMap);

  service.nearbySearch(request, function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {

      for (var i = 0; i < results.length; i++) { 
        var place = function(x, resultsArr){
          return resultsArr[x];
        }(i, results);
        assessMarker(place, resultsMap);
      }

    } else {
        alert('Geocode was not successful for the following reason: ' + status);
    }
  });
  });
}







