import type { Metadata } from "next";
import BlogDetails from "@/views/blog-details";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/";
  
  try {
    const res = await fetch(`${baseUrl}site/blog/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const blog = await res.json();
      if (blog) {
        return {
          title: `${blog.title || "Blog Details"} | Bazaarbound`,
          description: blog.summary || blog.shortDescription || `Read ${blog.title || "this blog"} on Bazaarbound.`,
          openGraph: {
            title: blog.title,
            description: blog.summary || blog.shortDescription,
            images: blog.image ? [{ url: blog.image }] : [],
          },
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch blog metadata for SEO:", error);
  }

  return {
    title: "Blog Details | Bazaarbound",
    description: "Read the latest news and guides on Bazaarbound.",
  };
}

export default function BlogDetailPage() {
  return <BlogDetails />;
}
