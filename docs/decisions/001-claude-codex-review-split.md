# Decision 001: Claude = orchestration, Codex = implementation + first-pass code review

Date: 2026-06-12
Status: Accepted

## Decision

Code review moves from Claude to Codex. Claude no longer reviews code details; it checks spec/product alignment only.

```text
Claude: orchestration, spec consistency, task slicing, final product judgment
Codex:  implementation, lint/typecheck/build, code review, minimal-diff fixes
Human:  policy approval, gut-check, final OK
```

## Why

- Codex runs in the local working tree and can check `git diff`, lint, and build directly; Claude reviews from reports and spawned agents, which is indirect and costs more.
- Claude's value is upstream: spec consistency, MVP scope discipline, UX direction, detecting unrequested features.
- Claude-side reviews produce long reports the human has to read, which defeats the cost goal.

## Per-task flow

1. Claude slices one task (goal file).
2. Human passes the goal to Codex.
3. Codex implements, runs lint/typecheck/build.
4. Human passes Codex the review prompt below (same session is acceptable; explicitly switch roles).
5. Codex reviews `git diff`, fixes critical/should-fix issues in minimal diffs, re-verifies.
6. Human passes both reports to Claude.
7. Claude checks spec/product alignment only, then commits and hands out the next goal.

## Codex review prompt

```text
あなたはこのプロジェクトのコードレビュアーです。
実装者ではなく、レビュー専任として振る舞ってください。

まず以下を確認してください。

1. git status
2. git diff
3. 変更されたファイル
4. npm run lint
5. npm run typecheck
6. npm run build

レビュー観点:
- 仕様にない機能を追加していないか
- 既存UIを壊していないか
- 型エラーや未使用変数がないか
- 状態管理が過剰に複雑化していないか
- コンポーネント分割が雑でないか
- テストまたは手動確認が不足していないか
- 将来の実装を邪魔する変更がないか

出力形式:
1. 致命的な問題
2. 修正すべき問題
3. 任意の改善
4. 問題ない点
5. 修正指示案

勝手に修正せず、まずレビュー結果だけ出してください。
```

Follow-up when fixes are needed:

```text
上のレビュー結果のうち、致命的な問題と修正すべき問題だけを最小差分で直してください。
任意改善は今はやらないでください。
修正後に git diff と npm run lint / typecheck / build の結果を報告してください。
```

## Claude final-check scope

Claude checks only:

- Does the implementation follow the goal/spec?
- Any features not in the spec?
- Any drift from the Tonari Gohan MVP policy?
- Is the UI/UX direction degraded?
- OK to proceed to the next task?

Output: 総合判断 (OK / 要修正 / 保留), concerns, extra fix instructions for Codex, next task.

## Notes

- Self-review by the implementing Codex session is a known weakness. Prefer a separate review session (Codex A implements, Codex B reviews) when practical; otherwise switch roles explicitly in the same session.
- Claude may still run spot checks (e.g. verbatim spec copy, data integrity) when the spec demands exact wording, since those are spec-alignment checks, not code review.
