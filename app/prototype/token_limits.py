"""GPT-OSS uses the o200k Harmony vocabulary. Keep framing headroom."""
from functools import lru_cache
from .providers import ProviderError

@lru_cache(maxsize=1)
def encoding():
    import tiktoken
    return tiktoken.get_encoding('o200k_harmony')

def bounded_output(messages, requested, rule):
    # Treat all text as literal input, including special-token-looking user data.
    count = sum(len(encoding().encode(m['content'],disallowed_special=())) for m in messages)+100
    if count > rule['max_input_tokens']:
        raise ProviderError('input_token_limit')
    return min(requested,rule['max_output_tokens'],3500-count)
