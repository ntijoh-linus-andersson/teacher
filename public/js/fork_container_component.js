import { ForkCard } from "./fork_component.js";

export class ForkContainer extends HTMLElement {
    constructor(data) {
        super();
        this.data = data;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(this.#template());
        this.style.display = "flex";
        this.style.justifyContent = "center";
        this.#init();
    }

    connectedCallback() {
        
    }

    #init() {
        const container = this.shadowRoot.querySelector('#fork-container');
        
        Object.keys(this.data).forEach(key => {
            container.appendChild(new ForkCard(this.data[key]));
        });   
    }

    #template() {
        const template = document.createElement("template");
        template.innerHTML = `
            <style>
                #fork-container {
                    display: grid;
                    width: 80%;
                    grid-template-columns: auto auto; 
                    column-gap: 2%;
                    row-gap: 15px;
                }
            </style>
            <div id="fork-container"></div>
        `;
        
        return template.content.cloneNode(true);
    }
}

window.customElements.define("fork-container", ForkContainer);