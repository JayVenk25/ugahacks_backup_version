import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocation } from './LocationContext';
import { findClosestParkingLot } from '../utils/locationUtils';
import { supabase } from '../config/supabase';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

const PARKING_LOTS = [
  { id: 'lot1', name: 'Main Parking Lot', totalSpots: 64, lat: 33.9784, lng: -84.1315 },
];

const COURTS = [
  { id: 'pb1', name: 'Pickleball Court 1', type: 'pickleball', lat: 33.9785, lng: -84.1316 },
  { id: 'pb2', name: 'Pickleball Court 2', type: 'pickleball', lat: 33.9786, lng: -84.1317 },
  { id: 'pb3', name: 'Pickleball Court 3', type: 'pickleball', lat: 33.9787, lng: -84.1318 },
  { id: 'pb4', name: 'Pickleball Court 4', type: 'pickleball', lat: 33.9788, lng: -84.1319 },
  { id: 'pb5', name: 'Pickleball Court 5', type: 'pickleball', lat: 33.9789, lng: -84.1320 },
  { id: 'bb1', name: 'Basketball Court 1', type: 'basketball', lat: 33.9790, lng: -84.1321 },
  { id: 'bb2', name: 'Basketball Court 2', type: 'basketball', lat: 33.9791, lng: -84.1322 },
  { id: 'fc1', name: 'Futsal Court 1', type: 'futsal', lat: 33.9792, lng: -84.1323 },
  { id: 'fc2', name: 'Futsal Court 2', type: 'futsal', lat: 33.9793, lng: -84.1324 },
  { id: 'vb1', name: 'Sand Volleyball Court 1', type: 'volleyball', lat: 33.9794, lng: -84.1325 },
  { id: 'vb2', name: 'Sand Volleyball Court 2', type: 'volleyball', lat: 33.9795, lng: -84.1326 },
  { id: 'vb3', name: 'Sand Volleyball Court 3', type: 'volleyball', lat: 33.9796, lng: -84.1327 },
];

export const DataProvider = ({ children }) => {
  const { location, isInParkArea } = useLocation();
  const [parkingData, setParkingData] = useState({});
  const [courtsData, setCourtsData] = useState({});
  const [reports, setReports] = useState([]);
  const [activityReports, setActivityReports] = useState([]);
  const [moves, setMoves] = useState([]);

  // Initialize parking data with test data
  useEffect(() => {
    const initParkingData = async () => {
      try {
        const stored = await AsyncStorage.getItem('parkingData');
        if (stored) {
          setParkingData(JSON.parse(stored));
        } else {
          // Test data for hackathon
          const initial = {
            lot1: { occupied: 42, lastUpdated: Date.now() }, // Main lot: 42/64 (66% - medium)
          };
          setParkingData(initial);
          await AsyncStorage.setItem('parkingData', JSON.stringify(initial));
        }
      } catch (error) {
        console.error('Error loading parking data:', error);
      }
    };
    initParkingData();
  }, []);

  // Initialize courts data with test data
  useEffect(() => {
    const initCourtsData = async () => {
      try {
        const stored = await AsyncStorage.getItem('courtsData');
        if (stored) {
          setCourtsData(JSON.parse(stored));
        } else {
          // Test data for hackathon - varying activity levels
          const initial = {
            // Pickleball - high activity
            pb1: { available: false, condition: 'good', comments: [], lastUpdated: Date.now() },
            pb2: { available: false, condition: 'good', comments: [], lastUpdated: Date.now() },
            pb3: { available: false, condition: 'fair', comments: [], lastUpdated: Date.now() },
            pb4: { available: true, condition: 'good', comments: [], lastUpdated: Date.now() },
            pb5: { available: true, condition: 'good', comments: [], lastUpdated: Date.now() },
            // Basketball - medium activity
            bb1: { available: false, condition: 'good', comments: [], lastUpdated: Date.now() },
            bb2: { available: true, condition: 'good', comments: [], lastUpdated: Date.now() },
            // Futsal - low activity
            fc1: { available: true, condition: 'good', comments: [], lastUpdated: Date.now() },
            fc2: { available: true, condition: 'good', comments: [], lastUpdated: Date.now() },
            // Volleyball - medium activity
            vb1: { available: false, condition: 'good', comments: [], lastUpdated: Date.now() },
            vb2: { available: true, condition: 'good', comments: [], lastUpdated: Date.now() },
            vb3: { available: true, condition: 'good', comments: [], lastUpdated: Date.now() },
          };
          setCourtsData(initial);
          await AsyncStorage.setItem('courtsData', JSON.stringify(initial));
        }
      } catch (error) {
        console.error('Error loading courts data:', error);
      }
    };
    initCourtsData();
  }, []);

  // Load reports
  useEffect(() => {
    const loadReports = async () => {
      try {
        const stored = await AsyncStorage.getItem('reports');
        if (stored) {
          setReports(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading reports:', error);
      }
    };
    loadReports();
  }, []);

  // Load activity reports
  useEffect(() => {
    const loadActivityReports = async () => {
      try {
        const stored = await AsyncStorage.getItem('activityReports');
        if (stored) {
          setActivityReports(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading activity reports:', error);
      }
    };
    loadActivityReports();
  }, []);

  // Load moves from Supabase and local storage
  useEffect(() => {
    const loadMoves = async () => {
      try {
        // Try to load from Supabase first
        try {
          const { data, error } = await supabase.rpc('get_recent_moves');
          if (!error && data && data.length > 0) {
            // Convert Supabase format to app format
            const formattedMoves = data.map(move => ({
              id: move.id,
              title: move.title,
              description: move.description,
              interested: move.interested || [],
              notInterested: move.not_interested || [],
              comments: (move.comments || []).map(comment => ({
                text: comment.text,
                author: comment.author,
                timestamp: comment.timestamp || new Date(comment.created_at || Date.now()).getTime(),
              })),
              timestamp: new Date(move.created_at).getTime(),
            }));
            setMoves(formattedMoves);
            // Also save to local storage for offline access
            await AsyncStorage.setItem('moves', JSON.stringify(formattedMoves));
            return;
          }
        } catch (supabaseError) {
          console.log('Supabase not available, using local storage');
        }

        // Fallback to local storage
        const stored = await AsyncStorage.getItem('moves');
        if (stored) {
          const allMoves = JSON.parse(stored);
          // Filter out moves older than 1 day
          const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
          const activeMoves = allMoves.filter(move => move.timestamp > oneDayAgo);
          setMoves(activeMoves);
          // Save cleaned up moves
          if (activeMoves.length !== allMoves.length) {
            await AsyncStorage.setItem('moves', JSON.stringify(activeMoves));
          }
        }
      } catch (error) {
        console.error('Error loading moves:', error);
      }
    };
    loadMoves();
  }, []);

  // Update parking when user is in park
  useEffect(() => {
    if (isInParkArea && location && location.coords) {
      const closestLot = findClosestParkingLot(location.coords.latitude, location.coords.longitude);
      if (closestLot) {
        updateParkingOccupancy(closestLot.id, 1);
      }
    }
  }, [isInParkArea, location]);

  const updateParkingOccupancy = async (lotId, change) => {
    setParkingData(prev => {
      const newData = { ...prev };
      if (!newData[lotId]) {
        newData[lotId] = { occupied: 0, lastUpdated: Date.now() };
      }
      const newOccupied = Math.max(0, Math.min(PARKING_LOTS.find(l => l.id === lotId)?.totalSpots || 0, 
        newData[lotId].occupied + change));
      newData[lotId] = {
        ...newData[lotId],
        occupied: newOccupied,
        lastUpdated: Date.now(),
      };
      AsyncStorage.setItem('parkingData', JSON.stringify(newData));
      
      // Also update Supabase
      supabase.from('parking_data').upsert({
        lot_id: lotId,
        occupied: newOccupied,
        last_updated: new Date().toISOString(),
      }).catch(error => {
        console.log('Supabase parking update failed, using local storage only');
      });
      
      return newData;
    });
  };

  const updateCourtData = async (courtId, updates) => {
    setCourtsData(prev => {
      const newData = { ...prev };
      newData[courtId] = {
        ...newData[courtId],
        ...updates,
        lastUpdated: Date.now(),
      };
      AsyncStorage.setItem('courtsData', JSON.stringify(newData));
      return newData;
    });
  };

  const addCourtComment = async (courtId, comment, isAreaComment = false) => {
    setCourtsData(prev => {
      const newData = { ...prev };
      if (!newData[courtId]) {
        newData[courtId] = { available: true, condition: 'good', comments: [], lastUpdated: Date.now() };
      }
      newData[courtId].comments = [
        ...(newData[courtId].comments || []),
        { 
          text: comment, 
          timestamp: Date.now(),
          courtId: isAreaComment ? null : courtId, // null for area comments, courtId for specific court comments
        },
      ];
      newData[courtId].lastUpdated = Date.now();
      AsyncStorage.setItem('courtsData', JSON.stringify(newData));
      return newData;
    });
  };

  const addAreaComment = async (areaType, comment) => {
    // Add comment to the first court of this type as an area-level comment
    const areaCourts = COURTS.filter(c => c.type === areaType);
    if (areaCourts.length > 0) {
      await addCourtComment(areaCourts[0].id, comment, true);
    }
  };

  const addReport = async (report) => {
    const newReport = {
      ...report,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setReports(prev => {
      const updated = [...prev, newReport];
      AsyncStorage.setItem('reports', JSON.stringify(updated));
      return updated;
    });
  };

  // Add activity report (Light, Medium, Busy)
  const addActivityReport = async (courtType, status) => {
    const newReport = {
      id: Date.now().toString(),
      courtType,
      status: status.toLowerCase(), // 'light', 'medium', 'busy'
      timestamp: Date.now(),
    };
    
    // Save to local storage
    setActivityReports(prev => {
      const updated = [...prev, newReport];
      // Keep only reports from last 45 minutes
      const filtered = updated.filter(r => {
        const minutesOld = (Date.now() - r.timestamp) / (1000 * 60);
        return minutesOld <= 45;
      });
      AsyncStorage.setItem('activityReports', JSON.stringify(filtered));
      return filtered;
    });

    // Also save to Supabase (async, don't wait)
    supabase.from('court_reports').insert({
      court_type: courtType,
      status: status.toLowerCase(),
      created_at: new Date().toISOString(),
    }).catch(error => {
      console.log('Supabase not configured or unavailable:', error.message);
      // Continue even if Supabase fails - local storage is primary
    });
  };

  // Time-weighted averaging algorithm to calculate court status
  const getCourtStatus = (courtType) => {
    // Note: Supabase RPC calls are async, but we need sync for UI
    // We'll use local calculation for now, and sync to Supabase in background
    // Fallback to local calculation
    const TIME_WINDOW_MINUTES = 45;
    const now = Date.now();

    // Get reports from last 45 minutes for this court type
    const relevantReports = activityReports.filter(r => {
      if (r.courtType !== courtType) return false;
      const minutesOld = (now - r.timestamp) / (1000 * 60);
      return minutesOld <= TIME_WINDOW_MINUTES;
    });

    // If no reports, default to 'light'
    if (relevantReports.length === 0) {
      return 'light';
    }

    // Convert status to score
    const statusToScore = (status) => {
      switch (status.toLowerCase()) {
        case 'light': return 1;
        case 'medium': return 2;
        case 'busy': return 3;
        default: return 1;
      }
    };

    // Calculate weighted sum
    let weightedSum = 0;
    let weightTotal = 0;

    relevantReports.forEach(report => {
      const score = statusToScore(report.status);
      const minutesOld = (now - report.timestamp) / (1000 * 60);
      const weight = Math.max(0, 1 - (minutesOld / TIME_WINDOW_MINUTES));
      
      weightedSum += score * weight;
      weightTotal += weight;
    });

    // If no valid weights, default to 'light'
    if (weightTotal === 0) {
      return 'light';
    }

    // Calculate weighted average
    const weightedAvg = weightedSum / weightTotal;

    // Convert to status label
    if (weightedAvg < 1.6) {
      return 'light';
    } else if (weightedAvg < 2.3) {
      return 'medium';
    } else {
      return 'busy';
    }
  };

  // Add a new move
  const addMove = async (move) => {
    const tempId = Date.now().toString();
    const newMove = {
      id: tempId,
      title: move.title,
      description: move.description,
      interested: [],
      notInterested: [],
      comments: [],
      timestamp: Date.now(),
    };
    
    // Save to local storage first (with temp ID)
    setMoves(prev => {
      const updated = [newMove, ...prev];
      AsyncStorage.setItem('moves', JSON.stringify(updated));
      return updated;
    });

    // Also save to Supabase
    try {
      const { data, error } = await supabase.from('moves').insert({
        title: move.title,
        description: move.description,
        interested: [],
        not_interested: [],
        comments: [],
      }).select().single();
      
      if (!error && data) {
        // Update local move with Supabase UUID
        setMoves(prev => {
          const updated = prev.map(m => 
            m.id === tempId ? { 
              ...m, 
              id: data.id, 
              timestamp: new Date(data.created_at).getTime() 
            } : m
          );
          AsyncStorage.setItem('moves', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.log('Supabase not available, using local storage only:', error.message);
    }
  };

  // Update move interest (interested or notInterested)
  const updateMoveInterest = async (moveId, type) => {
    const userId = 'user'; // In a real app, this would be the actual user ID
    
    // Update local storage first
    setMoves(prev => {
      const updated = prev.map(move => {
        if (move.id === moveId) {
          // Remove from both arrays first
          const newInterested = (move.interested || []).filter(id => id !== userId);
          const newNotInterested = (move.notInterested || []).filter(id => id !== userId);
          
          // Add to the appropriate array
          if (type === 'interested') {
            newInterested.push(userId);
          } else {
            newNotInterested.push(userId);
          }
          
          return {
            ...move,
            interested: newInterested,
            notInterested: newNotInterested,
          };
        }
        return move;
      });
      AsyncStorage.setItem('moves', JSON.stringify(updated));
      return updated;
    });

    // Also update in Supabase
    try {
      await supabase.rpc('add_move_interest', {
        move_id_param: moveId,
        user_id_param: userId,
        is_interested: type === 'interested',
      });
    } catch (error) {
      console.log('Supabase update failed, using local storage only');
    }
  };

  // Add comment to a move
  const addMoveComment = async (moveId, commentText) => {
    const author = 'You'; // In a real app, this would be the actual user name
    const newComment = {
      text: commentText,
      author: author,
      timestamp: Date.now(),
    };
    
    // Update local storage first
    setMoves(prev => {
      const updated = prev.map(move => {
        if (move.id === moveId) {
          return {
            ...move,
            comments: [...(move.comments || []), newComment],
          };
        }
        return move;
      });
      AsyncStorage.setItem('moves', JSON.stringify(updated));
      return updated;
    });

    // Also save to Supabase
    try {
      await supabase.rpc('add_move_comment', {
        move_id_param: moveId,
        comment_text: commentText,
        author_name: author,
      });
    } catch (error) {
      console.log('Supabase comment save failed, using local storage only');
    }
  };

  return (
    <DataContext.Provider
      value={{
        parkingLots: PARKING_LOTS,
        courts: COURTS,
        parkingData,
        courtsData,
        reports,
        updateParkingOccupancy,
        updateCourtData,
        addCourtComment,
        addAreaComment,
        addReport,
        addActivityReport,
        getCourtStatus,
        moves,
        addMove,
        updateMoveInterest,
        addMoveComment,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

