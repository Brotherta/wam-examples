const express = require('express');

const PORT = 4998;

const app = express();
app.use(express.static('public'));

app.listen(PORT, () => {`Server is started and listening on port ${PORT}.`});