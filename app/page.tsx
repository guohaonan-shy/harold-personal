import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Upcoming from "./components/Upcoming";
import Social from "./components/Social";
import Footer from "./components/Footer";
import { getGitHubProfile, getContributionChartUrl } from "./lib/github";

export default async function Home() {
  const githubProfile = await getGitHubProfile();
  const contributionChartUrl = getContributionChartUrl(githubProfile.username);

  return (
    <main className="min-h-screen bg-page">
      <Hero />
      <Projects />
      <Upcoming />
      <Social 
        username={githubProfile.username}
        avatarUrl={githubProfile.avatarUrl}
        profileUrl={githubProfile.profileUrl}
        totalCommits={githubProfile.totalCommits} 
        totalPRs={githubProfile.totalPRs}
        contributionChartUrl={contributionChartUrl}
      />
      <Footer />
    </main>
  );
}
