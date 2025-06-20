// helper for dark/light mode toggle
(function () {
    const doc = document.documentElement;
    const stored = localStorage.getItem('theme');
    const initial = stored ? stored : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    doc.classList.toggle('dark', initial === 'dark');
    document.getElementById('theme-icon')?.classList.toggle('rotate-180', initial === 'dark');
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        doc.classList.toggle('dark');
        const now = doc.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', now);
        document.getElementById('theme-icon').classList.toggle('rotate-180', now === 'dark');
    });
})();

const grid = document.getElementById('grid');
const searchInput = document.getElementById('search');

fetch('assets/templates.json')
    .then(r => r.json())
    .then(data => {
        // initial render
        render(data);

        // search
        const fuse = new Fuse(data, {
            keys: ['name', 'title', 'description', 'creator'],
            threshold: 0.3,
            ignoreLocation: true,
        });

        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.trim();
            const results = q ? fuse.search(q).map(res => res.item) : data;
            render(results);
        });
    })
    .catch(err => {
        grid.innerHTML = `<p class="text-red-600">Failed to load templates: ${err}</p>`;
        console.error(err);
    });

function render(list) {
    grid.innerHTML = '';
    if (!list.length) {
        grid.innerHTML = '<p class="col-span-full text-center text-slate-500">No templates found.</p>';
        return;
    }
    const fragment = document.createDocumentFragment();
    for (const t of list) {
        fragment.appendChild(card(t));
    }
    grid.appendChild(fragment);
}

function card(t) {
    const div = document.createElement('div');
    div.className = 'rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:bg-slate-800 dark:border-slate-700';
    div.innerHTML = `
        <div class="p-4 space-y-2">
            <h2 class="font-medium line-clamp-2">${t.title}</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">${t.description}</p>
        </div>
        <div class="p-4 flex items-center justify-between text-sm border-t border-slate-100 dark:border-slate-700">
            <span class="font-semibold">${t.creator}</span>
            <a href="${t.youtube_url}" target="_blank" class="text-indigo-600 hover:underline">Demo</a>
        </div>
    `;
    return div;
}
