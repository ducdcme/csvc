// Load environment variables
require('dotenv').config();
require('./cron');
const express = require('express');
const path = require('path')
const sessionMiddleware = require('./config/session');
const routes = require('./routes');
const app = express();
const expressLayouts = require('express-ejs-layouts');

app.use(expressLayouts);
// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//public
app.use(express.static('public'));
// Session
app.use(sessionMiddleware);
// ===== VIEW ENGINE =====
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
//Router
app.use(routes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


