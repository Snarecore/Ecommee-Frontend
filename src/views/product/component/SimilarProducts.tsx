import React from "react";
import ProductCardOne from "../../../component/card/product/ProductCardOne";

interface SimilarProductsProps {
  relatedProducts: any[];
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ relatedProducts }) => {
  if (!relatedProducts || relatedProducts.length === 0) return null;

  // Display up to 10 products with smooth responsive grid wrapping
  const displayedProducts = relatedProducts.slice(0, 10);

  return (
    <div className="mt-1 sm:mt-12">
      <p className="text-2xl font-bold text-[var(--color-black-primary)] mb-6">Similar Products</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {displayedProducts.map((product, index) => (
          <div key={index} className="w-full">
            <ProductCardOne product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
