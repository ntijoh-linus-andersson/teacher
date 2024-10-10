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

    // Template for the component
    #template() {
        const template = document.createElement("template");
        template.innerHTML = `
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
            
            <style>
                .material-symbols-outlined {
                    font-variation-settings:
                        'FILL' 0,
                        'wght' 400,
                        'GRAD' 0,
                        'opsz' 24;
                    color: white;
                }
                .navbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #333;
                    padding: 1em;
                    color: white;
                }
                .navbar a {
                    color: white;
                    text-decoration: none;
                    padding: 0.5em;
                }
                .navbar a:hover {
                    background-color: #575757;
                    border-radius: 5px;
                }
                .search-bar {
                    display: flex;
                    gap: 0.5em;
                }
                .search-bar input {
                    padding: 0.5em;
                    border: none;
                    border-radius: 3px;
                }
                .search-bar button {
                    padding: 0.5em;
                    border: none;
                    background-color: #575757;
                    color: white;
                    border-radius: 3px;
                    cursor: pointer;
                }
                .search-bar button:hover {
                    background-color: #777;
                }
                h1 {
                    color: white;
                }
            </style>

            <!-- HTML structure for the navbar -->
            <nav class="navbar">
                <span class="material-symbols-outlined">person</span>
                <h1>Welcome to the Search Navbar</h1>
                <form class="search-bar">
                    <input type="text" id="searchInput" name='search' placeholder="Search...">
                    <input type='submit' id="searchButton" value='Search'>
                </form>
            </nav>
        `;
        return template.content.cloneNode(true);
    }

    // Search functionality
    #handleSearch(e) {
        e.preventDefault()

        const search = e.target.search.value;

        this.parentNode.dispatchEvent(new SearchEvent(search));
    }
}

// Register the custom element
window.customElements.define('search-navbar', SearchNavbar);
