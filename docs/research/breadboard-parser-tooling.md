# Breadboard parser tooling

Date: 2026-08-01

## Decision

Use **Chevrotain 13.2.0** for the executable lexer and grammar, fault-tolerant parser, source positions, and grammar introspection. Generate the railroad-diagram artifact from Chevrotain's serialized grammar. Generate a small CodeMirror lexical-highlighting adapter from the same token vocabulary; keep CodeMirror in the site, not the compiler package.

This is the only evaluated option with first-party recovery and railroad generation while remaining browser-native TypeScript/JavaScript. Highlighting needs an adapter, but not a second maintained grammar.

Pin the exact version. Recovery and generated artifacts are conformance-sensitive and must only change through an explicit dependency update with the full fixture suite.

## Required shape

`packages/breadboard` should own:

- `syntax/tokens.ts`: the authoritative token vocabulary, categories, and highlight class metadata
- `syntax/parser.ts`: a singleton `CstParser` with `recoveryEnabled: true`
- `syntax/grammar.ts`: access to serialized GAST for generated documentation
- a CST-to-Surface-AST visitor; parser recovery must not leak Chevrotain objects into the public AST
- a build script that emits railroad documentation and a generated editor token matcher

The site should own CodeMirror and only map generated token classes to theme tags. React, CodeMirror, browser APIs, and decoration state remain outside `packages/breadboard`.

The executable grammar is the token vocabulary plus parser rules. Generated railroad and highlighting artifacts are never edited by hand. CI should regenerate them and fail on a diff.

## Recovery and diagnostics

Chevrotain supports insertion, deletion, repetition resynchronization, and between-rule resynchronization. Recovered CST nodes are explicitly marked and may be incomplete, which fits the agreed recoverable Surface AST contract, provided the visitor is defensive ([fault-tolerance guide](https://chevrotain.io/docs/tutorial/step4_fault_tolerance.html)).

Implementation constraints:

- Tokenize newline as a real token. Do not hide it with other whitespace. This permits the specified next-newline recovery boundary.
- Keep `}` as an explicit synchronization token for chip bodies.
- Override recovery hooks where required so behavior matches the language contract instead of accepting library defaults as normative.
- Translate lexer/parser failures immediately into the project's stable dotted diagnostic codes and half-open source ranges. Do not expose library messages as conformance data.
- Apply the project's cascade suppression and deterministic ordering after all phases.
- Use full token position tracking. Chevrotain provides start/end offsets, lines, and columns by default ([position tracking](https://chevrotain.io/docs/features/position_tracking.html)). Convert its inclusive token ends to the specified half-open ranges in one tested adapter.

Chevrotain records the grammar during parser initialization and exposes that GAST through `getGastProductions`/serialized productions ([grammar recording](https://chevrotain.io/docs/guide/internals.html)). Its `createSyntaxDiagramsCode` consumes serialized GAST and produces self-contained railroad HTML ([diagram guide](https://chevrotain.io/docs/guide/generating_syntax_diagrams.html), [API](https://chevrotain.io/documentation/10_4_2/functions/createSyntaxDiagramsCode.html)). If the specification needs the existing JSON.org visual skin, customize the renderer/template around serialized GAST; do not introduce another grammar.

For highlighting, Chevrotain's lexer produces a token vector from ordered token definitions ([lexer guide](https://chevrotain.io/docs/tutorial/step1_lexing.html)). A build-time script can turn the same token definitions and their project-owned highlight metadata into a small CodeMirror matcher. The generated matcher handles comments and incomplete input independently of successful parsing. CodeMirror decorations are presentation only; compiler diagnostics still come from `compile(source)`.

## Options compared

Package sizes below are npm registry `dist.unpackedSize` values observed on 2026-08-01. They describe install footprint, not the final minified browser bundle. Final bundle budgets should be measured from the production Vite build.

| Option | Strengths | Gaps and cost | Result |
| --- | --- | --- | --- |
| **Chevrotain 13.2.0** | Browser/Node ESM; TypeScript declarations; explicit lexer; CST; customizable recovery; full positions; serialized grammar; first-party railroad output | Highlighting adapter required. Runtime package is 1,244,104 unpacked bytes and has five Chevrotain-internal runtime dependencies. Requires Node 22 for tooling. | **Choose.** Best match for deterministic diagnostics + generated diagrams; adapter generation avoids grammar duplication. [npm metadata](https://registry.npmjs.org/chevrotain/latest), [official docs](https://chevrotain.io/docs/) |
| **Lezer (`@lezer/generator` 1.8.0, `@lezer/lr` 1.4.10)** | Small generated LR parser; excellent incremental, error-tolerant CodeMirror integration; grammar drives parse tree and editor highlighting | No first-party railroad generator. Recovery primarily yields error nodes, so the project's exact diagnostic codes and newline/brace recovery need an additional diagnostic parser or substantial interpretation. Reading the grammar with custom tooling would rely on non-public generator structure. Generator is 372,940 unpacked bytes (dev); LR runtime is 166,968 plus `@lezer/common`. | Reject for compiler core. Strongest editor option, but it moves duplication/risk into diagnostics and diagrams. [grammar/highlighting guide](https://lezer.codemirror.net/docs/guide/), [CodeMirror language-package guide](https://codemirror.net/examples/lang-package/), [generator metadata](https://registry.npmjs.org/%40lezer%2Fgenerator/latest) |
| **Peggy 5.1.0** | Concise declarative PEG; pre-generated browser parser can have no Peggy runtime; location-aware errors; generated TypeScript declarations | Normal parse API throws on invalid input rather than producing a recovered document. No first-party railroad or editor-highlighting pipeline. Recovery would be hand-authored in grammar actions and hard to keep deterministic. Generator is 592,273 unpacked bytes and can remain dev-only. | Reject. Attractive output size, wrong recovery model. [official documentation](https://peggyjs.org/documentation.html), [npm metadata](https://registry.npmjs.org/peggy/latest) |
| **Langium 4.3.1** | Declarative grammar, generated AST types, validation, browser support, LSP/editor ecosystem; uses Chevrotain internally | Far beyond the required compiler: 3,897,986 unpacked bytes with Chevrotain, `chevrotain-allstar`, and multiple VS Code/LSP runtime dependencies. No first-party railroad pipeline. Browser editor setup uses worker/LSP infrastructure; the official Monaco tutorial warns it is outdated, and generated static highlighting is intentionally simple. | Reject. Useful if autocomplete/navigation/LSP enters scope later; currently those are explicitly out of scope. [grammar reference](https://langium.org/docs/reference/grammar-language/), [browser editor guide](https://langium.org/docs/learn/minilogo/langium_and_monaco/), [npm metadata](https://registry.npmjs.org/langium/latest) |
| **ANTLR 4.13.2 JavaScript target** | Mature grammar files, generated browser-capable JavaScript/TypeScript declarations, standard recovery | Requires the ANTLR generator toolchain, produces substantial generated code, and has no direct CodeMirror or project railroad artifact path. Runtime is 3,086,422 unpacked bytes. Adds Java-oriented workflow for a small line language. | Reject. Capable but higher tooling and runtime cost without closing the editor/diagram gaps. [official JavaScript target](https://github.com/antlr/antlr4/blob/master/doc/javascript-target.md), [npm metadata](https://registry.npmjs.org/antlr4/latest) |

## Dependency boundaries

Runtime in `packages/breadboard`:

```text
chevrotain = 13.2.0
```

Site-only editor dependencies:

```text
@codemirror/state
@codemirror/view
@codemirror/language
```

Add only the CodeMirror packages actually used by the editor. Do not add Langium, Monaco, an LSP client/server, Peggy, Lezer, or ANTLR.

Build-time generation may call the same parser module under Node 22. The repository's Pages workflow already uses Node 22, and the site is ESM/Vite, matching Chevrotain 13.2.0's ESM and Node requirements ([npm metadata](https://registry.npmjs.org/chevrotain/13.2.0)).

## Risks and controls

1. **Newest major/version risk.** Chevrotain 13.2.0 is current and requires Node 22. Pin exactly, commit generated artifacts, and upgrade only with byte-level conformance.
2. **Recovery drift.** Library heuristics are not the language contract. Conformance fixtures must cover every malformed-line and malformed-chip recovery boundary; use explicit hooks/resync rules where defaults differ.
3. **CST/AST coupling.** Recovered CST nodes can be sparse. Keep the defensive visitor internal and snapshot only the public Surface AST.
4. **Highlight drift.** Generate the lexical matcher from token definitions in CI. The only handwritten editor data is token-class-to-theme styling, which is presentation rather than grammar.
5. **Bundle size.** Measure `site/dist` after integration. Lazy-load the breadboard editor route and AST dialog if the shared course entry chunk grows materially.
6. **Diagram appearance.** Chevrotain guarantees grammar-derived railroad structure, not the exact JSON.org styling. Treat skinning as a renderer/template concern over serialized GAST.

## Handoff

- The schema ticket should ensure Surface AST construction tolerates absent recovered children and preserves source spans without exposing Chevrotain types.
- The grammar/parser ticket should implement tokens, newline/brace recovery, stable diagnostic translation, CST visitor, and generated railroad/highlight artifacts test-first.
- The editor ticket should consume the generated lexical matcher and `compile(source)`; it should not instantiate a second parser.
- The conformance harness should pin Chevrotain and verify regeneration is clean.
