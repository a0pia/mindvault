
import { useState, useEffect } from 'react';
import { localDb } from '../services/localDb';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, differenceInDays, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';

export function useStudyStats() {
    const [stats, setStats] = useState<any>({
        todayMinutes: 0,
        weeklyMinutes: 0,
        totalPomodorosToday: 0,
        chartData: [],
        subjectData: [],
        questionStats: { total: 0, correct: 0, wrong: 0, accuracy: 0 },
        todayQuestions: { total: 0, correct: 0, wrong: 0 },
        yesterdayStats: { minutes: 0, totalQuestions: 0 },
        practiceExams: [],
        nextExam: null
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const sessions = localDb.getStudySessions();
        const now = new Date();
        const todayStart = startOfDay(now).getTime();

        // Today Stats
        const todaySessions = sessions.filter((s: any) => s.timestamp >= todayStart);
        const todayMinutes = todaySessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);

        const todayTotalQ = todaySessions.reduce((acc: number, s: any) => acc + (s.totalQuestions || 0), 0);
        const todayCorrectQ = todaySessions.reduce((acc: number, s: any) => acc + (s.correctCount || 0), 0);
        const todayWrongQ = todaySessions.reduce((acc: number, s: any) => acc + (s.wrongCount || 0), 0);

        // Yesterday Stats
        const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
        const yesterdaySessions = sessions.filter((s: any) => s.timestamp >= yesterdayStart && s.timestamp < todayStart);
        const yesterdayMinutes = yesterdaySessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
        const yesterdayQ = yesterdaySessions.reduce((acc: number, s: any) => acc + (s.totalQuestions || 0), 0);

        // Weekly Stats
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
        const weeklySessions = sessions.filter((s: any) => s.timestamp >= weekStart.getTime() && s.timestamp <= weekEnd.getTime());
        const weeklyMinutes = weeklySessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);

        // Chart Data (7 days)
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
        const chartData = days.map(day => {
            const daySessions = sessions.filter((s: any) => isSameDay(new Date(s.timestamp), day));
            return {
                name: format(day, 'EEE', { locale: tr }),
                minutes: daySessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0)
            };
        });

        // Subject Distribution
        const subjects = localDb.getSubjects();
        const subjectData = subjects.map((subj: any) => {
            const subjSessions = sessions.filter((s: any) => s.subject === subj.name);
            return {
                name: subj.name,
                minutes: subjSessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0)
            };
        }).filter((s: any) => s.minutes > 0).sort((a: any, b: any) => b.minutes - a.minutes);

        // Question Stats
        const totalQ = sessions.reduce((acc: number, s: any) => acc + (s.totalQuestions || 0), 0);
        const correctQ = sessions.reduce((acc: number, s: any) => acc + (s.correctCount || 0), 0);
        const wrongQ = sessions.reduce((acc: number, s: any) => acc + (s.wrongCount || 0), 0);

        // Next Exam
        const exams = localDb.getExams();
        const futureExams = exams
            .filter((e: any) => e.date >= todayStart)
            .sort((a: any, b: any) => a.date - b.date);

        // Practice Exams 
        const practiceExams = sessions.filter((s: any) => s.type === 'exam').sort((a: any, b: any) => b.timestamp - a.timestamp);

        const nextExam = futureExams[0] ? {
            ...futureExams[0],
            daysLeft: differenceInDays(startOfDay(new Date(futureExams[0].date)), todayStart)
        } : null;

        setStats({
            todayMinutes,
            weeklyMinutes,
            totalPomodorosToday: todaySessions.filter((s: any) => s.type === 'pomodoro').length,
            chartData,
            subjectData,
            questionStats: {
                total: totalQ,
                correct: correctQ,
                wrong: wrongQ,
                accuracy: totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0
            },
            todayQuestions: { total: todayTotalQ, correct: todayCorrectQ, wrong: todayWrongQ },
            yesterdayStats: { minutes: yesterdayMinutes, totalQuestions: yesterdayQ },
            practiceExams,
            nextExam
        });
        setIsLoading(false);
    }, []);

    return { stats, isLoading };
}
