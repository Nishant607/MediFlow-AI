from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from apps.ai_assistant.models import DocumentChunk

SIMILARITY_THRESHOLD = 0.05


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
    corpus = chunk_texts + [query]

    try:
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform(corpus)
    except ValueError:
        # e.g., if corpus contains only stop words or un-vectorizable content
        return []

    chunk_vectors = tfidf_matrix[:-1]
    query_vector = tfidf_matrix[-1:]

    similarities = cosine_similarity(query_vector, chunk_vectors)[0]

    # Pair indices with similarity score
    scored_chunks = []
    for idx, score in enumerate(similarities):
        if score >= SIMILARITY_THRESHOLD:
            scored_chunks.append((score, chunk_texts[idx]))

    # Sort descending by score
    scored_chunks.sort(key=lambda x: x[0], reverse=True)

    return [text for _, text in scored_chunks[:top_k]]
