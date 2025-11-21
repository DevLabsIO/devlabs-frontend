module.exports = {
    apps: [
        {
            name: "devlabs",
            script: "pnpm",
            args: "start",
            instances: 3,
            exec_mode: "cluster",
            watch: false,
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
