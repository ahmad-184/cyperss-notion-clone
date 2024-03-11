"use server";

import { loginValidatorType } from "@/lib/validations";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import Error from "next/error";
import { cookies } from "next/headers";

const login = async ({ email, password }: loginValidatorType) => {
  const supabaseHandler = createRouteHandlerClient({ cookies });
  const res = await supabaseHandler.auth.signInWithPassword({
    password,
    email,
  });
  return res;
};

export default login;
