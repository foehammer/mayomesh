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
                <div class="control-group">
                    <label><input type="checkbox" id="${this.containerId}-showViewshed" checked> Show viewshed</label>
                </div>
                <div class="control-group">
                    <label for="${this.containerId}-viewshedLimit">Viewshed max (km):</label>
                    <input id="${this.containerId}-viewshedLimit" type="number" min="1" max="100" value="${this.options.viewshedLimitKm || 100}" style="width:80px" />
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

    getProtocolBadge(source) {
        if (!source) return '';
        const isMeshCore = source.toLowerCase().includes('meshcore');
        const label = isMeshCore ? 'MeshCore' : 'Meshtastic';
        const cls = isMeshCore ? 'protocol-badge protocol-badge--meshcore' : 'protocol-badge protocol-badge--meshtastic';
        return `<span class="${cls}">${label}</span>`;
    }

    createNodeCard(node) {
        const card = document.createElement('div');
        card.className = 'node-card';

        const timeAgo = this.getTimeAgo(new Date(node.timestamp));
        const protocolBadge = this.getProtocolBadge(node.source);

        const hasPos = node.position && node.position.latitude && node.position.longitude;

        card.innerHTML = `
            <div class="node-header">
                <div class="node-header-left">
                    <div class="node-name">${node.node_name || node.node_id}</div>
                    ${protocolBadge}
                </div>
                <div class="node-time">${timeAgo}</div>
                <div class="node-id-sub">${node.node_id}</div>
            </div>

            ${this.renderMetricsSection('Device Metrics', node.device_metrics, {
                batteryLevel: { label: 'Battery', unit: '%' },
                voltage: { label: 'Voltage', unit: 'V', decimals: 2 },
                channelUtilization: { label: 'Channel Util', unit: '%', decimals: 1 },
                airUtilTx: { label: 'Air Util TX', unit: '%', decimals: 1 },
                uptimeSeconds: { label: 'Uptime', formatter: this.formatUptime },
                snr: { label: 'SNR', unit: ' dB', decimals: 2 },
                rssi: { label: 'RSSI', unit: ' dBm' },
                noiseFloor: { label: 'Noise Floor', unit: ' dBm' }
            })}

            ${this.renderMetricsSection('Environment Metrics', node.environment_metrics, {
                temperature: { label: 'Temperature', unit: '°C', decimals: 1 },
                relativeHumidity: { label: 'Humidity', unit: '%', decimals: 1 },
                barometricPressure: { label: 'Pressure', unit: ' hPa', decimals: 2 }
            })}

            ${hasPos ? `
                <div class="metrics-section">
                    <div class="metrics-title">Position</div>
                    <button class="location-badge" data-node-id="${node.node_id}">
                        📍 <span class="loc-coords">${Number(node.position.latitude).toFixed(5)}, ${Number(node.position.longitude).toFixed(5)}</span>
                        ${node.position.altitude ? `· ${node.position.altitude}m` : ''}
                        <span style="opacity:0.6;font-size:0.9em;">— View map</span>
                    </button>
                </div>
            ` : ''}
        `;

        if (hasPos) {
            card.querySelector('.location-badge').addEventListener('click', () => {
                this.showLocationModal(node);
            });
        }

        return card;
    }

    // Render a metrics section (defensive: returns '' if no metrics)
    renderMetricsSection(title, metrics, fields) {
        if (!metrics || typeof metrics !== 'object' || Object.keys(metrics).length === 0) return '';

        let rows = '';
        for (const key of Object.keys(fields)) {
            const cfg = fields[key] || {};
            const raw = metrics[key];

            if (raw === undefined || raw === null) continue;

            let display = '';
            try {
                if (cfg.formatter && typeof cfg.formatter === 'function') {
                    display = cfg.formatter.call(this, raw);
                } else if (typeof raw === 'number' && typeof cfg.decimals === 'number') {
                    display = raw.toFixed(cfg.decimals);
                } else {
                    display = String(raw);
                }
            } catch (e) {
                display = String(raw);
            }

            const unit = cfg.unit || '';
            // produce table row markup to preserve table-cell layout
            rows += `<tr class="metric-row"><td class="metric-key">${cfg.label || key}</td><td class="metric-val">${display}${unit}</td></tr>`;
        }

        if (!rows) return '';

        return `
            <div class="metrics-section">
                <div class="metrics-title">${title}</div>
                <table class="metrics-table">
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    // --- Leaflet loader + map + viewshed helpers ---
    ensureLeafletLoaded() {
        if (window.L && window.L.map) return Promise.resolve();
        if (this._leafletLoadPromise) return this._leafletLoadPromise;

        this._leafletLoadPromise = new Promise((resolve, reject) => {
            // Load CSS
            const cssHref = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            if (!document.querySelector(`link[href="${cssHref}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssHref;
                document.head.appendChild(link);
            }

            // Load JS
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Leaflet'));
            document.head.appendChild(script);
        });

        return this._leafletLoadPromise;
    }

    initNodeMap(node, mapId) {
        try {
            const lat = Number(node.position.latitude);
            const lon = Number(node.position.longitude);
            if (!isFinite(lat) || !isFinite(lon)) return;

            const map = L.map(mapId, { zoomControl: true, attributionControl: true }).setView([lat, lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            const marker = L.circleMarker([lat, lon], { radius: 7, fillColor: '#2a9df4', color: '#fff', weight: 2, fillOpacity: 0.9 })
                .bindPopup(node.node_name || node.node_id)
                .addTo(map);

            // Read max range control if present in the widget controls
            const limitEl = document.getElementById(`${this.containerId}-viewshedLimit`);
            const userLimitKm = limitEl ? Number(limitEl.value) : (this.options.viewshedLimitKm || 100);
            const userLimitMeters = (isFinite(userLimitKm) && userLimitKm > 0) ? userLimitKm * 1000 : 100000;

            const viewshedMeters = this.computeViewshedRadiusMeters(1.7);
            const radiusMeters = Math.min(viewshedMeters, userLimitMeters, 100000);

            const viewshedCircle = L.circle([lat, lon], {
                radius: radiusMeters,
                color: '#ff8800',
                weight: 1,
                fillColor: '#ffcc88',
                fillOpacity: 0.15
            });

            const showViewshedEl = document.getElementById(`${this.containerId}-showViewshed`);
            const applyViewshed = () => {
                if (!showViewshedEl || showViewshedEl.checked) {
                    if (!map.hasLayer(viewshedCircle)) viewshedCircle.addTo(map);
                } else {
                    if (map.hasLayer(viewshedCircle)) map.removeLayer(viewshedCircle);
                }
            };
            applyViewshed();
            showViewshedEl?.addEventListener('change', () => applyViewshed());

            limitEl?.addEventListener('change', () => {
                const newLimitKm = Number(limitEl.value) || 100;
                const newRadius = Math.min(this.computeViewshedRadiusMeters(1.7), newLimitKm * 1000, 100000);
                viewshedCircle.setRadius(newRadius);
                try { if (map.hasLayer(viewshedCircle)) map.fitBounds(viewshedCircle.getBounds(), { maxZoom: 12, padding: [10, 10] }); } catch(e){}
            });

            if (!this._maps) this._maps = {};
            this._maps[mapId] = { map, marker, viewshedCircle };

            try {
                map.fitBounds(viewshedCircle.getBounds(), { maxZoom: 13, padding: [10, 10] });
            } catch (e) {}

        } catch (e) {
            console.error('initNodeMap error', e);
        }
    }

    computeViewshedRadiusMeters(heightMeters = 1.7) {
        // Approximate radio horizon formula:
        // d_km ≈ 3.57 * (sqrt(h_tx_m) + sqrt(h_rx_m))
        // assume receiver at same height (1.7 m)
        const hTx = Number(heightMeters) || 1.7;
        const hRx = 1.7;
        const dKm = 3.57 * (Math.sqrt(hTx) + Math.sqrt(hRx));
        return Math.min(dKm * 1000, 100000);
    }

    showLocationModal(node) {
        // Remove any existing modal
        const existing = document.getElementById('mesh-location-modal');
        if (existing) existing.remove();

        const lat = Number(node.position.latitude);
        const lon = Number(node.position.longitude);
        const alt = node.position.altitude ? `${node.position.altitude} m` : '—';
        const name = node.node_name || node.node_id;
        const modalId = 'mesh-modal-map-' + Math.random().toString(36).slice(2);

        const overlay = document.createElement('div');
        overlay.id = 'mesh-location-modal';
        overlay.className = 'mesh-modal-overlay';
        overlay.innerHTML = `
            <div class="mesh-modal" role="dialog" aria-modal="true" aria-label="Node location">
                <div class="mesh-modal-header">
                    <div>
                        <div class="mesh-modal-title">📍 ${name}</div>
                        <div class="mesh-modal-subtitle">${node.node_id}</div>
                    </div>
                    <button class="mesh-modal-close" aria-label="Close">✕</button>
                </div>
                <div id="${modalId}" class="mesh-modal-map"></div>
                <div class="mesh-modal-footer">
                    <div class="coord-item">
                        <span class="coord-label">Latitude</span>
                        <span class="coord-val">${lat.toFixed(6)}</span>
                    </div>
                    <div class="coord-item">
                        <span class="coord-label">Longitude</span>
                        <span class="coord-val">${lon.toFixed(6)}</span>
                    </div>
                    <div class="coord-item">
                        <span class="coord-label">Altitude</span>
                        <span class="coord-val">${alt}</span>
                    </div>
                </div>
            </div>
        `;

        const close = () => overlay.remove();
        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
        overlay.querySelector('.mesh-modal-close').addEventListener('click', close);
        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
        });

        document.body.appendChild(overlay);

        this.ensureLeafletLoaded().then(() => {
            this.initNodeMap(node, modalId);
        }).catch(err => console.error('Leaflet load failed', err));
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