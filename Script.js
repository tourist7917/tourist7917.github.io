/// <reference path="./JS/jquery.d.ts" />
/// <reference path="./JS/knockoutJS.d.ts" />
/// <reference path="./JS/SammyJS.d.ts" />

var self;
var select = document.getElementById('selectFilter');
// select.addEventListener('input', function () {
//     if (parseInt(select.value) === 2) {
//         document.getElementById('endDest').className = '';
//         document.getElementById('startDate').className = '';
//     }
//     else {
//         document.getElementById('endDest').className = 'hidden';
//         document.getElementById('startDate').className = 'hidden';
//     }
// });

function handleError(error) {
    console.log(error);
    $("#alertModal").modal('open');
    document.getElementById('alertModalContent').innerText = 'Error Occurred';
}


function userObject(user) {
    this.userName = user.username;
    this.email = user.email;
    this.phone = user.phone;
    this.fullName = user.name;
}

function getWeatherLatLong(lat_long) {
    console.log(lat_long);
    $.ajax({
        url: 'https://turistas.herokuapp.com/turistas/v1/weather-days/worthless/notvalid',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ location: lat_long, days: 7 }),
        success: function (responseData) {
            self.currentWeather.removeAll();
            console.log(responseData);
            responseData.list.forEach(function (value) {
                self.currentWeather.push(value);
            });
            getHotelsGeo(lat_long);
        },
        error: function (error) {
            handleError(error);
            getHotelsGeo(lat_long);
        }
    });
}

function getHotelsGeo(lat_long) {
    console.log(lat_long);
    $.ajax({
        url: 'https://turistas.herokuapp.com/turistas/v1/hotels-range',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify({ lat_long: lat_long }),
        success: function (responseData) {
            self.currentHotels.removeAll();
            responseData.forEach(function (value) {
                if (value.photo_ref === '')
                    value.photo_ref = './Images/imagenotfound.png';
                else
                    value.photo_ref = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=' + value.photo_ref + '&key=AIzaSyCIOrbu49LZHxwdLG9hyJASX647lpel4C8';
                self.currentHotels.push(value);
            });
            getRestaurantsGeo(lat_long);
        },
        error: function (error) {
            handleError(error);
            getRestaurantsGeo(lat_long);
        }
    });
}

function getRestaurantsGeo(lat_long) {
    console.log(lat_long);
    $.ajax({
        url: 'https://turistas.herokuapp.com/turistas/v1/restaurants',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(lat_long),
        success: function (responseData) {
            self.currentRestaurants(responseData);
        },
        error: function (error) {
            handleError(error);
        }
    });
}


function mainController() {
    self = this;
    self.currentUser = ko.observable();

    self.currentPlaces = ko.observableArray();
    self.placesText = ko.observable("Best Places To Visit In India");
    self.selectedPlace = ko.observable();

    self.detailedView = ko.observable(false);

    self.currentFlights = ko.observableArray();

    self.currentHotels = ko.observableArray();
    self.currentWeather = ko.observableArray();
    self.currentRestaurants = ko.observableArray();

    self.registerUser = function () {
        var username = document.getElementById('usernameRegister').value;
        var password = document.getElementById('passwordRegister').value;
        var phone = document.getElementById('phone').value;
        var email = document.getElementById('email').value;
        var fullName = document.getElementById('fullName').value;

        if (username.trim() === '' || password.trim() === '' || phone.trim() === '' ||
            email.trim() === '' || fullName.trim() === '') {
            $("#alertModal").modal('open');
            document.getElementById('alertModalContent').innerText = 'Submission Fields cannot be blank!!!';
            return;
        }

        username = username.toLowerCase();
        var dataSet = {
            username: username,
            phone: phone,
            password: password,
            email: email,
            name: fullName
        };
        $.ajax({
            url: 'https://turistas.herokuapp.com/turistas/v1/new-user',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify(dataSet),
            success: function (data) {
                $("#alertModal").modal('open');
                document.getElementById('alertModalContent').innerText = data.message;
            },
            error: function (error) {
                handleError(error);
            }
        });
    };

    self.loginUser = function () {
        var userName = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        if (userName.trim() === '' || password.trim() === '') {
            $("#alertModal").modal('open');
            document.getElementById('alertModalContent').innerText = 'Submission Fields cannot be blank!!!';
            return;
        }

        userName = userName.toLowerCase();

        $.ajax({
            url: 'https://turistas.herokuapp.com/turistas/v1/login',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({ username: userName, password: password }),
            success: function (data) {
                if (data.status) {
                    self.currentUser(new userObject(data));
                    $("#alertModal").modal('open');
                    document.getElementById('alertModalContent').innerText = 'Successfully Logged In!!!';
                }
                else {
                    $("#alertModal").modal('open');
                    document.getElementById('alertModalContent').innerText = data.message;
                }
            },
            error: function (error) {
                handleError(error);
            }
        });
    };

    self.logoutUser = function () {
        select.currentUser(null);
    };

    self.executeScript = function (data, event) {
        if (event.keyCode === 13) {
            var selectValue = parseInt(select.value);
            if (selectValue === 3)
                self.activatePlaces();
            else if (selectValue === 0)
                self.getRestaurants();
            else if (selectValue === 1)
                self.getHotels();
            else
                self.getFlights();
        }
    };

    self.getFlights = function () {
        var startDate = document.getElementById('startDate').value;
        var place = document.getElementById('userText').value;
        var endDest = document.getElementById('endDest').value;

        var dataSet = {
            start: place,
            end: endDest,
            out_date: startDate,
        };
        $.ajax({
            url: 'https://turistas.herokuapp.com/turistas/v1/flights',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dataSet),
            success: function (data) {
                self.currentFlights(data);
                $("#flightModal").modal('open');
            },
            error: function (error) {
                handleError(error);
            }
        });

    };

    self.getHotels = function () {
        var place = document.getElementById('userText').value;
        $.ajax({
            url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + place + '&sensor=false',
            type: 'GET',
            success: function (data) {
                var latitude = data.results[0].geometry.location.lat;
                var longitude = data.results[0].geometry.location.lng;
                var lat_long = {
                    latitude: latitude,
                    longitude: longitude
                };
                $.ajax({
                    url: 'https://turistas.herokuapp.com/turistas/v1/hotels-range',
                    contentType: 'application/json',
                    type: 'POST',
                    data: JSON.stringify({ lat_long: lat_long }),
                    success: function (responseData) {
                        self.currentHotels.removeAll();
                        responseData.forEach(function (value) {
                            if (value.photo_ref === '')
                                value.photo_ref = './Images/imagenotfound.png';
                            else
                                value.photo_ref = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=' + value.photo_ref + '&key=AIzaSyCIOrbu49LZHxwdLG9hyJASX647lpel4C8';
                            self.currentHotels.push(value);
                            $("#hotelsModal").modal('open');
                        });
                    },
                    error: function (error) {
                        handleError(error);
                    }
                });
            },
            error: function (error) {
                handleError(error);
            }
        });
    };

    self.getRestaurants = function () {
        var place = document.getElementById('userText').value;
        $.ajax({
            url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + place + '&sensor=false',
            type: 'GET',
            success: function (data) {
                var latitude = data.results[0].geometry.location.lat;
                var longitude = data.results[0].geometry.location.lng;
                var lat_long = {
                    latitude: latitude,
                    longitude: longitude
                };
                $.ajax({
                    url: 'https://turistas.herokuapp.com/turistas/v1/restaurants',
                    contentType: 'application/json',
                    type: 'POST',
                    data: JSON.stringify(lat_long),
                    success: function (responseData) {
                        self.currentRestaurants(responseData);
                        $("#restaurantsModal").modal('open');
                    },
                    error: function (error) {
                        handleError(error);
                    }
                });
            },
            error: function (error) {
                handleError(error);
            }
        });
    };

    self.activatePlaces = function () {
        var placeName = document.getElementById('userText').value;
        self.placesText("Best Places To Visit In " + placeName);
        if (placeName.trim() === '') {
            $("#alertModal").modal('open');
            document.getElementById('alertModalContent').innerText = 'Submission Fields cannot be blank!!!';
            return;
        }
        self.getPlaces(placeName);
    };

    self.getPlaces = function (placeName) {
        location.hash = '/locations/' + placeName;
    };

    self.displayDetails = function (data) {
        console.log(data);
        self.selectedPlace(data);
        self.detailedView(true);

        location.hash = '/location/detail';
    };

    Sammy(function () {

        this.get('/location/detail', function () {
            self.currentPlaces.removeAll();
            // console.log(self.selectedPlace)
            getWeatherLatLong(self.selectedPlace().location);
        });

        this.get('/locations/:placeName', function () {
            self.detailedView(false);
            var placeName = this.params.placeName;
            $.ajax({
                url: 'https://turistas.herokuapp.com/turistas/v1/points-of-interest',
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify({ place_name: placeName }),
                success: function (data) {
                    self.currentPlaces.removeAll();
                    data.forEach(function (value) {
                        if (value.photo_ref === '')
                            value.photo_ref = './Images/imagenotfound.png';
                        else
                            value.photo_ref = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=' + value.photo_ref + '&key=AIzaSyCIOrbu49LZHxwdLG9hyJASX647lpel4C8';
                        self.currentPlaces.push(value);
                    });
                },
                error: function (error) {
                    handleError(error);
                }
            });
        });

        this.get('', function () {
            self.getPlaces('India');
        });

    }).run();
}

ko.applyBindings(new mainController());