# Multi-agent workspace policy

These instructions apply to every automated agent and every task in this
repository.

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
- After successful integration and verification, remove only the agent's own
  temporary worktree. Do not remove another agent's worktree or branch.
