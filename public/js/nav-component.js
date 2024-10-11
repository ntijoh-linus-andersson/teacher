// Define the custom event for search
export class SearchEvent extends CustomEvent {
    constructor(search) {
        super("searchEvent", 
            { 
                bubbles: true, 
                composed: true, 
                detail: { search: search } 
            });
    }
}

// Define the custom element
export class SearchNavbar extends HTMLElement {
    constructor() {
        super();
        // Attach shadow DOM to the component
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(this.#template());

        // Add event listener for the search button
        this.shadowRoot.querySelector('.search-bar').addEventListener('submit', this.#handleSearch.bind(this));
    }

    connectedCallback() {
        this.shadowRoot.querySelector('.search-bar').addEventListener('submit', this.#handleSearch.bind(this));
    
        // Fetch the logged-in user's name and display it in the dropdown
        this.#fetchUsername();
    }
    
    async #fetchUsername() {
        try {
            const response = await fetch('/api/user'); // New endpoint to get the user's name
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const usernameElement = this.shadowRoot.querySelector('#username');
            usernameElement.textContent = data.username;  // Set the username in the dropdown
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }

    // Template for the component
    #template() {
        const template = document.createElement("template");
        template.innerHTML = `
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
    
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                .material-symbols-outlined {
                    font-variation-settings:
                        'FILL' 0,
                        'wght' 400,
                        'GRAD' 0,
                        'opsz' 24;
                    color: white;
                    cursor: pointer;
                    display: flex; /* Center the icon */
                    align-items: center; /* Center the icon vertically */
                    justify-content: center; /* Center the icon horizontally */
                    height: 100%; /* Make icon height equal to parent */
                }
                .navbar {
                    display: flex;
                    align-items: center;
                    background-color: #2b2b2b; /* Darker shade for modern look */
                    padding: 1em 2em;
                    color: white;
                    font-family: 'Arial', sans-serif;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); /* Subtle shadow for depth */
                    justify-content: space-between; /* Space between elements */
                }
                .navbar h1 {
                    margin: 0;
                    font-size: 1.5em;
                    color: white;
                    text-align: center; /* Center the text */
                    flex: 1; /* Allow the heading to grow and center */
                    padding-left: 260px; /* Add slight padding for spacing */
                }
                .navbar .dropdown {
                    flex: 0 0 auto; /* Prevent dropdown from growing */
                }
                .search-bar {
                    display: flex;
                    gap: 0.5em;
                    align-items: stretch; /* Stretch items to be the same height */
                }
                .search-bar input {
                    padding: 0.5em;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    outline: none;
                    width: 220px; /* Increased width for more space */
                    transition: border 0.3s ease, box-shadow 0.3s ease;
                }
                .search-bar input:focus {
                    border-color: #999;
                    box-shadow: 0 0 5px rgba(153, 153, 153, 0.5); /* Focus shadow */
                }
                .search-bar button {
                    padding: 0.5em 1em;
                    border: none;
                    background-color: #444;
                    color: white;
                    border-radius: 3px;
                    cursor: pointer;
                    transition: background-color 0.3s ease, transform 0.3s ease;
                    height: 100%; /* Match the button height to the input field */
                }
                .search-bar button:hover {
                    background-color: #666;
                    transform: scale(1.05); /* Slightly enlarge on hover */
                }

                /* Dropdown Menu */
                .dropdown {
                    position: relative;
                    display: flex;
                    align-items: center; /* Center the dropdown items */
                }
                .dropdown-content {
                    display: none;
                    position: absolute;
                    background-color: white;
                    min-width: 160px;
                    right: 10; /* Align to the right */
                    top: 100%;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* Softer shadow */
                    border-radius: 5px;
                    overflow: hidden;
                    z-index: 1;
                }

                .dropdown-content span, .dropdown-content a {
                    color: black;
                    padding: 12px 16px;
                    text-decoration: none;
                    display: block;
                    transition: background-color 0.3s ease;
                }

                .dropdown-content a:hover, .dropdown-content span:hover {
                    background-color: #f1f1f1;
                }

                /* Show the dropdown when hovering over the icon */
                .dropdown:hover .dropdown-content {
                    display: block;
                }
            </style>
    
            <!-- HTML structure for the navbar with dropdown -->
            <nav class="navbar">
                <div class="dropdown">
                    <span class="material-symbols-outlined dropbtn" style="width: 48px; height: 48px;">person</span>
                    <div class="dropdown-content">
                        <span id="username">User</span> <!-- Placeholder for the username -->
                        <a href="/logout">Logout</a>
                    </div>
                </div>
                <h1>Welcome to the Search Navbar</h1>
                <form class="search-bar">
                    <input type="text" id="searchInput" name='search' placeholder="Search...">
                    <button type="submit">Search</button>
                </form>
            </nav>
        `;
        return template.content.cloneNode(true);
    }

    // Search functionality
    #handleSearch(e) {
        e.preventDefault();

        const search = e.target.search.value;

        this.parentNode.dispatchEvent(new SearchEvent(search));
    }
}

// Register the custom element
window.customElements.define('search-navbar', SearchNavbar);
