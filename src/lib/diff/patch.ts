import { diffLines } from "diff";

export type DiffLine = {
  type: "added" | "removed" | "unchanged";
  value: string;
};

export type FileDiff = {
  path: string;
  lines: DiffLine[];
  addedCount: number;
  removedCount: number;
};

export function computeFileDiff(oldContent: string, newContent: string, filePath: string): FileDiff {
  const changes = diffLines(oldContent, newContent);
  const lines: DiffLine[] = [];
  let addedCount = 0;
  let removedCount = 0;

  for (const change of changes) {
    const type: DiffLine["type"] = change.added ? "added" : change.removed ? "removed" : "unchanged";
    // Split multi-line chunk into individual lines for display
    const rawLines = change.value.split("\n");
    // diffLines includes a trailing empty string from the final newline — drop it
    const trimmed = rawLines[rawLines.length - 1] === "" ? rawLines.slice(0, -1) : rawLines;
    for (const line of trimmed) {
      lines.push({ type, value: line });
      if (change.added) addedCount++;
      if (change.removed) removedCount++;
    }
  }

  return { path: filePath, lines, addedCount, removedCount };
}

export function buildDiffs(
  currentFiles: { path: string; content: string }[],
  patches: { path: string; content: string }[]
): FileDiff[] {
  return patches.map((patch) => {
    const current = currentFiles.find((f) => f.path === patch.path);
    return computeFileDiff(current?.content ?? "", patch.content, patch.path);
  });
}
