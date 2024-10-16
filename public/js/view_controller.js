import { RepoContainer } from "./repo_container.js";
import { ForkContainer } from "./fork_container_component.js";

class ViewController extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }
    
    async connectedCallback(){
        if (await this.#login()){
            this.shadowRoot.appendChild(this.#template());
        } else{
            this.shadowRoot.appendChild(this.#loginTemplate())
        }
        this.shadowRoot.addEventListener('searchEvent', this.#handleSearch.bind(this))
        this.shadowRoot.addEventListener('loginEvent', this.#handleLogin.bind(this))
        this.shadowRoot.addEventListener('thisForkEvent', this.#handleFork.bind(this))
        
        if (await this.#loginType() == "elev") {
            this.#buildElev();
        }
    }

    disconnectedCallback(){
        this.shadowRoot.addEventListener('searchEvent', this.#handleSearch.bind(this))
        this.shadowRoot.removeEventListener('thisForkEvent', this.#handleFork.bind(this))
    }

    async #login(){
        try {
            const response = await fetch('/ifLogin');
            const data = await response.json();
    
            return data.status === 'success';
        } catch (error) {
            console.error('Error during login check:', error);
            return false;
        }
    }

    async #loginType() {
        try {
            const response = await fetch('/login/type');
            const data = await response.json();
            return data.message;
        } catch (error) {
            console.error('Error during login type check:', error);
            return null;
        }
    }

    #handleLogin(e){
        this.#resetView()
    }

    #loginTemplate(){
        const template = document.createElement('template');
        template.innerHTML = `
            <login-page></login-page>
        `
        return template.content.cloneNode(true);
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
    
        // If no data is returned, show error message and image
        if (!data || data.length === 0) {
            const errorTemplate = document.createElement('template');
            errorTemplate.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p>No repositories found for the user "${ownerName}".</p>
                    <img src="/img/no-matches.jpeg" style="max-width: 300px; height: auto;">
                </div>
            `;
            this.shadowRoot.appendChild(errorTemplate.content.cloneNode(true));
            return;
        }
    
        // If data exists, append the RepoContainer with the data
        this.shadowRoot.appendChild(new RepoContainer(data));
    }
    
    async #buildForks(ownerName, repoName) {
        this.#resetView();
        const data = await this.#getForks(ownerName, repoName);

        if (!data) {
            return;
        }

        this.shadowRoot.appendChild(new ForkContainer(data));
    }

    async #buildElev() {
        this.#resetView();
        const elevName = await this.#getElevName();
        const data = await this.#getElevFeedbackFork(elevName);

        console.log(data)
    
        // If no data is returned, show error message and image
        if (!data || data.length === 0) {
            const errorTemplate = document.createElement('template');
            errorTemplate.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p>No Forks with feedback found.</p>
                    <img src="/img/no-matches.jpeg" style="max-width: 300px; height: auto;">
                </div>
            `;
            this.shadowRoot.appendChild(errorTemplate.content.cloneNode(true));
            return;
        }
    
        // If data exists, append the RepoContainer with the data
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

    async #getElevName() {
        try {
            const response = await fetch('/api/user');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data.username;
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    }

    async #getElevFeedbackFork(elevName) {
        try {
            const response = await fetch(`/api/feedback/fork/${elevName}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching repositories:', error);
            return null;
        }
    }
}


window.customElements.define("view-controller", ViewController);