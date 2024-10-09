import { MUI } from "/js/mui.js";

export class ForkCard extends MUI {
    constructor(data, filePath) {
        super();
        this.data = data;
        this.filePath = filePath
        this.owner = data.owner;
        this.name = data.name;
        this.repoPath = data.html_url;
        this.content = null;
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(this.#template());
        this.init();
    }

    async init() {
        try {
            this.content = await this.#getContent(this.data);
            this.#updateTemplate();
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    }

    async #getContent(data) {
        if (!data) {
            return null;
        }
    
        const response = await fetch(`https://api.github.com/repos/${data.owner.login}/${data.name}/contents/${this.filePath}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const content = await response.json();
        
        const decodedContent = atob(content.content);
    
        return decodedContent.replace(/\n/g, '<br>');
    }

    #template() {
        const template = document.createElement("template");
        template.innerHTML = `
            ${this.muiDefault()}
             <div class="mdl-card mdl-shadow--3dp" style="padding: 16px; max-width: 600px; width: auto;">
                <div class="mdl-card__title">
                    <h2 class="mdl-card__title-text">${this.owner.login}/${this.name}</h2>
                </div>
                <div class="mdl-card__supporting-text">
                    <div style="background-color: #3e3e42; color: white; padding: 10px;">
                        ${this.content || 'Loading...'}
                    </div>
                    <br />
                    <a href="${this.repoPath}">Show on Github</a>
                </div>
                <div class="mdl-card__actions mdl-card--border">

                </div>
                <div class="mdl-card__actions mdl-card--border">
                    <form>
                        <input type="text" placeholder="Comment">

                        <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-1">
                            <input type="radio" id="radio-1" class="mdl-radio__button" name="options" value="1" checked>
                            <span class="mdl-radio__label" style="display: flex; align-items: center;"><i class="material-icons">check</i> Klar</span>
                        </label> <br/> <br/>
                        
                        <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-2">
                            <input type="radio" id="radio-2" class="mdl-radio__button" name="options" value="2">
                            <span class="mdl-radio__label" style="display: flex; align-items: center;"><i class="material-icons">visibility_off</i> Återgärd Krävs</span>
                        </label> <br/> <br/>
                        
                        <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-3">
                            <input type="radio" id="radio-3" class="mdl-radio__button" name="options" value="3">
                            <span class="mdl-radio__label" style="display: flex; align-items: center;"><i class="material-icons">refresh</i> Ej Bedömd</span>
                        </label> <br/> <br/>

                        <button type="submit" class="btn waves-effect waves-light mdl-button mdl-js-button mdl-button--raised">SAVE</button>
                    </form>
                </div>
            </div>
        `;

        return template.content.cloneNode(true);
    }

    #updateTemplate() {
        this.shadowRoot.innerHTML = "";
        this.shadowRoot.appendChild(this.#template());

        // Manually upgrade MDL components in shadow DOM
        if (window.componentHandler) {
            window.componentHandler.upgradeDom(); // Upgrade MDL components
        }
    }
}

// Define the custom element
window.customElements.define("fork-card", ForkCard);

async function init() {
    try {
        const response = await fetch('/api/forks/ntijoh-linus-andersson/teacher');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)

        // Append an instance of ForkCard to the body
        document.querySelector("body").appendChild(new ForkCard(data[0], "README.md"));
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

init();