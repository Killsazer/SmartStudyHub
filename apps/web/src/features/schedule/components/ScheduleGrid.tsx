import React from 'react';
import { ScheduleSlot, Teacher } from '../api/schedule.api';
import { ScheduleSlotCard } from './ScheduleSlotCard';
import { SubjectItem } from '../../subjects/api/subjects.api';
import { useTranslation } from 'react-i18next';

interface Props {
  weekNumber: number;
  slots: ScheduleSlot[];
  subjects: SubjectItem[];
  teachers: Teacher[];
  onSlotClick?: (slot: ScheduleSlot) => void;
  onEmptySlotClick?: (day: number, timeIndex: number) => void;
  onEditSlot?: (slot: ScheduleSlot) => void;
  onDeleteSlot?: (slot: ScheduleSlot) => void;
}

export const KPI_TIME_SLOTS = [
  { label: '1 пара', time: '08:30 - 10:05', start: '08:30' },
  { label: '2 пара', time: '10:25 - 12:00', start: '10:25' },
  { label: '3 пара', time: '12:20 - 13:55', start: '12:20' },
  { label: '4 пара', time: '14:15 - 15:50', start: '14:15' },
  { label: '5 пара', time: '16:10 - 17:45', start: '16:10' },
  { label: '6 пара', time: '18:05 - 19:40', start: '18:05' },
];

export const KPI_DAYS = [1, 2, 3, 4, 5, 6]; // Mon - Sat

export const ScheduleGrid: React.FC<Props> = ({ weekNumber, slots, subjects, teachers, onSlotClick, onEmptySlotClick, onEditSlot, onDeleteSlot }) => {
  const { t } = useTranslation();

  const getDayName = (dayNumber: number) => {
    const days = [t('monday', 'Monday'), t('tuesday', 'Tuesday'), t('wednesday', 'Wednesday'), t('thursday', 'Thursday'), t('friday', 'Friday'), t('saturday', 'Saturday')];
    return days[dayNumber - 1] || '';
  };

  const getSlot = (day: number, startTime: string) => {
    return slots.find(s => s.weekNumber === weekNumber && s.dayOfWeek === day && s.startTime === startTime);
  };

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr>
            <th className="w-24 p-3 border-b border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-xs font-semibold text-zinc-500 text-center">
              {t('time', 'Time')}
            </th>
            {KPI_DAYS.map(day => (
              <th key={day} className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-center min-w-[160px] max-w-[200px] w-1/6">
                {getDayName(day)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {KPI_TIME_SLOTS.map((timeSlot, timeIndex) => (
            <tr key={timeSlot.start} className="group">
              <td className="p-3 border-b border-r border-zinc-200 dark:border-zinc-800 text-center">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{timeSlot.label}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{timeSlot.time}</div>
              </td>
              {KPI_DAYS.map(day => {
                const slot = getSlot(day, timeSlot.start);
                return (
                  <td 
                    key={`${day}-${timeSlot.start}`} 
                    className="p-1.5 border-b border-r border-zinc-200 dark:border-zinc-800 relative bg-zinc-50/30 dark:bg-zinc-900/10 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors h-[100px]"
                    onClick={() => {
                      if (slot) {
                        onSlotClick?.(slot);
                      } else {
                        onEmptySlotClick?.(day, timeIndex);
                      }
                    }}
                  >
                    {slot ? (
                      <ScheduleSlotCard
                        slot={slot}
                        subject={subjects.find(s => s.id === slot.subjectId)}
                        teacher={teachers.find(t => t.id === slot.teacherId)}
                        onEdit={onEditSlot ? (e) => { e.stopPropagation(); onEditSlot(slot); } : undefined}
                        onDelete={onDeleteSlot ? (e) => { e.stopPropagation(); onDeleteSlot(slot); } : undefined}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xl text-zinc-300 dark:text-zinc-700 font-light">+</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
