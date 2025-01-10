import {
  type LucideIcon,
  BookText,
  HomeIcon,
  Laptop,
  Box,
  Rocket,
  Users,
  ScrollText,
} from "lucide-react";
import { type RoleEnum } from "@/server/db/schema";

export interface SidebarLink {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: RoleEnum[];
}

export const links: SidebarLink[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["user", "admin", "moderator"],
  },
  {
    title: "Mis cursos",
    href: "/mis-cursos",
    icon: Laptop,
    roles: ["user"],
  },
  {
    title: "Todos los cursos",
    href: "/cursos",
    icon: Box,
    roles: ["user"],
  },
  {
    title: "Misiones",
    href: "/misiones",
    icon: Rocket,
    roles: ["user"],
  },
  {
    title: "Usuarios",
    href: "/usuarios",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Suscripciones",
    href: "/suscripciones",
    icon: BookText,
    roles: ["admin", "moderator"],
  },
  {
    title: "Inscribir",
    href: "/inscribir",
    icon: ScrollText,
    roles: ["admin", "moderator"],
  },
];
