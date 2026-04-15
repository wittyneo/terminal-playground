export type Category = 'NAVIGATION' | 'FILES' | 'CLAUDE CODE'

export interface Flag {
  flag: string
  description: string
}

export interface Lesson {
  id: number
  category: Category
  commandLabel: string         // e.g. "pwd" shown in the command card title
  useCase: string              // one-liner for the cheatsheet
  description: string
  flags?: Flag[]
  proTip: string
  prompt: string               // The shell prompt path shown before $
  acceptedInputs: string[]     // What the user must type (lowercased, trimmed)
  simulatedOutput: string[]    // Lines of output to render
  isDanger?: boolean           // Triggers danger warning
  successMessage?: string      // Shown after correct input
}

export const lessons: Lesson[] = [
  // ─── NAVIGATION ───────────────────────────────────────────
  {
    id: 1,
    category: 'NAVIGATION',
    commandLabel: 'pwd',
    useCase: 'Find your current location in the filesystem',
    description: 'Shows your current location in the filesystem. Think of it as asking "Where am I?" — your GPS in the terminal.',
    proTip: 'Run pwd whenever you feel lost. It always tells you the full path from root to your current folder.',
    prompt: '~/Projects/design-system',
    acceptedInputs: ['pwd'],
    simulatedOutput: ['/Users/designer/Projects/design-system'],
    successMessage: 'Your location is confirmed.',
  },
  {
    id: 2,
    category: 'NAVIGATION',
    commandLabel: 'ls -la',
    useCase: 'List all files including hidden ones',
    description: 'Lists every file and folder in your current location — including hidden ones (files starting with a dot).',
    flags: [
      { flag: '-l', description: 'long format — shows permissions, size, date' },
      { flag: '-a', description: 'all files — includes hidden dot files' },
    ],
    proTip: 'Add -h for human-readable file sizes: ls -lah shows KB, MB, GB instead of raw bytes.',
    prompt: '~/Projects/design-system',
    acceptedInputs: ['ls -la', 'ls -al', 'ls -l -a', 'ls -a -l'],
    simulatedOutput: [
      'total 32',
      'drwxr-xr-x   6  designer  staff   192  Mar 31 09:12  .',
      'drwxr-xr-x   8  designer  staff   256  Mar 31 09:10  ..',
      'drwxr-xr-x  14  designer  staff   448  Mar 31 09:12  components',
      'drwxr-xr-x   4  designer  staff   128  Mar 30 14:22  assets',
      '-rw-r--r--   1  designer  staff   2.1k Mar 29 11:05  README.md',
      '-rw-r--r--   1  designer  staff   847  Mar 31 08:47  package.json',
    ],
    successMessage: 'Files revealed.',
  },
  {
    id: 3,
    category: 'NAVIGATION',
    commandLabel: 'cd folder',
    useCase: 'Navigate into a folder',
    description: 'Moves you into a folder. Like double-clicking in Finder — but with text. Replace "folder" with any folder name you see.',
    proTip: 'Press Tab after typing the first few letters to autocomplete folder names. A must-know shortcut.',
    prompt: '~/Projects/design-system',
    acceptedInputs: ['cd components', 'cd components/'],
    simulatedOutput: [],
    successMessage: 'Moved into components/',
  },
  {
    id: 4,
    category: 'NAVIGATION',
    commandLabel: 'cd ..',
    useCase: 'Go back up one directory level',
    description: 'Moves you up one level to the parent folder. The ".." always means "one level up" — like hitting the back button.',
    proTip: 'Chain them to jump multiple levels: cd ../../ goes up two folders at once.',
    prompt: '~/Projects/design-system/components',
    acceptedInputs: ['cd ..', 'cd ../'],
    simulatedOutput: [],
    successMessage: 'Back to design-system.',
  },
  {
    id: 5,
    category: 'NAVIGATION',
    commandLabel: 'cd ~',
    useCase: 'Jump to your home directory instantly',
    description: 'Takes you home instantly, no matter how deep in folders you are. The ~ always means your home directory.',
    proTip: 'Your home is /Users/yourname on Mac. Desktop, Downloads, Documents are all inside it.',
    prompt: '~/Projects/design-system',
    acceptedInputs: ['cd ~', 'cd ~/'],
    simulatedOutput: [],
    successMessage: 'Home sweet home.',
  },

  // ─── FILES ────────────────────────────────────────────────
  {
    id: 6,
    category: 'FILES',
    commandLabel: 'mkdir folder',
    useCase: 'Create a new folder',
    description: 'Creates a new folder. mkdir stands for "make directory". Give it any name and the folder appears instantly.',
    proTip: 'Use mkdir -p to create nested folders in one go: mkdir -p projects/design/v2 creates all three levels at once.',
    prompt: '~',
    acceptedInputs: ['mkdir my-project', 'mkdir my-project/'],
    simulatedOutput: [],
    successMessage: 'Folder created.',
  },
  {
    id: 7,
    category: 'FILES',
    commandLabel: 'touch file.txt',
    useCase: 'Create a new empty file',
    description: 'Creates a new empty file instantly. Name it whatever you want — it starts completely blank and ready to fill.',
    proTip: 'Create multiple files at once: touch index.html style.css app.js — all three in one command.',
    prompt: '~/my-project',
    acceptedInputs: ['touch notes.txt', 'touch notes.txt '],
    simulatedOutput: [],
    successMessage: 'File created.',
  },
  {
    id: 8,
    category: 'FILES',
    commandLabel: 'cp src dest',
    useCase: 'Copy a file to a new location or name',
    description: 'Copies a file. The first argument is the source, the second is the destination name. The original stays untouched.',
    flags: [
      { flag: 'src', description: 'the file you want to copy' },
      { flag: 'dest', description: 'the new copy\'s name or location' },
    ],
    proTip: 'To copy an entire folder and everything inside it, add -r: cp -r components/ components-backup/',
    prompt: '~/my-project',
    acceptedInputs: ['cp notes.txt notes-backup.txt'],
    simulatedOutput: [],
    successMessage: 'File copied.',
  },
  {
    id: 9,
    category: 'FILES',
    commandLabel: 'mv old new',
    useCase: 'Rename or move a file',
    description: 'Renames or moves a file. mv stands for "move" — renaming is just moving to the same place with a new name.',
    flags: [
      { flag: 'old', description: 'current filename or path' },
      { flag: 'new', description: 'new filename or destination path' },
    ],
    proTip: 'Move files between folders too: mv notes.txt ~/Desktop/notes.txt drops it on your Desktop.',
    prompt: '~/my-project',
    acceptedInputs: ['mv notes.txt ideas.txt'],
    simulatedOutput: [],
    successMessage: 'File renamed.',
  },
  {
    id: 10,
    category: 'FILES',
    commandLabel: 'rm file',
    useCase: 'Permanently delete a file — no undo',
    description: 'Permanently deletes a file. No Trash. No undo. No "are you sure?". It is gone the moment you hit Enter.',
    proTip: 'Always run ls first to confirm the exact filename before deleting. One typo can delete the wrong file.',
    prompt: '~/my-project',
    acceptedInputs: ['rm notes-backup.txt'],
    simulatedOutput: [],
    isDanger: true,
    successMessage: 'Deleted. Forever.',
  },

  // ─── CLAUDE CODE ──────────────────────────────────────────
  {
    id: 11,
    category: 'CLAUDE CODE',
    commandLabel: 'claude',
    useCase: 'Start an interactive Claude Code session',
    description: 'Opens an interactive Claude Code session in your current directory. Claude can read your files and help you work on them.',
    proTip: 'Always run claude from inside your project folder so Claude has context about your specific files and structure.',
    prompt: '~/Projects/design-system',
    acceptedInputs: ['claude'],
    simulatedOutput: [
      '╭─────────────────────────────────────────╮',
      '│          Claude Code  v1.2.0            │',
      '╰─────────────────────────────────────────╯',
      '',
      ' ✓  Loaded project: design-system',
      ' ✓  Reading context...',
      '',
      ' Type your request or /help for commands.',
      '',
      '❯ _',
    ],
    successMessage: 'Claude Code is running.',
  },
  {
    id: 12,
    category: 'CLAUDE CODE',
    commandLabel: 'claude "task"',
    useCase: 'Send a one-shot task without opening a session',
    description: 'Sends a single task to Claude and gets a response without opening an interactive session. Perfect for quick, focused requests.',
    proTip: 'Be specific in quotes. "review my components folder" gets better results than just "help".',
    prompt: '~/Projects/design-system',
    acceptedInputs: ['claude "review my components folder"', "claude 'review my components folder'"],
    simulatedOutput: [
      'Analyzing components/...',
      '',
      'Found 14 components. A few observations:',
      '',
      '  • Button.tsx — missing disabled state variant',
      '  • Card.tsx — hardcoded pixel values, consider tokens',
      '  • Modal.tsx — no keyboard trap for accessibility',
      '',
      'Suggest starting with Button and Modal. Want me to',
      'show fixes for either?',
    ],
    successMessage: 'Task sent to Claude.',
  },
  {
    id: 13,
    category: 'CLAUDE CODE',
    commandLabel: 'claude -p "query"',
    useCase: 'Ask Claude a quick question, print answer and exit',
    description: 'Like the task command but -p means Claude prints the answer and exits immediately. Clean, fast, and great for quick lookups.',
    flags: [
      { flag: '-p', description: 'print mode — outputs answer then exits immediately' },
    ],
    proTip: 'Great for scripting. You can pipe the output: claude -p "list file names" | grep ".tsx"',
    prompt: '~/Projects/design-system',
    acceptedInputs: ['claude -p "what files are here?"', "claude -p 'what files are here?'"],
    simulatedOutput: [
      'components/  assets/  README.md  package.json',
    ],
    successMessage: 'Query answered.',
  },
  {
    id: 14,
    category: 'CLAUDE CODE',
    commandLabel: 'claude -c',
    useCase: 'Resume your last Claude Code conversation',
    description: 'Resumes your most recent Claude Code conversation. Claude remembers exactly where you left off — context included.',
    flags: [
      { flag: '-c', description: 'continue — resumes the last Claude Code session' },
    ],
    proTip: 'Use this if you close a session by accident or want to follow up on a task from earlier today.',
    prompt: '~/Projects/design-system',
    acceptedInputs: ['claude -c'],
    simulatedOutput: [
      '╭─────────────────────────────────────────╮',
      '│          Claude Code  v1.2.0            │',
      '╰─────────────────────────────────────────╯',
      '',
      ' ↩  Resuming previous session...',
      ' ✓  Restored 12 messages',
      '',
      'Welcome back. We were reviewing Button.tsx.',
      'Ready to continue?',
      '',
      '❯ _',
    ],
    successMessage: 'Session restored.',
  },
]

export const categories: Category[] = ['NAVIGATION', 'FILES', 'CLAUDE CODE']

export const categoryCount = (cat: Category) =>
  lessons.filter((l) => l.category === cat).length
