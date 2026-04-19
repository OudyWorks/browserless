# Transitioning to Event-Driven Architecture with Dependabot

As requested, here are the code snippets, configuration files, and step-by-step instructions to fully transition to an event-driven architecture using Dependabot.

## 1. Dependabot Configuration and Auto-Merge
The configuration files have been created in the repository:
- `.github/dependabot.yml`: Configured to monitor Docker (daily), npm/pnpm (weekly), and GitHub Actions (weekly).
- `.github/workflows/dependabot-auto-merge.yml`: Automatically squashes and merges PRs created by Dependabot.

### Repository Settings Update Required
In the GitHub UI, you must enable "Allow auto-merge":
1. Go to your repository **Settings**.
2. Under the **General** tab, scroll down to the **Pull Requests** section.
3. Check the box for **"Allow auto-merge"**.

## 2. Dockerfile Pinning Instruction

Currently, your Docker base image is built dynamically without an explicit `Dockerfile` in the root repository. Dependabot requires an actual `Dockerfile` (or `docker-compose.yml`) containing the `FROM` instruction to track its updates. Also, it cannot track updates if you use the `latest` tag.

### How to fix it:
Create a `Dockerfile` in the root of your project:

```dockerfile
# /Dockerfile
# Pin the image to a specific version (e.g. 2.4.0) instead of 'latest'
FROM ghcr.io/browserless/multi:2.4.0

COPY package.json package-lock.json ./
# ... the rest of your Dockerfile instructions ...
```

Then, update `.github/workflows/docker-publish-latest.yml` to point to this `Dockerfile` instead of using the dynamically created one. Because Dependabot relies on static code analysis, it cannot monitor your base image if the `FROM` directive is injected during CI with `build-args`.

Once you pin it, Dependabot will start opening PRs when `ghcr.io/browserless/multi:2.4.1` (or whatever the next version is) is released.

## 3. Cleanup Instructions

Since you are transitioning to an event-driven process with Dependabot, you no longer need the daily cron jobs. You can safely remove or modify `check-for-package.yml`.

Your main build workflow (`docker-publish-latest.yml`) is currently triggered by `check-for-package.yml` via the `workflow_run` event:

```yaml
  workflow_run:
    workflows: ["Check for New Docker Package in Another Repo"]
    types:
      - completed
```

You should remove `workflow_run` and solely rely on standard `push` triggers on the `main` branch.

**Update `.github/workflows/docker-publish-latest.yml` trigger section:**

```yaml
on:
  push:
    branches:
      - main
```

Now, when Dependabot opens a PR to update the `Dockerfile` or your `package.json`, the auto-merge workflow will merge it to `main`. This `push` event to `main` will automatically trigger `docker-publish-latest.yml` to build and publish your updated custom image.
