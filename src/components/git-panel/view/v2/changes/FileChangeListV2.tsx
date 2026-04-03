import { FILE_STATUS_GROUPS } from '../../../constants/constants';
import type { FileStatusCode, GitDiffMap, GitStatusResponse } from '../../../types/types';
import FileChangeItemV2 from './FileChangeItemV2';

type FileChangeListV2Props = {
  gitStatus: GitStatusResponse;
  gitDiff: GitDiffMap;
  expandedFiles: Set<string>;
  selectedFiles: Set<string>;
  isMobile: boolean;
  wrapText: boolean;
  filePaths?: Set<string>;
  onToggleSelected: (filePath: string) => void;
  onToggleExpanded: (filePath: string) => void;
  onOpenFile: (filePath: string) => void;
  onToggleWrapText: () => void;
  onRequestFileAction: (filePath: string, status: FileStatusCode) => void;
};

export default function FileChangeListV2({
  gitStatus,
  gitDiff,
  expandedFiles,
  selectedFiles,
  isMobile,
  wrapText,
  filePaths,
  onToggleSelected,
  onToggleExpanded,
  onOpenFile,
  onToggleWrapText,
  onRequestFileAction,
}: FileChangeListV2Props) {
  return (
    <>
      {FILE_STATUS_GROUPS.map(({ key, status }) =>
        (gitStatus[key] || [])
          .filter((filePath) => !filePaths || filePaths.has(filePath))
          .map((filePath) => (
            <FileChangeItemV2
              key={filePath}
              filePath={filePath}
              status={status}
              isMobile={isMobile}
              isExpanded={expandedFiles.has(filePath)}
              isSelected={selectedFiles.has(filePath)}
              diff={gitDiff[filePath]}
              wrapText={wrapText}
              onToggleSelected={onToggleSelected}
              onToggleExpanded={onToggleExpanded}
              onOpenFile={onOpenFile}
              onToggleWrapText={onToggleWrapText}
              onRequestFileAction={onRequestFileAction}
            />
          )),
      )}
    </>
  );
}
