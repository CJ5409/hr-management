import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const JobBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple fetch with minimal error handling for demo
    axios.get('/api/jobs')
      .then(res => {
        setJobs(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setJobs([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Available Jobs</h1>
        
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No jobs available</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-2">{job.department} • {job.location}</p>
                    <p className="text-gray-700 mb-3">
                      {job.description.length > 100 ? job.description.slice(0, 100) + '...' : job.description}
                    </p>
                    <div className="text-sm text-gray-500">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Link 
                    to={`/jobs/${job.id}`}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobBoard; 