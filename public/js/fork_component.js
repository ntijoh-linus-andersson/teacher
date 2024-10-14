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

    connectedCallback() {
        this.shadowRoot.querySelector("#feedback-form").addEventListener("submit", this.#handleSubmit.bind(this))
    }
    disconnectedCallback() {
        this.shadowRoot.querySelector("#feedback-form").removeEventListener("submit", this.#handleSubmit.bind(this))
    }

    async #handleSubmit(e) {
        console.log('submit');
        e.preventDefault()
        const form = e.target
        const comment = form.comment.value
        const grade = form.options.value
        const owner = this.owner.login
        const repo = this.repoPath

        fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ owner: owner, repo: repo, comment: comment, grade: grade })
        })
    }

    async init() {
        try {
            this.manifest = await JSON.parse(await this.#getContent(this.owner.login, this.name, ".manifest.json"));
            this.content = await this.#getContent(this.owner.login, this.name, this.manifest["filePath"]);
        } catch (error) {
            console.error('Error fetching manifest or content:', error);
            this.content = null;
        }
    
        try {
            this.feedbackData = await this.#getFeedback(this.repoPath);
        } catch (error) {
            console.error('Error fetching feedback:', error);
            this.feedbackData = null;
        }
        
        this.#updateTemplate();
    }

    async #getFile(owner, name, filePath) {
        if (!owner || !name || !filePath) {
            return null;
        }
    
        const response = await fetch(`/api/forks/${owner}/${name}/${filePath}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        console.log(response)

        return await response.json();
    }

    async #getContent(owner, name, filePath) {
        console.log(owner, name, filePath)
        if (!owner || !name || !filePath) {
            return null;
        }
    
        const content = await this.#getFile(owner, name, filePath);
        console.log(content)
        const decodedContent = atob(content.content);  // Decode Base64 content
        
        return decodedContent;
    }

    async #getFeedback(repoPath) {
        if (!repoPath) {
            return null;
        }
    
        const response = await fetch(`/api/feedback/${repoPath}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        return await response.json();
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
                    <form id="feedback-form">
                        <input type="text" placeholder="Comment" name="comment">
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
        this.shadowRoot.querySelector("#feedback-form").removeEventListener("submit", this.#handleSubmit.bind(this))
        this.shadowRoot.innerHTML = "";  // Clear the shadow DOM
        this.shadowRoot.appendChild(this.#template());  // Re-append the templatea

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

        const feedbackForm = this.shadowRoot.querySelector("#feedback-form");

        if (this.feedbackData) {
            feedbackForm.comment.value = this.feedbackData.comment || "";
            feedbackForm.options.value = this.feedbackData.grade || 3;
        }

        feedbackForm.addEventListener("submit", this.#handleSubmit.bind(this))
    }
}

// Define the custom element
window.customElements.define("fork-card", ForkCard);
