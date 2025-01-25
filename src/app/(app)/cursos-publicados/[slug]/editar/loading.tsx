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
        <Skeleton className="h-4 w-40 bg-secondary-foreground" />
      </div>
      {/* Body */}
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
          {/* DETALLES */}
          <Card>
            <CardContent className="mt-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label>Nombre del curso</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-3">
                  <Label>Slug</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-3">
                  <Label>Descripción</Label>
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
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
          {/* FECHAS DE INICIO Y FINALIZACIÓN */}
          <Card>
            <CardContent className="mt-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label>Fecha de inicio</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-3">
                  <Label>Fecha de finalización</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* FECHAS DE CREACIÓN Y ÚLTIMA EDICIÓN */}
          <Card>
            <CardContent className="mt-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label>Fecha de creación</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-3">
                  <Label>Fecha de última edición</Label>
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
