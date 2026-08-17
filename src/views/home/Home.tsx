import { useEffect, useState } from 'react';
import Banner from './component/Banner';
import ProductCategory from '../../component/product-category';
import { useAPI } from '../../hooks/useApi';
import apiConfig from "../../config/api.json";
import BecomeSeller from './component/BecomeSeller';
import ProductSectionOne from './component/ProductSectionOne';
import ProductSectionTwo from './component/ProductSectionTwo';
import ProductSectionThree from './component/ProductSectionThree';
import ProductSectionFour from './component/ProductSectionFour';
import ProductSectionFive from './component/ProductSectionFive';
import ProductSectionSix from './component/ProductSectionSix';
import { useAtomValue } from 'jotai';
import { metaDataAtom } from '../../store/global-store';
import { Helmet } from 'react-helmet-async';

const Home = () => {
	const { fetchData } = useAPI();
	const [response, setResponse] = useState<any>(null);
	const metaData = useAtomValue(metaDataAtom);
	const homeMeta = metaData?.find(item => item.page?.toLowerCase().includes("home"));

	useEffect(() => {
		const fetchHomePageData = async () => {
			const response = await fetchData({ apiUrl: `${apiConfig.site.homePageUrl}` });
			setResponse(response);
		};
		fetchHomePageData();
	}, []);

	return (
		<>
			<Helmet>
				<title>
					{(homeMeta?.metaTitle || "Home")
						.split(" ")
						.map(word => word.charAt(0).toUpperCase() + word.slice(1))
						.join(" ")}
				</title>
				<meta name="description" content={homeMeta?.metaDescription} />
				<meta name="keywords" content={homeMeta?.metaKeywords} />
			</Helmet>
			<div>
				<Banner heroSliderList={response?.heroSlider} promotionList={response?.promotions} />
				<ProductCategory contentData={response?.contentData} />
				<ProductSectionOne productList={response?.sectionOneProducts} contentData={response?.contentData} />
				<ProductSectionTwo productList={response?.sectionTwoProducts} contentData={response?.contentData} />
				<ProductSectionThree productList={response?.sectionThreeProducts} contentData={response?.contentData} />
				<ProductSectionFour productList={response?.sectionFourProducts} contentData={response?.contentData} />
				<ProductSectionFive productList={response?.sectionFiveProducts} contentData={response?.contentData} />
				<ProductSectionSix productList={response?.sectionSixProducts} contentData={response?.contentData} />
				<BecomeSeller contentData={response?.contentData} />
			</div>
		</>
	)
}

export default Home;
