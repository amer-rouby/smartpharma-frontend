# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 22 application (standalone components, no NgModules) for **SmartPharma**, a multi-tenant pharmacy management system. Angular Material + SCSS token-based theming (not Tailwind — an explicit choice for this project). Built with `@angular/build:application` (esbuild/Vite) and tested with Vitest via `@angular/build:unit-test`.

## Commands

```bash
# Development
npm start                 # ng serve, http://localhost:4200
                           # requires the backend running (default http://localhost:8081)

# Build
npm run build              # production build
npm run watch               # watch build, development config

# Testing
npm test                   # Vitest unit tests

# Upgrading Angular
npx ng update                                    # see what's outdated
npx ng update @angular/core@N @angular/cli@N @angular/material@N   # one major version at a time
```

## Architecture

```
src/app/
├── core/          # guards, interceptors, models, services, crud/, utils
├── features/       # ~40 lazy-loaded feature sub-modules
├── layouts/         # auth-layout, main-layout
└── shared/           # material.module.ts (aggregates all Angular Material imports
                       # used across the app), components, directives, models, services
```

Feature-based structure: each feature under `features/{name}/` is mostly self-contained (its own components, and — for features on the CRUD architecture below — its own `models/` and `services/` subfolders). Cross-cutting logic goes in `core/`; shared UI/components go in `shared/`.

## Generic CRUD Architecture (`core/crud/`)

An "Active Record"-style CRUD framework, built to remove repeated pagination/search/dialog boilerplate. Core pieces:

- **`CrudModel<Model, Service>`** — base class for a model. Implements `create()` / `update()` / `save()` / `delete()` by looking its own service up via `ServiceRegistry` and delegating to it. A model doesn't need to be Angular-aware itself.
- **`CrudService<Model, PrimaryKeyType>`** — base class for the backend-facing service. Provides `getAll()` / `getById()` / `create()` / `update()` / `delete()` with sane defaults (pharmacyId auto-attached via the injected `AuthService`, response casting via `cast-response`). Override `getSegmentUrl()` at minimum; override `getGetAllEndpoint()`, `toRequestPayload()`, or `getAll()` itself when a backend endpoint doesn't follow the defaults (see gotchas below).
- **`CrudWithDialogService`** — adds `openCreateDialog()` / `openUpdateDialog()` / `openViewDialog()` on top of `CrudService`, for features with a create/edit dialog.
- **`ServiceRegistry`** + **`RegisterServiceMixin`** / **`ModelServiceMixin`** — the glue: `RegisterServiceMixin` auto-registers a service instance under a string name; `ModelServiceMixin` (used by `CrudModel`) looks a service up by that same name. This is how a plain model instance's `.save()` resolves to the correct injected Angular service.
- **`CrudPageDirective<Model, Service>`** — base for a list page: `pageIndex` / `pageSize` / `searchQuery` / `loading` signals, a debounced-search effect that calls `service.getAll()` automatically, `models()` / `totalElements()` computed signals, `onPageChange()` / `onSearchInput()` / `refresh()`.
- **`CrudPageWithDialogDirective`** — extends the above with `openCreateDialog()` / `openUpdateDialog()` / `confirmDelete()` (a confirm dialog + delete + refresh).
- **`CrudDialogDirective<Model>`** — base for a create/edit/view dialog: builds the reactive form from the model's `buildForm()`, handles create-vs-update mode, populates the form on edit, and calls `model.save()` on submit. Override `afterBuildForm()`, `prepareModel()`, `afterSaveSuccess()`, `afterSaveFail()` per feature.

### Which screens use it

- **Full CRUD (list + create/edit dialog + delete)**: Categories, Users, Expenses, Suppliers.
- **Read-only list (list + pagination/search, no dialog — extends bare `CrudPageDirective`)**: Purchase Orders, Payment History, Stock Movements, Sales History.
- **Deliberately NOT on this architecture** — don't force it here: single-entity settings forms (no list), multi-line-item transactional forms (purchase order form, POS/sales form), entities with heavy custom logic (Product form: JSONB `extraAttributes`, images, barcode scanning), and lists the backend doesn't paginate at all (Stock Alerts — needs a backend change first).

### Adding a new feature on this architecture

1. `features/{name}/models/{name}.model.ts` — extend `CrudModel<Model, Service>`, set `$$primaryKey`/`$$service`, implement `buildForm()`.
2. `features/{name}/services/{name}-crud.service.ts` — extend `RegisterServiceMixin(CrudWithDialogService)<Model, DialogComponent, PrimaryKeyType>` (or plain `CrudService` for a read-only list). Implement `getSegmentUrl()`, `getDialogComponent()`, `getModelInstance()`. Override `toRequestPayload()` to match whatever the backend's DTO actually accepts.
3. Page component extends `CrudPageWithDialogDirective<Model, Service>` (or `CrudPageDirective` for read-only), `readonly service = inject(...)`. Template binds to `models()`, `pageIndex()`, `pageSize()`, `totalElements()`, `loading()`, `searchQuery()`, `onSearchInput($event)`, `onPageChange($event)`, `openCreateDialog()`, `openUpdateDialog(row)`, `confirmDelete(row)`.
4. Dialog component extends `CrudDialogDirective<Model>`, defines `titleKeys` (create/update/view translation keys), overrides `afterSaveSuccess()` / `afterSaveFail()` with feature-specific success/error keys.

### Gotchas (hit these while building the above — check before assuming otherwise)

- **cast-response `unwrap`**: only apply automatically from a `@CastResponseContainer` entry when that entry's key matches the decorated method's name *exactly*. Since services here key their container by `$default`/`$pagination` (not method names), `unwrap: 'data'` (peeling off the `ApiResponse` envelope) must be set directly on each `@CastResponse(...)` call in the base `CrudService`, not left to the container alone.
- **`toRequestPayload()`**: most backend request DTOs reject unrecognized JSON fields. Never send a `CrudModel` instance as-is — always shape the payload to exactly what the DTO declares (typically stripping `id`, `createdAt`, `updatedAt`).
- **Backend pagination isn't uniform**: some endpoints have no `/page` suffix (override `getGetAllEndpoint()`), some branch between two different endpoints depending on active filters (see `StockMovementCrudService` — override `getAll()` entirely), and some have no server pagination at all (see `UserCrudService`/`SaleCrudService` — fetch everything and paginate client-side).
- **`noImplicitOverride` is on** in `tsconfig.json` — every member that overrides a base class member, *including implementing an inherited abstract member*, needs the `override` keyword or the build fails.
- **pharmacyId is the tenant key.** It's always derived server-side from the injected `AuthService`/`PharmacyContextService`, never trusted from elsewhere in the client. When a backend write endpoint expects it in the request body rather than as a query param, `getModelInstance()` must set it explicitly.

## Angular conventions

- Standalone components only, no NgModules.
- Signals for state (`signal()`, `computed()`); `inject()` function over constructor injection.
- Reactive Forms for CRUD-style dialogs.
- `OnPush` change detection is **not** universally applied across the existing codebase — don't force an unrelated component to `OnPush` as a side effect of another change.
- `MaterialModule` (`shared/material.module.ts`) aggregates the Angular Material imports used app-wide — import it rather than individual Material modules in a new component unless there's a reason not to.

## Internationalization (i18n)

- `@ngx-translate/core`, Arabic (`ar.json`) is the default/fallback language, English (`en.json`) secondary. Both live in `src/assets/i18n/`.
- Translation keys are **UPPERCASE.DOT_CASE** (e.g. `CATEGORIES.ADD_SUCCESS`, `COMMON.DELETE_SUCCESS`) — every new key must be added to both `ar.json` and `en.json`.

## API conventions

- Every backend response is wrapped in `ApiResponse<T>`: `{ success, message, data, statusCode, code?, params? }`. `code`/`params` (when present) are a stable, localizable error identifier — resolve it to `ERRORS.<code>` via `ErrorHandlerService` instead of showing the raw `message`.
- A paginated response is a real Spring Data Page under `data`: `{ content, totalElements, totalPages, size, number, first, last, empty? }` — `empty` is not always present on every endpoint's DTO; don't rely on it.
- `pharmacyId` is attached to nearly every request (query param on reads/deletes, sometimes required in the body on writes) — check the existing service for the exact convention before adding a new endpoint call.

## Git / branch workflow

- Every fix or feature goes on its own branch off `main` — never commit straight to `main`.
- A multi-step effort (e.g. rolling the CRUD architecture out across several features) uses one integration branch, with one sub-branch per module/step merged back into it as each is verified; the integration branch is then reviewed and merged into `main` via PR.
- Pushing to GitHub and opening/merging PRs is done by the project owner, not automatically.

## Commit messages

Do not add any AI/assistant-specific attribution to commit messages, code comments, or anywhere else a teammate or reviewer could see it.
