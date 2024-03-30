import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { getToken } from "next-auth/jwt";
import { CustomMiddleware } from "./chain";
import { i18nConfig } from "../../i18nConfig";

const protectedPaths = ["/dashboard"];
const routesThatAccessMustDenyAfterSignin = ["/signin"];

function getProtectedRoutes(protectedPaths: string[], locales: string[]) {
  let protectedPathsWithLocale = [...protectedPaths];

  protectedPaths.forEach((route) => {
    locales.forEach(
      (locale) =>
        (protectedPathsWithLocale = [
          ...protectedPathsWithLocale,
          `/${locale}${route}`,
        ])
    );
  });

  return protectedPathsWithLocale;
}

export function authMiddleware(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const response = NextResponse.next();

    const token = await getToken({ req: request });

    // @ts-ignore
    request.nextauth = request.nextauth || {};
    // @ts-ignore
    request.nextauth.token = token;
    const pathname = request.nextUrl.pathname;

    const protectedPathWithLocale = getProtectedRoutes(protectedPaths, [
      ...i18nConfig.locales,
    ]);

    if (!token && protectedPathWithLocale.includes(pathname)) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const routesThatAccessMustDenyAfterSigninWithLocale = getProtectedRoutes(
      routesThatAccessMustDenyAfterSignin,
      [...i18nConfig.locales]
    );

    if (
      token &&
      routesThatAccessMustDenyAfterSigninWithLocale.includes(pathname)
    ) {
      const home_page = new URL("/", request.url);
      return NextResponse.redirect(home_page);
    }

    return middleware(request, event, response);
  };
}
