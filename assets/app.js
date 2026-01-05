/**
 * Basecase Architecture Guide - Main Application Logic
 * Professional theme engine and content management
 */

// Global systems data
// Note: In production, this can be loaded from systems.json via fetch
// For local development (file:// protocol), data is embedded here
let SYSTEMS = [
    {
        "id": "global-sequencer",
        "title": "Global Sequencer",
        "category": "Distributed",
        "icon": "cpu",
        "description": "High-throughput unique ID generation using the Snowflake algorithm for chronological sorting.",
        "stack": ["Snowflake-ID", "Rust", "gRPC"],
        "adr": {
            "problem": "Why not use UUIDs? While 128-bit UUIDs are globally unique, they introduce major bottlenecks at scale: index fragmentation and lack of sorting capability.",
            "context": "This system relies on <span class='inline-link' onclick='showDetail(\"distributed-consensus\")'>Consensus</span> and <span class='inline-link' onclick='showDetail(\"lsm-tree\")'>LSM-Trees</span>.",
            "decision": "Implement a structured Snowflake generator. Explore the sub-components in the blueprint below.",
            "architecture": "<div class=\"my-10 p-10 rounded-2xl border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-inner overflow-hidden\"><svg viewBox=\"0 0 600 340\" class=\"w-full h-auto\"><g class=\"bp-node\" onclick=\"showDetail('global-sequencer')\"><rect x=\"200\" y=\"20\" width=\"200\" height=\"70\" rx=\"12\" /><text x=\"300\" y=\"60\" text-anchor=\"middle\">Sequencer Node</text></g><path d=\"M300 90 V 160\" class=\"bp-line\" /><path d=\"M300 160 H 100 V 220\" class=\"bp-line\" /><path d=\"M300 160 H 500 V 220\" class=\"bp-line\" /><g class=\"bp-node\" onclick=\"showDetail('distributed-consensus')\"><rect x=\"25\" y=\"220\" width=\"150\" height=\"60\" rx=\"12\" /><text x=\"100\" y=\"255\" text-anchor=\"middle\">Consensus</text></g><g class=\"bp-node\" onclick=\"showDetail('bloom-filter')\"><rect x=\"225\" y=\"220\" width=\"150\" height=\"60\" rx=\"12\" /><text x=\"300\" y=\"255\" text-anchor=\"middle\">Bloom Filter</text></g><g class=\"bp-node\" onclick=\"showDetail('lsm-tree')\"><rect x=\"425\" y=\"220\" width=\"150\" height=\"60\" rx=\"12\" /><text x=\"500\" y=\"255\" text-anchor=\"middle\">LSM-Tree</text></g></svg></div><h3>Snowflake vs. UUID Showdown</h3><table class=\"ui-table\"><thead><tr><th>Feature</th><th>UUID v4</th><th>Snowflake</th></tr></thead><tbody><tr><td><strong>Bit Size</strong></td><td>128-bit</td><td>64-bit</td></tr><tr><td><strong>Ordering</strong></td><td>Random</td><td>Time-Sortable</td></tr><tr><td><strong>Storage</strong></td><td>Binary/String</td><td>Native BigInt</td></tr></tbody></table>",
            "consequences": "Instant local ID generation without central bottlenecks."
        }
    },
    {
        "id": "distributed-consensus",
        "title": "Distributed Consensus",
        "category": "Consistency",
        "icon": "users",
        "description": "Ensuring state machine consistency across distributed nodes via the Raft algorithm.",
        "stack": ["Raft", "Quorum"],
        "adr": {
            "problem": "How do nodes agree on values in a cluster where any node can fail at any time?",
            "context": "Consensus ensures that a majority of nodes agree on the state before it is considered 'committed'.",
            "decision": "Utilize the Raft algorithm for its formal safety guarantees and developer understandability.",
            "architecture": "Leaders manage the log and heartbeat followers. If a leader fails, a new term begins.",
            "consequences": "Guarantees strong consistency at the cost of majority network latency."
        },
        "externalLinks": [
            {
                "name": "The Raft Consensus Algorithm Official Site",
                "url": "https://raft.github.io/"
            }
        ]
    },
    {
        "id": "bloom-filter",
        "title": "Bloom Filter",
        "category": "Storage",
        "icon": "filter",
        "description": "Probabilistic set membership to avoid unnecessary expensive disk seeks in LSM storage.",
        "stack": ["Hashing", "Bitset"],
        "adr": {
            "problem": "Checking if a key exists in an <span class='inline-link' onclick='showDetail(\"lsm-tree\")'>LSM-Tree</span> is expensive due to multiple disk seeks.",
            "context": "Disk I/O is the primary bottleneck for reads in write-heavy storage engines.",
            "decision": "Implement a Bloom Filter in RAM to provide a probabilistic existence check.",
            "architecture": "Uses k-independent hash functions to map values to a bitset of size m.",
            "consequences": "Sub-millisecond membership testing with extremely low memory footprint."
        },
        "externalLinks": [
            {
                "name": "Cloudflare: When Bloom Filters don't bloom",
                "url": "https://blog.cloudflare.com/when-bloom-filters-dont-bloom/"
            }
        ]
    },
    {
        "id": "lsm-tree",
        "title": "LSM-Tree Storage",
        "category": "Persistence",
        "icon": "database",
        "description": "Write-optimized storage engine designed for high-throughput sequential inserts.",
        "stack": ["Memtable", "SSTables"],
        "adr": {
            "problem": "How do we handle high-volume random writes without fragmenting the database index?",
            "context": "B-Trees require expensive random I/O for updates, which kills performance.",
            "decision": "Adopt a Log-Structured Merge-Tree approach. Updates are buffered in memory and flushed sequentially.",
            "architecture": "Multiple levels of immutable SSTables are merged via background compaction.",
            "consequences": "Exceptional write throughput for sequence persistence on modern SSDs."
        },
        "externalLinks": [
            {
                "name": "Cassandra Architecture: Storage Engine",
                "url": "https://cassandra.apache.org/doc/stable/cassandra/architecture/storage-engine.html"
            }
        ]
    }
];

/**
 * PROFESSIONAL THEME ENGINE
 * Instant theme switch with zero-flicker using transition suppression.
 */
function toggleDarkMode() {
    const html = document.documentElement;
    
    // Suppress all transitions
    html.classList.add('theme-transitioning');
    
    // Force reflow to ensure suppression is active
    void html.offsetHeight;
    
    // Toggle theme
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Force another reflow to ensure theme is applied
    void html.offsetHeight;
    
    // Re-enable transitions on next frame
    requestAnimationFrame(() => {
        html.classList.remove('theme-transitioning');
    });
}

/**
 * Render systems grid in catalog view
 */
function renderSystems() {
    const grid = document.getElementById('systemsGrid');
    grid.innerHTML = SYSTEMS.map(sys => `
        <div class="card-surface rounded-3xl p-8 flex flex-col h-full">
            <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-8 shadow-inner">
                <i data-lucide="${sys.icon}" class="w-5 h-5"></i>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">${sys.category}</span>
            <h3 class="text-xl font-bold mb-4 tracking-tight">${sys.title}</h3>
            <p class="text-sm leading-relaxed mb-10 text-zinc-500 dark:text-zinc-400 font-medium">${sys.description}</p>
            <div class="mt-auto">
                <button onclick="showDetail('${sys.id}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95">
                    Examine Logic
                </button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

/**
 * Show detail view for a specific system
 */
function showDetail(id) {
    const sys = SYSTEMS.find(s => s.id === id);
    if(!sys) return;

    const view = document.getElementById('detailView');
    const catalog = document.getElementById('catalogView');
    const hero = document.getElementById('catalogHero');
    const content = document.getElementById('detailContent');

    content.innerHTML = `
        <div class="mb-16">
            <div class="inline-flex items-center gap-2 mb-6">
                <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Decision Record • ${sys.id.toUpperCase()}</span>
            </div>
            <h1 class="text-4xl md:text-6xl font-black tracking-tighter leading-tight">${sys.title}</h1>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div class="lg:col-span-2 prose max-w-none">
                <section><h2>The Problem</h2><p class="font-bold text-zinc-900 dark:text-white">${sys.adr.problem}</p></section>
                <section><h2>Engineering Context</h2><p>${sys.adr.context}</p></section>
                <section><h2>Proposed Decision</h2><p>${sys.adr.decision}</p></section>
                <section><h2>Implementation Logic</h2>${sys.adr.architecture}</section>
                ${sys.externalLinks ? `<section class="mt-12 pt-12 border-t border-zinc-200 dark:border-zinc-800"><h2>Knowledge Base</h2><ul class="space-y-4">${sys.externalLinks.map(link => `<li><a href="${link.url}" target="_blank" class="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-2"><i data-lucide="external-link" class="w-4 h-4"></i> ${link.name}</a></li>`).join('')}</ul></section>` : ''}
            </div>
            <div class="space-y-8">
                <div class="bg-blue-600 rounded-2xl p-8 text-white shadow-xl">
                    <h4 class="text-blue-100 font-bold uppercase tracking-widest text-[10px] mb-6">Component Stack</h4>
                    <ul class="space-y-4 font-mono text-xs">${sys.stack.map(s => `<li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-blue-200"></i> ${s}</li>`).join('')}</ul>
                </div>
                <div class="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h4 class="font-bold uppercase tracking-widest text-[10px] mb-4">Verdict</h4>
                    <p class="text-sm italic leading-relaxed text-zinc-500 dark:text-zinc-400 pl-4 border-l-2 border-blue-600">${sys.adr.consequences}</p>
                </div>
            </div>
        </div>
    `;

    catalog.classList.add('hidden');
    hero.classList.add('hidden');
    view.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    lucide.createIcons();
}

/**
 * Return to catalog view
 */
function showCatalog() {
    document.getElementById('detailView').classList.add('hidden');
    document.getElementById('catalogView').classList.remove('hidden');
    document.getElementById('catalogHero').classList.remove('hidden');
    lucide.createIcons();
}

/**
 * Load systems data from JSON file (optional for production with web server)
 * Falls back to embedded data for local development
 */
async function loadSystemsData() {
    // Try to load from external JSON if available (production with web server)
    try {
        const response = await fetch('./data/systems.json');
        if (response.ok) {
            SYSTEMS = await response.json();
        }
    } catch (error) {
        // Use embedded data (already loaded above) - this is expected for file:// protocol
        console.log('Using embedded systems data (local development mode)');
    }
    renderSystems();
}

/**
 * Initialize application
 */
window.addEventListener('DOMContentLoaded', () => {
    loadSystemsData();
});
