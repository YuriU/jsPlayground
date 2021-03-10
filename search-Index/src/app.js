
/* global renderFacet, renderResult, renderFilter, autocomplete, stopwords, SearchIndex, fetch */

let si = null;
const buildIndexBtn = document.getElementById('build-index-btn');


buildIndexBtn.addEventListener('click', async () => {
  if(si) {

    

    console.log(si);
    const results = await si.QUERY('мир', { DOCUMENTS: true })
    
    console.log(results);
  }
});


/* INITIALIZE */
Promise.all([
  SearchIndex({
    name: 'mySearchIndex',
    stopwords: []
  }),
  //fetch('generate-index/EarthPorn-top-search-index.json').then(res => res.json())
]).then( async ([thisSi]) => {
  // set global variable (in practice you might not want to do this)
  si = thisSi

  //await si.FLUSH()
  await si.PUT([{
    name: 'Hello',
    value: 'World'
  }])

  await si.PUT([{
    name: 'Мир',
    value: 'Труд'
  }])

  // replicate pregenerated index
  //si.IMPORT(dump).then(search)
}).catch(console.log)
