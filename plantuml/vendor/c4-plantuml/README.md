# C4-PlantUML

This directory contains the minimal C4-PlantUML context-diagram library used by
the documentation build:

- `C4.puml`
- `C4_Context.puml`

Source: <https://github.com/plantuml-stdlib/C4-PlantUML>

Pinned revision: `1edfb8a878baaa821e54cf423a070c792e8677c6`

The upstream project is distributed under the MIT License; see `LICENSE`.
Vendoring the files keeps documentation builds deterministic and independent
of external network availability. `C4_Context.puml` contains one intentional
vendoring change: its `C4.puml` dependency is always loaded from this directory.
