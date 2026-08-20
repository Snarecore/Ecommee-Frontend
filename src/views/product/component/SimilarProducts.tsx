import React from "react";
import ProductCardOne from "../../../component/card/product/ProductCardOne";

interface SimilarProductsProps {
  relatedProducts: any[];
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ relatedProducts }) => {
  if (!relatedProducts || relatedProducts.length === 0) return null;

  // Limit to 4 products to keep it in a single row on desktop
  const displayedProducts = relatedProducts.slice(0, 4);

  return (
    <div className="mt-12">
      <p className="text-2xl font-bold text-[var(--color-black-primary)] mb-6">Similar Products</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
