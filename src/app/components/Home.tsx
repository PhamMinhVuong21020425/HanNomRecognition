'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';

const Home = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get('title');
  const description = searchParams.get('description');
  return (
    <div>
      <h1 className="text-2xl text-red-500">Hello world!</h1>
      <p>Title: {title}</p>
      <p>Description: {description}</p>
    </div>
  );
};

export default Home;
