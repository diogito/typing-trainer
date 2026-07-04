interface LayerSelectorProps {
  layers: Array<{ name: string; label: string }>;
  activeLayer: string;
  onSelect: (layer: string) => void;
}

export function LayerSelector({ layers, activeLayer, onSelect }: LayerSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {layers.map((layer) => (
        <button
          key={layer.name}
          onClick={() => onSelect(layer.name)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            layer.name === activeLayer
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
          }`}
        >
          {layer.label || layer.name}
        </button>
      ))}
    </div>
  );
}
