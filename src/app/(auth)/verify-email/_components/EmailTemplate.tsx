import { env } from "@/env";

interface EmailTemplateProps {
  username?: string | null;
  token: string;
}

export const EmailTemplate = ({ username, token }: EmailTemplateProps) => (
  <div>
    <h1>Hola {username}</h1>
    <p>Verifica tu cuenta en IACoders siguiendo el siguiente enlace:</p>
    <a
      target="_blank"
      rel="noreferrer"
      href={`${env.NEXTAUTH_URL}/verify-email?token=${token}`}
    >
      {env.NEXTAUTH_URL}/verify-email?token={token}
    </a>
  </div>
);
