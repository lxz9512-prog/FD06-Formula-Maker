import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";

interface DeviceData {
  powderAmount: number;
  powderCapacity: number;
  waterAmount: number;
  waterCapacity: number;
  lastWaterRefill: string;
  lastPowderRefill: string;
}

const STORAGE_KEY = "device_data";

const DEFAULT_DATA: DeviceData = {
  powderAmount: 300,
  powderCapacity: 500,
  waterAmount: 1.5,
  waterCapacity: 2.0,
  lastWaterRefill: dayjs().subtract(26, "hour").toISOString(),
  lastPowderRefill: dayjs().subtract(20, "hour").toISOString(),
};

function loadData(): DeviceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_DATA;
}

function saveData(data: DeviceData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("device-data-change", { detail: data }));
}

type Listener = (data: DeviceData) => void;

const listeners = new Set<Listener>();

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDeviceData(): DeviceData {
  return loadData();
}

export function updateDeviceData(
  updates: Partial<DeviceData>
): DeviceData {
  const current = loadData();
  const next = { ...current, ...updates };
  saveData(next);
  listeners.forEach((fn) => fn(next));
  return next;
}

export function useDeviceData(): [DeviceData, typeof updateDeviceData] {
  const [data, setData] = useState<DeviceData>(loadData);

  useEffect(() => {
    const unsubscribe = subscribe(setData);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setData(loadData());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const update = useCallback(
    (updates: Partial<DeviceData>): DeviceData => {
      const next = updateDeviceData(updates);
      setData(next);
      return next;
    },
    []
  );

  return [data, update];
}
