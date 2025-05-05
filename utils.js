const fs = require("fs");

/**
 * Sorts the entries of an object by their values in descending order and returns the top N entries.
 * If there are ties, it includes all entries with the same value as the N-th entry.
 * @param {Object} data
 * @param {Number} [topN=3] - The number of top entries to return.
 * @returns {Array} - An array of objects containing the key and count of the top entries.
 */
function getTopEntries(data, topN = 3) {
	const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);

	let topEntries = [];
	if (sortedEntries.length > 0) {
		let lastCount = 0;

		for (let i = 0; i < sortedEntries.length; i++) {
			const [key, count] = sortedEntries[i];

			if (i < topN) {
				console.log("\n i<topN");
				topEntries.push({ key, count });
				lastCount = count;
			} else if (count === lastCount) {
				topEntries.push({ key, count });
			} else {
				break;
			}
		}
	}

	return topEntries;
}

/**
 * Reads a log file and parses it to extract unique IPs and URLs.
 * @param {string} filePath - The path to the log file.
 * @returns {Object} - An object containing the number of unique IPs and the top URLs and IPs.
 */
function parseLogFile(filePath) {
	if (!fs.existsSync(filePath)) {
		throw new Error(`File not found: ${filePath}`);
	}

	try {
		const logData = fs.readFileSync(filePath, "utf-8");

		const parsedData = logData.split("\n");

		const ips = {};
		const urls = {};

		const regex =
			// /^(\S+) - (\S+) \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d{3}) (\d+) "([^"]*)" "([^"]*)".*$/;
			/^(\S+) - (\S+) \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d{3}) (\d+) "([^"]*)" "([^"]*)"/;

		for (const line of parsedData) {
			// skip empty lines
			if (!line.trim()) continue;

			const match = line.trim().match(regex);

			if (match) {
				const ip = match[1];
				const url = match[5];

				if (!ips[ip]) {
					ips[ip] = 0;
				}
				ips[ip]++;

				if (!urls[url]) {
					urls[url] = 0;
				}
				urls[url]++;
			} else {
				console.warn("Line did not match regex:", line);
				continue;
			}
		}

		return {
			ips: Object.entries(ips).length,
			topUrls: getTopEntries(urls),
			topIps: getTopEntries(ips),
		};
	} catch (error) {
		throw new Error(`Error reading file: ${error}`);
	}
}

module.exports = {
	getTopEntries,
	parseLogFile,
};
