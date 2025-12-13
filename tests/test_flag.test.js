const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

// --- CRITICAL FIX: Set Secret BEFORE requiring the app ---
// This ensures the auth middleware picks up this specific secret
process.env.JWT_SECRET = 'test_secret_key';

// --- MOCK GOOGLE AUTH ---
jest.mock('google-auth-library', () => {
    return {
        OAuth2Client: jest.fn().mockImplementation(() => {
            return {
                verifyIdToken: jest.fn().mockResolvedValue({
                    getPayload: () => ({ email: "mocked@example.com", name: "Mocked User", sub: "google_12345" })
                })
            };
        })
    };
});

// --- IMPORT APP & MODELS (After setting env vars) ---
const app = require('../backend/server');
const User = require('../backend/models/user.model');
const Test = require('../backend/models/test.model');

let mongoServer;

// --- HELPER: Generate Token ---
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
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
    await Test.deleteMany({});
});

// ============================================================================
//                         TEST FLAG LOGIC SUITE
// ============================================================================

describe('Test Flag Logic (Single Active Test Constraint)', () => {
    let userId;
    let token;
    const langCode = 'es';

    beforeEach(async () => {
        // Setup: Create a clean user for every test
        const user = new User({
            name: "Test User",
            email: "flagtest@test.com",
            languages: [{ language_code: langCode, overall_level: 'A1' }]
        });
        await user.save();
        userId = user._id;
        token = generateToken(userId, "flagtest@test.com");
    });

    it('should LOCK the user upon starting a test and BLOCK a second attempt', async () => {
        // ---------------------------------------------------------
        // 1. Start First Test (Should Succeed)
        // ---------------------------------------------------------
        const res1 = await request(app)
            .post('/api/tests/writing')
            .set('Authorization', `Bearer ${token}`)
            .send({ languageCode: langCode });

        // If this fails with 403 again, double check your JWT_SECRET in .env matches what is here
        expect(res1.status).toBe(201);
        const testId1 = res1.body._id;

        // VERIFY DB: User should be locked
        const userLocked = await User.findById(userId);
        expect(userLocked.is_taking_test).toBe(true);

        // ---------------------------------------------------------
        // 2. Attempt Start Second Test (Should Fail)
        // ---------------------------------------------------------
        const res2 = await request(app)
            .post('/api/tests/reading')
            .set('Authorization', `Bearer ${token}`)
            .send({ languageCode: langCode });

        // We expect failure (500 or 409 depending on your error handler)
        // The message should mention the restriction
        expect(res2.status).not.toBe(201);
        // Optional: Check specific error message if your controller passes it through
        // expect(res2.body.message).toMatch(/already taking a test/i);

        // ---------------------------------------------------------
        // 3. Finish/Grade First Test (Should Unlock)
        // ---------------------------------------------------------
        const gradeRes = await request(app)
            .put(`/api/tests/${testId1}/grade`)
            .set('Authorization', `Bearer ${token}`)
            .send({ score: 90, level: "B1", details: { feedback: "Good" } });

        expect(gradeRes.status).toBe(200);

        // VERIFY DB: User should be unlocked
        const userUnlocked = await User.findById(userId);
        expect(userUnlocked.is_taking_test).toBe(false);

        // ---------------------------------------------------------
        // 4. Start New Test (Should Succeed now)
        // ---------------------------------------------------------
        const res3 = await request(app)
            .post('/api/tests/speaking')
            .set('Authorization', `Bearer ${token}`)
            .send({ languageCode: langCode });

        expect(res3.status).toBe(201);

        // Verify Locked Again
        const userRelocked = await User.findById(userId);
        expect(userRelocked.is_taking_test).toBe(true);
    });
});