// Define the custom element
class SearchNavbar extends HTMLElement {
    constructor() {
        super();
        // Attach shadow DOM to the component
        this.attachShadow({ mode: 'open' });

        // HTML content for the component
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=person" />
            
            <style>
                .material-symbols-outlined {
                font-variation-settings:
                'FILL' 0,
                'wght' 400,
                'GRAD' 0,
                'opsz' 24
                }
                /* Scoped styles for the component */
                .navbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #333;
                    padding: 1em;
                }
                .navbar ul {
                    list-style-type: none;
                    display: flex;
                    gap: 1em;
                    margin: 0;
                    padding: 0;
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
            </style>

            <!-- HTML structure for the navbar -->
            <nav class="navbar">
<span class="material-symbols-outlined">
person
</span>
                <div class="search-bar">
                    <input type="text" id="searchInput" placeholder="Search...">
                    <button id="searchButton">Search</button>
                </div>
            </nav>
        `;

        // Add event listener for the search button
        this.shadowRoot.querySelector('#searchButton').addEventListener('click', () => this.handleSearch());
    }

    // Search functionality
    handleSearch() {
        const searchQuery = this.shadowRoot.querySelector('#searchInput').value.toLowerCase();
        const searchResultsDiv = document.getElementById('searchResults');

        // Sample data to search through
        const sampleData = [
            { id: 1, name: 'Home Page', url: '#' },
            { id: 2, name: 'About Us', url: '#' },
            { id: 3, name: 'Contact Page', url: '#' },
            { id: 4, name: 'Services', url: '#' },
        ];

        // Filter the data based on the search query
        const filteredData = sampleData.filter(item => item.name.toLowerCase().includes(searchQuery));

        // Display the results
        if (filteredData.length > 0) {
            searchResultsDiv.innerHTML = filteredData.map(item => `<p><a href="${item.url}">${item.name}</a></p>`).join('');
        } else {
            searchResultsDiv.innerHTML = '<p>No results found</p>';
        }
    }
}

// Register the custom element
customElements.define('search-navbar', SearchNavbar);
