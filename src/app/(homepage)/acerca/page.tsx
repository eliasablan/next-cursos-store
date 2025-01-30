import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck,
  MessageSquare,
  Trophy,
  Users,
  Lock,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export default function AboutPage() {
  return (
    <main className="container mt-14 px-4 sm:px-6 lg:px-8">
      <div className="py-32 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Plataforma de Educación Interactiva
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground">
          Crea, aprende y conecta con expertos en tu campo de interés
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Sección de características principales */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>¿Qué es IA Coders?</CardTitle>
              <CardDescription>
                Una plataforma innovadora donde puedes:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-4">
                <li className="flex flex-col items-start gap-1">
                  <div>
                    <Trophy className="-mt-2 mr-2 inline text-primary" />
                    <h3 className="inline font-medium">
                      Crear y vender cursos
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Diseña contenido educativo estructurado en lecciones con
                    material multimedia
                  </p>
                </li>
                <li className="flex flex-col items-start gap-1">
                  <div>
                    <Users className="-mt-2 mr-2 inline text-primary" />
                    <h3 className="inline font-medium">
                      Interacción en tiempo real
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Chat directo entre estudiantes y profesores para resolver
                    dudas
                  </p>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estructura de Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                <li>Lecciones con videos y material descargable</li>
                <li>Misiones prácticas con fechas límite</li>
                <li>Evaluación automatizada y por profesores</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Intuitivo</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                <li>Seguimiento de progreso de cursos</li>
                <li>Calendario de misiones pendientes</li>
                <li>Gestión de cursos creados</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sección de registro */}
        <Card className="sticky top-[70px] h-fit">
          <CardHeader>
            <CardTitle>
              <Lock className="-mt-2 mr-2 inline text-primary" />
              <span>Comienza Ahora</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Regístrate gratis y accede a:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="block">
                <CalendarCheck className="-mt-2 mr-2 inline text-primary" />
                <span>Creación de cursos ilimitados</span>
              </li>
              <li className="block">
                <MessageSquare className="-mt-2 mr-2 inline text-primary" />
                <span>Chat con estudiantes</span>
              </li>
              <li className="block">
                <Users className="-mt-2 mr-2 inline text-primary" />
                <span>Comunidad de aprendizaje</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button asChild>
              <Link href="/registro">Crear cuenta gratuita</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cursos">Ver cursos</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 text-center text-muted-foreground">
        <p>¿Preguntas? Contáctanos en soporte@iacoders.com</p>
      </div>
    </main>
  );
}
