import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  department: string;
  createdAt: string;
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios.get(`/api/jobs/${id}`)
        .then(res => setJob(res.data))
        .catch(() => setJob(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!job) return <div className="text-center py-12 text-red-400">Job not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2 font-inter">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-card p-8 card-hover">
        <h1 className="text-3xl font-bold text-primary mb-2 flex items-center">
          <i className="fas fa-briefcase mr-2"></i>{job.title}
        </h1>
        <div className="text-gray-500 text-sm mb-4">
          <span className="mr-4"><i className="fas fa-building mr-1"></i>{job.department}</span>
          <span><i className="fas fa-map-marker-alt mr-1"></i>{job.location}</span>
        </div>
        <div className="text-gray-700 mb-4 whitespace-pre-line">
          {job.description}
        </div>
        <div className="mb-4">
          <div className="font-semibold text-gray-800 mb-1">Requirements:</div>
          <ul className="list-disc list-inside text-gray-700">
            {job.requirements.map((req, idx) => (
              <li key={idx}><i className="fas fa-check text-primary mr-2"></i>{req}</li>
            ))}
          </ul>
        </div>
        <div className="text-xs text-gray-400 mb-6">Posted {new Date(job.createdAt).toLocaleDateString()}</div>
        <button
          className="px-6 py-3 bg-gradient-primary text-white rounded-lg btn-hover font-semibold flex items-center text-lg"
          onClick={() => navigate(`/apply/${job.id}`)}
        >
          Apply for this Job <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
};

export default JobDetail; 