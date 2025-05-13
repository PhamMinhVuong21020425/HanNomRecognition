'use client';
import { useEffect, useState } from 'react';
import {
  Camera,
  Save,
  User,
  Mail,
  Phone,
  Cake,
  Info,
  PencilLine,
} from 'lucide-react';
import {
  useAppSelector,
  useAppDispatch,
  selectLanguage,
  selectUser,
  updateUserDataAsync,
} from '@/lib/redux';
import { getIntl } from '@/utils/i18n';
import { UserData } from '@/types/UserData';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Profile = () => {
  const userData = useAppSelector(selectUser);
  const locale = useAppSelector(selectLanguage);
  const intl = getIntl(locale);

  const dispatch = useAppDispatch();

  const [user, setUser] = useState<UserData>({} as UserData);

  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'metadata.profile.title' });
    if (userData) {
      setUser(userData);
    }
  }, [locale, userData]);

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setUser(prev => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Revoke the previous object URL if it exists
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateUserDataAsync({ id: user.id, data: user, avatarFile }));
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto overflow-hidden">
          <h1 className="text-3xl py-8 font-bold text-[#1d5193]">
            {intl.formatMessage({
              id: 'profile.title',
              defaultMessage: 'My profile',
            })}
          </h1>

          <div className="p-8 border-2 border-gray-200 rounded-lg">
            <form onSubmit={handleSubmit}>
              {/* Avatar Section */}
              <div className="relative mb-8">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="relative mb-4 md:mb-0 md:mr-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                      {avatarPreview || user.avatar_url ? (
                        <img
                          src={avatarPreview || user.avatar_url}
                          alt="Profile"
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <User size={64} className="text-gray-400" />
                      )}
                    </div>

                    {isEditing && (
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors"
                      >
                        <Camera size={20} />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {user.name}
                    </h2>
                    <p className="text-gray-600">{user.role}</p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-4 right-4 border border-gray-400 hover:text-blue-600 hover:border-blue-500 px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                  >
                    <PencilLine size={16} />
                    {intl.formatMessage({
                      id: 'profile.edit',
                      defaultMessage: 'Edit Profile',
                    })}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                    {intl.formatMessage({
                      id: 'profile.basic',
                      defaultMessage: 'Basic Information',
                    })}
                  </h3>

                  {/* Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {intl.formatMessage({
                        id: 'profile.name',
                        defaultMessage: 'Full Name',
                      })}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={user.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-800">{user.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {intl.formatMessage({
                        id: 'profile.email',
                        defaultMessage: 'Email',
                      })}
                    </label>
                    <div className="flex items-center">
                      <Mail size={16} className="text-gray-500 mr-2" />
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={user.email}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-800">{user.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {intl.formatMessage({
                        id: 'profile.phone',
                        defaultMessage: 'Phone',
                      })}
                    </label>
                    <div className="flex items-center">
                      <Phone size={16} className="text-gray-500 mr-2" />
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={user.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-800">{user.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                    {intl.formatMessage({
                      id: 'profile.additional',
                      defaultMessage: 'Additional Information',
                    })}
                  </h3>

                  {/* Gender */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {intl.formatMessage({
                        id: 'profile.gender',
                        defaultMessage: 'Gender',
                      })}
                    </label>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={user.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    ) : (
                      <p className="text-gray-800 capitalize">{user.gender}</p>
                    )}
                  </div>

                  {/* Birthday */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {intl.formatMessage({
                        id: 'profile.birthday',
                        defaultMessage: 'Birthday',
                      })}
                    </label>
                    <div className="flex items-center">
                      <Cake size={16} className="text-gray-500 mr-2" />
                      {isEditing ? (
                        <input
                          type="date"
                          name="birthday"
                          value={
                            typeof user.birthday === 'string'
                              ? user.birthday
                              : user.birthday instanceof Date
                                ? user.birthday.toISOString().split('T')[0]
                                : ''
                          }
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-800">
                          {formatDate(user.birthday)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* About */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {intl.formatMessage({
                        id: 'profile.about',
                        defaultMessage: 'About me',
                      })}
                    </label>
                    <div className="flex items-start">
                      <Info size={16} className="text-gray-500 mr-2 mt-1" />
                      {isEditing ? (
                        <textarea
                          name="about"
                          onChange={handleInputChange}
                          rows={4}
                          defaultValue={user.about}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                      ) : (
                        <p className="text-gray-800">
                          {user.about || 'No information provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {intl.formatMessage({
                        id: 'profile.cancel',
                        defaultMessage: 'Cancel',
                      })}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                    >
                      <Save size={18} className="mr-2" />
                      {intl.formatMessage({
                        id: 'profile.save',
                        defaultMessage: 'Save Changes',
                      })}
                    </button>
                  </>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
