"use client";
import Image from "next/image";
import { useParams } from "react-router-dom";
import BlogCard from "../../component/card/BlogCard";
import { useAPI } from "../../hooks/useApi";
import { useEffect, useState } from "react";
import apiConfig from "../../config/api.json";
import { formatDate } from "../../utils/date-utils";
import { Link } from "react-router-dom";
import { metaDataAtom } from "../../store/global-store";
import { useAtomValue } from "jotai";
import { Helmet } from "react-helmet-async";

const BlogDetails = () => {
  const { slug } = useParams();
  const { fetchData } = useAPI();
  const [response, setResponse] = useState<any>(null);
  const metaData = useAtomValue(metaDataAtom);
  const blogMeta = metaData?.find(item => item.page?.toLowerCase().includes("blog details"));

  useEffect(() => {
    const fetchHomePageData = async () => {
      const response = await fetchData({ apiUrl: `${apiConfig.site.blogUrl}/${slug}` });
      setResponse(response);
    };
    fetchHomePageData();
  }, [slug]);

  return (
    <>
      <Helmet>
        <title>
          {(blogMeta?.metaTitle || "Blog Details")
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </title>
        <meta name="description" content={blogMeta?.metaDescription} />
        <meta name="keywords" content={blogMeta?.metaKeywords} />
      </Helmet>
      <div className="max-w-screen-2xl mx-auto px-4 py-4 my-4">
        <div>
          <Image src={response?.image || null} alt={response?.imageAltText} className="w-full h-[550px]" width={500} height={500} />
          <p className="text-2xl font-bold mt-8">{response?.title}</p>

          <div className="flex items-center gap-2 mt-3">
            <Image src={response?.image || null} alt="Author" className="w-8 h-8 rounded-full" width={32} height={32} />
            <p className="text-sm text-gray-500">
              <span className="text-gray-400">by</span>
              <span className="font-medium text-gray-700">{response?.author}</span>
              <span className="text-gray-300 px-2">|</span>
              <span>{formatDate(response?.createdAt)}</span>
            </p>
          </div>

          <div className="border border-gray-400 my-4" />
          <div dangerouslySetInnerHTML={{ __html: response?.description }} className="text-base text-gray-700" />
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col items-start gap-2">
              <p className="text-2xl font-bold">Latest News</p>
              <p className="text-lg">A world of inspiration</p>
            </div>
            <Link to={`/blog`} className="border border-[var(--color-black)] hover:bg-[var(--color-black)] hover:text-white px-8 py-2 rounded-full cursor-pointer transition-all ease-in-out duration-300">See More</Link>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-4">
            {
              response?.latestBlogList.map((latest: any) => (
                <BlogCard
                  key={latest.id}
                  image={latest.image}
                  title={latest.title}
                  author={latest.author}
                  date={latest.createdAt}
                  link={`/blog/${latest.slug}`}
                />
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetails;
