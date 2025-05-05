const fs = require("fs");
const { parseLogFile } = require("../utils");

jest.mock("fs");

describe("parseLogFile", () => {
	const mockLogContent = `
    168.41.191.41 - - [11/Jul/2018:17:41:30 +0200] "GET /this/page/does/not/exist/ HTTP/1.1" 404 3574 "-" "Mozilla/5.0 (Linux; U; Android 2.3.5; en-us; HTC Vision Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"
    72.44.32.10 - - [09/Jul/2018:15:48:07 +0200] "GET / HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0" junk extra
    168.41.191.9 - - [09/Jul/2018:22:56:45 +0200] "GET /docs/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; Linux i686; rv:6.0) Gecko/20100101 Firefox/6.0" 456 789
    168.41.191.43 - - [11/Jul/2018:17:43:40 +0200] "GET /moved-permanently HTTP/1.1" 301 3574 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) RockMelt/0.9.58.494 Chrome/11.0.696.71 Safari/534.24"
    168.41.191.43 - - [11/Jul/2018:17:44:40 +0200] "GET /temp-redirect HTTP/1.1" 307 3574 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) RockMelt/0.9.58.494 Chrome/11.0.696.71 Safari/534.24"
    168.41.191.9 - - [09/Jul/2018:22:56:45 +0200] "GET /docs/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; Linux i686; rv:6.0) Gecko/20100101 Firefox/6.0" 456 789
    72.44.32.10 - - [09/Jul/2018:15:48:07 +0200] "GET / HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0" junk extra`.trim();

	const mockLogInvalidContent = `
    168.41.191.41 - - [11/Jul/2018:17:41:30 +0200] "GET /this/page/does/not/exist/ HTTP/1.1" 404 3574 "-" "Mozilla/5.0 (Linux; U; Android 2.3.5; en-us; HTC Vision Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"
    72.44.32.10 - - [09/Jul/2018:15:48:07 +0200] "GET / HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0" junk extra
    168.41.191.9 - - [09/Jul/2018:22:56:45 +0200] "GET /docs/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; Linux i686; rv:6.0) Gecko/20100101 Firefox/6.0" 456 789
    168.41.191.43 - - [11/Jul/2018:17:43:40 +0200] "GET /moved-permanently HTTP/1.1" 301 3574 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) RockMelt/0.9.58.494 Chrome/11.0.696.71 Safari/534.24"
    168.41.191.43 - - [11/Jul/2018:17:44:40 +0200] "GET /temp-redirect HTTP/1.1" 307 3574 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) RockMelt/0.9.58.494 Chrome/11.0.696.71 Safari/534.24"
    invalid log line
    72.44.32.10 - - [09/Jul/2018:15:48:07 +0200] "GET / HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0" junk extra`.trim();

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("throws an error if file does not exist", () => {
		fs.existsSync.mockReturnValue(false);
		expect(() => parseLogFile("missing.log")).toThrow("File not found");
	});

	it("parses valid log file and returns correct counts", () => {
		fs.existsSync.mockReturnValue(true);
		fs.readFileSync.mockReturnValue(mockLogContent);

		const result = parseLogFile("fakepath.log");

		console.log(result);

		expect(result.ips).toEqual(4);
		expect(result.topIps).toEqual([
			{ key: "72.44.32.10", count: 2 },
			{ key: "168.41.191.9", count: 2 },
			{ key: "168.41.191.43", count: 2 },
		]);
		expect(result.topUrls).toEqual([
			{ key: "/", count: 2 },
			{ key: "/docs/", count: 2 },
			{ key: "/this/page/does/not/exist/", count: 1 },
			{ key: "/moved-permanently", count: 1 },
			{ key: "/temp-redirect", count: 1 },
		]);
	});

	it("skips lines that don't match regex", () => {
		fs.existsSync.mockReturnValue(true);
		fs.readFileSync.mockReturnValue(mockLogInvalidContent);

		const consoleWarnSpy = jest
			.spyOn(console, "warn")
			.mockImplementation(() => {});
		parseLogFile("test.log");

		expect(consoleWarnSpy).toHaveBeenCalledWith(
			expect.stringContaining("Line did not match regex:"),
			expect.stringContaining("invalid log line")
		);
	});
});
