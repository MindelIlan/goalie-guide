import { DroppableFolder } from "./DroppableFolder";
import { UnorganizedFolder } from "./UnorganizedFolder";
import { Goal, Folder } from "@/types/goals";

interface FolderGridProps {
  folders: Folder[];
  selectedFolderId: number | null;
  onSelectFolder: (folderId: number | null) => void;
  onDeleteFolder: (folder: Folder) => void;
  goals: Goal[];
  calculateFolderStats: (folderId: number | null) => { totalGoals: number; averageProgress: number };
  setUnorganizedRef: (element: HTMLElement | null) => void;
}

export const FolderGrid = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onDeleteFolder,
  goals,
  calculateFolderStats,
  setUnorganizedRef
}: FolderGridProps) => {
  const unorganizedStats = calculateFolderStats(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <UnorganizedFolder
        ref={setUnorganizedRef}
        isSelected={selectedFolderId === null}
        stats={unorganizedStats}
        onSelect={() => onSelectFolder(null)}
      />

      {folders.map((folder) => {
        const stats = calculateFolderStats(folder.id);
        return (
          <DroppableFolder
            key={folder.id}
            folder={folder}
            isSelected={selectedFolderId === folder.id}
            stats={stats}
            onSelect={() => onSelectFolder(folder.id)}
            onDelete={() => onDeleteFolder(folder)}
          />
        );
      })}
    </div>
  );
};