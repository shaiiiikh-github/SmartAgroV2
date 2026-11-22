"""
Smart-Agro Automated Granular Commit & Push Script
===================================================
This script stages and commits changes one by one with descriptive, professional
commit messages and pushes each commit individually to your remote repository.

Usage:
    python commit_and_push.py
    python commit_and_push.py --no-push   # Commits one by one without pushing
"""

import subprocess
import sys
import time

# List of granular commits: (list_of_files, commit_message)
COMMITS = [
    (
        [
            "Frontend/src/i18n/en.json",
            "Frontend/src/i18n/gu.json",
            "Frontend/src/i18n/hi.json",
        ],
        "i18n(dashboard): add camera capture and device upload translation keys for EN, HI, GU",
    ),
    (
        ["Frontend/src/pages/Dashboard.jsx"],
        "feat(dashboard): add dual upload and camera capture options for leaf diagnosis",
    ),
    (
        ["commit_and_push.py", "commit_and_push.ps1"],
        "chore(scripts): update automated granular commit and push scripts",
    ),
]


def run_command(cmd, check=True):
    print(f"  > {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0 and check:
        print(f"    [Error] {result.stderr.strip() or result.stdout.strip()}")
    return result


def get_current_branch():
    res = subprocess.run(
        ["git", "branch", "--show-current"], capture_output=True, text=True
    )
    branch = res.stdout.strip()
    return branch if branch else "main"


def main():
    push_each = "--no-push" not in sys.argv
    branch = get_current_branch()

    print("==================================================")
    print("🚀 Smart-Agro Granular Commit & Push Process")
    print(f"📌 Branch: {branch} | Push Each: {push_each}")
    print(f"📦 Total Planned Commits: {len(COMMITS)}")
    print("==================================================\n")

    successful_commits = 0

    for idx, (files, message) in enumerate(COMMITS, 1):
        print(f"[{idx}/{len(COMMITS)}] Committing: {message}")

        # Stage files
        for f in files:
            add_res = run_command(["git", "add", f])
            if add_res.returncode != 0:
                print(f"    ⚠️ Warning: could not add {f}")

        # Check if anything is staged
        diff_res = subprocess.run(["git", "diff", "--cached", "--quiet"])
        if diff_res.returncode == 0:
            print("  ℹ️ No changes staged for this commit, skipping...")
            continue

        # Commit
        commit_res = run_command(["git", "commit", "-m", message])
        if commit_res.returncode != 0:
            print(f"    ❌ Commit failed for: {message}")
            continue

        successful_commits += 1
        print("    ✅ Committed successfully.")

        # Push immediately if requested
        if push_each:
            print(f"    ⬆️ Pushing commit {idx} to origin/{branch}...")
            push_res = run_command(["git", "push", "origin", branch])
            if push_res.returncode == 0:
                print("    ✅ Pushed successfully.")
            else:
                print(f"    ❌ Push failed: {push_res.stderr.strip()}")
            time.sleep(1)

        print()

    print("==================================================")
    print(f"🎉 Process Complete: {successful_commits} commits processed.")
    print("==================================================")


if __name__ == "__main__":
    main()
