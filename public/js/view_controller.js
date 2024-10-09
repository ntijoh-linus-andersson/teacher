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

    #handleSearch(e) {
        console.log(e.detail.search);
    }

    #template() {
        const template = document.createElement('template');
        template.innerHTML = `
            <search-navbar></search-navbar>
        `
        return template.content.cloneNode(true);
    }
}


window.customElements.define("view-controller", ViewController);