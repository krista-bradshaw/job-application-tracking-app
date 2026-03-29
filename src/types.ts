export const INTEREST_LEVEL = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};
export type Interest = (typeof INTEREST_LEVEL)[keyof typeof INTEREST_LEVEL];

export const JOB_LEVEL = {
  INTERNSHIP: 'Internship',
  ENTRY: 'Entry',
  MID: 'Mid',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  MANAGER: 'Manager',
};
export type JobLevel = (typeof JOB_LEVEL)[keyof typeof JOB_LEVEL];

export const APPLICATION_STATUS = {
  APPLIED: 'Applied',
  INTERVIEWING: 'Interviewing',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
};
export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  level?: JobLevel;
  notes?: string;
  url?: string;
  interest?: Interest;
  status?: ApplicationStatus;
  createdAt: string;
}

export const INTERVIEW_TYPE = {
  TALENT_SCREENING: 'Talent screening',
  TECH_DISCUSSION: 'Tech discussion',
  TECH_TEST_TAKE_HOME: 'Tech Test (take home)',
  TECH_TEST_LIVE: 'Tech Test (live)',
  HR_SCREENING: 'HR Screening',
  EXECUTIVE_SCREENING: 'Executive Screening',
  ASSESSMENT_DAY: 'Assessment Day',
};
export type InterviewType =
  (typeof INTERVIEW_TYPE)[keyof typeof INTERVIEW_TYPE];

export interface InterviewStage {
  id: string;
  jobId: string;
  stageNumber: number;
  type: InterviewType;
  dateTime: string;
  notes?: string;
  feedback?: string;
  createdAt: string;
}

export const LEVEL_COLORS: Record<
  JobLevel,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  [JOB_LEVEL.INTERNSHIP]: 'info',
  [JOB_LEVEL.ENTRY]: 'success',
  [JOB_LEVEL.MID]: 'primary',
  [JOB_LEVEL.SENIOR]: 'secondary',
  [JOB_LEVEL.LEAD]: 'warning',
  [JOB_LEVEL.MANAGER]: 'error',
};

export const INTEREST_COLORS: Record<
  Interest,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  [INTEREST_LEVEL.LOW]: 'info',
  [INTEREST_LEVEL.MEDIUM]: 'default',
  [INTEREST_LEVEL.HIGH]: 'success',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [APPLICATION_STATUS.APPLIED]: 'info.main',
  [APPLICATION_STATUS.INTERVIEWING]: 'warning.main',
  [APPLICATION_STATUS.OFFER]: 'success.main',
  [APPLICATION_STATUS.REJECTED]: 'error.main',
  [APPLICATION_STATUS.EXPIRED]: 'text.disabled',
};
