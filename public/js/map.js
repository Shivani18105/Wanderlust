const map = L.map('map').setView([18.5204, 73.8567], 13);

// OpenStreetMap tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Marker
L.marker([18.5204, 73.8567])
    .addTo(map)
    .bindPopup('Your Listing Location')
    .openPopup();