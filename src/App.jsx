import { useState, useEffect } from 'react'
import './App.css'

const ACORN_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const ACORN_BLUE = '#0060df';
const ACORN_BG = '#fbfbfb';
const ACORN_TEXT = '#202124';
const ACORN_BORDER = '#e0e0e0';

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
    <div
      style={{
        fontFamily: ACORN_FONT,
        background: ACORN_BG,
        color: ACORN_TEXT,
        minHeight: '100vh',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
        border: `1.5px solid ${ACORN_BORDER}`,
        maxWidth: 700,
        margin: '0 auto',
      }}
    >
      <h1 style={{ color: ACORN_BLUE, fontWeight: 700, fontSize: '2rem', marginBottom: 8 }}>Hera Log</h1>
      <div style={{ marginTop: 30 }}>
        <h2 style={{ color: ACORN_TEXT, fontWeight: 600, fontSize: '1.2rem', marginBottom: 12 }}>Overlay Responses</h2>
        <button
          onClick={exportCSV}
          style={{
            marginBottom: 16,
            padding: '8px 20px',
            fontSize: 15,
            borderRadius: 6,
            border: `1.5px solid ${ACORN_BLUE}`,
            background: ACORN_BLUE,
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, border 0.2s',
            outline: 'none',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#0053ba')}
          onMouseOut={e => (e.currentTarget.style.background = ACORN_BLUE)}
          onFocus={e => (e.currentTarget.style.outline = `2px solid ${ACORN_BLUE}`)}
          onBlur={e => (e.currentTarget.style.outline = 'none')}
        >
          Export as CSV
        </button>
        {heraLog.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>No entries yet.</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '15px',
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <thead>
              <tr style={{ background: '#f4f7fb' }}>
                <th style={{ border: `1.5px solid ${ACORN_BORDER}`, padding: '8px', color: ACORN_BLUE, fontWeight: 700 }}>Date/Time</th>
                <th style={{ border: `1.5px solid ${ACORN_BORDER}`, padding: '8px', color: ACORN_BLUE, fontWeight: 700 }}>Text</th>
                <th style={{ border: `1.5px solid ${ACORN_BORDER}`, padding: '8px', color: ACORN_BLUE, fontWeight: 700 }}>Energy</th>
                <th style={{ border: `1.5px solid ${ACORN_BORDER}`, padding: '8px', color: ACORN_BLUE, fontWeight: 700 }}>Pleasantness</th>
                <th style={{ border: `1.5px solid ${ACORN_BORDER}`, padding: '8px', color: ACORN_BLUE, fontWeight: 700 }}>URL</th>
              </tr>
            </thead>
            <tbody>
              {heraLog.map((entry, idx) => (
                <tr
                  key={idx}
                  style={{
                    background: idx % 2 === 0 ? '#f9fafb' : 'white',
                    borderBottom: `1px solid ${ACORN_BORDER}`,
                  }}
                >
                  <td style={{ border: `1.5px solid ${ACORN_BORDER}`, padding: '8px', wordBreak: 'break-word' }}>{formatDate(entry.timestamp)}</td>
                  <td style={{ border: `1.5px solid ${ACORN_BORDER}`, padding: '8px', wordBreak: 'break-word' }}>{entry.text}</td>
                  <td style={{ border: `1.5px solid ${ACORN_BORDER}`, padding: '8px', wordBreak: 'break-word' }}>{entry.energy}</td>
                  <td style={{ border: `1.5px solid ${ACORN_BORDER}`, padding: '8px', wordBreak: 'break-word' }}>{entry.pleasantness}</td>
                  <td style={{ border: `1.5px solid ${ACORN_BORDER}`, padding: '8px', wordBreak: 'break-all' }}>{entry.url}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}

export default App
