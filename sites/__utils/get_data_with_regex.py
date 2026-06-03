import re


def get_data_with_regex(pattern: str, text: str, group: int = 1) -> str:
    match = re.search(pattern, text)
    if match:
        return match.group(group)
    return ''
