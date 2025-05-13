'use client';
import '../scss/Admin.scss';
import axios from '@/lib/axios';
import { useEffect, useMemo, useState } from 'react';
import { User } from '@/entities/user.entity';
import { useAppSelector, selectLanguage, selectUser } from '@/lib/redux';
import { getIntl } from '@/utils/i18n';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import {
  Search,
  User as UserIcon,
  Mail,
  Calendar,
  Phone,
  Shield,
  Loader2,
} from 'lucide-react';

const PageSize = 10;

const Admin: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User | null;
    direction: 'ascending' | 'descending';
  }>({ key: 'name', direction: 'ascending' });

  const userData = useAppSelector(selectUser);

  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.admin.title' });
  }, [locale]);

  useEffect(() => {
    if (!userData) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/be/users');
        setAllUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [userData]);

  useEffect(() => {
    if (!allUsers) return;
    filterUsers();
  }, [allUsers, searchTerm]);

  const filterUsers = () => {
    if (!allUsers?.length) return;

    const filtered = allUsers.filter(
      user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm)) ||
        (user.role &&
          user.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredUsers(filtered);
  };

  const handleSort = (key: keyof User) => {
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });
  };

  const sortedUsers = useMemo(() => {
    if (!filteredUsers.length) return [];

    const sortableUsers = [...filteredUsers];

    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableUsers;
  }, [filteredUsers, sortConfig]);

  const currentTableData = useMemo(() => {
    if (sortedUsers.length === 0) return [];

    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return sortedUsers.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, sortedUsers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleToggleStatus = async (userId: string) => {
    const userToUpdate = allUsers.find(u => u.id === userId);
    if (!userToUpdate) return;

    setIsUpdating(userId);

    try {
      const newStatus = userToUpdate.isActivate === false;

      await axios.post(`/be/users/${userId}/update`, {
        isActivate: newStatus,
      });

      // Update local state
      const updatedUsers = allUsers.map(user => {
        if (user.id === userId) {
          return { ...user, isActivate: newStatus } as User;
        }
        return user;
      });

      setAllUsers(updatedUsers);
      setFilteredUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? ({ ...user, isActivate: newStatus } as User)
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-container">
        <div className="admin-content">
          <div className="admin-header">
            <h1 className="admin-title">
              {intl.formatMessage({ id: 'metadata.admin.title' })}
            </h1>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder={intl.formatMessage({ id: 'admin.search' })}
                value={searchTerm}
                onChange={handleSearch}
              />
              <span className="search-icon">
                <Search className="h-5 w-5 text-blue-500" />
              </span>
            </div>
          </div>
          <main>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loading />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                {intl.formatMessage({ id: 'admin.noUsers' })}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto border-b">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-blue-50">
                      <tr>
                        <th
                          scope="col"
                          className="w-1/6 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            <span>
                              {intl.formatMessage({ id: 'admin.name' })}
                            </span>
                            {sortConfig.key === 'name' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending'
                                  ? '↑'
                                  : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="w-1/5 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center">
                            <span>
                              {intl.formatMessage({ id: 'admin.email' })}
                            </span>
                            {sortConfig.key === 'email' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending'
                                  ? '↑'
                                  : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="w-1/8 px-6 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('role')}
                        >
                          <div className="flex items-center justify-center">
                            <span>
                              {intl.formatMessage({ id: 'admin.role' })}
                            </span>
                            {sortConfig.key === 'role' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending'
                                  ? '↑'
                                  : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="w-1/7 px-6 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('birthday')}
                        >
                          <div className="flex items-center justify-center">
                            <span>
                              {intl.formatMessage({ id: 'admin.birthday' })}
                            </span>
                            {sortConfig.key === 'birthday' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending'
                                  ? '↑'
                                  : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="w-1/7 px-6 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider"
                        >
                          {intl.formatMessage({ id: 'admin.contact' })}
                        </th>
                        <th
                          scope="col"
                          className="w-1/8 px-6 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider"
                        >
                          {intl.formatMessage({ id: 'admin.status' })}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentTableData.map(user => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.avatar_url ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={user.avatar_url}
                                    alt={user.name}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <UserIcon className="h-5 w-5 text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div
                                  className="text-sm font-medium text-gray-900 truncate max-w-[200px]"
                                  title={user.name}
                                >
                                  {user.name}
                                </div>
                                <div
                                  className="text-sm text-gray-500 truncate max-w-[120px]"
                                  title={user.gender || 'N/A'}
                                >
                                  {user.gender || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="h-4 w-4 min-w-[16px] mr-2 text-gray-400" />
                              <span
                                className="truncate max-w-[200px]"
                                title={user.email}
                              >
                                {user.email}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center">
                              <span
                                className={`px-2 py-1 flex items-center text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}
                                title={user.role || 'User'}
                              >
                                <Shield className="h-3.5 w-3.5 mr-1" />{' '}
                                <span className="truncate max-w-[80px]">
                                  {user.role || 'User'}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-left text-sm text-gray-500">
                              <Calendar className="h-4 w-4 min-w-[16px] mr-2 text-gray-400" />
                              <span
                                className="truncate max-w-[90px]"
                                title={formatDate(user.birthday)}
                              >
                                {formatDate(user.birthday)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {user.phone ? (
                              <div className="flex items-center justify-center text-sm text-gray-500">
                                <Phone className="h-4 w-4 min-w-[16px] mr-2 text-gray-400" />
                                <span
                                  className="truncate max-w-[80px]"
                                  title={user.phone}
                                >
                                  {user.phone}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium min-w-[200px]">
                            <div className="flex items-center justify-center">
                              <div className="relative flex items-center justify-center">
                                <span
                                  className={`mr-3 text-sm font-medium ${
                                    user.isActivate !== false
                                      ? 'text-green-700'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {user.isActivate !== false
                                    ? intl.formatMessage({
                                        id: 'admin.active',
                                      })
                                    : intl.formatMessage({
                                        id: 'admin.inactive',
                                      })}
                                </span>

                                {/* Toggle switch */}
                                <label className="inline-flex relative items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={user.isActivate !== false}
                                    onChange={() => handleToggleStatus(user.id)}
                                    disabled={isUpdating === user.id}
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                                    {isUpdating === user.id && (
                                      <span className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="h-4 w-4 text-blue-700 animate-spin" />
                                      </span>
                                    )}
                                  </div>
                                </label>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-sm text-gray-700 mt-4">
                  {`Showing ${(currentPage - 1) * PageSize + 1} to ${Math.min(currentPage * PageSize, filteredUsers.length)} of ${filteredUsers.length} users`}
                </div>
                <div className="py-4 flex items-center justify-center border-gray-200 mt-4">
                  <Pagination
                    className="pagination-bar"
                    currentPage={currentPage}
                    totalCount={filteredUsers.length}
                    pageSize={PageSize}
                    onPageChange={page => setCurrentPage(page)}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
