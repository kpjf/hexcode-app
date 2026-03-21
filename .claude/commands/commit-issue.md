---
description: Commit and push changes for a Linear issue using the issue ID as the commit prefix
argument-hint: <issue-id>
---

If `$ARGUMENTS` is a plain number (e.g. `447`), prepend `ZUU-` to form the full issue ID (e.g. `ZUU-447`). Use that as the issue ID throughout.

Commit and push the current changes for Linear issue `$ARGUMENTS`.

## Steps

1. **Gather context**
    - Run `git diff --staged` and `git diff` to see all current changes (staged and unstaged)
    - If no issue ID was provided in `$ARGUMENTS`, ask me for one before continuing

2. **Stage changes**
    - Run `git status` to see what's modified
    - Stage all relevant changed files with `git add` (be specific — avoid `git add .` if there are unrelated files)

3. **Write the commit message**
    - Format: `$ARGUMENTS: <concise description of what changed and why>`
    - Example: `HEX-42: fix color parser ignoring alpha channel in hex8 format`
    - Keep the description short (under 72 chars total), present tense, lowercase
    - Focus on _what_ changed and _why_, not _how_

4. **Commit**
    - Run the commit using a HEREDOC to preserve formatting
    - If a pre-commit hook fails, fix the issue and retry — do NOT use `--no-verify`

5. **Push**
    - Push to the current branch with `git push`
    - If the branch has no upstream yet, use `git push -u origin <branch>`

6. **update lienar**
    - comment in ticket the changes,
    - mark ticket as "done"
