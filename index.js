const fs = require("fs");

function parseLogFile(filePath) {
	if (!fs.existsSync(filePath)) {
		console.error("File not found:", filePath);
		return;
	}

	try {
		const logData = fs.readFileSync(filePath, "utf-8");
		console.log(logData);
	} catch (error) {
		console.error("Error reading file:", error.message);
		return;
	}
}

console.log(parseLogFile("./programming-task-example-data.log"));
