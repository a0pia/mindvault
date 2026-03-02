
import React, { createContext, useContext, useState, useEffect } from 'react';
import { localDb } from '../services/localDb';
import { toast } from 'react-hot-toast';

interface PomodoroSettings {
    focusTime: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
}

interface PomodoroContextType {
    timeLeft: number;
    isActive: boolean;
    mode: 'focus' | 'shortBreak' | 'longBreak';
    settings: PomodoroSettings;
    selectedSubject: string;
    completedToday: number;
    setSelectedSubject: (subj: string) => void;
    setMode: (mode: 'focus' | 'shortBreak' | 'longBreak') => void;
    setSettings: (settings: PomodoroSettings) => void;
    toggleTimer: () => void;
    resetTimer: () => void;
    getTotalTimeForMode: () => number;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettingsState] = useState<PomodoroSettings>(localDb.getPomodoroSettings());
    const [timeLeft, setTimeLeft] = useState(settings.focusTime * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [completedToday, setCompletedToday] = useState(0);

    useEffect(() => {
        const sessions = localDb.getStudySessions();
        const today = new Date().setHours(0, 0, 0, 0);
        const count = sessions.filter(s => s.type === 'pomodoro' && s.timestamp >= today).length;
        setCompletedToday(count);
    }, []);

    const setSettings = (newSettings: PomodoroSettings) => {
        setSettingsState(newSettings);
        localDb.updatePomodoroSettings(newSettings);
        if (!isActive) {
            setTimeLeft(newSettings.focusTime * 60);
        }
    };

    const getTotalTimeForMode = () => {
        if (mode === 'focus') return settings.focusTime * 60;
        if (mode === 'shortBreak') return settings.shortBreak * 60;
        return settings.longBreak * 60;
    };

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            if (mode === 'focus') {
                localDb.addStudySession({
                    duration: settings.focusTime,
                    subject: selectedSubject || 'Genel Odaklanma',
                    timestamp: Date.now(),
                    type: 'pomodoro'
                });
                setCompletedToday(prev => prev + 1);
                toast.success('Oturum tamamlandı!');

                const nextMode = (completedToday + 1) % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
                setMode(nextMode);
                setTimeLeft(nextMode === 'shortBreak' ? settings.shortBreak * 60 : settings.longBreak * 60);
            } else {
                toast.success('Mola bitti!');
                setMode('focus');
                setTimeLeft(settings.focusTime * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, selectedSubject, settings, completedToday]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(getTotalTimeForMode());
    };

    const handleSetMode = (m: 'focus' | 'shortBreak' | 'longBreak') => {
        setMode(m);
        setIsActive(false);
        if (m === 'focus') setTimeLeft(settings.focusTime * 60);
        else if (m === 'shortBreak') setTimeLeft(settings.shortBreak * 60);
        else setTimeLeft(settings.longBreak * 60);
    };

    return (
        <PomodoroContext.Provider value={{
            timeLeft, isActive, mode, settings,
            selectedSubject, completedToday, setSelectedSubject,
            setMode: handleSetMode, setSettings,
            toggleTimer, resetTimer, getTotalTimeForMode
        }}>
            {children}
        </PomodoroContext.Provider>
    );
}

export const usePomodoro = () => {
    const context = useContext(PomodoroContext);
    if (!context) throw new Error('usePomodoro must be used within PomodoroProvider');
    return context;
};
