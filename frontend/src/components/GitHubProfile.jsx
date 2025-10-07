import React from 'react';
import { Calendar, MapPin, Building, Globe, Twitter, Users, GitFork, Star, ExternalLink } from 'lucide-react';

const GitHubProfile = ({ profile }) => {
  if (!profile) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num;
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={profile.avatar_url}
              alt={profile.name || profile.login}
              className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {profile.name || profile.login}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">@{profile.login}</p>
            {profile.bio && (
              <p className="text-gray-700 dark:text-gray-300 mt-4 text-lg leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
              {profile.company && (
                <div className="flex items-center gap-1">
                  <Building size={16} />
                  <span>{profile.company}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.blog && (
                <a
                  href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Globe size={16} />
                  <span>{profile.blog}</span>
                </a>
              )}
              {profile.twitter_username && (
                <a
                  href={`https://twitter.com/${profile.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Twitter size={16} />
                  <span>@{profile.twitter_username}</span>
                </a>
              )}
            </div>

            {/* Join Date */}
            <div className="flex items-center gap-1 mt-3 text-sm text-gray-500 dark:text-gray-500">
              <Calendar size={16} />
              <span>Joined {formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(profile.public_repos)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Repositories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(profile.followers)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(profile.following)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Following</div>
          </div>
        </div>

        {/* View Profile Button */}
        <div className="mt-6">
          <a
            href={profile.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all font-medium shadow-lg hover:shadow-xl"
          >
            View GitHub Profile
            <ExternalLink size={18} />
          </a>
        </div>
      </div>

      {/* Recent Repositories */}
      {profile.repos && profile.repos.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Repositories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.repos.map((repo) => (
              <a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-600 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    {repo.name}
                  </h3>
                  <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>
                
                {repo.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {repo.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star size={14} />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={14} />
                    {repo.forks_count}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubProfile;