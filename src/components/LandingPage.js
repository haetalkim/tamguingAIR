import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Calendar, MapPin, Users, User, Map } from 'lucide-react';

const LandingPage = ({ selectedMetric, setSelectedMetric, reflection, setReflection }) => {
  const [selectedView, setSelectedView] = useState('my');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedDay, setSelectedDay] = useState(null);
  const [showReflection, setShowReflection] = useState(false);

  // Sample data for the week
  const weekData = [
    { day: 'Mon', date: 'Nov 4', pm25: 12, co: 0.4, temp: 68, humidity: 45, aqi: 'Good', color: '#A7E8B1' },
    { day: 'Tue', date: 'Nov 5', pm25: 8, co: 0.3, temp: 70, humidity: 42, aqi: 'Good', color: '#A7E8B1' },
    { day: 'Wed', date: 'Nov 6', pm25: 15, co: 0.5, temp: 72, humidity: 50, aqi: 'Good', color: '#A7E8B1' },
    { day: 'Thu', date: 'Nov 7', pm25: 22, co: 0.7, temp: 71, humidity: 55, aqi: 'Moderate', color: '#FFF3B0' },
    { day: 'Fri', date: 'Nov 8', pm25: 18, co: 0.6, temp: 69, humidity: 48, aqi: 'Good', color: '#A7E8B1' },
    { day: 'Sat', date: 'Nov 9', pm25: 9, co: 0.3, temp: 67, humidity: 40, aqi: 'Good', color: '#A7E8B1' },
    { day: 'Sun', date: 'Nov 10', pm25: 7, co: 0.2, temp: 68, humidity: 38, aqi: 'Good', color: '#A7E8B1' }
  ];

  const avgPM25 = Math.round(weekData.reduce((sum, d) => sum + d.pm25, 0) / weekData.length);
  const lastWeekAvg = 9;
  const trend = avgPM25 - lastWeekAvg;
  const overallAQI = avgPM25 <= 12 ? 'Good' : avgPM25 <= 35 ? 'Moderate' : 'Unhealthy';
  const overallColor = avgPM25 <= 12 ? '#A7E8B1' : avgPM25 <= 35 ? '#FFF3B0' : '#FFD6A5';

  const getEmoji = (aqi) => {
    if (aqi === 'Good') return '😊';
    if (aqi === 'Moderate') return '😐';
    return '😷';
  };

  const getMetricData = () =>
    weekData.map((d) => ({
      day: d.day,
      value: d[selectedMetric],
      date: d.date,
    }));

  const getMetricLabel = () => {
    const labels = {
      pm25: 'PM 2.5 (µg/m³)',
      co: 'CO (ppm)',
      temp: 'Temperature (°F)',
      humidity: 'Humidity (%)',
    };
    return labels[selectedMetric];
  };

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Air Quality</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="px-6 py-6">
        <div
          className="bg-white rounded-3xl p-6 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${overallColor}15 0%, white 100%)`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Avg PM 2.5 This Week</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-gray-900">{avgPM25}</span>
                <span className="text-lg text-gray-500">µg/m³</span>
              </div>
            </div>
            <div className="text-5xl">{getEmoji(overallAQI)}</div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: overallColor, color: "#1F2937" }}
            >
              {overallAQI}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              {trend < 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">{Math.abs(trend)} lower</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-600">{trend} higher</span>
                </>
              )}
              <span>than last week</span>
            </div>
          </div>

          <p className="text-xs text-gray-400">Updated 3 min ago</p>
        </div>
      </div>

      {/* Metric Toggle */}
      <div className="px-6 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: "pm25", label: "PM 2.5" },
            { key: "co", label: "CO" },
            { key: "temp", label: "Temp" },
            { key: "humidity", label: "Humidity" },
          ].map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedMetric === metric.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reflection Card */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">💭</span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Daily Reflection
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Why do you think air quality was {avgPM25 > lastWeekAvg ? "higher" : "lower"} this week?
              </p>
              {showReflection ? (
                <div>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Type your thoughts here..."
                    className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                    rows="3"
                  />
                  <button
                    onClick={() => setShowReflection(false)}
                    className="mt-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowReflection(true)}
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Reflection
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;