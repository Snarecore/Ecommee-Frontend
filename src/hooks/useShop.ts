import { useSearchParams } from "react-router-dom";

export interface CategorySelection {
    id: string;
    mainCategoryId?: string;
    firstCategoryId?: string;
    secondCategoryId?: string;
}

const useShop = () => {
    const [_, setSearchParams] = useSearchParams();

    const determineCategoryKey = (category: CategorySelection): string => {
		if (category.mainCategoryId && category.firstCategoryId && category.secondCategoryId) {
			return "thirdCategoryId";
		} else if (category.mainCategoryId && category.firstCategoryId) {
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
        setSearchParams(updatedParams);
    };

    return {
        handleCategoryFilter
    };
};

export default useShop;
