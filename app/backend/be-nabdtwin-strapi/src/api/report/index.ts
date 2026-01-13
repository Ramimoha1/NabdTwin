/**
 * report entity index
 * Configures the report entity with REST API endpoints
 */

export default {
    routes: [
        {
            method: 'GET',
            path: '/reports',
            handler: 'api::report.report.find',
            config: {
                auth: false,
            },
        },
        {
            method: 'GET',
            path: '/reports/:id',
            handler: 'api::report.report.findOne',
            config: {
                auth: false,
            },
        },
        {
            method: 'POST',
            path: '/reports',
            handler: 'api::report.report.create',
            config: {
                auth: false,
            },
        },
        {
            method: 'PUT',
            path: '/reports/:id',
            handler: 'api::report.report.update',
            config: {
                auth: false,
            },
        },
        {
            method: 'DELETE',
            path: '/reports/:id',
            handler: 'api::report.report.delete',
            config: {
                auth: false,
            },
        },
    ],
};
