import EncryptButton from "@/components/EncryptButton";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

const sections = [
  {
    title: "Product",
    links: [
      { name: "Overview", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Marketplace", href: "#" },
      { name: "Features", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Team", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help", href: "#" },
      { name: "Sales", href: "#" },
      { name: "Advertise", href: "#" },
      { name: "Privacy", href: "#" },
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
                <p className="text-muted-foreground mt-6 text-sm">
                  A collection of 100+ responsive HTML templates for your
                  startup business or side project.
                </p>
              </div>
              <ul className="text-muted-foreground flex items-center space-x-6">
                <li className="hover:text-primary font-medium">
                  <a href="#">
                    <FaInstagram className="size-6" />
                  </a>
                </li>
                <li className="hover:text-primary font-medium">
                  <a href="#">
                    <FaFacebook className="size-6" />
                  </a>
                </li>
                <li className="hover:text-primary font-medium">
                  <a href="#">
                    <FaTwitter className="size-6" />
                  </a>
                </li>
                <li className="hover:text-primary font-medium">
                  <a href="#">
                    <FaLinkedin className="size-6" />
                  </a>
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-3 gap-6 lg:gap-20">
              {sections.map((section, sectionIdx) => (
                <div key={sectionIdx}>
                  <h3 className="mb-6 font-bold">{section.title}</h3>
                  <ul className="text-muted-foreground space-y-4 text-sm">
                    {section.links.map((link, linkIdx) => (
                      <li
                        key={linkIdx}
                        className="hover:text-primary font-medium"
                      >
                        <a href={link.href}>{link.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="text-muted-foreground mt-20 flex flex-col justify-between gap-4 border-t pt-8 text-center text-sm font-medium lg:flex-row lg:items-center lg:text-left">
            <p>© 2024 Shadcnblocks. All rights reserved.</p>
            <ul className="flex justify-center gap-4 lg:justify-start">
              <li className="hover:text-primary">
                <a href="#"> Terms and Conditions</a>
              </li>
              <li className="hover:text-primary">
                <a href="#"> Privacy Policy</a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default Footer;
