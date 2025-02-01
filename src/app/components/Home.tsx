'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';

import Header from './Header';
import Footer from './Footer';
import { useAppSelector, useAppDispatch, selectCount } from '@/lib/redux';
import { increment, decrement } from '@/lib/redux';

const Home = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get('title');
  const description = searchParams.get('description');
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();

  return (
    <div>
      <Header />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl text-red-600 mb-2">Hello world!</h1>
        <p>Title: {title}</p>
        <p>Description: {description}</p>
        <p>Count: {count}</p>
        <button
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          Increment
        </button>
        <button
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
