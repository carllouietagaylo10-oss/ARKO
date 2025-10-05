import { useEffect, useState } from 'react';
import { toast } from 'sonner@2.0.3';

export interface EvacuationCenter {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  status: 'available' | 'full' | 'maintenance' | 'nearly-full';
  acceptingNewEvacuees: boolean;
  alternativeCenters?: string[];
  estimatedTravelTime: string;
  coordinates: { lat: number; lng: number };
}

interface EvacuationAlert {
  type: 'capacity-warning' | 'capacity-full' | 'alternative-recommended';
  center: EvacuationCenter;
  message: string;
  alternatives?: EvacuationCenter[];
}

export function useEvacuationAlerts(centers: EvacuationCenter[]) {
  const [previousStates, setPreviousStates] = useState<Map<string, number>>(new Map());
  const [alerts, setAlerts] = useState<EvacuationAlert[]>([]);

  useEffect(() => {
    const newAlerts: EvacuationAlert[] = [];
    const newPreviousStates = new Map(previousStates);

    centers.forEach(center => {
      const previousOccupancy = previousStates.get(center.id) || 0;
      const currentOccupancy = center.currentOccupancy;
      const capacityRatio = currentOccupancy / center.capacity;
      const previousRatio = previousOccupancy / center.capacity;

      // Only process if there's a significant change
      if (Math.abs(currentOccupancy - previousOccupancy) < 5) {
        return;
      }

      // Check for capacity warnings
      if (capacityRatio >= 0.8 && previousRatio < 0.8) {
        newAlerts.push({
          type: 'capacity-warning',
          center,
          message: `${center.name} is approaching capacity (${Math.round(capacityRatio * 100)}% full)`
        });

        toast.warning(`Evacuation Center Alert`, {
          description: `${center.name} is ${Math.round(capacityRatio * 100)}% full`,
          duration: 5000
        });
      }

      // Check for full capacity
      if (capacityRatio >= 1.0 && previousRatio < 1.0) {
        const alternatives = centers.filter(c => 
          center.alternativeCenters?.includes(c.id) && c.acceptingNewEvacuees
        );

        newAlerts.push({
          type: 'capacity-full',
          center,
          message: `${center.name} has reached full capacity`,
          alternatives
        });

        if (alternatives.length > 0) {
          const recommended = alternatives.sort((a, b) => {
            const aRatio = a.currentOccupancy / a.capacity;
            const bRatio = b.currentOccupancy / b.capacity;
            return aRatio - bRatio;
          })[0];

          toast.error(`${center.name} is now full!`, {
            description: `Consider ${recommended.name} (${recommended.estimatedTravelTime} away)`,
            duration: 8000
          });
        }
      }

      // Update previous state
      newPreviousStates.set(center.id, currentOccupancy);
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
    }

    // Only update previous states if there were changes
    if (newPreviousStates.size !== previousStates.size || 
        Array.from(newPreviousStates.entries()).some(([id, occupancy]) => 
          previousStates.get(id) !== occupancy)) {
      setPreviousStates(newPreviousStates);
    }
  }, [centers]);

  const clearAlerts = () => {
    setAlerts([]);
  };

  const getAlternativeRecommendations = (centerId: string): EvacuationCenter[] => {
    const center = centers.find(c => c.id === centerId);
    if (!center || !center.alternativeCenters) return [];

    return centers
      .filter(c => center.alternativeCenters?.includes(c.id) && c.acceptingNewEvacuees)
      .sort((a, b) => {
        // Sort by availability (least occupied first), then by distance
        const aRatio = a.currentOccupancy / a.capacity;
        const bRatio = b.currentOccupancy / b.capacity;
        return aRatio - bRatio;
      });
  };

  return {
    alerts,
    clearAlerts,
    getAlternativeRecommendations
  };
}