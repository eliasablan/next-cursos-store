import EncryptButton from "@/components/EncryptButton";
import Link from "next/link";

const Footer = () => {
  return (
    <section className="py-32">
      <div className="px-6">
        <footer>
          <div className="flex flex-col items-center gap-10 text-center">
            <div className="flex w-full max-w-96 flex-col items-center gap-6">
              <div>
                <EncryptButton />
                <p className="mt-6 text-sm text-muted-foreground">
                  Una colección de cursos para potenciar tus habilidades y
                  conocimientos.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-20 border-t pt-8 text-center text-sm font-medium text-muted-foreground">
            <p>
              2024 IA Coders. Desarrollado por{" "}
              <Link
                className="underline-offset-2 hover:underline"
                href="https://eliasablan.com"
              >
                Elias Ablan
              </Link>
              .
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default Footer;
