export default async function decorate(block) {
  const createArticleElement = (article) => {
    const articleDiv = document.createElement('div');
    articleDiv.classList.add('article-item');

    const link = document.createElement('a');
    link.href = article.path;

    const img = document.createElement('img');
    img.src = article.image;
    img.alt = article.name;

    const title = document.createElement('h3');
    title.textContent = article.title;

    const paragraph = document.createElement('p');
    paragraph.textContent = article.description;

    link.appendChild(img);
    link.appendChild(title);
    articleDiv.appendChild(link);
    articleDiv.appendChild(paragraph);

    return articleDiv;
  };

  const loadArticles = async (data) => {
    try {
      const response = await fetch(data);
      if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
      const json = await response.json();
      const filteredArticles = json.data.filter((article) => article.template === 'magazine');
      filteredArticles.forEach((article) => {
        const articleElement = createArticleElement(article);
        block.appendChild(articleElement);
      });
    } catch (error) {
      // console.log(error);
    }
  };

  const articleListLink = block.querySelector('a[href$=".json"]');

  if (articleListLink) {
    const articledata = articleListLink.href;
    await loadArticles(articledata);
    articleListLink.remove();
  }
}
