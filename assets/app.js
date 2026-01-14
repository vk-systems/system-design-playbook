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
        "relatedConcepts": ["distributed-consensus", "lsm-tree", "time-ordering"]
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

// Roadmap data structure
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

// State management
let currentFilter = 'all';
let showFavoritesOnly = false;
let filteredSystems = [];
let currentView = 'patterns'; // Track current view

/**
 * Calculate estimated read time based on content
 * Average reading speed: 200-250 words per minute (we use 225)
 */
function calculateReadTime(system) {
    // If manually set, use that
    if (system.estimatedReadTime) {
        return system.estimatedReadTime;
    }
    
    // Calculate from content
    let wordCount = 0;
    
    // Count words in description
    wordCount += system.description.split(/\s+/).length;
    
    // Count words in ADR sections
    if (system.adr) {
        wordCount += (system.adr.problem || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
        wordCount += (system.adr.context || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
        wordCount += (system.adr.decision || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
        wordCount += (system.adr.architecture || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
        wordCount += (system.adr.consequences || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
    }
    
    // Calculate time (225 words per minute)
    const minutes = Math.ceil(wordCount / 225);
    
    return `${minutes} min`;
}

/**
 * LocalStorage management for personal learning features
 */
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
        recent = recent.slice(0, 5); // Keep only last 5
        localStorage.setItem('recentlyViewed', JSON.stringify(recent));
    },
    
    getNotes(id) {
        const notes = JSON.parse(localStorage.getItem('systemNotes') || '{}');
        return notes[id] || '';
    },
    
    saveNotes(id, notes) {
        const allNotes = JSON.parse(localStorage.getItem('systemNotes') || '{}');
        allNotes[id] = notes;
        localStorage.setItem('systemNotes', JSON.stringify(allNotes));
    },
    
    // Roadmap progress tracking
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
        updateRoadmapProgress();
        return completed.includes(moduleId);
    },
    
    isModuleCompleted(moduleId) {
        return this.getCompletedModules().includes(moduleId);
    }
};

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
 * Search functionality
 */
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
               sys.category.toLowerCase().includes(lowerQuery) ||
               sys.adr.problem.toLowerCase().includes(lowerQuery);
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

/**
 * Filter functionality
 */
function filterByCategory(category) {
    currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderSystems();
}

function toggleFavoritesOnly() {
    showFavoritesOnly = !showFavoritesOnly;
    const btn = document.getElementById('favoritesBtn');
    
    if (showFavoritesOnly) {
        btn.classList.add('text-yellow-500');
    } else {
        btn.classList.remove('text-yellow-500');
    }
    
    renderSystems();
}

function getFilteredSystems() {
    let systems = [...SYSTEMS];
    
    // Filter by category
    if (currentFilter !== 'all') {
        systems = systems.filter(sys => sys.category === currentFilter);
    }
    
    // Filter by favorites
    if (showFavoritesOnly) {
        const favorites = StorageManager.getFavorites();
        systems = systems.filter(sys => favorites.includes(sys.id));
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

/**
 * Render systems grid in catalog view
 */
function renderSystems() {
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
        
        // Category-specific styling
        const categoryClass = `category-${sys.category.toLowerCase()}`;
        
        // Show ADR badge and stats if available
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

function toggleFavorite(id) {
    event.stopPropagation();
    StorageManager.toggleFavorite(id);
    renderSystems();
}

/**
 * Show detail view for a specific system
 */
function showDetail(id) {
    const sys = SYSTEMS.find(s => s.id === id);
    if(!sys) return;

    // Track recently viewed
    StorageManager.addToRecentlyViewed(id);
    
    const view = document.getElementById('detailView');
    const catalog = document.getElementById('catalogView');
    const hero = document.getElementById('catalogHero');
    const content = document.getElementById('detailContent');
    
    const isFav = StorageManager.isFavorite(id);
    const userNotes = StorageManager.getNotes(id);
    const readTime = calculateReadTime(sys);
    
    // Get related systems
    const relatedSystems = sys.relatedConcepts 
        ? sys.relatedConcepts.map(relId => SYSTEMS.find(s => s.id === relId)).filter(Boolean)
        : [];

    content.innerHTML = `
        <!-- Breadcrumbs -->
        <div class="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-6\">
            <button onclick="showCatalog()" class="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Home</button>
            <i data-lucide="chevron-right" class="w-3 h-3"></i>
            <span class="text-zinc-700 dark:text-zinc-300">${sys.category}</span>
            <i data-lucide="chevron-right" class="w-3 h-3"></i>
            <span class="text-zinc-900 dark:text-zinc-100 font-semibold">${sys.title}</span>
        </div>
        
        <div class="mb-16">
            <button onclick="showCatalog()" class="group flex items-center gap-2 text-sm font-semibold mb-8 text-zinc-600 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Catalog
            </button>
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

    catalog.classList.add('hidden');
    hero.classList.add('hidden');
    view.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    lucide.createIcons();
}

function toggleFavoriteDetail(id) {
    StorageManager.toggleFavorite(id);
    showDetail(id); // Re-render to update star
}

function saveNotes(id) {
    const notes = document.getElementById('userNotes').value;
    StorageManager.saveNotes(id, notes);
}

/**
 * Parse ADR markdown into styled HTML sections
 */
function parseADRToHTML(markdown) {
    // Configure marked with GFM for proper link and checkbox handling
    marked.use({
        gfm: true,
        breaks: true
    });
    
    const sections = [];
    const lines = markdown.split('\n');
    let currentSection = null;
    let currentContent = [];
    
    for (let line of lines) {
        if (line.startsWith('## ')) {
            // Save previous section
            if (currentSection) {
                sections.push({ title: currentSection, content: currentContent.join('\n') });
            }
            // Start new section - remove all emojis and extra whitespace
            currentSection = line
                .replace('## ', '')
                .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\uFE0F]/gu, '')
                .trim();
            currentContent = [];
        } else if (currentSection) {
            currentContent.push(line);
        }
    }
    
    // Save last section
    if (currentSection) {
        sections.push({ title: currentSection, content: currentContent.join('\n') });
    }
    
    // Render sections
    return sections.map((section, index) => {
        const html = marked.parse(section.content);
        const sectionId = `adr-section-${index}`;
        
        // Choose styling based on section type
        if (section.title.includes('Context') || section.title.includes('Problem')) {
            return `
                <details class="mb-6 group" ${index < 3 ? 'open' : ''}>
                    <summary class="cursor-pointer list-none p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-black flex items-center gap-3">
                                <span class="w-1 h-6 bg-cyan-600 rounded-full"></span>
                                ${section.title}
                            </h2>
                            <i data-lucide="chevron-down" class="w-5 h-5 transition-transform group-open:rotate-180"></i>
                        </div>
                    </summary>
                    <div class="mt-3 p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-700 prose prose-zinc dark:prose-invert max-w-none">
                        ${html}
                    </div>
                </details>
            `;
        } else if (section.title.includes('Decision')) {
            return `
                <details class="mb-6 group" ${index < 3 ? 'open' : ''}>
                    <summary class="cursor-pointer list-none p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-xl border border-cyan-200 dark:border-cyan-800 hover:from-cyan-100 hover:to-blue-100 dark:hover:from-cyan-950/30 dark:hover:to-blue-950/30 transition-colors">
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-black flex items-center gap-3">
                                <span class="w-1 h-6 bg-cyan-600 rounded-full"></span>
                                ${section.title}
                            </h2>
                            <i data-lucide="chevron-down" class="w-5 h-5 transition-transform group-open:rotate-180"></i>
                        </div>
                    </summary>
                    <div class="mt-3 p-6 bg-white dark:bg-zinc-950 rounded-xl border border-cyan-200 dark:border-cyan-800 prose prose-zinc dark:prose-invert max-w-none">
                        ${html}
                    </div>
                </details>
            `;
        } else if (section.title.includes('Rationale') || section.title.includes('Why')) {
            return `
                <details class="mb-6 group">
                    <summary class="cursor-pointer list-none p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors">
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-black flex items-center gap-3">
                                <span class="w-1 h-6 bg-cyan-600 rounded-full"></span>
                                ${section.title}
                            </h2>
                            <i data-lucide="chevron-down" class="w-5 h-5 transition-transform group-open:rotate-180"></i>
                        </div>
                    </summary>
                    <div class="mt-3 p-6 bg-white dark:bg-zinc-950 rounded-xl border border-blue-200 dark:border-blue-800 prose prose-zinc dark:prose-invert max-w-none">
                        ${html}
                    </div>
                </details>
            `;
        } else if (section.title.includes('Consequence')) {
            return `
                <details class="mb-6 group">
                    <summary class="cursor-pointer list-none p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-950/30 dark:hover:to-pink-950/30 transition-colors">
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-black flex items-center gap-3">
                                <span class="w-1 h-6 bg-cyan-600 rounded-full"></span>
                                ${section.title}
                            </h2>
                            <i data-lucide="chevron-down" class="w-5 h-5 transition-transform group-open:rotate-180"></i>
                        </div>
                    </summary>
                    <div class="mt-3 p-6 bg-white dark:bg-zinc-950 rounded-xl border border-purple-200 dark:border-purple-800 prose prose-zinc dark:prose-invert max-w-none">
                        ${html}
                    </div>
                </details>
            `;
        } else if (section.title.includes('Alternative')) {
            return `
                <details class="mb-6 group">
                    <summary class="cursor-pointer list-none p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors">
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-black flex items-center gap-3">
                                <span class="w-1 h-6 bg-cyan-600 rounded-full"></span>
                                ${section.title}
                            </h2>
                            <i data-lucide="chevron-down" class="w-5 h-5 transition-transform group-open:rotate-180"></i>
                        </div>
                    </summary>
                    <div class="mt-3 p-6 bg-white dark:bg-zinc-950 rounded-xl border border-amber-200 dark:border-amber-800 prose prose-zinc dark:prose-invert max-w-none">
                        ${html}
                    </div>
                </details>
            `;
        } else if (section.title.includes('Implementation') || section.title.includes('Capacity')) {
            return `
                <details class="mb-6 group">
                    <summary class="cursor-pointer list-none p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors">
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-black flex items-center gap-3">
                                <span class="w-1 h-6 bg-cyan-600 rounded-full"></span>
                                ${section.title}
                            </h2>
                            <i data-lucide="chevron-down" class="w-5 h-5 transition-transform group-open:rotate-180"></i>
                        </div>
                    </summary>
                    <div class="mt-3 p-6 bg-white dark:bg-zinc-950 rounded-xl border border-green-200 dark:border-green-800 prose prose-zinc dark:prose-invert max-w-none">
                        ${html}
                    </div>
                </details>
            `;
        } else if (section.title.includes('Break') || section.title.includes('Failure')) {
            return `
                <details class="mb-6 group">
                    <summary class="cursor-pointer list-none p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors">
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-black flex items-center gap-3">
                                <span class="w-1 h-6 bg-cyan-600 rounded-full"></span>
                                ${section.title}
                            </h2>
                            <i data-lucide="chevron-down" class="w-5 h-5 transition-transform group-open:rotate-180"></i>
                        </div>
                    </summary>
                    <div class="mt-3 p-6 bg-white dark:bg-zinc-950 rounded-xl border border-red-200 dark:border-red-800 prose prose-zinc dark:prose-invert max-w-none">
                        ${html}
                    </div>
                </details>
            `;
        } else {
            // Default styling for other sections
            return `
                <details class="mb-6 group">
                    <summary class="cursor-pointer list-none p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-black flex items-center gap-3">
                                <span class="w-1 h-6 bg-cyan-600 rounded-full"></span>
                                ${section.title}
                            </h2>
                            <i data-lucide="chevron-down" class="w-5 h-5 transition-transform group-open:rotate-180"></i>
                        </div>
                    </summary>
                    <div class="mt-3 p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-700 prose prose-zinc dark:prose-invert max-w-none">
                        ${html}
                    </div>
                </details>
            `;
        }
    }).join('');
}

/**
 * Show ADR with custom HTML styling (not markdown prose)
 */
async function showADR(filePath, title, systemId) {
    const view = document.getElementById('detailView');
    const catalog = document.getElementById('catalogView');
    const hero = document.getElementById('catalogHero');
    const content = document.getElementById('detailContent');
    
    const sys = SYSTEMS.find(s => s.id === systemId);
    if (!sys) return;
    
    try {
        const response = await fetch(filePath);
        const markdown = await response.text();
        
        content.innerHTML = `
            <div class="max-w-5xl mx-auto">
                <!-- Sticky Header -->
                <div class="sticky top-0 z-10 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 -mx-8 px-8 py-4 mb-8">
                    <button onclick="showDetail('${systemId}')" class="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Pattern
                    </button>
                </div>
                
                <!-- Header -->
                <div class="mb-12">
                    <div class="inline-flex items-center gap-2 mb-3">
                        <span class="w-2 h-2 rounded-full bg-cyan-600"></span>
                        <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Architecture Decision Record</span>
                    </div>
                    <h1 class="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">${title}</h1>
                    <div class="flex gap-2 flex-wrap">
                        <span class="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-semibold">✅ Production</span>
                        <span class="px-3 py-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 rounded-full text-sm">January 2026</span>
                    </div>
                </div>
                
                <!-- Quick Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div class="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/10 border border-cyan-200 dark:border-cyan-800">
                        <div class="text-sm text-cyan-600 dark:text-cyan-400 mb-1 font-medium">Throughput</div>
                        <div class="text-2xl font-black text-cyan-900 dark:text-cyan-100 break-words">${sys.stats.throughput}</div>
                    </div>
                    <div class="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/10 border border-green-200 dark:border-green-800">
                        <div class="text-sm text-green-600 dark:text-green-400 mb-1 font-medium">Latency</div>
                        <div class="text-2xl font-black text-green-900 dark:text-green-100 break-words">${sys.stats.latency}</div>
                    </div>
                    <div class="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10 border border-orange-200 dark:border-orange-800">
                        <div class="text-sm text-orange-600 dark:text-orange-400 mb-1 font-medium">Cost</div>
                        <div class="text-2xl font-black text-orange-900 dark:text-orange-100 break-words">${sys.stats.cost}</div>
                    </div>
                    <div class="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800">
                        <div class="text-sm text-purple-600 dark:text-purple-400 mb-1 font-medium">Savings</div>
                        <div class="text-2xl font-black text-purple-900 dark:text-purple-100 break-words">${sys.stats.savings}</div>
                    </div>
                </div>
                
                <!-- Section Controls -->
                <div class="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                    <h2 class="text-lg font-black text-zinc-700 dark:text-zinc-300">Documentation Sections</h2>
                    <button id="toggleAllSections" class="px-4 py-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 rounded-lg transition-colors flex items-center gap-2 border border-cyan-200 dark:border-cyan-800">
                        <i data-lucide="chevrons-down-up" class="w-4 h-4"></i>
                        <span>Collapse All</span>
                    </button>
                </div>
                
                <!-- Parsed ADR Content -->
                ${parseADRToHTML(markdown)}
            </div>
        `;
        
        catalog.classList.add('hidden');
        hero.classList.add('hidden');
        view.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        lucide.createIcons();
        
        // Make external links open in new tab and enable checkboxes
        setTimeout(() => {
            document.querySelectorAll('.prose a[href^="http://"], .prose a[href^="https://"]').forEach(link => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });
            
            // Enable checkboxes
            document.querySelectorAll('.prose input[type="checkbox"]').forEach(checkbox => {
                checkbox.removeAttribute('disabled');
            });
            
            // Setup toggle all sections button
            const toggleBtn = document.getElementById('toggleAllSections');
            if (toggleBtn) {
                let allExpanded = true; // Start with true since first 3 are open
                
                toggleBtn.addEventListener('click', () => {
                    const allSections = document.querySelectorAll('#detailView details');
                    
                    allSections.forEach(section => {
                        if (allExpanded) {
                            section.removeAttribute('open');
                        } else {
                            section.setAttribute('open', '');
                        }
                    });
                    
                    allExpanded = !allExpanded;
                    const icon = toggleBtn.querySelector('i');
                    const text = toggleBtn.querySelector('span');
                    
                    if (allExpanded) {
                        icon.setAttribute('data-lucide', 'chevrons-down-up');
                        text.textContent = 'Collapse All';
                    } else {
                        icon.setAttribute('data-lucide', 'chevrons-up-down');
                        text.textContent = 'Expand All';
                    }
                    
                    lucide.createIcons();
                });
            }
        }, 100);
    } catch (error) {
        console.error('Error loading ADR:', error);
        content.innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-600 dark:text-red-400">Failed to load ADR content</p>
                <p class="text-sm text-zinc-500 mt-2">${error.message}</p>
            </div>
        `;
    }
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
    updateFilterCounts();
    updateHeroStats();
    renderSystems();
}

/**
 * View Management - Switch between Concepts and Roadmap
 */
function showView(view) {
    currentView = view;
    
    // Update navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`nav${view.charAt(0).toUpperCase() + view.slice(1)}`).classList.add('active');
    
    // Show/hide views
    if (view === 'patterns') {
        document.getElementById('catalogView').classList.remove('hidden');
        document.getElementById('roadmapView').classList.add('hidden');
        document.getElementById('cheatsheetView').classList.add('hidden');
        document.getElementById('detailView').classList.add('hidden');
    } else if (view === 'roadmap') {
        document.getElementById('catalogView').classList.add('hidden');
        document.getElementById('roadmapView').classList.remove('hidden');
        document.getElementById('cheatsheetView').classList.add('hidden');
        document.getElementById('detailView').classList.add('hidden');
        renderRoadmap();
    } else if (view === 'cheatsheet') {
        document.getElementById('catalogView').classList.add('hidden');
        document.getElementById('roadmapView').classList.add('hidden');
        document.getElementById('cheatsheetView').classList.remove('hidden');
        document.getElementById('detailView').classList.add('hidden');
        loadCheatSheet();
    }
}

/**
 * Render Roadmap Modules
 */
function loadCheatSheet() {
    const cheatsheetView = document.getElementById('cheatsheetView');
    
    // Show loading state
    cheatsheetView.innerHTML = '<div class="flex items-center justify-center py-20"><div class="text-zinc-500 dark:text-zinc-400">Loading fundamentals...</div></div>';
    
    // Fetch and render the HTML page
    fetch(`./fundamentals.html?v=${Date.now()}`)
        .then(response => {
            console.log('Fetch response:', response.status, response.statusText);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return response.text();
        })
        .then(html => {
            console.log('HTML loaded');
            
            // Parse the HTML and extract the body content
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const bodyContent = doc.body.innerHTML;
            
            // Replace the entire view content
            cheatsheetView.innerHTML = bodyContent;
            
            // Execute any inline scripts
            const scripts = cheatsheetView.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                script.parentNode.replaceChild(newScript, script);
            });
        })
        .catch(error => {
            console.error('Fundamentals load error:', error);
            cheatsheetView.innerHTML = `
                <div class="text-center py-20">
                    <div class="text-red-500 dark:text-red-400 mb-2">Failed to load fundamentals</div>
                    <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-4">${error.message}</div>
                    <div class="text-xs text-zinc-400 dark:text-zinc-500">
                        Check browser console for details.<br>
                        Server must be running: <code class="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">python -m http.server 8000</code>
                    </div>
                </div>
            `;
        });
}

function renderRoadmap() {
    const container = document.getElementById('roadmapModules');
    const completedModules = StorageManager.getCompletedModules();
    
    container.innerHTML = ROADMAP_MODULES.map(module => {
        const isCompleted = completedModules.includes(module.id);
        const availableCount = module.topics.filter(t => t.pattern).length;
        const totalCount = module.topics.length;
        
        // Difficulty badge colors
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
    
    // Reinitialize icons
    lucide.createIcons();
    updateRoadmapProgress();
}

/**
 * Toggle roadmap module expansion
 */
function toggleModule(moduleId) {
    const module = document.getElementById(`module-${moduleId}`);
    module.classList.toggle('expanded');
    
    // Rotate chevron
    const chevron = module.querySelector('[data-lucide="chevron-down"]');
    if (module.classList.contains('expanded')) {
        chevron.style.transform = 'rotate(180deg)';
    } else {
        chevron.style.transform = 'rotate(0deg)';
    }
}

/**
 * Toggle module completion status
 */
function toggleModuleComplete(moduleId) {
    StorageManager.toggleModuleComplete(moduleId);
    renderRoadmap();
}

/**
 * Update roadmap progress counter
 */
function updateRoadmapProgress() {
    const countEl = document.getElementById('roadmapProgressCount');
    if (countEl) {
        const completed = StorageManager.getCompletedModules().length;
        countEl.textContent = completed;
    }
    
    // Update hero progress percentage
    const progressEl = document.getElementById('heroProgressPercent');
    if (progressEl) {
        const completed = StorageManager.getCompletedModules().length;
        const total = ROADMAP_MODULES.length;
        const percent = Math.round((completed / total) * 100);
        progressEl.textContent = percent;
    }
}

/**
 * Filter by status (production, coming soon)
 */
function filterByStatus(status) {
    const filtered = SYSTEMS.filter(sys => {
        if (status === 'production') {
            return sys.metadata?.status === 'Production';
        }
        return true;
    });
    renderSystemGrid(filtered);
}

/**
 * Update hero section stats
 */
function updateHeroStats() {
    const countEl = document.getElementById('heroPatternCount');
    if (countEl) {
        countEl.textContent = SYSTEMS.length;
    }
    
    // Update catalog stats cards
    const totalPatterns = SYSTEMS.length;
    const productionADRs = SYSTEMS.filter(s => s.metadata?.status === 'Production').length;
    const comingSoon = SYSTEMS.filter(s => s.metadata?.status === 'Coming Soon').length;
    const categories = [...new Set(SYSTEMS.map(s => s.category))].length;
    
    const statTotal = document.getElementById('statTotalPatterns');
    const statADRs = document.getElementById('statTotalADRs');
    const statCategories = document.getElementById('statCategories');
    
    if (statTotal) {
        statTotal.textContent = totalPatterns;
        const subtitle = statTotal.nextElementSibling;
        if (subtitle) subtitle.textContent = `${productionADRs} Production Ready`;
    }
    if (statADRs) {
        statADRs.textContent = productionADRs;
        const subtitle = statADRs.nextElementSibling;
        if (subtitle) subtitle.textContent = `${comingSoon} Coming Soon`;
    }
    if (statCategories) statCategories.textContent = categories;
    
    updateRoadmapProgress(); // Also update progress on init
}

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Cmd+K or Ctrl+K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
    }
    
    // ESC to close search
    if (e.key === 'Escape') {
        const container = document.getElementById('searchContainer');
        if (container && !container.classList.contains('hidden')) {
            toggleSearch();
        }
    }
});

/**
 * Search input listener
 */
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
    }
    
    // Set default active view
    showView('patterns');
});

/**
 * Initialize application
 */
window.addEventListener('DOMContentLoaded', () => {
    loadSystemsData();
});
