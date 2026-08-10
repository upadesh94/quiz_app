export const APP_NAME = 'QuizMaster';

export const CLASS_SUBJECT_MAP = {
	8: ['Marathi', 'English', 'Social Science', 'Environment Studies', 'Hindi', 'Science', 'Mathematics'],
	9: [
		'Marathi',
		'English',
		'History & Political Science',
		'Geography',
		'Hindi',
		'Science 1',
		'Science 2',
		'Mathematics 1',
		'Mathematics 2',
	],
	10: [
		'Marathi',
		'English',
		'History & Political Science',
		'Geography',
		'Hindi',
		'Science 1',
		'Science 2',
		'Mathematics 1',
		'Mathematics 2',
	],
} as const;

export const CLASS_LEVELS = [8, 9, 10] as const;

export const SUBJECTS = Array.from(new Set(Object.values(CLASS_SUBJECT_MAP).flat()));

export function getSubjectsForClass(classLevel: 8 | 9 | 10) {
	return CLASS_SUBJECT_MAP[classLevel];
}
