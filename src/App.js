import React, { useState } from "react";
import HeatMapDashboard from "./components/HeatMapDashboard";
import RawDataView from "./components/RawDataView";
import AnalysisView from "./components/AnalysisView";
import MyPage from "./components/MyPage";
import { MapPin, Table, BarChart3, User } from "lucide-react";

// Metric configurations with colors
const METRIC_THEMES = {
  pm25: {
    label: 'PM 2.5',
    unit: 'µg/m³',
    key: 'pm25',
    primary: '#3B82F6', // blue
    light: '#DBEAFE',
    gradient: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  co: {
    label: 'CO',
    unit: 'ppm',
    key: 'co',
    primary: '#8B5CF6', // purple
    light: '#EDE9FE',
    gradient: 'from-purple-500 to-purple-700',
    bg: 'bg-purple-600',
    hover: 'hover:bg-purple-700',
    text: 'text-purple-600',
    border: 'border-purple-200'
  },
  temp: {
    label: 'Temperature',
    unit: '°F',
    key: 'temp',
    primary: '#EF4444', // red
    light: '#FEE2E2',
    gradient: 'from-red-500 to-red-700',
    bg: 'bg-red-600',
    hover: 'hover:bg-red-700',
    text: 'text-red-600',
    border: 'border-red-200'
  },
  humidity: {
    label: 'Humidity',
    unit: '%',
    key: 'humidity',
    primary: '#10B981', // green
    light: '#D1FAE5',
    gradient: 'from-green-500 to-green-700',
    bg: 'bg-green-600',
    hover: 'hover:bg-green-700',
    text: 'text-green-600',
    border: 'border-green-200'
  }
};

export default function App() {
  const [activeSection, setActiveSection] = useState("heatmap");
  const [selectedMetric, setSelectedMetric] = useState("pm25");
  const [filters, setFilters] = useState({
    country: "US",
    state: "NY",
    school: "MTN12",
    group: "G4",
    studentId: "STU003",
  });

  const currentTheme = METRIC_THEMES[selectedMetric];

  const navItems = [
    { id: 'heatmap', label: 'Heat Map', icon: MapPin },
    { id: 'rawdata', label: 'Raw Data', icon: Table },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'mypage', label: 'My Page', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <button
              type="button"
              onClick={() => setActiveSection('heatmap')}
              className="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"
              aria-label="Go to Heat Map"
            >
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                AIR <span className="font-normal text-gray-400">@</span>
                <span className="text-blue-600">TAMGU</span>
              </h1>
            </button>

            {/* Main Navigation */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeSection === item.id
                        ? `bg-blue-600 text-white shadow-lg`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-gray-900">{filters.studentId}</p>
                <p className="text-xs text-gray-500">{filters.school} - Group {filters.group.replace('G', '')}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{filters.studentId.slice(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeSection === 'heatmap' && (
          <HeatMapDashboard
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            filters={filters}
            setFilters={setFilters}
            theme={currentTheme}
            metricThemes={METRIC_THEMES}
          />
        )}
        {activeSection === 'rawdata' && (
          <RawDataView
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            filters={filters}
            theme={currentTheme}
            metricThemes={METRIC_THEMES}
          />
        )}
        {activeSection === 'analysis' && (
          <AnalysisView
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            filters={filters}
            theme={currentTheme}
            metricThemes={METRIC_THEMES}
          />
        )}
        {activeSection === 'mypage' && (
          <MyPage
            filters={filters}
            setFilters={setFilters}
            theme={currentTheme}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-600">
          <p>&copy; 2025 AIR@TAMGU. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}