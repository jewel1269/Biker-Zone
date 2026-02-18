import { Editor } from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";
import {
  FiPlay,
  FiChevronRight,
  FiFolderPlus,
  FiFilePlus,
  FiTerminal,
  FiMessageSquare,
  FiSend,
  FiMenu,
  FiX,
  FiChevronDown,
  FiTrash2,
  FiFolder,
  FiFileText,
  FiImage,
  FiCode,
} from "react-icons/fi";
import { VscFileCode, VscJson, VscSymbolMethod, VscCode } from "react-icons/vsc";

const LANGUAGE_BY_EXTENSION = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  css: "css",
  scss: "scss",
  less: "less",
  html: "html",
  htm: "html",
  md: "markdown",
  txt: "plaintext",
  py: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  h: "cpp",
  cs: "csharp",
  go: "go",
  rs: "rust",
  php: "php",
  rb: "ruby",
  yml: "yaml",
  yaml: "yaml",
  xml: "xml",
  sql: "sql",
  sh: "shell",
  bash: "shell",
};

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "ico",
]);

const TERMINAL_EXTENSIONS = new Set(["sh", "bash", "zsh"]);

const COMPLETION_SNIPPETS = {
  javascript: [
    {
      label: "log",
      detail: "Console log",
      documentation: "Shortcut for console.log",
      insertText: "console.log(${1:value});",
    },
    {
      label: "func",
      detail: "Function declaration",
      documentation: "Create a reusable function",
      insertText: "function ${1:name}(${2:params}) {\n  ${0}\n}",
    },
    {
      label: "forof",
      detail: "for...of loop",
      documentation: "Iterate arrays and iterables",
      insertText: "for (const ${1:item} of ${2:items}) {\n  ${0}\n}",
    },
    {
      label: "if",
      detail: "if block",
      documentation: "Conditional block",
      insertText: "if (${1:condition}) {\n  ${0}\n}",
    },
  ],
  typescript: [
    {
      label: "interface",
      detail: "TypeScript interface",
      documentation: "Define object shape",
      insertText: "interface ${1:Name} {\n  ${2:key}: ${3:string};\n}",
    },
    {
      label: "type",
      detail: "Type alias",
      documentation: "Create custom type alias",
      insertText: "type ${1:Name} = {\n  ${2:key}: ${3:string};\n};",
    },
    {
      label: "log",
      detail: "Console log",
      documentation: "Shortcut for console.log",
      insertText: "console.log(${1:value});",
    },
  ],
  html: [
    {
      label: "html5",
      detail: "HTML5 boilerplate",
      documentation: "Insert complete HTML5 base",
      insertText:
        "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>${1:Document}</title>\n</head>\n<body>\n  ${0}\n</body>\n</html>",
    },
    {
      label: "div",
      detail: "div block",
      documentation: "Create a div with class",
      insertText: "<div class=\"${1:class-name}\">${0}</div>",
    },
  ],
  css: [
    {
      label: "center-flex",
      detail: "Center with flex",
      documentation: "Horizontally and vertically center content",
      insertText:
        "display: flex;\nalign-items: center;\njustify-content: center;",
    },
    {
      label: "media",
      detail: "Media query",
      documentation: "Responsive media block",
      insertText: "@media (max-width: ${1:768px}) {\n  ${0}\n}",
    },
  ],
  json: [
    {
      label: "json-object",
      detail: "JSON object skeleton",
      documentation: "Insert a valid JSON object template",
      insertText: "{\n  \"${1:key}\": \"${2:value}\"\n}",
    },
  ],
  python: [
    {
      label: "def",
      detail: "Python function",
      documentation: "Define a function",
      insertText: "def ${1:function_name}(${2:args}):\n    ${0:pass}",
    },
    {
      label: "ifmain",
      detail: "Main guard",
      documentation: "Python entry point guard",
      insertText: "if __name__ == \"__main__\":\n    ${0}",
    },
  ],
};

const createNodeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getExtension = (fileName = "") => {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return fileName.slice(dotIndex + 1).toLowerCase();
};

const detectLanguageFromFileName = (fileName, fallbackLanguage = "javascript") => {
  const extension = getExtension(fileName);
  return LANGUAGE_BY_EXTENSION[extension] || fallbackLanguage || "plaintext";
};

const findNodeInTree = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const foundNode = findNodeInTree(node.children, id);
      if (foundNode) return foundNode;
    }
  }
  return null;
};

const findFirstFileInTree = (nodes) => {
  for (const node of nodes) {
    if (node.type === "file") return node;
    if (node.children) {
      const childMatch = findFirstFileInTree(node.children);
      if (childMatch) return childMatch;
    }
  }
  return null;
};

const getNodePath = (nodes, targetId, parentPath = "") => {
  for (const node of nodes) {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.id === targetId) return currentPath;
    if (node.children) {
      const childPath = getNodePath(node.children, targetId, currentPath);
      if (childPath) return childPath;
    }
  }
  return null;
};

const updateFileContentInTree = (nodes, fileId, content) =>
  nodes.map((node) => {
    if (node.id === fileId && node.type === "file") {
      return { ...node, content };
    }
    if (node.children) {
      return { ...node, children: updateFileContentInTree(node.children, fileId, content) };
    }
    return node;
  });

const addNodeToFolder = (nodes, folderId, newNode) => {
  if (!folderId) {
    return { nextTree: [...nodes, newNode], inserted: true };
  }

  let inserted = false;

  const nextTree = nodes.map((node) => {
    if (node.id === folderId && node.type === "folder") {
      inserted = true;
      return {
        ...node,
        children: [...(node.children || []), newNode],
      };
    }

    if (node.children) {
      const childResult = addNodeToFolder(node.children, folderId, newNode);
      if (childResult.inserted) {
        inserted = true;
        return { ...node, children: childResult.nextTree };
      }
    }

    return node;
  });

  return { nextTree, inserted };
};

const removeNodeFromTree = (nodes, nodeId) => {
  let removedNode = null;

  const walk = (items) =>
    items.reduce((accumulator, item) => {
      if (item.id === nodeId) {
        removedNode = item;
        return accumulator;
      }

      if (item.children) {
        accumulator.push({
          ...item,
          children: walk(item.children),
        });
      } else {
        accumulator.push(item);
      }

      return accumulator;
    }, []);

  return { nextTree: walk(nodes), removedNode };
};

const collectNodeIds = (node) => {
  if (!node) return [];
  const ids = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...collectNodeIds(child));
    }
  }
  return ids;
};

const isDescendantNode = (potentialAncestor, targetId) => {
  if (!potentialAncestor || !potentialAncestor.children) return false;
  for (const child of potentialAncestor.children) {
    if (child.id === targetId) return true;
    if (isDescendantNode(child, targetId)) return true;
  }
  return false;
};

const moveNodeToFolder = (nodes, draggedNodeId, targetFolderId) => {
  const draggedNode = findNodeInTree(nodes, draggedNodeId);
  if (!draggedNode) {
    return { nextTree: nodes, movedNode: null, error: "Dragged item was not found." };
  }

  if (targetFolderId) {
    const targetNode = findNodeInTree(nodes, targetFolderId);
    if (!targetNode || targetNode.type !== "folder") {
      return { nextTree: nodes, movedNode: null, error: "Target is not a folder." };
    }

    if (draggedNode.id === targetFolderId) {
      return { nextTree: nodes, movedNode: null, error: "Cannot move an item into itself." };
    }

    if (draggedNode.type === "folder" && isDescendantNode(draggedNode, targetFolderId)) {
      return {
        nextTree: nodes,
        movedNode: null,
        error: "Cannot move a folder inside its own child folder.",
      };
    }
  }

  const { nextTree: treeWithoutDraggedNode, removedNode } = removeNodeFromTree(
    nodes,
    draggedNodeId,
  );

  if (!removedNode) {
    return { nextTree: nodes, movedNode: null, error: "Could not remove selected item." };
  }

  const movedNode = {
    ...removedNode,
    parentId: targetFolderId || undefined,
  };

  const insertionResult = addNodeToFolder(treeWithoutDraggedNode, targetFolderId, movedNode);
  if (!insertionResult.inserted) {
    return { nextTree: nodes, movedNode: null, error: "Could not insert item in folder." };
  }

  return { nextTree: insertionResult.nextTree, movedNode, error: null };
};

const CodeEditor = ({
  editorLanguage = "javascript",
  framework = "",
  showRunButton = true,
  className,
}) => {
  const terminalEndRef = useRef(null);
  const completionDisposablesRef = useRef([]);

  const [files, setFiles] = useState([
    {
      id: "1",
      name: "src",
      type: "folder",
      content: "",
      children: [
        {
          id: "1-1",
          name: "index.js",
          content: "// Happy Coding!",
          type: "file",
          parentId: "1",
        },
        {
          id: "1-2",
          name: "styles.css",
          content: "/* UI Styles */",
          type: "file",
          parentId: "1",
        },
      ],
    },
  ]);
  const [activeFileId, setActiveFileId] = useState("1-1");
  const [expandedFolders, setExpandedFolders] = useState(new Set(["1"]));
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAiChat, setShowAiChat] = useState(true);
  const [consoleOutput, setConsoleOutput] = useState(["Welcome to Terminal\n"]);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);
  const [aiMessages, setAiMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your AI assistant. I can help you fix bugs, optimize code, and answer questions about the file you're working on.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const selectedNode = findNodeInTree(files, activeFileId);
  const activeFile =
    selectedNode && selectedNode.type === "file"
      ? selectedNode
      : {
          id: "",
          name: "untitled",
          content: "",
          type: "file",
        };
  const hasActiveFile = selectedNode && selectedNode.type === "file";

  const activeEditorLanguage = hasActiveFile
    ? detectLanguageFromFileName(activeFile.name, editorLanguage)
    : editorLanguage;

  const activeFilePath = hasActiveFile
    ? getNodePath(files, activeFileId) || activeFile.name
    : "untitled";

  const addTerminalOutput = (output) => {
    setConsoleOutput((prev) => [...prev, output]);
  };

  const getFileIcon = (fileName, type) => {
    if (type === "folder") {
      return <FiFolder className="text-sm text-blue-400" />;
    }

    const extension = getExtension(fileName);

    if (["js", "jsx", "ts", "tsx"].includes(extension)) {
      return <VscSymbolMethod className="text-sm text-yellow-400" />;
    }
    if (["css", "scss", "less"].includes(extension)) {
      return <VscCode className="text-sm text-blue-400" />;
    }
    if (["json", "yml", "yaml"].includes(extension)) {
      return <VscJson className="text-sm text-orange-400" />;
    }
    if (["html", "htm", "xml"].includes(extension)) {
      return <VscCode className="text-sm text-orange-500" />;
    }
    if (["md", "txt"].includes(extension)) {
      return <FiFileText className="text-sm text-zinc-300" />;
    }
    if (IMAGE_EXTENSIONS.has(extension)) {
      return <FiImage className="text-sm text-pink-400" />;
    }
    if (TERMINAL_EXTENSIONS.has(extension)) {
      return <FiTerminal className="text-sm text-green-400" />;
    }
    if (["py", "java", "c", "cpp", "cs", "go", "rs", "php", "rb"].includes(extension)) {
      return <FiCode className="text-sm text-indigo-300" />;
    }

    return <VscFileCode className="text-sm text-zinc-400" />;
  };

  const resolveTargetParentId = (providedParentId) => {
    if (providedParentId) return providedParentId;

    const currentNode = findNodeInTree(files, activeFileId);
    if (!currentNode) return null;
    if (currentNode.type === "folder") return currentNode.id;
    return currentNode.parentId || null;
  };

  const getSiblingsByParentId = (parentId) => {
    if (!parentId) return files;
    const parentNode = findNodeInTree(files, parentId);
    if (!parentNode || parentNode.type !== "folder") return [];
    return parentNode.children || [];
  };

  const handleCreateFile = (parentId) => {
    const fileName = prompt("Enter file name (e.g., index.js, style.css):");
    if (!fileName || !fileName.trim()) return;

    const cleanedFileName = fileName.trim();
    const targetParentId = resolveTargetParentId(parentId);
    const siblings = getSiblingsByParentId(targetParentId);
    const alreadyExists = siblings.some((node) => node.name === cleanedFileName);

    if (alreadyExists) {
      addTerminalOutput(`Cannot create file: "${cleanedFileName}" already exists.`);
      return;
    }

    const newFile = {
      id: createNodeId(),
      name: cleanedFileName,
      content: "",
      type: "file",
      parentId: targetParentId || undefined,
    };

    const insertionResult = addNodeToFolder(files, targetParentId, newFile);
    if (!insertionResult.inserted) {
      addTerminalOutput("Could not create file. Target folder not found.");
      return;
    }

    setFiles(insertionResult.nextTree);
    setActiveFileId(newFile.id);
    if (targetParentId) {
      setExpandedFolders((prev) => new Set([...prev, targetParentId]));
    }
    addTerminalOutput(`Created file: ${cleanedFileName}`);
  };

  const handleCreateFolder = (parentId) => {
    const folderName = prompt("Enter folder name:");
    if (!folderName || !folderName.trim()) return;

    const cleanedFolderName = folderName.trim();
    const targetParentId = resolveTargetParentId(parentId);
    const siblings = getSiblingsByParentId(targetParentId);
    const alreadyExists = siblings.some((node) => node.name === cleanedFolderName);

    if (alreadyExists) {
      addTerminalOutput(`Cannot create folder: "${cleanedFolderName}" already exists.`);
      return;
    }

    const newFolder = {
      id: createNodeId(),
      name: cleanedFolderName,
      content: "",
      type: "folder",
      children: [],
      parentId: targetParentId || undefined,
    };

    const insertionResult = addNodeToFolder(files, targetParentId, newFolder);
    if (!insertionResult.inserted) {
      addTerminalOutput("Could not create folder. Target folder not found.");
      return;
    }

    setFiles(insertionResult.nextTree);
    setExpandedFolders((prev) => new Set([...prev, newFolder.id, targetParentId].filter(Boolean)));
    addTerminalOutput(`Created folder: ${cleanedFolderName}`);
  };

  const handleDelete = (id) => {
    const deletedNode = findNodeInTree(files, id);
    if (!deletedNode) return;

    const { nextTree } = removeNodeFromTree(files, id);
    setFiles(nextTree);

    const deletedNodeIds = new Set(collectNodeIds(deletedNode));

    setExpandedFolders((previousExpanded) => {
      const nextExpanded = new Set(previousExpanded);
      deletedNodeIds.forEach((deletedId) => nextExpanded.delete(deletedId));
      return nextExpanded;
    });

    if (deletedNodeIds.has(activeFileId)) {
      const fallbackFile = findFirstFileInTree(nextTree);
      setActiveFileId(fallbackFile ? fallbackFile.id : "");
    }

    addTerminalOutput(`Deleted: ${deletedNode.name}`);
  };

  const toggleFolder = (id) => {
    setExpandedFolders((previousExpanded) => {
      const nextExpanded = new Set(previousExpanded);
      if (nextExpanded.has(id)) nextExpanded.delete(id);
      else nextExpanded.add(id);
      return nextExpanded;
    });
  };

  const handleRunCode = () => {
    if (!hasActiveFile) return;

    addTerminalOutput(`\n$ Running ${activeFile.name}...`);

    if (["javascript", "typescript"].includes(activeEditorLanguage)) {
      const capturedLogs = [];
      const fakeConsole = {
        log: (...args) => capturedLogs.push(args.join(" ")),
        error: (...args) => capturedLogs.push(`Error: ${args.join(" ")}`),
      };

      try {
        const executableCode = `"use strict";\n${activeFile.content}`;
        // Runs user JS in a very small sandbox-like wrapper for preview output.
        new Function("console", executableCode)(fakeConsole);
        if (capturedLogs.length === 0) {
          addTerminalOutput("> Execution successful (no console output).");
        } else {
          capturedLogs.forEach((line) => addTerminalOutput(`> ${line}`));
        }
      } catch (error) {
        addTerminalOutput(`> Error: ${error.message}`);
      }
    } else {
      addTerminalOutput(`> ${activeEditorLanguage} file opened successfully.`);
      addTerminalOutput("> Runtime preview is available for JavaScript files.");
    }

    addTerminalOutput("$ Ready for next command");
  };

  const handleSendAiMessage = async () => {
    if (!aiInput.trim()) return;

    const userMessage = {
      id: createNodeId(),
      role: "user",
      content: aiInput,
    };

    setAiMessages((prev) => [...prev, userMessage]);
    setAiInput("");
    setIsAiLoading(true);

    setTimeout(() => {
      const aiResponse = {
        id: createNodeId(),
        role: "assistant",
        content: `I understand you want help with "${userMessage.content.substring(0, 30)}...". I can help you improve the code in ${activeFile.name}. What specific issue are you facing?`,
      };
      setAiMessages((prev) => [...prev, aiResponse]);
      setIsAiLoading(false);
    }, 500);
  };

  const clearDragState = () => {
    setDraggedNodeId(null);
    setDragOverFolderId(null);
  };

  const readDraggedNodeId = (event) =>
    event.dataTransfer.getData("text/plain") || draggedNodeId;

  const handleDragStart = (event, nodeId) => {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", nodeId);
    setDraggedNodeId(nodeId);
  };

  const handleFolderDragOver = (event, folderId) => {
    const currentDraggedNodeId = readDraggedNodeId(event);
    if (!currentDraggedNodeId || currentDraggedNodeId === folderId) return;

    const draggedNode = findNodeInTree(files, currentDraggedNodeId);
    const targetFolder = findNodeInTree(files, folderId);
    if (!draggedNode || !targetFolder || targetFolder.type !== "folder") return;

    if (draggedNode.type === "folder" && isDescendantNode(draggedNode, folderId)) return;

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setDragOverFolderId(folderId);
  };

  const handleFolderDrop = (event, folderId) => {
    event.preventDefault();
    event.stopPropagation();

    const currentDraggedNodeId = readDraggedNodeId(event);
    if (!currentDraggedNodeId) {
      clearDragState();
      return;
    }

    const moveResult = moveNodeToFolder(files, currentDraggedNodeId, folderId);
    if (moveResult.error) {
      addTerminalOutput(`Move failed: ${moveResult.error}`);
    } else if (moveResult.movedNode) {
      setFiles(moveResult.nextTree);
      setExpandedFolders((prev) => new Set([...prev, folderId]));
      const targetFolderNode = findNodeInTree(moveResult.nextTree, folderId);
      addTerminalOutput(
        `Moved ${moveResult.movedNode.name} to ${targetFolderNode?.name || "folder"}.`,
      );
    }

    clearDragState();
  };

  const handleRootDragOver = (event) => {
    if (!draggedNodeId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverFolderId(null);
  };

  const handleRootDrop = (event) => {
    event.preventDefault();

    const currentDraggedNodeId = readDraggedNodeId(event);
    if (!currentDraggedNodeId) {
      clearDragState();
      return;
    }

    const moveResult = moveNodeToFolder(files, currentDraggedNodeId, null);
    if (moveResult.error) {
      addTerminalOutput(`Move failed: ${moveResult.error}`);
    } else if (moveResult.movedNode) {
      setFiles(moveResult.nextTree);
      addTerminalOutput(`Moved ${moveResult.movedNode.name} to project root.`);
    }

    clearDragState();
  };

  const handleEditorDidMount = (_, monaco) => {
    completionDisposablesRef.current.forEach((disposable) => disposable.dispose());

    completionDisposablesRef.current = Object.entries(COMPLETION_SNIPPETS).map(
      ([language, snippets]) =>
        monaco.languages.registerCompletionItemProvider(language, {
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn,
            };

            return {
              suggestions: snippets.map((snippet) => ({
                label: snippet.label,
                detail: snippet.detail,
                documentation: snippet.documentation,
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: snippet.insertText,
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
              })),
            };
          },
        }),
    );

    const compilerOptions = {
      allowJs: true,
      allowNonTsExtensions: true,
      noEmit: true,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      checkJs: true,
    };

    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
  };

  const renderFileTree = (nodes, depth = 0) =>
    nodes.map((node) => {
      const isFolder = node.type === "folder";
      const isActiveFile = activeFileId === node.id && node.type === "file";
      const isDropTarget = isFolder && dragOverFolderId === node.id;

      return (
        <div key={node.id}>
          <div
            draggable
            onDragStart={(event) => handleDragStart(event, node.id)}
            onDragEnd={clearDragState}
            onDragOver={(event) => isFolder && handleFolderDragOver(event, node.id)}
            onDrop={(event) => isFolder && handleFolderDrop(event, node.id)}
            onClick={() => {
              if (node.type === "folder") {
                toggleFolder(node.id);
              } else {
                setActiveFileId(node.id);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }
            }}
            className={`group flex cursor-pointer items-center gap-2 px-4 py-2 text-sm transition-colors ${
              isActiveFile
                ? "bg-zinc-200 text-primary dark:bg-[#2d2d2d]"
                : isDropTarget
                  ? "bg-zinc-100 dark:bg-[#2a2d2e]"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-[#2a2d2e]"
            } ${draggedNodeId === node.id ? "opacity-70" : ""}`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
          >
            <div className="flex flex-1 items-center gap-1">
              {isFolder && (
                <FiChevronDown
                  className={`h-4 w-4 transition-transform ${expandedFolders.has(node.id) ? "" : "-rotate-90"}`}
                />
              )}
              {!isFolder && (
                <div className="flex h-4 w-4 items-center justify-center">
                  {getFileIcon(node.name, "file")}
                </div>
              )}
              {isFolder && getFileIcon(node.name, "folder")}
              <span className="truncate">{node.name}</span>
            </div>

            <div
              className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(event) => event.stopPropagation()}
            >
              {isFolder && (
                <>
                  <FiFilePlus
                    size={14}
                    className="cursor-pointer text-zinc-400 hover:text-primary"
                    title={`New file in ${node.name}`}
                    onClick={() => handleCreateFile(node.id)}
                  />
                  <FiFolderPlus
                    size={14}
                    className="cursor-pointer text-zinc-400 hover:text-primary"
                    title={`New folder in ${node.name}`}
                    onClick={() => handleCreateFolder(node.id)}
                  />
                </>
              )}

              <FiTrash2
                size={14}
                className="cursor-pointer text-zinc-400 hover:text-red-500"
                onClick={() => handleDelete(node.id)}
              />
            </div>
          </div>

          {isFolder && expandedFolders.has(node.id) && node.children && node.children.length > 0 && (
            <div>{renderFileTree(node.children, depth + 1)}</div>
          )}

          {isFolder &&
            expandedFolders.has(node.id) &&
            (!node.children || node.children.length === 0) && (
              <div
                className="px-4 py-1 text-xs italic text-zinc-400"
                style={{ paddingLeft: `${28 + depth * 16}px` }}
              >
                Empty folder
              </div>
            )}
        </div>
      );
    });

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleOutput]);

  useEffect(() => {
    if (!activeFileId) {
      const fallbackFile = findFirstFileInTree(files);
      if (fallbackFile) {
        setActiveFileId(fallbackFile.id);
      }
    }
  }, [activeFileId, files]);

  useEffect(
    () => () => {
      completionDisposablesRef.current.forEach((disposable) => disposable.dispose());
    },
    [],
  );

  return (
    <div
      className={`flex h-[600px] flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-[#3e3e42] dark:bg-[#1e1e1e] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100 px-3 py-1.5 dark:border-[#2d2d2d] dark:bg-[#2d2d2d]">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>

          <div className="hidden items-center gap-2 text-sm sm:flex">
            <span className="text-zinc-500 dark:text-[#8b949e]">{framework || "Project"}</span>
            <FiChevronRight className="text-zinc-400" />
            <span className="flex items-center gap-1 text-zinc-900 dark:text-[#d4d4d4]">
              {getFileIcon(activeFile.name, activeFile.type)} {activeFile.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-all ${isConsoleOpen ? "bg-primary text-white" : "bg-zinc-200 text-zinc-700 dark:bg-[#3e3e42] dark:text-zinc-300"}`}
          >
            <FiTerminal /> Console
          </button>

          {showRunButton && (
            <button
              onClick={handleRunCode}
              className="flex items-center gap-2 rounded bg-primary px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              <FiPlay fill="currentColor" /> <span className="xs:inline hidden">Run</span>
            </button>
          )}

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 md:hidden"
          >
            {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div
          className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} absolute z-20 h-full w-56 border-r border-zinc-200 bg-zinc-50 transition-transform duration-300 dark:border-[#2d2d2d] dark:bg-[#181818] md:relative md:translate-x-0`}
        >
          <div className="flex items-center justify-between border-b p-3 dark:border-[#2d2d2d]">
            <span className="text-[10px] font-bold uppercase text-zinc-400">Explorer</span>
            <div className="flex gap-2">
              <FiFilePlus
                className="cursor-pointer text-sm hover:text-primary"
                title="New File"
                onClick={() => handleCreateFile()}
              />
              <FiFolderPlus
                className="cursor-pointer text-sm hover:text-primary"
                title="New Folder"
                onClick={() => handleCreateFolder()}
              />
            </div>
          </div>

          <div
            className="h-full overflow-y-auto pb-10"
            onDragOver={handleRootDragOver}
            onDrop={handleRootDrop}
          >
            {files.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400">
                No files yet. Create one to get started!
              </div>
            ) : (
              <>
                {renderFileTree(files)}
                {draggedNodeId && (
                  <div className="px-4 py-2 text-[10px] uppercase tracking-wide text-zinc-400">
                    Drop on empty space to move item to root
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          {hasActiveFile ? (
            <>
              <div className="relative flex-1">
                <Editor
                  path={activeFilePath}
                  language={activeEditorLanguage}
                  value={activeFile.content}
                  theme="vs-dark"
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize: 15,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    padding: { top: 10 },
                    quickSuggestions: { other: true, comments: false, strings: true },
                    suggestOnTriggerCharacters: true,
                    tabCompletion: "on",
                    snippetSuggestions: "top",
                    wordBasedSuggestions: "allDocuments",
                    acceptSuggestionOnEnter: "on",
                    smoothScrolling: true,
                    cursorSmoothCaretAnimation: "on",
                    semanticHighlighting: { enabled: true },
                  }}
                  onChange={(value) => {
                    setFiles((previousFiles) =>
                      updateFileContentInTree(previousFiles, activeFileId, value || ""),
                    );
                  }}
                />
              </div>

              {isConsoleOpen && (
                <div className="animate-in slide-in-from-bottom h-40 overflow-y-auto border-t border-zinc-200 bg-[#1e1e1e] p-3 font-mono text-sm duration-300 dark:border-[#2d2d2d]">
                  <div className="mb-2 flex items-center justify-between border-b pb-1 text-xs uppercase text-zinc-400 dark:border-[#2d2d2d]">
                    <span>Terminal Output</span>
                    <FiX
                      className="cursor-pointer hover:text-primary"
                      onClick={() => setIsConsoleOpen(false)}
                    />
                  </div>
                  <div className="space-y-1 text-green-500">
                    {consoleOutput.map((output, index) => (
                      <div key={index} className="text-green-400 dark:text-green-500">
                        {output}
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-zinc-400">
              <div className="text-center">
                <FiFolder size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a file to view its contents</p>
              </div>
            </div>
          )}
        </div>

        {showAiChat && (
          <div className="hidden w-72 flex-col border-l border-zinc-200 bg-zinc-50 dark:border-[#2d2d2d] dark:bg-[#1e1e1e] lg:flex">
            <div className="flex items-center justify-between border-b p-3 dark:border-[#2d2d2d]">
              <span className="flex items-center gap-2 text-sm font-bold">
                <FiMessageSquare className="text-primary" /> AI Chat
              </span>
              <FiX
                size={16}
                className="cursor-pointer hover:text-primary"
                onClick={() => setShowAiChat(false)}
              />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-3 text-xs">
              {aiMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs rounded px-3 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "bg-zinc-200 text-zinc-900 dark:bg-[#2d2d2d] dark:text-zinc-100"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="rounded bg-zinc-200 px-3 py-2 text-zinc-600 dark:bg-[#2d2d2d] dark:text-zinc-400">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 border-t p-3 dark:border-[#2d2d2d]">
              <textarea
                placeholder="Ask AI about code..."
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSendAiMessage();
                  }
                }}
                className="w-full resize-none rounded border bg-white px-3 py-2 text-xs focus:border-primary focus:outline-none dark:border-[#3e3e42] dark:bg-[#2d2d2d]"
                rows={2}
                disabled={isAiLoading}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSendAiMessage}
                  disabled={isAiLoading || !aiInput.trim()}
                  className="flex items-center gap-1 rounded bg-primary px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <FiSend size={14} /> Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
