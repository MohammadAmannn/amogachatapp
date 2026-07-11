import React, { useMemo, useCallback } from "react";
import { useLayerStore } from "@/lib/ui-builder/store/layer-store";
import { useEditorStore } from "@/lib/ui-builder/store/editor-store";
import type { BlockDefinition, ComponentLayer } from "@/components/ui/ui-builder/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Copy, Check, Blocks, Sparkles } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { pageLayerToCode } from "@/components/ui/ui-builder/internal/utils/templates";
import { createComponentLayer } from "@/lib/ui-builder/store/layer-utils";
import { toast } from "sonner";

interface LibraryPanelProps {
  className?: string;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = React.memo(({ className }) => {
  const componentRegistry = useEditorStore((state) => state.registry);
  const blocks = useEditorStore((state) => state.blocks);
  const selectedPageId = useLayerStore((state) => state.selectedPageId);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const addComponentLayer = useLayerStore((state) => state.addComponentLayer);
  const addLayerDirect = useLayerStore((state) => state.addLayerDirect);
  const selectLayer = useLayerStore((state) => state.selectLayer);

  // Group components by category (e.g. HTML/Primitive vs shadcn/ui)
  const groupedComponents = useMemo(() => {
    const options = Object.keys(componentRegistry).map((name) => ({
      name,
      from: componentRegistry[name as keyof typeof componentRegistry]?.from || "other",
    }));

    return options.reduce((acc, option) => {
      // Clean up path name to be human-friendly
      const pathParts = option.from.split("/");
      const folder = pathParts.length > 1 ? pathParts[pathParts.length - 2] : "primitives";
      const category = folder === "ui" ? "shadcn" : folder;
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(option.name);
      return acc;
    }, {} as Record<string, string[]>);
  }, [componentRegistry]);

  // Group blocks by category
  const groupedBlocks = useMemo(() => {
    if (!blocks) return {};
    return Object.values(blocks).reduce((acc, block: BlockDefinition) => {
      if (!acc[block.category]) {
        acc[block.category] = [];
      }
      acc[block.category].push(block);
      return acc;
    }, {} as Record<string, BlockDefinition[]>);
  }, [blocks]);

  // Handle direct component insertion on click
  const handleAddComponent = useCallback((componentType: string) => {
    const parentId = selectedLayerId || selectedPageId;
    try {
      addComponentLayer(componentType, parentId);
      toast.success(`Generated ${componentType} component`);
    } catch (e) {
      toast.error(`Could not add component: ${e}`);
    }
  }, [addComponentLayer, selectedLayerId, selectedPageId]);

  // Handle direct block insertion on click
  const handleAddBlock = useCallback((block: BlockDefinition) => {
    const parentId = selectedLayerId || selectedPageId;
    try {
      // Clone block template with fresh IDs
      const cloneLayer = (layer: ComponentLayer): ComponentLayer => {
        const newId = Math.random().toString(36).substring(2, 9);
        return {
          ...layer,
          id: newId,
          children: Array.isArray(layer.children) 
            ? layer.children.map(cloneLayer) 
            : layer.children,
        };
      };
      const clonedTemplate = cloneLayer(block.template);
      addLayerDirect(clonedTemplate, parentId);
      selectLayer(clonedTemplate.id);
      toast.success(`Generated ${block.name} block`);
    } catch (e) {
      toast.error(`Could not add block: ${e}`);
    }
  }, [addLayerDirect, selectedLayerId, selectedPageId, selectLayer]);

  return (
    <div className={cn("flex flex-col h-full overflow-y-auto px-4 py-2 space-y-4", className)}>
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> Component Library
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Click any component below to generate it instantly under your selection.
        </p>
      </div>

      <Accordion type="multiple" defaultValue={["shadcn", "login", "dashboard"]} className="w-full">
        {/* Render Block Categories */}
        {Object.entries(groupedBlocks).map(([category, blockList]) => (
          <AccordionItem value={category} key={category} className="border-border">
            <AccordionTrigger className="text-xs font-medium py-2.5 capitalize hover:no-underline">
              <span className="flex items-center gap-2">
                <Blocks className="w-3.5 h-3.5 text-muted-foreground" />
                {category} Blocks ({blockList.length})
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-3">
              <div className="grid grid-cols-1 gap-2">
                {blockList.map((block) => (
                  <LibraryBlockCard 
                    key={block.name} 
                    block={block} 
                    onAdd={handleAddBlock} 
                    componentRegistry={componentRegistry}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}

        {/* Render Component Categories */}
        {Object.entries(groupedComponents).map(([category, componentNames]) => (
          <AccordionItem value={category} key={category} className="border-border">
            <AccordionTrigger className="text-xs font-medium py-2.5 capitalize hover:no-underline">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/65" />
                {category} ({componentNames.length})
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-3">
              <div className="grid grid-cols-1 gap-1.5">
                {componentNames.map((name) => (
                  <LibraryComponentRow 
                    key={name} 
                    name={name} 
                    onAdd={handleAddComponent}
                    componentRegistry={componentRegistry}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
});

LibraryPanel.displayName = "LibraryPanel";

/**
 * Single Component Row inside the accordion
 */
const LibraryComponentRow = React.memo(({ 
  name, 
  onAdd, 
  componentRegistry 
}: { 
  name: string; 
  onAdd: (name: string) => void;
  componentRegistry: any;
}) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const handleCopyCode = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const dummyLayer = createComponentLayer(name, componentRegistry, { id: `dummy-${name}` });
      const code = pageLayerToCode(dummyLayer, componentRegistry, [], undefined);
      copyToClipboard(code);
      toast.success(`Copied TSX code for ${name}`);
    } catch (err) {
      toast.error(`Could not generate code for copy: ${err}`);
    }
  }, [name, componentRegistry, copyToClipboard]);

  return (
    <div 
      onClick={() => onAdd(name)}
      className="group flex items-center justify-between p-2 rounded-md border border-border/60 bg-card hover:bg-accent/50 hover:border-accent cursor-pointer transition-all duration-150"
    >
      <span className="text-xs font-medium text-foreground truncate">{name}</span>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-7 h-7"
          onClick={handleCopyCode}
          title="Copy React code"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
        </Button>
        <Button variant="ghost" size="icon" className="w-7 h-7" title="Add to Canvas">
          <Plus className="w-3.5 h-3.5 text-primary" />
        </Button>
      </div>
    </div>
  );
});
LibraryComponentRow.displayName = "LibraryComponentRow";

/**
 * Block Card inside the Accordion
 */
const LibraryBlockCard = React.memo(({ 
  block, 
  onAdd,
  componentRegistry
}: { 
  block: BlockDefinition; 
  onAdd: (block: BlockDefinition) => void;
  componentRegistry: any;
}) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const handleCopyCode = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const code = pageLayerToCode(block.template, componentRegistry, [], undefined);
      copyToClipboard(code);
      toast.success(`Copied TSX code for ${block.name}`);
    } catch (err) {
      toast.error(`Could not generate code for copy: ${err}`);
    }
  }, [block, componentRegistry, copyToClipboard]);

  // Clean block name
  const formattedName = useMemo(() => {
    return block.name
      .split("-")
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [block.name]);

  return (
    <div 
      onClick={() => onAdd(block)}
      className="group flex flex-col p-3 rounded-md border border-border bg-card hover:bg-accent/40 hover:border-primary/50 cursor-pointer transition-all duration-150 space-y-1.5"
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-semibold text-foreground">{formattedName}</span>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-6 h-6" 
            onClick={handleCopyCode}
            title="Copy React code"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6" title="Add to Canvas">
            <Plus className="w-3.5 h-3.5 text-primary" />
          </Button>
        </div>
      </div>
      {block.description && (
        <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
          {block.description}
        </p>
      )}
    </div>
  );
});
LibraryBlockCard.displayName = "LibraryBlockCard";
