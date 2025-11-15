# Publishing Auth Agent SDKs

Guide for publishing the Auth Agent SDKs to npm and PyPI.

## Prerequisites

### npm
- npm account: https://www.npmjs.com/signup
- npm authentication: `npm login`
- Package name available: `auth-agent-sdk`

### PyPI
- PyPI account: https://pypi.org/account/register/
- PyPI API token: https://pypi.org/manage/account/token/
- Package name available: `auth-agent-sdk`

---

## Publishing to npm

### 1. Build the Package

```bash
cd /Users/hetpatel/Desktop/Auth_Agent_YC/Auth_Agent/sdk

# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build
```

This will create the `dist/` directory with:
- `index.js` / `index.mjs` - Main entry point
- `client.js` / `client.mjs` - Website SDK
- `client-react.js` / `client-react.mjs` - React components
- `agent.js` / `agent.mjs` - Agent SDK
- All corresponding `.d.ts` type definition files

### 2. Test Locally

```bash
# Link package locally
npm link

# In another project
npm link auth-agent-sdk

# Test import
node -e "const sdk = require('auth-agent-sdk'); console.log(sdk);"
```

### 3. Publish to npm

```bash
# Dry run first
npm publish --dry-run

# Publish
npm publish
```

### 4. Verify

```bash
npm view auth-agent-sdk

# Install in test project
npm install auth-agent-sdk
```

---

## Publishing to PyPI

### 1. Build the Package

```bash
cd /Users/hetpatel/Desktop/Auth_Agent_YC/Auth_Agent/sdk

# Install build tools
pip install build twine

# Build distributions
python -m build
```

This creates:
- `dist/auth-agent-sdk-1.0.0.tar.gz` - Source distribution
- `dist/auth_agent_sdk-1.0.0-py3-none-any.whl` - Wheel distribution

### 2. Test with TestPyPI (Optional)

```bash
# Upload to TestPyPI
python -m twine upload --repository testpypi dist/*

# Test install
pip install --index-url https://test.pypi.org/simple/ auth-agent-sdk
```

### 3. Publish to PyPI

```bash
# Upload to PyPI
python -m twine upload dist/*
```

Enter your PyPI username and password (or use API token).

### 4. Verify

```bash
pip search auth-agent-sdk

# Install in test project
pip install auth-agent-sdk
```

---

## Post-Publication

### Update Documentation

After publishing, update:
- ✅ README.md - Update installation instructions
- ✅ docs.auth-agent.com - Update SDK documentation
- ✅ GitHub releases - Create release notes

### Create GitHub Release

```bash
git tag -a v1.0.0 -m "Release v1.0.0: Initial SDK release"
git push origin v1.0.0
```

Then create release on GitHub with changelog.

### Announce

- 🐦 Twitter/X: @auth_agent
- 💬 Discord community
- 📝 Blog post
- 📧 Email newsletter

---

## Package Structure

### npm Package

```
auth-agent-sdk/
├── dist/
│   ├── index.js / index.mjs / index.d.ts
│   ├── client.js / client.mjs / client.d.ts
│   ├── client-react.js / client-react.mjs / client-react.d.ts
│   └── agent.js / agent.mjs / agent.d.ts
├── package.json
├── README.md (NPM_README.md)
└── LICENSE
```

### PyPI Package

```
auth-agent-sdk/
├── auth_agent_sdk/
│   ├── __init__.py
│   ├── client/
│   │   ├── __init__.py
│   │   └── auth_client.py
│   └── agent/
│       ├── __init__.py
│       ├── auth_agent_agent_sdk.py
│       └── browser_use.py
├── setup.py
├── README.md (PYPI_README.md)
└── LICENSE
```

---

## Version Bumping

### Semantic Versioning

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes

### Update Version

**npm:**
```bash
# Update version in package.json
npm version patch  # or minor, or major
npm publish
```

**PyPI:**
```bash
# Update version in setup.py
# Rebuild and republish
python -m build
python -m twine upload dist/*
```

---

## Troubleshooting

### npm publish fails with "Package already exists"

```bash
# Check if version already published
npm view auth-agent-sdk versions

# Bump version
npm version patch
npm publish
```

### PyPI upload fails with "File already exists"

```bash
# Delete dist/ and rebuild with new version
rm -rf dist/
# Update version in setup.py
python -m build
python -m twine upload dist/*
```

### TypeScript build errors

```bash
# Clean and rebuild
rm -rf dist/
npm run build

# Check tsconfig.json is correct
```

### Import errors after publishing

- Check `package.json` exports field
- Verify `dist/` files exist
- Test with `npm pack` and inspect tarball

---

## Maintenance

### Regular Updates

- 📦 Update dependencies monthly
- 🐛 Fix bugs as reported
- ✨ Add features based on feedback
- 📚 Keep documentation current

### Deprecation Policy

If deprecating features:
1. Mark as deprecated in docs
2. Add console warnings
3. Wait 2 minor versions
4. Remove in next major version

---

## Support

For publishing issues:
- npm: https://www.npmjs.com/support
- PyPI: https://pypi.org/help/
- GitHub: https://github.com/auth-agent/auth-agent/issues

---

## Checklist

Before publishing:

**Code:**
- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] Python code passes type checking (mypy)
- [ ] Examples work
- [ ] Documentation is complete

**Package:**
- [ ] Version bumped
- [ ] Changelog updated
- [ ] README.md accurate
- [ ] LICENSE file included
- [ ] No sensitive files in package

**npm:**
- [ ] `npm run build` succeeds
- [ ] `npm pack` looks correct
- [ ] Test with `npm link`

**PyPI:**
- [ ] `python -m build` succeeds
- [ ] Test install from TestPyPI
- [ ] Wheel and source dist created

**Post-publish:**
- [ ] GitHub release created
- [ ] Documentation updated
- [ ] Announcement posted
- [ ] Community notified
