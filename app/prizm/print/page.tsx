'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '../store';
import { getScheduleForDay, DAY_LABELS, EVENT_DATES } from '../data/schedule';
import { getPlayerById } from '../data/players';
import { getStationById } from '../data/stations';
import { Printer, ArrowLeft, FileText, Calendar, Users, Phone } from 'lucide-react';

type PrintType = 'daily' | 'full' | 'stations' | 'pr-calls';

export default function PrintPage() {
  const { schedule } = useAppStore();
  const [selectedDay, setSelectedDay] = useState<string>(EVENT_DATES[0]);
  const [printType, setPrintType] = useState<PrintType>('daily');
  const [showPreview, setShowPreview] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getDaySchedule = (date: string) => {
    return getScheduleForDay(schedule, date).filter(
      (slot) => slot.status === 'scheduled' && slot.startTime !== '00:00'
    );
  };

  const getPRCalls = () => {
    return schedule
      .filter((slot) => slot.station === 'prCall' && slot.prCallInfo && slot.status === 'scheduled')
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
  };

  const getStationSchedule = (stationId: string) => {
    return schedule
      .filter((slot) => slot.station === stationId && slot.status === 'scheduled' && slot.startTime !== '00:00')
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#9CA3AF]">Loading...</div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="print-preview">
        {/* Print Header */}
        <div className="no-print fixed top-0 left-0 right-0 bg-[#0D0D0D] text-white p-4 flex items-center justify-between z-50">
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-2 text-[#9CA3AF] hover:text-white"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFD100] text-black font-medium rounded-lg"
          >
            <Printer size={20} />
            Print
          </button>
        </div>

        <div className="pt-16">
          {/* Daily Schedule */}
          {printType === 'daily' && (
            <>
              <h1>Prizm Lounge Production Schedule</h1>
              <h2>{DAY_LABELS[selectedDay]} - {selectedDay}</h2>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>Time</th>
                    <th>Player</th>
                    <th style={{ width: '120px' }}>Team</th>
                    <th style={{ width: '100px' }}>Station</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {getDaySchedule(selectedDay).map((slot) => {
                    const player = getPlayerById(slot.playerId);
                    const station = getStationById(slot.station);
                    return (
                      <tr key={slot.id}>
                        <td style={{ fontWeight: 500 }}>
                          {formatTime(slot.startTime)}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {player?.name || slot.playerId}
                        </td>
                        <td style={{ color: '#666' }}>
                          {player?.team} • {player?.position}
                        </td>
                        <td>
                          <span className={`print-badge print-badge-${slot.station}`}>
                            {station?.name}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.875rem', color: '#666' }}>
                          {slot.prCallInfo && (
                            <span>
                              {slot.prCallInfo.outlet}
                              {slot.prCallInfo.callIn && ` (${slot.prCallInfo.callIn})`}
                            </span>
                          )}
                          {slot.notes && !slot.prCallInfo && slot.notes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#999', textAlign: 'center' }}>
                Generated {new Date().toLocaleString()} • Prizm Lounge Production Hub
              </div>
            </>
          )}

          {/* Full Event Schedule */}
          {printType === 'full' && (
            <>
              <h1>Prizm Lounge - Complete Event Schedule</h1>
              <h2>Super Bowl LX • February 6-8, 2026</h2>
              {EVENT_DATES.map((date) => (
                <div key={date} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>
                    {DAY_LABELS[date]}
                  </h3>
                  <table style={{ marginBottom: '1rem' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Time</th>
                        <th>Player</th>
                        <th style={{ width: '100px' }}>Station</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getDaySchedule(date).map((slot) => {
                        const player = getPlayerById(slot.playerId);
                        const station = getStationById(slot.station);
                        return (
                          <tr key={slot.id}>
                            <td>{formatTime(slot.startTime)}</td>
                            <td>{player?.name} ({player?.position})</td>
                            <td>{station?.name}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </>
          )}

          {/* PR Calls Sheet */}
          {printType === 'pr-calls' && (
            <>
              <h1>PR Call Schedule</h1>
              <h2>Media Interviews - Prizm Lounge</h2>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>Day</th>
                    <th style={{ width: '80px' }}>Time</th>
                    <th>Player</th>
                    <th>Outlet</th>
                    <th>Contact</th>
                    <th style={{ width: '120px' }}>Call-In #</th>
                  </tr>
                </thead>
                <tbody>
                  {getPRCalls().map((slot) => {
                    const player = getPlayerById(slot.playerId);
                    return (
                      <tr key={slot.id}>
                        <td>{DAY_LABELS[slot.date]?.slice(0, 3)}</td>
                        <td style={{ fontWeight: 500 }}>{formatTime(slot.startTime)}</td>
                        <td style={{ fontWeight: 600 }}>{player?.name}</td>
                        <td>{slot.prCallInfo?.outlet}</td>
                        <td style={{ color: '#666' }}>{slot.prCallInfo?.contact || '—'}</td>
                        <td style={{ fontFamily: 'monospace' }}>{slot.prCallInfo?.callIn || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}

          {/* Station Schedule */}
          {printType === 'stations' && (
            <>
              <h1>Station Rotation Sheets</h1>
              <h2>Prizm Lounge • Super Bowl LX</h2>
              {['ledWall', 'signing', 'packRip', 'prCall'].map((stationId) => {
                const station = getStationById(stationId as 'ledWall' | 'signing' | 'packRip' | 'prCall');
                const stationSchedule = getStationSchedule(stationId);
                return (
                  <div key={stationId} style={{ marginBottom: '2rem', pageBreakAfter: 'always' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {station?.icon} {station?.name}
                    </h3>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>Day</th>
                          <th style={{ width: '80px' }}>Time</th>
                          <th>Player</th>
                          <th style={{ width: '100px' }}>Team</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stationSchedule.map((slot) => {
                          const player = getPlayerById(slot.playerId);
                          return (
                            <tr key={slot.id}>
                              <td>{DAY_LABELS[slot.date]?.slice(0, 3)}</td>
                              <td>{formatTime(slot.startTime)}</td>
                              <td style={{ fontWeight: 500 }}>{player?.name}</td>
                              <td style={{ color: '#666' }}>{player?.team}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/prizm/schedule" className="text-[#9CA3AF] hover:text-white">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold text-white">Print Schedules</h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Print Type Selection */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Select Print Type</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPrintType('daily')}
              className={`p-4 rounded-xl border text-left transition-all ${
                printType === 'daily'
                  ? 'bg-[#FFD100]/10 border-[#FFD100] text-white'
                  : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#9CA3AF] hover:border-[#FFD100]/50'
              }`}
            >
              <Calendar className="w-6 h-6 mb-2" />
              <div className="font-medium">Daily Schedule</div>
              <div className="text-sm opacity-70">Single day view</div>
            </button>

            <button
              onClick={() => setPrintType('full')}
              className={`p-4 rounded-xl border text-left transition-all ${
                printType === 'full'
                  ? 'bg-[#FFD100]/10 border-[#FFD100] text-white'
                  : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#9CA3AF] hover:border-[#FFD100]/50'
              }`}
            >
              <FileText className="w-6 h-6 mb-2" />
              <div className="font-medium">Full Event</div>
              <div className="text-sm opacity-70">All 3 days</div>
            </button>

            <button
              onClick={() => setPrintType('stations')}
              className={`p-4 rounded-xl border text-left transition-all ${
                printType === 'stations'
                  ? 'bg-[#FFD100]/10 border-[#FFD100] text-white'
                  : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#9CA3AF] hover:border-[#FFD100]/50'
              }`}
            >
              <Users className="w-6 h-6 mb-2" />
              <div className="font-medium">Station Sheets</div>
              <div className="text-sm opacity-70">Per-station rotations</div>
            </button>

            <button
              onClick={() => setPrintType('pr-calls')}
              className={`p-4 rounded-xl border text-left transition-all ${
                printType === 'pr-calls'
                  ? 'bg-[#FFD100]/10 border-[#FFD100] text-white'
                  : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#9CA3AF] hover:border-[#FFD100]/50'
              }`}
            >
              <Phone className="w-6 h-6 mb-2" />
              <div className="font-medium">PR Call Sheet</div>
              <div className="text-sm opacity-70">Media contacts</div>
            </button>
          </div>
        </div>

        {/* Day Selection (for daily print) */}
        {printType === 'daily' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Select Day</h2>
            <div className="flex gap-2">
              {EVENT_DATES.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDay(date)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    selectedDay === date
                      ? 'bg-[#FFD100] text-black'
                      : 'bg-[#1A1A1A] text-[#9CA3AF] hover:bg-[#2A2A2A]'
                  }`}
                >
                  {DAY_LABELS[date]?.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview Stats */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
          <h3 className="text-white font-medium mb-2">Preview Info</h3>
          <div className="text-[#9CA3AF] text-sm space-y-1">
            {printType === 'daily' && (
              <>
                <p>Day: {DAY_LABELS[selectedDay]}</p>
                <p>Slots: {getDaySchedule(selectedDay).length} scheduled</p>
              </>
            )}
            {printType === 'full' && (
              <p>Total Slots: {EVENT_DATES.reduce((sum, d) => sum + getDaySchedule(d).length, 0)}</p>
            )}
            {printType === 'pr-calls' && (
              <p>PR Calls: {getPRCalls().length} scheduled</p>
            )}
            {printType === 'stations' && (
              <p>4 station sheets will be generated</p>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => setShowPreview(true)}
          className="w-full py-4 bg-[#FFD100] text-black font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#FFD100]/90 transition-colors"
        >
          <Printer size={20} />
          Generate Print Preview
        </button>
      </div>
    </div>
  );
}
