
/* global renderFacet, renderResult, renderFilter, autocomplete, stopwords, SearchIndex, fetch */

let si = null;
const resultList = document.getElementById('result');
const buildIndexLocale = document.getElementById('build-index-locale');
const buildIndexBtn = document.getElementById('build-index-btn');
const exportIndexBtn = document.getElementById('export-index-btn');
const importIndexLocale = document.getElementById('import-index-locale');
const importIndexBtn = document.getElementById('import-index-btn');
const clearIndexBtn = document.getElementById('clear-index-btn');


/* Build index from RAW data { title, description, body, url } */
buildIndexBtn.addEventListener('click', async () => {
  if(si) {
    try {

      buildIndexBtn.disabled = true;
      
      // Load raw data for locale
      const response = await fetch(`data/${buildIndexLocale.value}.json`);
      const data = await response.json();
  
      // Map & normalize data. No empty fields allowed
      const converted = data.map(i => ({ 
        title: i.Title,
        description: i.Description ? i.Description : '',
        body: i.Body ? i.Body : '',
        url: i.Url ? i.Url : ''
      }));
  
      // Clear current state
      await si.IMPORT([]);

      // Put raw data to index
      await si.PUT(converted, {
        doNotIndexField: ['url']
      });

      buildIndexBtn.disabled = false;
    }
    catch(err) {
      buildIndexBtn.disabled = false;
    }
  }
});

/* Export index to json file */
exportIndexBtn.addEventListener('click', async () => {
  if(si) {

    try {
      exportIndexBtn.disabled = true;

      // Export index
      const index = await si.EXPORT();
      
      // Download file pattern
      var blob = new Blob([JSON.stringify(index)], { type: 'application/json' });
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = buildIndexLocale.value + '_index.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      exportIndexBtn.disabled = false;
    }
    catch(err) {
      exportIndexBtn.disabled = false;
    }
  }
});

/* Clear index */
clearIndexBtn.addEventListener('click', async () => {
  if(si) {
    // Replace with empty data
    await si.IMPORT([]);
  }
});

/* Import built index */
importIndexBtn.addEventListener('click', async () => {
  if(si) {
    try {
      importIndexBtn.disabled = true;
      console.log('Importing');
      console.log(importIndexLocale.value);

      // Download index
      const response = await fetch(`indexes/${importIndexLocale.value}_index.json`);
      const data = await response.json();

      // Clear existing one
      await si.IMPORT([]);

      // Import downloaded index
      await si.IMPORT(data);

      console.log('Imported');
      importIndexBtn.disabled = false;
    }
    catch(err) {
      importIndexBtn.disabled = false;
    } 
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
}, {}
]

/* Search */
const search = (q = '') => {
  queryState = q
  const queryTokens = q.split(/\s+/).filter(item => item)
  return (
    (queryTokens.length)
      ? si.QUERY(...searchQuery(queryTokens))
      : si.QUERY(...emptySearchQuery())
  ).then(result => renderResults(queryTokens, result))
}


/* Draw result list */
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
  source: async (query, cb) =>  {

    if(query.length >= 3) {
      const results = await si.DICTIONARY(query);
      console.log(results);
      return cb(results);
    }
    else {
      return cb([]);
    }
  },
  templates: { suggestion: suggestion => suggestion }
}]).on('autocomplete:selected', async function (event, suggestion) {
  
  document.getElementById('query').value = suggestion;
  search(suggestion);
})


/* INITIALIZE */

SearchIndex({
  name: 'mySearchIndex',
  stopwords: []
})
.then(thisSi => {
  // set global variable (in practice you might not want to do this)
  // Replace to require or import
  si = thisSi;
})
