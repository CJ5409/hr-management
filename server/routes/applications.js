const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { spawn } = require('child_process');
const os = require('os');
const fsSync = require('fs');
const nodemailer = require('nodemailer');

const APPLICATIONS_FILE = path.join(__dirname, '../data/applications.json');
const CV_UPLOAD_DIR = path.join(__dirname, '../uploads/cvs');
const USERS_FILE = path.join(__dirname, '../data/users.json');
const JOBS_FILE = path.join(__dirname, '../data/jobs.json');
const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');

// Set up multer for CV uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, CV_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Helper to read applications from file
async function readApplications() {
  try {
    const data = await fs.readFile(APPLICATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper to write applications to file
async function writeApplications(applications) {
  await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));
}

// Helper to read users from file
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}
async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Helper to read jobs from file
async function readJobs() {
  try {
    const data = await fs.readFile(JOBS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper to read messages from file
async function readMessages() {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}
async function writeMessages(messages) {
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// Function to create highlighted PDF with AI keywords
async function createHighlightedPDF(application) {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Standard letter size
    const { width, height } = page.getSize();
    
    // Get font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Define colors
    const highlightYellow = rgb(1, 1, 0.8); // Light yellow
    const highlightGreen = rgb(0.8, 1, 0.8); // Light green
    const highlightBlue = rgb(0.8, 0.9, 1);  // Light blue
    const textColor = rgb(0, 0, 0);
    const headerColor = rgb(0.2, 0.2, 0.8);
    
    let yPosition = height - 50;
    const lineHeight = 20;
    const margin = 50;
    
    // Header
    page.drawText('AI-ANALYZED CV WITH KEYWORDS HIGHLIGHTED', {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: headerColor
    });
    yPosition -= 30;
    
    // Applicant info
    page.drawText(`Applicant: ${application.applicantName}`, {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: textColor
    });
    yPosition -= 25;
    
    page.drawText(`Email: ${application.applicantEmail}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font: font,
      color: textColor
    });
    yPosition -= 30;
    
    // AI Rating
    const ratingColor = application.aiScreening?.rating === 'Highly Recommended' ? rgb(0, 0.6, 0) :
                       application.aiScreening?.rating === 'Recommended' ? rgb(0.8, 0.6, 0) :
                       rgb(0.8, 0, 0);
    
    page.drawText(`AI Rating: ${application.aiScreening?.rating}`, {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: ratingColor
    });
    yPosition -= 25;
    
    page.drawText(`Score: ${application.aiScreening?.details?.score}/100`, {
      x: margin,
      y: yPosition,
      size: 12,
      font: font,
      color: textColor
    });
    yPosition -= 30;
    
    // Education section
    page.drawText('EDUCATION:', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: headerColor
    });
    yPosition -= 20;
    
    const educationText = application.aiScreening?.details?.education || 'Not specified';
    const educationWords = educationText.split(' ');
    let currentX = margin;
    
    educationWords.forEach(word => {
      const wordWidth = font.widthOfTextAtSize(word + ' ', 12);
      const isKeyword = word.toLowerCase().includes('bachelor') || 
                       word.toLowerCase().includes('degree') || 
                       word.toLowerCase().includes('university') ||
                       word.toLowerCase().includes('hkust') ||
                       word.toLowerCase().includes('hku');
      
      if (isKeyword) {
        // Draw highlight background
        page.drawRectangle({
          x: currentX - 2,
          y: yPosition - 2,
          width: wordWidth + 4,
          height: 16,
          color: highlightGreen
        });
      }
      
      page.drawText(word + ' ', {
        x: currentX,
        y: yPosition,
        size: 12,
        font: font,
        color: textColor
      });
      
      currentX += wordWidth;
    });
    yPosition -= 30;
    
    // Experience section
    page.drawText('EXPERIENCE:', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: headerColor
    });
    yPosition -= 20;
    
    const experienceText = application.aiScreening?.details?.experience || 'Not specified';
    const experienceWords = experienceText.split(' ');
    currentX = margin;
    
    experienceWords.forEach(word => {
      const wordWidth = font.widthOfTextAtSize(word + ' ', 12);
      const isKeyword = word.toLowerCase().includes('years') || 
                       word.toLowerCase().includes('experience') ||
                       word.toLowerCase().includes('sales') ||
                       word.toLowerCase().includes('leadership');
      
      if (isKeyword) {
        page.drawRectangle({
          x: currentX - 2,
          y: yPosition - 2,
          width: wordWidth + 4,
          height: 16,
          color: highlightYellow
        });
      }
      
      page.drawText(word + ' ', {
        x: currentX,
        y: yPosition,
        size: 12,
        font: font,
        color: textColor
      });
      
      currentX += wordWidth;
    });
    yPosition -= 30;
    
    // Skills section
    page.drawText('SKILLS:', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: headerColor
    });
    yPosition -= 20;
    
    if (application.aiScreening?.details?.skills) {
      application.aiScreening.details.skills.forEach(skill => {
        const skillWidth = font.widthOfTextAtSize(skill, 12);
        
        // Draw highlight background for skills
        page.drawRectangle({
          x: margin - 2,
          y: yPosition - 2,
          width: skillWidth + 4,
          height: 16,
          color: highlightBlue
        });
        
        page.drawText(skill, {
          x: margin,
          y: yPosition,
          size: 12,
          font: font,
          color: textColor
        });
        
        yPosition -= 20;
      });
    }
    yPosition -= 20;
    
    // Languages section
    page.drawText('LANGUAGES:', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: headerColor
    });
    yPosition -= 20;
    
    if (application.aiScreening?.details?.languages) {
      application.aiScreening.details.languages.forEach(language => {
        const langWidth = font.widthOfTextAtSize(language, 12);
        
        // Draw highlight background for languages
        page.drawRectangle({
          x: margin - 2,
          y: yPosition - 2,
          width: langWidth + 4,
          height: 16,
          color: highlightGreen
        });
        
        page.drawText(language, {
          x: margin,
          y: yPosition,
          size: 12,
          font: font,
          color: textColor
        });
        
        yPosition -= 20;
      });
    }
    yPosition -= 20;
    
    // Key highlights
    page.drawText('KEY HIGHLIGHTS:', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: headerColor
    });
    yPosition -= 20;
    
    if (application.aiScreening?.highlights) {
      application.aiScreening.highlights.forEach(highlight => {
        const words = highlight.split(' ');
        currentX = margin;
        
        words.forEach(word => {
          const wordWidth = font.widthOfTextAtSize(word + ' ', 10);
          const isPositive = word.toLowerCase().includes('bachelor') || 
                           word.toLowerCase().includes('experience') ||
                           word.toLowerCase().includes('multilingual') ||
                           word.toLowerCase().includes('leadership');
          
          if (isPositive) {
            page.drawRectangle({
              x: currentX - 1,
              y: yPosition - 1,
              width: wordWidth + 2,
              height: 14,
              color: highlightGreen
            });
          }
          
          page.drawText(word + ' ', {
            x: currentX,
            y: yPosition,
            size: 10,
            font: font,
            color: textColor
          });
          
          currentX += wordWidth;
        });
        
        yPosition -= 15;
      });
    }
    
    // Legend
    yPosition -= 20;
    page.drawText('LEGEND:', {
      x: margin,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: headerColor
    });
    yPosition -= 20;
    
    page.drawRectangle({
      x: margin,
      y: yPosition - 2,
      width: 15,
      height: 15,
      color: highlightGreen
    });
    page.drawText('Education & Languages', {
      x: margin + 20,
      y: yPosition,
      size: 10,
      font: font,
      color: textColor
    });
    yPosition -= 20;
    
    page.drawRectangle({
      x: margin,
      y: yPosition - 2,
      width: 15,
      height: 15,
      color: highlightYellow
    });
    page.drawText('Experience & Performance', {
      x: margin + 20,
      y: yPosition,
      size: 10,
      font: font,
      color: textColor
    });
    yPosition -= 20;
    
    page.drawRectangle({
      x: margin,
      y: yPosition - 2,
      width: 15,
      height: 15,
      color: highlightBlue
    });
    page.drawText('Skills & Competencies', {
      x: margin + 20,
      y: yPosition,
      size: 10,
      font: font,
      color: textColor
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error creating highlighted PDF:', error);
    throw error;
  }
}

// GET /api/applications/:id/cv - download CV file (must come before other routes)
router.get('/:id/cv', async (req, res) => {
  try {
    console.log('CV download requested for application ID:', req.params.id);
    const applications = await readApplications();
    const application = applications.find(a => a.id == req.params.id);
    
    if (!application) {
      console.log('Application not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Application not found' });
    }
    
    console.log('Found application:', application.applicantName, 'CV file:', application.cvFile);
    const cvPath = path.join(CV_UPLOAD_DIR, application.cvFile);
    
    if (!require('fs').existsSync(cvPath)) {
      console.log('CV file not found at path:', cvPath);
      return res.status(404).json({ error: 'CV file not found' });
    }
    
    console.log('Sending CV file:', cvPath);
    res.download(cvPath, application.cvFile);
  } catch (err) {
    console.error('Error downloading CV:', err);
    res.status(500).json({ error: 'Error downloading CV' });
  }
});

// GET /api/applications/:id/ai-highlighted - download AI-highlighted CV
router.get('/:id/ai-highlighted', async (req, res) => {
  try {
    // WARNING: Do not log to stdout when sending binary data!
    const applications = await readApplications();
    const application = applications.find(a => a.id == req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const highlightedPdfBytes = await createHighlightedPDF(application);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="AI-Analyzed-${application.applicantName.replace(/\s+/g, '-')}.pdf"`);
    res.setHeader('Content-Length', highlightedPdfBytes.length);
    res.end(Buffer.from(highlightedPdfBytes));
  } catch (err) {
    res.status(500).json({ error: 'Error creating AI-highlighted PDF' });
  }
});

// GET /api/applications/:id/ai-highlighted-original - highlight keywords in the original CV PDF
router.get('/:id/ai-highlighted-original', async (req, res) => {
  try {
    const applications = await readApplications();
    const application = applications.find(a => a.id == req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    // Path to the original CV PDF
    const cvPath = path.join(CV_UPLOAD_DIR, application.cvFile);
    if (!fsSync.existsSync(cvPath)) return res.status(404).json({ error: 'CV file not found' });

    // Prepare keywords (from AI screening or hardcoded for demo)
    const keywords = [
      ...(application.aiScreening?.details?.skills || []),
      ...(application.aiScreening?.details?.languages || []),
      ...(application.aiScreening?.highlights || [])
    ].map(k => k.split(/[ ,]+/)).flat().filter(Boolean);
    const uniqueKeywords = [...new Set(keywords)].filter(k => k.length > 2);

    // Temp output path
    const outputPath = path.join(os.tmpdir(), `highlighted-${Date.now()}.pdf`);

    // Call the Python script
    const python = spawn('python3', [
      path.join(__dirname, '../../highlight_pdf.py'),
      cvPath,
      uniqueKeywords.join(','),
      outputPath
    ]);

    python.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Python highlighting failed' });
      }
      // Send the highlighted PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="AI-Highlighted-${application.applicantName.replace(/\s+/g, '-')}.pdf"`);
      fsSync.createReadStream(outputPath)
        .on('end', () => fsSync.unlinkSync(outputPath))
        .pipe(res);
    });
  } catch (err) {
    res.status(500).json({ error: 'Error creating AI-highlighted PDF' });
  }
});

// POST /api/applications - submit application with CV upload
router.post('/', upload.single('cvFile'), async (req, res) => {
  try {
    const { jobId, applicantName, applicantEmail } = req.body;
    if (!req.file) return res.status(400).json({ error: 'CV file is required' });
    if (!jobId || !applicantName || !applicantEmail) return res.status(400).json({ error: 'Missing required fields' });
    const applications = await readApplications();
    const nextId = applications.length > 0 ? Math.max(...applications.map(a => a.id || 0)) + 1 : 1;
    // Mock AI screening result
    const aiScreening = mockAIScreening(applicantName, applicantEmail);
    const application = {
      id: nextId,
      jobId,
      applicantName,
      applicantEmail,
      cvFile: req.file.filename,
      aiScreening,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: [],
      auditTrail: []
    };
    applications.push(application);
    await writeApplications(applications);

    // --- Auto-create user as jobseeker if not present ---
    const users = await readUsers();
    let user = users.find(u => u.email === applicantEmail);
    if (!user) {
      const nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
      user = {
        id: nextUserId,
        email: applicantEmail,
        password: 'changeme', // You may want to set/reset this securely
        role: 'jobseeker',
        department: null,
        position: null
      };
      users.push(user);
      await writeUsers(users);
    }

    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ error: 'Invalid application data' });
  }
});

// POST /api/applications/:id/notes - add a note to an application
router.post('/:id/notes', async (req, res) => {
  const { note, author } = req.body;
  if (!note || !author) return res.status(400).json({ error: 'Missing note or author' });
  const applications = await readApplications();
  const application = applications.find(a => a.id == req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  const noteObj = { note, author, time: new Date().toISOString() };
  application.notes = application.notes || [];
  application.notes.push(noteObj);
  application.auditTrail = application.auditTrail || [];
  application.auditTrail.push({ action: 'note', author, time: noteObj.time, details: note });
  await writeApplications(applications);
  res.json({ success: true, note: noteObj });
});

// GET /api/applications/:id/audit - fetch audit trail
router.get('/:id/audit', async (req, res) => {
  const applications = await readApplications();
  const application = applications.find(a => a.id == req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  res.json(application.auditTrail || []);
});

// POST /api/applications/bulk - bulk hire/reject/defer
router.post('/bulk', async (req, res) => {
  const { ids, action, actor, deferTarget } = req.body;
  if (!Array.isArray(ids) || !action) return res.status(400).json({ error: 'Missing ids or action' });
  const applications = await readApplications();
  const jobs = await readJobs();
  const updated = [];
  for (const id of ids) {
    const app = applications.find(a => a.id == id);
    if (!app) continue;
    app.auditTrail = app.auditTrail || [];
    if (action === 'hire') {
      app.status = 'waiting for onboarding';
      app.auditTrail.push({ action: 'hire', author: actor, time: new Date().toISOString() });
      // Email notification
      await sendEmail(app.applicantEmail, 'You have been hired!', 'Congratulations! You have been hired. Please await onboarding instructions from IT.');
    } else if (action === 'reject') {
      app.status = 'rejected';
      app.auditTrail.push({ action: 'reject', author: actor, time: new Date().toISOString() });
      await sendEmail(app.applicantEmail, 'Application Rejected', 'We regret to inform you that your application was not successful.');
    } else if (action === 'defer') {
      if (deferTarget && deferTarget.jobId) {
        const newJob = jobs.find(j => String(j.id) === String(deferTarget.jobId));
        if (newJob) app.jobId = newJob.id;
      }
      if (deferTarget && deferTarget.department) {
        app.deferredDepartment = deferTarget.department;
      }
      app.status = 'deferred';
      app.auditTrail.push({ action: 'defer', author: actor, time: new Date().toISOString(), details: deferTarget });
      await sendEmail(app.applicantEmail, 'Application Deferred', 'Your application has been deferred. Please await further instructions.');
    }
    updated.push(app);
  }
  await writeApplications(applications);
  res.json({ success: true, updated });
});

// Minimal PDF test route for troubleshooting
router.get('/test/minimal-pdf', async (req, res) => {
  const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 200]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText('Hello, PDF!', { x: 50, y: 150, size: 24, font, color: rgb(0, 0, 0) });
  const pdfBytes = await pdfDoc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="minimal.pdf"');
  res.end(Buffer.from(pdfBytes));
});

// GET /api/messages/:email - fetch all messages for a user
router.get('/messages/:email', async (req, res) => {
  const messages = await readMessages();
  res.json(messages.filter(m => m.to === req.params.email));
});
// POST /api/messages - store a new message
router.post('/messages', async (req, res) => {
  const { to, from, message, timestamp } = req.body;
  if (!to || !from || !message) return res.status(400).json({ error: 'Missing fields' });
  const messages = await readMessages();
  const msg = { to, from, message, timestamp: timestamp || new Date().toISOString() };
  messages.push(msg);
  await writeMessages(messages);
  res.json({ success: true, message: msg });
});

// Enhanced AI screening function that analyzes CV content
function mockAIScreening(name, email) {
  // Analyze CV content based on applicant name
  let rating, highlights, details, score, confidence;
  
  if (name.toLowerCase().includes('alice')) {
    // Alice Lee - Highly qualified sales professional
    rating = 'Highly Recommended';
    highlights = [
      'Bachelor degree from HKUST',
      '3+ years sales experience',
      'Exceeded targets by 25%',
      'Team leadership experience',
      'Multilingual (English, Chinese, Spanish)'
    ];
    details = {
      education: 'Bachelor of Business Administration - HKUST',
      experience: '3+ years',
      skills: ['Sales Strategy', 'CRM Systems', 'Negotiation', 'Client Relationship Management', 'Team Leadership'],
      languages: ['English (Native)', 'Chinese (Fluent)', 'Spanish (Conversational)'],
      score: 92,
      confidence: 95
    };
  } else if (name.toLowerCase().includes('bob')) {
    // Bob Chan - Good multilingual candidate
    rating = 'Recommended';
    highlights = [
      'Bachelor degree from HKU',
      '2 years international sales experience',
      'Multilingual (English, Chinese, Japanese)',
      'Cross-cultural business experience'
    ];
    details = {
      education: 'Bachelor of Commerce - University of Hong Kong',
      experience: '2 years',
      skills: ['Multilingual Communication', 'International Sales', 'Cultural Sensitivity', 'Client Relationship Building'],
      languages: ['English (Fluent)', 'Chinese (Native)', 'Japanese (Business Level)'],
      score: 78,
      confidence: 85
    };
  } else if (name.toLowerCase().includes('carol')) {
    // Carol Wong - Qualified HR Assistant with enriched background
    rating = 'Recommended';
    highlights = [
      'Bachelor degree in HR Management',
      '2 years HR experience',
      'HRIS systems expertise',
      'Multilingual (English, Chinese, Cantonese)',
      'HR certifications and professional memberships'
    ];
    details = {
      education: 'Bachelor of Business Administration - Human Resource Management',
      experience: '2 years',
      skills: ['HRIS Systems', 'Recruitment Coordination', 'Employee Onboarding', 'Payroll Systems', 'Database Management', 'Social Media Recruiting'],
      languages: ['English (Fluent)', 'Chinese (Native)', 'Cantonese (Native)'],
      score: 82,
      confidence: 90
    };
  } else {
    // Default for other applicants
    rating = 'Recommended';
    highlights = ['Bachelor degree', 'Some experience'];
    details = {
      education: 'Bachelor degree',
      experience: '1-2 years',
      skills: ['Communication', 'Teamwork'],
      languages: ['English', 'Chinese'],
      score: 70,
      confidence: 75
    };
  }
  
  return {
    rating,
    highlights,
    summary: `AI screening for ${name} (${email}): ${rating} - ${details.education}, ${details.experience} experience`,
    details
  };
}

// PATCH /api/applications/:id/complete-onboarding - IT completes onboarding, change user role
router.patch('/:id/complete-onboarding', async (req, res) => {
  const applications = await readApplications();
  const application = applications.find(a => a.id == req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });

  // Get job info for department/role
  const jobs = await readJobs();
  const job = jobs.find(j => String(j.id) === String(application.jobId));
  const department = job ? job.department : (req.body.department || 'employee');

  const users = await readUsers();
  let user = users.find(u => u.email === application.applicantEmail);
  if (user) {
    user.role = department;
    user.department = department;
    await writeUsers(users);
  } else {
    // If user does not exist, create as employee
    const nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
    user = {
      id: nextUserId,
      email: application.applicantEmail,
      password: 'changeme',
      role: department,
      department: department,
      position: null
    };
    users.push(user);
    await writeUsers(users);
  }

  application.status = 'hired';
  application.auditTrail = application.auditTrail || [];
  application.auditTrail.push({ action: 'onboardingComplete', author: 'IT', time: new Date().toISOString() });
  await writeApplications(applications);

  // Notify jobseeker via Socket.IO (IT Helpdesk message)
  const io = req.app.get('io');
  if (io && user) {
    io.to(user.email).emit('receiveMessage', {
      sender: 'IT Helpdesk',
      message: `Congrats, you are hired and onboarded as ${department}!`,
      timestamp: new Date().toLocaleString()
    });
    // Emit roleChanged event
    io.to(user.email).emit('roleChanged', { newRole: user.role });
  }
  // Persist the onboarding message
  const messages = await readMessages();
  messages.push({ to: user.email, from: 'IT Helpdesk', message: `Congrats, you are hired and onboarded as ${department}!`, timestamp: new Date().toISOString() });
  await writeMessages(messages);

  res.json({ success: true, application, user });
});

// PATCH /api/applications/:id/defer - HR defers a candidate to another job/department
router.patch('/:id/defer', async (req, res) => {
  const applications = await readApplications();
  const application = applications.find(a => a.id == req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });

  // Optionally, allow HR to specify new jobId/department
  const jobs = await readJobs();
  let newJob = null;
  if (req.body.jobId) {
    newJob = jobs.find(j => String(j.id) === String(req.body.jobId));
    if (newJob) {
      application.jobId = newJob.id;
      application.status = 'deferred';
    }
  } else if (req.body.department) {
    application.status = 'deferred';
    application.deferredDepartment = req.body.department;
  } else {
    application.status = 'deferred';
  }
  application.auditTrail = application.auditTrail || [];
  application.auditTrail.push({ action: 'defer', author: 'HR', time: new Date().toISOString(), details: req.body });
  await writeApplications(applications);

  // Notify jobseeker via Socket.IO (IT Helpdesk message)
  const io = req.app.get('io');
  if (io) {
    io.to(application.applicantEmail).emit('receiveMessage', {
      sender: 'IT Helpdesk',
      message: `Your application has been deferred${newJob ? ' to ' + newJob.department : req.body.department ? ' to ' + req.body.department : ''}. Please await further instructions.`,
      timestamp: new Date().toLocaleString()
    });
  }

  res.json({ success: true, application });
});

// PATCH /api/applications/:id/reject - HR rejects a candidate
router.patch('/:id/reject', async (req, res) => {
  const applications = await readApplications();
  const application = applications.find(a => a.id == req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  application.status = 'rejected';
  application.auditTrail = application.auditTrail || [];
  application.auditTrail.push({ action: 'reject', author: 'HR', time: new Date().toISOString() });
  await writeApplications(applications);

  // Notify jobseeker via Socket.IO (IT Helpdesk message)
  const io = req.app.get('io');
  if (io) {
    io.to(application.applicantEmail).emit('receiveMessage', {
      sender: 'IT Helpdesk',
      message: 'We regret to inform you that your application was not successful. Please try again next time.',
      timestamp: new Date().toLocaleString()
    });
  }

  res.json({ success: true, application });
});

// POST /api/applications/:id/hire - HR hires a candidate and triggers onboarding
router.post('/:id/hire', async (req, res) => {
  const applications = await readApplications();
  const application = applications.find(a => a.id == req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });

  application.status = 'waiting for onboarding';
  application.auditTrail = application.auditTrail || [];
  application.auditTrail.push({ action: 'hire', author: 'HR', time: new Date().toISOString() });
  await writeApplications(applications);

  // Emit onboarding event to IT via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.to('it').emit('onboardingRequest', {
      applicantName: application.applicantName,
      applicantEmail: application.applicantEmail,
      jobId: application.jobId,
      applicationId: application.id,
      time: new Date().toISOString()
    });
    // Notify jobseeker via IT Helpdesk
    io.to(application.applicantEmail).emit('receiveMessage', {
      sender: 'IT Helpdesk',
      message: 'Congratulations! You have been hired. Please await onboarding instructions from IT.',
      timestamp: new Date().toLocaleString()
    });
  }

  res.json({ success: true, application });
});

// GET /api/applications - list all applications (real status)
router.get('/', async (req, res) => {
  const applications = await readApplications();
  res.json(applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// GET /api/applications/:id - fetch a single application by ID
router.get('/:id', async (req, res) => {
  const applications = await readApplications();
  const application = applications.find(a => a.id == req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  res.json(application);
});

// DELETE /api/applications/:id - delete an application
router.delete('/:id', async (req, res) => {
  try {
    const applications = await readApplications();
    const idx = applications.findIndex(a => String(a.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Application not found' });
    applications.splice(idx, 1);
    await writeApplications(applications);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// PATCH /api/applications/:id - modify application status (or other fields)
router.patch('/:id', async (req, res) => {
  const applications = await readApplications();
  const application = applications.find(a => a.id == req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  if (req.body.status) application.status = req.body.status;
  // Add more fields as needed
  application.auditTrail = application.auditTrail || [];
  application.auditTrail.push({ action: 'update', author: 'HR', time: new Date().toISOString(), details: req.body });
  await writeApplications(applications);
  res.json(application);
});

// PATCH /api/applications/:id/recall - HR recalls decision, set status to 'pending'
router.patch('/:id/recall', async (req, res) => {
  const applications = await readApplications();
  const application = applications.find(a => a.id == req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  application.status = 'pending';
  application.auditTrail = application.auditTrail || [];
  application.auditTrail.push({ action: 'recall', author: 'HR', time: new Date().toISOString() });
  await writeApplications(applications);
  res.json(application);
});

// Email notification helper (stub)
async function sendEmail(to, subject, text) {
  // Configure your SMTP transport here
  // For demo, just log
  console.log(`[EMAIL] To: ${to} | Subject: ${subject} | Text: ${text}`);
  // Example with nodemailer (uncomment and configure):
  // const transporter = nodemailer.createTransport({ /* SMTP config */ });
  // await transporter.sendMail({ from: 'noreply@yourdomain.com', to, subject, text });
}

module.exports = router; 