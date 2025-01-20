import EncryptButton from "@/components/EncryptButton";
import XformerlyTwitter from "@/components/icons/XTwitter";
import Link from "next/link";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";

const sections = [
  {
    title: "Producto",
    links: [
      { name: "Visión General", href: "#" },
      { name: "Precios", href: "#" },
      { name: "Mercado", href: "#" },
      { name: "Características", href: "#" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { name: "Acerca de", href: "#" },
      { name: "Equipo", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Carreras", href: "#" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { name: "Ayuda", href: "#" },
      { name: "Ventas", href: "#" },
      { name: "Publicidad", href: "#" },
      { name: "Privacidad", href: "#" },
    ],
  },
];

const Footer = () => {
  return (
    <section className="py-32">
      <div className="px-6">
        <footer>
          <div className="flex flex-col items-center justify-between gap-10 text-center lg:flex-row lg:text-left">
            <div className="flex w-full max-w-96 shrink flex-col items-center justify-between gap-6 lg:items-start">
              <div>
                <EncryptButton />
                <p className="mt-6 text-sm text-muted-foreground">
                  Una colección de cursos para potenciar tus habilidades y
                  conocimientos.
                </p>
              </div>
              <ul className="flex items-center space-x-6 text-muted-foreground">
                <li className="font-medium hover:text-primary">
                  <Link href="https://www.instagram.com/eliasablan/">
                    <FaInstagram className="size-6" />
                  </Link>
                </li>
                <li className="font-medium hover:text-primary">
                  <Link href="https://github.com/eliasablan">
                    <FaGithub className="size-6" />
                  </Link>
                </li>
                <li className="font-medium hover:text-primary">
                  <Link href="https://x.com/eliasablan">
                    <XformerlyTwitter className="size-5 fill-muted-foreground" />
                  </Link>
                </li>
                <li className="font-medium hover:text-primary">
                  <Link href="https://www.linkedin.com/in/eliasablan/">
                    <FaLinkedin className="size-6" />
                  </Link>
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-3 gap-6 lg:gap-20">
              {sections.map((section, sectionIdx) => (
                <div key={sectionIdx}>
                  <h3 className="mb-6 font-bold">{section.title}</h3>
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    {section.links.map((link, linkIdx) => (
                      <li
                        key={linkIdx}
                        className="font-medium hover:text-primary"
                      >
                        <a href={link.href}>{link.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-20 flex flex-col justify-between gap-4 border-t pt-8 text-center text-sm font-medium text-muted-foreground lg:flex-row lg:items-center lg:text-left">
            <p>2024 IA Coders. Desarrollado por Elias Ablan.</p>
            <ul className="flex justify-center gap-4 lg:justify-start">
              <li className="hover:text-primary">
                <Link href="#">Términos y Condiciones</Link>
              </li>
              <li className="hover:text-primary">
                <Link href="#">Política de Privacidad</Link>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default Footer;
