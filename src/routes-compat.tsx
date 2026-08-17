'use client';

import React from "react";
import NextLink from "next/link";
import { useRouter, usePathname, useParams as nextUseParams, useSearchParams as nextUseSearchParams } from "next/navigation";

// 1. Link shim
export const Link = React.forwardRef<HTMLAnchorElement, any>(
  ({ to, replace, ...props }, ref) => {
    // React Router uses 'to', Next.js uses 'href'
    const href = to || "#";
    return <NextLink href={href} replace={replace} ref={ref} {...props} />;
  }
);
Link.displayName = "Link";

// 2. NavLink shim
export const NavLink = React.forwardRef<HTMLAnchorElement, any>(
  ({ to, className, style, children, end, ...props }, ref) => {
    const pathname = usePathname();
    const href = to || "#";
    const isActive = end ? pathname === href : pathname.startsWith(href);

    const resolvedClassName = typeof className === "function" 
      ? className({ isActive }) 
      : `${className || ""} ${isActive ? "active" : ""}`.trim();

    const resolvedStyle = typeof style === "function"
      ? style({ isActive })
      : style;

    return (
      <NextLink
        href={href}
        ref={ref}
        className={resolvedClassName}
        style={resolvedStyle}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);
NavLink.displayName = "NavLink";

// 3. useNavigate shim
export function useNavigate() {
  const router = useRouter();
  return (to: any, options?: { replace?: boolean; state?: any }) => {
    if (typeof to === "number") {
      if (to === -1) {
        router.back();
      } else if (to === 1) {
        router.forward();
      }
    } else {
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    }
  };
}

// 4. useLocation shim
export function useLocation() {
  const pathname = usePathname();
  const searchParams = nextUseSearchParams();
  return {
    pathname: pathname || "/",
    search: searchParams ? `?${searchParams.toString()}` : "",
    hash: "",
    state: null,
    key: "default"
  };
}

// 5. useParams shim
export function useParams() {
  const params = nextUseParams();
  return params || {};
}

// 6. useSearchParams shim
export function useSearchParams() {
  const searchParams = nextUseSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setParams = (
    newParams: 
      | URLSearchParams 
      | ((prev: URLSearchParams) => URLSearchParams) 
      | Record<string, string>
  ) => {
    const current = new URLSearchParams(searchParams?.toString() || "");
    if (typeof newParams === "function") {
      const updated = newParams(current);
      router.push(`${pathname}?${updated.toString()}`);
    } else if (newParams instanceof URLSearchParams) {
      router.push(`${pathname}?${newParams.toString()}`);
    } else {
      Object.entries(newParams).forEach(([k, v]) => {
        if (v === undefined || v === null) {
          current.delete(k);
        } else {
          current.set(k, v);
        }
      });
      router.push(`${pathname}?${current.toString()}`);
    }
  };

  return [searchParams || new URLSearchParams(), setParams] as const;
}

// 7. Outlet shim (children layout mechanism is native in Next.js, so we mock it as a fragment)
export function Outlet() {
  return null;
}

// 8. Router mocks for compatibility (main.tsx/routes.tsx)
export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function Routes({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function Route({ element }: { element: React.ReactNode }) {
  return <>{element}</>;
}

// 9. Navigate shim
import { useEffect } from "react";
export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);
  return null;
}

