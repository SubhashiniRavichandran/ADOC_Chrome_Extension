# Changelog

All notable changes to the ADOC Data Reliability Chrome Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX (Unreleased)

### Added

#### Core Features
- Chrome Extension with Manifest V3 architecture
- PowerBI integration with automatic context detection
- Right-side collapsible sidebar for data reliability information
- Secure API credential management with Web Crypto encryption
- Multi-layer caching strategy (memory + storage)
- Browser notification system for alerts

#### API Integration
- ADOC API client with rate limiting support
- Asset search by Fully Qualified Name (FQN)
- Reliability score retrieval
- Alert fetching with severity filtering
- Lineage visualization support
- PowerBI-specific report metadata API

#### User Interface
- Extension popup with quick stats and alerts
- Comprehensive settings/options page with tabs:
  - Connection configuration
  - Notification preferences
  - Display settings
  - BI tool enablement
- Sidebar with:
  - Overall report reliability score
  - Asset-level scores and alerts
  - Column usage information
  - Quick action buttons

#### Security
- Encrypted credential storage using Web Crypto API
- HTTPS-only API communication
- Auto-logout after 30 minutes of inactivity
- Strict Content Security Policy
- No credential logging to console

#### Storage & Caching
- Chrome Storage API integration (local + session)
- Configurable cache TTL (1-30 minutes)
- Automatic cache invalidation
- Context persistence across navigation

### Supported BI Tools
- ✅ PowerBI (app.powerbi.com, msit.powerbi.com)
- 🚧 Tableau (Phase 2 - placeholders implemented)
- 🚧 Looker (Phase 3 - placeholders implemented)

### Technical Details
- Manifest Version: 3
- Minimum Chrome Version: 120
- Background: Service Worker (ESM modules)
- Content Scripts: Injected at document_end
- Storage: Local (persistent) + Session (temporary)
- Authentication: API Key-based

### Known Limitations
- PowerBI semantic model detection is simplified
- Tableau and Looker integrations are placeholder-only
- No offline mode (requires ADOC API access)
- Limited to Chrome browser (no Firefox/Safari support)

### Dependencies
- Chrome Extensions API (built-in)
- Web Crypto API (built-in)
- No external libraries or frameworks

## [Unreleased] - Future Plans

### Phase 2: Tableau Integration
- Tableau context detection (workbook/view)
- Asset mapping for Tableau data sources
- Tableau-specific API endpoints
- UI adjustments for Tableau pages

### Phase 3: Looker Integration
- Looker context detection (dashboard/look/explore)
- Asset mapping for Looker models
- Looker-specific API endpoints
- Full feature parity with PowerBI

### Future Enhancements
- Column-level badges in BI tool UI
- Inline data quality indicators
- Historical trend graphs
- Policy execution results view
- Advanced lineage visualization
- Export functionality (PDF, CSV)
- Dark mode support
- Multi-language support
- Customizable alert rules
- Integration with Slack/Teams for notifications

## Version History Template

### [X.Y.Z] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes to existing functionality

#### Deprecated
- Soon-to-be removed features

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security updates

---

## Semantic Versioning Guide

- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (1.X.0)**: New features, backwards-compatible
- **Patch (1.0.X)**: Bug fixes, minor improvements

## Release Checklist

Before releasing a new version:

- [ ] Update version in manifest.json
- [ ] Update CHANGELOG.md with changes
- [ ] Test all critical user journeys
- [ ] Verify no console errors
- [ ] Check for hardcoded credentials
- [ ] Update README.md if needed
- [ ] Create git tag for release
- [ ] Build release package (ZIP)
- [ ] Test installation from package
- [ ] Submit to Chrome Web Store

## Links

- [Repository](https://github.com/acceldata/adoc-extension)
- [Issues](https://acceldata.atlassian.net/browse/EXT)
- [Documentation](https://docs.acceldata.io/extensions/chrome)
- [Chrome Web Store](https://chrome.google.com/webstore/detail/adoc-data-reliability)
