const bcrypt = require('bcrypt');

const hash = '$2b$10$mFKcXurK05BpSMtHw6M1e.P0tFuBaB3R4VHK5fldJ7y6cLQQWSI7a'; // hash trong DB
const password = '123456';

bcrypt.compare(password, hash).then(result => {
    console.log('Match:', result);
});