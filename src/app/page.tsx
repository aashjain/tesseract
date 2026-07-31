import { ExperienceShell } from '@/components/story/ExperienceShell';
import { content } from '@/lib/content/repository';

export default async function HomePage() {
  const [settings, home, capabilities, projects, people] = await Promise.all([
    content.siteSettings(),
    content.homeExperience(),
    content.capabilities(),
    content.projects(),
    content.people(),
  ]);

  return (
    <ExperienceShell
      settings={settings}
      home={home}
      capabilities={capabilities}
      projects={projects}
      people={people}
    />
  );
}
