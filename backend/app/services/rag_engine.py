"""RAG Vector Search Engine for Spacecraft Operating Procedures (ECSS/ISRO)."""
import json
import math
import os
import re
from typing import List, Dict, Any, Optional
from collections import Counter

from app.logger import logger
from app.models.investigation import SOPReference


class RAGEngine:
    """Retrieval-Augmented Generation search engine for space operations runbooks."""

    def __init__(self, data_path: Optional[str] = None):
        if data_path is None:
            data_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), "data", "space_ops_runbooks.json"
            )
        self.data_path = data_path
        self.runbooks: List[Dict[str, Any]] = []
        self._corpus_tokens: List[List[str]] = []
        self._doc_frequencies: Counter = Counter()
        self._idf: Dict[str, float] = {}
        self.load_runbooks()

    def _tokenize(self, text: str) -> List[str]:
        """Simple alphanumeric tokenizer with lowercase normalization."""
        return re.findall(r"\b[a-zA-Z0-9_\-]{2,}\b", text.lower())

    def load_runbooks(self):
        """Load and index SOP runbooks from disk."""
        try:
            if not os.path.exists(self.data_path):
                logger.error(f"Runbooks file not found at {self.data_path}")
                return

            with open(self.data_path, "r", encoding="utf-8") as f:
                self.runbooks = json.load(f)

            # Build term frequencies & inverted document frequencies
            self._corpus_tokens = []
            self._doc_frequencies = Counter()

            for doc in self.runbooks:
                doc_text = (
                    f"{doc.get('sop_id', '')} {doc.get('title', '')} {doc.get('subsystem', '')} "
                    f"{doc.get('summary', '')} {' '.join(doc.get('keywords', []))} "
                    f"{' '.join(doc.get('triggers', []))} {' '.join(doc.get('telemetry_signatures', []))} "
                    f"{doc.get('content', '')}"
                )
                tokens = set(self._tokenize(doc_text))
                self._corpus_tokens.append(self._tokenize(doc_text))
                for token in tokens:
                    self._doc_frequencies[token] += 1

            total_docs = len(self.runbooks)
            self._idf = {}
            for token, freq in self._doc_frequencies.items():
                self._idf[token] = math.log((total_docs + 1) / (freq + 0.5)) + 1.0

            logger.info(f"RAG Engine indexed {len(self.runbooks)} space ops runbooks")
        except Exception as e:
            logger.error(f"Failed to load SOP runbooks: {e}")

    def _compute_vector(self, tokens: List[str]) -> Dict[str, float]:
        """Compute TF-IDF weight vector for token sequence."""
        counts = Counter(tokens)
        total = max(1, len(tokens))
        vec: Dict[str, float] = {}
        for term, count in counts.items():
            tf = count / total
            idf = self._idf.get(term, 1.0)
            vec[term] = tf * idf
        # Normalize
        norm = math.sqrt(sum(v ** 2 for v in vec.values()))
        if norm > 0:
            vec = {k: v / norm for k, v in vec.items()}
        return vec

    def _cosine_similarity(self, v1: Dict[str, float], v2: Dict[str, float]) -> float:
        """Calculate cosine similarity between two sparse vector dicts."""
        common_keys = set(v1.keys()) & set(v2.keys())
        return sum(v1[k] * v2[k] for k in common_keys)

    def search(self, query: str, top_k: int = 3, min_score: float = 0.1) -> List[SOPReference]:
        """Search runbooks for best matching SOPs based on query terms and telemetry indicators."""
        if not self.runbooks:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        query_vec = self._compute_vector(query_tokens)

        results = []
        for i, doc in enumerate(self.runbooks):
            doc_tokens = self._corpus_tokens[i]
            doc_vec = self._compute_vector(doc_tokens)
            sim = self._cosine_similarity(query_vec, doc_vec)

            # Bonus for exact keyword or ID match
            query_str = query.lower()
            if doc.get("sop_id", "").lower() in query_str:
                sim += 0.4
            for kw in doc.get("keywords", []):
                if kw.lower() in query_str:
                    sim += 0.15

            sim = min(1.0, round(sim, 3))
            if sim >= min_score:
                excerpt = doc.get("summary", "")[:180] + ("..." if len(doc.get("summary", "")) > 180 else "")
                results.append({
                    "doc": doc,
                    "score": sim,
                    "excerpt": excerpt,
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        top_results = results[:top_k]

        return [
            SOPReference(
                sop_id=item["doc"].get("sop_id", "UNKNOWN"),
                title=item["doc"].get("title", "Untitled SOP"),
                category=item["doc"].get("subsystem", "GENERAL"),
                relevance_score=item["score"],
                matching_excerpt=item["excerpt"],
            )
            for item in top_results
        ]

    def get_sop_by_id(self, sop_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full SOP document by identifier."""
        return next((d for d in self.runbooks if d.get("sop_id", "").upper() == sop_id.upper()), None)

    def get_all_sops(self) -> List[Dict[str, Any]]:
        """Retrieve all registered SOPs."""
        return self.runbooks


# Global RAG engine singleton
rag_engine = RAGEngine()
