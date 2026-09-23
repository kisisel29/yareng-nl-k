import { CommentSection } from '../comments/CommentSection';
import { ReactionBar } from '../columnists/ReactionBar';
import { SocialShareButtons } from '../columnists/SocialShareButtons';

/** Haber, köşe yazısı ve sima sayfalarında ortak paylaşım + emoji + yorum bloğu */
export function ContentEngagement({
  url,
  title,
  targetKey,
}: {
  url: string;
  title: string;
  targetKey: string;
}) {
  return (
    <section className="mt-10" aria-label="Paylaşım, tepki ve yorumlar">
      <SocialShareButtons url={url} title={title} />
      <ReactionBar targetKey={targetKey} />
      <CommentSection targetKey={targetKey} />
    </section>
  );
}
