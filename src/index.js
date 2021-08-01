app();

async function app() {
  const quoteData = await fetch('http://localhost:3000/quotes?_embed=likes').then(res => res.json());
  const quoteForm = document.getElementById('new-quote-form');
  const quoteList = document.getElementById('quote-list');

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

    const likeButton = document.createElement('button');
    likeButton.classList.add('btn-success');
    const likeSpan = document.createElement('span');
    likeSpan.innerText = quoteDatum.likes.length;
    likeButton.append('Likes: ', likeSpan);
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

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn-danger');
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', () => {
      fetch(`http://localhost:3000/quotes/${quoteDatum.id}`, {
        method: 'DELETE',
      }).then(() => {
        quoteCard.remove();
      })
    })

    blockQuote.append(
      quoteText,
      quoteFooter,
      document.createElement('br'),
      likeButton,
      deleteButton
    );
    quoteCard.appendChild(blockQuote);
    quoteList.appendChild(quoteCard);
  }

  function renderQuotes(quoteData) {
    quoteData.forEach(quoteDatum => renderQuote(quoteDatum));
  }
}