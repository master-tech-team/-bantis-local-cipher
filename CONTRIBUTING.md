# Contributing to @bantis/local-cipher

Thank you for considering contributing! This document outlines the process and guidelines.

## Code of Conduct

Be respectful, inclusive, and professional. We're here to build secure software together.

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/master-tech-team/-bantis-local-cipher/issues)
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/environment details
   - Code sample (if applicable)

### Suggesting Features

1. Check [roadmap](./ROADMAP.md) and [discussions](https://github.com/master-tech-team/-bantis-local-cipher/discussions)
2. Open a discussion or feature request
3. Explain:
   - Use case
   - Proposed API
   - Why it belongs in core (vs userland)

### Submitting Pull Requests

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature`
3. **Make changes** with clear commits
4. **Add tests** (coverage must not decrease)
5. **Update docs** if API changes
6. **Run checks**: `npm test && npm run build`
7. **Submit PR** with description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/-bantis-local-cipher.git
cd -bantis-local-cipher

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Build
npm run build

# Lint
npm run lint
```

## Project Structure

```
src/
├── core/              # Core encryption logic
│   ├── EncryptionHelper.ts
│   ├── SecureStorage.ts
│   ├── EventEmitter.ts
│   ├── KeyRotation.ts
│   └── NamespacedStorage.ts
├── integrations/      # Framework integrations
│   ├── react.ts
│   └── angular.ts
├── utils/             # Utilities
│   ├── compression.ts
│   ├── logger.ts
│   └── debug.ts
├── types/             # TypeScript types
│   └── index.ts
└── __tests__/         # Tests
    ├── EncryptionHelper.spec.ts
    ├── SecureStorage.spec.ts
    └── EventEmitter.spec.ts
```

## Coding Guidelines

### TypeScript

- Use strict mode
- Prefer interfaces over types
- Document public APIs with JSDoc
- Avoid `any` - use `unknown` if needed

### Testing

- Write tests for new features
- Maintain >80% coverage
- Test edge cases
- Use descriptive test names

```typescript
// Good
it('should return null for expired items', async () => {
  // ...
});

// Bad
it('works', () => {
  // ...
});
```

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add key rotation feature
fix: resolve memory leak in event listeners
docs: update README with new examples
test: add tests for compression
chore: update dependencies
```

### Security

- Never commit secrets
- All crypto changes require review
- Follow OWASP guidelines
- Report vulnerabilities privately

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- EncryptionHelper

# Coverage report
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Documentation

- Update README.md for API changes
- Add examples for new features
- Update CHANGELOG.md
- Add JSDoc comments to public methods

## Release Process

(Maintainers only)

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run `npm run build`
4. Run `npm test`
5. Commit: `chore: release v2.x.x`
6. Tag: `git tag v2.x.x`
7. Push: `git push && git push --tags`
8. Publish: `npm publish`

## Questions?

- Open a [discussion](https://github.com/master-tech-team/-bantis-local-cipher/discussions)
- Check [existing issues](https://github.com/master-tech-team/-bantis-local-cipher/issues)
- Read [documentation](./README.md)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
