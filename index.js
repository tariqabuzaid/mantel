const { parseLogFile } = require("./utils");

try {
	const data = parseLogFile("./data/programming-task-example-data.log");

	console.log("Number of unique IPs:", data.ips);
	console.log("Top 3 most visited URLs:", data.topUrls);
	console.log("Top 3 most active IPs:", data.topIps);
} catch (error) {
	console.error(error.message);
}
