import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createScheduleSlot, updateScheduleSlot, Teacher, ClassType, ScheduleSlot } from '../api/schedule.api';
import { SubjectItem } from '../../subjects/api/subjects.api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { KPI_TIME_SLOTS } from './ScheduleGrid';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectItem[];
  teachers: Teacher[];
  initialDay?: number;
  initialTimeIndex?: number;
  initialData?: ScheduleSlot;
  weekNumber: number;
  onCreated: () => void;
}

export const CreateSlotModal: React.FC<Props> = ({ isOpen, onClose, subjects, teachers, initialDay, initialTimeIndex, initialData, weekNumber, onCreated }) => {
  const { t } = useTranslation();
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [timeIndex, setTimeIndex] = useState(0);
  const [classType, setClassType] = useState<ClassType>('LECTURE');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSubjectId(initialData.subjectId);
        setTeacherId(initialData.teacherId || '');
        setDayOfWeek(initialData.dayOfWeek);
        setClassType(initialData.classType);
        setLocation(initialData.location || '');
        const idx = KPI_TIME_SLOTS.findIndex(slot => slot.time.startsWith(initialData.startTime));
        setTimeIndex(idx >= 0 ? idx : 0);
      } else {
        setDayOfWeek(initialDay ?? 1);
        setTimeIndex(initialTimeIndex ?? 0);
        setSubjectId(subjects[0]?.id || '');
        setTeacherId('');
        setClassType('LECTURE');
        setLocation('');
      }
    }
  }, [isOpen, initialDay, initialTimeIndex, initialData, subjects]);

  if (!isOpen) return null;

  const requiresTeacher = classType === 'LAB';
  const teacherMissing = requiresTeacher && !teacherId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) { toast.error(t('please_select_subject')); return; }
    if (teacherMissing) { toast.error(t('lab_requires_teacher')); return; }

    setLoading(true);
    try {
      const slotTime = KPI_TIME_SLOTS[timeIndex];
      const timeParts = slotTime.time.split(' - ');
      const startTime = timeParts[0];
      const endTime = timeParts[1];

      const payload = {
        subjectId,
        teacherId: teacherId || null,
        weekNumber: initialData ? initialData.weekNumber : weekNumber,
        dayOfWeek,
        startTime: startTime,
        endTime: endTime,
        classType,
        location: location || null,
      };

      if (initialData) {
        await updateScheduleSlot(initialData.id, payload);
        toast.success(t('save_changes'));
      } else {
        await createScheduleSlot(payload);
        toast.success(t('schedule_slot_created'));
      }

      onCreated();
      onClose();
    } catch (err: any) {
      const beMessage: string | undefined = err?.response?.data?.message;
      toast.error(beMessage || t('failed_to_save_schedule_slot'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{initialData ? t('edit_lesson') : t('add_lesson')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">{t('my_subjects')}</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white"
              required
            >
              <option value="" disabled>{t('choose_subject')}</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">{t('lesson_type')}</label>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value as ClassType)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white"
              >
                <option value="LECTURE">{t('lecture')}</option>
                <option value="LAB">{t('lab')}</option>
                <option value="PRACTICE">{t('practice')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">{t('time_slot')}</label>
              <select
                value={timeIndex}
                onChange={(e) => setTimeIndex(Number(e.target.value))}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white"
              >
                {KPI_TIME_SLOTS.map((slot, idx) => (
                  <option key={idx} value={idx}>{t('pair', { n: idx + 1 })} ({slot.start})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${teacherMissing ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
              {requiresTeacher ? t('teacher_required_lab') : t('teacher_opt')}
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className={`w-full bg-white dark:bg-zinc-950 border rounded-lg px-4 py-2 text-zinc-900 dark:text-white transition-colors ${
                teacherMissing
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
              required={requiresTeacher}
            >
              <option value="">{t('no_teacher')}</option>
              {teachers.map(tch => <option key={tch.id} value={tch.id}>{tch.name}</option>)}
            </select>
            {teacherMissing && (
              <p className="mt-1.5 text-xs text-red-500">{t('lab_requires_teacher')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">{t('location')}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onPaste={(e) => {
                const pastedText = e.clipboardData?.getData('text');
                if (pastedText && pastedText.trim().match(/^https?:\/\/[^\s]+$/)) {
                  const selectionStart = e.currentTarget.selectionStart;
                  const selectionEnd = e.currentTarget.selectionEnd;
                  if (selectionStart !== null && selectionEnd !== null && selectionEnd > selectionStart) {
                    e.preventDefault();
                    const selectedText = location.substring(selectionStart, selectionEnd);
                    const newLocation = location.substring(0, selectionStart) + `[${selectedText}](${pastedText.trim()})` + location.substring(selectionEnd);
                    setLocation(newLocation);
                  }
                }
              }}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white placeholder-zinc-400"
              placeholder={t('location_ph')}
            />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-1.5">
              {t('paste_link_hint')}
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !subjectId || teacherMissing}
              className="px-4 py-2 rounded-lg font-medium bg-indigo-500 hover:bg-indigo-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('saving') : initialData ? t('save_changes') : t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
