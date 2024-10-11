export class LoginEvent extends CustomEvent {
    constructor(username) {
        super("loginEvent", 
            { 
                bubbles: true, 
                composed: true, 
                detail: { username: username } 
            });
    }
}

export class Login extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(this.#template());
    }

    connectedCallback(){
        this.shadowRoot.querySelector('#loginBtn').addEventListener('click', this.#handleLogin.bind(this));
    }

    disconnectedCallback(){
        this.shadowRoot.querySelector('#loginBtn').removeEventListener('click', this.#handleLogin.bind(this));
    }

    async #handleLogin(e){
        e.preventDefault();
        const username = e.target.querySelector('#username').value
        const password = e.target.querySelector('#password').value
        
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })  // Convert data to JSON string
        });

        if (!response.ok) {
            throw new Error (`HTTP error! Status: ${response.status}`);
        } else {
            this.parentNode.dispatchEvent(new LoginEvent(username));
        }
    }

    #template(){
        const template = document.createElement('template');
        template.innerHTML = `
        <style>
            container1 {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }

            .container2 {
                background: white;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                padding: 20px;
                width: 500px; /* Bredden på containern */
            }

            h1 {
                text-align: center;
                margin-bottom: 20px;
            }

            .login-options {
                display: flex;
                flex-direction: column;
            }

            .option {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: #f9f9f9;
            }

            input[type="text"],
            input[type="password"] {
                width: 100%; /* Gör så att de fyller hela bredden på containern */
                max-width: 445px; /* Sätter en maximal bredd på inmatningsfälten */
                padding: 10px;
                margin: 10px 0;
                border: 1px solid #ccc;
                border-radius: 4px;
            }

            button {
                width: 100%; /* Gör knappen lika bred som inmatningsfälten */
                padding: 10px;
                background-color: #5cb85c;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            button:hover {
                background-color: #4cae4c;
            }

            .github-button {
                display: inline-block;
                padding: 10px 15px;
                background-color: #333;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                text-align: center;
            }

            .github-button:hover {
                background-color: #555;
            }
        </style>
        <div class="container1">
            <div class="container2">
                <h1>Inloggning</h1>
                <div class="login-options">
                    <div class="option teacher-option">
                        <h2>Lärare</h2>
                        <form action="/login" method="POST">
                            <input id="username" type="text" placeholder="Användarnamn" name="username" required>
                            <input id="password" type="password" placeholder="Lösenord" name="password" required>
                            <button id="loginBtn" type="submit">Logga in</button>
                        </form>
                    </div>
                    <div class="option student-option">
                        <h2>Elev</h2>
                        <p>Logga in med GitHub:</p>
                        <a href="/auth/github" class="github-button">Login with GitHub</a>
                    </div>
                </div>
            </div>
        </div>    
        `;
        return template.content.cloneNode(true);
    }
}

window.customElements.define("Login", Login);