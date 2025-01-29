import { type api } from "@/trpc/server";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string) {
  return String(str)
    .normalize("NFKD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
}

type Lesson = Awaited<ReturnType<typeof api.course.getCourseLessons>>[number];

// Returns a reordered copy of the lessons array
export function changeLessonOrder({
  lessons,
  from,
  to,
}: {
  lessons?: Lesson[];
  from: number;
  to: number;
}) {
  if (lessons) {
    // Creates a deep-copy of the lessons
    const lessonsCopy = JSON.parse(JSON.stringify(lessons)) as Lesson[];

    const movedLesson = lessonsCopy.find((lesson) => lesson.order === from);
    const replacedLesson = lessonsCopy.find((lesson) => lesson.order === to);

    if (movedLesson && replacedLesson) {
      // Inserts the lesson where we want to move it
      const newLessons = lessonsCopy.map((lesson) => {
        if (lesson.id === movedLesson.id) {
          return { ...lesson, order: to };
        }

        if (lesson.id === replacedLesson.id) {
          return { ...lesson, order: from };
        }

        return lesson;
      });

      return newLessons;
    }
  }
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function isUploadthingUrl(url: string) {
  return url.includes("utfs.io");
}
