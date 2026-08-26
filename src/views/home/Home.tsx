'use client';

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
interface HomeProps {
	initialData?: any;
}

const Home = ({ initialData }: HomeProps) => {
	const { fetchData } = useAPI();
	const [response, setResponse] = useState<any>(initialData || null);

	useEffect(() => {
		if (initialData) return;
		const fetchHomePageData = async () => {
			const res = await fetchData({ apiUrl: `${apiConfig.site.homePageUrl}` });
			setResponse(res);
		};
		fetchHomePageData();
	}, [initialData]);

	return (
		<div>
			<Banner heroSliderList={response?.heroSlider} promotionList={response?.promotions} />
			<ProductCategory contentData={response?.contentData} featuredCategories={response?.featuredCategories} />
			<ProductSectionOne productList={response?.sectionOneProducts} contentData={response?.contentData} />
			<ProductSectionTwo productList={response?.sectionTwoProducts} contentData={response?.contentData} />
			<ProductSectionThree productList={response?.sectionThreeProducts} contentData={response?.contentData} />
			<ProductSectionFour productList={response?.sectionFourProducts} contentData={response?.contentData} />
			<ProductSectionFive productList={response?.sectionFiveProducts} contentData={response?.contentData} />
			<ProductSectionSix productList={response?.sectionSixProducts} contentData={response?.contentData} />
			<BecomeSeller contentData={response?.contentData} />
		</div>
	);
}

export default Home;
