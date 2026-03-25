"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { VesselData, VesselClass } from "@/types/vessel";
import type { ConflictZone } from "@/types/conflict";
import { vesselToGeoJSON } from "@/lib/ais-parser";
import { loadVesselIcons } from "@/lib/vessel-icons";
import { VESSEL_CLASS_CONFIG } from "@/lib/vessel-classifier";
import { SHIPPING_LANES_GEOJSON } from "@/lib/shipping-lanes";
import { CONFLICT_REGIONS } from "@/lib/constants";
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_STYLE,
} from "@/lib/constants";
import { MapControls } from "./MapControls";

interface GlobalMapProps {
  vessels: Map<number, VesselData>;
  conflictZones: ConflictZone[];
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

// Build icon-image match expression for vessel classes
function buildIconImageExpression(): mapboxgl.Expression {
  const classes = Object.keys(VESSEL_CLASS_CONFIG) as VesselClass[];
  const expr: (string | string[])[] = ["match", ["get", "vesselClass"]];
  for (const cls of classes) {
    expr.push(cls, cls);
  }
  expr.push("tanker_generic"); // fallback
  return expr as unknown as mapboxgl.Expression;
}

// Build icon-size as a top-level interpolate (zoom must be at the top level).
// Class-based scaling is baked into each zoom stop via a match expression.
function buildIconSizeExpression(): mapboxgl.Expression {
  function classScale(base: number): unknown[] {
    const classes = Object.keys(VESSEL_CLASS_CONFIG) as VesselClass[];
    const expr: (string | number | string[])[] = ["match", ["get", "vesselClass"]];
    for (const cls of classes) {
      expr.push(cls, base * VESSEL_CLASS_CONFIG[cls].iconSize);
    }
    expr.push(base * 0.9); // fallback
    return expr;
  }

  return [
    "interpolate", ["linear"], ["zoom"],
    3, classScale(0.3),
    6, classScale(0.4),
    9, classScale(0.6),
    12, classScale(0.9),
    15, classScale(1.2),
  ] as unknown as mapboxgl.Expression;
}

export function GlobalMap({ vessels, conflictZones, mapRef }: GlobalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [layers, setLayers] = useState({
    ships: true,
    lanes: true,
    conflicts: true,
  });

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      projection: "mercator",
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    map.on("load", () => {
      // Load SDF vessel icons
      loadVesselIcons(map);

      // Vessel source (clustered)
      map.addSource("vessels", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 6,
        clusterRadius: 50,
      });

      // Cluster circles
      map.addLayer({
        id: "vessel-clusters",
        type: "circle",
        source: "vessels",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#3b82f6",
          "circle-radius": ["step", ["get", "point_count"], 15, 50, 20, 200, 30],
          "circle-opacity": 0.7,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#1e293b",
        },
      });

      // Cluster count labels
      map.addLayer({
        id: "vessel-cluster-count",
        type: "symbol",
        source: "vessels",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 11,
        },
        paint: {
          "text-color": "#e2e8f0",
        },
      });

      // Status indicator circles (behind ship icons, only for conflict/distress)
      map.addLayer({
        id: "vessel-status-dots",
        type: "circle",
        source: "vessels",
        filter: ["all",
          ["!", ["has", "point_count"]],
          ["in", ["get", "status"], ["literal", ["conflict", "distress"]]],
        ],
        paint: {
          "circle-color": [
            "match",
            ["get", "status"],
            "conflict", "#f97316",
            "distress", "#ef4444",
            "transparent",
          ],
          "circle-radius": 8,
          "circle-opacity": 0.5,
          "circle-blur": 0.5,
        },
      });

      // Individual vessel icons (symbol layer)
      map.addLayer({
        id: "vessel-points",
        type: "symbol",
        source: "vessels",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": buildIconImageExpression(),
          "icon-size": buildIconSizeExpression(),
          "icon-rotate": ["get", "course"],
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      // Shipping lanes
      map.addSource("shipping-lanes", {
        type: "geojson",
        data: SHIPPING_LANES_GEOJSON as GeoJSON.FeatureCollection,
      });

      map.addLayer({
        id: "shipping-lanes-line",
        type: "line",
        source: "shipping-lanes",
        paint: {
          "line-color": "#3b82f6",
          "line-opacity": 0.3,
          "line-width": 1.5,
          "line-dasharray": [4, 4],
        },
      });

      // Static conflict regions (always visible)
      const staticConflictFeatures = CONFLICT_REGIONS.map((region) => ({
        type: "Feature" as const,
        properties: { name: region.name, color: region.color, threatLevel: "LOW" },
        geometry: {
          type: "Polygon" as const,
          coordinates: [[
            [region.bounds.west, region.bounds.north],
            [region.bounds.east, region.bounds.north],
            [region.bounds.east, region.bounds.south],
            [region.bounds.west, region.bounds.south],
            [region.bounds.west, region.bounds.north],
          ]],
        },
      }));

      map.addSource("conflict-zones", {
        type: "geojson",
        data: { type: "FeatureCollection", features: staticConflictFeatures },
      });

      // Dashed border
      map.addLayer({
        id: "conflict-zones-border",
        type: "line",
        source: "conflict-zones",
        paint: {
          "line-color": ["get", "color"],
          "line-opacity": 0.6,
          "line-width": 1.5,
          "line-dasharray": [4, 3],
        },
      });

      // Subtle fill
      map.addLayer({
        id: "conflict-zones-fill",
        type: "fill",
        source: "conflict-zones",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": [
            "match",
            ["get", "threatLevel"],
            "CRITICAL", 0.18,
            "HIGH", 0.14,
            "ELEVATED", 0.10,
            0.06,
          ],
        },
      });

      // Zone labels
      map.addLayer({
        id: "conflict-zones-labels",
        type: "symbol",
        source: "conflict-zones",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 10,
          "text-transform": "uppercase",
          "text-letter-spacing": 0.1,
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": ["get", "color"],
          "text-opacity": 0.7,
          "text-halo-color": "#0a0e17",
          "text-halo-width": 1,
        },
      });

      // Vessel hover popup
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "vessel-popup",
      });

      map.on("mouseenter", "vessel-points", (e) => {
        map.getCanvas().style.cursor = "pointer";
        if (!e.features?.[0]) return;

        const props = e.features[0].properties;
        if (!props) return;
        const coords = (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number];

        const classLabel = props.vesselClass
          ? (VESSEL_CLASS_CONFIG[props.vesselClass as VesselClass]?.label || "Tanker")
          : "Tanker";
        const classColor = props.vesselClass
          ? (VESSEL_CLASS_CONFIG[props.vesselClass as VesselClass]?.color || "#64748b")
          : "#64748b";

        const dimStr = props.length && Number(props.length) > 0
          ? `${props.length}m × ${props.beam || "?"}m`
          : "";

        popup
          .setLngLat(coords)
          .setHTML(
            `<div style="font-family:monospace;font-size:11px;color:#e2e8f0;padding:4px;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                <span style="background:${classColor};color:#000;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:700;">${classLabel}</span>
                <strong>${props.name}</strong>
              </div>
              <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 8px;font-size:10px;">
                <span style="color:#94a3b8;">SPEED</span><span>${Number(props.speed).toFixed(1)} kn</span>
                <span style="color:#94a3b8;">COURSE</span><span>${Number(props.course).toFixed(0)}°</span>
                <span style="color:#94a3b8;">STATUS</span><span>${props.status}</span>
                ${dimStr ? `<span style="color:#94a3b8;">SIZE</span><span>${dimStr}</span>` : ""}
                ${props.destination ? `<span style="color:#94a3b8;">DEST</span><span>${props.destination}</span>` : ""}
                ${props.eta ? `<span style="color:#94a3b8;">ETA</span><span>${props.eta}</span>` : ""}
                ${props.imoNumber && Number(props.imoNumber) > 0 ? `<span style="color:#94a3b8;">IMO</span><span>${props.imoNumber}</span>` : ""}
              </div>
            </div>`
          )
          .addTo(map);
      });

      map.on("mouseleave", "vessel-points", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });

      // Zoom to cluster on click
      map.on("click", "vessel-clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["vessel-clusters"],
        });
        if (!features[0]) return;
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource("vessels") as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom === null || zoom === undefined) return;
          const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
          map.easeTo({ center: coords, zoom });
        });
      });

      mapRef.current = map;
      setLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update vessels
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const map = mapRef.current;
    const source = map.getSource("vessels") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(vesselToGeoJSON(vessels) as GeoJSON.FeatureCollection);
    }
  }, [vessels, loaded, mapRef]);

  // Update conflict zones with ACLED threat levels
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const map = mapRef.current;
    const source = map.getSource("conflict-zones") as mapboxgl.GeoJSONSource;
    if (!source) return;

    // Build a lookup from ACLED data by zone name
    const threatByName: Record<string, string> = {};
    for (const zone of conflictZones) {
      threatByName[zone.name] = zone.threatLevel;
    }

    // Merge threat levels into static regions
    const features = CONFLICT_REGIONS.map((region) => ({
      type: "Feature" as const,
      properties: {
        name: region.name,
        color: region.color,
        threatLevel: threatByName[region.name] || "LOW",
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [region.bounds.west, region.bounds.north],
          [region.bounds.east, region.bounds.north],
          [region.bounds.east, region.bounds.south],
          [region.bounds.west, region.bounds.south],
          [region.bounds.west, region.bounds.north],
        ]],
      },
    }));

    source.setData({ type: "FeatureCollection", features });
  }, [conflictZones, loaded, mapRef]);

  // Layer visibility
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const map = mapRef.current;

    const shipLayers = ["vessel-clusters", "vessel-cluster-count", "vessel-status-dots", "vessel-points"];
    shipLayers.forEach((l) => {
      if (map.getLayer(l)) {
        map.setLayoutProperty(l, "visibility", layers.ships ? "visible" : "none");
      }
    });

    if (map.getLayer("shipping-lanes-line")) {
      map.setLayoutProperty(
        "shipping-lanes-line",
        "visibility",
        layers.lanes ? "visible" : "none"
      );
    }

    const conflictLayers = ["conflict-zones-fill", "conflict-zones-border", "conflict-zones-labels"];
    conflictLayers.forEach((l) => {
      if (map.getLayer(l)) {
        map.setLayoutProperty(l, "visibility", layers.conflicts ? "visible" : "none");
      }
    });
  }, [layers, loaded, mapRef]);

  const handleResetView = useCallback(() => {
    mapRef.current?.flyTo({
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      duration: 1500,
    });
  }, [mapRef]);

  const handleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

  const handleToggleLayer = useCallback(
    (layer: "ships" | "lanes" | "conflicts") => {
      setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
    },
    []
  );

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {loaded && (
        <MapControls
          layers={layers}
          onToggleLayer={handleToggleLayer}
          onResetView={handleResetView}
          onFullscreen={handleFullscreen}
        />
      )}
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg-secondary">
          <div className="text-center">
            <p className="font-mono text-sm text-text-secondary">
              MAPBOX TOKEN NOT CONFIGURED
            </p>
            <p className="mt-1 font-mono text-xs text-text-tertiary">
              Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
