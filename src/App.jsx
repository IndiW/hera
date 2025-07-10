import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [heraLog, setHeraLog] = useState([])

  useEffect(() => {
    // Load log from browser.storage.local
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
      browser.storage.local.get('hera_log').then((result) => {
        if (Array.isArray(result.hera_log)) {
          setHeraLog(result.hera_log.slice().reverse()) // newest first
        }
      })
    }
  }, [])

  function exportCSV() {
    if (!heraLog.length) return;
    const header = ['Date/Time', 'Text', 'Energy', 'Pleasantness', 'URL'];
    const rows = heraLog.map(entry => [
      formatDate(entry.timestamp),
      escapeCSV(entry.text),
      escapeCSV(entry.energy),
      escapeCSV(entry.pleasantness),
      escapeCSV(entry.url)
    ]);
    const csvContent = [header, ...rows]
      .map(row => row.join(','))
      .join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hera_log.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  function escapeCSV(val) {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  return (
    <>
      <h1>Hera Log</h1>
      <div style={{ marginTop: 30 }}>
        <h2>Overlay Responses</h2>
        <button onClick={exportCSV} style={{ marginBottom: 10, padding: '6px 16px', fontSize: 14, borderRadius: 6, border: '1px solid #888', cursor: 'pointer' }}>
          Export as CSV
        </button>
        {heraLog.length === 0 ? (
          <p>No entries yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '4px' }}>Date/Time</th>
                <th style={{ border: '1px solid #ccc', padding: '4px' }}>Text</th>
                <th style={{ border: '1px solid #ccc', padding: '4px' }}>Energy</th>
                <th style={{ border: '1px solid #ccc', padding: '4px' }}>Pleasantness</th>
                <th style={{ border: '1px solid #ccc', padding: '4px' }}>URL</th>
              </tr>
            </thead>
            <tbody>
              {heraLog.map((entry, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #ccc', padding: '4px' }}>{formatDate(entry.timestamp)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px' }}>{entry.text}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px' }}>{entry.energy}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px' }}>{entry.pleasantness}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px', wordBreak: 'break-all' }}>{entry.url}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}

export default App
