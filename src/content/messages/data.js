/**
 * Mock Data for BBS Echo Areas
 */

export const ECHO_AREAS = [
    {
        id: 'netmail',
        name: 'NETMAIL',
        description: 'Private Netmail',
        msgs: 0,
        unread: 0,
    },
    {
        id: 'su_general',
        name: 'SU.GENERAL',
        description: 'General discussion',
        msgs: 15,
        unread: 3,
    },
    {
        id: 'su_flame',
        name: 'SU.FLAME',
        description: 'Flame & quarrels',
        msgs: 42,
        unread: 5,
    },
];

export const MESSAGES = {
    'su_flame': [
        {
            id: 'msg_001',
            from: 'SysOp',
            to: 'All',
            subj: 'Rules (READ ME!)',
            date: '07 Feb 1995',
            body: `Welcome to SU.FLAME!

RULES:
1. No personal attacks (yeah right).
2. No lamers allowed.
3. Don't be boring.

If you are new, introduce yourself properly or get out.
`,
            read: false,
        },
        {
            id: 'msg_002',
            from: 'Troll.Master',
            to: 'All',
            subj: 'You all suck',
            date: '07 Feb 1995',
            body: `Especially the SysOp.
This BBS is slow and the file area is empty.
Doom 2 is old news. Quake is coming!
`,
            read: false,
        },
    ],
    'su_general': [
        {
            id: 'msg_101',
            from: 'User1',
            to: 'All',
            subj: 'Hello',
            date: '06 Feb 1995',
            body: 'Is anyone here?',
            read: false,
        }
    ]
};
