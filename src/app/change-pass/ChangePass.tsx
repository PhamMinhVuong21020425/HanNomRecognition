'use client';
import axios from '@/lib/axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAppSelector, selectLanguage, selectUser } from '@/lib/redux';
import { getIntl } from '@/utils/i18n';

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

const ChangePass = () => {
  const userData = useAppSelector(selectUser);
  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password requirements
  const passwordRequirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: intl.formatMessage({
        id: 'password.requirement.length',
        defaultMessage: 'At least 8 characters long',
      }),
      validator: password => password.length >= 8,
    },
    {
      id: 'uppercase',
      label: intl.formatMessage({
        id: 'password.requirement.uppercase',
        defaultMessage: 'Contains uppercase letter',
      }),
      validator: password => /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: intl.formatMessage({
        id: 'password.requirement.lowercase',
        defaultMessage: 'Contains lowercase letter',
      }),
      validator: password => /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: intl.formatMessage({
        id: 'password.requirement.number',
        defaultMessage: 'Contains number',
      }),
      validator: password => /\d/.test(password),
    },
    {
      id: 'special',
      label: intl.formatMessage({
        id: 'password.requirement.special',
        defaultMessage: 'Contains special character',
      }),
      validator: password => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.changepass.title' });
  }, [locale]);

  const checkAllRequirements = () => {
    return passwordRequirements.every(req => req.validator(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userData) return;

    // Check if new password meets all requirements
    if (!checkAllRequirements()) {
      setError('password.error.requirements');
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('password.error.match');
      return;
    }

    // Check if current password is matched to new password
    if (currentPassword === newPassword) {
      setError('password.error.same');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to change password
      const response = await axios.post(
        `/be/users/${userData.id}/change-pass`,
        {
          currentPassword,
          newPassword,
        }
      );
      if (response.data.success === false) {
        setError(response.data.message);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError((err as Error).message || 'password.error.unknown');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto overflow-hidden">
          <h1 className="text-3xl py-8 font-bold text-[#1d5193]">
            {intl.formatMessage({
              id: 'password.change.title',
              defaultMessage: 'Change Password',
            })}
          </h1>

          <div className="p-8 border-2 border-gray-200 rounded-lg">
            {success ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
                <p className="mt-4 text-lg font-medium text-gray-900">
                  {intl.formatMessage({
                    id: 'password.change.success',
                    defaultMessage: 'Password changed successfully!',
                  })}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {intl.formatMessage({
                    id: 'password.change.redirecting',
                    defaultMessage: 'Redirecting to your account...',
                  })}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Security Header Section */}
                <div className="relative mb-8">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="relative mb-4 md:mb-0 md:mr-8">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-blue-50 flex items-center justify-center">
                        <KeyIcon size={32} className="text-[#1d5193]" />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {intl.formatMessage({
                          id: 'password.security',
                          defaultMessage: 'Account Security',
                        })}
                      </h2>
                      <p className="text-gray-600">
                        {intl.formatMessage({
                          id: 'password.security.message',
                          defaultMessage:
                            'Update your password to keep your account secure',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                      <p className="ml-2 text-sm text-red-600">
                        {intl.formatMessage({ id: error })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                      {intl.formatMessage({
                        id: 'password.section',
                        defaultMessage: 'Password Information',
                      })}
                    </h3>

                    {/* Current Password */}
                    <div className="mb-4">
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {intl.formatMessage({
                          id: 'password.current',
                          defaultMessage: 'Current Password',
                        })}
                      </label>
                      <div className="relative">
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 px-3 flex items-center"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="mb-4">
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {intl.formatMessage({
                          id: 'password.new',
                          defaultMessage: 'New Password',
                        })}
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 px-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-4">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {intl.formatMessage({
                          id: 'password.confirm',
                          defaultMessage: 'Confirm New Password',
                        })}
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 px-3 flex items-center"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {newPassword &&
                        confirmPassword &&
                        newPassword !== confirmPassword && (
                          <p className="mt-1 text-xs text-red-600">
                            {intl.formatMessage({
                              id: 'password.error.match',
                              defaultMessage: 'Passwords do not match',
                            })}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                      {intl.formatMessage({
                        id: 'password.requirements.title',
                        defaultMessage: 'Password Requirements',
                      })}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {intl.formatMessage({
                        id: 'password.requirements.description',
                        defaultMessage:
                          'To ensure your account security, your password must meet all the following requirements:',
                      })}
                    </p>
                    <div className="space-y-2 mb-4">
                      <ul className="space-y-3">
                        {passwordRequirements.map(requirement => (
                          <li
                            key={requirement.id}
                            className="flex items-center"
                          >
                            {requirement.validator(newPassword) ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-gray-300 mr-2" />
                            )}
                            <span
                              className={
                                requirement.validator(newPassword)
                                  ? 'text-green-700 text-sm'
                                  : 'text-gray-500 text-sm'
                              }
                            >
                              {requirement.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                      <p className="text-sm text-blue-800">
                        {intl.formatMessage({
                          id: 'password.tip',
                          defaultMessage:
                            'Tip: A strong password is easy for you to remember but hard for others to guess.',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {intl.formatMessage({
                      id: 'password.cancel',
                      defaultMessage: 'Cancel',
                    })}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center ${
                      isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {intl.formatMessage({
                          id: 'password.change.processing',
                          defaultMessage: 'Processing...',
                        })}
                      </>
                    ) : (
                      intl.formatMessage({
                        id: 'password.change.action',
                        defaultMessage: 'Change Password',
                      })
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChangePass;
