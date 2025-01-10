import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type InferSelectModel } from "drizzle-orm";
import { type reviews } from "@/server/db/schema";
import { MessageSquare, Clock, TrendingUp, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ReviewScore = InferSelectModel<typeof reviews>["score"];

// Interfaz que define los parámetros comunes utilizados en las funciones de generación de mensajes
interface MessageParams {
  missionTitle: string;
  senderName?: string;
  score?: ReviewScore;
  extension?: Date;
  active?: boolean;
  paid?: boolean;
  courseName?: string;
}

// Objeto que contiene funciones para generar mensajes de notificación específicos
export const NOTIFICATION_MESSAGE_FNS = {
  // Genera un mensaje para notificaciones de mensajes de misión
  missionMessage: ({ senderName, missionTitle }: MessageParams) =>
    senderName
      ? `Has recibido un mensaje de ${senderName} en la misión ${missionTitle}.`
      : `Has recibido un mensaje en la misión ${missionTitle}.`,

  // Genera un mensaje para notificaciones de actualizaciones de misión
  missionUpdate: ({ missionTitle }: MessageParams) =>
    `Se ha actualizado la misión ${missionTitle}.`,

  // Genera un mensaje para notificaciones de puntuación de revisión
  reviewScore: ({ missionTitle, score }: MessageParams) =>
    `Has recibido ${score ?? 0} puntos en la misión "${missionTitle}".`,

  // Genera un mensaje para notificaciones de extensión de revisión
  reviewExtension: ({ missionTitle, extension }: MessageParams) =>
    `Se ha actualizado la fecha de entrega de tu misión ${missionTitle} para el ${format(extension!, "dd/MM/yyyy", { locale: es })}.`,

  // Genera un mensaje para notificaciones de actualización de suscripción
  subscriptionUpdate: ({ active, paid, courseName }: MessageParams) => {
    if (typeof active === "boolean") {
      return `Se ha ${active ? "activado" : "desactivado"} la suscripción a ${courseName}.`;
    }
    if (typeof paid === "boolean") {
      return `Se ha ${paid ? "aprobado" : "cancelado"} tu suscripción al curso ${courseName}.`;
    }
    return `Se ha actualizado tu suscripción al ${courseName}.`;
  },
};

// Tipo que define la estructura de las funciones de redirección
type RedirectFunction = (params: { resourceId: string | null }) => string;

// Tipo que define la estructura de las funciones de generación de mensajes
type MessageFunction = (
  params: MessageParams & Record<string, unknown>,
) => string;

// Interfaz que define la estructura de los tipos de notificación
interface NotificationType {
  message: MessageFunction;
  redirectUrl: RedirectFunction;
  icon: LucideIcon;
}

// Mapa que asocia tipos de notificación con sus respectivas funciones y propiedades
export const NOTIFICATION_TYPES_MAP: Record<string, NotificationType> = {
  missionMessage: {
    message: NOTIFICATION_MESSAGE_FNS.missionMessage,
    redirectUrl: ({ resourceId }) => `/misiones/${resourceId}`,
    icon: MessageSquare,
  },
  missionUpdate: {
    message: NOTIFICATION_MESSAGE_FNS.missionUpdate,
    redirectUrl: ({ resourceId }) => `/misiones/${resourceId}`,
    icon: Clock,
  },
  reviewExtension: {
    message: NOTIFICATION_MESSAGE_FNS.reviewExtension,
    redirectUrl: ({ resourceId }) => `/misiones/${resourceId}`,
    icon: TrendingUp,
  },
  reviewScore: {
    message: NOTIFICATION_MESSAGE_FNS.reviewScore,
    redirectUrl: ({ resourceId }) => `/misiones/${resourceId}`,
    icon: TrendingUp,
  },
  subscriptionUpdate: {
    message: NOTIFICATION_MESSAGE_FNS.subscriptionUpdate,
    redirectUrl: ({ resourceId }) => `/cursos/${resourceId}`,
    icon: Bell,
  },
};
