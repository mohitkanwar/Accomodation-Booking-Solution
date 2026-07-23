# Accomodation-Booking-Solution

Architecture and solution documentation for an accommodation booking platform.

## Local development

```bash
pnpm install
pnpm start
```

## Production build

```bash
pnpm build
```

The build generates PlantUML diagrams before Docusaurus compiles the pages.
Java 21 or later must be available locally. The pinned PlantUML JAR is
downloaded once, checksum-verified, and cached under `.cache/plantuml`.

## PlantUML diagrams

Keep the PlantUML source beside the Markdown page that uses it:

```text
docs/presentation/
├── api-flow.md
└── api-flow.puml
```

Insert the diagram with this placeholder:

````markdown
```plantuml-image
./api-flow.puml | High-level API flow
```
````

During `pnpm start` or `pnpm build`, the source is rendered under the ignored
`static/plantuml/` directory and the page receives a base-URL-aware SVG image at
the placeholder's position. Text after `|` becomes the image's accessible
alternative text. The `.puml` source remains the only diagram file that needs
to be edited or committed.

Run generation directly when needed:

```bash
pnpm plantuml
```

When the development server is already running, run this command and refresh
the page to see the updated static SVG.

Use one diagram per `.puml` file. A missing source, invalid diagram, missing
Java runtime, failed download, or checksum mismatch stops the build.

### Sodexo diagram theme

The reusable theme is stored at `plantuml/sodexo-theme.puml`. The generator
runs from the repository root, so the same include works in every diagram:

```plantuml
@startuml
!include plantuml/sodexo-theme.puml

title Accommodation Booking Context
actor Employee
component "Accommodation Lego" as Lego
Employee --> Lego
@enduml
```

The theme uses Sodexo blue for structure and hierarchy, red for selective
emphasis, and accessible pale surfaces for identity, configuration, workflow,
integration, and evidence elements. The two core color values are reference
matches and should be checked against an authoritative Sodexo brand guide
before use in externally published brand material.

To use an existing local PlantUML JAR instead of the pinned download:

```bash
PLANTUML_JAR=/absolute/path/to/plantuml.jar pnpm plantuml
```

The site is deployed to GitHub Pages automatically whenever a change is pushed
to the `main` branch.

## Documentation versioning

The deployment calculates a semantic version from Git history:

- **Major:** a top-level item is added to `config/navigation.json`, or the
  commit message contains `[major]`.
- **Minor:** a new Markdown or MDX document is added under `docs/`, or the
  commit message contains `[minor]`.
- **Patch:** an existing page or other project file is changed, or the commit
  message contains `[patch]`.

Commit-message markers are explicit overrides and are useful for specialized
release instructions. The build timestamp is stored in UTC and displayed in
each visitor's local timezone.
