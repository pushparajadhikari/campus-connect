require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./database');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');

    // Categories
    await client.query(`
      INSERT INTO categories (slug, name, description, icon) VALUES
        ('lost-and-found', 'Lost & Found', 'Report lost items or claim found items on campus', 'search'),
        ('books', 'Books & Study Material', 'Buy and sell used textbooks and study materials', 'book'),
        ('notes', 'Notes & Resources', 'Share and download class notes and study resources', 'file-text'),
        ('events', 'Events', 'Discover and create campus events', 'calendar'),
        ('study-groups', 'Study Groups', 'Form and join study groups for collaborative learning', 'users'),
        ('general', 'General', 'General campus announcements and discussions', 'message-circle')
      ON CONFLICT (slug) DO NOTHING;
    `);

    // Admin user
    const adminHash = await bcrypt.hash('Admin@123', 12);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, department, bio, year_of_study)
      VALUES ('Admin User', 'admin@campus.edu', $1, 'admin', 'Administration', 'Campus Connect administrator', NULL)
      ON CONFLICT (email) DO NOTHING;
    `, [adminHash]);

    // Student users
    const studentHash = await bcrypt.hash('Student@123', 12);
    const students = [
      { name: 'Alex Johnson', email: 'alex@campus.edu', dept: 'Computer Science', year: 3, bio: 'CS student passionate about web dev' },
      { name: 'Maria Garcia', email: 'maria@campus.edu', dept: 'Mathematics', year: 2, bio: 'Math major, love study groups' },
      { name: 'James Chen', email: 'james@campus.edu', dept: 'Physics', year: 4, bio: 'Final year physics student' },
      { name: 'Sarah Williams', email: 'sarah@campus.edu', dept: 'Engineering', year: 1, bio: 'First year, excited to connect!' },
    ];

    const userIds = [];
    for (const s of students) {
      const res = await client.query(`
        INSERT INTO users (name, email, password_hash, department, bio, year_of_study, student_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id;
      `, [s.name, s.email, studentHash, s.dept, s.bio, s.year, `STU${Math.floor(10000 + Math.random() * 90000)}`]);
      userIds.push(res.rows[0].id);
    }

    const catRes = await client.query('SELECT id, slug FROM categories');
    const cats = {};
    catRes.rows.forEach(r => cats[r.slug] = r.id);

    // Sample posts
    const posts = [
      { uid: userIds[0], cat: cats['lost-and-found'], title: 'Lost: Blue HP Laptop Bag', desc: 'Lost my blue HP laptop bag near the library on Monday. Has my laptop and notes inside. Please contact if found!', loc: 'Main Library', meta: { item_color: 'blue', item_type: 'bag' } },
      { uid: userIds[1], cat: cats['lost-and-found'], title: 'Found: Student ID Card', desc: 'Found a student ID card near the cafeteria. Please contact to claim.', loc: 'Cafeteria', meta: {} },
      { uid: userIds[0], cat: cats['books'], title: 'Data Structures & Algorithms - 3rd Ed', desc: 'Selling my DSA textbook. Good condition, minor highlights. Great for CS students!', price: 25.00, loc: 'Campus', meta: { author: 'Thomas Cormen', edition: '3rd', subject: 'CS' } },
      { uid: userIds[2], cat: cats['books'], title: 'Calculus: Early Transcendentals 8th Ed', desc: 'Barely used Calculus textbook. Includes solutions manual.', price: 35.00, loc: 'Science Block', meta: { author: 'James Stewart', edition: '8th', subject: 'Math' } },
      { uid: userIds[1], cat: cats['notes'], title: 'Linear Algebra Complete Notes - Semester 3', desc: 'Comprehensive notes for Linear Algebra covering all topics. PDF format, 120 pages.', loc: 'Online', meta: { subject: 'Mathematics', semester: 3 } },
      { uid: userIds[0], cat: cats['notes'], title: 'Python Programming Notes with Examples', desc: 'Detailed Python notes from CS101. Includes code examples and exercises.', loc: 'Online', meta: { subject: 'Computer Science', semester: 1 } },
      { uid: userIds[3], cat: cats['events'], title: 'Tech Fest 2024 - Annual Tech Exhibition', desc: 'Join us for the annual Tech Fest! Project exhibitions, hackathon, and workshops. Registration open now!', loc: 'Engineering Block', meta: { event_date: '2024-12-15', is_online: false, organizer: 'CS Department' } },
      { uid: userIds[1], cat: cats['events'], title: 'Mathematics Olympiad 2024', desc: 'Participate in the campus Mathematics Olympiad. Prizes worth $500!', loc: 'Main Auditorium', meta: { event_date: '2024-11-20', organizer: 'Math Club' } },
      { uid: userIds[0], cat: cats['study-groups'], title: 'Data Structures Study Group - Final Exam Prep', desc: 'Forming a study group for DS final exam. Will meet twice a week. Join if interested!', loc: 'Library Room 204', meta: { subject: 'Data Structures', max_members: 8 } },
      { uid: userIds[2], cat: cats['study-groups'], title: 'Physics Lab Report Help Group', desc: 'Group for Physics lab students. Help each other with lab reports and concepts.', loc: 'Science Lab', meta: { subject: 'Physics', max_members: 6 } },
    ];

    for (const p of posts) {
      await client.query(`
        INSERT INTO posts (user_id, category_id, title, description, price, location, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [p.uid, p.cat, p.title, p.desc, p.price || null, p.loc, JSON.stringify(p.meta)]);
    }

    console.log('Seed completed successfully!');
    console.log('\nDemo Accounts:');
    console.log('  Admin:   admin@campus.edu  / Admin@123');
    console.log('  Student: alex@campus.edu   / Student@123');
    console.log('  Student: maria@campus.edu  / Student@123');

  } catch (err) {
    console.error('Seed failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
