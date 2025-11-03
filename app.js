// app.js
// Minimal Express app showing command injection and reflected XSS.
// WARNING: intentionally insecure — run only in an isolated environment.

const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <h2>Vulnerable Node.js App</h2>
    <ul>
      <li><a href="/ping">Command Injection (ping)</a></li>
      <li><a href="/echo">Reflected XSS (echo)</a></li>
    </ul>
  `);
});

app.get('/echo', (req, res) => {
  const msg = req.query.msg || '';
  // Reflected XSS: not escaping user input
  res.send(`<h3>Echo</h3>
    <form>
      <input name="msg" value="${msg}">
      <button>Send</button>
    </form>
    <p>Message: ${msg}</p>
  `);
});

app.get('/ping', (req, res) => {
  const host = req.query.host || '127.0.0.1';
  // INTENTIONALLY INSECURE: directly embedding user input into shell command
  // This is command injection vulnerability. Use only in isolated env.
  exec(`ping -c 1 ${host}`, (error, stdout, stderr) => {
    if (error) {
      res.send(`<pre>Command error: ${error.message}</pre>`);
      return;
    }
    res.send(`<h3>Ping result for ${host}</h3><pre>${stdout}</pre>`);
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Vulnerable Node app listening on http://127.0.0.1:${PORT}`));
