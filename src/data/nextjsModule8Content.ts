import type { Module } from "../types"

export const nextjsModule8: Module = {
  id: 8,
  title: "Metadata, SEO & Optimization",
  status: "upcoming",
  lessons: [
    {
      name: "The Metadata API",
      minutes: 8,
      intro: "Setting a page's title, description, and social preview tags — the framework-native way.",
      content: `### Static metadata: exporting an object

\`\`\`tsx
// app/about/page.tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about our mission and team.",
}

export default function AboutPage() {
  return <h1>About Us</h1>
}
\`\`\`

Exporting a \`metadata\` object from any \`page.tsx\` or \`layout.tsx\` is the App Router's built-in equivalent of manually writing \`<title>\`/\`<meta>\` tags — Next.js injects them into the rendered \`<head>\` automatically. No separate \`<Head>\` component to manage, unlike some older React frameworks.

### Metadata merges from layouts down to pages

\`\`\`tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: "%s | My Site",
    default: "My Site",
  },
}
\`\`\`

\`\`\`tsx
// app/about/page.tsx
export const metadata: Metadata = {
  title: "About",   // becomes "About | My Site", via the parent's template
}
\`\`\`

A root layout can define a title **template** — every page's own title gets substituted into \`%s\`, giving consistent branding across every page's browser tab without repeating the site name in every single \`page.tsx\`.

### Dynamic metadata for dynamic routes

\`\`\`tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  return <article>{post.title}</article>
}
\`\`\`

For a dynamic route, a static \`metadata\` export can't know the specific post's title ahead of time — \`generateMetadata\` is an \`async\` function version that receives the same \`params\` as the page itself, letting you fetch the actual data needed to build accurate, per-page metadata.

### Open Graph and Twitter card metadata

\`\`\`tsx
export const metadata: Metadata = {
  title: "My Blog Post",
  openGraph: {
    title: "My Blog Post",
    description: "A great read.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
}
\`\`\`

The same \`og:*\`/\`twitter:*\` tags covered conceptually in the HTML course's metadata module, here expressed as plain TypeScript object properties instead of hand-written \`<meta>\` tags — Next.js generates the correct markup from this object automatically.

> **Key idea:** the \`metadata\` export (static) and \`generateMetadata\` function (dynamic, when the content depends on route params) are Next.js's structured, type-checked replacement for hand-writing \`<head>\` tags — and they merge sensibly from layouts down to individual pages.`,
    },
    {
      name: "Image Optimization with next/image",
      minutes: 9,
      intro: "Automatic resizing, lazy loading, and layout-shift prevention for every image.",
      content: `### The problem next/image solves

Recall from the HTML course: unoptimized images are one of the most common causes of slow page loads, and missing \`width\`/\`height\` causes layout shift as images pop in. \`next/image\` addresses both automatically, without you hand-managing responsive \`srcset\` markup yourself.

### Basic usage

\`\`\`tsx
import Image from "next/image"

export function Avatar() {
  return (
    <Image
      src="/profile.jpg"
      alt="User profile photo"
      width={200}
      height={200}
    />
  )
}
\`\`\`

\`width\`/\`height\` here aren't just rendering hints — Next.js uses them to reserve the correct space before the image loads (preventing layout shift, exactly as recommended in the HTML course) and to generate appropriately-sized variants.

### What happens automatically

- **Resizing** — Next.js generates and serves an appropriately sized image for the viewer's actual screen, instead of shipping one large file to every device.
- **Modern formats** — automatically serves WebP or AVIF to browsers that support them, falling back to the original format otherwise — the same idea as the \`<picture>\`-based format fallback from the HTML course, handled without you writing any \`<source>\` tags.
- **Lazy loading** — images below the fold aren't downloaded until they're about to scroll into view, by default.
- **No layout shift** — space is reserved immediately, using the \`width\`/\`height\` you provided.

### fill: when you don't know the exact dimensions

\`\`\`tsx
<div style={{ position: "relative", width: "100%", height: "400px" }}>
  <Image src="/hero.jpg" alt="Hero banner" fill style={{ objectFit: "cover" }} />
</div>
\`\`\`

\`fill\` makes the image expand to completely fill its nearest positioned parent — useful when an image's size is determined by its container's CSS layout, rather than a fixed pixel size known ahead of time. The parent needs \`position: relative\` (or similar) for this to work correctly.

### Marking above-the-fold images as a priority

\`\`\`tsx
<Image src="/hero.jpg" alt="Hero banner" width={1200} height={600} priority />
\`\`\`

By default, every image is lazy-loaded — for an image visible immediately on page load (a hero banner, a logo), \`priority\` disables lazy loading and hints the browser to fetch it early, since waiting to lazy-load something already on screen would actually hurt, not help, load performance.

### Remote images need explicit configuration

\`\`\`ts
// next.config.js
module.exports = {
  images: {
    remotePatterns: [{ hostname: "images.example.com" }],
  },
}
\`\`\`

For security, \`next/image\` refuses to optimize images from a domain not explicitly allow-listed in \`next.config.js\` — without this, an \`<Image src="https://images.example.com/...">\` throws an error at build/runtime.

> **Key idea:** \`next/image\` automates nearly everything the HTML course's responsive-images lesson covered by hand (\`srcset\`, format fallback, reserved dimensions) — the main things you still control explicitly are \`priority\` for above-the-fold images and allow-listing remote domains.`,
    },
    {
      name: "Font Optimization with next/font",
      minutes: 7,
      intro: "Self-hosting web fonts with zero layout shift and no external network requests.",
      content: `### The problem with a typical Google Fonts <link>

\`\`\`html
<!-- the traditional approach -->
<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet">
\`\`\`

Loading a font this way means an extra network request to an external domain, a brief flash of unstyled or fallback text while the font loads (layout shift as text reflows once the real font arrives), and a privacy/performance dependency on a third-party server for every single page load.

### next/font/google: automatically self-hosted

\`\`\`tsx
// app/layout.tsx
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
\`\`\`

Despite importing from \`next/font/google\`, the actual font file is downloaded **at build time** and served from your own domain — no runtime request to Google's servers at all, and no external network dependency for visitors. Next.js also automatically applies \`font-display: swap\`-equivalent behavior and computes fallback font metrics to minimize layout shift while the font loads.

### Using a local font file

\`\`\`tsx
import localFont from "next/font/local"

const myFont = localFont({ src: "./my-custom-font.woff2" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={myFont.className}>
      <body>{children}</body>
    </html>
  )
}
\`\`\`

For a custom or licensed font not available through Google Fonts, \`next/font/local\` applies the exact same optimization (self-hosting, layout-shift minimization) to a font file already in your project.

### Applying a font to specific components, not just globally

\`\`\`tsx
import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({ subsets: ["latin"], weight: "700" })

export function Headline({ children }: { children: React.ReactNode }) {
  return <h1 className={playfair.className}>{children}</h1>
}
\`\`\`

A font doesn't have to be applied at the root layout level — importing and applying it to a specific component's \`className\` scopes the font to just that part of the UI, useful for a display font used only in headlines alongside a different body-text font elsewhere.

> **Key idea:** \`next/font\` downloads and self-hosts fonts at build time, even when importing from \`next/font/google\` — the font ends up served from your own domain with no external request and minimal layout shift, a meaningfully different (and faster) result than a plain \`<link>\` tag.`,
    },
    {
      name: "next/link & Navigation Performance",
      minutes: 8,
      intro: "How Link's prefetching makes navigation feel instant, and when to opt out.",
      content: `### Prefetching, recapped and expanded

Introduced briefly in the routing module — worth a closer, performance-focused look here. By default, \`<Link>\` **prefetches** the linked page's code (and, for static routes, its data) as soon as the link enters the viewport — meaning by the time a user actually clicks, most of the work is already done, and navigation feels close to instant.

\`\`\`tsx
import Link from "next/link"

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={\`/blog/\${post.slug}\`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  )
}
\`\`\`

For a long list of links (like this one), every visible link is prefetched automatically — no configuration needed to get this behavior.

### Disabling prefetch when it's not worth it

\`\`\`tsx
<Link href="/rarely-visited-page" prefetch={false}>
  Terms of Service
</Link>
\`\`\`

Prefetching costs bandwidth and a small amount of server work — for links that are very unlikely to be clicked (footer legal links, for instance), or for a page list so long that prefetching every visible link would be wasteful, \`prefetch={false}\` opts a specific link out.

### Why <Link> beats a plain <a> beyond just avoiding reloads

Recall from the routing module: \`<Link>\` performs client-side navigation instead of a full page reload. Combined with prefetching, the practical result is that navigating a well-built Next.js app feels closer to a single-page app's instant transitions than a traditional multi-page site's click-and-wait — while still getting all the SEO and initial-load benefits of server rendering, because the *first* visit to any page is still a real server-rendered response.

### Scroll restoration

\`\`\`tsx
<Link href="/blog" scroll={false}>
  Back to blog
</Link>
\`\`\`

By default, navigating to a new page scrolls to the top, and the browser's native back/forward restores the previous scroll position. \`scroll={false}\` disables the scroll-to-top behavior on that specific navigation — useful for something like a tab switch within the same general page area, where jumping to the top would be jarring.

### The overall performance story, tied together

Everything in this module compounds: \`next/image\` and \`next/font\` reduce what needs to load in the first place, and \`<Link>\`'s prefetching means the *next* page a user is likely to visit is often already loaded by the time they click — together, a meaningfully faster experience than the sum of any one piece alone.

> **Key idea:** \`<Link>\`'s automatic prefetching is what makes client-side navigation in Next.js feel instant — it's a default behavior worth understanding explicitly, including when to deliberately turn it off for low-value or very numerous links.`,
    },
  ],
}
