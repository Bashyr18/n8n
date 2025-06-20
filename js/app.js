
import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@7/dist/fuse.esm.js';

// Theme handling ----------------------------------------------------------------
const root   = document.documentElement;
const toggle = document.getElementById('themeToggle');
const icon   = document.getElementById('themeIcon');

const moonSVG = '<path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />';
const sunSVG  = '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414M18.364 18.364l-1.414-1.414M6.05 6.05L4.636 4.636" />';

function setIcon(isDark){ icon.innerHTML = isDark ? sunSVG : moonSVG; }

function applyTheme(theme){
  const isDark = theme === 'dark';
  root.classList.toggle('dark', isDark);
  setIcon(isDark);
}

// initial
const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(stored ?? (prefersDark ? 'dark' : 'light'));

toggle.addEventListener('click', () => {
  const nowDark = !root.classList.contains('dark');
  applyTheme(nowDark ? 'dark' : 'light');
  localStorage.setItem('theme', nowDark ? 'dark' : 'light');
});

// Gallery logic -----------------------------------------------------------------
const grid     = document.getElementById('grid');
const searchEl = document.getElementById('search');
const cardTpl  = document.getElementById('cardTpl');
const emptyTpl = document.getElementById('emptyTpl');

let data = [];
let fuse;

async function loadJSON(){
  try{
    const res = await fetch('assets/templates.json');
    if(!res.ok) throw new Error('HTTP ' + res.status);
    data = await res.json();
    fuse = new Fuse(data, { keys:['title','description','creator'], threshold:0.35 });
    render(data);
  }catch(err){
    grid.innerHTML = '<p class="col-span-full py-20 text-center text-red-600">Failed to load templates.</p>';
    console.error(err);
  }
}

function templateURL(t){
  return t.template_url || t.youtube_url || t.resource_url || '#';
}

function render(list){
  grid.innerHTML = '';
  if(list.length === 0){
    grid.appendChild(emptyTpl.content.cloneNode(true));
    return;
  }
  for(const t of list){
    const node = cardTpl.content.cloneNode(true);
    node.querySelector('h2').textContent = t.title || t.name || 'Untitled';
    node.querySelector('p').textContent  = (t.description || '').trim();
    const meta = [];
    if(t.creator) meta.push(t.creator);
    if(t.date_posted) meta.push(new Date(t.date_posted).toISOString().slice(0,10));
    node.querySelector('p + p').textContent = meta.join(' • ');
    node.querySelector('a').href = templateURL(t);
    grid.appendChild(node);
  }
}

searchEl.addEventListener('input', e => {
  const q = e.target.value.trim();
  render(q ? fuse.search(q).map(r=>r.item) : data);
});

loadJSON();
