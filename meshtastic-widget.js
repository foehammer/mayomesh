/**
 * Meshtastic Telemetry Widget
 * Embeddable component for displaying Meshtastic telemetry data
 * 
 * Usage:
 * 1. Include the CSS and JS files in your page
 * 2. Add a container div with id="meshtastic-telemetry"
 * 3. Initialize with: new MeshtasticWidget('meshtastic-telemetry', 'https://your-worker-url')
 */

class MeshtasticWidget {
    constructor(containerId, workerUrl, options = {}) {
        this.containerId = containerId;
        this.workerUrl = workerUrl;
        this.options = {
            autoRefresh: options.autoRefresh !== false, // default true
            refreshInterval: options.refreshInterval || 60, // seconds
            defaultTimeRange: options.defaultTimeRange || 24, // hours
            showControls: options.showControls !== false, // default true
            maxNodes: options.maxNodes || 20,
            title: options.title || '🛰️ Meshtastic Telemetry',
            ...options
        };
        
        this.refreshTimer = null;
        this.isLoading = false;
        this.container = null;
        
        this.init();
    }

    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`MeshtasticWidget: Container with id "${this.containerId}" not found`);
            return;
        }
        
        this.render();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    render() {
        this.container.innerHTML = `
            <div class="meshtastic-widget">
                <h2>${this.options.title}</h2>
                
                ${this.options.showControls ? this.renderControls() : ''}
                
                <div class="widget-status">
                    <div class="status-item">
                        <div class="label">Active Nodes</div>
                        <div class="value" id="${this.containerId}-nodeCount">-</div>
                    </div>
                    <div class="status-item">
                        <div class="label">Last Update</div>
                        <div class="value" id="${this.containerId}-lastUpdate">-</div>
                    </div>
                    <div class="status-item">
                        <div class="label">Status</div>
                        <div class="value" id="${this.containerId}-status">Connecting...</div>
                    </div>
                </div>
                
                <div id="${this.containerId}-error" class="error" style="display: none;"></div>
                <div id="${this.containerId}-loading" class="loading" style="display: none;">Loading telemetry data...</div>
                <div id="${this.containerId}-noData" class="no-data" style="display: none;">
                    <h4>No telemetry data available</h4>
                    <p>Waiting for Meshtastic nodes to report...</p>
                </div>
                <div id="${this.containerId}-nodes" class="nodes-container"></div>
            </div>
        `;
    }

    renderControls() {
        return `
            <div class="widget-controls">
                <div class="control-group">
                    <label for="${this.containerId}-refreshInterval">Auto-refresh:</label>
                    <select id="${this.containerId}-refreshInterval">
                        <option value="0">Manual</option>
                        <option value="30">30 seconds</option>
                        <option value="60" ${this.options.refreshInterval === 60 ? 'selected' : ''}>1 minute</option>
                        <option value="300">5 minutes</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="${this.containerId}-timeRange">Time Range:</label>
                    <select id="${this.containerId}-timeRange">
                        <option value="1">Last 1 hour</option>
                        <option value="6">Last 6 hours</option>
                        <option value="24" ${this.options.defaultTimeRange === 24 ? 'selected' : ''}>Last 24 hours</option>
                        <option value="168">Last 7 days</option>
                    </select>
                </div>
                <button id="${this.containerId}-refreshBtn" class="refresh-btn">🔄 Refresh</button>
            </div>
        `;
    }

    setupEventListeners() {
        if (this.options.showControls) {
            const refreshBtn = document.getElementById(`${this.containerId}-refreshBtn`);
            const refreshInterval = document.getElementById(`${this.containerId}-refreshInterval`);
            const timeRange = document.getElementById(`${this.containerId}-timeRange`);
            
            refreshBtn?.addEventListener('click', () => this.fetchTelemetryData());
            refreshInterval?.addEventListener('change', () => this.startAutoRefresh());
            timeRange?.addEventListener('change', () => this.fetchTelemetryData());
        }
    }

    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        let interval = this.options.refreshInterval;
        
        if (this.options.showControls) {
            const refreshIntervalEl = document.getElementById(`${this.containerId}-refreshInterval`);
            if (refreshIntervalEl) {
                interval = parseInt(refreshIntervalEl.value);
            }
        }

        if (interval > 0) {
            this.refreshTimer = setInterval(() => {
                if (!this.isLoading) {
                    this.fetchTelemetryData();
                }
            }, interval * 1000);
        }

        // Initial fetch
        this.fetchTelemetryData();
    }

    async fetchTelemetryData() {
        if (!this.workerUrl) {
            this.showError('Worker URL not configured');
            return;
        }

        this.isLoading = true;
        this.updateLoadingState(true);
        this.clearError();

        try {
            let hours = this.options.defaultTimeRange;
            
            if (this.options.showControls) {
                const timeRangeEl = document.getElementById(`${this.containerId}-timeRange`);
                if (timeRangeEl) {
                    hours = timeRangeEl.value;
                }
            }

            const response = await fetch(`${this.workerUrl}/api/telemetry?hours=${hours}&limit=${this.options.maxNodes}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.displayTelemetryData(data);
            this.updateStatus('Connected', data.nodes.length);

        } catch (error) {
            this.showError(`Failed to fetch telemetry: ${error.message}`);
            this.updateStatus('Error', 0);
        } finally {
            this.isLoading = false;
            this.updateLoadingState(false);
        }
    }

    displayTelemetryData(data) {
        const nodesContainer = document.getElementById(`${this.containerId}-nodes`);
        const noDataContainer = document.getElementById(`${this.containerId}-noData`);
        
        if (!data.nodes || data.nodes.length === 0) {
            noDataContainer.style.display = 'block';
            nodesContainer.innerHTML = '';
            return;
        }

        noDataContainer.style.display = 'none';
        nodesContainer.innerHTML = '';

        data.nodes.forEach(node => {
            const nodeCard = this.createNodeCard(node);
            nodesContainer.appendChild(nodeCard);
        });
    }

    createNodeCard(node) {
        const card = document.createElement('div');
        card.className = 'node-card';
        
        const timeAgo = this.getTimeAgo(new Date(node.timestamp));
        
        card.innerHTML = `
            <div class="node-header">
                <div class="node-id">${node.node_id}</div>
                <div class="node-time">${timeAgo}</div>
            </div>
            
            ${this.renderMetricsSection('Device Metrics', node.device_metrics, {
                batteryLevel: { label: 'Battery', unit: '%' },
                voltage: { label: 'Voltage', unit: 'V', decimals: 2 },
                channelUtilization: { label: 'Channel Util', unit: '%', decimals: 1 },
                airUtilTx: { label: 'Air Util TX', unit: '%', decimals: 1 },
                uptimeSeconds: { label: 'Uptime', formatter: this.formatUptime }
            })}
            
            ${this.renderMetricsSection('Environment Metrics', node.environment_metrics, {
                temperature: { label: 'Temperature', unit: '°C', decimals: 1 },
                relativeHumidity: { label: 'Humidity', unit: '%', decimals: 1 },
                barometricPressure: { label: 'Pressure', unit: ' hPa', decimals: 2 }
            })}
        `;
        
        return card;
    }

    renderMetricsSection(title, metrics, config) {
        if (!metrics || Object.keys(metrics).length === 0) {
            return '';
        }

        const metricItems = Object.entries(metrics)
            .filter(([key, value]) => value !== undefined && value !== null && config[key])
            .map(([key, value]) => {
                const cfg = config[key];
                let displayValue;
                
                if (cfg.formatter) {
                    displayValue = cfg.formatter(value);
                } else {
                    const decimals = cfg.decimals || 0;
                    displayValue = Number(value).toFixed(decimals) + (cfg.unit || '');
                }
                
                return `
                    <div class="metric-item">
                        <div class="metric-label">${cfg.label}</div>
                        <div class="metric-value">${displayValue}</div>
                    </div>
                `;
            }).join('');

        return metricItems ? `
            <div class="metrics-section">
                <div class="metrics-title">${title}</div>
                <div class="metrics-grid">
                    ${metricItems}
                </div>
            </div>
        ` : '';
    }

    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        return `${Math.floor(diffMinutes / 1440)}d ago`;
    }

    updateStatus(status, nodeCount) {
        const statusEl = document.getElementById(`${this.containerId}-status`);
        const nodeCountEl = document.getElementById(`${this.containerId}-nodeCount`);
        const lastUpdateEl = document.getElementById(`${this.containerId}-lastUpdate`);
        
        if (statusEl) statusEl.textContent = status;
        if (nodeCountEl) nodeCountEl.textContent = nodeCount;
        if (lastUpdateEl) lastUpdateEl.textContent = new Date().toLocaleTimeString();
    }

    updateLoadingState(isLoading) {
        const loadingEl = document.getElementById(`${this.containerId}-loading`);
        const refreshBtn = document.getElementById(`${this.containerId}-refreshBtn`);
        
        if (loadingEl) {
            loadingEl.style.display = isLoading ? 'block' : 'none';
        }
        
        if (refreshBtn) {
            refreshBtn.disabled = isLoading;
            refreshBtn.textContent = isLoading ? '🔄 Loading...' : '🔄 Refresh';
        }
    }

    showError(message) {
        const errorEl = document.getElementById(`${this.containerId}-error`);
        if (errorEl) {
            errorEl.innerHTML = `<strong>Error:</strong> ${message}`;
            errorEl.style.display = 'block';
        }
    }

    clearError() {
        const errorEl = document.getElementById(`${this.containerId}-error`);
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }

    // Public methods for external control
    refresh() {
        this.fetchTelemetryData();
    }

    destroy() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    updateWorkerUrl(newUrl) {
        this.workerUrl = newUrl;
        this.fetchTelemetryData();
    }
}

// Auto-initialize if data attributes are present
document.addEventListener('DOMContentLoaded', function() {
    const containers = document.querySelectorAll('[data-meshtastic-worker]');
    containers.forEach(container => {
        const workerUrl = container.getAttribute('data-meshtastic-worker');
        const options = {};
        
        // Parse data attributes for options
        if (container.hasAttribute('data-refresh-interval')) {
            options.refreshInterval = parseInt(container.getAttribute('data-refresh-interval'));
        }
        if (container.hasAttribute('data-time-range')) {
            options.defaultTimeRange = parseInt(container.getAttribute('data-time-range'));
        }
        if (container.hasAttribute('data-title')) {
            options.title = container.getAttribute('data-title');
        }
        if (container.hasAttribute('data-max-nodes')) {
            options.maxNodes = parseInt(container.getAttribute('data-max-nodes'));
        }
        if (container.hasAttribute('data-show-controls')) {
            options.showControls = container.getAttribute('data-show-controls') !== 'false';
        }
        
        new MeshtasticWidget(container.id, workerUrl, options);
    });
});