/**
 * Knowledge Graph Application - Frontend JavaScript
 * Handles UI interactions and visualization
 */

const API_BASE = "/api/graph";
let graphData = null;
let simulation = null;
let svg = null;

// ============================================
// EXAMPLE DATA FOR AUTO-FILL
// ============================================

// Examples showing entity1 -> relationship -> entity2
const EXAMPLES = [
  { entity1: "Laptop", relationship: "belongs_to", entity2: "Electronics" },
  { entity1: "Tablet", relationship: "is_a", entity2: "Electronics" },
  { entity1: "iPhone", relationship: "belongs_to", entity2: "Electronics" },
  { entity1: "Laptop", relationship: "sold_by", entity2: "Amazon" },
  { entity1: "Amazon", relationship: "manages", entity2: "Flipkart" },
  { entity1: "Customer1", relationship: "purchases_from", entity2: "Amazon" },
  {
    entity1: "Electronics",
    relationship: "has_category",
    entity2: "Accessories",
  },
  { entity1: "Seller1", relationship: "partner_of", entity2: "Amazon" },
  { entity1: "Laptop", relationship: "priced_at", entity2: "999" },
  { entity1: "Product1", relationship: "reviewed_by", entity2: "Customer1" },
];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
  loadGraphData();
  updateStats();
  setupD3Visualization();
  // Initialize MDC components (text fields & ripples)
  if (window.mdc) {
    // Text fields
    document.querySelectorAll(".mdc-text-field").forEach((el) => {
      try {
        new mdc.textField.MDCTextField(el);
      } catch (e) {}
    });
    // Buttons: add ripple effect
    document.querySelectorAll(".btn").forEach((btn) => {
      try {
        // new mdc.ripple.MDCRipple(btn);
      } catch (e) {}
    });
    // Selects
    document.querySelectorAll(".mdc-select").forEach((el) => {
      try {
        new mdc.select.MDCSelect(el);
      } catch (e) {}
    });
  }
});

function initializeEventListeners() {
  // Add relationship button
  document.getElementById("addBtn").addEventListener("click", addRelationship);

  // File upload
  document
    .getElementById("uploadBtn")
    .addEventListener("click", handleFileUpload);

  // Query buttons
  document.getElementById("queryBtn").addEventListener("click", executeQuery);
  document
    .getElementById("queryType")
    .addEventListener("change", handleQueryTypeChange);

  // Export and clear buttons
  document.getElementById("exportBtn").addEventListener("click", exportGraph);
  document.getElementById("clearBtn").addEventListener("click", clearGraph);

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", switchTab);
  });

  // Example auto-fill listeners
  document
    .getElementById("entity1")
    .addEventListener("input", handleEntity1Change);
  document
    .getElementById("relationship")
    .addEventListener("input", handleRelationshipChange);
  document
    .getElementById("entity2")
    .addEventListener("input", handleEntity2Change);

  // File input trigger (custom button)
  const uploadTrigger = document.getElementById("uploadTriggerBtn");
  const csvInput = document.getElementById("csvFile");
  if (uploadTrigger && csvInput) {
    uploadTrigger.addEventListener("click", () => csvInput.click());
    csvInput.addEventListener("change", (e) => {
      const nameSpan = document.getElementById("csvFileName");
      if (csvInput.files && csvInput.files.length > 0) {
        nameSpan.textContent = csvInput.files[0].name;
      } else {
        nameSpan.textContent = "No file chosen";
      }
    });
  }

  // Enter key in input fields
  document
    .getElementById("entity1")
    .addEventListener(
      "keypress",
      (e) => e.key === "Enter" && addRelationship()
    );
  document
    .getElementById("entity2")
    .addEventListener(
      "keypress",
      (e) => e.key === "Enter" && addRelationship()
    );
  document
    .getElementById("queryEntity")
    .addEventListener("keypress", (e) => e.key === "Enter" && executeQuery());
}

// ============================================
// ADD RELATIONSHIP
// ============================================

async function addRelationship() {
  const entity1 = document.getElementById("entity1").value.trim();
  const relationship = document.getElementById("relationship").value.trim();
  const entity2 = document.getElementById("entity2").value.trim();
  const statusDiv = document.getElementById("addStatus");

  if (!entity1 || !relationship || !entity2) {
    showStatus(statusDiv, "All fields are required", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/add-relationship`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity1, relationship, entity2 }),
    });

    const data = await response.json();

    if (data.status === "success") {
      showStatus(statusDiv, data.message, "success");
      // Clear fields and update floating labels
      setTextFieldValue("entity1", "");
      setTextFieldValue("relationship", "");
      setTextFieldValue("entity2", "");
      loadGraphData();
      updateStats();
    } else {
      showStatus(statusDiv, data.message, "error");
    }
  } catch (error) {
    showStatus(statusDiv, `Error: ${error.message}`, "error");
  }
}

// ============================================
// AUTO-FILL EXAMPLE HANDLERS
// ============================================

// Helper to set value on MDC text fields and float label when programmatically updating
function setTextFieldValue(inputId, value) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.value = value;

  // If using MDC filled textfield, ensure floating label floats
  const tf = input.closest(".mdc-text-field");
  if (tf) {
    const label = tf.querySelector(".mdc-floating-label");
    if (label) {
      if (value && value.length > 0) {
        label.classList.add("mdc-floating-label--float-above");
      } else {
        label.classList.remove("mdc-floating-label--float-above");
      }
    }
  }
}

function handleEntity1Change() {
  const entity1Input = document.getElementById("entity1");
  const relationshipInput = document.getElementById("relationship");
  const entity2Input = document.getElementById("entity2");

  // Find matching example
  const example = EXAMPLES.find(
    (e) => e.entity1.toLowerCase() === entity1Input.value.toLowerCase()
  );

  if (example) {
    // Auto-fill relationship and entity2 (and float labels)
    setTextFieldValue("relationship", example.relationship);
    setTextFieldValue("entity2", example.entity2);
  }
}

function handleRelationshipChange() {
  const entity1Input = document.getElementById("entity1");
  const relationshipInput = document.getElementById("relationship");
  const entity2Input = document.getElementById("entity2");

  // Find matching example based on entity1 and relationship
  const example = EXAMPLES.find(
    (e) =>
      e.entity1.toLowerCase() === entity1Input.value.toLowerCase() &&
      e.relationship.toLowerCase() === relationshipInput.value.toLowerCase()
  );

  if (example) {
    // Auto-fill entity2 (and float label)
    setTextFieldValue("entity2", example.entity2);
  }
}

function handleEntity2Change() {
  // Entity2 doesn't auto-fill others, but we could add additional logic here
  // For now, this is just a placeholder for consistency
}

// ============================================
// FILE UPLOAD
// ============================================

function handleFileUpload() {
  const fileInput = document.getElementById("csvFile");
  const statusDiv = document.getElementById("uploadStatus");

  if (!fileInput.files || !fileInput.files[0]) {
    showStatus(statusDiv, "Please select a file", "error");
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

  showStatus(statusDiv, "Uploading...", "info");

  fetch(`${API_BASE}/upload-csv`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success" || data.added_count > 0) {
        showStatus(
          statusDiv,
          `Added ${data.added_count} relationships`,
          "success"
        );
        fileInput.value = "";
        loadGraphData();
        updateStats();
      } else {
        showStatus(statusDiv, data.message || "Upload failed", "error");
      }
    })
    .catch((error) => {
      showStatus(statusDiv, `Error: ${error.message}`, "error");
    });
}

// ============================================
// QUERY FUNCTIONS
// ============================================

function handleQueryTypeChange() {
  const queryType = document.getElementById("queryType").value;
  const pathTargetDiv = document.getElementById("pathTargetDiv");
  pathTargetDiv.style.display = queryType === "path" ? "block" : "none";
}

async function executeQuery() {
  const queryType = document.getElementById("queryType").value;
  const entity = document.getElementById("queryEntity").value.trim();
  const statusDiv = document.getElementById("queryStatus");

  if (!entity) {
    showStatus(statusDiv, "Please enter an entity name", "error");
    return;
  }

  let endpoint, payload;

  switch (queryType) {
    case "neighbors":
      endpoint = "/query-neighbors";
      payload = { entity, direction: "both" };
      break;
    case "path":
      const target = document.getElementById("pathTarget").value.trim();
      if (!target) {
        showStatus(statusDiv, "Please enter a target entity", "error");
        return;
      }
      endpoint = "/find-path";
      payload = { source: entity, target };
      break;
    case "relationship":
      endpoint = "/search-relationship";
      payload = { relationship: entity };
      break;
    default:
      return;
  }

  try {
    showStatus(statusDiv, "Querying...", "info");
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.status === "success") {
      showStatus(statusDiv, "Query completed", "success");
      displayResults(data, queryType);
      // Use setTimeout to ensure DOM is updated before switching tab
      setTimeout(() => switchTab(null, "results"), 100);
    } else {
      showStatus(statusDiv, data.message || "Query failed", "error");
    }
  } catch (error) {
    showStatus(statusDiv, `Error: ${error.message}`, "error");
  }
}

function displayResults(data, queryType) {
  const resultsContainer = document.getElementById("results-container");
  resultsContainer.innerHTML = "";

  let html = "";

  switch (queryType) {
    case "neighbors":
      html = displayNeighborsResults(data);
      break;
    case "path":
      html = displayPathResults(data);
      break;
    case "relationship":
      html = displayRelationshipResults(data);
      break;
  }

  resultsContainer.innerHTML = html;
}

function displayNeighborsResults(data) {
  let html = `<div class="result-item">
        <div class="result-title">Neighbors of: ${data.entity}</div>
        <div class="result-content">`;

  if (data.neighbors.outgoing && data.neighbors.outgoing.length > 0) {
    html += "<h4>Outgoing Relationships:</h4><ul>";
    data.neighbors.outgoing.forEach((item) => {
      html += `<li><strong>${data.entity}</strong> --[${item.relationship}]--> <strong>${item.target}</strong></li>`;
    });
    html += "</ul>";
  }

  if (data.neighbors.incoming && data.neighbors.incoming.length > 0) {
    html += "<h4>Incoming Relationships:</h4><ul>";
    data.neighbors.incoming.forEach((item) => {
      html += `<li><strong>${item.source}</strong> --[${item.relationship}]--> <strong>${data.entity}</strong></li>`;
    });
    html += "</ul>";
  }

  if (
    (!data.neighbors.outgoing || data.neighbors.outgoing.length === 0) &&
    (!data.neighbors.incoming || data.neighbors.incoming.length === 0)
  ) {
    html += "<p><em>No relationships found for this entity</em></p>";
  }

  html += "</div></div>";
  return html;
}

function displayPathResults(data) {
  let html = `<div class="result-item">
        <div class="result-title">Paths from ${data.source} to ${data.target}</div>
        <div class="result-content">
        <p><strong>Paths Found: ${data.paths_found}</strong></p>`;

  if (data.paths_found > 0) {
    data.paths.forEach((path, idx) => {
      const pathStr = path
        .map((p, i) => {
          if (i === path.length - 1) return p.entity;
          return `${p.entity} --[${p.relationship}]-->`;
        })
        .join(" ");
      html += `<div class="path-item">Path ${idx + 1}: ${pathStr}</div>`;
    });
  } else {
    html += "<p><em>No paths found between these entities</em></p>";
  }

  html += "</div></div>";
  return html;
}

function displayRelationshipResults(data) {
  let html = `<div class="result-item">
        <div class="result-title">Relationships of type: ${data.relationship}</div>
        <div class="result-content">
        <p><strong>Count: ${data.count}</strong></p>`;

  if (data.count > 0) {
    html += "<ul>";
    data.results.forEach((item) => {
      html += `<li><strong>${item.source}</strong> --[${item.relationship}]--> <strong>${item.target}</strong></li>`;
    });
    html += "</ul>";
  } else {
    html += "<p><em>No relationships of this type found</em></p>";
  }

  html += "</div></div>";
  return html;
}

// ============================================
// STATISTICS
// ============================================

async function updateStats() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    const data = await response.json();

    if (data.status === "success") {
      const stats = data.stats;
      document.getElementById("entityCount").textContent = stats.total_entities;
      document.getElementById("relationshipCount").textContent =
        stats.total_relationships;

      const types = Object.keys(stats.relationship_types).join(", ") || "-";
      document.getElementById("relationshipTypes").textContent = types;
    }
  } catch (error) {
    console.error("Error updating stats:", error);
  }
}

// ============================================
// GRAPH DATA & VISUALIZATION
// ============================================

async function loadGraphData() {
  try {
    const response = await fetch(`${API_BASE}/data`);
    graphData = await response.json();
    updateVisualization();
  } catch (error) {
    console.error("Error loading graph data:", error);
  }
}

function setupD3Visualization() {
  const container = document.getElementById("graph-container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Create SVG with arrow markers
  svg = d3
    .select("#graph-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Add arrow marker for links
  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("refX", 25)
    .attr("refY", 3)
    .attr("orient", "auto")
    .append("polygon")
    .attr("points", "0 0, 10 3, 0 6")
    .attr("fill", "#999");
}

function updateVisualization() {
  if (!graphData || graphData.nodes.length === 0) {
    return;
  }

  const container = document.getElementById("graph-container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Clear previous visualization
  d3.select("#graph-container").selectAll("*").remove();

  const svg = d3
    .select("#graph-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Add arrow marker
  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("refX", 25)
    .attr("refY", 3)
    .attr("orient", "auto")
    .append("polygon")
    .attr("points", "0 0, 10 3, 0 6")
    .attr("fill", "#999");

  // Create simulation
  const simulation = d3
    .forceSimulation(graphData.nodes)
    .force(
      "link",
      d3
        .forceLink(graphData.links)
        .id((d) => d.id)
        .distance(80)
    )
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "collision",
      d3.forceCollide().radius((d) => d.size)
    );

  // Create link elements
  const link = svg
    .selectAll(".link")
    .data(graphData.links)
    .join("line")
    .attr("class", "link")
    .attr("marker-end", "url(#arrowhead)");

  // Create link labels
  const linkLabel = svg
    .selectAll(".link-label")
    .data(graphData.links)
    .join("text")
    .attr("class", "link-label")
    .text((d) => d.relationship);

  // Create node elements
  const node = svg
    .selectAll(".node")
    .data(graphData.nodes)
    .join("g")
    .attr("class", "node")
    .call(drag(simulation));

  node.append("circle").attr("r", (d) => d.size);

  node
    .append("text")
    .text((d) => d.label)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle");

  // Update positions on simulation tick
  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    linkLabel
      .attr("x", (d) => (d.source.x + d.target.x) / 2)
      .attr("y", (d) => (d.source.y + d.target.y) / 2);

    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });
}

function drag(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

// ============================================
// EXPORT & CLEAR
// ============================================

async function exportGraph() {
  try {
    const response = await fetch(`${API_BASE}/export`);
    const text = await response.text();

    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knowledge_graph.json";
    a.click();
    URL.revokeObjectURL(url);

    showStatus(
      document.getElementById("addStatus"),
      "Graph exported successfully",
      "success"
    );
  } catch (error) {
    showStatus(
      document.getElementById("addStatus"),
      `Error: ${error.message}`,
      "error"
    );
  }
}

async function clearGraph() {
  if (
    !confirm(
      "Are you sure you want to clear the entire graph? This cannot be undone."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/clear`, { method: "POST" });
    const data = await response.json();

    if (data.status === "success") {
      showStatus(
        document.getElementById("addStatus"),
        "Graph cleared",
        "success"
      );
      loadGraphData();
      updateStats();
    }
  } catch (error) {
    showStatus(
      document.getElementById("addStatus"),
      `Error: ${error.message}`,
      "error"
    );
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status-message status-${type}`;

  if (type !== "info") {
    setTimeout(() => {
      element.textContent = "";
      element.className = "status-message";
    }, 3000);
  }
}

function switchTab(event, tabName) {
  // Handle both click events and programmatic calls
  if (event && event.target) {
    event.preventDefault();
    tabName = event.target.dataset.tab;
  }

  // Remove active class from all tabs and contents
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));

  // Add active class to clicked tab and corresponding content
  const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  const activeContent = document.getElementById(tabName);

  if (activeBtn) {
    activeBtn.classList.add("active");
  }
  if (activeContent) {
    activeContent.classList.add("active");
  }

  if (tabName === "visualization") {
    updateVisualization();
  }
}
