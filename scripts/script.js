document.addEventListener("DOMContentLoaded", function () {
    // Check if the code should initialize features based on the page
    if (!isOnPage("impressum.html")) {
        initializePageFeatures();
    } else {
        console.log("We're on the impressum.html page. Skipping certain initializations.");
    }
    initMenuFeatures();
});

/**
 * Check if we're on the provided page.
 * @param {string} pageName - Name of the page to check against.
 * @returns {boolean} - Returns true if on the provided page, false otherwise.
 */
function isOnPage(pageName) {
    return window.location.pathname.indexOf(pageName) !== -1;
}

/**
 * Initialize the primary features of the page if not on "impressum.html".
 */
function initializePageFeatures() {
    initMap();
    initSmoothScroll();
    initSlideshow();
}

/**
 * Initialize the menu-related features.
 */
function initMenuFeatures() {
    initHamburgerMenu();
    initMenuSwipe();
}

/**
 * Initialize the map on the page using Leaflet.
 */
function initMap() {
    // Check if the map element exists on the page.
    if (!document.getElementById('map')) return;

    var defaultView = {
        center: [47.3185068, 13.1383278],
        zoom: 17
    };
    
    L.Control.Home = L.Control.extend({
        options: {
            position: 'topleft' // You can adjust this as needed
        },
    
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-home');
            container.innerHTML = '<a title="Home" href="#home">🏠</a>';
            container.onclick = function() {
                map.setView(defaultView.center, defaultView.zoom);
            };
            return container;
        }
    });

    // Set up the map with a default view.
    var map = L.map('map').setView(defaultView.center, defaultView.zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create a custom marker icon.
    var customIcon = L.icon({
        iconUrl: './images/marker-icon.png',
        shadowUrl: './images/marker-shadow.png',
        iconSize: [25, 41],
        shadowSize: [41, 41],
        iconAnchor: [12, 41],
        shadowAnchor: [12, 41],
        popupAnchor: [0, -20]
    });

    // Add the custom marker to the map and bind a popup to it.
    var marker = L.marker([47.3185068, 13.1383278], { icon: customIcon }).addTo(map)
        .bindPopup('<img src="./logos/Gerardo.jpg" alt="GERARDO Logo" width="200"><br><strong>Pub-Bar Gerardo</strong><br>Goldegger Straße 6<br>5620 Schwarzach', {
            autoPanPadding: [20, 20]
        })
        .openPopup();

    map.setView(marker.getLatLng());

    // Add the home button control to the map
    new L.Control.Home().addTo(map);
}

/**
 * Initialize smooth scrolling for anchor links on the page.
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.querySelector('#' + targetId);

            if (targetId === 'images') {
                // Open the slideshow.
                openSlideshow();
            } else if (targetId !== 'impressum.html' && targetElement) {
                // Smooth scroll to the target element.
                targetElement.scrollIntoView({ behavior: 'smooth' });
            } else if (targetId === 'impressum.html') {
                // Navigate to "impressum.html".
                window.location.href = './pages/impressum.html';
            }
        });
    });
}

// Image gallery data and current index.
let currentImageIndex = 0;
const images = ['bildgalerie/image1.jpg', 'bildgalerie/image2.jpg', 'bildgalerie/image3.jpg', 'bildgalerie/image4.jpg', 'bildgalerie/image5.jpg'];

/**
 * Initialize the slideshow functionality.
 */
function initSlideshow() {
    // Check if the slideshow element exists on the page.
    if (!document.getElementById('slideshow')) return;

    document.querySelector('a[href="#images"]').addEventListener('click', openSlideshow);

    // Handle keyboard inputs for slideshow navigation.
    document.addEventListener('keydown', function (event) {
        if (document.getElementById('slideshow').style.display === "block") {
            switch (event.key) {
                case "Escape": closeSlideshow(); break;
                case "ArrowRight": changeSlide(1); break;
                case "ArrowLeft": changeSlide(-1); break;
            }
        }
    });

    // Handle touch gestures for the slideshow.
    let touchStartX = null;
    const slideshowEl = document.getElementById('slideshow');

    slideshowEl.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
    slideshowEl.addEventListener('touchmove', e => e.preventDefault());
    slideshowEl.addEventListener('touchend', function (e) {
        if (!touchStartX) return;

        let touchEndX = e.changedTouches[0].clientX;
        let diffX = touchStartX - touchEndX;

        if (Math.abs(diffX) > 50) {
            // Change slide based on the swipe direction.
            changeSlide(diffX > 0 ? 1 : -1);
        }

        touchStartX = null;
    });
}

/**
 * Open the image slideshow.
 */
function openSlideshow() {
    const slideshow = document.getElementById('slideshow');
    const slideshowImg = document.getElementById('slideshowImg');

    currentImageIndex = 0;
    slideshowImg.src = images[currentImageIndex];
    slideshow.style.display = "block";
}

/**
 * Close the image slideshow.
 */
function closeSlideshow() {
    document.getElementById('slideshow').style.display = "none";
}

/**
 * Change the slide of the image slideshow.
 * @param {number} n - The direction to change the slide.
 */
function changeSlide(n) {
    currentImageIndex = (currentImageIndex + n + images.length) % images.length;
    document.getElementById('slideshowImg').src = images[currentImageIndex];
}

/**
 * Initialize the hamburger menu toggle functionality.
 */
function initHamburgerMenu() {
    const hamburgerMenu = getElement('hamburger-menu');
    const mobileNavMenu = getElement('mobile-nav-menu');
    const hamburgerMenuMobile = getElement('hamburger-menu-docked');
    
    // Check if mobile navigation exists.
    if (!mobileNavMenu) return;

    const toggleFn = () => toggleMenu();
    addClickListener(hamburgerMenu, toggleFn);
    addClickListener(hamburgerMenuMobile, toggleFn);

    // Close the mobile menu when a link inside it is clicked.
    mobileNavMenu.querySelectorAll('a').forEach(link => addClickListener(link, toggleFn));
}

/**
 * Get an element by its ID.
 * @param {string} id - The ID of the element to retrieve.
 * @returns {HTMLElement|null} - Returns the element with the given ID or null if it doesn't exist.
 */
function getElement(id) {
    return document.getElementById(id);
}

/**
 * Add a click event listener to an element.
 * @param {HTMLElement|null} element - The element to add the listener to.
 * @param {Function} fn - The function to be called on click.
 */
function addClickListener(element, fn) {
    if (element) element.addEventListener('click', fn);
}

/**
 * Initialize touch swipe functionality for the navigation menu.
 */
function initMenuSwipe() {
    let touchStartXMenu = null;
    let touchEndXMenu = null;
    let touchSource = null; // add this to keep track of the source element

    document.addEventListener('touchstart', function (e) {
        touchStartXMenu = e.touches[0].clientX;
        touchSource = e.target; // store the source of the touch
    });

    document.addEventListener('touchend', function (e) {
        touchEndXMenu = e.changedTouches[0].clientX;
        handleMenuSwipeGesture(touchStartXMenu, touchEndXMenu, touchSource);
    });
}

/**
 * Handle the swipe gesture for the mobile navigation menu.
 * @param {number} touchStartXMenu - The starting X-coordinate of the swipe.
 * @param {number} touchEndXMenu - The ending X-coordinate of the swipe.
 * @param {HTMLElement} sourceElement - The source element where the touch started.
 */
function handleMenuSwipeGesture(touchStartXMenu, touchEndXMenu, sourceElement) {
    let map = document.getElementById('map');
    if (sourceElement.closest("#map")) {
        // If the source of the touch is the map or a child of the map, ignore the swipe gesture
        return;
    }
    let slideshow = document.getElementById('slideshow');
    if (!touchStartXMenu || !touchEndXMenu || (slideshow && slideshow.style.display === "block")) return;

    let diffX = touchStartXMenu - touchEndXMenu;
    if (Math.abs(diffX) > 100) {
        // Toggle the mobile menu based on swipe direction.
        if (diffX > 0 && document.getElementById('mobile-nav-menu').classList.contains('open')) {
            toggleMenu();
        } else if (diffX < 0 && !document.getElementById('mobile-nav-menu').classList.contains('open')) {
            toggleMenu();
        }
    }
}

/**
 * Toggle the mobile navigation menu.
 */
function toggleMenu() {
    let nav = document.getElementById('mobile-nav-menu');

    if (!nav) return;

    // Toggle the 'open' class to open/close the mobile menu.
    if (nav.classList.contains('open')) {
        nav.classList.remove('open');
    } else {
        nav.classList.add('open');
    }
}