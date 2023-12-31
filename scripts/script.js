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

    let defaultView = {
        center: [47.3185068, 13.1383278],
        zoom: 17
    };

    L.Control.Home = L.Control.extend({
        options: {
            position: 'topleft'
        },

        onAdd: function (map) {
            let container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-home');
            container.innerHTML = '<a title="Home" href="#home">🏠</a>';
            container.onclick = function () {
                map.setView(defaultView.center, defaultView.zoom);
                setTimeout(() => {
                    marker.openPopup();  // Open the marker's popup after a short delay of 100ms
                }, 100);
            };
            return container;
        }
    });



    // Set up the map with a default view.
    let map = L.map('map').setView(defaultView.center, defaultView.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create a custom marker icon.
    let customIcon = L.icon({
        iconUrl: './images/marker-icon.png',
        shadowUrl: './images/marker-shadow.png',
        iconSize: [25, 41],
        shadowSize: [41, 41],
        iconAnchor: [12, 41],
        shadowAnchor: [12, 41],
        popupAnchor: [0, -20]
    });

    // Add the custom marker to the map and bind a popup to it.
    let marker = L.marker([47.3185068, 13.1383278], { icon: customIcon }).addTo(map)
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



let currentImageIndex = 0;
const images = [];

/**
 * Fetch images from GitHub repo.
 */
function fetchImagesFromRepo() {
    const user = 'codemangg';
    const repo = 'gerardo';
    const path = 'bildgalerie';

    return fetch(`https://api.github.com/repos/${user}/${repo}/contents/${path}`)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                console.error("Unexpected API response:", data);
                return [];
            }

            return data
                .filter(item => item.type === 'file' && ['.jpg', '.jpeg', '.png'].includes(item.name.slice(-4)))
                .map(item => item.path);
        })
        .catch(error => {
            console.error('Error fetching images:', error);
            return [];
        });
}

/**
 * Initialize the slideshow functionality.
 */
async function initSlideshow() {
    // Fetch images and populate the 'images' array
    const fetchedImages = await fetchImagesFromRepo();
    fetchedImages.forEach(img => images.push(img));

    // Check if the slideshow element exists on the page.
    const slideshow = document.getElementById('slideshow');
    if (!slideshow) return;

    document.querySelector('a[href="#images"]').addEventListener('click', openSlideshow);

    // Handle keyboard inputs for slideshow navigation.
    document.addEventListener('keydown', function (event) {
        if (slideshow.style.display === "block") {
            switch (event.key) {
                case "Escape": closeSlideshow(); break;
                case "ArrowRight": changeSlide(1); break;
                case "ArrowLeft": changeSlide(-1); break;
            }
        }
    });

    let touchStartXSlideshow = null;
    let touchEndXSlideshow = null;

    // Swipe event listeners for the slideshow
    slideshow.addEventListener('touchstart', function (e) {
        touchStartXSlideshow = e.touches[0].clientX;
    });

    slideshow.addEventListener('touchend', function (e) {
        touchEndXSlideshow = e.changedTouches[0].clientX;

        if (!touchStartXSlideshow || !touchEndXSlideshow) return;

        let diffX = touchStartXSlideshow - touchEndXSlideshow;

        if (Math.abs(diffX) > baseSwipeThreshold) {
            if (diffX > 0) {
                changeSlide(1); 
            } else {
                changeSlide(-1);
            }
        }
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
 * Exclusively mobile functionality
 */

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
 * Get the swipe threshold based on the state of the drawer.
 * @returns {number} - Returns the appropriate swipe threshold.
 */
function getSwipeThreshold() {
    let nav = getElement('mobile-nav-menu');
    
    // If the side menu is open, reduce the threshold.
    if (nav && nav.classList.contains('open')) {
        return baseSwipeThreshold * 0.5;
    }
    
    return baseSwipeThreshold;
}

/**
 * Initialize touch swipe functionality for the navigation menu.
 */
function initMenuSwipe() {
    let touchStartXMenu = null;
    let touchStartYMenu = null;
    let touchEndXMenu = null;
    let touchEndYMenu = null; 
    let touchSource = null;

    document.addEventListener('touchstart', function (e) {
        touchStartXMenu = e.touches[0].clientX;
        touchStartYMenu = e.touches[0].clientY;
        touchSource = e.target;
    });

    document.addEventListener('touchend', function (e) {
        touchEndXMenu = e.changedTouches[0].clientX;
        touchEndYMenu = e.changedTouches[0].clientY;
        handleMenuSwipeGesture(touchStartXMenu, touchStartYMenu, touchEndXMenu, touchEndYMenu, touchSource);
    });
}

/**
 * Calculate the angle between the touch start and touch end coordinates.
 * @param {number} diffX - The difference in X-coordinates.
 * @param {number} diffY - The difference in Y-coordinates.
 * @return {number} - The angle in degrees.
 */
function getSwipeAngle(diffX, diffY) {
    return Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
}

/**
 * Handle the swipe gesture for the mobile navigation menu.
 * @param {number} touchStartXMenu - The starting X-coordinate of the swipe.
 * @param {number} touchEndXMenu - The ending X-coordinate of the swipe.
 * @param {HTMLElement} sourceElement - The source element where the touch started.
 */

const baseSwipeThreshold = 10; // Base minimum horizontal distance to consider as a swipe


function handleMenuSwipeGesture(touchStartXMenu, touchStartYMenu, touchEndXMenu, touchEndYMenu, sourceElement) {
    const verticalThreshold = 30;  // Allow 30px vertical movement without considering it a swipe
    const swipeThreshold = getSwipeThreshold(); // Use the dynamic threshold

    if (sourceElement.closest("#map")) {
        return;
    }

    let slideshow = getElement('slideshow');
    if (!touchStartXMenu || !touchEndXMenu || (slideshow && slideshow.style.display === "block")) return;

    let diffX = touchStartXMenu - touchEndXMenu;
    let diffY = touchStartYMenu - touchEndYMenu;

    let angle = getSwipeAngle(diffX, diffY);

    if (Math.abs(diffX) > swipeThreshold && angle < 30 && Math.abs(diffY) < verticalThreshold) {
        if (diffX > 0 && getElement('mobile-nav-menu').classList.contains('open')) {
            toggleMenu(); // left swipe
        } else if (diffX < 0 && !getElement('mobile-nav-menu').classList.contains('open')) {
            toggleMenu(); // right swipe
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