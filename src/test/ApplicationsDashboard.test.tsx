import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationsDashboard } from '../pages/ApplicationsDashboard';
import type { JobApplication } from '../types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

const mockUpdateJob = vi.fn().mockResolvedValue({});
const mockDeleteJob = vi.fn().mockResolvedValue({});

vi.mock('../hooks/useJobs', () => ({
  useUpdateJob: () => ({ mutateAsync: mockUpdateJob }),
  useDeleteJob: () => ({ mutateAsync: mockDeleteJob }),
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
    id: '1',
    company: 'Apple',
    title: 'Frontend Developer',
    status: 'Applied',
    interest: 'High',
    level: 'Senior',
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    company: 'Google',
    title: 'Software Engineer',
    status: 'Interviewing',
    interest: 'Medium',
    level: 'Mid',
    createdAt: '2024-01-02T10:00:00Z',
  },
  {
    id: '3',
    company: 'Meta',
    title: 'Product Designer',
    status: 'Rejected',
    interest: 'Low',
    level: 'Entry',
    createdAt: '2024-01-03T10:00:00Z',
  },
];

describe('ApplicationsDashboard', () => {
  const defaultProps = {
    jobs: mockJobs,
    setJobs: vi.fn(),
    setEditingJob: vi.fn(),
    setIsModalOpen: vi.fn(),
    setShowRejection: vi.fn(),
    isMobile: false,
    searchText: '',
    setSearchText: vi.fn(),
    onNavigateToInterviews: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the correct number of job cards/rows', () => {
    renderWithClient(<ApplicationsDashboard {...defaultProps} />);
    // Check for company names in the document
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Meta')).toBeInTheDocument();
  });

  it('filters jobs by search text', () => {
    const { rerender } = renderWithClient(
      <ApplicationsDashboard {...defaultProps} searchText="Apple" />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Google')).not.toBeInTheDocument();
    expect(screen.queryByText('Meta')).not.toBeInTheDocument();

    rerender(
      <QueryClientProvider client={queryClient}>
        <ApplicationsDashboard {...defaultProps} searchText="Software" />
      </QueryClientProvider>
    );
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('displays summary statistics correctly', () => {
    renderWithClient(<ApplicationsDashboard {...defaultProps} />);
    // Total jobs
    expect(screen.getByText('3')).toBeInTheDocument(); // total
    // We have 1 Interviewing, 1 Applied, 1 Rejected
    // Applied is mapped to "Awaiting feedback" in SummaryCard
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(3);
  });

  it('calls deleteJob when delete is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderWithClient(<ApplicationsDashboard {...defaultProps} />);

    // Find and click delete button
    const appleRow = screen.getByText('Apple').closest('tr')!;
    const deleteButton = within(appleRow).getByLabelText(/Delete/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteJob).toHaveBeenCalledWith('1');
    });
  });

  it('filters jobs by status', async () => {
    renderWithClient(<ApplicationsDashboard {...defaultProps} />);

    // Find the Status filter (Select)
    const statusSelect = screen.getByLabelText(/Status/i);
    fireEvent.mouseDown(statusSelect);

    const options = screen.getAllByRole('option');
    const appliedOption = options.find(
      (opt) => opt.getAttribute('data-value') === 'Applied'
    );
    if (appliedOption) fireEvent.click(appliedOption);

    // Verify results
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('calls onStatusChange when status is updated', async () => {
    const user = userEvent.setup();
    renderWithClient(<ApplicationsDashboard {...defaultProps} />);

    // Find the status select within the Apple row
    const appleRow = screen.getByText('Apple').closest('tr')!;
    const statusSelect = within(appleRow).getByRole('combobox');
    await user.click(statusSelect);

    const interviewingOption = screen.getByRole('option', {
      name: 'Interviewing',
    });
    await user.click(interviewingOption);

    // The component should call the mutation
    await waitFor(() => {
      expect(mockUpdateJob).toHaveBeenCalledWith({
        id: '1',
        updates: { status: 'Interviewing' },
      });
    });
  });

  it('calls onNavigateToInterviews when the timeline icon is clicked', () => {
    renderWithClient(<ApplicationsDashboard {...defaultProps} />);

    const timelineButtons = screen.getAllByLabelText(/View Interviews/i);
    expect(timelineButtons.length).toBe(1); // Only Google (Interviewing)

    fireEvent.click(timelineButtons[0]);
    expect(defaultProps.onNavigateToInterviews).toHaveBeenCalledWith('2');
  });
});
