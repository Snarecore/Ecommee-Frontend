export interface SecondCategory {
    id: string;
    name: string;
    slug: string;
    bannerImage: string;
    status: boolean;
    mainCategoryId: string;
    firstCategoryId: string;
}

export interface FirstCategory {
    id: string;
    name: string;
    slug: string;
    bannerImage: string;
    status: boolean;
    mainCategoryId: string;
    secondCategories: SecondCategory[];
}

export interface MainCategory {
    id: string;
    name: string;
    slug: string;
    image: string;
    bannerImage: string;
    status: boolean;
    firstCategories: FirstCategory[];
}

export interface NestedCategory {
    mainCategories: MainCategory[];
}