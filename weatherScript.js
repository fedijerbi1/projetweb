 function getWeather(city) {
    const apiKey = 'e2b9c48e60e6e0b152dd46edf4fc1bb1';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;
    
    const xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                const response = JSON.parse(this.responseText);
                displayWeather(response);
            } else {
                console.error('Erreur:', this.status, this.statusText);
                displayError('Impossible de récupérer les données météo');
            }
        }
    };
    
    xhr.open('GET', url, true);
    xhr.send();
}

function displayWeather(data) {
    console.log('Données météo:', data);
    
    const weatherInfo = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>Température: ${data.main.temp}°C</p>
        <p>Ressenti: ${data.main.feels_like}°C</p>
        <p>Humidité: ${data.main.humidity}%</p>
        <p>Vent: ${data.wind.speed} m/s</p>
        <p>${data.weather[0].description}</p>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
             alt="${data.weather[0].description}">
    `;
    
    document.getElementById('weather-container').innerHTML = weatherInfo;
} 