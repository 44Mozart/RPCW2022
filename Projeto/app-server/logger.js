const { createLogger, format, transports, config } = require('winston');
const { combine, timestamp, json } = format;

const userLogger = createLogger({
    levels: config.syslog.levels,
    defaultMeta: { component: 'Interação User' },
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        json()
      ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'UserInteraction.log' })
      ]
 });



module.exports = {
 userLogger: userLogger
};