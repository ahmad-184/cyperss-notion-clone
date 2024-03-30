import { NextResponse } from "next/server";
import { NextFetchEvent, NextRequest } from "next/server";
import { CustomMiddleware } from "./chain";

import { i18nRouter } from "next-i18n-router";
import { i18nConfig } from "../../i18nConfig";

export function i18nMiddleware(middleware: CustomMiddleware) {
  return async (req: NextRequest, event: NextFetchEvent, res: NextResponse) => {
    return i18nRouter(req, i18nConfig);
  };
}
