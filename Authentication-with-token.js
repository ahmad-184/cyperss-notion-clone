// in frontend
const res = await fetch("/api/user", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer توکن",
  },
  body: JSON.stringify(userNewInfos),
});

("----------------------------------------------------------------");

// in backend
import { headers } from "next/headers";

export const POST = async () => {
  const token = headers().get("Authorization");

  if (token && token.startsWith("Bearer")) {
    const splitedToken = token.split(" ");
    token = splitedToken[1];

    // and do some logic
  }
};
