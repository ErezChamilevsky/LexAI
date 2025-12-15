const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_secret_key';

// --- MOCK GOOGLE AUTH LIBRARY ---
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
const app = require('../backend/server');
const User = require('../backend/models/user.model');
const Chat = require('../backend/models/chat.model');
const Test = require('../backend/models/test.model');

let mongoServer;

process.env.JWT_SECRET = 'test_secret_key';

// --- HELPER: Generate Token ---
// CHANGED: Removed isPremium param. The backend checks the DB date, not the token claim.
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

describe('Integrated User Stories (with JWT & Google Auth)', () => {

    // ------------------------------------------------------------------------
    // FLOW 1: User Lifecycle (Login via Google & Fetch Profile)
    // ------------------------------------------------------------------------
    describe('Flow 1: User Lifecycle', () => {
        it('should login via Google (Mocked) and fetch profile', async () => {
            const loginRes = await request(app)
                .post('/auth/google')
                .send({ token: "fake_google_token" });

            expect(loginRes.status).toBe(200);
            expect(loginRes.body.token).toBeDefined();
            expect(loginRes.body.user.email).toBe("mocked@example.com");

            const authToken = loginRes.body.token;
            const userId = loginRes.body.user._id;

            const getRes = await request(app)
                .get(`/api/users/mocked@example.com`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(getRes.status).toBe(200);
            expect(getRes.body._id).toBe(userId);
            expect(getRes.body.languages).toHaveLength(0);
        });
    });

    // ------------------------------------------------------------------------
    // FLOW 2: Language Limits (Standard vs Premium)
    // ------------------------------------------------------------------------
    describe('Flow 2: Language Limits', () => {
        let userId;
        let token;

        beforeEach(async () => {
            const user = new User({ name: "Jane", email: "jane@test.com" });
            await user.save();
            userId = user._id;
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

            // 3. Upgrade to Premium (Logic Update)
            // CHANGED: We now set a date in the future instead of a boolean flag
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 1); // Add 1 month

            await User.findByIdAndUpdate(userId, { premium_expires_at: futureDate });

            // 4. Add 2nd Language (Success - Premium Limit is 3)
            await request(app)
                .post(`/api/users/${userId}/languages`)
                .set('Authorization', `Bearer ${token}`)
                .send({ language_code: "fr", overall_level: "A1" })
                .expect(200);

            // Verify both languages exist
            const userCheck = await User.findById(userId);
            expect(userCheck.languages).toHaveLength(2);
        });
    });

    // ------------------------------------------------------------------------
    // FLOW 3: Chat Logic & Limits
    // ------------------------------------------------------------------------
    describe('Flow 3: Chat Logic & Limits', () => {
        let userId;
        let token;
        const langCode = 'en';

        beforeEach(async () => {
            const user = new User({ name: "Chatter", email: "chat@test.com" });
            user.languages.push({ language_code: langCode });
            await user.save();
            userId = user._id;
            token = generateToken(userId, "chat@test.com");
        });

        it('should enforce max 3 chats and store them nested', async () => {
            // 1. Create 3 Chats (Success)
            for (let i = 1; i <= 3; i++) {
                const res = await request(app)
                    .post('/api/chats')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        languageCode: langCode, message: "Hello", topic: `Topic ${i}`
                    });
                expect(res.status).toBe(201);
            }

            // 2. Create 4th Chat (Fail)
            const failRes = await request(app)
                .post('/api/chats')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    languageCode: langCode, message: "Overflow", topic: "Too Many"
                });
            expect(failRes.status).toBe(400);
            expect(failRes.body.message).toMatch(/limit/i);

            // 3. Verify Continue Chat (Get Chat By ID)
            const userInDb = await User.findById(userId);
            // Accessing nested chat ID depends on your exact schema structure logic
            // Assuming standard push behavior
            const chatId = userInDb.languages[0].chats[0];

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
            const user = new User({ name: "Student", email: "student@test.com" });
            user.languages.push({ language_code: langCode });
            await user.save();
            userId = user._id;
            token = generateToken(userId, "student@test.com");
        });

        it('should automatically update user skill level when graded', async () => {
            // 1. Create Writing Test
            const testRes = await request(app)
                .post('/api/tests/writing')
                .set('Authorization', `Bearer ${token}`)
                .send({ languageCode: langCode });

            expect(testRes.status).toBe(201);
            const testId = testRes.body._id;

            // 2. Grade the Test
            await request(app)
                .put(`/api/tests/${testId}/grade`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    score: 85, level: "B2", details: { feedback: "Excellent" }
                });

            // 3. Check User Level
            const userStep2 = await User.findById(userId);
            const langStep2 = userStep2.languages.find(l => l.language_code === langCode);
            expect(langStep2.skills.writing).toBe("B2");
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
            const user = new User({ name: "DeleteMe", email });
            user.languages.push({ language_code: 'it' });
            await user.save();
            userId = user._id;
            token = generateToken(userId, email);
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
            expect(dashRes.body.languages[0].corrections[0]).toBe(false);
        });

        it('should delete user', async () => {
            // 1. Delete User
            await request(app)
                .delete(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            // 2. Verify in DB
            const dbCheck = await User.findById(userId);
            expect(dbCheck).toBeNull();
        });
    });

    // ------------------------------------------------------------------------
    // FLOW 6: Security & Authorization Attacks
    // ------------------------------------------------------------------------
    describe('Flow 6: Security & Authorization Attacks', () => {
        let attackerId, attackerToken;
        let victimId, victimToken;

        beforeEach(async () => {
            // 1. Create Victim
            const victim = new User({ name: "Victim", email: "victim@test.com" });
            victim.languages.push({ language_code: 'fr' });
            await victim.save();
            victimId = victim._id;
            victimToken = generateToken(victimId, "victim@test.com");

            // 2. Create Attacker
            const attacker = new User({ name: "Attacker", email: "hacker@test.com" });
            await attacker.save();
            attackerId = attacker._id;
            attackerToken = generateToken(attackerId, "hacker@test.com");
        });

        // --- ATTACK 1 ---
        it('should block User A from deleting User B', async () => {
            const res = await request(app)
                .delete(`/api/users/${victimId}`)
                .set('Authorization', `Bearer ${attackerToken}`);

            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/access denied|unauthorized/i);

            const victimCheck = await User.findById(victimId);
            expect(victimCheck).not.toBeNull();
        });

        // --- ATTACK 2 ---
        it('should block User A from viewing User B profile', async () => {
            const res = await request(app)
                .get(`/api/users/victim@test.com`)
                .set('Authorization', `Bearer ${attackerToken}`);

            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/access denied/i);
        });

        // --- ATTACK 3 ---
        it('should block User A from adding a language to User B', async () => {
            const res = await request(app)
                .post(`/api/users/${victimId}/languages`)
                .set('Authorization', `Bearer ${attackerToken}`)
                .send({ language_code: 'es', overall_level: 'A1' });

            expect(res.status).toBe(403);

            const victimCheck = await User.findById(victimId);
            expect(victimCheck.languages).toHaveLength(1);
        });

        // --- ATTACK 4: SELF-PROMOTION TO PREMIUM (Using another ID) ---
        it('should block User A from upgrading User B to Premium', async () => {
            const res = await request(app)
                .put(`/api/users/${victimId}/premium`)
                .set('Authorization', `Bearer ${attackerToken}`)
                // CHANGED: Sending months instead of is_premium
                .send({ months: 12 });

            expect(res.status).toBe(403);

            const victimCheck = await User.findById(victimId);
            // CHANGED: Checking that the date is still null (or expired/past)
            expect(victimCheck.premium_expires_at).toBeNull();
        });

        // --- ATTACK 5 ---
        it('should block User A from reading User B chats', async () => {
            const chat = new Chat({
                user_id: victimId,
                language_code: 'fr',
                topic: 'Secret Plans',
                messages: []
            });
            await chat.save();
            const chatId = chat._id;

            const res = await request(app)
                .get(`/api/chats/${chatId}`)
                .set('Authorization', `Bearer ${attackerToken}`);

            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/unauthorized/i);
        });
    });
});