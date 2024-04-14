import { type AuthOptions, getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { cookies } from "next/headers";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import initTranslations from "@/lib/i18n";
import singUpTemplate from "@/templates/signinTemplate";
import { emailSender } from "@/lib/emailSender";
import { db } from "@/lib/db";

export const options: AuthOptions = {
  providers: [
    EmailProvider({
      maxAge: 24 * 3 * 60 * 60000,
      async sendVerificationRequest(params) {
        const { identifier, url } = params;
        const locale = cookies().get("NEXT_LOCALE");
        const lang = locale?.value || "en";
        const { t } = await initTranslations(lang, ["verify-request-email"]);
        const options = {
          clientEmail: identifier,
          subject: `Sign up to Cypress`,
          html_template: singUpTemplate({ t, lang, url }),
        };
        const { error, message } = await emailSender(options);
        if (error) {
          throw new Error(message);
        }
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    error: "/error",
  },
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      let newSession: typeof session = {
        user: {
          id: "",
          email: "",
          image: "",
          name: "",
        },
        expires: session.expires,
      };

      if (token) {
        newSession.user.id = token.sub;
        newSession.user.email = token.email;
        const user = await db.user.findUnique({
          where: {
            id: token.sub,
          },
        });
        if (user) {
          newSession.user.name = user.name || token.name;
          newSession.user.image = user.image || token.picture;
        } else {
          newSession.user.name = token.name;
          newSession.user.image = token.picture;
        }
      }
      return newSession;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
};

export const getAuthSession = () => getServerSession(options);
