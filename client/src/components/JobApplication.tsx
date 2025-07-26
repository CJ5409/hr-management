import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Job {
  id: number;
  title: string;
}

const translations = {
  en: {
    applyTitle: 'Apply for',
    name: 'Name',
    email: 'Email',
    cv: 'Upload CV',
    submit: 'Submit Application',
    success: 'Application submitted successfully!',
    error: 'Please fill all fields and upload your CV.',
    orLoginWith: 'Or login with',
  },
  zh: {
    applyTitle: '申请职位',
    name: '姓名',
    email: '邮箱',
    cv: '上传简历',
    submit: '提交申请',
    success: '申请提交成功！',
    error: '请填写所有字段并上传简历。',
    orLoginWith: '或使用以下方式登录',
  },
  tw: {
    applyTitle: '申請職位',
    name: '姓名',
    email: '郵箱',
    cv: '上傳簡歷',
    submit: '提交申請',
    success: '申請提交成功！',
    error: '請填寫所有字段並上傳簡歷。',
    orLoginWith: '或使用以下方式登錄',
  }
};

const JobApplication: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [lang, setLang] = useState<'en' | 'zh' | 'tw'>('en');
  const [form, setForm] = useState({ name: '', email: '' });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  useEffect(() => {
    axios.get(`/api/jobs/${jobId}`)
      .then(res => setJob(res.data))
      .catch(() => setJob(null));
    const savedLang = localStorage.getItem('preferredLanguage') as 'en' | 'zh' | 'tw' || 'en';
    setLang(savedLang);
  }, [jobId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !cvFile) {
      setError(t.error);
      return;
    }
    setError('');
    const data = new FormData();
    data.append('jobId', jobId!);
    data.append('applicantName', form.name);
    data.append('applicantEmail', form.email);
    data.append('cvFile', cvFile);
    try {
      await axios.post('/api/applications', data);
      setShowModal(true);
      setTimeout(() => {
        navigate('/jobseeker-dashboard');
      }, 1500);
    } catch {
      setError('Submission failed.');
    }
  };

  if (!job) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2 font-inter">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8 card-hover">
        <h2 className="text-2xl font-bold text-primary mb-2 flex items-center">
          <i className="fas fa-briefcase mr-2"></i>{t.applyTitle} <span className="ml-2">{job.title}</span>
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">{t.name}</label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 input-focus transition-all"
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder={t.name}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">{t.email}</label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 input-focus transition-all"
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t.email}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cvFile">{t.cv}</label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 input-focus transition-all"
              id="cvFile"
              name="cvFile"
              type="file"
              accept=".pdf,.doc,.docx"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-4 rounded-lg btn-hover flex items-center justify-center"
          >
            {t.submit}
            <i className="fas fa-arrow-right ml-2"></i>
          </button>
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t.orLoginWith}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <button type="button" className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <i className="fab fa-google text-red-500 text-xl"></i>
            </button>
            <button type="button" className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <i className="fab fa-facebook-f text-blue-600 text-xl"></i>
            </button>
            <button type="button" className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <i className="fab fa-twitter text-blue-400 text-xl"></i>
            </button>
          </div>
        </form>
      </div>
      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 transform transition-all scale-100 opacity-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t.success}
              </h3>
              <button
                className="w-full bg-primary text-white font-medium py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-colors mt-4"
                onClick={() => { setShowModal(false); navigate('/jobs'); }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplication; 