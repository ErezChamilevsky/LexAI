const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

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
const app = require('../backend/server');
const User = require('../backend/models/user.model');
const Chat = require('../backend/models/chat.model');
const Test = require('../backend/models/test.model');

let mongoServer;

// Use a consistent secret for testing
process.env.JWT_SECRET = 'test_secret_key';

// --- HELPER: Generate Token ---
// Since we are creating users directly in DB for setup, we need a way to mint tokens for them
const generateToken = (userId, email, isPremium = false) => {
    return jwt.sign(
        { _id: userId, email, is_premium: isPremium },
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
            // 1. Login with "Google" (Simulated)
            // The controller calls AuthService.loginWithGoogle, which calls our Mock
            const loginRes = await request(app)
                .post('/auth/google') // CHANGED: Now uses Auth route
                .send({ token: "fake_google_token" });

            expect(loginRes.status).toBe(200);
            expect(loginRes.body.token).toBeDefined();
            expect(loginRes.body.user.email).toBe("mocked@example.com");

            const authToken = loginRes.body.token;
            const userId = loginRes.body.user._id;

            // 2. Fetch User by Email (Protected Route)
            // We must attach the token we just got
            const getRes = await request(app)
                .get(`/api/users/mocked@example.com`)
                .set('Authorization', `Bearer ${authToken}`); // ADDED HEADER

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
            // Setup: Create User directly in DB to save time
            const user = new User({ name: "Jane", email: "jane@test.com" });
            await user.save();
            userId = user._id;

            // Generate valid JWT for this user
            token = generateToken(userId, "jane@test.com");
        });

        it('should enforce 1 language for standard and 3 for premium', async () => {
            // 1. Add 1st Language (Success)
            await request(app)
                .post(`/api/users/${userId}/languages`)
                .set('Authorization', `Bearer ${token}`) // ADDED HEADER
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
            // We update the DB directly, OR use the endpoint. 
            // NOTE: If we use the endpoint, we need a new token if the token stores "is_premium".
            // However, your middleware likely checks DB or the current token.
            // Let's update DB and regenerate token to be safe if you store premium status in JWT.
            await User.findByIdAndUpdate(userId, { is_premium: true });
            const premiumToken = generateToken(userId, "jane@test.com", true);

            // 4. Add 2nd Language (Success - Premium Limit is 3)
            await request(app)
                .post(`/api/users/${userId}/languages`)
                .set('Authorization', `Bearer ${premiumToken}`) // Use Premium Token
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
            // Add language directly
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
                        // Removed userId from body, controller now takes it from token
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
            const chatId = userInDb.languages[0].chats[0];

            const chatRes = await request(app)
                .get(`/api/chats/${chatId}`)
                .set('Authorization', `Bearer ${token}`); // Must be authorized owner

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
            // NOTE: If grading is an ADMIN action, you might need an Admin Token.
            // Assuming for now regular users or a system trigger does this.
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
                .set('Authorization', `Bearer ${token}`); // Protected

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
});