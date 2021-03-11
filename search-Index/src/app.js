
/* global renderFacet, renderResult, renderFilter, autocomplete, stopwords, SearchIndex, fetch */

let si = null;
const buildIndexBtn = document.getElementById('build-index-btn');
const resultList = document.getElementById('result');


buildIndexBtn.addEventListener('click', async () => {
  if(si) {

    console.log(si);
    const results = await si.QUERY('file', { DOCUMENTS: true })

    
    
    //console.log(results);

    const results2 = await si.DICTIONARY('file');

    console.log(results2);

    /*const exported = await si.EXPORT();
    console.log(exported);*/
  }
});

// search
const searchQuery = q => [{
  SEARCH: q
}, {
  /*FACETS: [{
    FIELD: ['title']
  }],*/
  DOCUMENTS: true
}]

const emptySearchQuery = () => [{
  DOCUMENTS: true
}, {
  /*FACETS: [{
    FIELD: ['title']
  }]*/
}]


const search = (q = '') => {
  queryState = q
  const queryTokens = q.split(/\s+/).filter(item => item)
  return (
    (queryTokens.length)
      ? si.QUERY(...searchQuery(queryTokens))
      : si.QUERY(...emptySearchQuery())
  ).then(result => renderResults(queryTokens, result))
}

const renderResults = (q, { RESULT }) => {

  resultList.innerHTML = '';
  for(el of RESULT) {
    const child = document.createElement('li');
    console.log(el);
    child.innerHTML = `<a href="${el._doc.url}" target="_blank">${el._doc.title}</a>`;
    resultList.appendChild(child)
  }
  
  console.log(q);
}

// listen for typing and create suggestions. Listen for clicked
// suggestions
autocomplete('#query', { hint: false }, [{
  source: (query, cb) => (query.length >= 3)
    ? si.DICTIONARY(query).then(cb)
    // eslint-disable-next-line
    : cb([]),
  templates: { suggestion: suggestion => suggestion }
}]).on('autocomplete:selected', async function (event, suggestion) {
  
  document.getElementById('query').value = suggestion;
  search(suggestion);
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

  const converted = data.map(i => ({ 
    title: i.Title,
    description: i.Description ? i.Description : '',
    body: i.Body ? i.Body : '',
    url: i.Url ? i.Url : ''
  }));

  await si.IMPORT([]);
  await si.PUT(converted, {
    doNotIndexField: ['url']
  })
  
  // replicate pregenerated index
  //si.IMPORT(dump).then(search)
}).catch(console.log)
