/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Users, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { WorkshopEvent } from '../types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';

interface WorkshopScheduleProps {
  artisanId: string;
  onClose: () => void;
}

type EventType = 'workshop' | 'custom_order' | 'personal';

interface FormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: EventType;
  description: string;
  location: string;
  maxParticipants: number;
  reminders: boolean;
}

const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; label: string }> = {
  workshop: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Workshop' },
  custom_order: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Custom Order' },
  personal: { bg: 'bg-green-50', text: 'text-green-600', label: 'Personal' },
};

export default React.memo(function WorkshopSchedule({ artisanId, onClose }: WorkshopScheduleProps) {
  const [events, setEvents] = useState<WorkshopEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    type: 'workshop',
    description: '',
    location: '',
    maxParticipants: 10,
    reminders: true,
  });

  // Subscribe to workshop events
  useEffect(() => {
    const q = query(collection(db, 'workshops'), where('artisanId', '==', artisanId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workshopData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as WorkshopEvent[];
      setEvents(workshopData.sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()));
    });
    return unsubscribe;
  }, [artisanId]);

  const upcomingEvents = useMemo(() => {
    return events.filter(e => e.date.toDate() > new Date() && e.status !== 'cancelled');
  }, [events]);

  const pastEvents = useMemo(() => {
    return events.filter(e => e.date.toDate() <= new Date() || e.status === 'completed');
  }, [events]);

  const handleSaveEvent = useCallback(async () => {
    if (!formData.title.trim() || !formData.date || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const eventDate = new Date(`${formData.date}T${formData.startTime}`);
      const eventId = doc(collection(db, 'workshops')).id;

      await setDoc(doc(db, 'workshops', eventId), {
        id: eventId,
        artisanId,
        title: formData.title,
        date: Timestamp.fromDate(eventDate),
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        description: formData.description,
        location: formData.location,
        maxParticipants: formData.maxParticipants,
        enrolled: 0,
        enrolledStudents: [],
        reminders: formData.reminders,
        status: 'scheduled',
        createdAt: Timestamp.now(),
      });

      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '12:00',
        type: 'workshop',
        description: '',
        location: '',
        maxParticipants: 10,
        reminders: true,
      });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save event:', err);
      alert('Failed to save event');
    } finally {
      setIsSaving(false);
    }
  }, [formData, artisanId]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    if (!confirm('Delete this event?')) return;
    
    try {
      await deleteDoc(doc(db, 'workshops', eventId));
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event');
    }
  }, []);

  const handleMarkCompleted = useCallback(async (eventId: string) => {
    try {
      await setDoc(
        doc(db, 'workshops', eventId),
        { status: 'completed' },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to mark completed:', err);
    }
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const hasEvent = events.some(e => 
        e.date.toDate().toDateString() === date.toDateString()
      );
      
      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`p-2 rounded-lg text-sm font-bold transition-all ${
            date.toDateString() === selectedDate.toDateString()
              ? 'bg-earth-primary text-white'
              : 'hover:bg-earth-light'
          } ${hasEvent ? 'ring-2 ring-earth-primary' : ''}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const selectedDateEvents = useMemo(() => {
    return events.filter(e => e.date.toDate().toDateString() === selectedDate.toDateString());
  }, [events, selectedDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center p-4"
    >
      <div className="w-full sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-earth-dark/5">
          <h2 className="text-lg font-black text-earth-dark">Workshop Schedule</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-earth-light rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Calendar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-earth-dark">
                {selectedDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                  className="p-2 hover:bg-earth-light rounded-lg transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                  className="p-2 hover:bg-earth-light rounded-lg transition-colors"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-earth-dark/50 py-2">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>
          </div>

          {/* Events for selected date */}
          {selectedDateEvents.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-earth-dark/60 uppercase">EVENTS ON {selectedDate.toLocaleDateString()}</h4>
              {selectedDateEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-2xl border border-earth-dark/5 bg-earth-light/30"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-sm text-earth-dark">{event.title}</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-black ${EVENT_TYPE_COLORS[event.type].bg} ${EVENT_TYPE_COLORS[event.type].text}`}>
                        {EVENT_TYPE_COLORS[event.type].label}
                      </span>
                    </div>
                    {event.status === 'scheduled' && (
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-earth-dark/70 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.description && (
                      <p className="text-xs mt-2">{event.description}</p>
                    )}
                  </div>

                  {event.type === 'workshop' && (
                    <div className="flex items-center gap-2 text-xs text-earth-dark/60 mb-3">
                      <Users size={14} />
                      <span>{event.enrolled || 0} / {event.maxParticipants} enrolled</span>
                    </div>
                  )}

                  {event.status === 'scheduled' && (
                    <button
                      onClick={() => handleMarkCompleted(event.id)}
                      className="w-full h-10 rounded-xl bg-green-50 text-green-600 font-black text-sm hover:bg-green-100 transition-colors active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={14} />
                      Mark Completed
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-earth-dark/60 uppercase">UPCOMING WORKSHOPS</h4>
              <div className="space-y-2">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm font-bold text-blue-900">{event.title}</p>
                    <p className="text-xs text-blue-700">{event.date.toDate().toLocaleDateString()} • {event.startTime}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Event Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 bg-earth-light/30 rounded-2xl"
              >
                <h4 className="text-sm font-black text-earth-dark">New Event</h4>
                
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event Title"
                  className="w-full px-4 py-3 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none text-sm"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none text-sm"
                  />
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                    className="px-4 py-3 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none text-sm"
                  >
                    <option value="workshop">Workshop</option>
                    <option value="custom_order">Custom Order</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none text-sm"
                  />
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none text-sm"
                  />
                </div>

                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Location"
                  className="w-full px-4 py-3 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none text-sm"
                />

                {formData.type === 'workshop' && (
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    placeholder="Max Participants"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none text-sm"
                  />
                )}

                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description"
                  className="w-full min-h-20 px-4 py-3 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none text-sm resize-none"
                />

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminders}
                    onChange={(e) => setFormData({ ...formData, reminders: e.target.checked })}
                    className="w-4 h-4 rounded-lg"
                  />
                  <span className="text-sm font-bold text-earth-dark">Enable reminders</span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    disabled={isSaving}
                    className="flex-1 h-12 rounded-xl bg-earth-light text-earth-dark font-black disabled:opacity-50 transition-colors active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    disabled={isSaving}
                    className="flex-1 h-12 rounded-xl bg-earth-primary text-white font-black hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
                  >
                    {isSaving ? 'Saving...' : 'Save Event'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add Event Button */}
        {!showForm && (
          <div className="border-t border-earth-dark/5 p-4 flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 h-12 rounded-xl bg-earth-primary text-white font-black hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Event
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
});
