import { Prism } from "./prism.js";

// Import Prism.js and its CSS somewhere in your project or use the CDN link in your HTML
// <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism-okaidia.min.css" rel="stylesheet" />
// <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/prism.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-javascript.min.js"></script>

export class CodeParserComponent extends HTMLElement {
    constructor(codeString, language = 'javascript') {
        super();
        this.codeString = codeString;
        this.language = language;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(this.#template());
    }

    #template() {
        const template = document.createElement('template');
        template.innerHTML = `
            <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-javascript.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/prism.min.js"></script>
            <style>
                /* Prism.js theme */
                @import url('https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism-okaidia.min.css');
                pre {
                    background-color: #2d2d2d;
                    padding: 16px;
                    border-radius: 4px;
                    overflow: auto;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                code {
                    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
                    font-size: 14px;
                }
            </style>
            <pre><code class="language-${this.language}">${this.#escapeHTML(this.codeString)}</code></pre>
        `;

        return template.content.cloneNode(true);
    }

    connectedCallback() {
        // Highlight the code using Prism after the component is attached to the DOM
        Prism.highlightElement(this.shadowRoot.querySelector('code'));
    }

    // Helper function to escape HTML characters in the code
    #escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#39;');
    }
}

// Define the custom element
window.customElements.define('code-parser-component', CodeParserComponent);
