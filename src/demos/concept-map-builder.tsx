import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, MousePointer, Link as LinkIcon } from "lucide-react";
import { DemoShell } from "@/components/demo-shell";

interface ConceptNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  label: string;
}

type Mode = "select" | "connect";

let nextId = 10;
function genId() {
  return `node-${nextId++}`;
}

const INITIAL_NODES: ConceptNode[] = [
  { id: "node-1", label: "水循环", x: 300, y: 60 },
  { id: "node-2", label: "蒸发", x: 120, y: 180 },
  { id: "node-3", label: "凝结", x: 300, y: 180 },
  { id: "node-4", label: "降水", x: 480, y: 180 },
  { id: "node-5", label: "径流", x: 300, y: 300 },
];

const INITIAL_CONNECTIONS: Connection[] = [
  { id: "conn-1", from: "node-1", to: "node-2", label: "包含" },
  { id: "conn-2", from: "node-1", to: "node-3", label: "包含" },
  { id: "conn-3", from: "node-1", to: "node-4", label: "包含" },
];

export function ConceptMapBuilder() {
  const [nodes, setNodes] = useState<ConceptNode[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [mode, setMode] = useState<Mode>("select");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingConn, setEditingConn] = useState<string | null>(null);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddInput]);

  const getCanvasOffset = useCallback(() => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }, []);

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const offset = getCanvasOffset();
      setNodes((prev) =>
        prev.map((n) =>
          n.id === dragging
            ? {
                ...n,
                x: Math.max(40, Math.min(560, e.clientX - offset.x - dragOffset.x)),
                y: Math.max(20, Math.min(360, e.clientY - offset.y - dragOffset.y)),
              }
            : n
        )
      );
    },
    [dragging, dragOffset, getCanvasOffset]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (mode === "connect") {
      if (!connectFrom) {
        setConnectFrom(nodeId);
      } else if (connectFrom !== nodeId) {
        const exists = connections.some(
          (c) =>
            (c.from === connectFrom && c.to === nodeId) ||
            (c.from === nodeId && c.to === connectFrom)
        );
        if (!exists) {
          setConnections((prev) => [
            ...prev,
            {
              id: `conn-${Date.now()}`,
              from: connectFrom,
              to: nodeId,
              label: "关系",
            },
          ]);
        }
        setConnectFrom(null);
      }
      return;
    }

    // Select mode - start drag
    e.stopPropagation();
    const offset = getCanvasOffset();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDragOffset({
      x: e.clientX - offset.x - node.x,
      y: e.clientY - offset.y - node.y,
    });
    setDragging(nodeId);
    setSelectedNode(nodeId);
  };

  const handleAddNode = () => {
    if (!newNodeLabel.trim()) return;
    const id = genId();
    setNodes((prev) => [
      ...prev,
      {
        id,
        label: newNodeLabel.trim(),
        x: 100 + Math.random() * 400,
        y: 100 + Math.random() * 200,
      },
    ]);
    setNewNodeLabel("");
    setShowAddInput(false);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) =>
      prev.filter((c) => c.from !== nodeId && c.to !== nodeId)
    );
    setSelectedNode(null);
    setEditingNode(null);
  };

  const handleDeleteConnection = (connId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connId));
    setEditingConn(null);
  };

  const handleNodeLabelChange = (nodeId: string, label: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, label } : n))
    );
  };

  const handleConnLabelChange = (connId: string, label: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === connId ? { ...c, label } : c))
    );
  };

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x, y: node.y };
  };

  return (
    <DemoShell
      title="概念图构建器"
      description="通过节点和连线构建知识关系网络"
      tags={["知识建构", "概念图", "可视化"]}
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className={`demo-btn-outline flex items-center gap-1.5 text-sm ${
              mode === "select" ? "!border-primary !text-primary-light !bg-primary/10" : ""
            }`}
            onClick={() => {
              setMode("select");
              setConnectFrom(null);
            }}
          >
            <MousePointer className="w-4 h-4" />
            选择/拖动
          </button>
          <button
            className={`demo-btn-outline flex items-center gap-1.5 text-sm ${
              mode === "connect" ? "!border-primary !text-primary-light !bg-primary/10" : ""
            }`}
            onClick={() => {
              setMode("connect");
              setSelectedNode(null);
            }}
          >
            <LinkIcon className="w-4 h-4" />
            连线
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          {showAddInput ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                className="demo-input text-sm w-32"
                placeholder="节点名称"
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddNode();
                  if (e.key === "Escape") setShowAddInput(false);
                }}
              />
              <button className="demo-btn text-sm" onClick={handleAddNode}>
                添加
              </button>
              <button
                className="demo-btn-outline text-sm"
                onClick={() => setShowAddInput(false)}
              >
                取消
              </button>
            </div>
          ) : (
            <button
              className="demo-btn flex items-center gap-1.5 text-sm"
              onClick={() => setShowAddInput(true)}
            >
              <Plus className="w-4 h-4" />
              添加节点
            </button>
          )}

          {selectedNode && mode === "select" && (
            <button
              className="demo-btn-outline flex items-center gap-1.5 text-sm text-error border-error/30 hover:bg-error/10"
              onClick={() => handleDeleteNode(selectedNode)}
            >
              <Trash2 className="w-4 h-4" />
              删除节点
            </button>
          )}
        </div>

        {/* Status bar */}
        {mode === "connect" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-primary-light"
          >
            {connectFrom
              ? `已选择起点「${nodes.find((n) => n.id === connectFrom)?.label}」，点击另一个节点完成连线`
              : "点击一个节点作为连线起点"}
          </motion.p>
        )}

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="relative w-full h-[400px] rounded-lg border border-border bg-surface-alt overflow-hidden"
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onClick={() => {
            if (mode === "select") {
              setSelectedNode(null);
              setEditingNode(null);
              setEditingConn(null);
            }
          }}
        >
          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="currentColor"
                  className="text-text-muted"
                />
              </marker>
            </defs>
            {connections.map((conn) => {
              const from = getNodeCenter(conn.from);
              const to = getNodeCenter(conn.to);
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2 - 10;

              return (
                <g key={conn.id}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="currentColor"
                    strokeWidth={2}
                    className="text-border"
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Clickable wider line for interaction */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="transparent"
                    strokeWidth={16}
                    className="pointer-events-auto cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingConn(conn.id);
                      setEditingNode(null);
                    }}
                  />
                  {/* Connection label */}
                  <foreignObject
                    x={midX - 30}
                    y={midY - 10}
                    width={60}
                    height={24}
                    className="pointer-events-auto"
                  >
                    {editingConn === conn.id ? (
                      <input
                        className="w-full text-center text-xs bg-surface border border-primary rounded px-1 py-0.5 text-text outline-none"
                        value={conn.label}
                        onChange={(e) =>
                          handleConnLabelChange(conn.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Escape") {
                            setEditingConn(null);
                          }
                        }}
                        onBlur={() => setEditingConn(null)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="block w-full text-center text-xs text-text-muted cursor-pointer hover:text-text transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingConn(conn.id);
                        }}
                      >
                        {conn.label}
                      </span>
                    )}
                  </foreignObject>
                </g>
              );
            })}
            {/* Pending connection line */}
            {connectFrom && (
              <circle
                cx={getNodeCenter(connectFrom).x}
                cy={getNodeCenter(connectFrom).y}
                r={32}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray="4 4"
                className="text-primary animate-pulse"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            const isConnectSource = connectFrom === node.id;

            return (
              <motion.div
                key={node.id}
                className={`
                  absolute flex items-center justify-center min-w-[60px] px-3 py-1.5
                  rounded-lg border-2 text-sm font-medium cursor-grab select-none
                  transition-colors
                  ${
                    isSelected || isConnectSource
                      ? "border-primary bg-primary/20 text-primary-light shadow-lg shadow-primary/20"
                      : "border-border bg-surface hover:border-primary/40 text-text"
                  }
                  ${dragging === node.id ? "cursor-grabbing z-10" : ""}
                `}
                style={{
                  left: node.x,
                  top: node.y,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingNode(node.id);
                }}
                initial={false}
                animate={{
                  scale: isSelected ? 1.05 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {editingNode === node.id ? (
                  <input
                    className="w-20 text-center text-sm bg-transparent outline-none text-text"
                    value={node.label}
                    onChange={(e) =>
                      handleNodeLabelChange(node.id, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Escape") {
                        setEditingNode(null);
                      }
                    }}
                    onBlur={() => setEditingNode(null)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  node.label
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Connection list for deletion */}
        {editingConn && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-2 rounded-lg bg-surface-alt border border-border"
          >
            <span className="text-xs text-text-muted">
              编辑连线：
              {nodes.find((n) => n.id === connections.find((c) => c.id === editingConn)?.from)?.label}
              {" → "}
              {nodes.find((n) => n.id === connections.find((c) => c.id === editingConn)?.to)?.label}
            </span>
            <button
              className="demo-btn-outline text-xs text-error border-error/30 hover:bg-error/10 flex items-center gap-1"
              onClick={() => handleDeleteConnection(editingConn)}
            >
              <Trash2 className="w-3 h-3" />
              删除
            </button>
          </motion.div>
        )}

        {/* Tips */}
        <div className="text-xs text-text-muted space-y-1">
          <p>提示：双击节点可编辑名称 | 点击连线标签可编辑关系 | 选中节点后可删除</p>
        </div>
      </div>
    </DemoShell>
  );
}
