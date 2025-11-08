import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Filter, X, Download, Link as LinkIcon,
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown
} from 'lucide-react';

const METRICS = {
  pm25: { label: 'PM 2.5', unit: 'µg/m³', key: 'pm25' },
  co: { label: 'CO', unit: 'ppm', key: 'co' },
  temp: { label: 'Temperature', unit: '°F', key: 'temp' },
  humidity: { label: 'Humidity', unit: '%', key: 'humidity' }
};

const AQI_RANGES = {
  pm25: [
    { max: 12, label: 'Good', color: '#A7E8B1' },
    { max: 35, label: 'Moderate', color: '#FFF3B0' },
    { max: 55, label: 'Unhealthy (Sensitive)', color: '#FFD6A5' },
    { max: 150, label: 'Unhealthy', color: '#FFB8B8' },
    { max: Infinity, label: 'Very Unhealthy', color: '#DDA0DD' },
  ],
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const getColorForValue = (value, metric = 'pm25') => {
  const ranges = AQI_RANGES[metric] || AQI_RANGES.pm25;
  for (let range of ranges) {
    if (value <= range.max) return range.color;
  }
  return ranges[ranges.length - 1].color;
};

const getAQILabel = (value) => {
  for (let range of AQI_RANGES.pm25) {
    if (value <= range.max) return range.label;
  }
  return 'Very Unhealthy';
};

const generateCalendarData = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendar = [];
  let week = new Array(7).fill(null);

  for (let i = 0; i < startingDayOfWeek; i++) {
    week[i] = null;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = (startingDayOfWeek + day - 1) % 7;
    const pm25 = Math.floor(Math.random() * 25) + 3;
    const co = (Math.random() * 0.8 + 0.2).toFixed(2);
    const temp = Math.floor(Math.random() * 15) + 60;
    const humidity = Math.floor(Math.random() * 30) + 35;

    week[dayOfWeek] = {
      day,
      pm25,
      co: parseFloat(co),
      temp,
      humidity,
      date: new Date(year, month, day),
    };

    if (dayOfWeek === 6 || day === daysInMonth) {
      calendar.push([...week]);
      week = new Array(7).fill(null);
    }
  }

  return calendar;
};

const Dashboard = ({ reflection, setReflection }) => {
  const [selectedView, setSelectedView] = useState('my');
  const [selectedMetric, setSelectedMetric] = useState('pm25');
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showReflection, setShowReflection] = useState(false);

  const [filters, setFilters] = useState({
    country: 'US',
    state: 'NY',
    school: 'MTN12',
    group: 'G4',
    studentId: 'STU003',
  });

  const today = new Date();
  const calendarData = generateCalendarData(currentYear, currentMonth);
  const allDaysData = calendarData.flat().filter((d) => d !== null);
  const avgValue = Math.round(
    allDaysData.reduce((sum, d) => sum + d[selectedMetric], 0) / allDaysData.length
  );

  const getFullId = () => `${filters.country}-${filters.state}-${filters.school}-${filters.group}-${filters.studentId}`;
  const getViewLabel = () => (
    selectedView === 'my' ? `${filters.studentId} (You)` :
    selectedView === 'team' ? `${filters.group} (Your Group)` :
    `${filters.school} (Your School)`
  );

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  const handleDownloadData = () => alert('Data download will be implemented');
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  // Weekly data for line chart
  const weekData = [
    { day: 'Mon', value: 10 },
    { day: 'Tue', value: 12 },
    { day: 'Wed', value: 15 },
    { day: 'Thu', value: 20 },
    { day: 'Fri', value: 17 },
    { day: 'Sat', value: 13 },
    { day: 'Sun', value: 11 },
  ];

  const trend = avgValue - 12;
  const trendIcon = trend >= 0 ? <TrendingUp className="w-4 h-4 text-orange-600" /> : <TrendingDown className="w-4 h-4 text-green-600" />;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">TAMGU: Air 1.0</h1>
          <button onClick={() => setShowFilters(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-xs text-gray-500">{getViewLabel()}</p>
      </div>

      {/* INFO CARD */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ background: `linear-gradient(135deg, ${getColorForValue(avgValue)}20 0%, white 100%)` }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">STATION NAME</p>
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                {filters.school} - Group {filters.group.replace('G', '')}
              </h2>
              <div className="space-y-1 text-xs">
                <p className="text-gray-600">SENSOR: Government-PM2.5</p>
                <p className="text-gray-600">LAST UPDATE: 22:00 Nov 5 2025</p>
              </div>
            </div>

            <div className="rounded-xl p-4 text-center min-w-[100px]" style={{ backgroundColor: getColorForValue(avgValue) }}>
              <p className="text-xs text-gray-700 mb-1">Avg for {MONTHS[currentMonth].slice(0,3)}</p>
              <p className="text-4xl font-bold text-gray-900">{avgValue}</p>
              <p className="text-xs text-gray-700 mt-1">{METRICS[selectedMetric].unit}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleCopyLink} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50">
              <LinkIcon className="w-4 h-4" /> COPY LINK
            </button>
            <button onClick={handleDownloadData} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 rounded-lg text-xs text-white hover:bg-blue-700">
              <Download className="w-4 h-4" /> DOWNLOAD DATA
            </button>
          </div>
        </div>
      </div>

      {/* METRIC SELECTOR */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700">SELECT METRIC</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(METRICS).map(([key, metric]) => (
              <button key={key} onClick={() => setSelectedMetric(key)}
                className={`py-2 rounded-lg text-xs font-medium ${selectedMetric === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {metric.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* WEEKLY CHART */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{METRICS[selectedMetric].label} Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weekData}>
              <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: '12px' }} tickLine={false} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <h3 className="text-base font-bold text-gray-900">{MONTHS[currentMonth]} {currentYear}</h3>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">{day}</div>)}
          </div>
          <div className="space-y-1">
            {calendarData.map((week, i) => (
              <div key={i} className="grid grid-cols-7 gap-1">
                {week.map((d, idx) => (
                  <div key={idx} className="aspect-square relative">
                    {d && (
                      <div className="w-full h-full rounded-lg flex flex-col items-center justify-center" style={{ backgroundColor: getColorForValue(d[selectedMetric]) }}>
                        <span className="text-xs text-gray-700">{d.day}</span>
                        <span className="text-sm font-semibold text-gray-900">{Math.round(d[selectedMetric])}</span>
                        {d.date.toDateString() === today.toDateString() && (
                          <div className="absolute bottom-1 w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REFLECTION CARD */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">💭</span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Weekly Reflection</h3>
              <p className="text-xs text-gray-600 mb-3">
                Why do you think air quality was {trend > 0 ? 'higher' : 'lower'} this week?
              </p>
              {showReflection ? (
                <div>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Type your thoughts here..."
                    className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 resize-none"
                    rows="3"
                  />
                  <button
                    onClick={() => {
                      setShowReflection(false);
                      alert('Reflection saved!');
                    }}
                    className="mt-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                  >
                    Save Note
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowReflection(true)}
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                >
                  Add Reflection
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EDUCATIONAL FACT */}
      <div className="px-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Did you know?</h3>
              <p className="text-xs text-blue-800">
                PM 2.5 particles are 30× smaller than a human hair — they can travel deep into your lungs and enter your bloodstream.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS MODAL */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50" onClick={() => setShowFilters(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-1">Your ID</p>
              <p className="text-sm font-mono text-blue-900">{getFullId()}</p>
            </div>
            <button onClick={() => setShowFilters(false)} className="w-full mt-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;