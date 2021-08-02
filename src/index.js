app();

async function app() {
  const quoteData = await fetch('http://localhost:3000/quotes?_embed=likes').then(res => res.json());
  const quoteForm = document.getElementById('new-quote-form');
  const quoteList = document.getElementById('quote-list');
  const sortButton = document.getElementById('sort-button');
  let isSorted = false;

  sortButton.addEventListener('click', () => {
    if (isSorted) {
      quoteData.sort((first, second) => first.id - second.id);
      console.table(quoteData)
      quoteList.innerHTML = '';
      renderQuotes(quoteData);
    } else {
      quoteData.sort((first, second) => {
        const auth1 = first.author.toUpperCase();
        const auth2 = second.author.toUpperCase();
        return auth1 < auth2 ? -1 : auth1 > auth2 ? 1 : 0;
      });
      console.table(quoteData)
      quoteList.innerHTML = '';
      renderQuotes(quoteData);
    }
    isSorted = !isSorted;
    sortButton.classList.toggle('btn-dark');
    sortButton.classList.toggle('btn-light');
  })

  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const quote = e.target['quote'].value;
    const author = e.target['author'].value;
    fetch('http://localhost:3000/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ quote, author })
    }).then(res => res.json())
      .then(quoteDatum => {
        const newQuote = { ...quoteDatum, likes: [] }
        renderQuote(newQuote);
        quoteList.push(newQuote);
      });
    e.target.reset();
  });

  renderQuotes(quoteData);

  function renderQuote(quoteDatum) {
    const quoteCard = document.createElement('li');
    quoteCard.classList.add('card', 'quote-card');

    const blockQuote = document.createElement('blockquote');
    blockQuote.classList.add('blockquote');

    const quoteText = document.createElement('p');
    quoteText.classList.add('mb-0');
    quoteText.innerText = quoteDatum.quote;

    const quoteFooter = document.createElement('footer');
    quoteFooter.classList.add('blockquote-footer');
    quoteFooter.innerText = quoteDatum.author;

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('btn-group');

    const likeButton = document.createElement('button');
    likeButton.classList.add('btn', 'btn-success');
    const likeSpan = document.createElement('span');
    likeSpan.innerText = quoteDatum.likes.length;
    likeSpan.classList.add('badge', 'badge-danger', 'badge-pill')
    likeButton.append('Likes ', likeSpan);
    likeButton.addEventListener('click', () => {
      const timeLiked = Math.floor(Date.now() / 1000);
      fetch('http://localhost:3000/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          quoteId: quoteDatum.id,
          createdAt: timeLiked,
        })
      }).then(res => res.json())
        .then((likeDatum) => {
          quoteDatum.likes = [...quoteDatum.likes, likeDatum];
          likeSpan.innerText = quoteDatum.likes.length;
        })
    })

    const editButton = document.createElement('button');
    editButton.classList.add('btn', 'btn-primary');
    editButton.innerText = 'Edit';
    editButton.addEventListener('click', () => {
      const editCard = renderEditQuote(quoteDatum);
      quoteList.replaceChild(editCard, quoteCard);
    })

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', () => {
      fetch(`http://localhost:3000/quotes/${quoteDatum.id}`, {
        method: 'DELETE',
      }).then(() => {
        quoteCard.remove();
      })
    })

    buttonGroup.append(likeButton, editButton, deleteButton);

    blockQuote.append(
      quoteText,
      quoteFooter,
      document.createElement('br'),
      buttonGroup
    );
    quoteCard.appendChild(blockQuote);
    return quoteCard;
  }

  function renderEditQuote(quoteDatum) {
    const quoteCard = document.createElement('li');
    quoteCard.classList.add('card', 'quote-card', 'edit-card');

    const quoteEditForm = document.createElement('form');

    const quoteGroup = document.createElement('div');
    quoteGroup.classList.add('form-group');
    const quoteLabel = document.createElement('label');
    quoteLabel.innerText = 'Edit Author';
    quoteLabel.for = `quote-${quoteDatum.id}-quote`;
    const quoteText = document.createElement('input');
    quoteText.value = quoteDatum.quote;
    quoteText.type = 'text';
    quoteText.id = `quote-${quoteDatum.id}-quote`;
    quoteText.name = `quote-${quoteDatum.id}-quote`;
    quoteText.classList.add('form-control');
    quoteGroup.append(quoteLabel, quoteText);

    const authorGroup = document.createElement('div');
    authorGroup.classList.add('form-group');
    const authorLabel = document.createElement('label');
    authorLabel.innerText = 'Edit Author';
    authorLabel.for = `quote-${quoteDatum.id}-author`;
    const authorText = document.createElement('input');
    authorText.value = quoteDatum.author;
    authorText.type = 'text';
    authorText.id = `quote-${quoteDatum.id}-author`;
    authorText.name = `quote-${quoteDatum.id}-author`;
    authorText.classList.add('form-control');
    authorGroup.append(authorLabel, authorText);

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('btn-group');

    const saveButton = document.createElement('button');
    saveButton.classList.add('btn', 'btn-primary');
    saveButton.innerText = 'Save';
    saveButton.type = 'submit';
    saveButton.addEventListener('click', (e) => {
      e.preventDefault();
      fetch(`http://localhost:3000/quotes/${quoteDatum.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          quote: quoteText.value,
          author: authorText.value,
        })
      }).then(res => res.json())
        .then((data) => {
          quoteDatum.author = data.author;
          quoteDatum.quote = data.quote;
          const viewCard = renderQuote(quoteDatum);
          quoteList.replaceChild(viewCard, quoteCard);
        })
    })

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('btn', 'btn-secondary');
    cancelButton.innerText = 'Cancel';
    cancelButton.type = 'button';
    cancelButton.addEventListener('click', () => {
      const viewCard = renderQuote(quoteDatum);
      quoteList.replaceChild(viewCard, quoteCard);
    })

    buttonGroup.append(saveButton, cancelButton)

    quoteEditForm.append(
      quoteGroup,
      authorGroup,
      buttonGroup
    );
    quoteCard.appendChild(quoteEditForm);
    return quoteCard;
  }

  function renderQuotes(quoteData) {
    quoteData.forEach(quoteDatum => quoteList.appendChild(renderQuote(quoteDatum)));
  }
}