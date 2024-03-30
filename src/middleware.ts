import { chain } from "@/middlewares/chain";
import { i18nMiddleware } from "@/middlewares/i18nMiddleware";
import { authMiddleware } from "@/middlewares/authMiddleware";

export default chain([authMiddleware, i18nMiddleware]);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
