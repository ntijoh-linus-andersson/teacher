import { MUI } from "/js/mui.js";
import { CodeParserComponent } from "./code_parser_component.js";

export class ForkCard extends MUI {
    constructor(data) {
        super();
        this.data = data;
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
            // Fetch the manifest and the content based on the file path
            this.manifest = await JSON.parse(await this.#getContent(this.owner.login, this.name, ".manifest.json"));
            this.content = await this.#getContent(this.owner.login, this.name, this.manifest["filePath"]);
            this.#updateTemplate(); // Update the template with fetched data
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    }

    async #getFile(owner, name, filePath) {
        if (!owner || !name || !filePath) {
            return null;
        }
    
        const response = await fetch(`/api/forks/${owner}/${name}/${filePath}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        return await response.json();
    }

    async #getContent(owner, name, filePath) {
        if (!owner || !name || !filePath) {
            return null;
        }
    
        const content = await this.#getFile(owner, name, filePath);
        const decodedContent = atob(content.content);  // Decode Base64 content
        
        return decodedContent;
    }

    #template() {
        const template = document.createElement("template");
        template.innerHTML = `
            ${this.muiDefault()}
            <style>
                #test-container {
                    color: black;
                }
            </style>

            <div class="mdl-card mdl-shadow--3dp" style="padding: 16px; max-width: 600px; width: auto;">
                <div class="mdl-card__title">
                    <h2 class="mdl-card__title-text">${this.owner.login}/${this.name}</h2>
                </div>
                <div class="mdl-card__supporting-text">
                    <div id="code-container">
                        Loading...
                    </div>
                    <br />
                    <a href="${this.repoPath}">Show on Github</a>
                </div>
                <div id="test-container" class="mdl-card__supporting-text">
                    
                </div>
                <div class="mdl-card__actions mdl-card--border">
                    <form>
                        <input type="text" placeholder="Comment">
                        <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-1">
                            <input type="radio" id="radio-1" class="mdl-radio__button" name="options" value="1">
                            <span class="mdl-radio__label" style="display: flex; align-items: center;"><i class="material-icons">check</i> Klar</span>
                        </label> 
                        <br/><br/>
                        <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-2">
                            <input type="radio" id="radio-2" class="mdl-radio__button" name="options" value="2">
                            <span class="mdl-radio__label" style="display: flex; align-items: center;"><i class="material-icons">visibility_off</i> Återgärd Krävs</span>
                        </label> 
                        <br/><br/>
                        <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-3">
                            <input type="radio" id="radio-3" class="mdl-radio__button" name="options" value="3" checked>
                            <span class="mdl-radio__label" style="display: flex; align-items: center;"><i class="material-icons">refresh</i> Ej Bedömd</span>
                        </label>
                        <br/><br/>
                        <button type="submit" class="btn waves-effect waves-light mdl-button mdl-js-button mdl-button--raised">SAVE</button>
                    </form>
                </div>
            </div>
        `;
        return template.content.cloneNode(true);
    }

    #updateTemplate() {
        this.shadowRoot.innerHTML = "";  // Clear the shadow DOM
        this.shadowRoot.appendChild(this.#template());  // Re-append the template

        // Manually upgrade MDL components in shadow DOM
        if (window.componentHandler) {
            window.componentHandler.upgradeDom();  // Upgrade MDL components
        }

        // Now, after updating the template, inject the `CodeParserComponent`
        if (this.content) {
            const codeContainer = this.shadowRoot.querySelector("#code-container");
            codeContainer.innerHTML = "";  // Clear the "Loading..." text
            
            // Create and append CodeParserComponent to the container
            const codeComponent = new CodeParserComponent(this.content, 'javascript');
            codeContainer.appendChild(codeComponent);
        }
        else {
            const codeContainer = this.shadowRoot.querySelector("#code-container");
            codeContainer.innerHTML = "Could not find the files";
        }

        if (this.content && this.manifest) {
            const functionName = this.manifest.functionName;  // Ensure to use `this.manifest`
            const smallestOfTwo = new Function(this.content + ` return ${functionName};`)(); // Correctly create the function
            const tests = this.manifest.tests;  // Use `this.manifest` to access tests
            const resultsElement = this.shadowRoot.querySelector('#test-container');
            let results = '';
        
            // Run each test
            tests.forEach(test => {
                const { description, arguments: args, expected } = test;
                try {
                    const result = smallestOfTwo(...args); // Call the function directly
        
                    if (result === expected) {
                        results += `<p>Test "${description}": Passed\n</p>`;
                    } else {
                        results += `<p>Test "${description}": Failed (Expected ${expected}, got ${result})\n</p>`;
                    }
                } catch (error) {
                    results += `${description}: Error (${error.message})\n`; // Catch errors in execution
                }
            });
        
            // Display results
            resultsElement.innerHTML = results;
        }

    }
}

// Define the custom element
window.customElements.define("fork-card", ForkCard);
