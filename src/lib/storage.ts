import path from "path";
import { promises as fs } from "fs";
import type { Flashcard, FlashcardSet } from "@/lib/types";

type SetMetadata = {
  id: string;
  name: string;
  description: string;
  tags: string[];
};

type NewSetInput = {
  setId: string;
  name: string;
  description?: string;
  tags?: string[];
};

type AddCardInput = {
  setId: string;
  text: string;
  imageBuffer: Buffer;
  imageMimeType: string;
  imageOriginalName: string;
};

type UpdateCardInput = {
  setId: string;
  cardId: string;
  text: string;
  imageBuffer?: Buffer;
  imageMimeType?: string;
  imageOriginalName?: string;
};

type AddBatchCardsInput = {
  setId: string;
  photos: File[];
  method: "txt-file" | "from-filename";
  textsFile?: File;
};

const SET_ID_REGEX = /^[a-z0-9_-]{1,64}$/;
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const getSetsRootPath = (): string => {
  const dataPath = process.env.PHOTOCARDS_DATA_PATH?.trim();

  if (dataPath) {
    return path.join(dataPath, "sets");
  }

  return path.join(process.cwd(), "sets");
};

const isValidSetId = (setId: string): boolean => {
  return SET_ID_REGEX.test(setId);
};

const assertValidSetId = (setId: string): void => {
  if (!isValidSetId(setId)) {
    throw new Error("Invalid setId. Use lowercase letters, numbers, '_' or '-'.");
  }
};

const safeResolveWithin = (basePath: string, ...segments: string[]): string => {
  const resolved = path.resolve(basePath, ...segments);
  const baseResolved = path.resolve(basePath);

  if (!resolved.startsWith(baseResolved)) {
    throw new Error("Invalid path traversal attempt.");
  }

  return resolved;
};

const getSetPath = (setId: string): string => {
  assertValidSetId(setId);
  return safeResolveWithin(getSetsRootPath(), setId);
};

const getPhotosPath = (setId: string): string => {
  return safeResolveWithin(getSetPath(setId), "photos");
};

const getTextsPath = (setId: string): string => {
  return safeResolveWithin(getSetPath(setId), "texts");
};

const getMetadataPath = (setId: string): string => {
  return safeResolveWithin(getSetPath(setId), "metadata.json");
};

const ensureSetsRoot = async (): Promise<void> => {
  await fs.mkdir(getSetsRootPath(), { recursive: true });
};

const slugifySetId = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 64);
};

const inferExtension = (mimeType: string, originalName: string): string => {
  if (mimeType === "image/jpeg") {
    return ".jpg";
  }
  if (mimeType === "image/png") {
    return ".png";
  }
  if (mimeType === "image/webp") {
    return ".webp";
  }
  if (mimeType === "image/gif") {
    return ".gif";
  }

  const fromName = path.extname(originalName).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(fromName)) {
    return fromName === ".jpeg" ? ".jpg" : fromName;
  }

  throw new Error("Unsupported image type.");
};

const getCardNumberFromId = (cardId: string): string => {
  const number = cardId.split("-").pop();

  if (!number || !/^\d+$/.test(number)) {
    throw new Error("Invalid cardId.");
  }

  return number;
};

const findPhotoFileName = async (
  photosPath: string,
  cardNumber: string,
): Promise<string | undefined> => {
  const photoEntries = await fs.readdir(photosPath, { withFileTypes: true });

  return photoEntries.find((entry) => {
    if (!entry.isFile()) {
      return false;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return false;
    }

    return path.basename(entry.name, ext) === cardNumber;
  })?.name;
};

const readMetadata = async (setId: string): Promise<SetMetadata> => {
  const metadataPath = getMetadataPath(setId);
  try {
    const raw = await fs.readFile(metadataPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<SetMetadata>;
    return {
      id: setId,
      name: parsed.name?.trim() || setId,
      description: parsed.description?.trim() || "",
      tags: Array.isArray(parsed.tags) ? parsed.tags.filter(Boolean) : [],
    };
  } catch {
    return {
      id: setId,
      name: setId,
      description: "",
      tags: [],
    };
  }
};

const readCardFiles = async (setId: string): Promise<Flashcard[]> => {
  const textsPath = getTextsPath(setId);
  const photosPath = getPhotosPath(setId);

  const [textEntries, photoEntries] = await Promise.all([
    fs.readdir(textsPath, { withFileTypes: true }).catch(() => []),
    fs.readdir(photosPath, { withFileTypes: true }).catch(() => []),
  ]);

  const photoByNumber = new Map<string, string>();

  for (const entry of photoEntries) {
    if (!entry.isFile()) {
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      continue;
    }

    const number = path.basename(entry.name, ext);
    if (!/^\d+$/.test(number)) {
      continue;
    }

    photoByNumber.set(number, entry.name);
  }

  const cards: Flashcard[] = [];

  for (const entry of textEntries) {
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".txt") {
      continue;
    }

    const number = path.basename(entry.name, ".txt");
    if (!/^\d+$/.test(number)) {
      continue;
    }

    const photoName = photoByNumber.get(number);
    if (!photoName) {
      continue;
    }

    const textPath = safeResolveWithin(textsPath, entry.name);
    const backText = (await fs.readFile(textPath, "utf8")).trim();

    cards.push({
      id: `${setId}-${number}`,
      imageUrl: `/api/sets/${encodeURIComponent(setId)}/photos/${encodeURIComponent(photoName)}`,
      backText,
    });
  }

  cards.sort((a, b) => {
    const aNum = Number(a.id.split("-").pop());
    const bNum = Number(b.id.split("-").pop());
    return aNum - bNum;
  });

  return cards;
};

export const listSets = async (): Promise<FlashcardSet[]> => {
  await ensureSetsRoot();
  const entries = await fs.readdir(getSetsRootPath(), { withFileTypes: true });
  const setIds = entries
    .filter((entry) => entry.isDirectory() && isValidSetId(entry.name))
    .map((entry) => entry.name);

  const sets = await Promise.all(
    setIds.map(async (setId) => {
      const [metadata, cards] = await Promise.all([
        readMetadata(setId),
        readCardFiles(setId),
      ]);

      return {
        id: metadata.id,
        name: metadata.name,
        description: metadata.description,
        tags: metadata.tags,
        cards,
      } satisfies FlashcardSet;
    }),
  );

  return sets.sort((a, b) => a.name.localeCompare(b.name));
};

export const listAllTags = async (): Promise<string[]> => {
  const sets = await listSets();
  return Array.from(new Set(sets.flatMap((setItem) => setItem.tags))).sort();
};

export const getSetById = async (
  setId: string,
): Promise<FlashcardSet | undefined> => {
  if (!isValidSetId(setId)) {
    return undefined;
  }

  try {
    const setPath = getSetPath(setId);
    const stats = await fs.stat(setPath);
    if (!stats.isDirectory()) {
      return undefined;
    }
  } catch {
    return undefined;
  }

  const [metadata, cards] = await Promise.all([
    readMetadata(setId),
    readCardFiles(setId),
  ]);

  return {
    id: metadata.id,
    name: metadata.name,
    description: metadata.description,
    tags: metadata.tags,
    cards,
  };
};

export const createSet = async (input: NewSetInput): Promise<FlashcardSet> => {
  await ensureSetsRoot();

  const normalizedId = slugifySetId(input.setId);
  assertValidSetId(normalizedId);

  const setPath = getSetPath(normalizedId);
  const photosPath = getPhotosPath(normalizedId);
  const textsPath = getTextsPath(normalizedId);
  const metadataPath = getMetadataPath(normalizedId);

  try {
    await fs.mkdir(setPath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "EEXIST") {
      throw new Error("A set with this ID already exists.");
    }
    throw err;
  }

  await Promise.all([fs.mkdir(photosPath), fs.mkdir(textsPath)]);

  const metadata: SetMetadata = {
    id: normalizedId,
    name: input.name.trim() || normalizedId,
    description: input.description?.trim() || "",
    tags: input.tags?.map((tag) => tag.trim()).filter(Boolean) || [],
  };

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf8");

  return {
    id: metadata.id,
    name: metadata.name,
    description: metadata.description,
    tags: metadata.tags,
    cards: [],
  };
};

export const addCard = async (input: AddCardInput): Promise<Flashcard> => {
  assertValidSetId(input.setId);

  if (!ALLOWED_MIME_TYPES.has(input.imageMimeType)) {
    throw new Error("Unsupported image type. Use jpg, png, webp, or gif.");
  }

  const textValue = input.text.trim();
  if (!textValue) {
    throw new Error("Card text is required.");
  }

  const textsPath = getTextsPath(input.setId);
  const photosPath = getPhotosPath(input.setId);

  const [textEntries] = await Promise.all([
    fs.readdir(textsPath, { withFileTypes: true }),
    fs.access(photosPath),
  ]);

  const usedNumbers = textEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
    .map((entry) => Number(path.basename(entry.name, ".txt")))
    .filter((value) => Number.isFinite(value));

  const nextNumber = (usedNumbers.length ? Math.max(...usedNumbers) : 0) + 1;
  const extension = inferExtension(input.imageMimeType, input.imageOriginalName);

  const imageName = `${nextNumber}${extension}`;
  const textName = `${nextNumber}.txt`;

  const imagePath = safeResolveWithin(photosPath, imageName);
  const textPath = safeResolveWithin(textsPath, textName);

  await Promise.all([
    fs.writeFile(imagePath, input.imageBuffer),
    fs.writeFile(textPath, textValue, "utf8"),
  ]);

  return {
    id: `${input.setId}-${nextNumber}`,
    imageUrl: `/api/sets/${encodeURIComponent(input.setId)}/photos/${encodeURIComponent(imageName)}`,
    backText: textValue,
  };
};

export const updateCard = async (
  input: UpdateCardInput,
): Promise<Flashcard> => {
  assertValidSetId(input.setId);

  const cardNumber = getCardNumberFromId(input.cardId);
  const textValue = input.text.trim();

  if (!textValue) {
    throw new Error("Card text is required.");
  }

  let imageBuffer = input.imageBuffer;
  let imageMimeType = input.imageMimeType;
  let imageOriginalName = input.imageOriginalName;

  if (imageBuffer || imageMimeType || imageOriginalName) {
    if (!imageBuffer || !imageMimeType || !imageOriginalName) {
      throw new Error("Invalid image upload.");
    }

    if (!ALLOWED_MIME_TYPES.has(imageMimeType)) {
      throw new Error("Unsupported image type. Use jpg, png, webp, or gif.");
    }
  }

  const textsPath = getTextsPath(input.setId);
  const photosPath = getPhotosPath(input.setId);
  const textName = `${cardNumber}.txt`;
  const textPath = safeResolveWithin(textsPath, textName);

  const existingPhotoName = await findPhotoFileName(photosPath, cardNumber);

  if (!existingPhotoName && !imageBuffer) {
    throw new Error("Card image is missing.");
  }

  await fs.writeFile(textPath, textValue, "utf8");

  let imageName = existingPhotoName;

  if (imageBuffer && imageMimeType && imageOriginalName) {
    const extension = inferExtension(imageMimeType, imageOriginalName);
    imageName = `${cardNumber}${extension}`;

    const imagePath = safeResolveWithin(photosPath, imageName);
    await fs.writeFile(imagePath, imageBuffer);

    if (existingPhotoName && existingPhotoName !== imageName) {
      const oldPhotoPath = safeResolveWithin(photosPath, existingPhotoName);
      await fs.unlink(oldPhotoPath).catch(() => undefined);
    }
  }

  if (!imageName) {
    throw new Error("Card image is missing.");
  }

  return {
    id: input.cardId,
    imageUrl: `/api/sets/${encodeURIComponent(input.setId)}/photos/${encodeURIComponent(imageName)}`,
    backText: textValue,
  };
};

export const addBatchCards = async (
  input: AddBatchCardsInput,
): Promise<Flashcard[]> => {
  assertValidSetId(input.setId);

  if (input.photos.length === 0) {
    throw new Error("At least one photo is required.");
  }

  let lines: string[] = [];
  if (input.method === "txt-file") {
    if (!input.textsFile) {
      throw new Error("Text file is required for txt-file batch import.");
    }

    const textContent = await input.textsFile.text();
    lines = textContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length !== input.photos.length) {
      throw new Error(
        `Line count and photo count must match. Photos: ${input.photos.length}, lines: ${lines.length}.`,
      );
    }
  }

  const textsPath = getTextsPath(input.setId);
  const photosPath = getPhotosPath(input.setId);

  const [textEntries] = await Promise.all([
    fs.readdir(textsPath, { withFileTypes: true }),
    fs.access(photosPath),
  ]);

  const usedNumbers = textEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
    .map((entry) => Number(path.basename(entry.name, ".txt")))
    .filter((value) => Number.isFinite(value));

  let currentNumber = (usedNumbers.length ? Math.max(...usedNumbers) : 0) + 1;
  const importedCards: Flashcard[] = [];

  const sortedPhotos = [...input.photos].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true }),
  );

  for (let index = 0; index < sortedPhotos.length; index += 1) {
    const photo = sortedPhotos[index];
    const backText =
      input.method === "txt-file"
        ? lines[index]
        : path.basename(photo.name, path.extname(photo.name)).trim();

    if (!backText) {
      throw new Error(`Could not derive card text from filename: ${photo.name}`);
    }

    const extension = inferExtension(photo.type, photo.name);

    if (!ALLOWED_MIME_TYPES.has(photo.type)) {
      throw new Error(
        `Unsupported image type for ${photo.name}. Use jpg, png, webp, or gif.`,
      );
    }

    const imageName = `${currentNumber}${extension}`;
    const textName = `${currentNumber}.txt`;
    const imagePath = safeResolveWithin(photosPath, imageName);
    const textPath = safeResolveWithin(textsPath, textName);
    const imageBuffer = Buffer.from(await photo.arrayBuffer());

    await Promise.all([
      fs.writeFile(imagePath, imageBuffer),
      fs.writeFile(textPath, backText, "utf8"),
    ]);

    importedCards.push({
      id: `${input.setId}-${currentNumber}`,
      imageUrl: `/api/sets/${encodeURIComponent(input.setId)}/photos/${encodeURIComponent(imageName)}`,
      backText,
    });

    currentNumber += 1;
  }

  return importedCards;
};

export const readPhotoFile = async (
  setId: string,
  fileName: string,
): Promise<{ buffer: Buffer; contentType: string } | undefined> => {
  assertValidSetId(setId);

  if (fileName.includes("/") || fileName.includes("\\") || fileName.includes("..")) {
    return undefined;
  }

  const ext = path.extname(fileName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return undefined;
  }

  const photosPath = getPhotosPath(setId);
  const photoPath = safeResolveWithin(photosPath, fileName);

  try {
    const buffer = await fs.readFile(photoPath);
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".gif"
            ? "image/gif"
            : "image/jpeg";

    return { buffer, contentType };
  } catch {
    return undefined;
  }
};
