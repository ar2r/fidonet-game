export const QUESTS = {
    GET_ONLINE: {
        id: 'get_online',
        title: 'First Contact',
        description: 'Connect to The Nexus BBS (555-3389) and register.',
        trigger: 'CONNECT_BBS'
    }
};

export const getQuestById = (id) => Object.values(QUESTS).find(q => q.id === id);
