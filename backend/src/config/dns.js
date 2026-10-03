const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

console.log("Node DNS servers configured: 1.1.1.1, 8.8.8.8");