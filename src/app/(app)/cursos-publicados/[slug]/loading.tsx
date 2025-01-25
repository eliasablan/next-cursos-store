import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

export default function CourseSkeleton() {
  return (
    <main className="grid w-full flex-1 auto-rows-max">
      {/* Header */}
      <div className="mb-4 flex items-center gap-4 py-1">
        <Button className="h-7 w-7" size="icon" variant="outline">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Regresar
        </p>
      </div>
      {/* Body */}
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
          {/* DETALLES */}
          <Card>
            <CardContent className="mt-6 flex flex-col gap-6">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-10 w-2/3" />
            </CardContent>
          </Card>
          {/* LECCIONES */}
          <Card>
            <CardHeader>
              <CardTitle>Lecciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="my-2 h-10 w-full" />
              <Skeleton className="my-2 h-10 w-full" />
              <Skeleton className="my-2 h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4">
          {/* FECHAS DEL CURSO */}
          <Card>
            <CardHeader>
              <CardTitle>Fechas del curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-3 sm:col-span-2">
                  <Label>Fecha de inicio</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-3 sm:col-span-2">
                  <Label>Fecha de finalización</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
