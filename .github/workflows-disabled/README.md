# Disabled workflows

The upstream OpenMontage CI workflow lives here instead of `.github/workflows/`
because the automation account used to import this repository is not allowed to
create or update GitHub Actions workflow files.

To enable CI, move it back yourself:

```bash
mkdir -p .github/workflows
git mv .github/workflows-disabled/ci.yml .github/workflows/ci.yml
git commit -m "Enable CI workflow"
```
