import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // Create a new <ul> element
  const ul = document.createElement('ul');

  // Iterate over each child element of the block
  [...block.children].forEach((row) => {
    // Create a new <li> element for each row
    const li = document.createElement('li');
    // Iterate over each child element of the row
    [...row.children].forEach((div) => {
      // Create a new <div> element and set its class
      const divElement = document.createElement('div');
      divElement.className = div.children.length === 1 && div.querySelector('picture') ? 'writer-image' : 'writer-body';

      // Append the child elements to the new <div>
      while (div.firstElementChild) {
        divElement.append(div.firstElementChild);
      }

      // Append the new <div> to the <li>
      li.append(divElement);
    });

    // Append the <li> to the <ul>
    ul.append(li);
  });

  // Replace <picture> elements with optimized images
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  // Clear the block content and append the new <ul>
  block.textContent = '';
  block.append(ul);
}
