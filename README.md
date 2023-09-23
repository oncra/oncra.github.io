# ONCRA - Above Ground Carbon Data Tool

Website is hosted at https://oncra.github.io/

## Development Setup 
First, install [node](https://nodejs.org/en) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

Then install the relevant project dependencies:
```
npm i
```

### To run the page locally, run:
```
npm run dev
```


### To deploy to GitHub Pages, run the command:
```
npm run deploy
```
so that it'll be deployed to a new branch `gh-pages`.


### To Do List
- Handle KML polygon longitude at around 180, due to map wrapping at lon 180 (or -180)