export class MUI extends HTMLElement {
    constructor() {
        super();
    }

    muiDefault() {
        return `
            <!-- MDL CSS -->
            <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css"> 
            <!-- Materialize CSS -->
            <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
            <!-- Materialize Icons (optional) -->
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        `
    }
}