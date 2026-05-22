// generateToken.js
// Run: node generateToken.js
// This script generates a JWT token for testing API authentication

const jwt = require('jsonwebtoken');

// Payload = thông tin user giả lập
const payload = {
    id: 1,
    role: 'admin',
    campus_id: 1,
    permissions: [
        'test_permission',
        'create_repair',
        'receive_repair',
        'start_repair',
        'complete_repair'
    ]
};

// Secret phải giống trong .env
const SECRET = 'SECRET_KEY';

// Tạo token
const token = jwt.sign(payload, SECRET, {
    expiresIn: '1d'
});

console.log('===== TOKEN =====');
console.log(token);