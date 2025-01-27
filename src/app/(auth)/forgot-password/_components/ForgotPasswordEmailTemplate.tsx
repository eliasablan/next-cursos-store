import { env } from "@/env";

interface EmailTemplateProps {
  username?: string | null;
  token: string;
}

export const ForgotPasswordEmailTemplate = ({
  username,
  token,
}: EmailTemplateProps) => {
  const resetPasswordUrl = `${env.NEXTAUTH_URL}/reset-password?token=${token}`;

  return (
    <div>
      <h1>Hola {username}</h1>
      <p>Haz click en el siguiente enlace para cambiar tu contraseña:</p>
      <a target="_blank" rel="noopener noreferrer" href={resetPasswordUrl}>
        {resetPasswordUrl}
      </a>
    </div>
  );
};
