import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { InterviewDashboard } from '../pages/InterviewDashboard';
import type { JobApplication, InterviewStage } from '../types';
import {
  QueryClient,
  QueryClientProvider,
  useQueries,
} from '@tanstack/react-query';

// Mock dependencies
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueries: vi.fn(),
  };
});

vi.mock('../hooks/useInterviewStages', () => ({
  useAddInterviewStage: () => ({ mutateAsync: vi.fn() }),
  useUpdateInterviewStage: () => ({ mutateAsync: vi.fn() }),
  useDeleteInterviewStage: () => ({ mutateAsync: vi.fn() }),
  INTERVIEW_STAGES_QUERY_KEY: ['interview-stages'],
}));

vi.mock('../utils/storage', () => ({
  getInterviewStages: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

const mockJobs: JobApplication[] = [
  {
    id: 'job-1',
    company: 'TechCorp',
    title: 'Frontend Lead',
    status: 'Interviewing',
    interest: 'High',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-2',
    company: 'DataFlow',
    title: 'Senior Engineer',
    status: 'Interviewing',
    interest: 'Medium',
    createdAt: new Date().toISOString(),
  },
];

const mockStages: InterviewStage[] = [
  {
    id: 'stage-1',
    jobId: 'job-1',
    stageNumber: 1,
    type: 'Tech discussion',
    dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    notes: 'Prepare system design',
    createdAt: new Date().toISOString(),
  },
];

describe('InterviewDashboard', () => {
  const defaultProps = {
    jobs: mockJobs,
    expandedJobId: null,
    setExpandedJobId: vi.fn(),
    onNavigateToApplications: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the empty state when no jobs are interviewing', async () => {
    // Only pass jobs that are not interviewing
    const noInterviewsJobs = mockJobs.map((j) => ({
      ...j,
      status: 'Applied' as const,
    }));
    vi.mocked(useQueries).mockReturnValue([]);
    renderWithClient(
      <InterviewDashboard {...defaultProps} jobs={noInterviewsJobs} />
    );

    // The component has a slight delay because it fetches stages
    await waitFor(() => {
      expect(screen.getByText(/No Active Interviews/i)).toBeInTheDocument();
    });
  });

  it('fetches and displays jobs that are interviewing', async () => {
    vi.mocked(useQueries).mockReturnValue([
      { data: mockStages, isLoading: false },
      { data: [], isLoading: false },
    ]);

    renderWithClient(<InterviewDashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('TechCorp')).toBeInTheDocument();
      expect(screen.getByText('Frontend Lead')).toBeInTheDocument();
    });
  });

  it('displays "Up next" for upcoming interviews', async () => {
    vi.mocked(useQueries).mockReturnValue([
      { data: mockStages, isLoading: false },
      { data: [], isLoading: false },
    ]);

    renderWithClient(<InterviewDashboard {...defaultProps} />);

    await waitFor(() => {
      // Use a more flexible matcher for "Up next" text
      expect(screen.getByText(/Up next: Tech discussion/i)).toBeInTheDocument();
    });
  });

  it('shows the correct summary statistics', async () => {
    vi.mocked(useQueries).mockReturnValue([
      { data: mockStages, isLoading: false },
      { data: [], isLoading: false },
    ]);

    renderWithClient(<InterviewDashboard {...defaultProps} />);

    await waitFor(() => {
      // Active Interviews: Both job-1 and job-2 are 'Interviewing'
      expect(screen.getByText('2')).toBeInTheDocument();
      // Upcoming Stages: Only job-1 has a future stage in this mock
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});
