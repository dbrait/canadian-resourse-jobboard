'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Shield,
  Ban,
  Trash2,
  Eye,
  Download,
  UserCheck,
  UserX,
  Calendar,
  MapPin,
  Briefcase,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  location: string;
  joinedAt: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  role: 'user' | 'admin' | 'moderator';
  savedJobs: number;
  applications: number;
  alerts: number;
  emailVerified: boolean;
}

const users: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    location: 'Calgary, AB',
    joinedAt: '2024-01-15',
    lastActive: '2 hours ago',
    status: 'active',
    role: 'user',
    savedJobs: 12,
    applications: 5,
    alerts: 3,
    emailVerified: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    location: 'Vancouver, BC',
    joinedAt: '2024-01-10',
    lastActive: '1 day ago',
    status: 'active',
    role: 'user',
    savedJobs: 28,
    applications: 12,
    alerts: 5,
    emailVerified: true,
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    location: 'Toronto, ON',
    joinedAt: '2024-01-08',
    lastActive: '3 days ago',
    status: 'inactive',
    role: 'user',
    savedJobs: 5,
    applications: 2,
    alerts: 1,
    emailVerified: true,
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily.b@email.com',
    location: 'Edmonton, AB',
    joinedAt: '2024-01-05',
    lastActive: 'Never',
    status: 'pending',
    role: 'user',
    savedJobs: 0,
    applications: 0,
    alerts: 0,
    emailVerified: false,
  },
  {
    id: '5',
    name: 'Admin User',
    email: 'admin@resourcesjobs.ca',
    location: 'Calgary, AB',
    joinedAt: '2023-06-01',
    lastActive: '5 minutes ago',
    status: 'active',
    role: 'admin',
    savedJobs: 0,
    applications: 0,
    alerts: 0,
    emailVerified: true,
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'jwilson@email.com',
    location: 'Fort McMurray, AB',
    joinedAt: '2023-12-20',
    lastActive: '1 week ago',
    status: 'suspended',
    role: 'user',
    savedJobs: 15,
    applications: 8,
    alerts: 2,
    emailVerified: true,
  },
  {
    id: '7',
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    location: 'Saskatoon, SK',
    joinedAt: '2023-12-15',
    lastActive: '4 hours ago',
    status: 'active',
    role: 'moderator',
    savedJobs: 3,
    applications: 1,
    alerts: 0,
    emailVerified: true,
  },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const getStatusBadge = (status: User['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      suspended: 'bg-red-100 text-red-700',
      pending: 'bg-amber-100 text-amber-700',
    };
    return styles[status];
  };

  const getRoleBadge = (role: User['role']) => {
    const styles = {
      user: 'bg-blue-100 text-blue-700',
      admin: 'bg-purple-100 text-purple-700',
      moderator: 'bg-cyan-100 text-cyan-700',
    };
    return styles[role];
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="mt-1 text-muted-foreground">
            Manage registered job seekers and their accounts
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
          <Download className="h-4 w-4" />
          Export Users
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <UserCheck className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">8,234</p>
          <p className="text-sm text-green-600">+156 this week</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <UserCheck className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">6,892</p>
          <p className="text-sm text-muted-foreground">83.7% of total</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pending Verification</p>
            <Mail className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">234</p>
          <p className="text-sm text-muted-foreground">Awaiting email verify</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Suspended</p>
            <UserX className="h-5 w-5 text-red-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">23</p>
          <p className="text-sm text-muted-foreground">0.3% of total</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">
            {selectedUsers.length} user(s) selected
          </span>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted">
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
              <Ban className="h-4 w-4" />
              Suspend
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length}
                    onChange={toggleAllUsers}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Activity</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          {!user.emailVerified && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                              Unverified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(user.status)}`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadge(user.role)}`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {user.location}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <span title="Saved Jobs" className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        {user.savedJobs}
                      </span>
                      <span title="Applications" className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {user.applications}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm">{formatDate(user.joinedAt)}</p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {user.lastActive}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowActionMenu(showActionMenu === user.id ? null : user.id)
                        }
                        className="rounded-lg p-2 hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {showActionMenu === user.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-background py-1 shadow-lg">
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                            <Eye className="h-4 w-4" />
                            View Profile
                          </button>
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                            <Mail className="h-4 w-4" />
                            Send Email
                          </button>
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                            <Shield className="h-4 w-4" />
                            Change Role
                          </button>
                          <hr className="my-1" />
                          {user.status === 'suspended' ? (
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                              <UserCheck className="h-4 w-4" />
                              Reactivate
                            </button>
                          ) : (
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50">
                              <Ban className="h-4 w-4" />
                              Suspend
                            </button>
                          )}
                          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                            Delete Account
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="flex gap-1">
            <button className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
              Previous
            </button>
            <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
              1
            </button>
            <button className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
              2
            </button>
            <button className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
              3
            </button>
            <button className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
