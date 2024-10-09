import { MUI } from "/js/mui.js";  // Assuming you're using MUI like before

export class RepoCard extends MUI {
    constructor(data) {
        super();
        this.data = data;
        this.owner = data.owner;
        this.name = data.name;
        this.repoPath = data.html_url;
        this.forksPath = `/api/forks/${this.owner.login}/${this.name}`;  // Assuming you have a route to fetch forks
        this.forksCount = data.forks_count;  // Get the number of forks from the data
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(this.#template());
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
                    <div style="display: flex; align-items: center;">
                        <a href="${this.repoPath}" target="_blank">View on GitHub</a>
                        <span style="margin: 0 10px;">|</span>
                        <a href="${this.forksPath}" target="_blank">View all Forks</a>
                        <span style="margin-left: 10px; font-weight: bold;">(${this.forksCount})</span>
                    </div>
                </div>
            </div>
        `;
        return template.content.cloneNode(true);
    }
}

// Define the custom element
window.customElements.define("repo-card", RepoCard);



// async function init() {
//     try {
//         // Fetch the repositories from your custom backend
//         const response = await fetch('/api/repos/ntijoh-linus-andersson');  // Replace 'octocat' with the GitHub username
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const repos = await response.json();  // Parse the JSON response
//         console.log(repos);

//         // Loop through the repositories and create a RepoCard for each
//         repos.forEach(repo => {
//             const repoCard = new RepoCard(repo);  // No need to pass filePath since you don't need to fetch README.md
//             document.querySelector("body").appendChild(repoCard);  // Append RepoCard to the body
//         });

//     } catch (error) {
//         console.error('Error fetching repositories:', error);
//     }
// }

// init();