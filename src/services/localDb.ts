
const DB_PREFIX = 'mindvault_';

export const localDb = {
    // Generic methods
    save(key: string, data: any) {
        localStorage.setItem(DB_PREFIX + key, JSON.stringify(data));
    },

    get<T>(key: string): T | null {
        const data = localStorage.getItem(DB_PREFIX + key);
        return data ? JSON.parse(data) : null;
    },

    // User Profile
    getUserProfile() {
        return this.get<any>('profile') || {
            displayName: 'Kullanıcı',
            photoURL: '',
            dailyGoalHours: 4,
            currentStreak: 0,
            longestStreak: 0,
            theme: 'ocean',
            createdAt: Date.now(),
            totalStudyMinutes: 0
        };
    },

    updateUserProfile(data: any) {
        const current = this.getUserProfile();
        this.save('profile', { ...current, ...data });
    },

    // Study Sessions
    getStudySessions() {
        return this.get<any[]>('sessions') || [];
    },

    addStudySession(session: any) {
        const sessions = this.getStudySessions();
        sessions.push({ ...session, id: Date.now().toString() });
        this.save('sessions', sessions);

        // Update total minutes in profile
        const profile = this.getUserProfile();
        profile.totalStudyMinutes += session.duration;
        this.updateUserProfile(profile);
    },

    // Notes
    getNotes() {
        return this.get<any[]>('notes') || [];
    },

    addNote(note: any) {
        const notes = this.getNotes();
        notes.push({ ...note, id: Date.now().toString(), createdAt: Date.now() });
        this.save('notes', notes);
    },

    // Goals
    getGoals() {
        return this.get<any[]>('goals') || [];
    },

    updateGoal(goal: any) {
        const goals = this.getGoals();
        const index = goals.findIndex((g: any) => g.id === goal.id);
        if (index !== -1) {
            goals[index] = goal;
        } else {
            goals.push({ ...goal, id: Date.now().toString() });
        }
        this.save('goals', goals);
    },

    // Schedule
    getSchedule() {
        return this.get<any[]>('schedule') || [];
    },

    addScheduleItem(item: any) {
        const schedule = this.getSchedule();
        schedule.push({ ...item, id: Date.now().toString(), completed: false });
        this.save('schedule', schedule);
    },

    updateScheduleItem(id: string, completed: boolean) {
        const schedule = this.getSchedule();
        const index = schedule.findIndex((s: any) => s.id === id);
        if (index !== -1) {
            schedule[index].completed = completed;
            this.save('schedule', schedule);
        }
    },

    deleteScheduleItem(id: string) {
        const schedule = this.getSchedule();
        this.save('schedule', schedule.filter((s: any) => s.id !== id));
    },

    // Subjects Tags (Categories/Courses)
    getSubjectTags() {
        return this.get<any[]>('subject_tags') || [];
    },

    addSubjectTag(name: string) {
        const tags = this.getSubjectTags();
        if (!tags.find(t => t.name === name)) {
            tags.push({ id: Date.now().toString(), name, createdAt: Date.now() });
            this.save('subject_tags', tags);
        }
    },

    deleteSubjectTag(name: string) {
        // Delete tag
        const tags = this.getSubjectTags();
        this.save('subject_tags', tags.filter(t => t.name !== name));

        // Delete all subjects in this category
        const subjects = this.getSubjects();
        this.save('subjects', subjects.filter(s => s.category !== name));
    },

    // Subjects
    getSubjects() {
        return this.get<any[]>('subjects') || [];
    },

    addSubject(subject: any) {
        const subjects = this.getSubjects();
        subjects.push({ ...subject, id: Date.now().toString(), createdAt: Date.now(), solvedQuestions: 0, hasSolved: false, isCompleted: false });
        this.save('subjects', subjects);
    },

    bulkAddSubjects(names: string[], category: string) {
        const subjects = this.getSubjects();
        const now = Date.now();
        names.forEach((name, i) => {
            subjects.push({
                id: (now + i).toString(),
                name,
                category,
                isCompleted: false,
                solvedQuestions: 0,
                hasSolved: false,
                createdAt: now + i
            });
        });
        this.save('subjects', subjects);
    },

    updateSubject(id: string, data: any) {
        const subjects = this.getSubjects();
        const index = subjects.findIndex((s: any) => s.id === id);
        if (index !== -1) {
            subjects[index] = { ...subjects[index], ...data };
            this.save('subjects', subjects);
        }
    },

    deleteSubject(id: string) {
        const subjects = this.getSubjects();
        this.save('subjects', subjects.filter((s: any) => s.id !== id));
    },

    // Exams
    getExams() {
        return this.get<any[]>('exams') || [];
    },

    addExam(exam: any) {
        const exams = this.getExams();
        exams.push({ ...exam, id: Date.now().toString(), createdAt: Date.now() });
        this.save('exams', exams);
    },

    deleteExam(id: string) {
        const exams = this.getExams();
        this.save('exams', exams.filter((e: any) => e.id !== id));
    },

    // Pomodoro Settings
    getPomodoroSettings() {
        return this.get<any>('pomo_settings') || {
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15,
            longBreakInterval: 4
        };
    },

    updatePomodoroSettings(settings: any) {
        this.save('pomo_settings', settings);
    }
};
