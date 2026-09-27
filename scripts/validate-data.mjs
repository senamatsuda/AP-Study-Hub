import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const courseMetadata = read("src/data/courses.json");
const frameworks = readdirSync(join(root, "src/data/frameworks"))
  .filter((file) => file.endsWith(".json"))
  .map((file) => read(join("src/data/frameworks", file)));

function unitsForCourse(courseId) {
  const framework = frameworks.find((item) => item.course === courseId || item.courses?.includes(courseId));
  if (!framework) return [];
  if (framework.course) return framework.units;
  const isBc = courseId === "ap-calc-bc";
  return framework.units
    .filter((unit) => isBc || !unit.bcOnly)
    .map(({ bcOnly, examWeighting, topics, ...unit }) => ({
      ...unit,
      examWeighting: examWeighting[courseId],
      topics: topics.filter((topic) => isBc || !topic.bcOnly).map(({ bcOnly: topicBcOnly, ...topic }) => topic),
    }));
}

const courses = courseMetadata.map((course) => ({ ...course, units: unitsForCourse(course.id) }));

function readCollections(folder) {
  return readdirSync(join(root, "src/data", folder), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => readdirSync(join(root, "src/data", folder, entry.name))
      .filter((file) => file.endsWith(".json"))
      .flatMap((file) => read(join("src/data", folder, entry.name, file))));
}

const references = readCollections("references");
const problems = readCollections("problems");
const courseIds = new Set(courses.map((course) => course.id));
const referenceIds = new Set(references.map((item) => item.id));
const problemIds = new Set(problems.map((item) => item.id));
const allowedTypes = new Set(["multiple-choice", "free-response", "conceptual", "calculation"]);
const errors = [];
const privateFileExtensions = new Set([".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"]);

function rejectPrivateFiles(folder) {
  const directory = join(root, folder);
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relativePath = join(folder, entry.name);
    if (entry.isDirectory()) rejectPrivateFiles(relativePath);
    else if (privateFileExtensions.has(extname(entry.name).toLowerCase())) {
      errors.push(`${relativePath}: local teaching files must stay in private-materials and be shared through Google Drive`);
    }
  }
}

rejectPrivateFiles("src");
rejectPrivateFiles("public");

function localized(value, label) {
  if (!value || typeof value.en !== "string" || !value.en.trim() || typeof value.ja !== "string" || !value.ja.trim()) {
    errors.push(`${label} must contain non-empty en and ja strings`);
  }
}

function context(item) {
  const course = courses.find((candidate) => candidate.id === item.course);
  if (!courseIds.has(item.course)) return errors.push(`${item.id}: unknown course ${item.course}`);
  const unit = course.units.find((candidate) => candidate.id === item.unit);
  if (!unit) return errors.push(`${item.id}: unknown unit ${item.unit}`);
  if (!unit.topics.some((candidate) => candidate.id === item.topic)) errors.push(`${item.id}: unknown topic ${item.topic}`);
}

for (const course of courses) {
  localized(course.name, `${course.id}.name`);
  localized(course.description, `${course.id}.description`);
  if (!course.sourceUrl?.startsWith("https://")) errors.push(`${course.id}.sourceUrl must be an HTTPS URL`);
  if (!course.units.length) errors.push(`${course.id}: framework has no units`);
  const unitIds = new Set();
  const unitNumbers = new Set();
  const topicIds = new Set();
  for (const unit of course.units) {
    localized(unit.name, `${course.id}/${unit.id}.name`);
    localized(unit.examWeighting, `${course.id}/${unit.id}.examWeighting`);
    if (!Number.isInteger(unit.number)) errors.push(`${course.id}/${unit.id}.number must be an integer`);
    if (unitIds.has(unit.id)) errors.push(`${course.id}: duplicate unit id ${unit.id}`);
    if (unitNumbers.has(unit.number)) errors.push(`${course.id}: duplicate unit number ${unit.number}`);
    unitIds.add(unit.id);
    unitNumbers.add(unit.number);
    for (const topic of unit.topics) {
      localized(topic.name, `${course.id}/${unit.id}/${topic.id}.name`);
      if (!/^\d+\.\d+$/.test(topic.code)) errors.push(`${course.id}/${unit.id}/${topic.id}.code is invalid`);
      if (!topic.code.startsWith(`${unit.number}.`)) errors.push(`${course.id}/${unit.id}/${topic.id}.code does not match unit number`);
      if (topicIds.has(topic.id)) errors.push(`${course.id}: duplicate topic id ${topic.id}`);
      topicIds.add(topic.id);
    }
  }
}

for (const item of references) {
  context(item);
  localized(item.title, `${item.id}.title`);
  localized(item.description, `${item.id}.description`);
  localized(item.content, `${item.id}.content`);
  for (const id of item.relatedProblems) if (!problemIds.has(id)) errors.push(`${item.id}: unknown related problem ${id}`);
}

for (const item of problems) {
  context(item);
  localized(item.title, `${item.id}.title`);
  localized(item.question, `${item.id}.question`);
  localized(item.solution, `${item.id}.solution`);
  if (!Number.isInteger(item.difficulty) || item.difficulty < 1 || item.difficulty > 5) errors.push(`${item.id}: difficulty must be 1-5`);
  if (!allowedTypes.has(item.questionType)) errors.push(`${item.id}: unsupported questionType ${item.questionType}`);
  for (const id of item.relatedReferences) if (!referenceIds.has(id)) errors.push(`${item.id}: unknown related reference ${id}`);
}

const allIds = [...references, ...problems].map((item) => item.id);
if (new Set(allIds).size !== allIds.length) errors.push("Reference and problem IDs must be globally unique");

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

const unitCount = courses.reduce((sum, course) => sum + course.units.length, 0);
const topicCount = courses.reduce((sum, course) => sum + course.units.reduce((unitSum, unit) => unitSum + unit.topics.length, 0), 0);
console.log(`Data valid: ${courses.length} courses, ${unitCount} units, ${topicCount} topics, ${references.length} references, ${problems.length} problems.`);
