import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

// Function to handle toggling of all nav sections
const toggleAllNavSections = (sections, expanded = false) => {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
};

// Function to handle menu toggling
const toggleMenu = (nav, navSections, forceExpanded = null) => {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  // Function to handle closing on escape keypress
  const closeOnEscape = (e) => {
    if (e.code === 'Escape') {
      const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
      if (navSectionExpanded && isDesktop.matches) {
        toggleAllNavSections(navSections);
        navSectionExpanded.focus();
      } else if (!isDesktop.matches) {
        toggleMenu(nav, navSections);
        nav.querySelector('button').focus();
      }
    }
  };

  // Function to handle closing on focus lost
  const closeOnFocusLost = (e) => {
    if (!nav.contains(e.relatedTarget)) {
      const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
      if (navSectionExpanded && isDesktop.matches) {
        toggleAllNavSections(navSections, false);
      } else if (!isDesktop.matches) {
        toggleMenu(nav, navSections, false);
      }
    }
  };

  // Enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
};

// Define handleScroll function
const handleScroll = () => {
  const navWrapper = document.querySelector('.nav-wrapper');
  if (window.scrollY > 0) {
    navWrapper.classList.add('scroll-shadow');
  } else {
    navWrapper.classList.remove('scroll-shadow');
  }
};

// Main decorate function
export default async function decorate(block) {
  // Create navWrapper and navContainer
  const navWrapper = document.createElement('div');
  const navContainer = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navContainer.className = 'nav-container';

  // Load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // Decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['header-top', 'brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }
  // search  functionality start
  const search = nav.querySelector('.nav-tools p');
  if (search) {
    const searchForm = document.createElement('form');
    searchForm.action = 'https://www.google.com/search';
    searchForm.method = 'GET';
    searchForm.target = '_blank';
    // Create search input element
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'search-field';
    searchInput.name = 'q';
    searchInput.placeholder = 'SEARCH';
    searchForm.appendChild(searchInput);
    search.appendChild(searchForm);
  }
  // search  functionality  end

  const navSections = nav.querySelector('.nav-sections');
  const navLinks = navSections.querySelectorAll('a');

  // Add 'active' class to the current page link
  const currentUrl = window.location.pathname;
  navLinks.forEach((link) => {
    if (link.getAttribute('href') === currentUrl) {
      link.classList.add('active');
    }

    link.addEventListener('click', (event) => {
      event.preventDefault();
      navLinks.forEach((e) => e.classList.remove('active'));
      link.classList.add('active');
      window.location.href = link.getAttribute('href');
    });
  });

  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // Hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // Prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const headerTop = nav.querySelector('.header-top');
  navContainer.append(nav);
  navWrapper.append(navContainer);

  block.append(navWrapper);
  if (headerTop) {
    block.prepend(headerTop);
  }

  // Attach the handleScroll function to the scroll event
  window.addEventListener('scroll', handleScroll);
  // Initial check in case the page is already scrolled
  handleScroll();
}
