export default async function decorate(block) {
  const articleLists = block.querySelector('a[href$=".json"]');

  async function loadArticles() {
    const resp = await fetch(articleLists.href);
    const json = await resp.json();

    const data = json.data.filter((row) => row.template === 'magazine');

    data.forEach((row) => {
      const articleDiv = document.createElement('div');
      articleDiv.classList.add('article-item');

      const link = document.createElement('a');
      link.href = row.path;

      const img = document.createElement('img');
      img.src = row.image;
      img.alt = row.name;

      const title = document.createElement('h3');
      title.textContent = row.title;

      const paragraph = document.createElement('p');
      paragraph.textContent = row.description;

      link.appendChild(img);
      link.appendChild(title);
      articleDiv.appendChild(link);
      articleDiv.appendChild(paragraph);

      block.appendChild(articleDiv);
    });

    articleLists.replaceWith();
  }

  if (articleLists) {
    loadArticles();
  }
}
