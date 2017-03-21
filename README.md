# Forge Graphics Server — a basic introduction

## Prerequisites
You need the following software to use the Forge Graphics Server:

- `node`
- `bower`
- A terminal to type commands at (e.g. Windows PowerShell)
- It is also recommended to have `git` installed and to know the basics of how to use it (here's a great tutorial/reference: https://www.atlassian.com/git/tutorials/what-is-version-control)

## Downloading
1. Run `git clone [url]` to clone the repository (the URL is probably `https://github.com/forgemedia/forge-graphics.git` or `http://bitbucket.org/forgemedia/forge-graphics.git`)
1. Run `cd [folder]` to change to the folder the repository was cloned to (probably `forge-graphics`)

## First-time setup and updating
1. (optional but recommended) Run `git pull` to check for and download updates. The default git branch is `varsity`, and some versions that were used live in Forge productions have tags.
1. Run `npm install`
1. Run `bower install`

## Usage
1. Run `node server.js`
1. The character generator can be found at `localhost:3000` (add this to a BrowserSource in OBS Studio)
1. The control dashboard can be found at `localhost:3000/dashboard` (in a web browser)

## Development
1. Run `grunt` to compile
1. Run `grunt watch` to watch for changes to JS and SCSS files
1. Run `node server.js --debug` to output debug messages
1. Use `nodemon` to monitor for changes to server.js as the server is running
1. Use `grunt dev` to run watch and `nodemon` (with debug) at the same time
