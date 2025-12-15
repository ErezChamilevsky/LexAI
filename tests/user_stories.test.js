const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

// --- CONFIG ---
process.env.JWT_SECRET = 'test_secret_key';

// --- MOCK GOOGLE AUTH LIBRARY ---
// This prevents the test from actually trying to contact Google servers
jest.mock('google-auth-library', () => {
    return {
        OAuth2Client: jest.fn().mockImplementation(() => {
            return {
                verifyIdToken: jest.fn().mockResolvedValue({
                    getPayload: () => ({
                        email: "mocked@example.com",
                        name: "Mocked User",
                        sub: "google_12345"
                    })
                })
            };
        })
    };
});

// --- IMPORTS ---
const app = require('../backend/server'); // Adjust path if necessary
const User = require('../backend/models/user.model');
const Chat = require('../backend/models/chat.model');
const Test = require('../backend/models/test.model');

let mongoServer;

// --- HELPER: Generate Token ---
// We need this because almost all your routes are now protected by verifyToken
const generateToken = (userId, email) => {
    return jwt.sign(
        { _id: userId, email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// --- SETUP & TEARDOWN ---
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Test.deleteMany({});
});

// ============================================================================
//                              TEST SUITE
// ============================================================================

describe('Integrated User Stories', () => {

    // ------------------------------------------------------------------------
    // FLOW 1: User Lifecycle (Create & Fetch)
    // ------------------------------------------------------------------------
    describe('Flow 1: User Lifecycle', () => {
        it('should create a user and fetch them by Email', async () => {
            // 1. Create User (Public Route)
            const newUser = { name: "John Doe", email: "john@example.com" };
            const createRes = await request(app).post('/api/users').send(newUser);

            expect(createRes.status).toBe(201);
            expect(createRes.body._id).toBeDefined();
            const userId = createRes.body._id;

            // GENERATE TOKEN (Required for the next step)
            const token = generateToken(userId, newUser.email);

            // 2. Fetch User by Email (Secured Route)
            const getRes = await request(app)
                .get(`/api/users/${newUser.email}`)
                .set('Authorization', `Bearer ${token}`); // Added Header

            expect(getRes.status).toBe(200);
            expect(getRes.body._id).toBe(userId);
            expect(getRes.body.email).toBe(newUser.email);
            expect(getRes.body.languages).toHaveLength(0);
        });
    });

    // ------------------------------------------------------------------------
    // FLOW 2: Language Limits (Standard vs Premium)
    // ------------------------------------------------------------------------
    describe('Flow 2: Language Limits (Standard vs Premium)', () => {
        let userId;
        let token;

        beforeEach(async () => {
            // Setup: Create user and token
            const userRes = await request(app).post('/api/users').send({ name: "Jane", email: "jane@test.com" });
            userId = userRes.body._id;
            token = generateToken(userId, "jane@test.com");
        });

        it('should enforce 1 language for standard and 3 for premium', async () => {
            // 1. Add 1st Language (Success)
            await request(app)
                .post(`/api/users/${userId}/languages`)
                .set('Authorization', `Bearer ${token}`)
                .send({ language_code: "es", overall_level: "A1" })
                .expect(200);

            // 2. Add 2nd Language (Fail - Standard Limit is 1)
            const failRes = await request(app)
                .post(`/api/users/${userId}/languages`)
                .set('Authorization', `Bearer ${token}`)
                .send({ language_code: "fr", overall_level: "A1" })
                .expect(400);

            expect(failRes.body.message).toMatch(/limit/i);

            // 3. Upgrade to Premium (Logic Changed: Send 'months', not 'is_premium')
            await request(app)
                .put(`/api/users/${userId}/premium`)
                .set('Authorization', `Bearer ${token}`)
                .send({ months: 12 }) // Buying 1 year
                .expect(200);

            // 4. Add 2nd Language (Success - Premium Limit is 3)
            // The service now checks if date > now, which it should be
            await request(app)
                .post(`/api/users/${userId}/languages`)
                .set('Authorization', `Bearer ${token}`)
                .send({ language_code: "fr", overall_level: "A1" })
                .expect(200);

            // Verify both languages exist
            const userCheck = await User.findById(userId);
            expect(userCheck.languages).toHaveLength(2);
            expect(userCheck.premium_expires_at).not.toBeNull(); // Verify date exists
        });
    });

    // ------------------------------------------------------------------------
    // FLOW 3: Chat Logic & Limits (Nested Storage)
    // ------------------------------------------------------------------------
    describe('Flow 3: Chat Logic & Limits', () => {
        let userId;
        let token;
        const langCode = 'en';

        beforeEach(async () => {
            const userRes = await request(app).post('/api/users').send({ name: "Chatter", email: "chat@test.com" });
            userId = userRes.body._id;
            token = generateToken(userId, "chat@test.com");

            // Add language
            await request(app)
                .post(`/api/users/${userId}/languages`)
                .set('Authorization', `Bearer ${token}`)
                .send({ language_code: langCode });
        });

        it('should enforce max 3 chats and store them nested under UserLanguage', async () => {
            // 1. Create 3 Chats (Success)
            for (let i = 1; i <= 3; i++) {
                const res = await request(app)
                    .post('/api/chats')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        userId, languageCode: langCode, message: "Hello", topic: `Topic ${i}`
                    });
                expect(res.status).toBe(201);
            }

            // 2. Create 4th Chat (Fail)
            const failRes = await request(app)
                .post('/api/chats')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    userId, languageCode: langCode, message: "Overflow", topic: "Too Many"
                });
            expect(failRes.status).toBe(400);
            expect(failRes.body.message).toMatch(/limit/i);

            // 3. VERIFY NESTED STORAGE
            const userInDb = await User.findById(userId);
            const englishLang = userInDb.languages.find(l => l.language_code === langCode);
            expect(englishLang.chats).toHaveLength(3);

            // 4. Verify Continue Chat (Get Chat By ID)
            const chatId = englishLang.chats[0];
            const chatRes = await request(app)
                .get(`/api/chats/${chatId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(chatRes.status).toBe(200);
            expect(chatRes.body.topic).toBe("Topic 1");
        });
    });

    // ------------------------------------------------------------------------
    // FLOW 4: Grading Logic
    // ------------------------------------------------------------------------
    describe('Flow 4: Grading Logic', () => {
        let userId;
        let token;
        const langCode = 'de';

        beforeEach(async () => {
            const userRes = await request(app).post('/api/users').send({ name: "Student", email: "student@test.com" });
            userId = userRes.body._id;
            token = generateToken(userId, "student@test.com");

            await request(app)
                .post(`/api/users/${userId}/languages`)
                .set('Authorization', `Bearer ${token}`)
                .send({ language_code: langCode });
        });

        it('should automatically update user skill level when a test is graded', async () => {
            // 1. Create Writing Test
            const testRes = await request(app)
                .post('/api/tests/writing')
                .set('Authorization', `Bearer ${token}`)
                .send({ userId, languageCode: langCode });

            expect(testRes.status).toBe(201);
            const testId = testRes.body._id;

            // 2. Verify Test is linked to User
            const userStep1 = await User.findById(userId);
            const langStep1 = userStep1.languages.find(l => l.language_code === langCode);
            expect(langStep1.tests).toContainEqual(new mongoose.Types.ObjectId(testId));

            // 3. Grade the Test
            await request(app)
                .put(`/api/tests/${testId}/grade`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    score: 85, level: "B2", details: { feedback: "Excellent" }
                });

            // 4. Check if User Level Updated Automatically
            const userStep2 = await User.findById(userId);
            const langStep2 = userStep2.languages.find(l => l.language_code === langCode);

            expect(langStep2.skills.writing).toBe("B2");
            expect(langStep2.overall_level).toBe("B2");
        });
    });

    // ------------------------------------------------------------------------
    // FLOW 5: Deletion & Dashboard
    // ------------------------------------------------------------------------
    describe('Flow 5: Deletion & Dashboard', () => {
        let userId;
        let token;
        const email = "delete@test.com";

        beforeEach(async () => {
            const userRes = await request(app).post('/api/users').send({ name: "DeleteMe", email });
            userId = userRes.body._id;
            token = generateToken(userId, email);

            await request(app)
                .post(`/api/users/${userId}/languages`)
                .set('Authorization', `Bearer ${token}`)
                .send({ language_code: 'it' });
        });

        it('should toggle corrections and return a populated dashboard', async () => {
            // 1. Toggle Corrections
            await request(app)
                .put(`/api/users/${userId}/languages/corrections`)
                .set('Authorization', `Bearer ${token}`)
                .send({ languageCode: 'it', status: false });

            // 2. Get Dashboard
            const dashRes = await request(app)
                .get(`/api/users/${email}`)
                .set('Authorization', `Bearer ${token}`);

            expect(dashRes.status).toBe(200);

            const lang = dashRes.body.languages[0];
            expect(lang.corrections[0]).toBe(false);
            expect(lang.language_code).toBe('it');
        });

        it('should delete user and return 404 on fetch', async () => {
            // 1. Delete User
            await request(app)
                .delete(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            // 2. Try to Fetch by Email - Should be 404
            await request(app)
                .get(`/api/users/${email}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);

            // 3. Verify in DB
            const dbCheck = await User.findById(userId);
            expect(dbCheck).toBeNull();
        });
    });

});