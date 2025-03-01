'use client';

import { useState } from 'react';
import TweetSettings from '@/components/TweetSettings';
import TweetPreview from '@/components/TweetPreview';
import ApiStatus from '@/components/ApiStatus';
import TwitterAuth from '@/components/TwitterAuth'; // added import statement
import { TweetType } from '@/types/tweet';

export default function Dashboard() {
  const [selectedTweetTypes, setSelectedTweetTypes] = useState<TweetType[]>([]);
  const [tweetFrequency, setTweetFrequency] = useState(60);
  const [isActive, setIsActive] = useState(false);

  return (
    <main className="container mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">CipherX Tweet Dashboard</h1>
      </div>

      <ApiStatus />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl mb-8">
            <TwitterAuth />
          </div>
          <div className="card bg-base-100 shadow-xl">
            <TweetPreview 
              selectedTypes={selectedTweetTypes}
            />
          </div>
        </div>
        <div>
          <div className="card bg-base-100 shadow-xl">
            <TweetSettings 
              selectedTypes={selectedTweetTypes}
              onTypesChange={setSelectedTweetTypes}
              frequency={tweetFrequency}
              onFrequencyChange={setTweetFrequency}
              isActive={isActive}
              onToggleActive={setIsActive}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
