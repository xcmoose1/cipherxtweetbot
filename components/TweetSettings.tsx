import { Switch } from '@/components/ui/Switch';
import { TweetType } from '@/types/tweet';

interface TweetSettingsProps {
  selectedTypes: TweetType[];
  onTypesChange: (types: TweetType[]) => void;
  frequency: number;
  onFrequencyChange: (freq: number) => void;
  isActive: boolean;
  onToggleActive: (active: boolean) => void;
}

const tweetTypes: { type: TweetType; icon: string; description: string; color: string }[] = [
  {
    type: 'MARKET_TRENDS',
    icon: '📈',
    description: 'Price movements and market analysis',
    color: 'from-blue-500/20 to-blue-600/20'
  },
  {
    type: 'HYPE',
    icon: '🔥',
    description: 'Trending and viral crypto projects',
    color: 'from-red-500/20 to-red-600/20'
  },
  {
    type: 'SENTIMENT',
    icon: '🎯',
    description: 'Social sentiment and market mood',
    color: 'from-orange-500/20 to-orange-600/20'
  },
  {
    type: 'MEMECOINS',
    icon: '🚀',
    description: 'Trending meme tokens and community coins',
    color: 'from-purple-500/20 to-purple-600/20'
  },
  {
    type: 'GEM_ALERT',
    icon: '💎',
    description: 'Promising new tokens and opportunities',
    color: 'from-emerald-500/20 to-emerald-600/20'
  },
];

export default function TweetSettings({
  selectedTypes,
  onTypesChange,
  frequency,
  onFrequencyChange,
  isActive,
  onToggleActive,
}: TweetSettingsProps) {
  const handleTypeToggle = (type: TweetType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="card-body">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="card-title text-2xl">Tweet Settings</h2>
          <p className="text-base-content/70 mt-1">Configure your automated tweets</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-base-content/70">
            {isActive ? 'Active' : 'Paused'}
          </span>
          <Switch
            checked={isActive}
            onCheckedChange={onToggleActive}
          />
        </div>
      </div>
      
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Tweet Types</h3>
            <span className="text-sm text-base-content/70">
              {selectedTypes.length} selected
            </span>
          </div>
          <div className="grid gap-3">
            {tweetTypes.map(({ type, icon, description, color }) => (
              <div
                key={type}
                className={`relative overflow-hidden transition-all duration-300 ${
                  selectedTypes.includes(type)
                    ? 'ring-2 ring-primary/50 bg-gradient-to-r ' + color
                    : 'bg-base-300/50 hover:bg-base-300'
                }`}
                onClick={() => handleTypeToggle(type)}
              >
                <div className="relative p-4 backdrop-blur-sm cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {type.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-base-content/70 line-clamp-2">
                        {description}
                      </p>
                    </div>
                    <div className={`relative flex items-center justify-center w-5 h-5 rounded border transition-colors ${
                      selectedTypes.includes(type)
                        ? 'border-primary bg-primary/10'
                        : 'border-base-content/30 bg-base-200/50'
                    }`}>
                      {selectedTypes.includes(type) && (
                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tweet Frequency</h3>
            <span className="badge badge-primary">{frequency} / day</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="5"
              value={frequency}
              onChange={(e) => onFrequencyChange(Number(e.target.value))}
              className="range range-primary range-sm"
              step="1"
            />
            <div className="flex justify-between px-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className={`flex flex-col items-center transition-colors ${
                    frequency >= num ? 'text-primary' : 'text-base-content/30'
                  }`}
                >
                  <div className="w-1 h-1 rounded-full bg-current mb-1" />
                  <span className="text-xs">{num}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-base-content/70">
            Tweets will be posted approximately every {Math.round(24 / frequency)} hours
          </p>
        </div>
      </div>
    </div>
  );
}
