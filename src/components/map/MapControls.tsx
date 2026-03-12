"use client";

interface MapControlsProps {
  layers: {
    ships: boolean;
    lanes: boolean;
    conflicts: boolean;
  };
  onToggleLayer: (layer: "ships" | "lanes" | "conflicts") => void;
  onResetView: () => void;
  onFullscreen: () => void;
}

function LayerButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-1 font-mono text-[0.6rem] font-semibold tracking-wider transition-all ${
        active
          ? "border border-accent-blue/50 bg-accent-blue/20 text-accent-blue"
          : "border border-border-default bg-bg-secondary text-text-tertiary hover:bg-bg-hover"
      }`}
    >
      {label}
    </button>
  );
}

export function MapControls({
  layers,
  onToggleLayer,
  onResetView,
  onFullscreen,
}: MapControlsProps) {
  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
      <div className="flex gap-1">
        <LayerButton
          label="SHIPS"
          active={layers.ships}
          onClick={() => onToggleLayer("ships")}
        />
        <LayerButton
          label="LANES"
          active={layers.lanes}
          onClick={() => onToggleLayer("lanes")}
        />
        <LayerButton
          label="THREATS"
          active={layers.conflicts}
          onClick={() => onToggleLayer("conflicts")}
        />
      </div>
      <div className="flex gap-1">
        <button
          onClick={onResetView}
          className="rounded border border-border-default bg-bg-secondary px-2 py-1 font-mono text-[0.6rem] text-text-tertiary transition-colors hover:bg-bg-hover"
          title="Reset view"
        >
          ⌂
        </button>
        <button
          onClick={onFullscreen}
          className="rounded border border-border-default bg-bg-secondary px-2 py-1 font-mono text-[0.6rem] text-text-tertiary transition-colors hover:bg-bg-hover"
          title="Fullscreen"
        >
          ⛶
        </button>
      </div>
    </div>
  );
}
