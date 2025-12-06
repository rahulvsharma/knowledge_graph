# NLP Assignment 1 - PS 10: Knowledge Graph Application - Enhancement Plan (Part B)

### Group ID: 61

### Group Members Name with Student ID:

1. Arpita Singh (2024AA05027) Contribution 100%
2. Rahul Sharma (2024AA05893) Contribution 100%
3. Sachit Pandey (2024AA05023) Contribution 100%
4. Avishek Ghatak (2024AA05895) Contribution 100%
5. Anoushka Guleria (2023AA05527) Contribution 100%

## Executive Summary

This document outlines comprehensive improvements to the Knowledge Graph application for handling large-scale, complex E-Commerce Product Networks with millions of entities and relationships. The enhancements focus on scalability, efficiency, and user experience.

---

## 1. Overview

As the Knowledge Graph grows in size (for example, when dealing with thousands of products, sellers, categories, and reviews in an E-Commerce system), the basic version of the application may start facing challenges. This enhancement plan outlines practical steps to make the system faster, more scalable, and easier to use for larger or more complex datasets.

## 2. Improving Data Storage

### Current Situation

- The graph is stored fully in memory using NetworkX.
- This is suitable for small datasets but becomes slow and memory-heavy for larger ones.

### Suggested Improvement: Use a Graph Database (Neo4j)

- Neo4j is designed specifically for storing and querying large graphs.
- It provides faster traversal, indexing, and optimized relationship queries.
- Uses Cypher query language, which is efficient for relationship-heavy data.

**Why it helps:**  
Efficiently handles thousands or millions of relationships in an e-commerce dataset and supports advanced queries and recommendations.

## 3. Handling Large CSV Imports

### Current Situation

- CSV uploads are fully processed in memory.
- No validation, batching, or duplicate detection.

### Suggested Improvements

1. Batch processing to load CSVs in smaller chunks.
2. Add basic validation rules for data quality.
3. Detect and avoid duplicate relationships.

**Why it helps:**  
Improves reliability and avoids performance issues when importing large datasets.

## 4. Improving Query Performance

### Current Situation

- Queries run directly on the in-memory graph.
- Performance slows as the graph grows.

### Suggested Improvements

1. Add indexing in graph databases.
2. Cache repeated queries.
3. Paginate large query results.

**Why it helps:**  
Makes queries faster and ensures the application remains responsive.

## 5. Scaling the Application

### Current Situation

- The entire backend runs on a single Flask instance.

### Suggested Improvements

- Break the system into smaller services (ingestion, querying, UI).
- Use cloud hosting with autoscaling.
- Move large imports to background workers.

**Why it helps:**  
Ensures stable performance as usage increases.

## 6. Improving User Experience

### Suggested Improvements

- Add filters for nodes and relationships.
- Use a more powerful graph visualization library.
- Add a query builder to help non-technical users.

## 7. Better Support for E-Commerce Data

### Suggested Enhancements

- Add domain-specific relationships such as purchased_by, recommended_with.
- Allow relationships to store extra attributes like ratings.
- Provide smart queries like similar products, co-purchased items.

## 8. Monitoring and Stability Improvements

### Suggested Enhancements

- Add logging and error tracking.
- Show progress during large uploads.
- Add a small dashboard with counts and metrics.

## 9. Summary

These enhancements aim to make the Knowledge Graph application:

- More scalable
- More efficient
- More user‑friendly
- Better suited for large e-commerce datasets

They can be implemented gradually based on priority.
