---
description: Read a Linear issue, diagnose the problem, gather needed context, and implement the fix
argument-hint: <issue-id>
---

You are going to help me resolve a Linear issue end-to-end. Follow these steps carefully:

## Step 1 — Fetch the issue

If `$ARGUMENTS` is a plain number (e.g. `447`), prepend `ZUU-` to form the full issue ID (e.g. `ZUU-447`). Use the Linear MCP to read that issue. Extract:
- Title and description
- Issue type (bug, feature, improvement)
- Any linked issues, comments, or attachments
- Labels, priority, and assignee

If no issue ID was provided, ask me for one before continuing.

## Step 2 — Explore the codebase

Based on the issue content, search the codebase for relevant files, components, functions, or areas that are likely involved. Use Glob and Grep to find them. Read any files that seem directly relevant.

Summarize what you found:
- Which files/components are involved
- What the current behavior appears to be
- What likely needs to change

## Step 3 — Diagnose and ask clarifying questions

Before writing any code, identify any gaps in your understanding. Ask me targeted questions if:
- The issue is ambiguous or underspecified
- There are multiple viable approaches and you need direction
- You need to know about related systems, APIs, or constraints not visible in the code
- You're unsure about expected behavior or edge cases

Be concise — don't ask things you can figure out from the code.

Wait for my answers before continuing.

## Step 4 — Implement the fix

Once you have enough context:
1. Make the necessary code changes
2. Keep changes focused and minimal — don't refactor unrelated code
3. If it's a bug, explain the root cause briefly before fixing
4. If it's a feature, confirm the approach matches the issue intent

After implementing, summarize what was changed and why.
