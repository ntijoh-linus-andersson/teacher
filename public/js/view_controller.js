import { RepoContainer } from "./repo_container.js";
import { ForkContainer } from "./fork_container_component.js";


class ViewController extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(this.#template());
    }
    
    connectedCallback(){
        this.shadowRoot.addEventListener('searchEvent', this.#handleSearch.bind(this))
        this.shadowRoot.addEventListener('thisForkEvent', this.#handleFork.bind(this))
    }

    disconnectedCallback(){
        this.shadowRoot.addEventListener('searchEvent', this.#handleSearch.bind(this))
        this.shadowRoot.removeEventListener('thisForkEvent', this.#handleFork.bind(this))
    }

    async #handleSearch(e) {
        const search = e.detail.search;

        if (!search) {
            return;
        }

        await this.#buildRepos(search);
    }

    async #handleFork(e) {
        const ownerName = e.detail.owner;
        const repoName = e.detail.name;

        if (!ownerName || !repoName) {
            return;
        }

        await this.#buildForks(ownerName, repoName);
    }

    async #buildRepos(ownerName) {
        this.#resetView();
    
        try {
            // Try to fetch repo data from the API
            const data = await this.#getRepo(ownerName);
    
            // Check if no data is returned (e.g., user not found)
            if (!data || data.length === 0) {
                const template = document.createElement('template');
                template.innerHTML = `
                    <h1>User not found or has no repositories</h1>
                <img src="/img/no-matches.jpeg" style="width: 50%; height: auto;">

                `;
            }
            
            this.shadowRoot.appendChild(new RepoContainer(data))
    
        } catch (error) {
            // If there was an error during the API call (e.g., user not found or network error)
            const template = document.createElement('template');
            template.innerHTML = `
                <h1>Error: ${error.message}</h1>
            `;
            this.shadowRoot.appendChild(template.content.cloneNode(true));
        }
    }
    
    async #buildForks(ownerName, repoName) {
        this.#resetView();
        const data = await this.#getForks(ownerName, repoName);

        if (!data) {
            return;
        }

        this.shadowRoot.appendChild(new ForkContainer(data, "README.md"));
    }

    #resetView() {
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this.#template());
    }

    #template() {
        const template = document.createElement('template');
        template.innerHTML = `
            <search-navbar></search-navbar>
        `
        return template.content.cloneNode(true);
    }

    async #getRepo(ownerName) {
        try {
            const response = await fetch(`/api/repos/${ownerName}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching repositories:', error);
            return null;
        }
    }

    async #getForks(ownerName, repoName) {
        try {
            const response = await fetch(`/api/forks/${ownerName}/${repoName}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

}


window.customElements.define("view-controller", ViewController);