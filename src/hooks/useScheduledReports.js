import { useState, useCallback } from 'react';

const INITIAL_SCHEDULED = [
  { id: 'sch-1', title: 'P&L — Haftalık', time: 'Pzt 09:00', receivers: '3 alıcı', status: 'Aktif' },
  { id: 'sch-2', title: 'Kanal — Aylık', time: "Ayın 1'i", receivers: '', status: 'Duraklatıldı' }
];

export function useScheduledReports() {
  const [scheduledReports, setScheduledReports] = useState(INITIAL_SCHEDULED);

  const addScheduledReport = useCallback((report) => {
    setScheduledReports(prev => [
      { ...report, id: `sch-${Date.now()}` },
      ...prev
    ]);
  }, []);

  const toggleReportStatus = useCallback((id) => {
    setScheduledReports(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, status: r.status === 'Aktif' ? 'Duraklatıldı' : 'Aktif' };
      }
      return r;
    }));
  }, []);

  return {
    scheduledReports,
    addScheduledReport,
    toggleReportStatus
  };
}
