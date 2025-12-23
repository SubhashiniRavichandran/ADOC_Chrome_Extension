# ADOC Chrome Extension Project - Complete Documentation

## Executive Summary

The ADOC Chrome Extension is a lightweight Chrome browser add-on designed to enhance data reliability insights for users of popular Business Intelligence (BI) tools, including Power BI, Tableau, Looker, Omni, and others. By injecting a customizable right-side panel directly into the BI tool's browser interface, the extension allows users to access real-time data quality metrics—such as freshness, completeness, accuracy, and anomaly alerts—contextualized to the active report or dashboard.

This "meet users where they are" approach integrates Acceldata's Data Observability Cloud (ADOC) seamlessly, reducing context-switching and empowering data consumers to validate insights without leaving their workflow. The extension leverages ADOC's public APIs for authentication and data retrieval, ensuring secure, credential-based access to reliability scores tied to specific datasets or pipelines.

## Project Background

ADOC is a data observability platform that provides data reliability and quality scores for various data assets. A critical final stage in data usage is consumption through BI/Dashboarding tools such as PowerBI, Tableau, and Looker. By integrating ADOC directly into these tools via a Chrome extension, end users can receive real-time notifications about data quality issues affecting their reports and dashboards.

### Problem Statement

Data teams spend approximately **30% of their time** troubleshooting reliability issues, often requiring switches between BI tools and observability platforms like ADOC, leading to:
- Delayed decisions
- Reduced trust in analytics
- Productivity loss from context-switching
- Delayed issue detection

### Solution Value

This extension addresses that by embedding ADOC's end-to-end observability (covering data-at-rest, in-motion, and in-consumption) directly in the BI workflow, enabling "shift-left" reliability checks that detect issues early (e.g., schema drift via ADOC policies).

## Core Purpose

Enable BI users to view data quality metrics, alerts, and reliability scores without leaving their workflow. The extension embeds ADOC's observability capabilities into the BI tool's browser interface through a customizable sidebar panel.

## Business Objectives

1. **Notify BI users about data quality issues within their workflow** - Eliminate the need to switch between applications
2. **Show data reliability scores for columns and tables** used in reports/dashboards
3. **Help users understand which data assets are affected** by quality issues
4. **Provide ADOC capabilities without leaving the BI tool interface** - Seamless integration

## Key Features

### 1. Contextual Detection
- **Automatic Identification**: Automatically identifies the active BI tool and report (e.g., via URL parsing or DOM inspection)
- **Intelligent Mapping**: Fetches relevant ADOC reliability data for the current context
- **Real-time Updates**: Monitors page changes and updates context dynamically

### 2. Right-Side Panel
- **Non-intrusive Design**: Collapsible, non-intrusive sidebar that doesn't interfere with BI tool functionality
- **Key Metrics Display**: 
  - Data freshness score
  - Completeness metrics
  - Accuracy indicators
  - Drift alerts
  - Lineage overview
- **Drill-down Views**: Detailed navigation for deeper analysis
- **Responsive Design**: Adapts to different screen sizes

### 3. ADOC Integration
- **Secure Authentication**: One-time login using user credentials
- **OAuth 2.0**: Subsequent sessions use OAuth tokens for API calls
- **API Endpoints**: Connects to ADOC endpoints (e.g., /reliability/scores for report-specific queries)
- **Encrypted Storage**: Secure token storage using Chrome Storage API

### 4. Customization Options
- **Panel Control**: Pin/unpin panel for persistent visibility
- **Metric Prioritization**: Configure which metrics are most important
- **Alert Configuration**: Set custom alerts for threshold breaches
- **Visual Preferences**: Customize colors, layout, and display options

### 5. Alert Notifications
Display active data quality alerts relevant to the current dashboard/report:
- **Data Quality issues**: Null values, invalid data, constraint violations
- **Data Drift alerts**: Statistical changes in data distribution
- **Schema Drift alerts**: Structure changes in underlying data
- **Reconciliation issues**: Mismatches between source and target
- **Data Anomalies**: Unusual patterns or outliers
- **Data Freshness issues**: Delayed or stale data

Alert information includes:
- Alert severity (Critical, High, Medium, Low)
- Alert description
- Affected assets/columns
- Time of occurrence
- Direct link to ADOC platform for details

### 6. Lineage Visualization
Show simplified data lineage for assets used in current view:
- Display upstream data sources
- Show pipeline dependencies
- Highlight impacted downstream reports
- Indicate which assets have quality issues

### 7. Quick Actions
- **Navigate to ADOC**: Direct link to asset in ADOC platform
- **View Policy Details**: Access policy execution results
- **Acknowledge Alert**: Mark alert as acknowledged
- **Filter by Severity**: Toggle alert visibility by severity level

## Supported BI Tools (Priority Order)

1. **PowerBI** (Phase 1 - Highest Priority)
2. **Tableau** (Phase 2)
3. **Looker** (Phase 3)

## Technical Architecture

### Extension Type
**Chrome Manifest V3** - Modern extension architecture with enhanced security and performance

### Core Components

#### 1. Content Scripts
**Purpose**: Inject UI elements and detect BI tool context

**Responsibilities**:
- Inject UI elements into BI tool pages
- Detect current dashboard/report context via URL parsing and DOM inspection
- Listen for page changes and navigation events
- Extract semantic model information from BI tool DOM
- Monitor for data refresh events

**Tool-specific Scripts**:
- `content-powerbi.js` - PowerBI integration
- `content-tableau.js` - Tableau integration
- `content-looker.js` - Looker integration

**Execution**: Runs at `document_end` to ensure page is loaded

#### 2. Background Service Worker
**Purpose**: Handle backend operations and API communication

**Responsibilities**:
- Handle all API communication with ADOC
- Manage authentication state and token refresh
- Cache data for performance optimization
- Process API responses before sending to content scripts
- Handle cross-origin requests
- Manage notification scheduling

**File**: `background.js`

**Key Features**:
- Request queuing for rate limiting
- Exponential backoff for failed requests
- Token encryption/decryption
- Cache invalidation logic

#### 3. Popup Interface
**Purpose**: Quick access and configuration

**Dimensions**: 400px x 600px

**Sections**:
- **Header**: ADOC logo, connection status indicator, settings icon
- **Quick Stats**: Number of monitored assets, total open alerts, average reliability score
- **Alert List**: Grouped by severity, filterable by asset, clickable for details
- **Quick Actions**: Open ADOC Dashboard, Refresh Data, Configure Settings

**File**: `popup.html`

#### 4. Options Page
**Purpose**: Comprehensive configuration management

**Configuration Categories**:

**ADOC Connection**:
- Server URL (e.g., https://adoc.acceldata.io)
- API Access Key
- API Secret Key
- Test Connection button

**Notification Preferences**:
- Enable browser notifications
- Alert severity threshold (Critical, High, Medium, Low)
- Notification frequency (Real-time, Hourly, Daily)
- Sound on/off

**Display Settings**:
- Show sidebar by default
- Badge position (left/right of field names)
- Color scheme (light/dark)
- Refresh interval (1, 5, 15, 30 minutes)

**BI Tool Specific**:
- Enable for PowerBI
- Enable for Tableau
- Enable for Looker
- Custom CSS overrides (advanced)

**File**: `options.html`

### Technology Stack

#### Frontend Framework
- **React**: For sidebar UI components
- **React Hooks**: useState, useEffect, useContext for state management
- **CSS Modules**: For scoped styling

#### Authentication
- **OAuth 2.0**: Standard authentication protocol
- **Token Management**: Automatic refresh before expiration
- **Encrypted Storage**: Web Crypto API for credential encryption

#### Storage
- **Chrome Storage API**: 
  - `chrome.storage.local` for persistent data (not synced)
  - `chrome.storage.session` for temporary session data
- **Encryption**: All sensitive data encrypted at rest

#### Security
- **HTTPS-only**: All API calls must use HTTPS
- **Content Security Policy**: Strict CSP for extension pages
- **Input Validation**: All user inputs sanitized
- **XSS Prevention**: React's built-in protection

### Manifest V3 Structure

```json
{
  "manifest_version": 3,
  "name": "ADOC Data Reliability for BI Tools",
  "version": "1.0.0",
  "description": "View data reliability scores and alerts from ADOC directly in PowerBI, Tableau, and Looker",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": [
        "https://app.powerbi.com/*",
        "https://msit.powerbi.com/*"
      ],
      "js": ["content-powerbi.js"],
      "css": ["styles.css"],
      "run_at": "document_end"
    },
    {
      "matches": [
        "*://*.tableau.com/*",
        "https://online.tableau.com/*"
      ],
      "js": ["content-tableau.js"],
      "css": ["styles.css"],
      "run_at": "document_end"
    },
    {
      "matches": [
        "*://*.looker.com/*",
        "*://*.cloud.looker.com/*"
      ],
      "js": ["content-looker.js"],
      "css": ["styles.css"],
      "run_at": "document_end"
    }
  ],
  "permissions": [
    "storage",
    "notifications",
    "activeTab"
  ],
  "host_permissions": [
    "https://app.powerbi.com/*",
    "*://*.tableau.com/*",
    "*://*.looker.com/*",
    "*://*.cloud.looker.com/*",
    "*://*.acceldata.io/*"
  ],
  "options_page": "options.html",
  "web_accessible_resources": [
    {
      "resources": ["icons/*", "styles.css"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### Permission Requirements

**Required Permissions**:
- **storage**: Store configuration and cache data
- **notifications**: Display browser notifications for alerts
- **activeTab**: Access current tab information

**Host Permissions**:
- PowerBI domains: `https://app.powerbi.com/*`, `https://msit.powerbi.com/*`
- Tableau domains: `*://*.tableau.com/*`, `https://online.tableau.com/*`
- Looker domains: `*://*.looker.com/*`, `*://*.cloud.looker.com/*`
- ADOC domains: `*://*.acceldata.io/*`

## ADOC API Integration

### Authentication

**Method**: API Key-based Authentication

Users must generate API keys from ADOC Admin Central. The extension stores these keys securely and uses them for all API requests.

**API Key Components**:
- **Access Key**: Public identifier (not sensitive)
- **Secret Key**: Private authentication token (highly sensitive)

**Authentication Headers**:
```json
{
  "X-ACCESS-KEY": "<user_access_key>",
  "X-SECRET-KEY": "<user_secret_key>",
  "Content-Type": "application/json"
}
```

**Security Requirements**:
- Keys must be encrypted before storage using Web Crypto API
- Never log keys to console
- Clear keys immediately on authentication failure
- Implement auto-logout after 30 minutes of inactivity

### Complete API Client Implementation

```javascript
// Complete authentication flow
class AdocApiClient {
  constructor(baseUrl, accessKey, secretKey) {
    this.baseUrl = baseUrl;
    this.accessKey = accessKey;
    this.secretKey = secretKey;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'X-ACCESS-KEY': this.accessKey,
      'X-SECRET-KEY': this.secretKey,
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ADOC API request failed:', error);
      throw error;
    }
  }

  // Get asset by FQN
  async getAssetByFQN(fullyQualifiedName) {
    return this.makeRequest(`/api/v1/assets/search?query=${encodeURIComponent(fullyQualifiedName)}`);
  }

  // Get reliability score
  async getReliabilityScore(assetId) {
    return this.makeRequest(`/api/v1/assets/${assetId}/reliability`);
  }

  // Get active alerts
  async getAlerts(assetIds, severity = null) {
    let endpoint = `/api/v1/alerts?assetIds=${assetIds.join(',')}&status=OPEN`;
    if (severity) {
      endpoint += `&severity=${severity}`;
    }
    return this.makeRequest(endpoint);
  }

  // Get lineage
  async getLineage(assetId, direction = 'BOTH', depth = 2) {
    return this.makeRequest(`/api/v1/assets/${assetId}/lineage?direction=${direction}&depth=${depth}`);
  }
}
```

### Key API Endpoints

#### 1. Asset Search API

**Purpose**: Find ADOC assets matching BI tool tables/columns

**Endpoint**: 
```
GET /api/v1/assets/search
```

**Parameters**:
- `query` (string, required): Asset name or Fully Qualified Name (FQN)
- `assetType` (string, optional): TABLE, COLUMN, DASHBOARD, etc.
- `dataSourceType` (string, optional): SNOWFLAKE, BIGQUERY, DATABRICKS, etc.

**Request Example**:
```http
GET /api/v1/assets/search?query=USERS_TABLE&assetType=TABLE&dataSourceType=SNOWFLAKE
X-ACCESS-KEY: <access_key>
X-SECRET-KEY: <secret_key>
Content-Type: application/json
```

**Response Example**:
```json
{
  "assets": [
    {
      "id": "asset-uuid-12345",
      "name": "USERS_TABLE",
      "fullyQualifiedName": "PROD_DB.PUBLIC.USERS_TABLE",
      "assetType": "TABLE",
      "dataSource": {
        "id": "datasource-uuid-67890",
        "name": "Snowflake Production",
        "type": "SNOWFLAKE"
      },
      "reliabilityScore": 95.5,
      "lastUpdated": "2025-10-18T10:30:00Z"
    }
  ]
}
```

**Use Cases**:
- Map PowerBI semantic model tables to physical assets
- Find assets when user navigates to new report
- Validate asset existence before fetching reliability data

#### 2. Data Reliability Score API

**Purpose**: Get current reliability scores for assets

**Endpoint**: 
```
GET /api/v1/assets/{assetId}/reliability
```

**Parameters**:
- `assetId` (path parameter): UUID of the asset

**Request Example**:
```http
GET /api/v1/assets/asset-uuid-12345/reliability
X-ACCESS-KEY: <access_key>
X-SECRET-KEY: <secret_key>
Content-Type: application/json
```

**Response Example**:
```json
{
  "assetId": "asset-uuid-12345",
  "overallScore": 95.5,
  "scoreBreakdown": {
    "accuracy": 98.0,
    "completeness": 95.0,
    "consistency": 94.0,
    "timeliness": 96.0,
    "uniqueness": 97.0,
    "validity": 94.5
  },
  "columnScores": [
    {
      "columnName": "USER_ID",
      "score": 99.0,
      "failingRules": 0
    },
    {
      "columnName": "EMAIL",
      "score": 92.0,
      "failingRules": 2
    },
    {
      "columnName": "CREATED_DATE",
      "score": 98.5,
      "failingRules": 0
    }
  ],
  "lastEvaluated": "2025-10-18T10:30:00Z"
}
```

**Score Interpretation**:
- **90-100%**: High reliability (Green indicator)
- **70-89%**: Medium reliability (Yellow indicator)
- **0-69%**: Low reliability (Red indicator)

**Use Cases**:
- Display overall report health score
- Show column-level badges in BI tool
- Identify problematic columns

#### 3. Alerts API

**Purpose**: Get active alerts for specific assets

**Endpoint**: 
```
GET /api/v1/alerts
```

**Parameters**:
- `assetIds` (query parameter, required): Comma-separated list of asset IDs
- `status` (query parameter, optional): OPEN, ACKNOWLEDGED, CLOSED (default: OPEN)
- `severity` (query parameter, optional): CRITICAL, HIGH, MEDIUM, LOW

**Request Example**:
```http
GET /api/v1/alerts?assetIds=asset-uuid-1,asset-uuid-2&status=OPEN&severity=HIGH
X-ACCESS-KEY: <access_key>
X-SECRET-KEY: <secret_key>
Content-Type: application/json
```

**Response Example**:
```json
{
  "alerts": [
    {
      "id": "alert-uuid-abc123",
      "title": "Data Quality Threshold Breached",
      "description": "Email column has 15% null values exceeding threshold of 5%",
      "severity": "HIGH",
      "status": "OPEN",
      "affectedAssets": [
        {
          "assetId": "asset-uuid-12345",
          "assetName": "USERS_TABLE",
          "columns": ["EMAIL"]
        }
      ],
      "policyName": "User Data Quality Policy",
      "failingRules": [
        {
          "ruleName": "Null Value Check",
          "ruleType": "COMPLETENESS",
          "threshold": 5.0,
          "actualValue": 15.0
        }
      ],
      "createdAt": "2025-10-18T09:15:00Z",
      "link": "https://adoc.acceldata.io/alerts/alert-uuid-abc123"
    },
    {
      "id": "alert-uuid-def456",
      "title": "Data Freshness Issue",
      "description": "Table has not been updated in 48 hours, exceeding SLA of 24 hours",
      "severity": "MEDIUM",
      "status": "OPEN",
      "affectedAssets": [
        {
          "assetId": "asset-uuid-12345",
          "assetName": "USERS_TABLE",
          "columns": []
        }
      ],
      "policyName": "Freshness SLA Policy",
      "failingRules": [
        {
          "ruleName": "Update Frequency Check",
          "ruleType": "TIMELINESS",
          "threshold": 24.0,
          "actualValue": 48.0
        }
      ],
      "createdAt": "2025-10-17T08:00:00Z",
      "link": "https://adoc.acceldata.io/alerts/alert-uuid-def456"
    }
  ]
}
```

**Alert Severity Levels**:
- **CRITICAL**: Immediate attention required, blocking issues
- **HIGH**: Important issues affecting data quality
- **MEDIUM**: Notable issues with moderate impact
- **LOW**: Minor issues for awareness

**Use Cases**:
- Display alert count in sidebar header
- Show alert details in expandable list
- Trigger browser notifications for new alerts

#### 4. Lineage API

**Purpose**: Get asset lineage information (upstream and downstream dependencies)

**Endpoint**: 
```
GET /api/v1/assets/{assetId}/lineage
```

**Parameters**:
- `assetId` (path parameter): UUID of the asset
- `direction` (query parameter, optional): UPSTREAM, DOWNSTREAM, BOTH (default: BOTH)
- `depth` (query parameter, optional): Number of levels to traverse (default: 2, max: 5)

**Request Example**:
```http
GET /api/v1/assets/asset-uuid-12345/lineage?direction=BOTH&depth=2
X-ACCESS-KEY: <access_key>
X-SECRET-KEY: <secret_key>
Content-Type: application/json
```

**Response Example**:
```json
{
  "assetId": "asset-uuid-12345",
  "lineage": {
    "upstream": [
      {
        "assetId": "source-asset-uuid-111",
        "assetName": "RAW_USERS",
        "assetType": "TABLE",
        "hasAlerts": false,
        "reliabilityScore": 98.0
      },
      {
        "assetId": "source-asset-uuid-222",
        "assetName": "USER_ACTIVITY_STREAM",
        "assetType": "TABLE",
        "hasAlerts": true,
        "reliabilityScore": 85.0
      }
    ],
    "downstream": [
      {
        "assetId": "report-asset-uuid-333",
        "assetName": "User Analytics Dashboard",
        "assetType": "POWERBI_DASHBOARD",
        "hasAlerts": true,
        "reliabilityScore": 92.0
      },
      {
        "assetId": "report-asset-uuid-444",
        "assetName": "Monthly User Report",
        "assetType": "POWERBI_REPORT",
        "hasAlerts": false,
        "reliabilityScore": 96.0
      }
    ]
  }
}
```

**Use Cases**:
- Visualize data flow in sidebar
- Identify root cause of quality issues
- Show impact analysis for affected reports

#### 5. PowerBI Specific API

**Purpose**: Get PowerBI-specific metadata and underlying asset mappings

**Endpoint**: 
```
GET /api/v1/bi-tools/powerbi/workspaces/{workspaceId}/reports/{reportId}
```

**Parameters**:
- `workspaceId` (path parameter): PowerBI workspace ID (GUID)
- `reportId` (path parameter): PowerBI report ID (GUID)

**Request Example**:
```http
GET /api/v1/bi-tools/powerbi/workspaces/12345678-1234-1234-1234-123456789abc/reports/87654321-4321-4321-4321-cba987654321
X-ACCESS-KEY: <access_key>
X-SECRET-KEY: <secret_key>
Content-Type: application/json
```

**Response Example**:
```json
{
  "reportId": "87654321-4321-4321-4321-cba987654321",
  "reportName": "Sales Dashboard",
  "workspaceName": "Analytics",
  "datasetId": "dataset-uuid-555",
  "underlyingAssets": [
    {
      "adocAssetId": "asset-uuid-12345",
      "tableName": "SALES_FACT",
      "columnUsage": ["REVENUE", "DATE", "REGION"],
      "reliabilityScore": 94.5,
      "openAlerts": 1
    },
    {
      "adocAssetId": "asset-uuid-67890",
      "tableName": "CUSTOMERS",
      "columnUsage": ["CUSTOMER_ID", "CUSTOMER_NAME", "SEGMENT"],
      "reliabilityScore": 98.0,
      "openAlerts": 0
    }
  ],
  "lastRefreshed": "2025-10-18T08:00:00Z"
}
```

**Use Cases**:
- Automatically map PowerBI report to underlying data assets
- Show all assets used by current report
- Display aggregated health score for entire report

### SDK Reference

ADOC provides a Java SDK that can serve as a reference for API usage patterns. While the Chrome extension will use REST APIs directly, reviewing the SDK documentation can provide insights into:
- API authentication patterns
- Common request/response structures
- Error handling approaches
- Rate limiting considerations

**SDK Documentation**: Available at `/api/v1/assets`, `/api/v1/policies`, `/api/v1/datasources`

### Rate Limiting

ADOC APIs implement rate limiting to ensure fair usage:
- **Default Limit**: 100 requests per minute per API key
- **Rate Limit Headers**: 
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Timestamp when limit resets

**Handling Rate Limits**:
1. Implement request queue in background worker
2. Monitor rate limit headers
3. When limit is reached, wait until reset time
4. Increase cache TTL temporarily to reduce API calls
5. Show user-friendly message if functionality is impacted

## Critical User Journeys (CUJs)

### CUJ 1: Installation and First Use
1. User installs extension from Chrome Web Store
2. Navigates to a PowerBI report
3. Clicks extension icon
4. Logs in with ADOC credentials
5. Panel opens and auto-populates with reliability scores

### CUJ 2: Alert Detection and Investigation
1. User views a Tableau dashboard
2. Expands sidebar to see "freshness" alert
3. Clicks alert to view root-cause details
4. Reviews pipeline delay information
5. Takes action without leaving BI tool

## Data Flow

```
BI Tool (PowerBI/Tableau/Looker)
    ↓
Content Script (detects context)
    ↓
Background Worker (caches context)
    ↓
ADOC API (fetches reliability data)
    ↓
Background Worker (processes response)
    ↓
Content Script (updates UI)
    ↓
Sidebar Panel (displays to user)
```

## PowerBI Integration Details

### Context Detection
```javascript
// URL Pattern: https://app.powerbi.com/groups/{workspaceId}/reports/{reportId}
const urlPattern = /\/groups\/([^\/]+)\/reports\/([^\/]+)/;
```

### Asset Mapping Flow
```
PowerBI Report
    ↓
PowerBI Semantic Model
    ↓
PowerBI Semantic Model Table
    ↓
Physical Data Asset (e.g., Snowflake Table)
    ↓
ADOC Asset
```

### PowerBI Asset Types
- POWERBI_WORKSPACE
- POWERBI_DATAFLOW
- POWERBI_SEMANTIC_MODEL
- POWERBI_SEMANTIC_MODEL_TABLE
- POWERBI_SEMANTIC_MODEL_COLUMN
- POWERBI_DATASOURCE
- POWERBI_REPORT
- POWERBI_DASHBOARD
- POWERBI_TILE
- POWERBI_PAGE

### Supported Physical Data Sources
- Snowflake
- Google BigQuery
- Databricks Unity Catalog
- Azure Synapse Analytics Dedicated Pool

## UI Components

### Sidebar Panel Structure
```
┌─────────────────────────────────┐
│ ADOC Data Reliability      [X]  │
├─────────────────────────────────┤
│ Overall Report Score: 94% 🟢    │
│                                 │
│ ⚠ 2 Active Alerts               │
│ ├─ HIGH: Null value threshold   │
│ └─ MEDIUM: Freshness delay      │
│                                 │
│ 📊 Asset Scores:                │
│ ├─ USERS_TABLE: 92% 🟡          │
│ ├─ SALES_FACT: 98% 🟢           │
│ └─ PRODUCTS: 89% 🟡             │
│                                 │
│ [View in ADOC] [Refresh]        │
└─────────────────────────────────┘
```

### Score Indicators
- 🟢 Green: High reliability (>90%)
- 🟡 Yellow: Medium reliability (70-90%)
- 🔴 Red: Low reliability (<70%)
- ⚠ Warning: Active alerts
- 🔔 Notification: New issues

### Alert Severity Levels
- **CRITICAL**: Immediate attention required
- **HIGH**: Important issues affecting data quality
- **MEDIUM**: Notable issues with moderate impact
- **LOW**: Minor issues for awareness

## Caching Strategy

### Session Storage (TTL: Session duration)
- Current page context
- Active dashboard/report info
- Current alert list
- Asset mappings

### Local Storage (TTL: 24 hours, configurable)
- User settings
- API credentials (encrypted)
- Asset metadata cache

### In-Memory Cache (TTL: 5 minutes, configurable)
- API response cache
- Pending requests

## Security Considerations

### Credential Storage
- Store API keys encrypted using Web Crypto API
- Never log credentials to console
- Use `chrome.storage.local` (not sync) for sensitive data
- Implement auto-logout after inactivity

### Content Security Policy
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### Data Privacy Principles
- Only collect necessary data
- Never send BI tool credentials to ADOC
- No telemetry without user consent
- Clear data on uninstall

## Error Handling

### Authentication Errors (401)
- Clear cached credentials
- Show notification with configuration link
- Redirect to options page

### Network Errors
- Show cached data with warning indicator
- Retry with exponential backoff
- Display offline mode message

### Asset Not Found
- Display "Asset not found in ADOC" badge
- Suggest asset may not be cataloged yet

### Rate Limiting
- Implement request queue
- Respect rate limit headers
- Show warning to user
- Increase cache TTL temporarily

## Performance Optimization

### Lazy Loading
- Load extension UI only when needed
- Defer non-critical API calls
- Use intersection observer for visible elements

### Debouncing & Throttling
- Debounce search/filter operations (300ms)
- Throttle scroll events (1000ms)

### Efficient DOM Manipulation
- Use document fragments for batch updates
- Minimize reflows and repaints
- Cache DOM queries
- Use event delegation

## Configuration Options

### ADOC Connection
- Server URL (e.g., https://adoc.acceldata.io)
- API Access Key
- API Secret Key
- Test Connection button

### Notification Preferences
- Enable browser notifications
- Alert severity threshold
- Notification frequency (Real-time, Hourly, Daily)
- Sound on/off

### Display Settings
- Show sidebar by default
- Badge position (left/right of field names)
- Color scheme (light/dark)
- Refresh interval (1, 5, 15, 30 minutes)

### BI Tool Specific
- Enable for PowerBI
- Enable for Tableau
- Enable for Looker
- Custom CSS overrides (advanced)

## Testing Requirements

### Unit Tests
- Framework: Jest
- Coverage: >80%
- Test: API client, authentication, data transformation, cache management, error handling

### Integration Tests
- Framework: Puppeteer or Playwright
- Test: Installation, configuration, API integration, BI tool interaction, cross-browser compatibility

### Manual Testing Checklist (per BI tool)
- [ ] Extension loads on tool
- [ ] Context correctly detected
- [ ] Asset mappings accurate
- [ ] Alerts display correctly
- [ ] Badges appear on columns
- [ ] Sidebar is functional
- [ ] Links to ADOC work
- [ ] Notifications appear
- [ ] Settings persist
- [ ] Performance is acceptable

## Deployment

### Chrome Web Store Requirements
- Developer account
- Privacy policy document
- Icons: 128x128, 48x48, 16x16
- Screenshots: 1280x800 or 640x400
- Promotional tile: 440x280
- Description and categories

### Version Management
- Semantic Versioning: MAJOR.MINOR.PATCH
- Changelog for each release
- Full test suite before release

### Update Strategy
- Auto-updates enabled by default
- Show changelog on major updates
- Preserve user settings
- Migrate data if schema changes

## Success Metrics

### Adoption Metrics
- Number of installations
- Daily active users (DAU)
- Monthly active users (MAU)
- User retention rate

### Usage Metrics
- API calls per user per day
- Average session duration
- Feature usage breakdown
- Alert interaction rate

### Performance Metrics
- Extension load time (<2s)
- API response time (<500ms)
- Cache hit rate (>80%)
- Error rate (<1%)

### User Satisfaction
- Chrome Web Store rating (target: >4.5/5)
- Support ticket volume
- Feature requests
- Bug reports

## Timeline

### Phase 1: PowerBI (4-6 weeks)
- Chrome Extension Development (Manifest V3)
- ADOC API Integration
- Sidebar Features
- Testing & Compliance
- Deployment to Chrome Web Store

### Phase 2: Tableau (6 weeks)
- Tableau-specific context detection
- Asset mapping for Tableau
- UI adjustments
- Testing and deployment

### Phase 3: Looker (6 weeks)
- Looker-specific integration
- Similar structure to Phase 2

## Project Team

### Key Contacts
- **Nitin Motgi**: nitin.motgi@acceldata.io
- **Ashok G**: ashok.gunasekaran@acceldata.io (Services Team Lead)

### Development Team
- Third-party vendor
- Acceldata services team

## In-Scope Deliverables

1. Chrome Extension Development (Manifest V3)
2. ADOC API Integration (OAuth 2.0, secure token storage)
3. Sidebar Features (collapsible panel, metrics, drill-down, customization)
4. Critical User Journeys implementation
5. Testing & Compliance (cross-browser validation, BI tool compatibility)
6. Deployment (Chrome Web Store packaging, documentation)

## Documentation Deliverables

### User Documentation
- Installation Guide
- User Manual
- Troubleshooting guide
- FAQ
- Video Tutorials

### Technical Documentation
- Architecture Document
- API Integration Guide
- Development Guide
- Contribution guidelines

## Support & Maintenance

### Issue Tracking
- Platform: JIRA (project EXT)
- Issues: EXT-1, ACR-1324

### Support Channels
- Email: support@acceldata.io
- Documentation: docs.acceldata.io
- Community forum (if available)

### Regular Maintenance Activities
- Monitor Chrome updates for compatibility
- Update dependencies
- Security patches
- Performance improvements
- API version updates

## Business Value Proposition

### Problem Statement
Data teams spend ~30% of their time troubleshooting reliability issues, often requiring switches between BI tools and observability platforms like ADOC, leading to:
- Delayed decisions
- Reduced trust in analytics
- Context-switching overhead

### Solution
Embed ADOC's end-to-end observability directly in the BI workflow, enabling:
- "Shift-left" reliability checks
- Early issue detection (e.g., schema drift via ADOC policies)
- Reduced troubleshooting time
- Increased data trust

### Competitive Position
Competitors (Monte Carlo, BigEye, Metaplane) offer similar BI integrations. ADOC extension should match or exceed their capabilities:
- **Monte Carlo**: Supports PowerBI, Tableau, Looker with lineage and DQ warnings
- **BigEye**: Tableau integration with popularity scores and lineage
- **Metaplane**: Multi-tool support with focus on alert notifications

## Known Constraints

### Permissions Required
```json
{
  "permissions": ["storage", "activeTab", "notifications"],
  "host_permissions": [
    "https://app.powerbi.com/*",
    "*://*.tableau.com/*",
    "*://*.looker.com/*",
    "*://*.cloud.looker.com/*",
    "*://*.acceldata.io/*"
  ]
}
```

### Browser Compatibility
- Target: Chrome 120+
- Manifest V3 only
- Graceful degradation for unsupported features

### BI Tool Policies
- Comply with BI vendor extension policies
- Tableau's sandboxed extensions
- PowerBI iframe restrictions
- Graceful fallbacks for unsupported tools

## Glossary

- **FQN**: Fully Qualified Name (e.g., DATABASE.SCHEMA.TABLE)
- **DQ**: Data Quality
- **BI**: Business Intelligence
- **Asset**: Any data entity tracked by ADOC (table, column, dashboard, etc.)
- **Policy**: Set of data quality rules applied to assets
- **Lineage**: Data flow from source to destination
- **Semantic Model**: PowerBI term for dataset (data source + transformations)
- **ADOC**: Acceldata Data Observability Cloud
- **CUJ**: Critical User Journey

## Next Steps for Development

1. Set up development environment
2. Implement PowerBI context detection
3. Build ADOC API client with authentication
4. Develop React-based sidebar UI
5. Implement asset mapping logic
6. Add alert notification system
7. Build configuration/options page
8. Implement caching strategy
9. Conduct unit and integration testing
10. Prepare Chrome Web Store submission
11. Deploy and monitor initial rollout

## Important Notes

- **Security First**: Always encrypt sensitive data, use HTTPS-only
- **Performance**: Target <2s load time, <500ms API response
- **User Experience**: Non-intrusive, contextual, actionable insights
- **Compliance**: Follow Chrome Web Store policies and BI vendor guidelines
- **Offline Support**: Graceful fallback to cached data when offline
- **Error Handling**: Comprehensive error handling with user-friendly messages

## References

- ADOC API Documentation: /api/v1/assets, /api/v1/policies, /api/v1/datasources
- Chrome Extension Manifest V3: https://developer.chrome.com/docs/extensions/mv3/
- PowerBI REST API: https://learn.microsoft.com/en-us/rest/api/power-bi/
- Tableau REST API: https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api.htm
- Looker API: https://developers.looker.com/api/explorer/4.0/
