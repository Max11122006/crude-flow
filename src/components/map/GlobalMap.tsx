"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { VesselData } from "@/types/vessel";
import type { ConflictZone } from "@/types/conflict";
import { vesselToGeoJSON } from "@/lib/ais-parser";
import { SHIPPING_LANES_GEOJSON } from "@/lib/shipping-lanes";
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

      // Individual vessel markers
      map.addLayer({
        id: "vessel-points",
        type: "circle",
        source: "vessels",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "match",
            ["get", "status"],
            "transit", "#3b82f6",
            "anchored", "#06b6d4",
            "conflict", "#f97316",
            "distress", "#ef4444",
            "#3b82f6",
          ],
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#0a0e17",
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

      // Conflict zones source
      map.addSource("conflict-zones", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "conflict-zones-fill",
        type: "fill",
        source: "conflict-zones",
        paint: {
          "fill-color": "#ef4444",
          "fill-opacity": 0.15,
        },
      });

      map.addLayer({
        id: "conflict-zones-border",
        type: "line",
        source: "conflict-zones",
        paint: {
          "line-color": "#ef4444",
          "line-opacity": 0.4,
          "line-width": 1,
          "line-dasharray": [3, 3],
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

        popup
          .setLngLat(coords)
          .setHTML(
            `<div style="font-family:monospace;font-size:11px;color:#e2e8f0;padding:4px;">
              <strong>${props.name}</strong><br/>
              Speed: ${Number(props.speed).toFixed(1)} kn<br/>
              Course: ${Number(props.course).toFixed(0)}°<br/>
              Status: ${props.status}
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

  // Update conflict zones
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const map = mapRef.current;
    const source = map.getSource("conflict-zones") as mapboxgl.GeoJSONSource;
    if (!source) return;

    const features = conflictZones.map((zone) => ({
      type: "Feature" as const,
      properties: { name: zone.name, threatLevel: zone.threatLevel },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [zone.bounds.west, zone.bounds.north],
            [zone.bounds.east, zone.bounds.north],
            [zone.bounds.east, zone.bounds.south],
            [zone.bounds.west, zone.bounds.south],
            [zone.bounds.west, zone.bounds.north],
          ],
        ],
      },
    }));

    source.setData({
      type: "FeatureCollection",
      features,
    });
  }, [conflictZones, loaded, mapRef]);

  // Layer visibility
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const map = mapRef.current;

    const shipLayers = ["vessel-clusters", "vessel-cluster-count", "vessel-points"];
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

    const conflictLayers = ["conflict-zones-fill", "conflict-zones-border"];
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
