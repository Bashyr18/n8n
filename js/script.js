import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@7/dist/fuse.esm.js";

const grid   = document.getElementById("grid");
const search = document.getElementById("search");
const cardTpl = document.getElementById("card");

let data = [];
let fuse;

fetch("assets/templates.json")
  .then(r => r.json())
  .then(list => {
    data = list;
    fuse = new Fuse(data, {
      keys: ["title", "description", "creator"],
      threshold: 0.3
    });
    render(list);
  });

function render(list) {
  grid.innerHTML = "";
  for (const t of list) {
    const node = cardTpl.content.cloneNode(true);
    node.querySelector(".title").textContent = t.title || t.name || "Untitled";
    node.querySelector(".desc").textContent  = (t.description || "").slice(0, 120);
    const meta = [];
    if (t.creator) meta.push(t.creator);
    if (t.date_posted) meta.push(new Date(t.date_posted).toISOString().slice(0, 10));
    node.querySelector(".meta").textContent = meta.join(" • ");
    node.querySelector(".btn").href = t.youtube_url || t.template_url || t.resource_url || "#";
    grid.appendChild(node);
  }
}

search.addEventListener("input", e => {
  const q = e.target.value.trim();
  render(q ? fuse.search(q).map(r => r.item) : data);
});