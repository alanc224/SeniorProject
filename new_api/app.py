"""
Created on Feb 25, 2025

@author: FemiA
"""

from flask import Flask, jsonify, request, render_template
import requests
import logging
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from flask_cors import CORS
import random
import subprocess  # to run both app.py and app.js
from flask_pymongo import PyMongo
import random
from flask_cors import CORS
# Load environment variables
load_dotenv()
from pymongo import MongoClient

app = Flask(__name__)
load_dotenv()
app.logger.setLevel(logging.DEBUG)

# Enable CORS
CORS(app)


# MongoDB connection
client = MongoClient(
    os.getenv("MONGO_URI"),
    maxPoolSize=100,  # Maximum number of connections in the pool
    minPoolSize=10,  # Minimum number of connections to keep in the pool
)
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)


# MongoDB connection
# Hugging Face API Configuration
HUGGINGFACE_API_KEY = os.getenv("HF_API_KEY")  # Store securely in environment variables
INFERENCE_URL = "https://lo3orafqdtw46prr.us-east-1.aws.endpoints.huggingface.cloud"  # Replace with your endpoint


db = client["food_50k"]
collection = db["food_50k_collections"]

# Function to get embedding from Hugging Face


def get_embedding_from_huggingface(query):
    """
    Fetch embedding for a query from Hugging Face Inference API.
    """
    try:
        headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
        data = {"inputs": query}

        # Make the API call
        response = requests.post(INFERENCE_URL, headers=headers, json=data, timeout=10)

        if response.status_code == 200:
            response_data = response.json()

            # Check if the response data is a list of embeddings
            if isinstance(response_data, list):
                return response_data[0]  # Returning the first embedding

            # Handle case: embedding is in a dictionary under "embedding" key
            elif isinstance(response_data, dict) and "embedding" in response_data:
                print(f"Received dictionary with embedding: {response_data}")
                return response_data["embedding"]

            else:
                logging.error(f"Unexpected API response format: {response_data}")
                return None
        else:
            logging.error(
                f"Hugging Face API error ({response.status_code}): {response.text}"
            )
            return None
    except Exception as e:
        logging.error(f"Error contacting Hugging Face API: {str(e)}")
        return None


from bson import ObjectId  # Import this to convert ObjectId


# route to make recipie predictions
@app.route("/predict", methods=["POST"])
def predict():
    try:
        user_query = request.json.get("query", "")
        if not user_query:
            return jsonify({"error": "No query provided!"}), 400

        # Convert query to lowercase for better search matching
        query_lower = user_query.lower()

        # Generate embedding for the updated query
        query_embedding = get_embedding_from_huggingface(query_lower)

        # Adjust vector search parameters based on detected filters
        num_candidates = 500
        limit = 80

        # Define the `$vectorSearch` stage
        vector_search_stage = {
            "$vectorSearch": {
                "index": "vector_index",
                "queryVector": query_embedding,
                "path": "embedding",
                "numCandidates": num_candidates,
                "limit": limit,
                "similarity": "cosine",
            }
        }

        # Build pipeline
        pipeline = [vector_search_stage]

        pipeline.extend(
            [
                {"$unset": "embedding"},
                {
                    "$project": {
                        "_id": 1,  # Keep _id to convert it later
                        "Food Name": 1,
                        "ingredients": 1,
                        "directions": 1,
                        "link": 1,
                        "source": 1,
                        "score": {"$meta": "vectorSearchScore"},
                    }
                },
            ]
        )

        # Execute pipeline
        results = list(collection.aggregate(pipeline))

        # Convert ObjectId to string
        for item in results:
            item["_id"] = str(item["_id"])  # Convert MongoDB ObjectId to string

        # Randomly sample from the sanitized results
        k = random.randint(10, 25)
        random_results = random.sample(results, min(k, len(results)))

        # Sort the random sample by relevance score in descending order
        random_results.sort(key=lambda x: x.get("score", 0), reverse=True)

        # Return the results as JSON
        return jsonify(random_results)

    except Exception as e:
        logging.error(f"Error occurred: {str(e)}")
        return jsonify({"error": "Error!"}), 500


# Run Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', threaded=True)
