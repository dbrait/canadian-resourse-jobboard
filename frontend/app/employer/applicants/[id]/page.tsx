'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Star,
  StarOff,
  Download,
  MessageSquare,
  Clock,
  Briefcase,
  Send,
  ChevronDown,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  job_id: string;
  job_title: string;
  status: string;
  applied_at: string;
  resume_url?: string;
  cover_letter?: string;
  is_starred: boolean;
  experience_years?: number;
  skills?: string[];
  education?: {
    degree: string;
    institution: string;
    year: number;
  }[];
  experience?: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
}

interface TimelineEvent {
  id: string;
  type: 'status_change' | 'note' | 'email' | 'interview';
  content: string;
  created_at: string;
  user?: string;
}

const mockApplicant: Applicant = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@email.com',
  phone: '+1 604-555-0123',
  location: 'Vancouver, BC',
  job_id: '1',
  job_title: 'Senior Mining Engineer',
  status: 'shortlisted',
  applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  resume_url: '#',
  cover_letter: `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Mining Engineer position at your company. With over 8 years of experience in mining operations and a proven track record of optimizing production processes, I believe I would be a valuable addition to your team.

In my current role at ABC Mining, I have:
- Led the implementation of new mine planning software, resulting in 15% improvement in ore recovery
- Managed a team of 12 engineers across multiple project sites
- Developed and implemented safety protocols that reduced incidents by 40%

I am particularly drawn to your company's commitment to sustainable mining practices and innovation. I am excited about the opportunity to contribute to your team's success.

Thank you for considering my application. I look forward to discussing how my experience and skills can benefit your organization.

Best regards,
John Smith`,
  is_starred: true,
  experience_years: 8,
  skills: ['Mine Planning', 'AutoCAD', 'Project Management', 'Deswik', 'Surpac', 'Team Leadership'],
  education: [
    {
      degree: 'Bachelor of Engineering (Mining)',
      institution: 'University of British Columbia',
      year: 2015,
    },
    {
      degree: 'P.Eng Designation',
      institution: 'Engineers and Geoscientists BC',
      year: 2018,
    },
  ],
  experience: [
    {
      title: 'Senior Mining Engineer',
      company: 'ABC Mining Ltd.',
      duration: '2019 - Present',
      description: 'Lead mine planning and optimization for open pit copper operations.',
    },
    {
      title: 'Mining Engineer',
      company: 'XYZ Resources',
      duration: '2015 - 2019',
      description: 'Responsible for short-range mine planning and production scheduling.',
    },
  ],
};

const mockTimeline: TimelineEvent[] = [
  {
    id: '1',
    type: 'status_change',
    content: 'Status changed from "New" to "Reviewed"',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user: 'Jane Doe',
  },
  {
    id: '2',
    type: 'note',
    content: 'Strong candidate with relevant experience. Schedule for initial call.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user: 'Jane Doe',
  },
  {
    id: '3',
    type: 'status_change',
    content: 'Status changed from "Reviewed" to "Shortlisted"',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    user: 'Jane Doe',
  },
  {
    id: '4',
    type: 'email',
    content: 'Sent interview invitation email',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    user: 'Jane Doe',
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
  reviewed: { label: 'Reviewed', color: 'bg-purple-100 text-purple-700' },
  shortlisted: { label: 'Shortlisted', color: 'bg-amber-100 text-amber-700' },
  interviewed: { label: 'Interviewed', color: 'bg-cyan-100 text-cyan-700' },
  offered: { label: 'Offered', color: 'bg-green-100 text-green-700' },
  hired: { label: 'Hired', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

export default function ApplicantDetailPage() {
  const params = useParams();
  const [applicant, setApplicant] = useState<Applicant>(mockApplicant);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(mockTimeline);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'cover_letter'>('profile');

  const status = statusConfig[applicant.status] || statusConfig.new;

  const handleStatusChange = (newStatus: string) => {
    setApplicant((prev) => ({ ...prev, status: newStatus }));
    setTimeline((prev) => [
      {
        id: Date.now().toString(),
        type: 'status_change',
        content: `Status changed from "${status.label}" to "${statusConfig[newStatus]?.label}"`,
        created_at: new Date().toISOString(),
        user: 'You',
      },
      ...prev,
    ]);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setTimeline((prev) => [
        {
          id: Date.now().toString(),
          type: 'note',
          content: newNote,
          created_at: new Date().toISOString(),
          user: 'You',
        },
        ...prev,
      ]);
      setNewNote('');
    }
  };

  const handleToggleStar = () => {
    setApplicant((prev) => ({ ...prev, is_starred: !prev.is_starred }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/employer/applicants" className="rounded-lg p-2 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-semibold">
              {applicant.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{applicant.name}</h1>
                <button onClick={handleToggleStar} className="text-muted-foreground hover:text-amber-500">
                  {applicant.is_starred ? (
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                  ) : (
                    <StarOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-muted-foreground">
                Applied for{' '}
                <Link href={`/employer/jobs/${applicant.job_id}`} className="text-primary hover:underline">
                  {applicant.job_title}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={applicant.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`appearance-none rounded-lg py-2 pl-3 pr-8 font-medium ${status.color}`}
            >
              {Object.entries(statusConfig).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2" />
          </div>

          <a
            href={`mailto:${applicant.email}`}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 font-medium hover:bg-muted"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>

          {applicant.resume_url && (
            <a
              href={applicant.resume_url}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Resume
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 font-semibold">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${applicant.email}`} className="hover:text-primary">
                    {applicant.email}
                  </a>
                </div>
              </div>
              {applicant.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a href={`tel:${applicant.phone}`} className="hover:text-primary">
                      {applicant.phone}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{applicant.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Applied</p>
                  <p>{format(new Date(applicant.applied_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-xl border bg-card">
            <div className="border-b">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('resume')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'resume'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Resume
                </button>
                <button
                  onClick={() => setActiveTab('cover_letter')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'cover_letter'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Cover Letter
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Skills */}
                  {applicant.skills && applicant.skills.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-medium">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {applicant.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-muted px-3 py-1 text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {applicant.experience && applicant.experience.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-medium">Experience</h3>
                      <div className="space-y-4">
                        {applicant.experience.map((exp, index) => (
                          <div key={index} className="border-l-2 border-muted pl-4">
                            <h4 className="font-medium">{exp.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {exp.company} &bull; {exp.duration}
                            </p>
                            <p className="mt-1 text-sm">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {applicant.education && applicant.education.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-medium">Education</h3>
                      <div className="space-y-3">
                        {applicant.education.map((edu, index) => (
                          <div key={index}>
                            <h4 className="font-medium">{edu.degree}</h4>
                            <p className="text-sm text-muted-foreground">
                              {edu.institution} &bull; {edu.year}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'resume' && (
                <div className="flex flex-col items-center justify-center py-8">
                  <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-4 text-muted-foreground">Resume preview</p>
                  {applicant.resume_url && (
                    <a
                      href={applicant.resume_url}
                      className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Download className="h-4 w-4" />
                      Download Resume
                    </a>
                  )}
                </div>
              )}

              {activeTab === 'cover_letter' && (
                <div>
                  {applicant.cover_letter ? (
                    <div className="whitespace-pre-wrap text-sm">{applicant.cover_letter}</div>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No cover letter provided
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Timeline */}
        <div className="space-y-6">
          {/* Add Note */}
          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 font-semibold">Add Note</h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about this candidate..."
              rows={3}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Add Note
            </button>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-4 font-semibold">Activity</h3>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id} className="relative pl-6">
                  {index < timeline.length - 1 && (
                    <div className="absolute left-[9px] top-6 h-full w-px bg-border" />
                  )}
                  <div
                    className={`absolute left-0 top-1 h-[18px] w-[18px] rounded-full ${
                      event.type === 'status_change'
                        ? 'bg-blue-500'
                        : event.type === 'email'
                          ? 'bg-green-500'
                          : event.type === 'interview'
                            ? 'bg-purple-500'
                            : 'bg-gray-400'
                    }`}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      {event.type === 'status_change' && (
                        <Clock className="h-3 w-3 text-white" />
                      )}
                      {event.type === 'email' && <Mail className="h-3 w-3 text-white" />}
                      {event.type === 'note' && (
                        <MessageSquare className="h-3 w-3 text-white" />
                      )}
                      {event.type === 'interview' && (
                        <Briefcase className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm">{event.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.user} &bull;{' '}
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
