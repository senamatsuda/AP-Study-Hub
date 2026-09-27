import type { Course, Problem, ReferenceItem } from "../types";
import coursesData from "./courses.json";

const referenceModules = import.meta.glob("./references/**/*.json", { eager: true, import: "default" });
const problemModules = import.meta.glob("./problems/**/*.json", { eager: true, import: "default" });
const frameworkModules = import.meta.glob("./frameworks/*.json", { eager: true, import: "default" });

const flatten = <T,>(modules: Record<string, unknown>): T[] =>
  Object.values(modules).flatMap((value) => value as T[]);

type SharedUnit = Omit<Course["units"][number], "examWeighting" | "topics"> & {
  bcOnly?: boolean;
  examWeighting: Record<string, Course["units"][number]["examWeighting"]>;
  topics: Array<Course["units"][number]["topics"][number] & { bcOnly?: boolean }>;
};
type Framework =
  | { course: string; units: Course["units"] }
  | { courses: string[]; units: SharedUnit[] };

const frameworks = Object.values(frameworkModules) as Framework[];
const unitsForCourse = (courseId: string): Course["units"] => {
  const framework = frameworks.find((item) =>
    "course" in item ? item.course === courseId : item.courses.includes(courseId),
  );
  if (!framework) return [];
  if ("course" in framework) return framework.units;
  const isBc = courseId === "ap-calc-bc";
  return framework.units
    .filter((unit) => isBc || !unit.bcOnly)
    .map(({ bcOnly: _bcOnly, examWeighting, topics, ...unit }) => ({
      ...unit,
      examWeighting: examWeighting[courseId],
      topics: topics
        .filter((topic) => isBc || !topic.bcOnly)
        .map(({ bcOnly: _topicBcOnly, ...topic }) => topic),
    }));
};

export const courses = (coursesData as Array<Omit<Course, "units">>).map((course) => ({
  ...course,
  units: unitsForCourse(course.id),
}));
export const references = flatten<ReferenceItem>(referenceModules);
export const problems = flatten<Problem>(problemModules);

export const courseById = (id: string) => courses.find((course) => course.id === id);
export const referenceById = (id: string) => references.find((item) => item.id === id);
export const problemById = (id: string) => problems.find((item) => item.id === id);

export const unitFor = (courseId: string, unitId: string) =>
  courseById(courseId)?.units.find((unit) => unit.id === unitId);

export const topicFor = (courseId: string, unitId: string, topicId: string) =>
  unitFor(courseId, unitId)?.topics.find((topic) => topic.id === topicId);
