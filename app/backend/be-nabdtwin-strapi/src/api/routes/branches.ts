export default {
    routes: [
        {
            method: 'GET',
            path: '/branches',
            handler: 'branches.getAllBranches',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
