export interface JobApplication {
  id: string;
  title: string;
  company: string;
  level?: string;
  notes?: string;
  url?: string;
  interest?: string | number;
  status?: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected' | 'Expired';
  createdAt: string;
}

export interface InterviewStage {
  id: string;
  jobId: string;
  stageNumber: number;
  type: string;
  dateTime: string;
  notes?: string;
  feedback?: string;
  createdAt: string;
}
