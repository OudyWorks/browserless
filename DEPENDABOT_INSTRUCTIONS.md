# CI/CD Workflow Cleanup Instructions

Now that you have configured Dependabot and the auto-merge workflow, you should clean up your old cron-based CI setup. Follow the instructions below.

## 1. Modify your CI Workflows

Your current workflow that triggers the build is `.github/workflows/docker-publish-latest.yml`. It relies on `.github/workflows/check-for-package.yml` which uses a cron schedule.

### Remove `check-for-package.yml`
Since Dependabot will now monitor the `@browserless.io/browserless` dependency, you no longer need the hourly cron check:
- You can delete the `.github/workflows/check-for-package.yml` file completely.

### Update `docker-publish-latest.yml`
You need to clean up `docker-publish-latest.yml` so it only triggers on pushes to the `main` branch.

1. Remove the `workflow_run` trigger.
2. Remove any jobs or steps that depend on the artifact from the old trigger.

Your top section of `docker-publish-latest.yml` should simply look like this:

```yaml
name: Publish Docker Images to GitHub Container Registry

on:
  push:
    branches:
      - main
```

And in the `push_to_registry` job, remove the `if` condition:
```yaml
jobs:
  push_to_registry:
    name: Push multi-platform docker images to ghcr.io
    runs-on: ubuntu-latest
    # REMOVE THIS LINE:
    # if: github.event_name == 'push' || (github.event_name == 'workflow_run' && github.event.workflow_run.conclusion == 'success')
```

Also, remember to remove the "Download tag artifact" step and update the "Determine Docker tags" step to set the proper tags, as you will no longer receive the `new_tag.txt` from the `check-for-package` workflow.

## 2. Update Repository Settings

To allow the auto-merge workflow (`dependabot-auto-merge.yml`) to succeed, you need to enable auto-merge in your repository settings:

1. Navigate to your repository on GitHub.
2. Click on **Settings** (the gear icon at the top).
3. Under the **General** tab, scroll down to the **Pull Requests** section.
4. Check the box for **Allow auto-merge**.
5. (Optional but recommended) Enable **Automatically delete head branches** so Dependabot branches are deleted after merging.

That's it! Once these settings are configured and your workflows updated, Dependabot will handle the package updates, the GitHub Action will merge the PR automatically, and the merge (which creates a push to `main`) will trigger your newly cleaned up Docker build workflow.
