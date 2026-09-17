import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';

const HISTORY_KEY = 'gh_search_history';
const THEME_KEY = 'gh_theme';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function Home() {
  const [search, setSearch] = useState('');
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [error, setError] = useState('');
  const [repoFilter, setRepoFilter] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      setHistory(saved);
    } catch {
      setHistory([]);
    }
  }, []);

  function saveHistory(username) {
    setHistory((prev) => {
      const next = [username, ...prev.filter((h) => h !== username)].slice(0, 8);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function getApi(username) {
    const target = (username ?? search).trim();
    if (!target) {
      setError('Please enter a GitHub username.');
      return;
    }
    setLoadingUser(true);
    setError('');
    setRepos([]);
    setRepoFilter('');
    try {
      const response = await axios.get(`https://api.github.com/users/${target}`);
      setUserData(response.data);
      saveHistory(response.data.login);
      fetchRepos(response.data.repos_url);
    } catch (err) {
      setUserData(null);
      setRepos([]);
      if (err.response?.status === 404) {
        setError(`No GitHub user found for "${target}".`);
      } else if (err.response?.status === 403) {
        setError('GitHub API rate limit exceeded. Please try again later.');
      } else {
        setError('Something went wrong while fetching the user.');
      }
    } finally {
      setLoadingUser(false);
    }
  }

  async function fetchRepos(reposUrl) {
    setLoadingRepos(true);
    try {
      const repoResponse = await axios.get(`${reposUrl}?per_page=100`);
      setRepos(repoResponse.data);
    } catch (err) {
      console.error('Error fetching repos', err);
    } finally {
      setLoadingRepos(false);
    }
  }

  const visibleRepos = useMemo(() => {
    let list = repos.filter((r) =>
      r.name.toLowerCase().includes(repoFilter.toLowerCase())
    );
    list = [...list].sort((a, b) => {
      if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
      if (sortBy === 'forks') return b.forks_count - a.forks_count;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
    return list;
  }, [repos, repoFilter, sortBy]);

  const totalStars = useMemo(
    () => repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    [repos]
  );

  return (
    <div className="gh-app">
      <div className="gh-topbar">
        <div className="gh-brand">
          <span className="gh-brand-icon">🐙</span>
          <span>GitHub Explorer</span>
        </div>
        <button
          className="theme-toggle"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <Form
        className="gh-search"
        onSubmit={(e) => {
          e.preventDefault();
          getApi();
        }}
      >
        <Form.Control
          type="search"
          placeholder="Search GitHub username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="gh-search-input"
        />
        <Button variant="success" type="submit" disabled={loadingUser} className="gh-search-btn">
          {loadingUser ? <Spinner animation="border" size="sm" /> : 'Search'}
        </Button>
      </Form>

      {history.length > 0 && (
        <div className="gh-history">
          <span className="gh-history-label">Recent:</span>
          {history.map((h) => (
            <button
              key={h}
              className="gh-history-chip"
              onClick={() => {
                setSearch(h);
                getApi(h);
              }}
            >
              {h}
            </button>
          ))}
        </div>
      )}

      {error && (
        <Alert variant="danger" className="gh-alert" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {userData && (
        <div className="gh-content">
          <div className="gh-profile-card">
            <img src={userData.avatar_url} alt={userData.login} className="gh-avatar" />
            <div className="gh-profile-info">
              <h2>{userData.name || userData.login}</h2>
              <a href={userData.html_url} target="_blank" rel="noreferrer" className="gh-username">
                @{userData.login}
              </a>
              {userData.bio && <p className="gh-bio">{userData.bio}</p>}

              <div className="gh-meta">
                {userData.company && <span>🏢 {userData.company}</span>}
                {userData.location && <span>📍 {userData.location}</span>}
                {userData.blog && (
                  <a href={userData.blog.startsWith('http') ? userData.blog : `https://${userData.blog}`} target="_blank" rel="noreferrer">
                    🔗 {userData.blog}
                  </a>
                )}
                {userData.twitter_username && (
                  <a href={`https://twitter.com/${userData.twitter_username}`} target="_blank" rel="noreferrer">
                    🐦 @{userData.twitter_username}
                  </a>
                )}
                <span>📅 Joined {new Date(userData.created_at).toLocaleDateString()}</span>
              </div>

              <div className="gh-stats">
                <div className="gh-stat">
                  <strong>{userData.public_repos}</strong>
                  <span>Repos</span>
                </div>
                <div className="gh-stat">
                  <strong>{userData.followers}</strong>
                  <span>Followers</span>
                </div>
                <div className="gh-stat">
                  <strong>{userData.following}</strong>
                  <span>Following</span>
                </div>
                <div className="gh-stat">
                  <strong>{userData.public_gists}</strong>
                  <span>Gists</span>
                </div>
                <div className="gh-stat">
                  <strong>{totalStars}</strong>
                  <span>Total Stars</span>
                </div>
              </div>

              <a href={userData.html_url} target="_blank" rel="noreferrer">
                <Button variant="outline-light" className="mt-2" size="sm">
                  View Full Profile ↗
                </Button>
              </a>
            </div>
          </div>

          <div className="gh-repos-section">
            <div className="gh-repos-header">
              <h3>Repositories {repos.length > 0 && <Badge bg="secondary">{repos.length}</Badge>}</h3>
              {repos.length > 0 && (
                <div className="gh-repos-controls">
                  <input
                    className="gh-repo-filter"
                    placeholder="Filter repos..."
                    value={repoFilter}
                    onChange={(e) => setRepoFilter(e.target.value)}
                  />
                  <select
                    className="gh-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="updated">Recently updated</option>
                    <option value="stars">Most stars</option>
                    <option value="forks">Most forks</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              )}
            </div>

            {loadingRepos && (
              <div className="gh-loading">
                <Spinner animation="border" size="sm" /> Loading repositories...
              </div>
            )}

            {!loadingRepos && repos.length === 0 && (
              <p className="gh-empty">This user has no public repositories.</p>
            )}

            <div className="gh-repo-grid">
              {visibleRepos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="gh-repo-card"
                >
                  <div className="gh-repo-top">
                    <span className="gh-repo-name">{repo.name}</span>
                    {repo.fork && <Badge bg="secondary" className="gh-fork-badge">Fork</Badge>}
                  </div>
                  {repo.description && <p className="gh-repo-desc">{repo.description}</p>}
                  <div className="gh-repo-footer">
                    {repo.language && (
                      <span className="gh-repo-lang">
                        <span className="gh-lang-dot" />
                        {repo.language}
                      </span>
                    )}
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                    <span>Updated {timeAgo(repo.updated_at)}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {!userData && !error && !loadingUser && (
        <div className="gh-placeholder">
          <p>🔍 Search any GitHub username to view their profile and repositories.</p>
        </div>
      )}
    </div>
  );
}

export default Home;
