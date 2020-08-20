const draggable_list = document.getElementById('draggable-list');
const check = document.getElementById('check');

const richestPeople = [
    'Jeff Bezos',
    'Bill Gates',
    'Warren Buffett',
    'Bernard Arnault',
    'Carlos Slim Helu',
    'Amancio Ortega',
    'Larry Ellison',
    'Mark Zuckerberg',
    'Michael Bloomberg',
    'Larry Page'
  ];

  const listItems = [];

  let dragSrartIndex;

  createList();

  function createList() {
    [...richestPeople]
    .map(a => ({value: a, sort: Math.random()}))
    .sort((a, b) => a.sort - b.sort)
    .map(i => i.value)
    .forEach((person, index) => {
        const listItem = document.createElement('li');

        listItem.setAttribute('data-index', index);
        listItem.innerHTML = `
            <span class="number">${index + 1}</span>
            <div class="draggable" draggable="true">
                <p class="person-name">${person}</p>
                <i class="fas fa-grip-lines"></i>
            </div>
        `;

        listItems.push(listItem);

        draggable_list.appendChild(listItem);
    });

    addEventListeners();
  }

  function swapItems(fromIndex, toIndex) {

    const itemOne = listItems[fromIndex].querySelector('.draggable');
    const itemTwo = listItems[toIndex].querySelector('.draggable');

    listItems[toIndex].appendChild(itemOne);
    listItems[fromIndex].appendChild(itemTwo);
  }

  function checkOrder() {
    listItems.forEach((listItem, index) => {
        const personName = listItem.querySelector('.draggable').innerText.trim();

        if(personName === richestPeople[index]) {
            listItem.classList.add('right');
            listItem.classList.remove('wrong');
        }
        else {
            listItem.classList.add('wrong');
            listItem.classList.remove('right');
        }
    });
  }

  function dragStart(e) {
    dragStartIndex = +this.closest('li').getAttribute('data-index');
  }

  function dragOver(e) {
    e.preventDefault();
  }

  function dragDrop(e) {
    const dragEndIndex = +this.getAttribute('data-index');
    swapItems(dragStartIndex, dragEndIndex);
    this.classList.remove('over');
  }

  function dragEnter(e) {
    this.classList.add('over');
  }

  function dragLeave(e) {
    this.classList.remove('over');
  }

  function addEventListeners() {
      const draggables = document.querySelectorAll('.draggable');
      const draggableListItems = document.querySelectorAll('.draggable-list li');

      draggables.forEach(draggable => {
          draggable.addEventListener('dragstart', dragStart);
      });

      draggableListItems.forEach(item => {
        item.addEventListener('dragover', dragOver);
        item.addEventListener('drop', dragDrop);
        item.addEventListener('dragenter', dragEnter);
        item.addEventListener('dragleave', dragLeave);
    });
  }

  check.addEventListener('click', checkOrder);