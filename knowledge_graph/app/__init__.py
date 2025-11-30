"""
Flask Backend for Knowledge Graph Application
Manages API endpoints and integration with frontend
"""

import os
import json
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
from io import StringIO
from werkzeug.utils import secure_filename
from .knowledge_graph import KnowledgeGraph

# Initialize Flask app
app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'data')
ALLOWED_EXTENSIONS = {'csv', 'txt'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize knowledge graph
kg = KnowledgeGraph()

# Populate with some sample data
sample_data = [
    ("Laptop", "belongs_to", "Electronics"),
    ("Electronics", "manages", "Amazon"),
    ("Amazon", "sells", "Books"),
    ("Books", "written_by", "Author1"),
    ("Laptop", "reviewed_by", "Customer1"),
    ("Customer1", "purchases_from", "Amazon"),
    ("Tablet", "belongs_to", "Electronics"),
    ("Smartphone", "belongs_to", "Electronics"),
    ("iPhone", "is_a", "Smartphone"),
    ("Product1", "has_seller", "Seller1"),
    ("Seller1", "sells_on", "Amazon"),
    ("Amazon", "has_category", "Electronics"),
]

for entity1, relationship, entity2 in sample_data:
    kg.add_relationship(entity1, relationship, entity2)


def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')


@app.route('/api/graph/add-relationship', methods=['POST'])
def add_relationship():
    """Add a single relationship to the graph"""
    try:
        data = request.json
        entity1 = data.get('entity1', '').strip()
        relationship = data.get('relationship', '').strip()
        entity2 = data.get('entity2', '').strip()

        result = kg.add_relationship(entity1, relationship, entity2)
        return jsonify(result), 200 if result['status'] == 'success' else 400
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500


@app.route('/api/graph/upload-csv', methods=['POST'])
def upload_csv():
    """Upload relationships from CSV file"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No file provided'
            }), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No file selected'
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                'status': 'error',
                'message': 'File must be CSV or TXT format'
            }), 400

        # Read CSV
        stream = StringIO(file.stream.read().decode("UTF8"), newline=None)
        df = pd.read_csv(stream)

        # Validate columns
        required_columns = ['entity1', 'relationship', 'entity2']
        if not all(col in df.columns for col in required_columns):
            return jsonify({
                'status': 'error',
                'message': f'CSV must contain columns: {", ".join(required_columns)}'
            }), 400

        # Extract relationships
        relationships = []
        for idx, row in df.iterrows():
            try:
                relationships.append((
                    str(row['entity1']).strip(),
                    str(row['relationship']).strip(),
                    str(row['entity2']).strip()
                ))
            except Exception as e:
                continue

        # Add batch relationships
        result = kg.add_relationships_batch(relationships)
        return jsonify(result), 200
    except pd.errors.ParserError:
        return jsonify({
            'status': 'error',
            'message': 'Invalid CSV format'
        }), 400
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error processing file: {str(e)}'
        }), 500


@app.route('/api/graph/query-neighbors', methods=['POST'])
def query_neighbors():
    """Query neighbors of an entity"""
    try:
        data = request.json
        entity = data.get('entity', '').strip()
        direction = data.get('direction', 'both')

        if direction not in ['in', 'out', 'both']:
            direction = 'both'

        result = kg.query_neighbors(entity, direction)
        return jsonify(result), 200 if result['status'] == 'success' else 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500


@app.route('/api/graph/find-path', methods=['POST'])
def find_path():
    """Find paths between two entities"""
    try:
        data = request.json
        source = data.get('source', '').strip()
        target = data.get('target', '').strip()

        result = kg.find_paths(source, target)
        return jsonify(result), 200 if result['status'] == 'success' else 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500


@app.route('/api/graph/search-relationship', methods=['POST'])
def search_relationship():
    """Search for relationships of a specific type"""
    try:
        data = request.json
        relationship = data.get('relationship', '').strip()

        result = kg.search_by_relationship(relationship)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500


@app.route('/api/graph/data', methods=['GET'])
def get_graph_data():
    """Get graph data for visualization"""
    try:
        data = kg.get_graph_data()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500


@app.route('/api/graph/stats', methods=['GET'])
def get_stats():
    """Get graph statistics"""
    try:
        stats = kg.get_graph_stats()
        return jsonify({
            'status': 'success',
            'stats': stats
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500


@app.route('/api/graph/export', methods=['GET'])
def export_graph():
    """Export graph as JSON"""
    try:
        data = kg.export_json()
        return data, 200, {'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename=graph.json'}
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500


@app.route('/api/graph/clear', methods=['POST'])
def clear_graph():
    """Clear the graph"""
    try:
        kg.clear()
        return jsonify({
            'status': 'success',
            'message': 'Graph cleared',
            'graph_stats': kg.get_graph_stats()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500


@app.route('/api/graph/remove-relationship', methods=['POST'])
def remove_relationship():
    """Remove a relationship from the graph"""
    try:
        data = request.json
        entity1 = data.get('entity1', '').strip()
        entity2 = data.get('entity2', '').strip()

        result = kg.remove_relationship(entity1, entity2)
        return jsonify(result), 200 if result['status'] == 'success' else 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
