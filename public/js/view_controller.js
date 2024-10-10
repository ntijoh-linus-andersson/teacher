import { ForkContainer } from "./fork_container_component.js";
import { RepoCard } from "./repo-component.js";

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

        this.shadowRoot.appendChild(new ForkContainer(data));
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