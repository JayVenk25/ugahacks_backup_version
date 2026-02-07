import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Location from 'expo-location';
import { calculateDistance, isInPark } from '../utils/locationUtils';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isInParkArea, setIsInParkArea] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Start watching position
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setLocation(newLocation);
          setIsInParkArea(isInPark(newLocation.coords.latitude, newLocation.coords.longitude));
        }
      );

      return () => {
        if (subscription) {
          subscription.remove();
        }
      };
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ location, errorMsg, isInParkArea }}>
      {children}
    </LocationContext.Provider>
  );
};

