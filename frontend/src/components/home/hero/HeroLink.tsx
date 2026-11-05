import { Link } from '@/navigation';

// Lien de bouton du hero : page du site (/catalogue…, langue gardée) ou site externe (nouvel onglet)
export default function HeroLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return <Link href={href} className={className}>{children}</Link>;
}

// next/image n'optimise que les domaines déclarés dans next.config.ts
const DOMAINES_OPTIMISES = ['res.cloudinary.com', 'images.unsplash.com'];
export const imageNonOptimisee = (src: string) => {
  try {
    return !DOMAINES_OPTIMISES.includes(new URL(src).hostname);
  } catch {
    return true;
  }
};
