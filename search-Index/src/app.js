
/* global renderFacet, renderResult, renderFilter, autocomplete, stopwords, SearchIndex, fetch */

let si = null;
const buildIndexBtn = document.getElementById('build-index-btn');
const resultList = document.getElementById('result');
const buildIndexLocale = document.getElementById('build-index-locale');


buildIndexBtn.addEventListener('click', async () => {
  if(si) {
    console.log(buildIndexLocale.value);
    const response = await fetch(`data/${buildIndexLocale.value}.json`);
    const data = await response.json();

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
  }
});

// search
const searchQuery = q => [{
  SEARCH: q
}, {
  DOCUMENTS: true
}]

const emptySearchQuery = () => [{
  DOCUMENTS: true
}, {
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
  //fetch('data/en_US.json').then(res => res.json())
]).then( async ([thisSi]) => {
  // set global variable (in practice you might not want to do this)
  si = thisSi

  /*const converted = data.map(i => ({ 
    title: i.Title,
    description: i.Description ? i.Description : '',
    body: i.Body ? i.Body : '',
    url: i.Url ? i.Url : ''
  }));

  await si.IMPORT([]);
  await si.PUT(converted, {
    doNotIndexField: ['url']
  })*/
  
  // replicate pregenerated index
  //si.IMPORT(dump).then(search)
}).catch(console.log)
