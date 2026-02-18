"""
CLAWDBOT — GitHub Integration for ThingMark.dk
================================================

Give this file to whoever is building your Telegram bot.
The bot uses the GitHub API to update your website.
Every change is a git commit — fully tracked and reversible.

Requirements: pip install requests

Setup:
1. Create a fine-grained GitHub token (see SETUP-GUIDE.md)
2. Set the token and repo details below
"""

import requests
import base64
import json
import re
import html
from datetime import datetime


# ============================================================
# CONFIGURATION
# ============================================================

GITHUB_TOKEN = "github_pat_XXXX"  # Fine-grained token (repo write only)
REPO_OWNER = "YOUR_GITHUB_USERNAME"  # e.g. "teis"
REPO_NAME = "thingmark.dk"  # Your repo name
BRANCH = "main"

# Pages the bot is allowed to update
ALLOWED_PAGES = ["executive-edge", "90-day", "master-t", "reboot"]

# Elements the bot is allowed to update
ALLOWED_ELEMENTS = ["headline", "cta", "price", "testimonial"]


# ============================================================
# SECURITY: INPUT SANITIZATION
# ============================================================

def sanitize_content(content: str, element: str) -> str:
    """Strip anything dangerous from content before it goes into HTML."""

    # Remove all HTML tags
    clean = re.sub(r'<[^>]+>', '', content)

    # Remove event handler patterns
    clean = re.sub(r'on\w+\s*=', '', clean, flags=re.IGNORECASE)

    # Remove javascript: protocol
    clean = re.sub(r'javascript:', '', clean, flags=re.IGNORECASE)

    # For prices, enforce strict format
    if element == "price":
        if not re.match(r'^[\$€£kr\s]*\d+([.,]\d{1,2})?[\$€£kr\s]*$', clean):
            raise ValueError(f"Invalid price format: {clean}")
        return clean

    # Escape HTML entities for everything else
    clean = html.escape(clean)

    # Max length
    if len(clean) > 500:
        raise ValueError("Content too long (max 500 chars)")

    return clean


# ============================================================
# GITHUB API HELPERS
# ============================================================

HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}
API_BASE = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}"


def get_file(path: str) -> tuple[str, str]:
    """Fetch a file from the repo. Returns (content, sha)."""
    r = requests.get(f"{API_BASE}/contents/{path}", headers=HEADERS)
    r.raise_for_status()
    data = r.json()
    content = base64.b64decode(data["content"]).decode("utf-8")
    return content, data["sha"]


def update_file(path: str, new_content: str, sha: str, message: str) -> dict:
    """Commit an updated file to the repo."""
    r = requests.put(
        f"{API_BASE}/contents/{path}",
        headers=HEADERS,
        json={
            "message": message,
            "content": base64.b64encode(new_content.encode("utf-8")).decode("ascii"),
            "sha": sha,
            "branch": BRANCH,
        },
    )
    r.raise_for_status()
    return r.json()


# ============================================================
# MAIN UPDATE FUNCTION
# ============================================================

def update_page_element(page: str, element: str, new_content: str) -> dict:
    """
    Update a single element on a page.

    Args:
        page: One of "executive-edge", "90-day", "master-t", "reboot"
        element: One of "headline", "cta", "price", "testimonial"
        new_content: The new text content (plain text only, no HTML)

    Returns:
        dict with status info

    Example:
        update_page_element("executive-edge", "headline", "Unlock Peak Performance")
    """

    # Validate inputs
    if page not in ALLOWED_PAGES:
        return {"error": f"Invalid page: {page}. Allowed: {ALLOWED_PAGES}"}
    if element not in ALLOWED_ELEMENTS:
        return {"error": f"Invalid element: {element}. Allowed: {ALLOWED_ELEMENTS}"}

    # Sanitize content
    try:
        safe_content = sanitize_content(new_content, element)
    except ValueError as e:
        return {"error": str(e)}

    # Get current file from GitHub
    file_path = f"{page}/index.html"
    try:
        html_content, sha = get_file(file_path)
    except requests.HTTPError as e:
        return {"error": f"Could not fetch {file_path}: {e}"}

    # Find and replace the element using data-optimize attribute
    pattern = rf'(<[^>]*data-optimize="{element}"[^>]*>)(.*?)(</)'
    match = re.search(pattern, html_content, re.DOTALL)

    if not match:
        return {"error": f'No data-optimize="{element}" found in {page}/index.html'}

    old_content = match.group(2).strip()
    updated_html = re.sub(pattern, rf'\g<1>{safe_content}\g<3>', html_content, count=1, flags=re.DOTALL)

    # Commit the change
    commit_msg = f"optimize({page}): update {element}\n\nFrom: {old_content}\nTo: {safe_content}\n\nAutomated by CLAWDBOT"

    try:
        result = update_file(file_path, updated_html, sha, commit_msg)
    except requests.HTTPError as e:
        return {"error": f"Could not commit: {e}"}

    return {
        "success": True,
        "page": page,
        "element": element,
        "old": old_content,
        "new": safe_content,
        "commit": result.get("commit", {}).get("html_url", ""),
    }


def rollback_page(page: str, commit_sha: str) -> dict:
    """
    Roll back a page to a previous version.

    Args:
        page: The page to roll back
        commit_sha: The commit SHA to roll back to

    Returns:
        dict with status info
    """
    if page not in ALLOWED_PAGES:
        return {"error": f"Invalid page: {page}"}

    file_path = f"{page}/index.html"

    # Get the file at the old commit
    try:
        r = requests.get(
            f"{API_BASE}/contents/{file_path}?ref={commit_sha}",
            headers=HEADERS,
        )
        r.raise_for_status()
        old_content = base64.b64decode(r.json()["content"]).decode("utf-8")
    except requests.HTTPError as e:
        return {"error": f"Could not fetch old version: {e}"}

    # Get current SHA
    try:
        _, current_sha = get_file(file_path)
    except requests.HTTPError as e:
        return {"error": f"Could not get current file: {e}"}

    # Commit the rollback
    try:
        result = update_file(
            file_path,
            old_content,
            current_sha,
            f"rollback({page}): revert to {commit_sha[:8]}\n\nAutomated by CLAWDBOT",
        )
    except requests.HTTPError as e:
        return {"error": f"Could not commit rollback: {e}"}

    return {
        "success": True,
        "page": page,
        "rolled_back_to": commit_sha,
        "commit": result.get("commit", {}).get("html_url", ""),
    }


def get_change_history(page: str, limit: int = 10) -> list:
    """Get recent changes for a page (useful for reporting)."""
    file_path = f"{page}/index.html"
    r = requests.get(
        f"{API_BASE}/commits",
        headers=HEADERS,
        params={"path": file_path, "per_page": limit},
    )
    r.raise_for_status()
    return [
        {
            "sha": c["sha"][:8],
            "message": c["commit"]["message"].split("\n")[0],
            "date": c["commit"]["author"]["date"],
            "url": c["html_url"],
        }
        for c in r.json()
    ]


# ============================================================
# USAGE EXAMPLES
# ============================================================

if __name__ == "__main__":
    # Example: Update a headline
    result = update_page_element(
        page="executive-edge",
        element="headline",
        new_content="Unlock Peak Performance in 90 Days",
    )
    print(json.dumps(result, indent=2))

    # Example: Update a CTA
    result = update_page_element(
        page="executive-edge",
        element="cta",
        new_content="Claim Your Free Strategy Call",
    )
    print(json.dumps(result, indent=2))

    # Example: Get change history
    history = get_change_history("executive-edge")
    for entry in history:
        print(f"  {entry['date']} — {entry['message']}")
