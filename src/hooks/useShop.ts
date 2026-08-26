import { useRouter } from "next/navigation";

export interface CategorySelection {
    id: string;
    mainCategoryId?: string;
    firstCategoryId?: string;
    secondCategoryId?: string;
}

const useShop = () => {
    const router = useRouter();

    const determineCategoryKey = (category: CategorySelection): string => {
		if (category.mainCategoryId && category.firstCategoryId) {
			return "secondCategoryId";
		} else if (category.mainCategoryId) {
			return "firstCategoryId";
		} else {
			return "mainCategoryId";
		}
	};

    const handleCategoryFilter = (selectedCategory: CategorySelection): void => {
        const categoryKey = determineCategoryKey(selectedCategory);
        const updatedParams = new URLSearchParams();
        updatedParams.set(categoryKey, selectedCategory.id);
        updatedParams.set('pageNumber', "1");
        router.push(`/shop?${updatedParams.toString()}`);
    };

    return {
        handleCategoryFilter
    };
};

export default useShop;
