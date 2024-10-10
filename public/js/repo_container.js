import { RepoCard } from "./repo-component.js";

export class RepoContainer extends HTMLElement{
    constructor(data){
        super()
        this.attachShadow({mode: 'open'})
        this.data = data
        this.shadowRoot.appendChild(this.#template())
        this.style.display = "flex";
        this.style.justifyContent = "center";
        this.#init();
    }

    #init(){
        const container = this.shadowRoot.querySelector('#repo-container')
        this.data.forEach(repo => {
            container.appendChild(new RepoCard(repo));
        });
    }

    #template(){
        const template = document.createElement("template");
        template.innerHTML = `
        <style>
            #repo-container{
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-gap: 20px;
                margin: 20px;
            }
        </style>
        <div id="repo-container"></div>
        `

        return template.content.cloneNode(true);
    }
}

window.customElements.define("repo-container", RepoContainer);