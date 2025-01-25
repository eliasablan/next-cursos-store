import {
  type LucideIcon,
  BookText,
  Rocket,
  Users,
  ScrollText,
  Plus,
  Briefcase,
  SquareCheckBig,
  BookCopy,
  LibraryBig,
  LayoutDashboard,
  Sword,
  UserCheck,
  HandCoins,
} from "lucide-react";
import { type RoleEnum } from "@/server/db/schema";

export interface SidebarLink {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: RoleEnum[];
  separator?: boolean;
}

export const links: SidebarLink[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["user", "admin", "moderator"],
  },
  {
    title: "Todos los cursos",
    href: "/cursos",
    icon: LibraryBig,
    roles: ["user", "moderator", "admin"],
    separator: true,
  },
  {
    title: "Misiones",
    href: "/misiones",
    icon: Sword,
    roles: ["user"],
  },
  {
    title: "Mis cursos",
    href: "/mis-cursos",
    icon: BookCopy,
    roles: ["user"],
    separator: true,
  },
  {
    title: "Crear curso",
    href: "/crear-curso",
    icon: Plus,
    roles: ["user"],
  },
  {
    title: "Revisiones",
    href: "/revisiones",
    icon: SquareCheckBig,
    roles: ["user"],
  },
  {
    title: "Cursos creados",
    href: "/cursos-creados",
    icon: Briefcase,
    roles: ["user"],
  },
  {
    title: "Usuarios",
    href: "/usuarios",
    icon: Users,
    roles: ["admin", "moderator"],
  },
  {
    title: "Suscripciones",
    href: "/suscripciones",
    icon: UserCheck,
    roles: ["admin", "moderator"],
  },
  {
    title: "Pagos",
    href: "/pagos",
    icon: HandCoins,
    roles: ["admin", "moderator"],
  },
];
