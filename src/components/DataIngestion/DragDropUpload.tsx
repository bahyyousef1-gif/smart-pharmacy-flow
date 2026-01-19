import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type UploadState = "idle" | "dragging" | "uploading" | "processing" | "ready" | "error";

export interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

interface DragDropUploadProps {
  onFileAccepted: (file: File) => void;
  onReset: () => void;
  uploadState: UploadState;
  setUploadState: (state: UploadState) => void;
  progress?: number;
  error?: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

export const DragDropUpload = ({
  onFileAccepted,
  onReset,
  uploadState,
  setUploadState,
  progress = 0,
  error,
}: DragDropUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragCounter, setDragCounter] = useState(0);
  const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 20MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }

    // Check file type
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(extension);
    
    if (!isValidType) {
      return "Invalid file type. Please upload CSV, XLSX, or XLS files only.";
    }

    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setUploadState("error");
      setCurrentFile(null);
      return;
    }

    setCurrentFile({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });
    
    setUploadState("uploading");
    onFileAccepted(file);
  }, [onFileAccepted, setUploadState]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setUploadState("dragging");
    }
  }, [setUploadState]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setUploadState("idle");
      }
      return newCount;
    });
  }, [setUploadState]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Process only the first file
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [handleFile]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setCurrentFile(null);
    setUploadState("idle");
    setDragCounter(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onReset();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getStateContent = () => {
    switch (uploadState) {
      case "dragging":
        return (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-primary">Drop your file here</p>
              <p className="text-sm text-muted-foreground">Release to upload</p>
            </div>
          </div>
        );

      case "uploading":
        return (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="text-center w-full max-w-xs">
              <p className="text-lg font-semibold">Uploading...</p>
              {currentFile && (
                <p className="text-sm text-muted-foreground truncate">{currentFile.name}</p>
              )}
              <Progress value={progress} className="mt-3" />
              <p className="text-xs text-muted-foreground mt-2">{progress}% complete</p>
            </div>
          </div>
        );

      case "processing":
        return (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <FileSpreadsheet className="h-8 w-8 text-accent animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Processing data...</p>
              <p className="text-sm text-muted-foreground">Parsing and validating your file</p>
            </div>
          </div>
        );

      case "ready":
        return (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-success">File ready</p>
              {currentFile && (
                <p className="text-sm text-muted-foreground">
                  {currentFile.name} ({formatFileSize(currentFile.size)})
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <X className="h-4 w-4" />
              Upload different file
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-destructive">Upload failed</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                {error || "An error occurred while processing your file"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <Upload className="h-4 w-4" />
              Try again
            </Button>
          </div>
        );

      default: // idle
        return (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Drag & drop your file here</p>
              <p className="text-sm text-muted-foreground">
                or click to browse • CSV, XLSX, XLS • Max 20MB
              </p>
            </div>
            <Button onClick={handleBrowseClick} variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Browse files
            </Button>
          </div>
        );
    }
  };

  const isInteractive = uploadState === "idle" || uploadState === "dragging";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        uploadState === "dragging" && "ring-2 ring-primary ring-offset-2 bg-primary/5",
        uploadState === "error" && "border-destructive/50",
        isInteractive && "cursor-pointer hover:border-primary/50"
      )}
      onDragEnter={isInteractive ? handleDragEnter : undefined}
      onDragLeave={isInteractive ? handleDragLeave : undefined}
      onDragOver={isInteractive ? handleDragOver : undefined}
      onDrop={isInteractive ? handleDrop : undefined}
      onClick={uploadState === "idle" ? handleBrowseClick : undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <CardContent className="p-6">
        {getStateContent()}
      </CardContent>
    </Card>
  );
};

export default DragDropUpload;
