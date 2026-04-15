#!/usr/bin/env bash
# Local dev only: relax edition2024 manifests in the cargo registry so older
# cargo-build-sbf can parse them. Re-run after `cargo update` downloads new crates.
set -euo pipefail
REG="${CARGO_HOME:-$HOME/.cargo}/registry/src"
if [[ ! -d "$REG" ]]; then
  echo "No cargo registry at $REG"
  exit 1
fi
find "$REG" -name Cargo.toml -print0 2>/dev/null | while IFS= read -r -d '' f; do
  if grep -q 'edition = "2024"' "$f" 2>/dev/null; then
    sed -i.bak 's/edition = "2024"/edition = "2021"/g' "$f" || sed -i '' 's/edition = "2024"/edition = "2021"/g' "$f"
    sed -i.bak 's/rust-version = "1.85.0"/rust-version = "1.75.0"/g' "$f" 2>/dev/null || true
    sed -i.bak 's/rust-version = "1.85"/rust-version = "1.75"/g' "$f" 2>/dev/null || true
    rm -f "${f}.bak"
  fi
done
echo "Patched edition2024 Cargo.toml files under $REG"
