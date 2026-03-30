let wishlist = [];

async function getCountry() {
  const countryName = document.getElementById("search").value;

  const result = document.getElementById("result");
  result.innerHTML = "Loading...";

  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
    const data = await res.json();

    const country = data[0];

    displayCountry(country);
    getWeather(country.capital[0], country);
  } catch (err) {
    result.innerHTML = "❌ Country not found";
  }
}

function displayCountry(country) {
  const result = document.getElementById("result");

  result.innerHTML = `
    <div class="card">
      <img class="flag" src="${country.flags.png}">
      <h2>${country.name.common}</h2>
      <p><b>Capital:</b> ${country.capital[0]}</p>
      <p><b>Region:</b> ${country.region}</p>
      <p><b>Population:</b> ${country.population}</p>
      <button onclick='addToWishlist("${country.name.common}", "${country.capital[0]}", "${country.region}")'>
        ❤️ Add to Wishlist
      </button>
      <div id="weather"></div>
    </div>
  `;
}

async function getWeather(city) {
  const apiKey = "c7f221df8f41059fa5f9820f749ebfb9";

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  );

  const data = await res.json();

  displayWeather(data);
}

function displayWeather(data) {
  const weatherDiv = document.getElementById("weather");

  let suggestion = "";

  if (data.main.temp > 25) {
    suggestion = "☀️ Great time to visit!";
  } else if (data.main.temp < 10) {
    suggestion = "❄️ Too cold!";
  } else {
    suggestion = "🌤️ Good weather";
  }

  weatherDiv.innerHTML = `
    <h3>Weather</h3>
    <p>🌡️ ${data.main.temp}°C</p>
    <p>${data.weather[0].main}</p>
    <p>${suggestion}</p>
  `;
}

function addToWishlist(name, capital, region) {
  wishlist.push({ name, capital, region });
  alert("Added to wishlist!");
  displayWishlist();
}

function displayWishlist() {
  const list = document.getElementById("wishlist");

  list.innerHTML = "";

  wishlist.forEach((item, index) => {
    list.innerHTML += `
      <div class="wishlist-card">
        <div>
          <b>${item.name}</b><br>
          ${item.capital} - ${item.region}
        </div>
        <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });
}

function removeItem(index) {
  wishlist.splice(index, 1);
  displayWishlist();
}

function showWishlist() {
  document.getElementById("mainPage").style.display = "none";
  document.getElementById("wishlistPage").style.display = "block";
}

function goBack() {
  document.getElementById("wishlistPage").style.display = "none";
  document.getElementById("mainPage").style.display = "block";
}