const WEATHER_KEY = "c7f221df8f41059fa5f9820f749ebfb9"; 
const COUNTRIES_URL = "https://restcountries.com/v3.1/all?fields=name,flags,capital,region,population,languages,cca2";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";


let allCountries = [];       
let currentCountry = null;   
let wishlist = [];            


fetchAllCountries();
loadWishlistFromStorage();


function fetchAllCountries() {
  fetch(COUNTRIES_URL)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      allCountries = data;
      console.log("Countries loaded:", allCountries.length);
    })
    .catch(function(error) {
      console.log("Error loading countries:", error);
    });
}


function searchCountry() {
  var query = document.getElementById("searchInput").value.trim().toLowerCase();
  var selectedRegion = document.getElementById("regionFilter").value;
  var sortBy = document.getElementById("sortOption").value;

 
  var results = allCountries.filter(function(country) {
    return country.name.common.toLowerCase().includes(query);
  });

  if (selectedRegion !== "") {
    results = results.filter(function(country) {
      return country.region === selectedRegion;
    });
  }

  
  if (sortBy === "name") {
   results = results.slice().sort(function(a, b) {
      return a.name.common.localeCompare(b.name.common);
    });
  } else if (sortBy === "population") {
    results = results.slice().sort(function(a, b) {
      return b.population - a.population;
    });
  }


  if (query === "" && selectedRegion === "") {
    document.getElementById("welcomeMsg").style.display = "block";
    document.getElementById("noResults").style.display = "none";
    document.getElementById("countryResult").style.display = "none";
    return;
  }

  if (results.length === 0) {
    document.getElementById("noResults").style.display = "block";
    document.getElementById("welcomeMsg").style.display = "none";
    document.getElementById("countryResult").style.display = "none";
    return;
  }


  var exactMatch = results.find(function(country) {
    return country.name.common.toLowerCase() === query;
  });

  var chosenCountry = exactMatch || results[0]; 

  currentCountry = chosenCountry;

  displayCountry(chosenCountry);
}

function displayCountry(country) {
  var languageList = "N/A";
  if (country.languages) {
    languageList = Object.values(country.languages).join(", ");
  }

  var capital = country.capital ? country.capital[0] : "N/A";
  var population = country.population.toLocaleString(); 


  document.getElementById("flagImg").src = country.flags.svg || country.flags.png;
  document.getElementById("countryName").textContent = country.name.common;
  document.getElementById("capital").textContent = capital;
  document.getElementById("region").textContent = country.region;
  document.getElementById("population").textContent = population;
  document.getElementById("languages").textContent = languageList;

  updateWishlistButton();


  document.getElementById("countryResult").style.display = "block";
  document.getElementById("welcomeMsg").style.display = "none";
  document.getElementById("noResults").style.display = "none";


  if (capital !== "N/A") {
    fetchWeather(capital);
  }
}


function fetchWeather(city) {
  document.getElementById("weatherCity").textContent = city;
  document.getElementById("weatherLoading").style.display = "block";
  document.getElementById("weatherInfo").style.display = "none";
  document.getElementById("weatherError").style.display = "none";

  var url = WEATHER_URL + "?q=" + city + "&appid=" + WEATHER_KEY + "&units=metric";

  fetch(url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("Weather fetch failed");
      }
      return response.json();
    })
    .then(function(data) {

      var temp = Math.round(data.main.temp);
      var description = data.weather[0].description;
      var humidity = data.main.humidity;
      var windSpeed = Math.round(data.wind.speed * 3.6); 
      var feelsLike = Math.round(data.main.feels_like);

      document.getElementById("weatherTemp").textContent = "🌡️ Temperature: " + temp + "°C (feels like " + feelsLike + "°C)";
      document.getElementById("weatherDesc").textContent = "☁️ Condition: " + description;
      document.getElementById("weatherHumidity").textContent = "💧 Humidity: " + humidity + "%";
      document.getElementById("weatherWind").textContent = "🌬️ Wind: " + windSpeed + " km/h";

      document.getElementById("travelTip").textContent = "🧳 " + getTravelTip(temp, description);

      
      document.getElementById("weatherLoading").style.display = "none";
      document.getElementById("weatherInfo").style.display = "block";
    })
    .catch(function(error) {
      document.getElementById("weatherLoading").style.display = "none";
      document.getElementById("weatherError").style.display = "block";
    });
}



function getTravelTip(temp, description) {
  if (description.includes("rain") || description.includes("drizzle")) {
    return "It's rainy! Bring an umbrella and plan some indoor activities.";
  } else if (description.includes("snow")) {
    return "It's snowy! Pack warm clothes and enjoy the winter scenery.";
  } else if (temp >= 28) {
    return "It's hot! Stay hydrated and use sunscreen.";
  } else if (temp >= 18) {
    return "Great weather! Perfect time to explore outdoors.";
  } else if (temp >= 8) {
    return "It's a bit cool. Bring a light jacket just in case.";
  } else {
    return "It's cold! Pack heavy warm clothing.";
  }
}

function loadWishlistFromStorage() {
  var saved = localStorage.getItem("wanderscope_wishlist");
  if (saved) {
    wishlist = JSON.parse(saved);
  }
  updateWishlistCount();
}

function saveWishlistToStorage() {
  localStorage.setItem("wanderscope_wishlist", JSON.stringify(wishlist));
  updateWishlistCount();
}

function toggleWishlist() {
  if (!currentCountry) return;

  var countryName = currentCountry.name.common;

  var alreadyAdded = wishlist.find(function(item) {
    return item.name === countryName;
  });

  if (alreadyAdded) {
    wishlist = wishlist.filter(function(item) {
      return item.name !== countryName;
    });
    showToast(countryName + " removed from wishlist");
  } else {

    var newItem = {
      name: countryName,
      capital: currentCountry.capital ? currentCountry.capital[0] : "N/A",
      region: currentCountry.region,
      flag: currentCountry.flags.svg || currentCountry.flags.png,
      addedOn: new Date().toLocaleDateString()
    };
    wishlist.push(newItem);
    showToast(countryName + " added to wishlist! ❤️");
  }

  saveWishlistToStorage();
  updateWishlistButton();
}

function removeFromWishlist(countryName) {
  wishlist = wishlist.filter(function(item) {
    return item.name !== countryName;
  });
  saveWishlistToStorage();
  renderWishlistPage();
  showToast(countryName + " removed from wishlist");

  if (currentCountry && currentCountry.name.common === countryName) {
    updateWishlistButton();
  }
}

function updateWishlistButton() {
  if (!currentCountry) return;

  var btn = document.getElementById("wishlistBtn");
  var name = currentCountry.name.common;

  var isAdded = wishlist.find(function(item) {
    return item.name === name;
  });

  if (isAdded) {
    btn.textContent = "💔 Remove from Wishlist";
    btn.classList.add("added");
  } else {
    btn.textContent = "❤️ Add to Wishlist";
    btn.classList.remove("added");
  }
}

function updateWishlistCount() {
  document.getElementById("wishlistCount").textContent = wishlist.length;
}


function renderWishlistPage() {
  var grid = document.getElementById("wishlistGrid");
  grid.innerHTML = "";

  if (wishlist.length === 0) {
    document.getElementById("wishlistEmpty").style.display = "block";
    return;
  }

  document.getElementById("wishlistEmpty").style.display = "none";


  var cards = wishlist.map(function(item) {
    return (
      '<div class="wishlist-card">' +
        '<img src="' + item.flag + '" alt="' + item.name + ' flag" />' +
        '<h3>' + item.name + '</h3>' +
        '<p>🏛️ Capital: ' + item.capital + '</p>' +
        '<p>🌐 Region: ' + item.region + '</p>' +
        '<p class="date">📅 Added: ' + item.addedOn + '</p>' +
        '<button class="remove-btn" onclick="removeFromWishlist(\'' + item.name + '\')">🗑 Remove</button>' +
      '</div>'
    );
  });

  grid.innerHTML = cards.join("");
}

function showPage(page) {
  if (page === "home") {
    document.getElementById("homePage").style.display = "block";
    document.getElementById("wishlistPage").style.display = "none";
  } else if (page === "wishlist") {
    document.getElementById("homePage").style.display = "none";
    document.getElementById("wishlistPage").style.display = "block";
    renderWishlistPage(); 
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("wanderscope_theme", "dark");
  } else {
    localStorage.setItem("wanderscope_theme", "light");
  }
}

var savedTheme = localStorage.getItem("wanderscope_theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
}


