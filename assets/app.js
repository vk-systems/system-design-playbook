/**
 * Scale Decisions - Clean Architecture
 * Single Hero + Single Content Area with Dynamic Rendering
 */

// ============================================================================
// GLOBAL STATE & DATA
// ============================================================================

let SYSTEMS = []; // Loaded from systems.json or embedded below
let currentView = 'patterns';
let currentFilters = {
    category: 'all',
    difficulty: 'all',
    search: '',
    favoritesOnly: false,
    productionOnly: false
};

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('DOMContentLoaded', async () => {
    // Load systems data
    await loadSystemsData();
    
    // Initialize theme
    initializeTheme();
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Load initial view (patterns)
    showView('patterns');
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
});

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadSystemsData() {
    try {
        const response = await fetch('./data/systems.json');
        if (response.ok) {
            SYSTEMS = await response.json();
            console.log(`Loaded ${SYSTEMS.length} systems from JSON`);
        } else {
            // Fallback to embedded data
            console.log('Using embedded systems data');
            SYSTEMS = getEmbeddedSystemsData();
        }
    } catch (error) {
        console.log('Using embedded systems data (local development mode)');
        SYSTEMS = getEmbeddedSystemsData();
    }
}

function getEmbeddedSystemsData() {
    // This will be populated from the old file
    return [];
}

// ============================================================================
// VIEW MANAGEMENT - SINGLE HERO + CONTENT PATTERN
// ============================================================================

/**
 * Master view controller - switches between Patterns, Roadmap, Estimation
 */
function showView(view) {
    currentView = view;
    
    // Update navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    const tabId = `nav${view.charAt(0).toUpperCase() + view.slice(1)}`;
    document.getElementById(tabId)?.classList.add('active');
    
    // Hide detail view, show hero and content
    document.getElementById('detailView').classList.add('hidden');
    document.getElementById('heroSection').classList.remove('hidden');
    document.getElementById('contentArea').classList.remove('hidden');
    
    // Load appropriate view
    switch(view) {
        case 'patterns':
            renderPatternsView();
            break;
        case 'roadmap':
            renderRoadmapView();
            break;
        case 'cheatsheet':
            renderEstimationView();
            break;
    }
    
    // Reinitialize icons
    lucide.createIcons();
}

/**
 * Return to catalog from detail view
 */
function showCatalog() {
    showView('patterns');
}

// ============================================================================
// PATTERNS VIEW (CATALOG)
// ============================================================================

function renderPatternsView() {
    const heroContent = document.getElementById('heroContent');
    const contentArea = document.getElementById('contentArea');
    
    // Set appropriate max-width
    contentArea.className = 'max-w-7xl mx-auto px-6 pt-8 pb-16';
    
    // Render Patterns Hero
    heroContent.innerHTML = getPatternsHeroHTML();
    
    // Render Patterns Content
    contentArea.innerHTML = getPatternsContentHTML();
    
    // Render the actual systems grid
    renderSystemsGrid();
    updateFilterCounts();
    updateHeroStats();
}

function getPatternsHeroHTML() {
    return `
        <div class="max-w-7xl mx-auto px-6">
        <div class="grid md:grid-cols-2 gap-12 items-center">
            <div class="space-y-8">
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
                    <i data-lucide="zap" class="w-4 h-4 text-cyan-600 dark:text-cyan-400"></i>
                    <span class="text-sm font-semibold text-cyan-700 dark:text-cyan-300">ADR-First Learning</span>
                </div>
                
                <div>
                    <h1 class="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                        Engineering Decisions<br/>
                        <span class="text-cyan-600 dark:text-cyan-400">at Scale</span>
                    </h1>
                    
                    <p class="text-lg md:text-xl leading-relaxed text-zinc-600 dark:text-zinc-400">
                        Learn distributed systems through real <strong>Architecture Decision Records</strong>. 
                        Understand why companies choose specific solutions—not just how they work.
                    </p>
                </div>
                
                <div class="flex flex-col sm:flex-row items-start gap-4">
                    <button onclick="toggleSearch()" class="group w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-base transition-all active:scale-95 shadow-lg shadow-cyan-600/25">
                        <i data-lucide="search" class="w-5 h-5"></i>
                        Explore Patterns
                        <kbd class="hidden md:inline-block px-2 py-1 text-xs bg-cyan-700 rounded">⌘K</kbd>
                    </button>
                    <button onclick="showView('roadmap')" class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 hover:border-cyan-600 dark:hover:border-cyan-500 font-semibold text-base transition-all active:scale-95">
                        View Learning Path
                        <i data-lucide="arrow-right" class="w-5 h-5"></i>
                    </button>
                </div>
                
                <div class="flex flex-wrap items-center gap-6 pt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div class="flex items-center gap-2">
                        <i data-lucide="book-open" class="w-4 h-4 text-cyan-500"></i>
                        <span><span class="font-bold text-zinc-900 dark:text-white" id="heroPatternCount">0</span> Patterns</span>
                    </div>
                    <div class="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                    <div class="flex items-center gap-2">
                        <i data-lucide="map" class="w-4 h-4 text-violet-500"></i>
                        <span><span class="font-bold text-zinc-900 dark:text-white">16</span> Modules</span>
                    </div>
                    <div class="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                    <div class="flex items-center gap-2">
                        <i data-lucide="trending-up" class="w-4 h-4 text-teal-500"></i>
                        <span><span class="font-bold text-zinc-900 dark:text-white" id="heroProgressPercent">0</span>% Complete</span>
                    </div>
                </div>
            </div>
            
            <div class="hidden md:block">
                <div class="relative">
                    <div class="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl opacity-20 blur-xl"></div>
                    
                    <div onclick="showDetail('global-sequencer')" class="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-cyan-500/20">
                        <div class="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <span class="text-xs font-mono text-zinc-500">ADR-001.md</span>
                            </div>
                        </div>
                        
                        <div class="p-6 font-mono text-sm overflow-x-auto">
                            <div class="space-y-3">
                                <div>
                                    <span class="text-cyan-600 dark:text-cyan-400">#</span>
                                    <span class="text-zinc-900 dark:text-white font-bold"> ADR 001: Distributed ID Generation</span>
                                </div>
                                
                                <div class="text-zinc-600 dark:text-zinc-400">
                                    <span class="text-cyan-600 dark:text-cyan-400">##</span> Context
                                </div>
                                <div class="text-zinc-700 dark:text-zinc-300 pl-4">
                                    <span class="text-zinc-500">Generate unique IDs at </span>
                                    <span class="text-teal-600 dark:text-teal-400 font-semibold">10M+ TPS</span>
                                    <span class="text-zinc-500"> across</span><br/>
                                    <span class="text-zinc-500">multiple data centers with 99.99% uptime.</span>
                                </div>
                                
                                <div class="text-zinc-600 dark:text-zinc-400 pt-2">
                                    <span class="text-cyan-600 dark:text-cyan-400">##</span> Decision
                                </div>
                                <div class="text-zinc-700 dark:text-zinc-300 pl-4">
                                    <span class="text-zinc-500">Use </span>
                                    <span class="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-semibold">Twitter Snowflake</span>
                                    <span class="text-zinc-500"> algorithm</span>
                                </div>
                                
                                <div class="text-zinc-600 dark:text-zinc-400 pt-2">
                                    <span class="text-cyan-600 dark:text-cyan-400">##</span> Results
                                </div>
                                <div class="text-zinc-700 dark:text-zinc-300 pl-4 space-y-1">
                                    <div><span class="text-teal-600 dark:text-teal-400">✓</span> 12.5M IDs/sec throughput</div>
                                    <div><span class="text-teal-600 dark:text-teal-400">✓</span> 0.8ms P99 latency</div>
                                    <div><span class="text-teal-600 dark:text-teal-400">✓</span> $444K/year cost savings</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between group-hover:bg-cyan-50 dark:group-hover:bg-cyan-950/20 transition-colors">
                            <span class="text-xs text-zinc-500">Production • Global Sequencer</span>
                            <span class="text-xs text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1">
                                View Full ADR <i data-lucide="arrow-right" class="w-3 h-3"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    `;
}

function getPatternsContentHTML() {
    return `
        <!-- Stats Cards -->
        <div class="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200 dark:border-cyan-800">
                <div class="text-sm text-cyan-600 dark:text-cyan-400 mb-1 font-medium">Total Patterns</div>
                <div class="text-3xl font-black text-cyan-900 dark:text-cyan-100" id="statTotalPatterns">0</div>
                <div class="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Production Ready</div>
            </div>
            <div class="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                <div class="text-sm text-green-600 dark:text-green-400 mb-1 font-medium">ADRs Published</div>
                <div class="text-3xl font-black text-green-900 dark:text-green-100" id="statTotalADRs">0</div>
                <div class="text-xs text-green-600 dark:text-green-400 mt-1">Documentation</div>
            </div>
            <div class="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200 dark:border-purple-800">
                <div class="text-sm text-purple-600 dark:text-purple-400 mb-1 font-medium">Cost Savings</div>
                <div class="text-3xl font-black text-purple-900 dark:text-purple-100">$444K</div>
                <div class="text-xs text-purple-600 dark:text-purple-400 mt-1">Documented Yearly</div>
            </div>
            <div class="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800">
                <div class="text-sm text-amber-600 dark:text-amber-400 mb-1 font-medium">Categories</div>
                <div class="text-3xl font-black text-amber-900 dark:text-amber-100" id="statCategories">0</div>
                <div class="text-xs text-amber-600 dark:text-amber-400 mt-1">Across Tech Stack</div>
            </div>
        </div>
        
        <!-- Filters -->
        <div class="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div class="flex items-center gap-2 flex-wrap" id="categoryFilters">
                <!-- Filters will be dynamically generated -->
            </div>
            <div class="flex items-center gap-2">
                <button onclick="filterByStatus('production')" class="px-3 py-1.5 text-sm rounded-lg hover:bg-green-100 dark:hover:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                    <i data-lucide="check-circle" class="w-4 h-4 inline mr-1"></i> Production
                </button>
                <button onclick="toggleFavoritesOnly()" class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" id="favoritesBtn">
                    <i data-lucide="star" class="w-5 h-5"></i>
                </button>
            </div>
        </div>
        
        <!-- Systems Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="systemsGrid"></div>
    `;
}

// ============================================================================
// PATTERNS VIEW CONTINUED - GRID RENDERING
// ============================================================================

function renderSystemsGrid() {
    const grid = document.getElementById('systemsGrid');
    const systems = getFilteredSystems();
    
    if (systems.length === 0) {
        grid.innerHTML = '<p class="text-zinc-400 col-span-full text-center py-12">No systems match your filters</p>';
        return;
    }
    
    grid.innerHTML = systems.map(sys => {
        const isFav = StorageManager.isFavorite(sys.id);
        const difficultyColor = {
            'beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }[sys.difficulty] || '';
        
        const categoryClass = `category-${sys.category.toLowerCase()}`;
        const adrBadge = sys.metadata?.adrNumber ? `<span class="badge badge-tag bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">📋 ${sys.metadata.adrNumber}</span>` : '';
        const statsDisplay = sys.stats ? `
            <div class="grid grid-cols-2 gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-xs mb-4">
                <div class="flex flex-col">
                    <span class="text-zinc-400 text-[10px]">Throughput</span>
                    <span class="font-bold text-cyan-600 dark:text-cyan-400">${sys.stats.throughput}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-zinc-400 text-[10px]">Latency</span>
                    <span class="font-bold text-green-600 dark:text-green-400">${sys.stats.latency}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-zinc-400 text-[10px]">Cost</span>
                    <span class="font-bold text-orange-600 dark:text-orange-400">${sys.stats.cost}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-zinc-400 text-[10px]">Savings</span>
                    <span class="font-bold text-purple-600 dark:text-purple-400">${sys.stats.savings}</span>
                </div>
            </div>
        ` : '';
        
        return `
        <div class="card-surface rounded-3xl p-8 flex flex-col h-full relative ${categoryClass}">
            <button onclick="toggleFavorite('${sys.id}')" class="favorite-star ${isFav ? 'is-favorite' : ''}">
                <i data-lucide="star" class="w-5 h-5 ${isFav ? 'fill-current' : ''}"></i>
            </button>
            
            <div class="w-12 h-12 category-icon rounded-xl flex items-center justify-center text-white mb-6 shadow-inner">
                <i data-lucide="${sys.icon}" class="w-5 h-5"></i>
            </div>
            
            <div class="flex items-center gap-2 mb-3">
                <span class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--category-color, var(--brand-primary))">${sys.category}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${difficultyColor}">${sys.difficulty}</span>
                ${adrBadge}
            </div>
            
            <h3 class="text-xl font-bold mb-3 tracking-tight">${sys.title}</h3>
            <p class="text-sm leading-relaxed mb-4 text-zinc-500 dark:text-zinc-400 font-medium">${sys.description}</p>
            
            ${statsDisplay}
            
            <div class="flex flex-wrap gap-1 mb-6">
                ${sys.tags.slice(0, 3).map(tag => `<span class="badge badge-tag">${tag}</span>`).join('')}
            </div>
            
            <div class="mt-auto space-y-3">
                <div class="flex items-center justify-between text-xs text-zinc-400">
                    <span><i data-lucide="clock" class="w-3 h-3 inline"></i> ${calculateReadTime(sys)}</span>
                    <span class="truncate ml-2"><i data-lucide="book-open" class="w-3 h-3 inline"></i> ${sys.metadata?.source || 'Reference'}</span>
                </div>
                <button onclick="showDetail('${sys.id}')" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95">
                    Examine Logic
                </button>
            </div>
        </div>
    `}).join('');
    
    lucide.createIcons();
}

// ============================================================================
// ROADMAP VIEW
// ============================================================================

function renderRoadmapView() {
    const heroContent = document.getElementById('heroContent');
    const contentArea = document.getElementById('contentArea');
    
    contentArea.className = 'max-w-7xl mx-auto px-6 pt-8 pb-16';
    
    heroContent.innerHTML = getRoadmapHeroHTML();
    contentArea.innerHTML = getRoadmapContentHTML();
    
    renderRoadmapModules();
}

function getRoadmapHeroHTML() {
    const completedModules = StorageManager.getCompletedModules();
    const totalModules = 16; // Fixed number from roadmap
    const progress = Math.round((completedModules.length / totalModules) * 100);
    
    return `
        <div class="max-w-7xl mx-auto px-6">
        <div class="max-w-4xl">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 mb-8">
                <i data-lucide="map" class="w-4 h-4 text-violet-600 dark:text-violet-400"></i>
                <span class="text-sm font-semibold text-violet-700 dark:text-violet-300">Structured Learning Path</span>
            </div>
            
            <h1 class="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                System Design<br/>
                <span class="text-violet-600 dark:text-violet-400">Learning Roadmap</span>
            </h1>
            
            <p class="text-lg md:text-xl leading-relaxed text-zinc-600 dark:text-zinc-400 mb-8">
                Master distributed systems through <strong>16 progressive modules</strong> — from foundations 
                to real-world case studies. Each module builds on previous concepts to create a comprehensive understanding.
            </p>
            
            <div class="mb-8">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Your Progress</span>
                    <span class="text-sm font-bold text-violet-600 dark:text-violet-400">${progress}% Complete</span>
                </div>
                <div class="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                <div class="flex items-center gap-2">
                    <i data-lucide="book-open" class="w-4 h-4 text-violet-500"></i>
                    <span><span class="font-bold text-zinc-900 dark:text-white">${totalModules}</span> Modules</span>
                </div>
                <div class="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <div class="flex items-center gap-2">
                    <i data-lucide="check-circle" class="w-4 h-4 text-green-500"></i>
                    <span><span class="font-bold text-zinc-900 dark:text-white">${completedModules.length}</span> Completed</span>
                </div>
                <div class="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <div class="flex items-center gap-2">
                    <i data-lucide="clock" class="w-4 h-4 text-cyan-500"></i>
                    <span><span class="font-bold text-zinc-900 dark:text-white">~70</span> Hours Total</span>
                </div>
            </div>
        </div>
        </div>
    `;
}

function getRoadmapContentHTML() {
    return `<div id="roadmapModules" class="space-y-6"></div>`;
}

// ============================================================================
// ESTIMATION VIEW (CHEAT SHEET)
// ============================================================================

function renderEstimationView() {
    const heroContent = document.getElementById('heroContent');
    const contentArea = document.getElementById('contentArea');
    
    contentArea.className = 'max-w-7xl mx-auto px-6 pt-8 pb-16';
    
    heroContent.innerHTML = getEstimationHeroHTML();
    contentArea.innerHTML = '<div class="text-center py-8 text-zinc-500">Loading fundamentals...</div>';
    
    // Load external HTML file
    loadEstimationContent();
}

function getEstimationHeroHTML() {
    return `
        <div class="max-w-7xl mx-auto px-6">
        <div class="max-w-4xl">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 mb-8">
                <i data-lucide="calculator" class="w-4 h-4 text-teal-600 dark:text-teal-400"></i>
                <span class="text-sm font-semibold text-teal-700 dark:text-teal-300">Capacity Planning</span>
            </div>
            
            <h1 class="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                System Estimation<br/>
                <span class="text-teal-600 dark:text-teal-400">Quick Reference</span>
            </h1>
            
            <p class="text-lg md:text-xl leading-relaxed text-zinc-600 dark:text-zinc-400 mb-8">
                Back-of-the-envelope calculations for <strong>capacity planning</strong>. 
                Essential numbers, formulas, and estimation techniques for system design interviews and production planning.
            </p>
            
            <div class="flex flex-wrap items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                <div class="flex items-center gap-2">
                    <i data-lucide="cpu" class="w-4 h-4 text-teal-500"></i>
                    <span><span class="font-bold text-zinc-900 dark:text-white">Compute</span> Sizing</span>
                </div>
                <div class="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <div class="flex items-center gap-2">
                    <i data-lucide="database" class="w-4 h-4 text-cyan-500"></i>
                    <span><span class="font-bold text-zinc-900 dark:text-white">Storage</span> Planning</span>
                </div>
                <div class="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <div class="flex items-center gap-2">
                    <i data-lucide="wifi" class="w-4 h-4 text-violet-500"></i>
                    <span><span class="font-bold text-zinc-900 dark:text-white">Bandwidth</span> Estimates</span>
                </div>
            </div>
        </div>
        </div>
    `;
}

async function loadEstimationContent() {
    const contentArea = document.getElementById('contentArea');
    
    try {
        const response = await fetch(`./fundamentals.html?v=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract only the sections, skip the title and hero in fundamentals.html
        const main = doc.querySelector('main');
        if (main) {
            // Remove only the first two divs (title with h1, and hero with text-center)
            const divs = main.querySelectorAll(':scope > div');
            if (divs.length >= 2) {
                // First div has the h1 title
                if (divs[0].querySelector('h1')) {
                    divs[0].remove();
                }
                // Second div is the hero with text-center class
                const remaining = main.querySelectorAll(':scope > div');
                if (remaining.length > 0 && remaining[0].classList.contains('text-center')) {
                    remaining[0].remove();
                }
            }
            
            contentArea.innerHTML = main.innerHTML;
        } else {
            contentArea.innerHTML = doc.body.innerHTML;
        }
        
        // Execute inline scripts
        const scripts = contentArea.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            script.parentNode.replaceChild(newScript, script);
        });
        
        lucide.createIcons();
    } catch (error) {
        console.error('Fundamentals load error:', error);
        contentArea.innerHTML = `
            <div class="text-center py-20">
                <div class="text-red-500 dark:text-red-400 mb-2">Failed to load estimation guide</div>
                <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-4">${error.message}</div>
                <div class="text-xs text-zinc-400">Check console for details</div>
            </div>
        `;
    }
}

// ============================================================================
// DETAIL VIEWS (PATTERN DETAILS & ADR)
// ============================================================================

function showDetail(id) {
    console.log('showDetail called with id:', id);
    const sys = SYSTEMS.find(s => s.id === id);
    console.log('Found system:', sys);
    if (!sys) return;
    
    StorageManager.addToRecentlyViewed(id);
    
    // Hide hero and content, show detail view
    document.getElementById('heroSection').classList.add('hidden');
    document.getElementById('contentArea').classList.add('hidden');
    const detailView = document.getElementById('detailView');
    detailView.classList.remove('hidden');
    console.log('Detail view shown');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const isFav = StorageManager.isFavorite(id);
    const userNotes = StorageManager.getNotes(id);
    
    // Get related systems
    const relatedSystems = sys.relatedConcepts 
        ? sys.relatedConcepts.map(relId => SYSTEMS.find(s => s.id === relId)).filter(Boolean)
        : [];
    
    console.log('About to set innerHTML');
    detailView.innerHTML = `
        <!-- Back Button -->
        <div class="mb-8">
            <button onclick="showCatalog()" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 rounded-lg transition-colors">
                <i data-lucide="arrow-left" class="w-4 h-4"></i>
                Back to Catalog
            </button>
        </div>
        
        <!-- Breadcrumbs -->
        <div class="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-12">
            <span class="text-zinc-700 dark:text-zinc-300">Home</span>
            <i data-lucide="chevron-right" class="w-3 h-3"></i>
            <span class="text-zinc-700 dark:text-zinc-300">${sys.category}</span>
            <i data-lucide="chevron-right" class="w-3 h-3"></i>
            <span class="text-zinc-900 dark:text-zinc-100 font-semibold">${sys.title}</span>
        </div>
        
        <div class="mb-16">
            <div class="flex items-start justify-between gap-4 mb-6">
                <div class="inline-flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-cyan-600"></span>
                    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">${sys.metadata?.adrNumber || 'Decision Record'} • ${sys.id.toUpperCase()}</span>
                </div>
                <button onclick="toggleFavoriteDetail('${id}')" class="favorite-star ${isFav ? 'is-favorite' : ''} relative">
                    <i data-lucide="star" class="w-6 h-6 ${isFav ? 'fill-current' : ''}"></i>
                </button>
            </div>
            
            <h1 class="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-6">${sys.title}</h1>
            
            <div class="flex flex-wrap gap-2 mb-6">
                <span class="badge badge-${sys.difficulty}">${sys.difficulty}</span>
                ${sys.tags.map(tag => `<span class="badge badge-tag">${tag}</span>`).join('')}
                <span class="text-sm text-zinc-400"><i data-lucide="clock" class="w-4 h-4 inline"></i> ${calculateReadTime(sys)}</span>
                ${sys.metadata?.status ? `<span class="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✅ ${sys.metadata.status}</span>` : ''}
            </div>
            
            ${sys.adr.filePath ? `
            <div class="p-4 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-xl mb-8">
                <div class="flex items-center gap-3">
                    <i data-lucide="file-text" class="w-5 h-5 text-cyan-600"></i>
                    <div class="flex-1">
                        <div class="font-semibold text-zinc-900 dark:text-white">Complete Architecture Decision Record</div>
                        <div class="text-sm text-zinc-600 dark:text-zinc-400">Full details with cost analysis, production incidents, and failure modes</div>
                    </div>
                    <button onclick="showADR('${sys.adr.filePath}', '${sys.title}', '${sys.id}')" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2">
                        Read Full ADR <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
            ` : ''}
            
            ${sys.stats ? `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 mb-8">
                <div class="text-center">
                    <div class="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Throughput</div>
                    <div class="text-2xl font-bold text-cyan-600 dark:text-cyan-400">${sys.stats.throughput}</div>
                </div>
                <div class="text-center">
                    <div class="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Latency</div>
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">${sys.stats.latency}</div>
                </div>
                <div class="text-center">
                    <div class="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Cost</div>
                    <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">${sys.stats.cost}</div>
                </div>
                <div class="text-center">
                    <div class="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Savings</div>
                    <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${sys.stats.savings}</div>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div class="lg:col-span-2 prose max-w-none">
                <section><h2>The Problem</h2><p class="font-bold text-zinc-900 dark:text-white">${sys.adr.problem}</p></section>
                <section><h2>Engineering Context</h2><p>${sys.adr.context}</p></section>
                <section><h2>Proposed Decision</h2><p>${sys.adr.decision}</p></section>
                
                ${sys.adr.alternatives ? `<section><h2>Alternatives Considered</h2><p>${sys.adr.alternatives}</p></section>` : ''}
                
                ${sys.adr.architecture ? `<section><h2>Implementation Logic</h2>${sys.adr.architecture}</section>` : ''}
                
                ${relatedSystems.length > 0 ? `
                <section class="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <h2>Related Concepts</h2>
                    <div class="flex flex-wrap gap-3 not-prose">
                        ${relatedSystems.map(rel => `
                            <div class="related-chip" onclick="showDetail('${rel.id}')">
                                <i data-lucide="${rel.icon}" class="w-4 h-4"></i>
                                <span>${rel.title}</span>
                            </div>
                        `).join('')}
                    </div>
                </section>` : ''}
                
                ${sys.metadata.prerequisites && sys.metadata.prerequisites.length > 0 ? `
                <section class="mt-8">
                    <h2>Prerequisites</h2>
                    <div class="flex flex-wrap gap-3 not-prose">
                        ${sys.metadata.prerequisites.map(prereqId => {
                            const prereq = SYSTEMS.find(s => s.id === prereqId);
                            return prereq ? `
                                <div class="related-chip" onclick="showDetail('${prereq.id}')">
                                    <i data-lucide="${prereq.icon}" class="w-4 h-4"></i>
                                    <span>${prereq.title}</span>
                                </div>
                            ` : '';
                        }).join('')}
                    </div>
                </section>` : ''}
                
                ${sys.externalLinks ? `
                <section class="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <h2>Knowledge Base</h2>
                    <ul class="space-y-4">
                        ${sys.externalLinks.map(link => `
                            <li><a href="${link.url}" target="_blank" class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-2">
                                <i data-lucide="external-link" class="w-4 h-4"></i> ${link.name}
                            </a></li>
                        `).join('')}
                    </ul>
                </section>` : ''}
                
                <section class="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <h2>📝 My Notes</h2>
                    <textarea 
                        id="userNotes" 
                        placeholder="Add your personal notes, insights, or gotchas here..."
                        class="w-full min-h-[150px] p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        style="color: var(--text-primary);"
                        onblur="saveNotes('${id}')"
                    >${userNotes}</textarea>
                    <p class="text-xs text-zinc-400 mt-2">These notes are saved locally in your browser</p>
                </section>
            </div>
            <div class="space-y-8">
                <div class="bg-indigo-600 rounded-2xl p-8 text-white shadow-xl">
                    <h4 class="text-indigo-100 font-bold uppercase tracking-widest text-[10px] mb-6">Component Stack</h4>
                    <ul class="space-y-4 font-mono text-xs">${sys.stack.map(s => `<li class="flex items-center gap-3"><i data-lucide="check" class="w-4 h-4 text-indigo-200"></i> ${s}</li>`).join('')}</ul>
                </div>
                <div class="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h4 class="font-bold uppercase tracking-widest text-[10px] mb-4">Verdict</h4>
                    <p class="text-sm italic leading-relaxed text-zinc-500 dark:text-zinc-400 pl-4 border-l-2 border-indigo-600">${sys.adr.consequences}</p>
                </div>
                <div class="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h4 class="font-bold uppercase tracking-widest text-[10px] mb-4 text-zinc-600 dark:text-zinc-400">Metadata</h4>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-zinc-500 dark:text-zinc-400">Added</span>
                            <span class="font-medium">${sys.metadata.dateAdded}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-zinc-500 dark:text-zinc-400">Source</span>
                            <span class="font-medium text-right">${sys.metadata.source}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-zinc-500 dark:text-zinc-400">Difficulty</span>
                            <span class="badge badge-${sys.difficulty}">${sys.difficulty}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    lucide.createIcons();
}

async function showADR(filePath, title, systemId) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const markdown = await response.text();
        const html = parseADRToHTML(markdown);
        
        document.getElementById('heroSection').classList.add('hidden');
        document.getElementById('contentArea').classList.add('hidden');
        const detailView = document.getElementById('detailView');
        detailView.classList.remove('hidden');
        detailView.className = 'max-w-5xl mx-auto px-6 py-24';
        
        detailView.innerHTML = `
            <div class="mb-12">
                <button onclick="showDetail('${systemId}')" class="text-sm text-cyan-600 dark:text-cyan-400 hover:underline mb-4 inline-flex items-center gap-2">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i>
                    Back to ${title}
                </button>
            </div>
            ${html}
        `;
        
        lucide.createIcons();
    } catch (error) {
        console.error('ADR load error:', error);
        alert('Failed to load ADR file: ' + error.message);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function calculateReadTime(system) {
    if (system.estimatedReadTime) return system.estimatedReadTime;
    
    let wordCount = 0;
    wordCount += system.description.split(/\s+/).length;
    
    if (system.adr) {
        wordCount += (system.adr.problem || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
        wordCount += (system.adr.context || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
        wordCount += (system.adr.decision || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
        wordCount += (system.adr.architecture || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
        wordCount += (system.adr.consequences || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
    }
    
    const minutes = Math.ceil(wordCount / 225);
    return `${minutes} min`;
}

function getFilteredSystems() {
    let systems = [...SYSTEMS];
    
    if (currentFilters.category !== 'all') {
        systems = systems.filter(sys => sys.category === currentFilters.category);
    }
    
    if (currentFilters.favoritesOnly) {
        const favorites = StorageManager.getFavorites();
        systems = systems.filter(sys => favorites.includes(sys.id));
    }
    
    if (currentFilters.productionOnly) {
        systems = systems.filter(sys => sys.metadata?.status === 'Production');
    }
    
    if (currentFilters.search) {
        const query = currentFilters.search.toLowerCase();
        systems = systems.filter(sys => 
            sys.title.toLowerCase().includes(query) ||
            sys.description.toLowerCase().includes(query) ||
            sys.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }
    
    return systems;
}

function updateFilterCounts() {
    const categories = ['all', 'Distributed', 'Storage', 'Consistency', 'Persistence'];
    categories.forEach(cat => {
        const count = cat === 'all' 
            ? SYSTEMS.length 
            : SYSTEMS.filter(sys => sys.category === cat).length;
        const countEl = document.getElementById(`count-${cat}`);
        if (countEl) countEl.textContent = count;
    });
}

function updateHeroStats() {
    const totalEl = document.getElementById('statTotalPatterns');
    const adrEl = document.getElementById('statTotalADRs');
    const categoriesEl = document.getElementById('statCategories');
    const heroCountEl = document.getElementById('heroPatternCount');
    const progressEl = document.getElementById('heroProgressPercent');
    
    if (totalEl) totalEl.textContent = SYSTEMS.length;
    if (adrEl) adrEl.textContent = SYSTEMS.filter(s => s.adr.filePath).length;
    if (categoriesEl) categoriesEl.textContent = new Set(SYSTEMS.map(s => s.category)).size;
    if (heroCountEl) heroCountEl.textContent = SYSTEMS.length;
    
    // Calculate progress (production patterns / total)
    const productionCount = SYSTEMS.filter(s => s.metadata?.status === 'Production').length;
    const progress = Math.round((productionCount / SYSTEMS.length) * 100);
    if (progressEl) progressEl.textContent = progress;
}

function filterByCategory(category) {
    currentFilters.category = category;
    renderSystemsGrid();
}

function filterByStatus(status) {
    currentFilters.productionOnly = !currentFilters.productionOnly;
    renderSystemsGrid();
}

function toggleFavoritesOnly() {
    currentFilters.favoritesOnly = !currentFilters.favoritesOnly;
    const btn = document.getElementById('favoritesBtn');
    if (btn) {
        if (currentFilters.favoritesOnly) {
            btn.classList.add('text-yellow-500');
        } else {
            btn.classList.remove('text-yellow-500');
        }
    }
    renderSystemsGrid();
}

function toggleFavorite(id) {
    event.stopPropagation();
    StorageManager.toggleFavorite(id);
    renderSystemsGrid();
}

function toggleFavoriteDetail(id) {
    StorageManager.toggleFavorite(id);
    showDetail(id); // Re-render to update star
}

function saveNotes(id) {
    const notes = document.getElementById('userNotes').value;
    StorageManager.saveNotes(id, notes);
}

// ============================================================================
// STORAGE MANAGER
// ============================================================================

const StorageManager = {
    getFavorites() {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    },
    
    toggleFavorite(id) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(id);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(id);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        return favorites.includes(id);
    },
    
    isFavorite(id) {
        return this.getFavorites().includes(id);
    },
    
    addToRecentlyViewed(id) {
        let recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        recent = recent.filter(item => item !== id);
        recent.unshift(id);
        recent = recent.slice(0, 5);
        localStorage.setItem('recentlyViewed', JSON.stringify(recent));
    },
    
    getCompletedModules() {
        return JSON.parse(localStorage.getItem('completedModules') || '[]');
    },
    
    toggleModuleComplete(moduleId) {
        const completed = this.getCompletedModules();
        const index = completed.indexOf(moduleId);
        if (index > -1) {
            completed.splice(index, 1);
        } else {
            completed.push(moduleId);
        }
        localStorage.setItem('completedModules', JSON.stringify(completed));
        return completed.includes(moduleId);
    },
    
    isModuleCompleted(moduleId) {
        return this.getCompletedModules().includes(moduleId);
    },
    
    getNotes(id) {
        const allNotes = JSON.parse(localStorage.getItem('patternNotes') || '{}');
        return allNotes[id] || '';
    },
    
    saveNotes(id, notes) {
        const allNotes = JSON.parse(localStorage.getItem('patternNotes') || '{}');
        allNotes[id] = notes;
        localStorage.setItem('patternNotes', JSON.stringify(allNotes));
    }
};

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

function initializeTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
}

function toggleDarkMode() {
    const html = document.documentElement;
    html.classList.add('theme-transitioning');
    void html.offsetHeight;
    
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    void html.offsetHeight;
    requestAnimationFrame(() => {
        html.classList.remove('theme-transitioning');
    });
}

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================

function toggleSearch() {
    const container = document.getElementById('searchContainer');
    const input = document.getElementById('searchInput');
    
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        setTimeout(() => input.focus(), 100);
    } else {
        container.classList.add('hidden');
        input.value = '';
        document.getElementById('searchResults').innerHTML = '';
    }
}

function performSearch(query) {
    if (!query.trim()) {
        document.getElementById('searchResults').innerHTML = '<p class="text-zinc-400 text-center py-8">Start typing to search...</p>';
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    const results = SYSTEMS.filter(sys => {
        return sys.title.toLowerCase().includes(lowerQuery) ||
               sys.description.toLowerCase().includes(lowerQuery) ||
               sys.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
               sys.category.toLowerCase().includes(lowerQuery);
    });
    
    const resultsHTML = results.length > 0 
        ? results.map(sys => {
            const categoryClass = `category-${sys.category.toLowerCase()}`;
            return `
            <div class="search-result-item ${categoryClass}" onclick="showDetail('${sys.id}'); toggleSearch();">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 category-icon rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <i data-lucide="${sys.icon}" class="w-5 h-5"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold mb-1">${highlightText(sys.title, query)}</h4>
                        <p class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">${highlightText(sys.description, query)}</p>
                        <div class="flex flex-wrap gap-1 mt-2">
                            <span class="badge badge-${sys.difficulty}">${sys.difficulty}</span>
                            ${sys.tags.slice(0, 2).map(tag => `<span class="badge badge-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `}).join('')
        : '<p class="text-zinc-400 text-center py-8">No results found</p>';
    
    document.getElementById('searchResults').innerHTML = resultsHTML;
    lucide.createIcons();
}

function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Cmd/Ctrl + K for search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            toggleSearch();
        }
        
        // Escape to close search or go back
        if (e.key === 'Escape') {
            const searchContainer = document.getElementById('searchContainer');
            if (!searchContainer.classList.contains('hidden')) {
                toggleSearch();
            }
        }
    });
}

// ============================================================================
// ROADMAP MODULE RENDERING
// ============================================================================

const ROADMAP_MODULES = [
    {
        id: "00-foundations",
        number: "00",
        title: "Foundations",
        icon: "layers",
        difficulty: "beginner",
        estimatedTime: "2-3 hours",
        prerequisites: [],
        description: "Master the building blocks - understand what makes systems scale and why certain patterns exist.",
        topics: [
            { title: "System Design Overview", description: "Goals, trade-offs, and the 'Scale vs. Complexity' curve", pattern: null },
            { title: "Core Metrics", description: "Scalability, Latency (P99/P99.9), Throughput, Reliability, and Availability", pattern: null },
            { title: "Networking", description: "TCP/UDP, QUIC/HTTP3, DNS, and Anycast Load Balancing", pattern: null },
            { title: "Consistent Hashing", description: "Distributed data partitioning without central coordination", pattern: null },
            { title: "Bloom Filters", description: "Probabilistic data structures for membership testing", pattern: "bloom-filter" },
            { title: "Skip Lists", description: "Fast search in ordered sequences", pattern: null },
            { title: "Merkle Trees", description: "Efficient data verification in distributed systems", pattern: null }
        ]
    },
    {
        id: "01-requirements",
        number: "01",
        title: "Requirements & Constraints",
        icon: "file-text",
        difficulty: "beginner",
        estimatedTime: "1-2 hours",
        prerequisites: ["00-foundations"],
        description: "Learn to translate business needs into technical specifications and calculate realistic capacity needs.",
        topics: [
            { title: "Functional vs Non-functional", description: "What the system does vs how well it does it", pattern: null },
            { title: "Capacity Planning", description: "Back-of-the-envelope estimations for DAU, Storage, and Bandwidth", pattern: null },
            { title: "Latency Budgeting", description: "Calculating the 'Time to First Byte' across distributed hops", pattern: null },
            { title: "API Contracts", description: "Defining strict schemas with Protocol Buffers and OpenAPI", pattern: null }
        ]
    },
    {
        id: "02-patterns",
        number: "02",
        title: "Core Architectural Patterns",
        icon: "grid",
        difficulty: "intermediate",
        estimatedTime: "3-4 hours",
        prerequisites: ["00-foundations", "01-requirements"],
        description: "Understand the fundamental patterns that shape modern system architectures.",
        topics: [
            { title: "Modular Monoliths", description: "When NOT to use microservices - the 'Microservices First' trap", pattern: null },
            { title: "Event-Driven Architecture", description: "Async communication, Sagas, and Change Data Capture (CDC)", pattern: null },
            { title: "Serverless Patterns", description: "FaaS economics and when Lambda/Cloud Functions make sense", pattern: null }
        ]
    },
    {
        id: "03-scalability",
        number: "03",
        title: "Scalability Patterns",
        icon: "trending-up",
        difficulty: "intermediate",
        estimatedTime: "4-5 hours",
        prerequisites: ["02-patterns"],
        description: "Scale from thousands to millions of users - learn horizontal scaling, caching, and queuing patterns.",
        topics: [
            { title: "Horizontal Scaling", description: "The 'Shared Nothing' architecture and load distribution", pattern: null },
            { title: "Database Sharding", description: "Vertical vs Horizontal Sharding and Rebalancing strategies", pattern: null },
            { title: "Caching Strategies", description: "CDN Edge, Redis/Memcached patterns, and Cache Invalidation", pattern: null },
            { title: "Message Queues", description: "Kafka vs RabbitMQ vs SQS - when to use which", pattern: null }
        ]
    },
    {
        id: "04-data",
        number: "04",
        title: "Data Storage & Consistency",
        icon: "database",
        difficulty: "advanced",
        estimatedTime: "5-6 hours",
        prerequisites: ["03-scalability"],
        description: "Master database internals, consistency models, and replication strategies for distributed data.",
        topics: [
            { title: "ACID vs BASE vs NewSQL", description: "When to use Postgres vs MongoDB vs CockroachDB", pattern: null },
            { title: "Consistency Models", description: "Linearizability, Sequential, and Eventual Consistency trade-offs", pattern: "distributed-consensus" },
            { title: "LSM-Tree Storage", description: "How modern databases achieve write performance", pattern: "lsm-tree" },
            { title: "Multi-Region Replication", description: "Quorum-based writes and conflict resolution", pattern: null },
            { title: "Disaster Recovery", description: "PITR (Point-in-Time Recovery) and backup strategies", pattern: null }
        ]
    },
    {
        id: "05-api",
        number: "05",
        title: "API Design & Microservices",
        icon: "share-2",
        difficulty: "intermediate",
        estimatedTime: "3-4 hours",
        prerequisites: ["02-patterns"],
        description: "Design robust APIs and build resilient microservice architectures.",
        topics: [
            { title: "REST vs GraphQL vs gRPC", description: "Choosing the right API protocol for your use case", pattern: null },
            { title: "API Gateway", description: "Authentication offloading, SSL termination, and BFF pattern", pattern: null },
            { title: "Rate Limiting", description: "Token bucket vs Leaky bucket algorithms", pattern: null },
            { title: "Circuit Breaker", description: "Preventing cascade failures in distributed systems", pattern: null }
        ]
    },
    {
        id: "06-observability",
        number: "06",
        title: "Observability & Monitoring",
        icon: "activity",
        difficulty: "intermediate",
        estimatedTime: "3-4 hours",
        prerequisites: ["05-api"],
        description: "Build production-ready systems with comprehensive logging, metrics, and tracing.",
        topics: [
            { title: "Structured Logging", description: "OpenTelemetry and Distributed Tracing with Jaeger/Zipkin", pattern: null },
            { title: "SLIs/SLOs/SLAs", description: "Defining and monitoring service level objectives", pattern: null },
            { title: "Chaos Engineering", description: "Injecting latency/failure in production safely", pattern: null }
        ]
    },
    {
        id: "07-reliability",
        number: "07",
        title: "Fault Tolerance & Reliability",
        icon: "shield",
        difficulty: "advanced",
        estimatedTime: "4-5 hours",
        prerequisites: ["06-observability"],
        description: "Design systems that survive failures - redundancy, degradation, and recovery patterns.",
        topics: [
            { title: "Redundancy Patterns", description: "N+1, Active-Active multi-region deployments", pattern: null },
            { title: "Graceful Degradation", description: "Designing 'Fail-Soft' features and Load Shedding", pattern: null },
            { title: "Idempotency", description: "Safe retries in distributed systems", pattern: null },
            { title: "Saga Pattern", description: "Distributed transactions and compensation logic", pattern: null }
        ]
    },
    {
        id: "08-edge",
        number: "08",
        title: "Edge Computing & CDN",
        icon: "globe",
        difficulty: "advanced",
        estimatedTime: "3-4 hours",
        prerequisites: ["03-scalability"],
        description: "Push computation to the edge - reduce latency and improve user experience globally.",
        topics: [
            { title: "Edge Functions", description: "Running WASM at the edge (Cloudflare Workers/Fastly)", pattern: null },
            { title: "Geo-Routing", description: "Latency-based routing and Regional Data Sovereignty", pattern: null },
            { title: "CDN Strategies", description: "Cache invalidation and origin shielding", pattern: null }
        ]
    },
    {
        id: "09-security",
        number: "09",
        title: "Security at Scale",
        icon: "lock",
        difficulty: "intermediate",
        estimatedTime: "3-4 hours",
        prerequisites: ["05-api"],
        description: "Secure your systems - authentication, authorization, and encryption patterns.",
        topics: [
            { title: "OAuth2 & OIDC", description: "Modern authentication flows and JWT best practices", pattern: null },
            { title: "Zero-Trust Architecture", description: "ZTNA and never trusting the network", pattern: null },
            { title: "Encryption Patterns", description: "At Rest (KMS/HSM) and in Transit (mTLS)", pattern: null }
        ]
    },
    {
        id: "10-cloud",
        number: "10",
        title: "Cloud Native Architecture",
        icon: "cloud",
        difficulty: "advanced",
        estimatedTime: "5-6 hours",
        prerequisites: ["05-api", "07-reliability"],
        description: "Master containers, orchestration, and infrastructure-as-code for cloud-native systems.",
        topics: [
            { title: "Kubernetes Internals", description: "Pods, Services, Deployments, and when NOT to use K8s", pattern: null },
            { title: "Service Mesh", description: "Istio/Linkerd for traffic management and observability", pattern: null },
            { title: "GitOps", description: "Infrastructure as Code with Terraform/Crossplane and ArgoCD", pattern: null }
        ]
    },
    {
        id: "11-streaming",
        number: "11",
        title: "Real-time & Stream Processing",
        icon: "radio",
        difficulty: "advanced",
        estimatedTime: "4-5 hours",
        prerequisites: ["04-data"],
        description: "Build real-time systems - streaming data pipelines and event processing at scale.",
        topics: [
            { title: "WebSockets vs SSE", description: "Choosing the right protocol for real-time communication", pattern: null },
            { title: "Kafka Streams", description: "State management in stream processing", pattern: null },
            { title: "Flink & Spark", description: "Batch vs stream processing trade-offs", pattern: null }
        ]
    },
    {
        id: "12-ai",
        number: "12",
        title: "AI/ML Infrastructure",
        icon: "brain",
        difficulty: "advanced",
        estimatedTime: "5-6 hours",
        prerequisites: ["04-data", "11-streaming"],
        description: "Build AI-powered systems - vector search, RAG pipelines, and LLM inference at scale.",
        topics: [
            { title: "Vector Databases", description: "Pinecone, Milvus, Weaviate - similarity search patterns", pattern: null },
            { title: "RAG Architecture", description: "Building Embedding Pipelines and Retrieval-Augmented Generation", pattern: null },
            { title: "LLM Serving", description: "High throughput inference and minimizing TTFT (Time to First Token)", pattern: null }
        ]
    },
    {
        id: "13-optimization",
        number: "13",
        title: "Cost & Performance",
        icon: "zap",
        difficulty: "advanced",
        estimatedTime: "4-5 hours",
        prerequisites: ["10-cloud"],
        description: "Optimize for cost and performance - profiling, tuning, and FinOps strategies.",
        topics: [
            { title: "FinOps Strategies", description: "Cost-effective architectures and Spot Instance optimization", pattern: null },
            { title: "Performance Profiling", description: "JVM/Go/Rust profiling and bottleneck identification", pattern: null },
            { title: "Kernel Tuning", description: "Linux performance tuning with eBPF", pattern: null }
        ]
    },
    {
        id: "14-casestudies",
        number: "14",
        title: "Real-World Case Studies",
        icon: "book-open",
        difficulty: "intermediate",
        estimatedTime: "6-8 hours",
        prerequisites: ["03-scalability", "04-data", "05-api"],
        description: "Learn from the best - analyze how top companies solve complex system design problems.",
        topics: [
            { title: "Amazon Order Management", description: "Distributed transactions at e-commerce scale", pattern: null },
            { title: "Netflix CDN", description: "Microservices and content delivery architecture", pattern: null },
            { title: "TikTok Recommendation", description: "Real-time ML inference and Push vs Pull models", pattern: null },
            { title: "Uber Real-time Maps", description: "Geospatial indexing and location tracking", pattern: null }
        ]
    },
    {
        id: "15-capstone",
        number: "15",
        title: "Capstone Projects",
        icon: "award",
        difficulty: "advanced",
        estimatedTime: "10-15 hours",
        prerequisites: ["04-data", "07-reliability", "11-streaming"],
        description: "Apply everything you've learned - design complete systems from scratch.",
        topics: [
            { title: "Design a Global Chat", description: "Multi-region WebSocket synchronization with consistency", pattern: null },
            { title: "Design a Payment System", description: "Distributed transactions, idempotency, and fraud detection", pattern: null },
            { title: "Design a Multiplayer Game", description: "Real-time state synchronization with UDP/QUIC", pattern: null },
            { title: "Design a Search Engine", description: "Distributed crawling, indexing, and vector search", pattern: null }
        ]
    }
];

function renderRoadmapModules() {
    const container = document.getElementById('roadmapModules');
    if (!container) return;
    
    const completedModules = StorageManager.getCompletedModules();
    
    container.innerHTML = ROADMAP_MODULES.map(module => {
        const isCompleted = completedModules.includes(module.id);
        const availableCount = module.topics.filter(t => t.pattern).length;
        const totalCount = module.topics.length;
        
        const difficultyColors = {
            beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            intermediate: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            advanced: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
        };
        
        return `
            <div class="roadmap-module ${isCompleted ? 'completed' : ''}" id="module-${module.id}">
                <div class="roadmap-module-header" onclick="toggleModule('${module.id}')">
                    <div class="flex-1">
                        <div class="flex items-start gap-4">
                            <div class="w-12 h-12 rounded-xl ${isCompleted ? 'bg-green-500' : 'bg-indigo-600'} flex items-center justify-center text-white flex-shrink-0">
                                <i data-lucide="${module.icon}" class="w-6 h-6"></i>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400">Module ${module.number}</span>
                                    <span class="text-xs px-2 py-0.5 rounded-full ${difficultyColors[module.difficulty]} font-semibold">${module.difficulty}</span>
                                    ${isCompleted ? '<span class="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Completed</span>' : ''}
                                </div>
                                <h3 class="text-lg font-bold text-zinc-900 dark:text-white mb-1">${module.title}</h3>
                                <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-2">${module.description}</p>
                                <div class="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                                    <span class="flex items-center gap-1">
                                        <i data-lucide="clock" class="w-3 h-3"></i>
                                        ${module.estimatedTime}
                                    </span>
                                    <span class="flex items-center gap-1">
                                        <i data-lucide="file-text" class="w-3 h-3"></i>
                                        ${availableCount}/${totalCount} patterns
                                    </span>
                                    ${module.prerequisites.length > 0 ? `
                                        <span class="flex items-center gap-1">
                                            <i data-lucide="git-branch" class="w-3 h-3"></i>
                                            Requires: ${module.prerequisites.map(p => ROADMAP_MODULES.find(m => m.id === p)?.number || p).join(', ')}
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 flex-shrink-0">
                        <button onclick="event.stopPropagation(); toggleModuleComplete('${module.id}')" 
                                class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                title="${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}">
                            <i data-lucide="${isCompleted ? 'check-circle-2' : 'circle'}" class="w-5 h-5 ${isCompleted ? 'text-green-500' : 'text-zinc-400'}"></i>
                        </button>
                        <i data-lucide="chevron-down" class="w-5 h-5 text-zinc-400 transition-transform"></i>
                    </div>
                </div>
                <div class="roadmap-module-content">
                    <div class="px-6 pb-6 pt-2">
                        <div class="space-y-1">
                            ${module.topics.map(topic => {
                                const hasPattern = topic.pattern !== null;
                                const pattern = hasPattern ? SYSTEMS.find(s => s.id === topic.pattern) : null;
                                
                                return `
                                    <div class="roadmap-topic ${hasPattern ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg -mx-2 px-2' : ''}" 
                                         ${hasPattern ? `onclick="showDetail('${topic.pattern}')"` : ''}>
                                        <div class="roadmap-topic-bullet ${hasPattern ? 'bg-green-500' : ''}"></div>
                                        <div class="flex-1">
                                            <div class="flex items-center gap-2">
                                                <h4 class="font-semibold text-sm text-zinc-900 dark:text-white">${topic.title}</h4>
                                                ${hasPattern ? '<span class="text-xs px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold">Available</span>' : '<span class="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">Coming Soon</span>'}
                                            </div>
                                            <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">${topic.description}</p>
                                        </div>
                                        ${hasPattern ? '<i data-lucide="arrow-right" class="w-4 h-4 text-zinc-400 flex-shrink-0"></i>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

function toggleModule(moduleId) {
    const module = document.getElementById(`module-${moduleId}`);
    module.classList.toggle('expanded');
    
    const chevron = module.querySelector('[data-lucide="chevron-down"]');
    if (module.classList.contains('expanded')) {
        chevron.style.transform = 'rotate(180deg)';
    } else {
        chevron.style.transform = 'rotate(0deg)';
    }
}

function toggleModuleComplete(moduleId) {
    StorageManager.toggleModuleComplete(moduleId);
    renderRoadmapView();
}

// ============================================================================
// ADR MARKDOWN PARSING
// ============================================================================

function parseADRToHTML(markdown) {
    // Basic markdown to HTML conversion for ADR files
    let html = markdown;
    
    // Headers
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-4xl font-bold mb-6 mt-12">$1</h1>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="adr-heading">$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mb-4 mt-8">$1</h3>');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto mb-6"><code>$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">$1</code>');
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>');
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="adr-content mb-6">');
    html = '<div class="adr-content">' + html + '</div>';
    
    return html;
}

// ============================================================================
// EMBEDDED SYSTEMS DATA (Fallback for local development)
// ============================================================================

function getEmbeddedSystemsData() {
    return [
        {
            "id": "global-sequencer",
            "title": "Global Sequencer",
            "category": "Distributed",
            "icon": "cpu",
            "description": "High-throughput unique ID generation at 12.5M IDs/second with Twitter's Snowflake algorithm.",
            "tags": ["distributed-systems", "scalability", "database", "unique-ids", "snowflake"],
            "difficulty": "intermediate",
            "estimatedReadTime": "15 min",
            "stack": ["Snowflake", "ZooKeeper", "RocksDB", "gRPC"],
            "metadata": {
                "dateAdded": "2026-01-14",
                "source": "Twitter's Snowflake + Production Experience",
                "prerequisites": [],
                "adrNumber": "ADR-001",
                "status": "Production",
                "cost": "$8K/month",
                "throughput": "12.5M TPS"
            },
            "stats": {
                "throughput": "12.5M IDs/sec",
                "latency": "0.8ms P99",
                "cost": "$8K/month",
                "savings": "$37K/month vs managed"
            },
            "adr": {
                "problem": "Generate globally unique, time-ordered 64-bit IDs at 10M+ TPS across multiple regions with sub-millisecond latency and high availability.",
                "context": "Distributed transaction system handling 864 billion transactions/day across 50+ microservices. Must survive datacenter failures while maintaining uniqueness guarantees.",
                "decision": "Twitter's Snowflake Algorithm with ZooKeeper coordination, RocksDB audit log, and gRPC transport. 9 sequencer nodes (3 per region) generating IDs locally without central coordination.",
                "alternatives": "UUIDv4 (2× storage cost), Database Auto-Increment (28K TPS max), Centralized ID Service (adds network latency), MongoDB ObjectID (not time-sortable)",
                "consequences": "✅ Achieved 12.5M TPS with 0.8ms P99 latency. ✅ Saves $444K/year vs managed service. ❌ Clock dependency risk (2 incidents in 6 months). ❌ ZooKeeper dependency for machine ID assignment.",
                "filePath": "./Systems/global-sequencer/ADR-001-Distributed-ID-Generation.md"
            },
            "relatedConcepts": ["distributed-consensus", "lsm-tree"]
        },
        {
            "id": "distributed-consensus",
            "title": "Distributed Consensus",
            "category": "Consistency",
            "icon": "users",
            "description": "Ensuring state machine consistency across distributed nodes via the Raft algorithm.",
            "tags": ["consensus", "distributed-systems", "fault-tolerance", "raft"],
            "difficulty": "advanced",
            "estimatedReadTime": "10 min",
            "stack": ["Raft", "Quorum"],
            "metadata": {
                "dateAdded": "2026-01-05",
                "source": "Raft Paper - Diego Ongaro",
                "prerequisites": []
            },
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
            ],
            "relatedConcepts": ["global-sequencer"]
        },
        {
            "id": "bloom-filter",
            "title": "Bloom Filter",
            "category": "Storage",
            "icon": "filter",
            "description": "Probabilistic set membership to avoid unnecessary expensive disk seeks in LSM storage.",
            "tags": ["data-structures", "probabilistic", "storage", "optimization"],
            "difficulty": "beginner",
            "estimatedReadTime": "5 min",
            "stack": ["Hashing", "Bitset"],
            "metadata": {
                "dateAdded": "2026-01-05",
                "source": "Database Internals Book",
                "prerequisites": []
            },
            "adr": {
                "problem": "Checking if a key exists in an LSM-Tree is expensive due to multiple disk seeks.",
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
            ],
            "relatedConcepts": ["lsm-tree"]
        },
        {
            "id": "lsm-tree",
            "title": "LSM-Tree Storage",
            "category": "Persistence",
            "icon": "database",
            "description": "Write-optimized storage engine designed for high-throughput sequential inserts.",
            "tags": ["storage-engine", "database", "write-optimization", "data-structures"],
            "difficulty": "intermediate",
            "estimatedReadTime": "12 min",
            "stack": ["Memtable", "SSTables"],
            "metadata": {
                "dateAdded": "2026-01-05",
                "source": "Designing Data-Intensive Applications",
                "prerequisites": []
            },
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
            ],
            "relatedConcepts": ["bloom-filter", "global-sequencer"]
        }
    ];
}
