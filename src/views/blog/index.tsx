import BlogCard from "../../component/card/BlogCard"
import { useAPI } from "../../hooks/useApi"
import { useEffect, useState } from "react"
import apiConfig from "../../config/api.json";
import { blogQueryKey } from "../../config/query-key"
import Pagination from "../../component/pagination";
import { useAtomValue } from "jotai";
import { metaDataAtom } from "../../store/global-store";
import { Helmet } from "react-helmet-async";

const Blog = () => {
	const dataLimit = 8;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
	const { usePaginatedQuery } = useAPI();
	const metaData = useAtomValue(metaDataAtom);

	const blogMeta = metaData?.find(item => item.page?.toLowerCase().includes("blog"));

	const getBlogListApiUrl = () => {
		const apiUrl = `${apiConfig.site.blogUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
		return apiUrl;
	}

	const handlePagination = (paginationData: { selected: number }) => {
		const selectedPage = paginationData.selected + 1;
		setCurrentPageNumber(selectedPage);
	};

	const {
		data: dataList,
		refetch: fetchData,
		pageCount,
	} = usePaginatedQuery({
		queryKey: [blogQueryKey],
		url: getBlogListApiUrl()
	});

	useEffect(() => {
		fetchData();
	}, [currentPageNumber]);

	return (
		<>
			<Helmet>
				<title>
					{blogMeta?.metaTitle
						?.split(" ")
						.map(word => word.charAt(0).toUpperCase() + word.slice(1))
						.join(" ")}
				</title>
				<meta name="description" content={blogMeta?.metaDescription} />
				<meta name="keywords" content={blogMeta?.metaKeywords} />
			</Helmet>

			<div className="max-w-screen-2xl mx-auto px-4 py-4 my-4 grid grid-cols-4 gap-8">
				{dataList.map((data: any) => (
					<BlogCard
						key={data.id}
						image={data.image}
						title={data.title}
						author={data.author}
						date={data.createdAt}
						link={`/blog/${data.slug}`}
					/>
				))}
			</div>
			{
				pageCount > 1 && (
					<Pagination
						pageCount={pageCount}
						currentPageNumber={currentPageNumber}
						handlePagination={handlePagination}
					/>
				)
			}
		</>
	)
}

export default Blog