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
