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
        ["scripts/check_duplicates.py"],
        "feat(db): add read-only pre-flight duplicate and index checker script",
    ),
    (
        ["scripts/migrate_lowercase_emails.py"],
        "feat(db): add lowercase email normalization migration script",
    ),
    (
        ["Backend/requirements.txt"],
        "deps(backend): add cloudinary SDK for persistent cloud asset storage",
    ),
    (
        ["Backend/.env.example"],
        "docs(env): document Cloudinary configuration variables in .env.example",
    ),
    (
        ["Frontend/src/context/authContext.jsx"],
        "security(auth): remove plaintext user PII from localStorage and derive state in memory",
    ),
    (
        ["Frontend/src/pages/auth/Signup.jsx"],
        "security(signup): eliminate user profile storage in client localStorage",
    ),
    (
        ["Frontend/src/pages/Profile.jsx"],
        "fix(profile): safely render null and empty profile values without displaying literal null",
    ),
    (
        ["Frontend/src/pages/insights/CropInsights.jsx"],
        "feat(insights): connect foliage inspection records to live leaf scans API with fallback",
    ),
    (
        ["Backend/app1.py"],
        "feat(backend): implement unique indexes, hash reset tokens, and integrate Cloudinary storage",
    ),
    (
        [".gitignore"],
        "chore(git): ignore temporary test scratch directory",
    ),
    (
        ["DATA_AUDIT.md"],
        "docs(audit): add comprehensive storage audit report, schema recommendations, and fix log",
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
        stage_cmd = ["git", "add"] + files
        run_command(stage_cmd, check=False)

        # Check if there are staged changes
        diff_res = subprocess.run(
            ["git", "diff", "--cached", "--quiet"], capture_output=True
        )
        if diff_res.returncode == 0:
            print("  ℹ️ No changes to commit for this step, skipping...\n")
            continue

        # Commit
        commit_res = run_command(["git", "commit", "-m", message], check=True)
        if commit_res.returncode != 0:
            print("  ⚠️ Commit failed, continuing...\n")
            continue

        successful_commits += 1

        # Push immediately if requested
        if push_each:
            print(f"  ⬆️ Pushing commit to origin/{branch}...")
            push_res = run_command(["git", "push", "origin", branch], check=False)
            if push_res.returncode != 0:
                print(f"  ⚠️ Push notice: {push_res.stderr.strip() or push_res.stdout.strip()}")
                print("  (If offline or authentication is needed, commits are saved locally)")
            else:
                print("  ✅ Pushed successfully!")

            # Small 1-second pause for distinct timestamps on GitHub
            time.sleep(1)

        print()

    # Catch-all: check if any untracked or modified files remain
    status_res = subprocess.run(
        ["git", "status", "--porcelain"], capture_output=True, text=True
    )
    remaining = [
        line.strip()
        for line in status_res.stdout.splitlines()
        if not line.strip().endswith("commit_and_push.py")
        and not line.strip().endswith("commit_and_push.ps1")
    ]

    if remaining:
        print("🔍 Staging remaining files...")
        run_command(["git", "add", "."], check=False)
        diff_check = subprocess.run(
            ["git", "diff", "--cached", "--quiet"], capture_output=True
        )
        if diff_check.returncode != 0:
            run_command(
                [
                    "git",
                    "commit",
                    "-m",
                    "chore: wrap up remaining project updates and configuration",
                ],
                check=True,
            )
            successful_commits += 1
            if push_each:
                run_command(["git", "push", "origin", branch], check=False)

    print("==================================================")
    print(f"🎉 Done! Successfully created {successful_commits} commits.")
    print("==================================================")


if __name__ == "__main__":
    main()
