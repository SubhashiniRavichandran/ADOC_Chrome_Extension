/**
 * ADOC API Client
 * Handles all communication with ADOC Data Observability Cloud APIs
 */

class AdocApiClient {
  constructor(baseUrl, accessKey, secretKey) {
    // Remove trailing slash from baseUrl to avoid double slashes
    // Default to indiumtech.acceldata.app with catalog-server API path
    this.baseUrl = (baseUrl || 'https://indiumtech.acceldata.app').replace(/\/+$/, '');
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.requestQueue = [];
    this.rateLimitRemaining = 100;
    this.rateLimitReset = null;
    // API base path is /catalog-server/api (not /api/v1)
    this.apiBasePath = '/catalog-server/api';
  }

  /**
   * Make an authenticated request to ADOC API
   * @param {string} endpoint - API endpoint path (relative to apiBasePath)
   * @param {object} options - Fetch options
   * @returns {Promise<object>} - API response
   */
  async makeRequest(endpoint, options = {}) {
    // Check rate limiting
    if (this.rateLimitRemaining <= 0 && this.rateLimitReset) {
      const now = Date.now();
      if (now < this.rateLimitReset) {
        const waitTime = this.rateLimitReset - now;
        console.warn(`Rate limit reached. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Build full URL: baseUrl + apiBasePath + endpoint
    const url = `${this.baseUrl}${this.apiBasePath}${endpoint}`;

    // Build headers - only add Content-Type for POST/PUT/PATCH requests
    const method = (options.method || 'GET').toUpperCase();
    const headers = {
      'accessKey': this.accessKey,
      'secretkey': this.secretKey,
      'Accept': 'application/json, text/plain, */*',
      ...options.headers
    };

    // Only add Content-Type for requests with body
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      console.log('ADOC API Request:', url);

      const response = await fetch(url, {
        ...options,
        headers
      });

      console.log('Response Status:', response.status, response.statusText);
      console.log('Response Content-Type:', response.headers.get('content-type'));

      // Update rate limit info from response headers
      this.updateRateLimitInfo(response);

      if (!response.ok) {
        // Get error message from response body
        const errorText = await response.text();
        console.error('Error response body:', errorText);

        if (response.status === 401) {
          throw new Error('Authentication failed. Please check your API credentials.');
        } else if (response.status === 406) {
          throw new Error(`Not Acceptable (406): ${errorText}. Check API endpoint or headers.`);
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 404) {
          throw new Error('Resource not found.');
        } else {
          throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', contentType);
        console.error('Response body (first 500 chars):', text.substring(0, 500));
        throw new Error(`Server returned ${contentType} instead of JSON. Check API endpoint.`);
      }

      return await response.json();
    } catch (error) {
      console.error('ADOC API request failed:', error);
      throw error;
    }
  }

  /**
   * Update rate limit information from response headers
   */
  updateRateLimitInfo(response) {
    const limitRemaining = response.headers.get('X-RateLimit-Remaining');
    const limitReset = response.headers.get('X-RateLimit-Reset');

    if (limitRemaining !== null) {
      this.rateLimitRemaining = parseInt(limitRemaining, 10);
    }

    if (limitReset !== null) {
      this.rateLimitReset = parseInt(limitReset, 10) * 1000; // Convert to milliseconds
    }
  }

  /**
   * Search for assets by name or FQN
   * @param {string} query - Search query (asset name or FQN)
   * @param {string} assetType - Optional asset type filter
   * @param {string} dataSourceType - Optional data source type filter
   * @returns {Promise<object>} - Search results
   */
  async searchAssets(query, assetType = null, dataSourceType = null) {
    let endpoint = `/assets/search?query=${encodeURIComponent(query)}`;

    if (assetType) {
      endpoint += `&assetType=${assetType}`;
    }

    if (dataSourceType) {
      endpoint += `&dataSourceType=${dataSourceType}`;
    }

    return this.makeRequest(endpoint);
  }

  /**
   * Get asset by Fully Qualified Name
   * @param {string} fullyQualifiedName - FQN of the asset
   * @returns {Promise<object>} - Asset details
   */
  async getAssetByFQN(fullyQualifiedName) {
    return this.searchAssets(fullyQualifiedName);
  }

  /**
   * Get reliability score for an asset
   * @param {string} assetId - UUID of the asset
   * @returns {Promise<object>} - Reliability score data
   */
  async getReliabilityScore(assetId) {
    return this.makeRequest(`/assets/${assetId}/reliability`);
  }

  /**
   * Get active alerts for specific assets
   * @param {string[]} assetIds - Array of asset UUIDs
   * @param {string} severity - Optional severity filter (CRITICAL, HIGH, MEDIUM, LOW)
   * @param {string} status - Alert status (default: OPEN)
   * @returns {Promise<object>} - Alerts data
   */
  async getAlerts(assetIds, severity = null, status = 'OPEN') {
    let endpoint = `/alerts?assetIds=${assetIds.join(',')}&status=${status}`;

    if (severity) {
      endpoint += `&severity=${severity}`;
    }

    return this.makeRequest(endpoint);
  }

  /**
   * Get lineage information for an asset
   * @param {string} assetId - UUID of the asset
   * @param {string} direction - UPSTREAM, DOWNSTREAM, or BOTH
   * @param {number} depth - Number of levels to traverse (max 5)
   * @returns {Promise<object>} - Lineage data
   */
  async getLineage(assetId, direction = 'BOTH', depth = 2) {
    return this.makeRequest(
      `/assets/${assetId}/lineage?direction=${direction}&depth=${depth}`
    );
  }

  /**
   * Get PowerBI-specific metadata
   * @param {string} workspaceId - PowerBI workspace ID (GUID)
   * @param {string} reportId - PowerBI report ID (GUID)
   * @returns {Promise<object>} - PowerBI metadata and asset mappings
   */
  async getPowerBIReport(workspaceId, reportId) {
    return this.makeRequest(
      `/bi-tools/powerbi/workspaces/${workspaceId}/reports/${reportId}`
    );
  }

  /**
   * Test API connection and credentials
   * @returns {Promise<boolean>} - True if connection successful
   */
  async testConnection() {
    try {
      // Try a simple search to validate credentials
      await this.searchAssets('test', 'TABLE');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Acknowledge an alert
   * @param {string} alertId - UUID of the alert
   * @returns {Promise<object>} - Updated alert
   */
  async acknowledgeAlert(alertId) {
    return this.makeRequest(`/alerts/${alertId}/acknowledge`, {
      method: 'POST'
    });
  }

  /**
   * Get asset metadata
   * @param {string} assetId - UUID of the asset
   * @returns {Promise<object>} - Asset metadata
   */
  async getAssetMetadata(assetId) {
    return this.makeRequest(`/assets/${assetId}`);
  }

  /**
   * Batch get reliability scores for multiple assets
   * @param {string[]} assetIds - Array of asset UUIDs
   * @returns {Promise<object[]>} - Array of reliability scores
   */
  async batchGetReliabilityScores(assetIds) {
    const promises = assetIds.map(id => this.getReliabilityScore(id));
    return Promise.all(promises);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdocApiClient;
}
