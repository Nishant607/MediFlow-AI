import math
import re
from collections import Counter
from apps.ai_assistant.models import DocumentChunk

SIMILARITY_THRESHOLD = 0.05

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except Exception:
    HAS_SKLEARN = False

# Common English stopwords fallback
STOP_WORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as',
    'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
    'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
    'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
    'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
    'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves',
    'out', 'over', 'own', 's', 'same', 'she', 'should', 'so', 'some', 'such', 't', 'than', 'that', 'the',
    'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
    'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
    'while', 'who', 'whom', 'why', 'will', 'with', 'you', 'your', 'yours', 'yourself', 'yourselves'
}


def _pure_python_retrieval(query: str, chunk_texts: list[str], top_k: int = 3) -> list[str]:
    """Pure-Python TF-IDF cosine similarity fallback when sklearn DLLs are blocked."""
    def extract_ngrams(text):
        tokens = [w for w in re.findall(r'\b[a-zA-Z0-9_]+\b', text.lower()) if w not in STOP_WORDS]
        ngrams = list(tokens)
        for i in range(len(tokens) - 1):
            ngrams.append(f"{tokens[i]} {tokens[i+1]}")
        return ngrams

    query_tokens = extract_ngrams(query)
    if not query_tokens:
        return []

    docs_tokens = [extract_ngrams(t) for t in chunk_texts]
    all_docs = docs_tokens + [query_tokens]
    n_docs = len(all_docs)

    # Document frequency
    df = Counter()
    for doc in all_docs:
        for term in set(doc):
            df[term] += 1

    def idf(term):
        return math.log((1 + n_docs) / (1 + df[term])) + 1.0

    query_tf = Counter(query_tokens)
    query_vec = {t: query_tf[t] * idf(t) for t in query_tf}
    query_norm = math.sqrt(sum(w * w for w in query_vec.values()))
    if query_norm == 0:
        return []

    scored_chunks = []
    for idx, doc_tokens in enumerate(docs_tokens):
        if not doc_tokens:
            continue
        doc_tf = Counter(doc_tokens)
        doc_vec = {t: doc_tf[t] * idf(t) for t in doc_tf}
        doc_norm = math.sqrt(sum(w * w for w in doc_vec.values()))
        if doc_norm == 0:
            continue

        dot = sum(query_vec.get(t, 0) * doc_vec.get(t, 0) for t in query_vec)
        sim = dot / (query_norm * doc_norm)
        if sim >= SIMILARITY_THRESHOLD:
            scored_chunks.append((sim, chunk_texts[idx]))

    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    return [text for _, text in scored_chunks[:top_k]]


def get_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
    """
    Fetch all active DocumentChunk objects, compute TF-IDF cosine similarity
    against the query vector, filter by SIMILARITY_THRESHOLD, and return top_k chunk texts.
    """
    if not query or not query.strip():
        return []

    active_chunks = list(
        DocumentChunk.objects.filter(document__is_active=True).select_related('document')
    )
    if not active_chunks:
        return []

    chunk_texts = [chunk.chunk_text for chunk in active_chunks]

    if HAS_SKLEARN:
        corpus = chunk_texts + [query]
        try:
            vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
            tfidf_matrix = vectorizer.fit_transform(corpus)
            chunk_vectors = tfidf_matrix[:-1]
            query_vector = tfidf_matrix[-1:]
            similarities = cosine_similarity(query_vector, chunk_vectors)[0]

            scored_chunks = []
            for idx, score in enumerate(similarities):
                if score >= SIMILARITY_THRESHOLD:
                    scored_chunks.append((score, chunk_texts[idx]))

            scored_chunks.sort(key=lambda x: x[0], reverse=True)
            return [text for _, text in scored_chunks[:top_k]]
        except Exception:
            return _pure_python_retrieval(query, chunk_texts, top_k=top_k)

    return _pure_python_retrieval(query, chunk_texts, top_k=top_k)
