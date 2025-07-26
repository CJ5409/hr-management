import React, { useEffect, useState } from 'react';
import axios from 'axios';

const JobseekerDashboard: React.FC<{ userData: any; messages: any[] }> = ({ userData, messages }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const fetchApplications = async () => {
    const res = await axios.get('/api/applications');
    setApplications(res.data.filter((a: any) => a.applicantEmail === userData.email));
  };

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const fetchAuditTrail = async (appId: number) => {
    const res = await axios.get(`/api/applications/${appId}/audit`);
    setAuditTrail(res.data);
  };

  const fetchNotes = (app: any) => {
    setNotes(app.notes || []);
  };

  const handleWithdraw = async (appId: number) => {
    await axios.patch(`/api/applications/${appId}`, { status: 'withdrawn' });
    fetchApplications();
  };

  const handleAddNote = async (appId: number) => {
    if (!noteInput.trim()) return;
    await axios.post(`/api/applications/${appId}/notes`, { note: noteInput, author: userData.email });
    setNoteInput('');
    fetchApplications();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 font-inter">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">My Applications</h1>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer" 
              onClick={() => {
                // Direct navigation bypassing React Router completely
                window.location.href = '/jobs';
              }}
            >
              <i className="fas fa-briefcase mr-2"></i>Browse Jobs
            </button>
            <a 
              href="/jobs" 
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer text-sm"
              target="_blank"
            >
              <i className="fas fa-external-link-alt mr-2"></i>Jobs (New Tab)
            </a>
            <button 
              type="button"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer text-sm"
              onClick={() => {
                // Emergency direct navigation
                window.open('/jobs', '_blank');
              }}
            >
              <i className="fas fa-external-link-alt mr-2"></i>EMERGENCY Jobs
            </button>
            <button className="relative" onClick={() => setNotifOpen(o => !o)}>
              <i className="fas fa-bell text-xl text-primary"></i>
              {messages.length > 0 && <span className="absolute -top-2 -right-2 bg-danger text-white text-xs rounded-full px-1.5 py-0.5">{messages.length}</span>}
            </button>
          </div>
        </div>
        {notifOpen && (
          <div className="absolute right-8 top-16 w-80 bg-white rounded-xl shadow-lg p-4 z-50">
            <h2 className="text-lg font-bold mb-2">Notifications</h2>
            {messages.length === 0 ? <div className="text-gray-400">No notifications</div> : (
              <ul className="space-y-2">
                {messages.map((msg, i) => (
                  <li key={i} className="text-sm text-gray-800 border-b last:border-b-0 pb-2">
                    <span className="font-semibold">{msg.sender}:</span> {msg.message}
                    <div className="text-xs text-gray-400">{msg.timestamp}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          {applications.length === 0 ? (
            <div className="text-center text-gray-400">No applications yet.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td className="px-4 py-2 text-sm">{app.jobId}</td>
                    <td className="px-4 py-2 text-sm">{app.status}</td>
                    <td className="px-4 py-2 text-sm">
                      <button className="text-primary hover:underline mr-2" onClick={() => { setSelectedApp(app); fetchAuditTrail(app.id); fetchNotes(app); }}>View</button>
                      {app.status === 'pending' && <button className="text-danger hover:underline" onClick={() => handleWithdraw(app.id)}>Withdraw</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Application Details Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Application Details</h2>
                <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
              </div>
              <div className="mb-2"><b>Job:</b> {selectedApp.jobId}</div>
              <div className="mb-2"><b>Status:</b> {selectedApp.status}</div>
              <div className="mb-2"><b>Applied:</b> {new Date(selectedApp.createdAt).toLocaleDateString()}</div>
              <div className="mb-4"><b>Notes:</b>
                <ul className="list-disc ml-5 text-sm">
                  {notes.map((n, i) => <li key={i}><b>{n.author}:</b> {n.note} <span className="text-xs text-gray-400">({new Date(n.time).toLocaleString()})</span></li>)}
                </ul>
                <div className="flex mt-2">
                  <input className="flex-1 border rounded px-2 py-1 mr-2" value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Add a note..." />
                  <button className="bg-primary text-white px-3 py-1 rounded" onClick={() => handleAddNote(selectedApp.id)}>Add</button>
                </div>
              </div>
              <div className="mb-4"><b>Audit Trail:</b>
                <ul className="list-disc ml-5 text-xs">
                  {auditTrail.map((a, i) => <li key={i}><b>{a.action}</b> by {a.author} at {new Date(a.time).toLocaleString()} {a.details && <span>- {JSON.stringify(a.details)}</span>}</li>)}
                </ul>
              </div>
              <button className="mt-2 px-4 py-2 bg-gray-200 rounded" onClick={() => setSelectedApp(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobseekerDashboard; 