import { Metadata } from "next";
import Login from "./Login";

export const metadata: Metadata = {
  title: "Cypress - Login",
};

export default function Page() {
  return (
    <div>
      <Login />
    </div>
  );
}
