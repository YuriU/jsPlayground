
/* global renderFacet, renderResult, renderFilter, autocomplete, stopwords, SearchIndex, fetch */

let si = null;
const buildIndexBtn = document.getElementById('build-index-btn');


buildIndexBtn.addEventListener('click', async () => {
  if(si) {

    

    console.log(si);
    const results = await si.QUERY('file', { DOCUMENTS: true })

    
    
    console.log(results);

    const results2 = await si.DICTIONARY('file');
    console.log(results2);
  }
});

// listen for typing and create suggestions. Listen for clicked
// suggestions
autocomplete('#query', { hint: false }, [{
  source: (query, cb) => (query.length >= 3)
    ? si.DICTIONARY(query).then(cb)
    // eslint-disable-next-line
    : cb([]),
  templates: { suggestion: suggestion => suggestion }
}]).on('autocomplete:selected', function (event, suggestion) {
  //search(suggestion)
  console.log(suggestion);
})


/* INITIALIZE */
Promise.all([
  SearchIndex({
    name: 'mySearchIndex',
    stopwords: []
  }),
  fetch('data/en_US.json').then(res => res.json())
]).then( async ([thisSi, data ]) => {
  // set global variable (in practice you might not want to do this)
  si = thisSi

  //console.log(data)

  //await si.FLUSH()
  //await si.PUT(data);
  const converted = data.map(i => ({ 
    title: i.Title,
    description: i.Description ? i.Description : '',
    body: i.Body ? i.Body : ''
  }));

  await si.PUT(converted)
  
  // replicate pregenerated index
  //si.IMPORT(dump).then(search)
}).catch(console.log)
