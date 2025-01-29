import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { CheckCircle, CircleX } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function LessonAssistances({ lessonId }: { lessonId?: string }) {
  const utils = api.useUtils();

  const { data: assistances, isLoading: courseStudentsIsLoading } =
    api.lesson.getLessonsAssistances.useQuery(
      {
        lessonId: lessonId!,
      },
      {
        enabled: !!lessonId,
      },
    );

  // const { mutateAsync: notifyUnassistanceToParent } =
  //   api.whatsapp.sendAssistanceMessageToParent.useMutation({
  //     onSuccess: ({ data }) => {
  //       if (!data) return;
  //       toast.success(
  //         "Se ha notificado la ausencia del estudiante al representante",
  //       );
  //     },
  //     onError: (e) => {
  //       console.error(e);
  //       toast.error(e.message);
  //     },
  //   });

  const { mutate: updateLessonAsistance, isPending } =
    api.lesson.updateLessonAssistance.useMutation({
      onSuccess: async () => {
        toast.success("Asistencia actualizada correctamente");
      },
      // onSuccess: async (result, { lessonId, studentId }) => {
      //   toast.success("Asistencia actualizada correctamente");
      //   if (result && !result.assisted) {
      //     await notifyUnassistanceToParent({ studentId, lessonId });
      //   }
      // },
      onError: (error) => {
        console.log(error);
        toast.error("Error al actualizar la asistencia del alumno");
      },
      onSettled: async () => {
        if (lessonId) {
          await utils.lesson.getLessonsAssistances.invalidate({ lessonId });
          // await utils.course.getStudentNextLessons.invalidate();
        }
      },
    });

  if (courseStudentsIsLoading)
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Estudiante</TableHead>
          <TableHead className="text-center">Estado</TableHead>
          <TableHead className="text-center">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assistances?.map((student) => (
          <TableRow key={student.id}>
            <TableCell>
              <p className="font-semibold">{student?.name ?? student?.email}</p>
              <p className="text-sm text-muted-foreground">{student?.email}</p>
            </TableCell>
            <TableCell className="text-center">
              <Badge
                variant={
                  student?.assisted === null
                    ? "secondary"
                    : student?.assisted
                      ? "default"
                      : "destructive"
                }
              >
                {student?.assisted === null
                  ? "Pendiente"
                  : student?.assisted
                    ? "Asistente"
                    : "Ausente"}
              </Badge>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "transition-all",
                    student?.assisted === true && "bg-green-100 text-green-800",
                  )}
                  disabled={isPending || student?.assisted === true}
                  onClick={() => {
                    updateLessonAsistance({
                      lessonId: lessonId!,
                      studentId: student.id,
                      assisted: true,
                    });
                  }}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Asistió
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "transition-all",
                    student?.assisted === false && "bg-red-100 text-red-800",
                  )}
                  disabled={isPending || student?.assisted === false}
                  onClick={() => {
                    updateLessonAsistance({
                      lessonId: lessonId!,
                      studentId: student.id,
                      assisted: false,
                    });
                  }}
                >
                  <CircleX className="mr-1 h-4 w-4" />
                  Faltó
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
