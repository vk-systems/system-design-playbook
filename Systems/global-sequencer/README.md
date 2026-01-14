# Global Sequencer: Distributed Unique ID Generation

> 📋 **Architecture Decision Record:** See [ADR-001: Distributed ID Generation at 10M+ TPS](./ADR-001-Distributed-ID-Generation.md) for the complete decision context, rationale, costs, and production incidents.

---

## Quick Overview

**Problem:** Generate unique, 64-bit, time-ordered IDs at a scale of 10M+ TPS with sub-millisecond latency and high availability.

**Solution:** Twitter's Snowflake Algorithm with custom infrastructure

**Production Stats:**
- 🚀 **12.5M IDs/second** (25% above requirement)
- ⚡ **0.8ms P99 latency**
- 💰 **$8K/month** infrastructure cost (vs $45K managed alternative)
- ✅ **Zero collisions** in 6 months of production

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│ Snowflake ID Structure (64 bits)                        │
├─────────────────────────────────────────────────────────┤
│ 1 bit │ 41 bits      │ 10 bits    │ 12 bits             │
│ Sign  │ Timestamp    │ Machine ID │ Sequence            │
│ (0)   │ (ms since    │ (0-1023)   │ (0-4095)            │
│       │  epoch)      │            │                     │
└─────────────────────────────────────────────────────────┘

Maximum: 4.096M IDs/second per server
Our load: 125K IDs/second per server
Headroom: 32× safety margin
```

### The Winning Stack

| Component | Technology | Role |
|-----------|-----------|------|
| **Generation** | Snowflake Algorithm | Core ID generation logic |
| **Coordination** | Apache ZooKeeper | Machine ID assignment (lease-based) |
| **Persistence** | RocksDB (LSM-Tree) | Audit log for compliance |
| **Transport** | gRPC + Protocol Buffers | Client communication |
| **Deployment** | EC2 c5.2xlarge (9 nodes) | 3 per region across 3 regions |

---

## Why This Design?

### vs UUIDv4
- ✅ **2× smaller** (8 bytes vs 16 bytes)
- ✅ **5.6× faster inserts** in databases (k-ordered vs random)
- ✅ **Time-sortable** for analytics and debugging
- 💰 **Saves $2,500/month** in storage costs alone

### vs Database Auto-Increment
- ✅ **444× more throughput** (12.5M vs 28K TPS)
- ✅ **No single point of failure**
- ✅ **Multi-region support** without cross-region latency
- ⚡ **30× lower latency** (0.8ms vs 15ms)

### vs Centralized ID Service
- ✅ **No network hop** (embedded in each node)
- ✅ **Lower complexity** (no separate service to run)
- 💰 **Saves $7K/month** in infrastructure

---