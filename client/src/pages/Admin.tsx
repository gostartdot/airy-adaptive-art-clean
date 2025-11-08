import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Check, 
  X, 
  Ban, 
  Unlock,
  LogOut,
  Search,
  Filter,
  FileText,
  Mail,
  Calendar
} from 'lucide-react';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import { userService } from '../services/userService';

// Helper function to optimize Cloudinary image URLs for faster loading
const optimizeImageUrl = (url: string, width: number = 800, height: number = 600): string => {
  if (!url || typeof url !== 'string') return url;
  
  const cloudinaryPattern = /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\//;
  
  if (cloudinaryPattern.test(url)) {
    if (url.includes('/image/upload/') && !url.includes('/image/upload/v')) {
      const transformation = `w_${width},h_${height},c_limit,q_auto:good,f_auto`;
      return url.replace(
        /\/image\/upload\//,
        `/image/upload/${transformation}/`
      );
    }
    if (url.includes('/image/upload/v')) {
      const transformation = `w_${width},h_${height},c_limit,q_auto:good,f_auto`;
      return url.replace(
        /\/image\/upload\//,
        `/image/upload/${transformation}/`
      );
    }
  }
  
  return url;
};

// Image component with loading state
const OptimizedImage: React.FC<{
  thumbnailUrl: string;
  fullSizeUrl: string;
  alt: string;
}> = ({ thumbnailUrl, fullSizeUrl, alt }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative min-h-[200px] shadow-sm hover:shadow-md transition-shadow duration-300">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        </div>
      )}
      <img
        src={thumbnailUrl}
        alt={alt}
        className="w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-300 relative z-0"
        onClick={() => window.open(fullSizeUrl, '_blank')}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          if (e.currentTarget.src !== fullSizeUrl) {
            e.currentTarget.src = fullSizeUrl;
          }
          setImageLoaded(true);
        }}
      />
    </div>
  );
};

interface User {
  _id: string;
  name?: string;
  email: string;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  salaryProofImages?: string[];
  isActive?: boolean;
  createdAt?: string;
  rejectionReason?: string;
  verifiedAt?: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isLoading && isAuthenticated && user?.role !== 'Admin') {
      navigate('/home');
    }
  }, [isAuthenticated, isLoading, user?.role, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'Admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user?.role]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const result = await userService.getAllUsers();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error: any) {
      toast.error('Failed to load users', {
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const result = await userService.approveVerification(userId);
      if (result.success) {
        toast.success('User approved successfully', {
          description: 'The user has been verified and can now access the platform.',
        });
        fetchUsers();
      }
    } catch (error: any) {
      toast.error('Failed to approve user', {
        description: error.response?.data?.error || error.message,
      });
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;
    
    try {
      const result = await userService.rejectVerification(selectedUser._id, rejectReason);
      if (result.success) {
        toast.success('User rejected', {
          description: 'The user has been notified via email.',
        });
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error: any) {
      toast.error('Failed to reject user', {
        description: error.response?.data?.error || error.message,
      });
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      const result = await userService.suspendUser(userId);
      if (result.success) {
        toast.success('User suspended', {
          description: 'The user has been suspended and cannot access the platform.',
        });
        fetchUsers();
      }
    } catch (error: any) {
      toast.error('Failed to suspend user', {
        description: error.response?.data?.error || error.message,
      });
    }
  };

  const handleUnsuspend = async (userId: string) => {
    try {
      const result = await userService.unsuspendUser(userId);
      if (result.success) {
        toast.success('User unsuspended', {
          description: 'The user can now access the platform again.',
        });
        fetchUsers();
      }
    } catch (error: any) {
      toast.error('Failed to unsuspend user', {
        description: error.response?.data?.error || error.message,
      });
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            Unknown
          </span>
        );
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.verificationStatus === filter;
    const matchesSearch = searchQuery === '' || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const pendingCount = users.filter(u => u.verificationStatus === 'pending').length;
  const approvedCount = users.filter(u => u.verificationStatus === 'approved').length;
  const rejectedCount = users.filter(u => u.verificationStatus === 'rejected').length;
  const totalCount = users.length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'Admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">User Management & Verification</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors border border-red-200 cursor-pointer active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-emerald-600">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer active:scale-95 ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter('pending')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer active:scale-95 ${
                  filter === 'pending'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('approved')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer active:scale-95 ${
                  filter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Approved ({approvedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('rejected')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer active:scale-95 ${
                  filter === 'rejected'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Rejected ({rejectedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingUsers ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No users found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Created
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem._id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm">
                            {userItem.name?.[0]?.toUpperCase() || userItem.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {userItem.name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {userItem.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(userItem.verificationStatus)}
                          {!userItem.isActive && userItem.verificationStatus === 'approved' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                              <Ban className="w-3.5 h-3.5" />
                              Suspended
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {userItem.createdAt
                          ? new Date(userItem.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {userItem.verificationStatus === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(userItem._id);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors border border-emerald-200 cursor-pointer active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(userItem);
                                  setShowRejectModal(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-colors border border-red-200 cursor-pointer active:scale-95"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(userItem);
                                  setShowProofModal(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors border border-blue-200 cursor-pointer active:scale-95"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View Proof
                              </button>
                            </>
                          )}
                          {userItem.verificationStatus === 'approved' && (
                            <>
                              {userItem.isActive ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSuspend(userItem._id);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold transition-colors border border-orange-200 cursor-pointer active:scale-95"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnsuspend(userItem._id);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors border border-emerald-200 cursor-pointer active:scale-95"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                  Unsuspend
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Reject User Verification</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Rejecting verification for: <strong className="text-gray-900">{selectedUser.email}</strong>
            </p>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason (optional)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-md cursor-pointer active:scale-95"
              >
                Reject User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Salary Proof Images Modal */}
      {showProofModal && selectedUser && selectedUser.salaryProofImages && selectedUser.salaryProofImages.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Salary Proof Images</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProofModal(false);
                  setSelectedUser(null);
                }}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {selectedUser.salaryProofImages.map((image, index) => {
                const thumbnailUrl = optimizeImageUrl(image, 400, 500);
                const fullSizeUrl = image;
                
                return (
                  <OptimizedImage
                    key={index}
                    thumbnailUrl={thumbnailUrl}
                    fullSizeUrl={fullSizeUrl}
                    alt={`Salary proof ${index + 1}`}
                  />
                );
              })}
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowProofModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer active:scale-95"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProofModal(false);
                  handleApprove(selectedUser._id);
                }}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Check className="w-5 h-5" />
                Approve User
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProofModal(false);
                  setShowRejectModal(true);
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <X className="w-5 h-5" />
                Reject User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
