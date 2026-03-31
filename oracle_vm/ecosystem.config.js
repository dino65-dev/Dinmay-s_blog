module.exports = {
  apps: [{
    name: "blog-proxy",
    script: "./server.js",
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "200M",
    env: {
      NODE_ENV: "production",
    }
  }]
}
