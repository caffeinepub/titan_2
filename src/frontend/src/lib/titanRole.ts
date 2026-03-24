export type TitanRole = "owner" | "admin" | "user";

const ROLE_KEY = "titanRole";

export function getTitanRole(): TitanRole {
  const stored = localStorage.getItem(ROLE_KEY);
  if (stored === "owner" || stored === "admin") return stored;
  return "user";
}

export function setTitanRole(role: TitanRole) {
  localStorage.setItem(ROLE_KEY, role);
}

export function clearTitanRole() {
  localStorage.removeItem(ROLE_KEY);
}

export function canPost(role: TitanRole): boolean {
  return role === "owner" || role === "admin";
}

export function getRoleBadgeStyle(role: TitanRole): string {
  if (role === "owner")
    return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (role === "admin") return "bg-primary/20 text-primary border-primary/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getRoleLabel(role: TitanRole): string {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  return "User";
}
