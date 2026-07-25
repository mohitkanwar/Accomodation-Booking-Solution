# Multi-agent workspace policy

These instructions apply to every automated agent and every task in this
repository.

## Repository structure

This is a Docusaurus 3 site. Everything under `docs/` is published; nothing
outside it is.

```text
.
├── docs/                     Published content (Docusaurus docs plugin root)
│   ├── index.md                Landing page ("introduction" doc, slug /)
│   └── presentation/           Discovery-workshop pages
│       └── diagrams/             Editable diagram sources, grouped by page/topic
├── archive/                  Unpublished docs, excluded from the site build
│   ├── README.md                Explains what's archived and why
│   └── docs/                    Full future-state doc set (00-executive-overview ... 99-appendices),
│                                 plus workshop/, mirroring docs/ structure for later reuse
├── config/
│   └── navigation.json       Navbar items, consumed by docusaurus.config.js
├── plantuml/                 Shared PlantUML theme + vendor C4-PlantUML include
├── plugins/                  Custom Docusaurus remark plugin (renders plantuml-image blocks)
├── scripts/                  Build-time Node scripts (version calc, PlantUML generation)
├── src/                      Docusaurus swizzled theme, React components, and CSS
├── static/                   Static assets copied verbatim to the build output
├── sidebars.js               Sidebar structure for docs/
├── docusaurus.config.js      Site config (reads config/navigation.json)
└── versioning.json           Base version anchor for scripts/calculate-version.mjs
```

Rules for keeping this structure intact:

- New active documentation pages go under `docs/presentation/` (or a new
  `docs/` subfolder if the content isn't presentation material); reference
  them in `sidebars.js`.
- Keep editable diagram sources under `docs/presentation/diagrams/`, grouped
  by the page or topic that uses them (see `README.md` for the
  `plantuml-image` embed syntax).
- Put user-journey diagrams under
  `docs/presentation/diagrams/users/<role>-journeys/`; do not place diagram
  sources directly in `docs/presentation/`.
- Content that is written but not yet part of the active workshop belongs
  under `archive/docs/`, preserving the same relative path it would have
  under `docs/` so it can be promoted later without renaming.
- Do not add build output, caches, or generated diagrams to the repo — they
  are git-ignored (`build/`, `.docusaurus/`, `.cache/`, `static/plantuml/`).
- Navbar links go in `config/navigation.json`, not directly in
  `docusaurus.config.js`.

## Isolate all task work

- Create a uniquely named branch and a separate Git worktree before editing
  repository files.
- Do not implement, format, generate assets, stage files, or create task
  commits in the primary `main` worktree.
- Use a branch name that identifies the agent and task, for example
  `codex/<task-name>` or `<agent>/<task-name>`.
- Use a task-specific worktree outside the primary checkout. Do not share a
  worktree with another agent.
- Inspect `git status`, the current commit, and `git worktree list` before
  creating the worktree.

## Handle existing and concurrent changes

- Treat every pre-existing modification and untracked file as work owned by
  the user or another agent.
- Never reset, restore, overwrite, delete, stage, or commit another agent's
  changes.
- If the task depends on uncommitted input from the primary worktree, copy only
  the required files into the task worktree. Keep that imported state separate
  from the task's integration commit so unrelated ownership is preserved.
- Recheck relevant files before editing and again before integration. Stop and
  report an overlap when safe reconciliation is uncertain.
- Never remove or bypass `.git` lock files while another agent may be active.
  Wait for the owner to finish or obtain explicit user confirmation that the
  operation has ended.

## Complete work before integration

- Perform implementation, formatting, asset generation, builds, tests, and
  visual validation inside the task worktree.
- Commit only the completed and validated task files on the task branch.
- Do not use `main` as a scratch area and do not integrate partial work.
- Keep commits narrowly scoped and use explicit file paths when staging.

## Integrate with a short main-worktree window

- Immediately before integration, verify that `main` has not moved and inspect
  the primary worktree for new or overlapping changes.
- If `main` moved, update or retest the task branch in its worktree before
  integration.
- Integrate the validated task commit using a conflict-free fast-forward,
  cherry-pick, or an equivalently scoped patch. Never absorb unrelated
  primary-worktree changes into the task commit.
- If integration encounters a conflict or active Git lock, leave the validated
  task commit on its branch and wait rather than forcing the operation.

## Push integrated changes and finish

- After successful integration, verify that `main` contains the intended task
  commit and that unrelated primary-worktree changes remain untouched.
- Push the integrated `main` branch to `origin/main`. Do not report the task as
  complete merely because the task commit exists locally or has been merged
  into the local `main` branch.
- Confirm that the push succeeded and that `origin/main` resolves to the
  integrated commit before declaring completion.
- Never force-push `main`. If the push is rejected because the remote branch
  moved, fetch the new state, reconcile and revalidate in the task worktree,
  then repeat the short integration window.
- If authentication, permissions, network access, or a protected-branch rule
  prevents the push, keep the validated commit and worktree intact and report
  the exact blocker.
- Only after the commit is integrated, verified, and successfully pushed may
  the agent remove its own temporary worktree. Do not remove another agent's
  worktree or branch.
