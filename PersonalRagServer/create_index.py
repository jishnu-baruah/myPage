from pinecone import Pinecone, ServerlessSpec
import os

from dotenv import load_dotenv

load_dotenv()  
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
# Adjust dimension to match your embedding model (e.g., 768 for BGE-base, 384 for MiniLM)
pc.create_index(
    name="portfolio-snippets",
    dimension=768,  # or 384, depending on your model
    metric="cosine",
    spec=ServerlessSpec(
        cloud="aws",
        region="us-east-1"
    )
)
print("Index created!")