import pino from "pino";

const logger =
	process.env.NODE_ENV === "production"
		? pino({ level: "info" })
		: pino({
				transport: {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "HH:MM:ss",
						singleLine: true,
						ignore: "pid,hostname",
					},
				},
				level: "debug",
				serializers: {
					err: (err: Error) => ({
						message: err.message,
					}),
				},
			});

export default logger;
