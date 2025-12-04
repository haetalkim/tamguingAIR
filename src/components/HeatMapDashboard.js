import React, { useState } from 'react';
import { Info, ZoomIn, ZoomOut, Maximize2, Download, Share2 } from 'lucide-react';

const AQI_RANGES = {
  pm25: [
    { max: 12, label: 'Good', color: '#A7E8B1' },
    { max: 35, label: 'Moderate', color: '#FFF3B0' },
    { max: 55, label: 'Unhealthy (Sensitive)', color: '#FFD6A5' },
    { max: 150, label: 'Unhealthy', color: '#FFB8B8' },
    { max: Infinity, label: 'Very Unhealthy', color: '#DDA0DD' },
  ],
};

const getColorForValue = (value, metric = 'pm25') => {
  const ranges = AQI_RANGES[metric] || AQI_RANGES.pm25;
  for (let range of ranges) {
    if (value <= range.max) return range.color;
  }
  return ranges[ranges.length - 1].color;
};

const getStatusLabel = (value, metric = 'pm25') => {
  const ranges = AQI_RANGES[metric] || AQI_RANGES.pm25;
  for (let range of ranges) {
    if (value <= range.max) return range.label;
  }
  return ranges[ranges.length - 1].label;
};

// Sample location data
const LOCATIONS = [
  { id: 1, name: 'Upper Manhattan', lat: 40.8448, lng: -73.9388, pm25: 8, co: 0.3, temp: 68, humidity: 42 },
  { id: 2, name: 'Central Park', lat: 40.7829, lng: -73.9654, pm25: 12, co: 0.4, temp: 70, humidity: 45 },
  { id: 3, name: 'Midtown East', lat: 40.7549, lng: -73.9680, pm25: 22, co: 0.8, temp: 72, humidity: 55 },
  { id: 4, name: 'Midtown West', lat: 40.7580, lng: -73.9855, pm25: 20, co: 0.7, temp: 71, humidity: 52 },
  { id: 5, name: 'Chelsea', lat: 40.7465, lng: -73.9972, pm25: 18, co: 0.6, temp: 70, humidity: 50 },
  { id: 6, name: 'Greenwich Village', lat: 40.7336, lng: -74.0027, pm25: 15, co: 0.5, temp: 69, humidity: 48 },
  { id: 7, name: 'Lower Manhattan', lat: 40.7074, lng: -74.0113, pm25: 10, co: 0.4, temp: 68, humidity: 43 },
  { id: 8, name: 'East Village', lat: 40.7264, lng: -73.9818, pm25: 14, co: 0.5, temp: 69, humidity: 47 },
];

const StatusInfoModal = ({ isOpen, onClose, theme }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={`${theme.bg} text-white p-6 rounded-t-2xl`}>
          <h3 className="text-xl font-bold">Air Quality Index (AQI) Criteria</h3>
          <p className="text-sm opacity-90 mt-1">Understanding air quality status levels for PM 2.5</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {AQI_RANGES.pm25.slice(0, -1).map((range, idx) => {
              const prevMax = idx > 0 ? AQI_RANGES.pm25[idx - 1].max : 0;
              return (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200">
                  <div 
                    className="w-12 h-12 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: range.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{range.label}</h4>
                      <span className="text-sm font-semibold text-gray-600">
                        {prevMax + 1} - {range.max} µg/m³
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {idx === 0 && "Air quality is satisfactory, and air pollution poses little or no risk."}
                      {idx === 1 && "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution."}
                      {idx === 2 && "Members of sensitive groups may experience health effects. The general public is less likely to be affected."}
                      {idx === 3 && "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects."}
                      {idx === 4 && "Health alert: The risk of health effects is increased for everyone."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Source Attribution */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Source:</strong> U.S. Environmental Protection Agency (EPA). 
              <a href="https://www.airnow.gov/aqi/aqi-basics/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline ml-1">
                AirNow - Air Quality Index Basics
              </a>
            </p>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className={`w-full py-3 ${theme.bg} ${theme.hover} text-white font-semibold rounded-lg transition-colors`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const HeatMapDashboard = ({ selectedMetric, setSelectedMetric, filters, setFilters, theme, metricThemes }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showStatusInfo, setShowStatusInfo] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [selectedSession, setSelectedSession] = useState('latest');

  const sessions = [
    { id: 'latest', name: 'Latest Data' },
    { id: 'session-001', name: 'Morning Route A' },
    { id: 'session-002', name: 'Afternoon Route B' },
    { id: 'session-003', name: 'After Rain' },
    { id: 'session-004', name: 'Weekend Collection' }
  ];

  const locations = LOCATIONS;
  const avgValue = Math.round(
    locations.reduce((sum, loc) => sum + loc[selectedMetric], 0) / locations.length
  );

  const bestLocation = locations.reduce((best, loc) => 
    loc[selectedMetric] < best[selectedMetric] ? loc : best
  );
  
  const worstLocation = locations.reduce((worst, loc) => 
    loc[selectedMetric] > worst[selectedMetric] ? loc : worst
  );

  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 0.2, 2));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 0.2, 0.6));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Air Quality Heat Map</h1>
          <p className="text-gray-600">Real-time air quality monitoring across Manhattan</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button 
            onClick={() => alert('Export functionality coming soon')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Metric</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">View Session:</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sessions.map(session => (
                <option key={session.id} value={session.id}>{session.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(metricThemes).map(([key, metric]) => (
            <button 
              key={key} 
              onClick={() => setSelectedMetric(key)}
              className={`py-4 px-4 rounded-xl text-sm font-medium transition-all ${
                selectedMetric === key 
                  ? `${metric.bg} text-white shadow-lg scale-105` 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-lg font-bold">{metric.label}</div>
              <div className="text-xs opacity-90 mt-1">{metric.unit}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Map and Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Manhattan Air Quality Map</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={() => setZoomLevel(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Reset View"
              >
                <Maximize2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Map Container */}
          <div className="relative bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl overflow-hidden border-2 border-gray-200" style={{ height: '600px' }}>
            <div 
              className="w-full h-full transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg viewBox="0 0 400 800" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* Water/Hudson River */}
                <rect x="0" y="0" width="90" height="800" fill="#B3D9FF" opacity="0.3" />
                <rect x="250" y="0" width="150" height="800" fill="#B3D9FF" opacity="0.3" />
                
                {/* Manhattan Island - more detailed */}
                <path
                  d="M 130 20 
                     L 140 40 L 145 60 L 150 80 L 155 120 L 160 160
                     L 165 200 L 170 240 L 175 280 L 180 320 L 185 360
                     L 190 400 L 195 440 L 200 480 L 205 520 L 210 560
                     L 215 600 L 220 640 L 222 680 L 220 720 L 215 750
                     L 200 770 L 180 780 L 160 775 L 140 765 L 125 750
                     L 115 720 L 110 680 L 105 640 L 100 600 L 95 560
                     L 93 520 L 92 480 L 91 440 L 90 400 L 91 360
                     L 93 320 L 95 280 L 98 240 L 102 200 L 106 160
                     L 110 120 L 115 80 L 120 50 Z"
                  fill="#FAFAFA"
                  stroke="#D1D5DB"
                  strokeWidth="2"
                />
                
                {/* Street Grid Pattern */}
                {Array.from({ length: 15 }).map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1="90"
                    y1={100 + i * 45}
                    x2="230"
                    y2={100 + i * 45}
                    stroke="#E5E7EB"
                    strokeWidth="0.5"
                    opacity="0.5"
                  />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={100 + i * 18}
                    y1="50"
                    x2={100 + i * 18}
                    y2="750"
                    stroke="#E5E7EB"
                    strokeWidth="0.5"
                    opacity="0.5"
                  />
                ))}
                
                {/* Central Park */}
                <rect
                  x="115"
                  y="200"
                  width="80"
                  height="150"
                  fill="#A7E8B1"
                  opacity="0.4"
                  rx="5"
                />
                <text
                  x="155"
                  y="280"
                  textAnchor="middle"
                  fontSize="9"
                  fill="#059669"
                  fontWeight="600"
                >
                  Central Park
                </text>
                
                {/* Heat Map Data Points */}
                {locations.map((location) => {
                  // Convert lat/lng to SVG coordinates (simplified projection)
                  const x = 100 + ((location.lng + 74.02) * 2000);
                  const y = 750 - ((location.lat - 40.70) * 4000);
                  
                  const value = location[selectedMetric];
                  const color = getColorForValue(value);
                  const isHovered = hoveredLocation === location.id;
                  
                  return (
                    <g key={location.id}>
                      {/* Heat circle gradient */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 50 : 40}
                        fill={color}
                        opacity="0.5"
                        className="transition-all duration-200"
                      />
                      
                      {/* Data point marker */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 12 : 10}
                        fill="white"
                        stroke={color}
                        strokeWidth="3"
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredLocation(location.id)}
                        onMouseLeave={() => setHoveredLocation(null)}
                      />
                      
                      {/* Value label */}
                      <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        fontSize={isHovered ? "13" : "11"}
                        fontWeight="bold"
                        fill="#1F2937"
                        className="pointer-events-none transition-all duration-200"
                      >
                        {value}
                      </text>
                      
                      {/* Location label on hover */}
                      {isHovered && (
                        <g>
                          <rect
                            x={x - 60}
                            y={y - 45}
                            width="120"
                            height="28"
                            fill="white"
                            stroke={color}
                            strokeWidth="2"
                            rx="6"
                            className="animate-fade-in"
                          />
                          <text
                            x={x}
                            y={y - 32}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="600"
                            fill="#1F2937"
                          >
                            {location.name}
                          </text>
                          <text
                            x={x}
                            y={y - 20}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#6B7280"
                          >
                            {value} {metricThemes[selectedMetric].unit}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg p-4 shadow-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Air Quality Index</p>
              <div className="space-y-1">
                {AQI_RANGES.pm25.slice(0, 4).map((range, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div 
                      className="w-6 h-3 rounded"
                      style={{ backgroundColor: range.color }}
                    />
                    <span className="text-xs text-gray-600">{range.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scale indicator */}
            <div className="absolute bottom-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700">Zoom: {Math.round(zoomLevel * 100)}%</p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            * Click and drag to pan • Use zoom controls to explore • Hover over points for details
          </p>
        </div>

        {/* Stats Sidebar - 1 column */}
        <div className="space-y-4">
          {/* City Average */}
          <div 
            className="bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300" 
            style={{ borderColor: theme.primary }}
          >
            <p className="text-sm font-semibold text-gray-600 mb-2">CITY AVERAGE</p>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-5xl font-bold" style={{ color: theme.primary }}>{avgValue}</span>
              <span className="text-xl text-gray-600 mb-2">{metricThemes[selectedMetric].unit}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{ backgroundColor: getColorForValue(avgValue), color: "#1F2937" }}
              >
                {getStatusLabel(avgValue)}
              </span>
              <button
                onClick={() => setShowStatusInfo(true)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="View AQI criteria"
              >
                <Info className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Best Location */}
          <div 
            className="bg-gradient-to-br rounded-2xl p-6 shadow-lg border-2 transition-all duration-300"
            style={{ 
              background: `linear-gradient(135deg, ${getColorForValue(bestLocation[selectedMetric])}30 0%, white 100%)`,
              borderColor: getColorForValue(bestLocation[selectedMetric])
            }}
          >
            <p className="text-sm font-semibold text-gray-600 mb-2">BEST AREA</p>
            <p className="text-4xl font-bold text-green-600 mb-1">{bestLocation[selectedMetric]}</p>
            <p className="text-sm text-gray-700 font-medium">{bestLocation.name}</p>
            <p className="text-xs text-gray-500 mt-1">{metricThemes[selectedMetric].unit}</p>
          </div>

          {/* Worst Location */}
          <div 
            className="bg-gradient-to-br rounded-2xl p-6 shadow-lg border-2 transition-all duration-300"
            style={{ 
              background: `linear-gradient(135deg, ${getColorForValue(worstLocation[selectedMetric])}30 0%, white 100%)`,
              borderColor: getColorForValue(worstLocation[selectedMetric])
            }}
          >
            <p className="text-sm font-semibold text-gray-600 mb-2">NEEDS ATTENTION</p>
            <p className="text-4xl font-bold text-orange-600 mb-1">{worstLocation[selectedMetric]}</p>
            <p className="text-sm text-gray-700 font-medium">{worstLocation.name}</p>
            <p className="text-xs text-gray-500 mt-1">{metricThemes[selectedMetric].unit}</p>
          </div>

          {/* Active Stations */}
          <div 
            className="bg-gradient-to-br rounded-2xl p-6 shadow-lg border-2 transition-all duration-300"
            style={{ 
              background: `linear-gradient(135deg, ${theme.light} 0%, white 100%)`,
              borderColor: theme.primary
            }}
          >
            <p className="text-sm font-semibold text-gray-600 mb-2">ACTIVE STATIONS</p>
            <p className="text-4xl font-bold" style={{ color: theme.primary }}>{locations.length}</p>
            <p className="text-sm text-gray-700 font-medium">Monitoring locations</p>
          </div>
        </div>
      </div>

      {/* Status Info Modal */}
      <StatusInfoModal 
        isOpen={showStatusInfo} 
        onClose={() => setShowStatusInfo(false)} 
        theme={theme}
      />
    </div>
  );
};

export default HeatMapDashboard;