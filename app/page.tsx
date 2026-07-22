import { redirect } from "next/navigation";

// Proxy sends authenticated users to /dashboard; everyone else lands on /login.
export default function Home() {
  redirect("/login");
}
