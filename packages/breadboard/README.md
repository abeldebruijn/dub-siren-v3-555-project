# Breadboard compiler

Pure TypeScript compiler for Breadboard descriptions. It runs in Node and browsers, has no DOM dependency, and exposes one public interface.

## Interface

```ts
import { compile } from "@dub-siren/breadboard";

const result = compile(`breadboard Demo rows 2 columns 2\n`);

if (result.status === "valid") {
  console.log(result.model);
  console.log(result.svg);
}
```

Every result contains the recoverable Surface AST and ordered diagnostics:

- `valid`: Canonical Breadboard Model and byte-canonical SVG are available.
- `invalid`: language errors prevent a model and SVG.
- `unsupported`: valid input exceeds a safe numeric or resource limit.

Warnings do not prevent valid output. `compile(source)` is deterministic and performs no I/O.

## Conformance fixtures

Fixtures live in [`test/conformance/`](test/conformance/):

- `.bd` contains source input;
- `.diagnostics.json` contains normative ordered diagnostics;
- `.svg` exists for valid inputs and contains exact expected bytes.

The suite covers parsing and recovery, semantic resolution, routing, colours, serialization, and the approved Raspberry Pi Pico split-workbench specimen.

## Development

From the repository root:

```sh
pnpm --filter @dub-siren/breadboard test
pnpm --filter @dub-siren/breadboard build
pnpm --filter @dub-siren/breadboard generate:grammar
```

The generated railroad document is checked for freshness by the test command. Regenerate it only when the executable grammar changes.

This package is workspace-private. CLI and npm publication are intentionally out of scope.

## Editor integration

The course editor imports this package through the pnpm workspace and is available at `#/breadboard`. It keeps source in browser-local storage, retains the latest valid preview while new input is invalid, exposes Surface AST and Canonical Breadboard Model inspection, and downloads Canonical SVG without a backend.
