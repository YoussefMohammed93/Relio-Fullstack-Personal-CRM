---
description: Generate a detailed, phase-aware Git commit message based on the current repository changes.
---

# Generate Git Commit Message

Act as a senior software engineer responsible for writing clear, professional Git commit messages.

Your task is to analyze the current repository changes and generate a detailed Git commit message that accurately describes the work completed.

## 1. Understand the Current Project Stage

Before generating the message:

1. Read `docs/PRD.md` to understand the product requirements.
2. Read `docs/ROADMAP.md` to identify the current development phase.
3. Read `docs/PROGRESS.md` to identify the current milestone and completed tasks.
4. Inspect the current Git branch and recent commit history to understand the existing commit style.

If any documentation file does not exist, continue using the available project context without inventing missing information.

## 2. Analyze Current Changes

Inspect the actual Git changes using:

- `git status`
- `git diff`
- `git diff --staged`
- `git diff HEAD`

Analyze both staged and unstaged changes.

Identify:

- New files and deleted files.
- Modified functionality.
- New features and components.
- Architecture or configuration changes.
- Bug fixes and improvements.
- Documentation changes.
- Dependencies added or removed.

Do not rely only on filenames. Read the actual changes to understand what was implemented.

## 3. Generate the Commit Message

Follow the Conventional Commits specification.

Use this structure:

<type>(<scope>): <short descriptive summary>

- Detailed explanation of the first important change.
- Detailed explanation of the second important change.
- Detailed explanation of additional implementation details.
- Mention important architectural or technical decisions when relevant.

- Validation: list the checks that were actually performed, if known.

### Commit Types

Choose the most appropriate type:

- `feat`: New functionality.
- `fix`: Bug fixes.
- `refactor`: Code restructuring without changing behavior.
- `perf`: Performance improvements.
- `style`: Formatting or styling changes without functional changes.
- `docs`: Documentation changes.
- `test`: Adding or modifying tests.
- `build`: Build system or dependency changes.
- `ci`: CI/CD configuration changes.
- `chore`: Maintenance and miscellaneous changes.

### Scope

Use a meaningful scope when appropriate, such as:

- `frontend`
- `backend`
- `auth`
- `database`
- `ui`
- `contacts`
- `deals`
- `tasks`
- `dashboard`
- `config`
- `docs`

For changes spanning multiple areas, choose an appropriate broader scope or omit it.

## 4. Project-Specific Requirements

- Make the commit message reflect the actual Relio development phase and milestone whenever relevant.
- Mention meaningful technical implementation details, not generic statements.
- Prefer precise descriptions over vague phrases such as "updated files" or "improved code".
- Do not claim that features are complete if the changes only introduce their foundation.
- Do not include unrelated changes in the same description.
- Do not invent tests, validations, or implementation details.
- Keep the subject concise, ideally under 72 characters.
- Make the body detailed enough to explain what changed and why.

## 5. Output Format

Return the final commit message inside a single Markdown code block so it can be copied directly.

Do not include unnecessary introductions, explanations, or alternative commit messages.

If there are no meaningful changes, tell me that there is nothing to commit.

If the current changes contain unrelated work from multiple milestones, mention that before generating the message and organize the changes accurately.

## 6. Important Restrictions

- Do NOT execute `git commit`.
- Do NOT stage or unstage files.
- Do NOT modify any project files.
- Do NOT change the current Git branch.
- Do NOT push anything to GitHub.
- Your responsibility is ONLY to inspect changes and generate the commit message.
