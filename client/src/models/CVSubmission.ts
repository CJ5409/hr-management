export interface CVSubmission {
    id: number;
    candidateName: string;
    submittedAt: string;
    status: 'Pending' | 'Approved' | 'Rejected';
  }