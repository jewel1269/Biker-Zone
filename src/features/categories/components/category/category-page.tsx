"use client";

import Image from "next/image";
import { ProductCard } from "@/features/products/components/product/product-card";
import { useCategoryBySlug } from "../../hooks/use-category-by-product";
import ProductSkeleton from "../skeleton/product-skeleton";

type ProductLike = {
  id?: string | number;
};

const formatCategoryName = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const CategoryPage = ({ slug }: { slug: string }) => {
  const { categoryProducts, isLoading, isError } = useCategoryBySlug(slug);

  const categoryName = formatCategoryName(slug) || "Category";
  const bannerImage = categoryProducts?.image || "/placeholder-category.jpg";
  const products = (categoryProducts?.products ?? []) as ProductLike[];
  const productCount = products.length;

  if (isError) {
    return (
      <div className="flex min-h-[420px] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-200/70">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Service Notice
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Unable to load this category
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Something went wrong while loading products. Please refresh and try
            again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/70 pb-24">
      <section className="relative isolate h-[250px] overflow-hidden border-b border-slate-200/80 md:h-[380px]">
        <Image
          src={bannerImage}
          alt={`${categoryName} Banner`}
          fill
          priority
          className="object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/55 to-slate-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_42%)]" />

        <div className="container relative mx-auto flex h-full items-end px-4 pb-8 lg:px-8 md:pb-12">
          <div className="max-w-3xl text-white">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-200">
              Curated Collection
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[0.02em] md:text-5xl">
              {categoryName}
            </h1>
            <p className="mt-3 text-sm text-slate-200 md:text-base">
              Discover a selection tailored for performance, design, and premium
              craftsmanship.
            </p>
          </div>
        </div>
      </section>

      <div className="container relative z-10 mx-auto -mt-8 px-4 lg:px-8 md:-mt-10">
        <div className="rounded-xl border border-slate-200/90 bg-white/95 px-6 py-5 shadow-[0_24px_70px_-35px_rgba(2,6,23,0.45)] backdrop-blur md:px-8 md:py-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="hidden h-10 w-1 rounded-full bg-slate-900 md:block" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Corporate Catalog
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 md:text-2xl">
                  {categoryName}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:flex md:items-center">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-center md:text-left">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  Products
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {isLoading ? "--" : productCount}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-center md:text-left">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  Collection Type
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Premium
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 md:mt-12">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-base font-semibold uppercase tracking-[0.1em] text-slate-800 md:text-lg">
              Available Products
            </h3>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.1em] text-slate-600">
              {isLoading
                ? "Loading"
                : `${productCount} Item${productCount === 1 ? "" : "s"}`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4 xl:grid-cols-5">
            {isLoading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              : products.map((product, index) => (
                  <div
                    key={product.id ?? index}
                    className="group rounded-xl border border-slate-200/90 bg-white/90 p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/40"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>

          {!isLoading && productCount === 0 && (
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
                No Inventory Found
              </p>
              <p className="mt-2 text-sm text-slate-600">
                We are currently updating this collection. Please check back
                soon.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CategoryPage;
