const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');

const JOBS_FILE = path.join(__dirname, '../data/jobs.json');

// Simple in-memory cache with shorter duration for faster updates
let jobsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 10000; // 10 seconds for faster updates

// Helper to read jobs from file with caching
async function readJobs() {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (jobsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return jobsCache;
  }

  try {
    const data = await fs.readFile(JOBS_FILE, 'utf-8');
    const jobs = JSON.parse(data);
    
    // Update cache
    jobsCache = jobs;
    cacheTimestamp = now;
    
    return jobs;
  } catch (error) {
    console.error('Error reading jobs file:', error);
    return [];
  }
}

// Helper to write jobs to file
async function writeJobs(jobs) {
  try {
    await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2));
    // Invalidate cache
    jobsCache = null;
    cacheTimestamp = null;
  } catch (error) {
    console.error('Error writing jobs file:', error);
    throw error;
  }
}

// GET /api/jobs - list all jobs (optimized)
router.get('/', async (req, res) => {
  try {
    const jobs = await readJobs();
    // Send response immediately without sorting for better performance
    res.json(jobs);
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    res.status(500).json({ error: 'Failed to load jobs' });
  }
});

// GET /api/jobs/:id - get job detail
router.get('/:id', async (req, res) => {
  const jobs = await readJobs();
  const job = jobs.find(j => String(j.id) === String(req.params.id));
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// POST /api/jobs - create job
router.post('/', async (req, res) => {
  try {
    const { title, description, requirements, location, department } = req.body;
    if (!title || !description || !requirements || !location || !department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const jobs = await readJobs();
    const nextId = jobs.length > 0 ? Math.max(...jobs.map(j => j.id || 0)) + 1 : 1;
    const job = {
      id: nextId,
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : String(requirements).split(',').map(r => r.trim()).filter(Boolean),
      location,
      department,
      createdAt: new Date().toISOString(),
    };
    jobs.push(job);
    await writeJobs(jobs);
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: 'Invalid job data' });
  }
});

module.exports = router; 