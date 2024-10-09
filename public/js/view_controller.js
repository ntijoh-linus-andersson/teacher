import { ForkCard } from "./fork_component.js";
import { RepoCard } from "./repo-component.js";

class ViewController extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(this.#template());
    }
    
    connectedCallback(){
        this.shadowRoot.addEventListener('searchEvent', this.#handleSearch.bind(this))
    }

    disconnectedCallback(){
        this.shadowRoot.removeEventListener('searchEvent', this.#handleSearch.bind(this))
    }

    async #handleSearch(e) {
        const search = e.detail.search;

        if (!search) {
            return;
        }

        await this.#buildRepos(search);
    }

    async #handleFork(e) {
        
    }

    async #buildRepos(ownerName) {
        this.#resetView();
        const data = await this.#getRepo(ownerName);

        if (!data) {
            return;
        }

        data.forEach(repo => {
            this.shadowRoot.appendChild(new RepoCard(repo));
        });
    }

    async #buildForks(ownerName, repoName) {
        this.#resetView();
        const data = await this.#getForks(ownerName, repoName);

        if (!data) {
            return;
        }

        // Append an instance of ForkCard to the body
        this.shadowRoot.appendChild(new ForkCard(data[0], "README.md"));
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