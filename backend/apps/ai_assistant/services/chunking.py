CHUNK_SIZE_WORDS = 400
CHUNK_OVERLAP_WORDS = 50


def split_into_chunks(text: str) -> list[str]:
    """
    Split text into words and create overlapping chunks of CHUNK_SIZE_WORDS
    with CHUNK_OVERLAP_WORDS overlap between consecutive chunks.
    Filters out empty/whitespace-only chunks.
    """
    if not text:
        return []

    words = text.split()
    if not words:
        return []

    chunks = []
    step = CHUNK_SIZE_WORDS - CHUNK_OVERLAP_WORDS
    if step <= 0:
        step = CHUNK_SIZE_WORDS

    start = 0
    while start < len(words):
        end = start + CHUNK_SIZE_WORDS
        chunk_words = words[start:end]
        chunk_str = " ".join(chunk_words).strip()
        if chunk_str:
            chunks.append(chunk_str)
        if end >= len(words):
            break
        start += step

    return chunks
