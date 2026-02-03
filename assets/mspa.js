async function updatePage(path) {
  let json = await fetch(`${path}/index.json`).then((r) => r.json());
  document.title = `${json.meta["project_name"]} - ${json.meta["name"]}`;
  descriptionTag.content = json.meta["description"];
  content.innerHTML = `<h1>${json.meta["name"]}</h1>${json.page_content}`;
  postUpdate();
}

function getCurrentAnchor() {
  let href = window.location.href;
  return Array.from(document.querySelectorAll("nav ul a")).find(
    (link) => link.href.toLowerCase() === href.toLowerCase(),
  );
}

function postUpdate() {
  if (currentAnchor) {
    currentAnchor.classList.remove("active");
  }

  show_nav.checked = false;
  currentAnchor = getCurrentAnchor();
  currentAnchor.classList.add("active");

  for (let h2 of document.getElementsByTagName("h2")) {
    h2.classList.add("anchor");
    h2.id = h2.innerText.toLowerCase().replace(/[^a-z0-9]/g, "-");

    h2.addEventListener("click", (e) => {
      e.target.scrollIntoView();
      history.pushState({}, "", `#${h2.id}`);
      navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}#${h2.id}`,
      );
    });
  }

  if (typeof hljs === "object") hljs.highlightAll();

  if (typeof katex === "object")
    for (let elem of document.getElementsByClassName("math")) {
      katex.render(elem.textContent, elem, {});
    }
}

let currentAnchor = undefined;
let currentPath = window.location.pathname;
let descriptionTag = document.querySelector('meta[name="description"]');

window.addEventListener("popstate", async (_) => {
  if (window.location.pathname == currentPath) {
    return;
  }

  currentPath = window.location.pathname;
  await updatePage(window.location.href);
});

window.addEventListener("click", (e) => {
  let targetAnchor = e.target.closest("a");
  if (!targetAnchor || !targetAnchor.hasAttribute("href")) {
    return;
  }

  href = targetAnchor ? targetAnchor.href : e.target.href;
  e.preventDefault();

  if (href == window.location.href) {
    return;
  }

  if (href.startsWith(window.location.origin)) {
    e.preventDefault();
    updatePage(href);
    window.history.pushState({}, "", href);
  }
});

postUpdate();
