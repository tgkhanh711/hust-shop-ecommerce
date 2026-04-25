import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/account");
  }

  if (profile.role !== "admin") {
    redirect("/account");
  }

  return {
    authUser: user,
    profile,
  };
}