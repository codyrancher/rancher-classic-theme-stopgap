# Rancher Classic Theme (stopgap)

A Rancher UI extension that brings back the dashboard's Classic theme after
[rancher/dashboard#19924](https://github.com/rancher/dashboard/issues/19924) removes it from the dashboard itself.

It is a stopgap. Once the dashboard supports changing theme colors at runtime
([rancher/dashboard#19351](https://github.com/rancher/dashboard/issues/19351)), Classic can be recreated as a custom theme
and this extension retired.

## Install

1. In Rancher, open **Extensions**, then **⋮ > Manage Repositories > Create**.
2. Pick **Git Repository** and enter:
   - Git Repo URL: `https://github.com/codyrancher/rancher-classic-theme-stopgap`
   - Git Branch: `gh-pages`
3. Under **Extensions > Available**, open the **Classic Theme** card's **⋮ > Install**, then press **Reload** when the
   page asks.
4. Turn the theme on the way the dashboard always did: **Global Settings > Settings > ui-brand > ⋮ > Edit Setting**, set
   the value to `classic` and save.

Light and dark follow each user's **Preferences > Theme**, and the login page is Classic too. To turn Classic off, reset
`ui-brand` or uninstall the extension.

On a Rancher whose dashboard still ships Classic, the extension changes nothing.

## How it works

- `pkg/classic-theme/styles` holds the Classic stylesheets as the dashboard shipped them before the removal, unchanged
  apart from their import paths. `_context.scss` supplies the few Sass globals the dashboard's own stylesheet used to
  provide, and `classic.scss` repeats the two effects the dashboard's global stylesheets had on Classic. The compiled CSS
  matches what the dashboard compiled for Classic, selector for selector and value for value.
- `pkg/classic-theme/classic-body-class.ts` keeps the `classic` class on the page body while `ui-brand` is `classic`,
  which is what scopes those stylesheets. The dashboard used to add that class itself.

## Develop

```bash
yarn install
yarn test
yarn build-pkg classic-theme
```

To release, publish a GitHub release tagged `classic-theme-<version>` (the version in `pkg/classic-theme/package.json`).
The **Build and Release Extension Charts** workflow then adds the chart to the `gh-pages` branch.
