import React from 'react';
import axios from '@/lib/axios';

const fetchData = async () => {
  const res = await axios.get('/be');
  return res.data;
};

const UserPage = async () => {
  const data = await fetchData();
  return (
    <div>
      <h1 className="text-2xl font-bold text-red-500">User Page</h1>
      <p>{data.title}</p>
      <p>{data.description}</p>
    </div>
  );
};

export const metadata = {
  title: 'User Page',
  description: 'User page description',
};

export default UserPage;
