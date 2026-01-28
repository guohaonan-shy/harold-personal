// GitHub API utilities for fetching user profile and statistics

export interface GitHubProfile {
  username: string;
  avatarUrl: string;
  profileUrl: string;
  totalCommits: number;
  totalPRs: number;
}

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "guohaonan-shy";

export function getGitHubUsername(): string {
  return GITHUB_USERNAME;
}

export async function getGitHubProfile(): Promise<GitHubProfile> {
  const token = process.env.GITHUB_TOKEN;
  const username = GITHUB_USERNAME;

  // Fallback data
  const fallbackData: GitHubProfile = {
    username,
    avatarUrl: `https://github.com/${username}.png`,
    profileUrl: `https://github.com/${username}`,
    totalCommits: 200,
    totalPRs: 15,
  };

  // If no token, return fallback data
  if (!token) {
    console.warn("GITHUB_TOKEN not set, using fallback data");
    return fallbackData;
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        login
        avatarUrl
        url
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
      next: { revalidate: 21600 }, // Cache for 6 hours
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0]?.message || "GraphQL error");
    }

    const user = data.data?.user;
    const contributions = user?.contributionsCollection;

    return {
      username: user?.login || username,
      avatarUrl: user?.avatarUrl || fallbackData.avatarUrl,
      profileUrl: user?.url || fallbackData.profileUrl,
      totalCommits: contributions?.totalCommitContributions || 0,
      totalPRs: contributions?.totalPullRequestContributions || 0,
    };
  } catch (error) {
    console.error("Failed to fetch GitHub profile:", error);
    return fallbackData;
  }
}

// Generate contribution chart URL (using ghchart.rshah.org)
export function getContributionChartUrl(username: string, color: string = "27C93F"): string {
  return `https://ghchart.rshah.org/${color}/${username}`;
}
