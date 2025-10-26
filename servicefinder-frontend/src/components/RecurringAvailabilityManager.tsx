import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar,
  Clock,
  Copy,
  Save,
  Trash2,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

import ThemedSelect from './ThemedSelect';
import { apiClient } from '../lib/api';
import { cn } from '../lib/utils';

interface RecurringPattern {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

interface RecurringAvailabilityManagerProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Monday', short: 'Mon' },
  { key: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { key: 'THURSDAY', label: 'Thursday', short: 'Thu' },
  { key: 'FRIDAY', label: 'Friday', short: 'Fri' },
  { key: 'SATURDAY', label: 'Saturday', short: 'Sat' },
  { key: 'SUNDAY', label: 'Sunday', short: 'Sun' }
];

export default function RecurringAvailabilityManager({ 
  onClose, 
  onSuccess 
}: RecurringAvailabilityManagerProps) {
  const [patterns, setPatterns] = useState<RecurringPattern[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days ahead
  });
  const [globalNotes, setGlobalNotes] = useState('');
  
  const queryClient = useQueryClient();

  // Create recurring availability mutation
  const createRecurringMutation = useMutation({
    mutationFn: async () => {
      const results = [];
      
      for (const pattern of patterns) {
        // Create recurring availability for the date range
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
          
          if (dayOfWeek === pattern.dayOfWeek) {
            const dateStr = date.toISOString().split('T')[0];
            const startDateTime = `${dateStr}T${pattern.startTime}:00`;
            const endDateTime = `${dateStr}T${pattern.endTime}:00`;
            
            try {
              const result = await apiClient.createAvailability({
                startDateTime,
                endDateTime,
                isRecurring: true,
                dayOfWeek: pattern.dayOfWeek,
                recurringStartTime: pattern.startTime + ':00',
                recurringEndTime: pattern.endTime + ':00',
                notes: pattern.notes || globalNotes || `Recurring availability - ${DAYS_OF_WEEK.find(d => d.key === pattern.dayOfWeek)?.label}`
              });
              results.push(result);
            } catch (error) {
              console.error(`Failed to create availability for ${dateStr}:`, error);
            }
          }
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      toast.success(`Created ${results.length} recurring availability slots!`);
      queryClient.invalidateQueries({ queryKey: ['provider-availability'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error('Failed to create recurring availability');
    },
  });

  const addPattern = () => {
    setPatterns([...patterns, {
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '17:00'
    }]);
  };

  const removePattern = (index: number) => {
    setPatterns(patterns.filter((_, i) => i !== index));
  };

  const updatePattern = (index: number, field: keyof RecurringPattern, value: string) => {
    const newPatterns = [...patterns];
    newPatterns[index] = { ...newPatterns[index], [field]: value };
    setPatterns(newPatterns);
  };

  const duplicatePattern = (index: number) => {
    const patternToDuplicate = { ...patterns[index] };
    setPatterns([...patterns, patternToDuplicate]);
  };

  const applyToAllDays = () => {
    if (patterns.length === 0) {
      toast.error('Please add at least one pattern first');
      return;
    }

    const basePattern = patterns[0];
    const newPatterns = DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.key,
      startTime: basePattern.startTime,
      endTime: basePattern.endTime,
      notes: basePattern.notes
    }));
    
    setPatterns(newPatterns);
  };

  const applyToWeekdays = () => {
    if (patterns.length === 0) {
      toast.error('Please add at least one pattern first');
      return;
    }

    const basePattern = patterns[0];
    const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const newPatterns = weekdays.map(day => ({
      dayOfWeek: day,
      startTime: basePattern.startTime,
      endTime: basePattern.endTime,
      notes: basePattern.notes
    }));
    
    setPatterns(newPatterns);
  };

  const handleSubmit = () => {
    if (patterns.length === 0) {
      toast.error('Please add at least one recurring pattern');
      return;
    }

    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Please select a valid date range');
      return;
    }

    // Validate patterns
    for (const pattern of patterns) {
      if (pattern.startTime >= pattern.endTime) {
        toast.error('End time must be after start time for all patterns');
        return;
      }
    }

    createRecurringMutation.mutate();
  };

  const getPreviewCount = () => {
    if (patterns.length === 0) return 0;
    
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    let count = 0;
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      if (patterns.some(p => p.dayOfWeek === dayOfWeek)) {
        count++;
      }
    }
    
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-medium text-primary-700">Recurring Availability</h3>
          <p className="text-sm text-gray-600 mt-1">Create availability patterns that repeat weekly</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Date Range */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Date Range</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                min={dateRange.startDate}
                className="input w-full"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Setup</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={applyToWeekdays}
              className="btn btn-outline btn-sm"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Apply to Weekdays
            </button>
            <button
              onClick={applyToAllDays}
              className="btn btn-outline btn-sm"
            >
              <Copy className="w-4 h-4 mr-1" />
              Apply to All Days
            </button>
            <button
              onClick={addPattern}
              className="btn btn-primary btn-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Pattern
            </button>
          </div>
        </div>

        {/* Patterns */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Weekly Patterns</h4>
          
          {patterns.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h5 className="text-lg font-medium text-gray-900 mb-2">No patterns added</h5>
              <p className="text-gray-600 mb-4">Create recurring availability patterns for different days</p>
              <button
                onClick={addPattern}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Pattern
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {patterns.map((pattern, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day of Week
                      </label>
                      <ThemedSelect
                        value={pattern.dayOfWeek}
                        onChange={(v: string) => updatePattern(index, 'dayOfWeek', v)}
                        options={DAYS_OF_WEEK.map((day) => ({ value: day.key, label: day.label }))}
                        placeholder="Day of Week"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={pattern.startTime}
                        onChange={(e) => updatePattern(index, 'startTime', e.target.value)}
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={pattern.endTime}
                        onChange={(e) => updatePattern(index, 'endTime', e.target.value)}
                        className="input w-full"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => duplicatePattern(index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Duplicate pattern"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removePattern(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove pattern"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={pattern.notes || ''}
                      onChange={(e) => updatePattern(index, 'notes', e.target.value)}
                      placeholder={`Available ${pattern.startTime} - ${pattern.endTime}`}
                      className="input w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Notes */}
        {patterns.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Notes (Optional)
            </label>
            <textarea
              value={globalNotes}
              onChange={(e) => setGlobalNotes(e.target.value)}
              placeholder="These notes will be applied to all patterns that don't have specific notes..."
              className="input w-full h-20 resize-none"
            />
          </div>
        )}

        {/* Preview */}
        {patterns.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Preview</h4>
                <p className="text-sm text-blue-700">
                  This will create approximately <strong>{getPreviewCount()}</strong> availability slots
                  from {dateRange.startDate} to {dateRange.endDate}.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {patterns.map((pattern, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {DAYS_OF_WEEK.find(d => d.key === pattern.dayOfWeek)?.short} {pattern.startTime}-{pattern.endTime}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center p-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {patterns.length} pattern{patterns.length !== 1 ? 's' : ''} configured
        </div>
        
        <div className="flex space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-outline"
              disabled={createRecurringMutation.isPending}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={createRecurringMutation.isPending || patterns.length === 0}
            className="btn btn-primary"
          >
            {createRecurringMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Recurring Availability
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 