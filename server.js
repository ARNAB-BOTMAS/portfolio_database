const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json()); // This is essential
const port = 3000;
app.use(express.static("public"));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get('/create', async (req, res) => {
  // Profile Detail Table (replaces Personal_Image)
  const createProfileDetailTable = `
    CREATE TABLE IF NOT EXISTS Profile_Detail (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      profile_picture TEXT,
      about_me TEXT,
      position VARCHAR(255),
      email VARCHAR(255),
      address TEXT,
      resume_link TEXT,
      about_me_picture TEXT
    );
  `;

  // Skill Table
  const createSkillTable = `
    CREATE TABLE IF NOT EXISTS Skill (
      id SERIAL PRIMARY KEY,
      skill_name VARCHAR(100) NOT NULL,
      skill_logo TEXT
    );
  `;

  // Education Table
  const createEducationTable = `
    CREATE TABLE IF NOT EXISTS Education (
      id SERIAL PRIMARY KEY,
      establishment_name VARCHAR(255) NOT NULL,
      course_name VARCHAR(255),
      start_year INT,
      end_year INT,
      organization_name VARCHAR(255),
      status VARCHAR(100),
      establishment_picture TEXT
    );
  `;

  // Project Table
  const createProjectTable = `
    CREATE TABLE IF NOT EXISTS Project (
      id SERIAL PRIMARY KEY,
      project_title VARCHAR(255) NOT NULL,
      project_description TEXT,
      background TEXT,
      project_link TEXT
    );
  `;

  // Experience Table
  const createExperienceTable = `
    CREATE TABLE IF NOT EXISTS Experience (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      position VARCHAR(100),
      joining_year VARCHAR(100),
      status VARCHAR(100),
      company_logo TEXT
    );
  `;

  try {
    await pool.query(createProfileDetailTable);
    await pool.query(createSkillTable);
    await pool.query(createEducationTable);
    await pool.query(createProjectTable);
    await pool.query(createExperienceTable);

    res.send('✅ Tables created: Profile_Detail, Skill, Education, Project, Experience.');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
    res.status(500).send('Error creating one or more tables.');
  }
});

// POST DATA TO THE DATA BASE
// 🔹 Route: Add Profile
app.post('/add/profile', async (req, res) => {
  const { name, profile_picture, about_me, position, email, address, resume_link, about_me_picture } = req.body;
  try {
    await pool.query(
      `INSERT INTO Profile_Detail (name, profile_picture, about_me, position, email, address, resume_link, about_me_picture)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [name, profile_picture, about_me, position, email, address, resume_link, about_me_picture]
    );
    res.send('✅ Profile added successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to add profile.');
  }
});

// 🔹 Route: Add Skill
app.post('/add/skills', async (req, res) => {
  const { skill_name, skill_logo } = req.body;
  try {
    await pool.query(
      `INSERT INTO Skill (skill_name, skill_logo) VALUES ($1, $2)`,
      [skill_name, skill_logo]
    );
    res.send('✅ Skill added successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to add skill.');
  }
});

// 🔹 Route: Add Education
app.post('/add/education', async (req, res) => {
  const { establishment_name, course_name, start_year, end_year, organization_name, status, establishment_picture } = req.body;
  try {
    await pool.query(
      `INSERT INTO Education (establishment_name, course_name, start_year, end_year, organization_name, status, establishment_picture)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [establishment_name, course_name, start_year, end_year, organization_name, status, establishment_picture]
    );
    res.send('✅ Education added successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to add education.');
  }
});

// 🔹 Route: Add Project
app.post('/add/projects', async (req, res) => {
  const { project_title, project_description, background, project_link } = req.body;
  try {
    await pool.query(
      `INSERT INTO Project (project_title, project_description, background, project_link)
       VALUES ($1, $2, $3, $4)`,
      [project_title, project_description, background, project_link]
    );
    res.send('✅ Project added successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to add project.');
  }
});

// 🔹 Route: Add Experience
app.post('/add/experience', async (req, res) => {
  const { company_name, position, joining_year, status, company_logo } = req.body;
  try {
    await pool.query(
        `INSERT INTO Experience (company_name, position, joining_year, status, company_logo)
        VALUES ($1, $2, $3, $4, $5)`,
        [company_name, position, joining_year, status, company_logo]
    );
    res.send('✅ Experience added successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to add experience.');
  }
});

// GET DATA FROM DATE BASE
// 🔹 Get all profile details
app.get('/profile', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Profile_Detail');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to fetch profile.');
  }
});

// 🔹 Get all skills
app.get('/skills', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Skill');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to fetch skills.');
  }
});

// 🔹 Get all education entries
app.get('/education', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Education');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to fetch education.');
  }
});

// 🔹 Get all projects
app.get('/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Project');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to fetch projects.');
  }
});

// 🔹 Get all experience entries
app.get('/experience', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Experience');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to fetch experience.');
  }
});

// Delete Profile
app.delete('/delete/profile/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM Profile_Detail WHERE id = $1', [req.params.id]);
    res.send('🗑️ Profile deleted.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to delete profile.');
  }
});

// Delete Skill
app.delete('/delete/skills/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Skill WHERE id = $1', [req.params.id]);
    res.send('🗑️ Skill deleted.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to delete skill.');
  }
});

// Delete Education
app.delete('/delete/education/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Education WHERE id = $1', [req.params.id]);
    res.send('🗑️ Education deleted.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to delete education.');
  }
});

// Delete Project
app.delete('/delete/project/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Project WHERE id = $1', [req.params.id]);
    res.send('🗑️ Project deleted.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to delete project.');
  }
});

// Delete Experience
app.delete('/delete/experience/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Experience WHERE id = $1', [req.params.id]);
    res.send('🗑️ Experience deleted.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to delete experience.');
  }
});

// Update Profile
app.put('/edit/profile/:id', async (req, res) => {
  const { name, profile_picture, about_me, position, email, address, resume_link, about_me_picture } = req.body;
  try {
    await pool.query(
      `UPDATE Profile_Detail SET 
        name=$1, profile_picture=$2, about_me=$3, position=$4, email=$5, address=$6, resume_link=$7, about_me_picture=$8 
       WHERE id=$9`,
      [name, profile_picture, about_me, position, email, address, resume_link, about_me_picture, req.params.id]
    );
    res.send('✏️ Profile updated.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to update profile.');
  }
});

// Update Skill
app.put('/edit/skills/:id', async (req, res) => {
  const { skill_name, skill_logo } = req.body;
  try {
    await pool.query(
      `UPDATE Skill SET skill_name=$1, skill_logo=$2 WHERE id=$3`,
      [skill_name, skill_logo, req.params.id]
    );
    res.send('✏️ Skill updated.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to update skill.');
  }
});

// Update Education
app.put('/edit/education/:id', async (req, res) => {
  const { establishment_name, course_name, start_year, end_year, organization_name, status, establishment_picture } = req.body;
  try {
    await pool.query(
      `UPDATE Education SET 
        establishment_name=$1, course_name=$2, start_year=$3, end_year=$4,
        organization_name=$5, status=$6, establishment_picture=$7
       WHERE id=$8`,
      [establishment_name, course_name, start_year, end_year, organization_name, status, establishment_picture, req.params.id]
    );
    res.send('✏️ Education updated.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to update education.');
  }
});

// Update Project
app.put('/edit/project/:id', async (req, res) => {
  const { project_title, project_description, background, project_link } = req.body;
  try {
    await pool.query(
      `UPDATE Project SET 
        project_title=$1, project_description=$2, background=$3, project_link=$4 
       WHERE id=$5`,
      [project_title, project_description, background, project_link, req.params.id]
    );
    res.send('✏️ Project updated.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to update project.');
  }
});

// Update Experience
app.put('/edit/experience/:id', async (req, res) => {
  const { company_name, position, joining_year, status, company_logo } = req.body;
  try {
    await pool.query(
      `UPDATE Experience SET 
        company_name=$1, position=$2, joining_year=$3, status=$4, company_logo=$5 
       WHERE id=$6`,
      [company_name, position, joining_year, status, company_logo, req.params.id]
    );
    res.send('✏️ Experience updated.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to update experience.');
  }
});



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
