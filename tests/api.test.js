const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../backend/server'); // Adjust path to where your express app is exported
const User = require('../backend/models/user.model');
const Chat = require('../backend/models/chat.model');
const Test = require('../backend/models/test.model');

let mongoServer;

// --- SETUP & TEARDOWN ---

// Before all tests: Spin up the in-memory database
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

// After all tests: Close database connection and stop the server
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// After each test: Clear the database so tests don't interfere with each other
afterEach(async () => {
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Test.deleteMany({});
});

// --- TEST SUITE ---

describe('Language Learning Platform API', () => {

    /* * TEST FLOW 1: User Lifecycle
     * 1. Create a new user.
     * 2. Verify the creation response.
     * 3. Fetch that user by ID to ensure they are saved in the DB.
     */
    test('POST /api/users & GET /api/users/:id - Create and Fetch User', async () => {
        // 1. Create User
        const newUser = {
            name: "John Doe",
            email: "john@example.com"
        };

        const createRes = await request(app)
            .post('/api/users')
            .send(newUser)
            .expect(201); // Expect HTTP 201 Created

        // Check if ID is returned
        const userId = createRes.body._id;
        expect(userId).toBeDefined();
        expect(createRes.body.name).toBe(newUser.name);

        // 2. Get User By ID
        const getRes = await request(app)
            .get(`/api/users/${userId}`)
            .expect(200); // Expect HTTP 200 OK

        // Verify the fetched data matches created data
        expect(getRes.body.email).toBe(newUser.email);
        expect(getRes.body.is_premium).toBe(false); // Default should be false
    });

    /* * TEST FLOW 2: Language Limits (Premium vs Standard)
     * 1. Create a standard user.
     * 2. Add 1st language (Success).
     * 3. Add 2nd language (Fail - limit is 1).
     * 4. Upgrade user to Premium.
     * 5. Add 2nd language (Success - limit is 3).
     */
    test('Language Limits: Standard vs Premium Users', async () => {
        // Setup: Create user
        const userRes = await request(app).post('/api/users').send({ name: "Jane", email: "jane@test.com" });
        const userId = userRes.body._id;

        // 1. Add First Language (Spanish)
        await request(app)
            .post(`/api/users/${userId}/languages`)
            .send({ language_code: "es" })
            .expect(200);

        // 2. Attempt Second Language (French) - Should Fail for Standard User
        const failRes = await request(app)
            .post(`/api/users/${userId}/languages`)
            .send({ language_code: "fr" })
            .expect(400); // Expect Error

        expect(failRes.body.message).toMatch(/limit/i); // Check error message

        // 3. Upgrade to Premium
        await request(app)
            .put(`/api/users/${userId}/premium`)
            .send({ is_premium: true })
            .expect(200);

        // 4. Attempt Second Language (French) Again - Should Pass
        await request(app)
            .post(`/api/users/${userId}/languages`)
            .send({ language_code: "fr" })
            .expect(200);

        // Verify user now has 2 languages
        const updatedUser = await request(app).get(`/api/users/${userId}`);
        expect(updatedUser.body.languages).toHaveLength(2);
    });

    /* * TEST FLOW 3: Chat Logic & Limits
     * 1. Create a user and add a language.
     * 2. Create 3 chats (Max allowed).
     * 3. Try to create a 4th chat (Should Fail).
     * 4. Verify the chats are linked to the user.
     */
    test('POST /api/chats - Enforce Max 3 Chats Per Language', async () => {
        // Setup: Create user and add English
        const userRes = await request(app).post('/api/users').send({ name: "Chatter", email: "chat@test.com" });
        const userId = userRes.body._id;
        await request(app).post(`/api/users/${userId}/languages`).send({ language_code: "en" });

        // 1. Create 3 Chats
        for (let i = 1; i <= 3; i++) {
            await request(app)
                .post('/api/chats')
                .send({
                    userId: userId,
                    languageCode: "en",
                    message: "Hello",
                    topic: `Topic ${i}`
                })
                .expect(201);
        }

        // 2. Create 4th Chat - Should Fail
        const failRes = await request(app)
            .post('/api/chats')
            .send({
                userId: userId,
                languageCode: "en",
                message: "This should fail",
                topic: "Overflow"
            })
            .expect(400);

        expect(failRes.body.message).toMatch(/limit/i);

        // 3. Verify User has exactly 3 chat references
        const finalUser = await request(app).get(`/api/users/${userId}`);
        expect(finalUser.body.chats).toHaveLength(3);
    });

    /* * TEST FLOW 4: Grading Logic
     * 1. Create a user and a language.
     * 2. Create a 'Writing' test.
     * 3. Grade the test with score 85 and level 'B2'.
     * 4. Check if the User's writing skill was automatically updated to 'B2'.
     */
    test('PUT /api/tests/:id/grade - Grading updates User Level', async () => {
        // Setup: Create user and add German
        const userRes = await request(app).post('/api/users').send({ name: "Student", email: "student@test.com" });
        const userId = userRes.body._id;
        await request(app).post(`/api/users/${userId}/languages`).send({ language_code: "de" });

        // 1. Create Writing Test
        const testRes = await request(app)
            .post('/api/tests/writing')
            .send({ userId: userId, languageCode: "de" })
            .expect(201);

        const testId = testRes.body._id;

        // 2. Grade the Test
        await request(app)
            .put(`/api/tests/${testId}/grade`)
            .send({
                score: 85,
                level: "B2",
                details: { feedback: "Great grammar!" }
            })
            .expect(200);

        // 3. Verify User Profile Updated
        const updatedUser = await request(app).get(`/api/users/${userId}`);

        // Find the German language object in the user's array
        const germanLang = updatedUser.body.languages.find(l => l.language_code === 'de');

        // Assertions
        expect(germanLang).toBeDefined();
        expect(germanLang.skills.writing).toBe("B2"); // Specific skill updated
        // Note: Our service also updates 'overall_level' in the logic provided previously
        expect(germanLang.overall_level).toBe("B2");
    });

    /* * TEST FLOW 5: Deletion Cascade (Cleanup)
     * 1. Create user, chat, and test.
     * 2. Delete the user.
     * 3. Ensure the User is gone.
     * 4. (Optional) Verify Chats/Tests are cleaned up if you implemented cascading delete.
     */
    test('DELETE /api/users/:id - Delete User', async () => {
        // Setup
        const userRes = await request(app).post('/api/users').send({ name: "DeleteMe", email: "del@test.com" });
        const userId = userRes.body._id;

        // Delete
        await request(app).delete(`/api/users/${userId}`).expect(200);

        // Verify Gone
        await request(app).get(`/api/users/${userId}`).expect(404);
    });

});