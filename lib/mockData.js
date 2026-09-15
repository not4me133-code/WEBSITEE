// Mock data for AP Test Prep Platform
// Strictly-typed shapes so real question banks can be dropped in later.

export const SUBJECTS = [
  {
    id: 'ap-psych',
    name: 'AP Psychology',
    short: 'Psych',
    color: 'from-indigo-500 to-violet-600',
    accent: 'bg-indigo-500',
    ring: 'text-indigo-500',
    units: 9,
    totalQuestions: 420,
    progress: 62,
    readiness: 74,
    lastScore: 82,
  },
  {
    id: 'ap-csp',
    name: 'AP Computer Science Principles',
    short: 'CSP',
    color: 'from-sky-500 to-blue-600',
    accent: 'bg-sky-500',
    ring: 'text-sky-500',
    units: 10,
    totalQuestions: 380,
    progress: 41,
    readiness: 58,
    lastScore: 71,
  },
  {
    id: 'ap-physics',
    name: 'AP Physics',
    short: 'Physics',
    color: 'from-emerald-500 to-teal-600',
    accent: 'bg-emerald-500',
    ring: 'text-emerald-500',
    units: 8,
    totalQuestions: 340,
    progress: 28,
    readiness: 46,
    lastScore: 63,
  },
  {
    id: 'honors-precalc',
    name: 'Honors Precalculus',
    short: 'Precalc',
    color: 'from-rose-500 to-pink-600',
    accent: 'bg-rose-500',
    ring: 'text-rose-500',
    units: 7,
    totalQuestions: 290,
    progress: 55,
    readiness: 68,
    lastScore: 79,
  },
];

export const MOCK_USER = {
  id: 'u_001',
  name: 'Alex Chen',
  email: 'alex@student.io',
  subscription: 'free', // 'free' | 'pro'
  streakDays: 12,
  globalReadiness: 64,
  activeSubjects: ['ap-psych', 'ap-csp'],
  createdAt: '2025-05-14',
};

export const MOCK_SESSIONS = [
  {
    id: 's_101',
    subjectId: 'ap-psych',
    type: 'drill', // 'drill' | 'full_test'
    title: 'Unit 3 · Sensation & Perception',
    score: 82,
    total: 15,
    correct: 12,
    durationMin: 14,
    completedAt: '2025-06-08T18:24:00Z',
  },
  {
    id: 's_102',
    subjectId: 'ap-csp',
    type: 'drill',
    title: 'Big Idea 4 · Computer Systems',
    score: 71,
    total: 20,
    correct: 14,
    durationMin: 22,
    completedAt: '2025-06-07T15:10:00Z',
  },
  {
    id: 's_103',
    subjectId: 'honors-precalc',
    type: 'drill',
    title: 'Unit 2 · Polynomial Functions',
    score: 79,
    total: 12,
    correct: 9,
    durationMin: 11,
    completedAt: '2025-06-06T20:45:00Z',
  },
  {
    id: 's_104',
    subjectId: 'ap-physics',
    type: 'drill',
    title: 'Unit 1 · Kinematics',
    score: 63,
    total: 18,
    correct: 11,
    durationMin: 19,
    completedAt: '2025-06-05T14:00:00Z',
  },
];

// Question shape:
// { id, subjectId, unit, difficulty, question_text, options: [{id,label}], correct_answer, explanation }

export const SAMPLE_QUESTIONS = {
  'ap-psych': [
    {
      id: 'q_p1',
      subjectId: 'ap-psych',
      unit: 'Sensation & Perception',
      difficulty: 'medium',
      question_text: 'Which structure of the eye contains photoreceptors responsible for color vision in bright light?',
      options: [
        { id: 'A', label: 'Rods in the peripheral retina' },
        { id: 'B', label: 'Cones concentrated in the fovea' },
        { id: 'C', label: 'Bipolar cells of the optic nerve' },
        { id: 'D', label: 'Ganglion cells near the blind spot' },
      ],
      correct_answer: 'B',
      explanation:
        'Cones are photoreceptors concentrated in the fovea and are responsible for color vision and fine detail under well-lit conditions. Rods handle low-light (scotopic) vision but do not detect color.',
    },
    {
      id: 'q_p2',
      subjectId: 'ap-psych',
      unit: 'Learning',
      difficulty: 'easy',
      question_text: 'In Pavlov\u2019s classical conditioning experiments, the bell initially served as which of the following?',
      options: [
        { id: 'A', label: 'Unconditioned stimulus' },
        { id: 'B', label: 'Unconditioned response' },
        { id: 'C', label: 'Neutral stimulus' },
        { id: 'D', label: 'Conditioned response' },
      ],
      correct_answer: 'C',
      explanation:
        'Before conditioning, the bell produced no salivation and was therefore a neutral stimulus. After repeated pairing with food (UCS), it became a conditioned stimulus (CS) that elicited salivation (CR).',
    },
    {
      id: 'q_p3',
      subjectId: 'ap-psych',
      unit: 'Memory',
      difficulty: 'medium',
      question_text: 'The serial position effect suggests that people are most likely to recall which items from a list?',
      options: [
        { id: 'A', label: 'Only items from the middle' },
        { id: 'B', label: 'The first and last items' },
        { id: 'C', label: 'Only the last items' },
        { id: 'D', label: 'Items presented in bold' },
      ],
      correct_answer: 'B',
      explanation:
        'The serial position effect combines the primacy effect (better recall of early items due to rehearsal into long-term memory) and the recency effect (better recall of the most recent items still in short-term memory).',
    },
    {
      id: 'q_p4',
      subjectId: 'ap-psych',
      unit: 'Social Psychology',
      difficulty: 'hard',
      question_text: 'Which phenomenon best explains why a person might exert less effort on a group project than when working alone?',
      options: [
        { id: 'A', label: 'Social facilitation' },
        { id: 'B', label: 'Groupthink' },
        { id: 'C', label: 'Social loafing' },
        { id: 'D', label: 'Deindividuation' },
      ],
      correct_answer: 'C',
      explanation:
        'Social loafing describes the tendency for individuals to expend less effort when working collectively than when working individually, because personal accountability is diffused across the group.',
    },
    {
      id: 'q_p5',
      subjectId: 'ap-psych',
      unit: 'Biological Bases',
      difficulty: 'medium',
      question_text: 'Which neurotransmitter is most closely associated with the reward pathway and is implicated in addiction?',
      options: [
        { id: 'A', label: 'Serotonin' },
        { id: 'B', label: 'GABA' },
        { id: 'C', label: 'Acetylcholine' },
        { id: 'D', label: 'Dopamine' },
      ],
      correct_answer: 'D',
      explanation:
        'Dopamine is a key neurotransmitter in the mesolimbic reward pathway. Drugs of abuse typically increase dopamine release in the nucleus accumbens, reinforcing the addictive behavior.',
    },
  ],
  'ap-csp': [
    {
      id: 'q_c1',
      subjectId: 'ap-csp',
      unit: 'Data',
      difficulty: 'easy',
      question_text: 'How many distinct values can be represented using 4 bits?',
      options: [
        { id: 'A', label: '4' },
        { id: 'B', label: '8' },
        { id: 'C', label: '16' },
        { id: 'D', label: '32' },
      ],
      correct_answer: 'C',
      explanation: 'With n bits you can represent 2^n distinct values. 2^4 = 16.',
    },
    {
      id: 'q_c2',
      subjectId: 'ap-csp',
      unit: 'Algorithms',
      difficulty: 'medium',
      question_text: 'Which of the following best describes a binary search algorithm?',
      options: [
        { id: 'A', label: 'Checks every element sequentially' },
        { id: 'B', label: 'Repeatedly halves a sorted list to locate a value' },
        { id: 'C', label: 'Sorts a list by comparing adjacent items' },
        { id: 'D', label: 'Only works on unsorted data' },
      ],
      correct_answer: 'B',
      explanation:
        'Binary search requires a sorted list. It compares the target to the middle element and recursively (or iteratively) discards the half that cannot contain the target, achieving O(log n) time.',
    },
    {
      id: 'q_c3',
      subjectId: 'ap-csp',
      unit: 'The Internet',
      difficulty: 'medium',
      question_text: 'Which protocol is primarily responsible for reliably delivering ordered packets between two hosts?',
      options: [
        { id: 'A', label: 'UDP' },
        { id: 'B', label: 'IP' },
        { id: 'C', label: 'TCP' },
        { id: 'D', label: 'HTTP' },
      ],
      correct_answer: 'C',
      explanation:
        'TCP (Transmission Control Protocol) provides reliable, ordered, and error-checked delivery of a stream of bytes between hosts. UDP is connectionless and does not guarantee ordering or delivery.',
    },
    {
      id: 'q_c4',
      subjectId: 'ap-csp',
      unit: 'Impact of Computing',
      difficulty: 'easy',
      question_text: 'Which of the following is the BEST example of a digital divide issue?',
      options: [
        { id: 'A', label: 'A student cannot complete online homework because their household lacks broadband access.' },
        { id: 'B', label: 'A website loads slowly on an old browser.' },
        { id: 'C', label: 'A user forgets their password.' },
        { id: 'D', label: 'A phone battery drains quickly.' },
      ],
      correct_answer: 'A',
      explanation:
        'The digital divide refers to unequal access to computing resources (including reliable internet) across different populations, which directly affects opportunities like completing online schoolwork.',
    },
  ],
  'ap-physics': [
    {
      id: 'q_ph1',
      subjectId: 'ap-physics',
      unit: 'Kinematics',
      difficulty: 'medium',
      question_text: 'A ball is dropped from rest. Ignoring air resistance, what is its approximate velocity after 3 seconds? (g = 9.8 m/s\u00b2)',
      options: [
        { id: 'A', label: '9.8 m/s' },
        { id: 'B', label: '19.6 m/s' },
        { id: 'C', label: '29.4 m/s' },
        { id: 'D', label: '44.1 m/s' },
      ],
      correct_answer: 'C',
      explanation: 'Using v = gt: v = (9.8 m/s\u00b2)(3 s) = 29.4 m/s downward.',
    },
    {
      id: 'q_ph2',
      subjectId: 'ap-physics',
      unit: 'Newton\u2019s Laws',
      difficulty: 'medium',
      question_text: 'A net force of 20 N is applied to a 4 kg object. What is its acceleration?',
      options: [
        { id: 'A', label: '2 m/s\u00b2' },
        { id: 'B', label: '4 m/s\u00b2' },
        { id: 'C', label: '5 m/s\u00b2' },
        { id: 'D', label: '80 m/s\u00b2' },
      ],
      correct_answer: 'C',
      explanation: 'By Newton\u2019s second law, a = F/m = 20 N / 4 kg = 5 m/s\u00b2.',
    },
    {
      id: 'q_ph3',
      subjectId: 'ap-physics',
      unit: 'Energy',
      difficulty: 'hard',
      question_text: 'A 2 kg object moves at 3 m/s. What is its kinetic energy?',
      options: [
        { id: 'A', label: '3 J' },
        { id: 'B', label: '6 J' },
        { id: 'C', label: '9 J' },
        { id: 'D', label: '18 J' },
      ],
      correct_answer: 'C',
      explanation: 'KE = \u00bd m v\u00b2 = 0.5 \u00d7 2 \u00d7 3\u00b2 = 0.5 \u00d7 2 \u00d7 9 = 9 J.',
    },
  ],
  'honors-precalc': [
    {
      id: 'q_pc1',
      subjectId: 'honors-precalc',
      unit: 'Trigonometry',
      difficulty: 'medium',
      question_text: 'What is the exact value of sin(\u03c0/6)?',
      options: [
        { id: 'A', label: '1/2' },
        { id: 'B', label: '\u221a2/2' },
        { id: 'C', label: '\u221a3/2' },
        { id: 'D', label: '1' },
      ],
      correct_answer: 'A',
      explanation: 'sin(\u03c0/6) = sin(30\u00b0) = 1/2, a standard unit-circle value.',
    },
    {
      id: 'q_pc2',
      subjectId: 'honors-precalc',
      unit: 'Functions',
      difficulty: 'medium',
      question_text: 'Which transformation is applied when going from f(x) = x\u00b2 to g(x) = (x - 3)\u00b2 + 2?',
      options: [
        { id: 'A', label: 'Left 3, down 2' },
        { id: 'B', label: 'Right 3, up 2' },
        { id: 'C', label: 'Left 3, up 2' },
        { id: 'D', label: 'Right 3, down 2' },
      ],
      correct_answer: 'B',
      explanation:
        'Replacing x with (x - 3) shifts the graph right by 3 units. Adding 2 shifts it up by 2 units.',
    },
    {
      id: 'q_pc3',
      subjectId: 'honors-precalc',
      unit: 'Logarithms',
      difficulty: 'hard',
      question_text: 'Solve for x: log\u2082(x) = 5.',
      options: [
        { id: 'A', label: '10' },
        { id: 'B', label: '25' },
        { id: 'C', label: '32' },
        { id: 'D', label: '64' },
      ],
      correct_answer: 'C',
      explanation: 'log\u2082(x) = 5 means x = 2\u2075 = 32.',
    },
  ],
};

// Full-length mock test uses a longer sequence drawn from question pools.
export const buildFullTest = (subjectId) => {
  const pool = SAMPLE_QUESTIONS[subjectId] || [];
  // Repeat the pool to simulate a longer test (25 items).
  const items = [];
  for (let i = 0; i < 25; i++) {
    const q = pool[i % Math.max(pool.length, 1)];
    if (q) items.push({ ...q, id: `${q.id}_full_${i}` });
  }
  return items;
};
