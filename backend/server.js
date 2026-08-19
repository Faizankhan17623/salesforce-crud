require('dotenv').config({quiet:true});
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express();
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Store token in memory (simple approach)
let sfToken = null;
let sfInstance = null;

// PKCE code_verifier, stashed between /auth/login and /auth/callback (single-user demo app)
let pkceVerifier = null;

function base64url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Fields to show per object
const objectFields = {
  Account:     'Id, Name, Phone, Website, Industry, BillingCity',
  Opportunity: 'Id, Name, Amount, CloseDate, StageName',
  Lead:        'Id, Name, Company, Email, Phone, Status',
  Contact:     'Id, Name, Email, Phone, Title',
  Case:        'Id, Subject, Status, Priority, Description'
};

// The field searched against when a search term is provided
const searchField = {
  Account: 'Name',
  Opportunity: 'Name',
  Lead: 'Name',
  Contact: 'Name',
  Case: 'Subject',
};

function escapeSoql(value) {
  return value.replace(/[\\']/g, '\\$&');
}

// ── AUTH ROUTES ──────────────────────────────────────

// Step 1: Redirect user to Salesforce login
app.get('/auth/login', (req, res) => {
  pkceVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash('sha256').update(pkceVerifier).digest());

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SALESFORCE_CLIENT_ID,
    redirect_uri: process.env.SALESFORCE_CALLBACK_URL,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  res.redirect(`${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/authorize?${params}`);
});

app.get('/',async (req,res)=>{
    res.status(200).json({
        message:"The server is up and running",
        success:true
    })
})

// Step 2: Salesforce sends code here → exchange for token
app.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const response = await axios.post(
      `${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.SALESFORCE_CLIENT_ID,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET,
        redirect_uri: process.env.SALESFORCE_CALLBACK_URL,
        code_verifier: pkceVerifier,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    sfToken = response.data.access_token;
    sfInstance = response.data.instance_url;

    // Redirect frontend with token info
    res.redirect(
      `${FRONTEND_URL}?token=${sfToken}&instance=${sfInstance}`
    );
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

// ── CRUD ROUTES ──────────────────────────────────────

// GET — fetch records with pagination
app.get('/api/records/:object', async (req, res) => {
  try {
    const { object } = req.params;
    const { token, instance, offset = 0, search = '' } = req.query;
    const fields = objectFields[object];
    const whereClause = search.trim()
      ? `WHERE ${searchField[object]} LIKE '%${escapeSoql(search.trim())}%'`
      : '';
    const query = `SELECT ${fields} FROM ${object} ${whereClause} ORDER BY CreatedDate DESC LIMIT 20 OFFSET ${offset}`;

    const response = await axios.get(
      `${instance}/services/data/v58.0/query?q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(response.data.records);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// POST — create a record
app.post('/api/records/:object', async (req, res) => {
  try {
    const { object } = req.params;
    const { token, instance, ...data } = req.body;
    const response = await axios.post(
      `${instance}/services/data/v58.0/sobjects/${object}`,
      data,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// PATCH — update a record
app.patch('/api/records/:object/:id', async (req, res) => {
  try {
    const { object, id } = req.params;
    const { token, instance, ...data } = req.body;
    await axios.patch(
      `${instance}/services/data/v58.0/sobjects/${object}/${id}`,
      data,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// DELETE — delete a record
app.delete('/api/records/:object/:id', async (req, res) => {
  try {
    const { object, id } = req.params;
    const { token, instance } = req.query;
    await axios.delete(
      `${instance}/services/data/v58.0/sobjects/${object}/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Backend running on http://localhost:${process.env.PORT}`);
});